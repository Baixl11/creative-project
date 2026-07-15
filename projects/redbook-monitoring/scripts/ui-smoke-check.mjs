import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

import { chromium } from "playwright";

const rootDir = path.resolve(import.meta.dirname, "..");
const dataDir = await mkdtemp(path.join(os.tmpdir(), "redbook-monitor-ui-"));

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForHealth(baseUrl, childOutput) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return response;
      }
    } catch (_error) {
      // The service may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error(`本地测试服务启动超时：${childOutput.join("")}`);
}

const port = await availablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const childOutput = [];
const server = spawn(process.execPath, ["src/server.js"], {
  cwd: rootDir,
  env: {
    ...process.env,
    DATA_DIR: dataDir,
    PORT: String(port),
    HOST: "127.0.0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (chunk) => childOutput.push(chunk.toString()));
server.stderr.on("data", (chunk) => childOutput.push(chunk.toString()));

let browser;
try {
  const healthResponse = await waitForHealth(baseUrl, childOutput);
  assert.equal(healthResponse.headers.get("x-powered-by"), null);
  assert.equal(healthResponse.headers.get("x-content-type-options"), "nosniff");
  assert.match(healthResponse.headers.get("content-security-policy") || "", /default-src 'self'/);
  assert.deepEqual(await healthResponse.json(), { ok: true, database: "connected", storage: "sqlite" });

  browser = await chromium.launch({ headless: true });
  const pages = ["/", "/notes.html", "/trends.html", "/tasks.html", "/settings.html"];
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const pagePath of pages) {
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: "networkidle" });
      await page.locator("main.main").waitFor();

      const audit = await page.evaluate(() => {
        const controls = Array.from(document.querySelectorAll("input:not([type='hidden']), select, textarea"));
        const unlabeledControls = controls.filter((control) => {
          const labelledBy = control.getAttribute("aria-labelledby");
          const explicitLabel = control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`);
          return !control.getAttribute("aria-label")
            && !labelledBy
            && !explicitLabel
            && !control.closest("label");
        });
        const scopes = Array.from(document.querySelectorAll(".scope-chip"));
        const viewportWidth = document.documentElement.clientWidth;
        const overflowElements = Array.from(document.body.querySelectorAll("*"))
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.right > viewportWidth + 1 || rect.left < -1;
          })
          .slice(0, 8)
          .map((element) => `${element.tagName.toLowerCase()}.${Array.from(element.classList).join(".")}`);
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overflowElements,
          unlabeledControls: unlabeledControls.length,
          activeNavCount: document.querySelectorAll('.nav-item[aria-current="page"]').length,
          invalidScopeState: scopes.filter((scope) => !["true", "false"].includes(scope.getAttribute("aria-pressed"))).length,
        };
      });

      assert.ok(
        audit.overflow <= 1,
        `${viewport.name} ${pagePath} 存在页面级横向溢出 ${audit.overflow}px：${audit.overflowElements.join(", ")}`,
      );
      assert.equal(audit.unlabeledControls, 0, `${viewport.name} ${pagePath} 存在无标签表单控件`);
      assert.equal(audit.activeNavCount, 1, `${viewport.name} ${pagePath} 当前导航语义异常`);
      assert.equal(audit.invalidScopeState, 0, `${viewport.name} ${pagePath} 账号筛选缺少 aria-pressed`);
      assert.deepEqual(runtimeErrors, [], `${viewport.name} ${pagePath} 出现运行时错误`);

      if (pagePath === "/trends.html") {
        const followerChartLayout = await page.locator("[data-trend-followers-chart]").evaluate((chart) => {
          const pane = document.createElement("div");
          const legend = document.createElement("p");
          pane.className = "bar-chart-scroll-pane";
          legend.className = "bar-chart-legend";
          legend.textContent = "06-14 至 07-12 · 净增长 +2";
          chart.replaceChildren(pane, legend);

          const chartStyle = getComputedStyle(chart);
          const paneStyle = getComputedStyle(pane);
          const paneRect = pane.getBoundingClientRect();
          const legendRect = legend.getBoundingClientRect();
          return {
            chartBackground: chartStyle.backgroundImage,
            chartBorder: chartStyle.borderTopWidth,
            paneBorder: paneStyle.borderTopWidth,
            legendBelowCanvas: legendRect.top >= paneRect.bottom,
          };
        });
        assert.equal(followerChartLayout.chartBackground, "none", `${viewport.name} 柱状图摘要仍共享画布背景`);
        assert.equal(followerChartLayout.chartBorder, "0px", `${viewport.name} 柱状图外层仍带画布边框`);
        assert.equal(followerChartLayout.paneBorder, "1px", `${viewport.name} 柱状图画布缺少独立边框`);
        assert.equal(followerChartLayout.legendBelowCanvas, true, `${viewport.name} 柱状图摘要未位于画布下方`);
      }
      await page.close();
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const notesPage = await context.newPage();
  await notesPage.goto(`${baseUrl}/notes.html`, { waitUntil: "networkidle" });
  assert.equal(await notesPage.locator("table caption").count(), 1);
  assert.equal(await notesPage.getByLabel("搜索笔记标题").count(), 1);

  const settingsPage = await context.newPage();
  await settingsPage.goto(`${baseUrl}/settings.html`, { waitUntil: "networkidle" });
  await settingsPage.locator("[data-open-account-dialog]").click();
  assert.equal(await settingsPage.locator("[data-account-dialog]").evaluate((dialog) => dialog.open), true);
  await settingsPage.locator("[data-close-account-dialog]").first().click();
  assert.equal(await settingsPage.locator("[data-account-dialog]").evaluate((dialog) => dialog.open), false);

  const tasksPage = await context.newPage();
  await tasksPage.goto(`${baseUrl}/tasks.html`, { waitUntil: "networkidle" });
  await tasksPage.locator("[data-open-schedule-dialog]").click();
  assert.equal(await tasksPage.locator("[data-schedule-dialog]").evaluate((dialog) => dialog.open), true);
  await tasksPage.locator("[data-close-schedule-dialog]").first().click();
  await tasksPage.locator("[data-open-log-dialog]").click();
  assert.equal(await tasksPage.locator("[data-log-dialog]").evaluate((dialog) => dialog.open), true);
  await context.close();

  console.log(JSON.stringify({ ok: true, pages: 5, viewports: 2, dialogs: 3 }, null, 2));
} finally {
  if (browser) {
    await browser.close();
  }
  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
  await rm(dataDir, { recursive: true, force: true });
}

const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outPath = path.join(projectRoot, "docs", "codex", "pet-redesign-preview.png");
const previewUrl = "http://127.0.0.1:4173/?view=pet-preview&render=2d";

function commandExists(command) {
  const result = spawnSync(command, ["--version"], {
    encoding: "utf8",
    stdio: "ignore"
  });
  return result.status === 0;
}

function resolveBrowserPath() {
  const envCandidates = [process.env.BROWSER_PATH, process.env.MSEDGE_PATH, process.env.CHROME_PATH].filter(Boolean);
  const platformCandidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
          ]
        : [];
  const pathCandidates = [...envCandidates, ...platformCandidates];
  const existingPath = pathCandidates.find((candidate) => fs.existsSync(candidate));
  if (existingPath) {
    return existingPath;
  }

  const commandCandidates =
    process.platform === "win32"
      ? []
      : ["microsoft-edge", "google-chrome", "chromium", "chromium-browser", "brave-browser"];
  return commandCandidates.find(commandExists);
}

function waitForPort(port, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function tryConnect() {
      const socket = net.connect(port, "127.0.0.1");
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for 127.0.0.1:${port}.`));
          return;
        }
        setTimeout(tryConnect, 250);
      });
    }

    tryConnect();
  });
}

function stopProcessTree(childProcess) {
  if (!childProcess.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(childProcess.pid), "/T", "/F"], {
      stdio: "ignore"
    });
    return;
  }

  childProcess.kill();
}

function renderFallbackPreview(reason) {
  console.warn(`Browser preview capture failed; using local fallback renderer. Reason: ${reason}`);

  if (process.platform !== "win32") {
    renderNodeFallbackPreview();
    return;
  }

  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path.join(projectRoot, "scripts", "render-pet-preview-fallback.ps1"),
      "-OutPath",
      outPath
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: "pipe",
      timeout: 45000
    }
  );

  if (result.error) {
    console.warn(`PowerShell fallback could not start; using Node fallback renderer. Reason: ${result.error.message}`);
    renderNodeFallbackPreview();
    return;
  }

  if (result.status !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    console.warn(`PowerShell fallback failed with status ${result.status ?? "unknown"}; using Node fallback renderer.`);
    renderNodeFallbackPreview();
  }
}

function renderNodeFallbackPreview() {
  const result = spawnSync(process.execPath, [path.join(projectRoot, "scripts", "render-pet-preview-fallback.cjs"), outPath], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "pipe",
    timeout: 45000
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.error) {
    throw new Error(`Node fallback preview rendering could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Node fallback preview rendering failed with status ${result.status ?? "unknown"}.`);
  }
}

function assertValidPreviewImage() {
  const stats = fs.statSync(outPath);
  if (stats.size < 10000) {
    throw new Error(`Preview screenshot looks too small to be valid: ${stats.size} bytes.`);
  }
}

function writeVerboseCaptureOutput(stdout, stderr, result) {
  if (process.env.PREVIEW_CAPTURE_VERBOSE !== "1") {
    return;
  }

  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }
  if (result?.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result?.stderr) {
    process.stderr.write(result.stderr);
  }
}

function getBrowserFailureMessage(browserPath, result) {
  if (result.error) {
    return `${browserPath} could not start: ${result.error.message}`;
  }
  if (result.signal) {
    return `${browserPath} exited because it received ${result.signal}.`;
  }
  return `${browserPath} exited with status ${result.status ?? "unknown"}.`;
}

async function main() {
  const browserPath = resolveBrowserPath();
  if (!browserPath) {
    renderFallbackPreview("No Chromium-compatible browser was found. Set BROWSER_PATH to a browser executable.");
    assertValidPreviewImage();
    console.log(`Saved pet preview to ${outPath}`);
    return;
  }

  const userDataDir = path.join(os.tmpdir(), `desktop-pet-edge-preview-${process.pid}-${Date.now()}`);
  const previewCommand = process.platform === "win32" ? "cmd.exe" : "npm";
  const previewArgs =
    process.platform === "win32"
      ? ["/d", "/s", "/c", "npm.cmd", "run", "preview", "--", "--port", "4173"]
      : ["run", "preview", "--", "--port", "4173"];

  const previewProcess = spawn(previewCommand, previewArgs, {
    cwd: projectRoot,
    env: process.env,
    stdio: "pipe"
  });

  let stdout = "";
  let stderr = "";
  previewProcess.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  previewProcess.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  try {
    try {
      await waitForPort(4173);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      const result = spawnSync(
        browserPath,
        [
          "--headless=new",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--hide-scrollbars",
          "--no-first-run",
          "--no-default-browser-check",
          "--allow-file-access-from-files",
          `--user-data-dir=${userDataDir}`,
          "--window-size=1200,1100",
          `--screenshot=${outPath}`,
          previewUrl
        ],
        {
          cwd: projectRoot,
          encoding: "utf8",
          stdio: "pipe",
          timeout: 45000
        }
      );

      if (result.status !== 0) {
        writeVerboseCaptureOutput(stdout, stderr, result);
        throw new Error(getBrowserFailureMessage(browserPath, result));
      }
    } catch (error) {
      writeVerboseCaptureOutput(stdout, stderr);
      renderFallbackPreview(error instanceof Error ? error.message : String(error));
    }

    assertValidPreviewImage();
    console.log(`Saved pet preview to ${outPath}`);
  } finally {
    stopProcessTree(previewProcess);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

import { config } from "./config.js";
import { getAccountCredentials } from "./credentials.js";

const creatorHomeUrl = "https://creator.xiaohongshu.com";
const creatorLoginUrl = `${creatorHomeUrl}/login`;
const sessionStateDir = path.join(config.authStateDir, "storage-states");
const browserProfileDir = path.join(config.authStateDir, "browser-profiles");
const manualLoginTimeoutMs = 10 * 60 * 1000;
const loginJobs = new Map();

function ensureAuthDirs() {
  fs.mkdirSync(sessionStateDir, { recursive: true });
  fs.mkdirSync(browserProfileDir, { recursive: true });
}

function safeCredentialKey(credentialKey) {
  return String(credentialKey || "").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

function storageStatePath(account) {
  return path.join(sessionStateDir, `${safeCredentialKey(account.credentialKey)}.json`);
}

function userDataDir(account) {
  return path.join(browserProfileDir, safeCredentialKey(account.credentialKey));
}

function statSession(account) {
  const filePath = storageStatePath(account);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stat = fs.statSync(filePath);
  return {
    savedAt: stat.mtime.toISOString(),
    fileName: path.basename(filePath),
  };
}

function credentialCompleteness(account) {
  const credentials = getAccountCredentials(account);
  const needsPassword = (account.loginMethod || credentials.loginMethod) !== "wechat";

  return {
    hasUsername: !needsPassword || Boolean(credentials.username),
    hasPassword: !needsPassword || Boolean(credentials.password),
    hasProfileUrl: Boolean(credentials.profileUrl),
  };
}

function isLoggedInUrl(url) {
  return Boolean(url) && url.startsWith(creatorHomeUrl) && !url.includes("/login");
}

async function waitForManualLogin(page) {
  const deadline = Date.now() + manualLoginTimeoutMs;

  while (Date.now() < deadline) {
    const url = page.url();
    const hasUserInfo = await page.evaluate(() => {
      const userInfo = window.localStorage.getItem("USER_INFO_FOR_BIZ")
        || window.localStorage.getItem("USER_INFO");
      return Boolean(userInfo);
    }).catch(() => false);

    if (isLoggedInUrl(url) && hasUserInfo) {
      return;
    }

    await page.waitForTimeout(1000);
  }

  throw new Error("等待人工登录超时，请重新启动登录授权。");
}

async function runManualLoginJob(job, account) {
  let context;

  try {
    ensureAuthDirs();
    job.message = "正在打开小红书创作者中心登录窗口。";
    context = await chromium.launchPersistentContext(userDataDir(account), {
      headless: false,
      viewport: { width: 1280, height: 900 },
    });

    const page = context.pages()[0] || await context.newPage();
    job.message = "请在打开的浏览器窗口中完成短信/扫码登录。";
    await page.goto(creatorHomeUrl, { waitUntil: "domcontentloaded" });

    if (!isLoggedInUrl(page.url())) {
      await page.goto(creatorLoginUrl, { waitUntil: "domcontentloaded" });
    }

    await waitForManualLogin(page);
    await context.storageState({ path: storageStatePath(account) });

    job.status = "completed";
    job.completedAt = new Date().toISOString();
    job.message = "登录授权已保存，后续采集会优先复用本地 session。";
  } catch (error) {
    job.status = "error";
    job.completedAt = new Date().toISOString();
    job.message = error.message || "登录授权失败。";
  } finally {
    await context?.close().catch(() => {});
  }
}

export function listAuthSessions(accounts) {
  ensureAuthDirs();

  return accounts.map((account) => {
    const credentials = credentialCompleteness(account);
    const session = statSession(account);
    const job = loginJobs.get(account.credentialKey) || null;
    let status = "session_missing";
    let label = "未授权";

    if (!credentials.hasUsername || !credentials.hasPassword || !credentials.hasProfileUrl) {
      status = "credential_missing";
      label = "凭据未完整";
    } else if (job?.status === "running") {
      status = "login_in_progress";
      label = "等待人工登录";
    } else if (session) {
      status = "session_ready";
      label = "登录态已保存";
    } else if (job?.status === "error") {
      status = "manual_required";
      label = "需要重新授权";
    }

    return {
      accountId: account.id,
      accountName: account.name,
      credentialKey: account.credentialKey,
      loginMethod: account.loginMethod || "password",
      status,
      label,
      sessionExists: Boolean(session),
      sessionSavedAt: session?.savedAt || null,
      sessionFileName: session?.fileName || null,
      credentials,
      job: job ? {
        status: job.status,
        startedAt: job.startedAt,
        completedAt: job.completedAt || null,
        message: job.message,
      } : null,
    };
  });
}

export function getAuthStorageStatePath(account) {
  ensureAuthDirs();
  return storageStatePath(account);
}

export function startManualLogin(account) {
  const credentials = credentialCompleteness(account);
  if (!credentials.hasUsername || !credentials.hasPassword || !credentials.hasProfileUrl) {
    throw Object.assign(new Error("该账号 .env 凭据未完整，暂不能启动登录授权。"), { statusCode: 400 });
  }

  const activeJob = loginJobs.get(account.credentialKey);
  if (activeJob?.status === "running") {
    return activeJob;
  }

  const job = {
    status: "running",
    credentialKey: account.credentialKey,
    startedAt: new Date().toISOString(),
    completedAt: null,
    message: "登录授权任务已启动。",
  };
  loginJobs.set(account.credentialKey, job);
  runManualLoginJob(job, account);

  return job;
}

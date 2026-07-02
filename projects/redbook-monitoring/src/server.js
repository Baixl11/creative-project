import express from "express";

import { listAuthSessions, startManualLogin } from "./authSessions.js";
import { collectXhsAccount } from "./collectors/xhsCollector.js";
import { config } from "./config.js";
import { openDatabase } from "./database.js";
import { deleteAccountCredentials, getCredentialStatus, saveAccountCredentials } from "./credentials.js";
import { createAccountsRepository } from "./repositories/accounts.js";
import { createCollectionDataRepository } from "./repositories/collectionData.js";
import { createDashboardRepository } from "./repositories/dashboard.js";
import { createSchedulerSettingsRepository } from "./repositories/schedulerSettings.js";
import { createCollectionScheduler } from "./scheduler.js";

const app = express();
const db = openDatabase();
const accountsRepository = createAccountsRepository(db);
const collectionDataRepository = createCollectionDataRepository(db);
const dashboardRepository = createDashboardRepository(db);
const scheduleRepository = createSchedulerSettingsRepository(db);
const collectionScheduler = createCollectionScheduler({
  accountsRepository,
  collectionDataRepository,
  collectAccount: collectXhsAccount,
  dashboardRepository,
  scheduleRepository,
});

app.use(express.json());
app.use(express.static(config.publicDir, {
  extensions: ["html"],
  index: "index.html",
}));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    database: "connected",
    storage: config.databasePath,
  });
});

app.get("/api/accounts", (_request, response) => {
  response.json({ accounts: accountsRepository.list() });
});

app.get("/api/credentials/status", (_request, response) => {
  response.json(getCredentialStatus(accountsRepository.list()));
});

app.get("/api/auth/sessions", (_request, response) => {
  response.json({ sessions: listAuthSessions(accountsRepository.list()) });
});

app.get("/api/scheduler/status", (_request, response) => {
  response.json(collectionScheduler.status());
});

app.put("/api/scheduler/settings", (request, response, next) => {
  try {
    response.json(collectionScheduler.updateSchedule(request.body || {}));
  } catch (error) {
    next(error);
  }
});

app.get("/api/collections/status", (_request, response) => {
  response.json(collectionScheduler.collectionStatus());
});

function dateRangeFromQuery(query) {
  return {
    startDate: query.startDate,
    endDate: query.endDate,
  };
}

app.post("/api/auth/sessions/:credentialKey/bootstrap", (request, response, next) => {
  try {
    const account = accountsRepository.findByCredentialKey(request.params.credentialKey);
    if (!account) {
      throw Object.assign(new Error("账号不存在"), { statusCode: 404 });
    }

    const job = startManualLogin(account);
    dashboardRepository.createCollectionLog({
      accountId: account.id,
      level: "warning",
      eventType: "login_bootstrap",
      message: `${account.name} 已启动人工登录授权，请在打开的浏览器窗口中完成短信/扫码登录。`,
    });

    response.status(202).json({
      status: job.status,
      message: job.message,
      job,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/accounts", (request, response, next) => {
  try {
    const input = request.body || {};
    const loginMethod = input.loginMethod === "wechat" ? "wechat" : "password";
    const username = String(input.username || "").trim();
    const password = String(input.password || "");

    if (loginMethod === "password" && (!username || !password)) {
      throw Object.assign(new Error("手机号/密码登录需要填写账号和密码"), { statusCode: 400 });
    }

    const account = accountsRepository.create({ ...input, loginMethod });
    saveAccountCredentials(account, {
      loginMethod,
      username,
      password,
      profileUrl: account.profileUrl,
    });

    response.status(201).json({ account });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/accounts/:id", (request, response, next) => {
  try {
    const account = accountsRepository.delete(Number(request.params.id));
    deleteAccountCredentials(account);
    response.json({ deleted: account });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/accounts/:id/default", (request, response, next) => {
  try {
    const account = accountsRepository.setDefault(Number(request.params.id));
    response.json({ account });
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/date-range", (request, response) => {
  response.json(dashboardRepository.dateRange(dateRangeFromQuery(request.query)));
});

app.get("/api/dashboard/overview", (request, response) => {
  response.json(dashboardRepository.overview(dateRangeFromQuery(request.query)));
});

app.get("/api/dashboard/notes", (request, response) => {
  const dateRange = dateRangeFromQuery(request.query);
  response.json({
    notes: dashboardRepository.notes(dateRange),
    coverage: dashboardRepository.noteCoverage(dateRange),
  });
});

app.get("/api/dashboard/trends", (request, response) => {
  response.json(dashboardRepository.trends({
    ...dateRangeFromQuery(request.query),
    days: request.query.days,
    metricPeriod: request.query.metricPeriod,
    accountId: request.query.accountId ? Number(request.query.accountId) : null,
  }));
});

app.get("/api/collection-logs", (request, response) => {
  const options = {
    ...dateRangeFromQuery(request.query),
    limit: request.query.limit,
    offset: request.query.offset,
    all: request.query.all === "true",
  };
  response.json({
    logs: dashboardRepository.collectionLogs(options),
    total: dashboardRepository.collectionLogCount(options),
  });
});

app.post("/api/collections/manual", (_request, response, next) => {
  try {
    const result = collectionScheduler.trigger("manual");

    response.status(202).json({
      status: result.accepted ? "started" : "running",
      message: result.message,
      job: result.job,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  const statusCode = error.statusCode || 500;
  response.status(statusCode).json({
    error: {
      message: error.message || "服务器内部错误",
    },
  });
});

app.listen(config.port, config.host, () => {
  collectionScheduler.start();
  console.log(`Redbook Monitor running at http://${config.host}:${config.port}`);
});

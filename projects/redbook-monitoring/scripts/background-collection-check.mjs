import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

import { createCollectionScheduler } from "../src/scheduler.js";

const accounts = [
  {
    id: 1,
    name: "测试账号",
    credentialKey: "TEST",
    loginMethod: "password",
  },
];

let collectCount = 0;
let saveCount = 0;
let logSequence = 0;

const scheduler = createCollectionScheduler({
  accountsRepository: {
    list: () => accounts,
  },
  collectionDataRepository: {
    saveCollectedData: () => {
      saveCount += 1;
    },
  },
  collectAccount: async (account) => {
    collectCount += 1;
    await delay(120);
    return {
      accountName: account.name,
      noteSync: {
        actualCount: 2,
        expectedCount: 2,
        complete: true,
      },
    };
  },
  dashboardRepository: {
    createCollectionLog: ({ accountId = null, level, eventType, message }) => ({
      id: ++logSequence,
      account_id: accountId,
      level,
      event_type: eventType,
      message,
      created_at: new Date().toISOString(),
      account_name: null,
    }),
  },
  listSessions: () => [
    {
      accountId: 1,
      accountName: "测试账号",
      credentialKey: "TEST",
      status: "session_ready",
      label: "登录正常",
    },
  ],
});

const started = scheduler.trigger("manual");
assert.equal(started.accepted, true, "首次手动采集应启动后台任务");
assert.equal(started.job.status, "running", "启动后应立即进入 running 状态");

const runningStatus = scheduler.collectionStatus();
assert.equal(runningStatus.activeJob.status, "running", "状态接口应返回 activeJob");

const duplicate = scheduler.trigger("manual");
assert.equal(duplicate.accepted, false, "运行中重复触发不应启动第二个任务");
assert.equal(duplicate.job.id, started.job.id, "重复触发应返回同一个后台任务");

await delay(220);

const completedStatus = scheduler.collectionStatus();
assert.equal(completedStatus.activeJob, null, "完成后 activeJob 应清空");
assert.equal(completedStatus.lastJob.status, "success", "完成后 lastJob 应标记成功");
assert.equal(completedStatus.lastJob.log.eventType, "manual_collect", "成功日志事件类型应为 manual_collect");
assert.equal(collectCount, 1, "采集器只应执行一次");
assert.equal(saveCount, 1, "采集数据只应保存一次");

const partialAccounts = [
  {
    id: 1,
    name: "成功账号",
    credentialKey: "OK",
    loginMethod: "password",
  },
  {
    id: 2,
    name: "失败账号",
    credentialKey: "FAIL",
    loginMethod: "password",
  },
];
let partialSaveCount = 0;
const partialScheduler = createCollectionScheduler({
  accountsRepository: {
    list: () => partialAccounts,
  },
  collectionDataRepository: {
    saveCollectedData: () => {
      partialSaveCount += 1;
    },
  },
  collectAccount: async (account) => {
    await delay(20);
    if (account.credentialKey === "FAIL") {
      throw new Error("模拟采集失败");
    }

    return {
      accountName: account.name,
      noteSync: {
        actualCount: 1,
        expectedCount: 1,
        complete: true,
      },
    };
  },
  dashboardRepository: {
    createCollectionLog: ({ accountId = null, level, eventType, message }) => ({
      id: ++logSequence,
      account_id: accountId,
      level,
      event_type: eventType,
      message,
      created_at: new Date().toISOString(),
      account_name: null,
    }),
  },
  listSessions: () => partialAccounts.map((account) => ({
    accountId: account.id,
    accountName: account.name,
    credentialKey: account.credentialKey,
    status: "session_ready",
    label: "登录正常",
  })),
});

partialScheduler.trigger("manual");
await delay(120);
const partialStatus = partialScheduler.collectionStatus();
assert.equal(partialStatus.lastJob.status, "warning", "部分成功应标记为 warning");
assert.equal(partialStatus.lastJob.log.eventType, "manual_partial_failed", "部分失败事件类型应为 manual_partial_failed");
assert.match(partialStatus.lastJob.message, /成功 1\/2 个/, "部分失败日志应包含成功数量");
assert.match(partialStatus.lastJob.message, /失败 1\/2 个/, "部分失败日志应包含失败数量");
assert.equal(partialSaveCount, 1, "部分失败时成功账号仍应保存一次");

console.log(JSON.stringify({
  ok: true,
  startedJob: started.job.id,
  lastStatus: completedStatus.lastJob.status,
  partialStatus: partialStatus.lastJob.status,
  collectCount,
  saveCount,
  partialSaveCount,
}, null, 2));

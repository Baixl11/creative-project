import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { config } from "../src/config.js";
import { createDashboardRepository } from "../src/repositories/dashboard.js";

const metricKeys = [
  "followers",
  "reads",
  "impressions",
  "likes",
  "collections",
  "comments",
  "profile_views",
  "follower_delta",
  "read_delta",
  "impression_delta",
  "like_delta",
  "collection_delta",
  "comment_delta",
  "profile_view_delta",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

if (!fs.existsSync(config.databasePath)) {
  throw new Error(`SQLite 数据库不存在：${config.databasePath}`);
}

const db = new DatabaseSync(config.databasePath, { readOnly: true });
const dashboardRepository = createDashboardRepository(db);
const overview = dashboardRepository.overview();
const notes = dashboardRepository.notes();
const logs = dashboardRepository.collectionLogs();
const trends = dashboardRepository.trends({ days: 7, metricPeriod: "seven" });

const latestAccountRows = db.prepare(`
  SELECT
    accounts.id,
    CASE
      WHEN accounts.xhs_name IS NULL OR length(accounts.xhs_name) = 0
      THEN accounts.name
      ELSE accounts.xhs_name
    END AS name,
    accounts.xhs_account_id,
    snapshots.followers,
    snapshots.reads,
    snapshots.impressions,
    snapshots.likes,
    snapshots.collections,
    snapshots.comments,
    snapshots.profile_views,
    snapshots.follower_delta,
    snapshots.read_delta,
    snapshots.impression_delta,
    snapshots.like_delta,
    snapshots.collection_delta,
    snapshots.comment_delta,
    snapshots.profile_view_delta
  FROM accounts
  JOIN account_snapshots snapshots ON snapshots.id = (
    SELECT id
    FROM account_snapshots latest
    WHERE latest.account_id = accounts.id
    ORDER BY latest.captured_at DESC, latest.id DESC
    LIMIT 1
  )
`).all();

for (const key of metricKeys) {
  const expected = latestAccountRows.reduce((total, row) => total + Number(row[key] || 0), 0);
  const actual = Number(overview.totals?.[key] || 0);
  assert(actual === expected, `overview.totals.${key} 不一致：${actual} !== ${expected}`);
}

for (const account of overview.accounts) {
  const source = latestAccountRows.find((row) => row.id === account.id);
  if (!source) {
    for (const key of metricKeys) {
      assert(
        Number(account[key] || 0) === 0,
        `未采集账号 ${account.id} 不应出现 ${key} 指标`,
      );
    }
    continue;
  }

  for (const key of metricKeys) {
    assert(
      Number(account[key] || 0) === Number(source[key] || 0),
      `overview.accounts[${account.id}].${key} 不一致`,
    );
  }

  assert(account.name === source.name, `账号 ${account.id} 昵称未同步`);
  assert(account.xhs_account_id === source.xhs_account_id, `账号 ${account.id} 小红书号未同步`);
}

const accountIds = new Set(latestAccountRows.map((row) => row.id));
const accountXhsIds = new Map(latestAccountRows.map((row) => [row.id, row.xhs_account_id]));

for (const note of notes) {
  assert(accountIds.has(note.account_id), `笔记 ${note.id} 归属账号不存在`);
  assert(note.account_xhs_id === accountXhsIds.get(note.account_id), `笔记 ${note.id} 小红书号不一致`);
}

const demoLog = db.prepare(`
  SELECT id, message
  FROM collection_logs
  WHERE message LIKE '%测试号%'
    OR message LIKE '%内容号%'
    OR message LIKE '%后续阶段%'
    OR message LIKE '%静态 Demo%'
    OR message LIKE '%示例数据%'
  LIMIT 1
`).get();
assert(!demoLog, `SQLite 仍存在旧演示日志：${demoLog?.id}`);

const trendSourceRows = db.prepare(`
  SELECT
    metric_date,
    SUM(likes + collections + comments) AS interactions
  FROM account_daily_metrics
  WHERE metric_period = 'seven'
  GROUP BY metric_date
  ORDER BY metric_date DESC
  LIMIT 7
`).all().reverse();

if (trendSourceRows.length) {
  assert(trends.series.length === trendSourceRows.length, "趋势 API 点位数量与日指标表不一致");
  trendSourceRows.forEach((row, index) => {
    const point = trends.series[index];
    assert(point.metric_date === row.metric_date, `趋势点 ${index} 日期不一致`);
    assert(
      Number(point.interactions || 0) === Number(row.interactions || 0),
      `趋势点 ${row.metric_date} 互动量不一致`,
    );
  });
}

console.log(JSON.stringify({
  ok: true,
  accountCount: overview.accounts.length,
  noteCount: notes.length,
  logCount: logs.length,
  trendPointCount: trends.series.length,
  accounts: overview.accounts.map((account) => ({
    id: account.id,
    name: account.name,
    xhsAccountId: account.xhs_account_id,
  })),
}, null, 2));

db.close();

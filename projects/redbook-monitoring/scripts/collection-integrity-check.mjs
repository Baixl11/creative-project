import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";

import { createCollectionDataRepository } from "../src/repositories/collectionData.js";

const db = new DatabaseSync(":memory:");
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE accounts (
    id INTEGER PRIMARY KEY, name TEXT, xhs_name TEXT, xhs_account_id TEXT,
    status TEXT, updated_at TEXT
  );
  CREATE TABLE account_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, captured_at TEXT,
    followers INTEGER, reads INTEGER, impressions INTEGER, likes INTEGER,
    collections INTEGER, comments INTEGER, profile_views INTEGER,
    follower_delta INTEGER, read_delta INTEGER, impression_delta INTEGER,
    like_delta INTEGER, collection_delta INTEGER, comment_delta INTEGER,
    profile_view_delta INTEGER, metric_period TEXT, period_start TEXT,
    period_end TEXT, daily_metric_date TEXT, source_name TEXT
  );
  CREATE TABLE account_daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, metric_date TEXT,
    metric_period TEXT, captured_at TEXT, reads INTEGER, impressions INTEGER,
    likes INTEGER, collections INTEGER, comments INTEGER, profile_views INTEGER,
    follower_delta INTEGER, source_name TEXT
  );
  CREATE UNIQUE INDEX daily_unique
  ON account_daily_metrics(account_id, metric_date, metric_period, source_name);
  CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER,
    source_note_id TEXT, source_link TEXT, title TEXT, type TEXT, topic TEXT,
    published_at TEXT
  );
  CREATE UNIQUE INDEX note_unique ON notes(account_id, source_note_id);
  CREATE TABLE note_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT, note_id INTEGER, captured_at TEXT,
    reads INTEGER, impressions INTEGER, likes INTEGER, collections INTEGER,
    comments INTEGER, follower_delta INTEGER, read_delta INTEGER,
    impression_delta INTEGER, metrics_available INTEGER, source_name TEXT,
    reads_available INTEGER, impressions_available INTEGER, likes_available INTEGER,
    collections_available INTEGER, comments_available INTEGER,
    follower_delta_available INTEGER
  );
  CREATE TABLE collection_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, captured_at TEXT,
    status TEXT, source_note_count INTEGER, stored_note_count INTEGER,
    daily_metric_count INTEGER, checked_field_count INTEGER, message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  INSERT INTO accounts (id, name, status) VALUES (1, '测试账号', 'pending');
`);

const repository = createCollectionDataRepository(db);

function note(id, reads) {
  return {
    sourceNoteId: id,
    sourceLink: `https://example.com/${id}`,
    title: `笔记 ${id}`,
    type: "图文",
    topic: "笔记管理",
    publishedAt: "2026-06-30",
    reads,
    impressions: 0,
    likes: 2,
    collections: 1,
    comments: 1,
    followerDelta: 0,
    readDelta: 0,
    impressionDelta: 0,
    metricsAvailable: true,
    readsAvailable: true,
    impressionsAvailable: false,
    likesAvailable: true,
    collectionsAvailable: true,
    commentsAvailable: true,
    followerDeltaAvailable: false,
    sourceName: "/api/galaxy/v2/creator/note/user/posted",
  };
}

function payload(capturedAt, notes, complete, expectedCount = notes.length) {
  return {
    capturedAt,
    profile: { xhsName: "测试账号", xhsAccountId: "123456" },
    accountSnapshot: {
      followers: 10, reads: 20, impressions: 30, likes: 4, collections: 3,
      comments: 2, profileViews: 1, followerDelta: 0, readDelta: 2,
      impressionDelta: 3, likeDelta: 1, collectionDelta: 0, commentDelta: 0,
      profileViewDelta: 0, metricPeriod: "seven", periodStart: "2026-06-24",
      periodEnd: "2026-06-30", dailyMetricDate: "2026-06-30",
      sourceName: "/api/galaxy/v2/creator/datacenter/account/base",
    },
    dailyMetrics: [{
      metricDate: "2026-06-30", metricPeriod: "seven", reads: 2,
      impressions: 3, likes: 1, collections: 0, comments: 0, profileViews: 0,
      followerDelta: 0, sourceName: "/api/galaxy/v2/creator/datacenter/account/base",
    }],
    noteSnapshots: notes,
    noteSync: { complete, expectedCount },
  };
}

const first = repository.saveCollectedData(1, payload("2026-06-30 10:00:00", [note("A", 10), note("B", 20)], true));
assert.equal(first.status, "success");
assert.equal(db.prepare("SELECT COUNT(*) count FROM notes").get().count, 2);

const partial = repository.saveCollectedData(1, payload("2026-06-30 11:00:00", [note("A", 12)], false, 2));
assert.equal(partial.status, "warning", "不完整抓取应标记 warning");
assert.equal(db.prepare("SELECT COUNT(*) count FROM notes").get().count, 2, "不完整抓取不应删除旧笔记");

const complete = repository.saveCollectedData(1, payload("2026-06-30 12:00:00", [note("A", 14)], true, 1));
assert.equal(complete.status, "success");
assert.equal(db.prepare("SELECT COUNT(*) count FROM notes").get().count, 1, "完整抓取应删除网站已不存在的笔记");

const snapshotCount = db.prepare("SELECT COUNT(*) count FROM account_snapshots").get().count;
assert.throws(
  () => repository.saveCollectedData(1, payload("2026-06-30 13:00:00", [note("A", 15), note("A", 16)], true, 2)),
  /重复笔记 ID/,
);
assert.equal(
  db.prepare("SELECT COUNT(*) count FROM account_snapshots").get().count,
  snapshotCount,
  "校验失败时不应留下部分快照",
);
assert.equal(db.prepare("SELECT status FROM collection_audits ORDER BY id DESC LIMIT 1").get().status, "error");

console.log(JSON.stringify({
  ok: true,
  completeAuditFields: complete.checkedFieldCount,
  partialStatus: partial.status,
  remainingNotes: db.prepare("SELECT COUNT(*) count FROM notes").get().count,
  auditCount: db.prepare("SELECT COUNT(*) count FROM collection_audits").get().count,
}, null, 2));

db.close();

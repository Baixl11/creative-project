import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { runMigrations } from "../src/database.js";

test("数据库迁移有版本记录、可重复执行并清理旧日志", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE collection_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      level TEXT NOT NULL DEFAULT 'error',
      event_type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO collection_logs (event_type, message)
    VALUES ('manual_collect_crashed', 'browserType.launch: Browser logs:\n<launching> /Users/test/browser');
  `);

  runMigrations(db);
  runMigrations(db);

  const versions = db.prepare("SELECT version, name FROM schema_migrations ORDER BY version").all();
  assert.deepEqual(versions.map((row) => Number(row.version)), [1, 2]);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM schema_migrations").get().count, 2);
  assert.equal(
    db.prepare("SELECT message FROM collection_logs LIMIT 1").get().message,
    "browserType.launch:",
  );
  db.close();
});

test("失败的迁移不会写入版本记录", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO schema_migrations (version, name) VALUES (1, 'initial_schema');
    CREATE TABLE collection_logs (message TEXT NOT NULL);
  `);

  assert.throws(() => runMigrations(db), /数据库迁移 2/);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version = 2").get().count, 0);
  db.close();
});

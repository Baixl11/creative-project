import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { config } from "./config.js";

const nowSql = "datetime('now')";

function normalizeKey(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

export function openDatabase() {
  fs.mkdirSync(config.dataDir, { recursive: true });

  const db = new DatabaseSync(config.databasePath);
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  seed(db);

  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      profile_url TEXT NOT NULL,
      credential_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (${nowSql}),
      updated_at TEXT NOT NULL DEFAULT (${nowSql})
    );

    CREATE TABLE IF NOT EXISTS account_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      captured_at TEXT NOT NULL,
      followers INTEGER NOT NULL DEFAULT 0,
      reads INTEGER NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      collections INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      profile_views INTEGER NOT NULL DEFAULT 0,
      follower_delta INTEGER NOT NULL DEFAULT 0,
      read_delta INTEGER NOT NULL DEFAULT 0,
      impression_delta INTEGER NOT NULL DEFAULT 0,
      like_delta INTEGER NOT NULL DEFAULT 0,
      collection_delta INTEGER NOT NULL DEFAULT 0,
      comment_delta INTEGER NOT NULL DEFAULT 0,
      profile_view_delta INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '图文',
      topic TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS note_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      captured_at TEXT NOT NULL,
      reads INTEGER NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      collections INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      follower_delta INTEGER NOT NULL DEFAULT 0,
      read_delta INTEGER NOT NULL DEFAULT 0,
      impression_delta INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS collection_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
      level TEXT NOT NULL DEFAULT 'success',
      event_type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (${nowSql})
    );

    CREATE TABLE IF NOT EXISTS scheduler_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      frequency TEXT NOT NULL DEFAULT 'daily',
      run_time TEXT NOT NULL DEFAULT '10:00',
      weekday INTEGER NOT NULL DEFAULT 1,
      month_day INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (${nowSql})
    );

    CREATE TABLE IF NOT EXISTS collection_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      captured_at TEXT NOT NULL,
      status TEXT NOT NULL,
      source_note_count INTEGER NOT NULL DEFAULT 0,
      stored_note_count INTEGER NOT NULL DEFAULT 0,
      daily_metric_count INTEGER NOT NULL DEFAULT 0,
      checked_field_count INTEGER NOT NULL DEFAULT 0,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (${nowSql})
    );

    CREATE TABLE IF NOT EXISTS account_daily_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      metric_date TEXT NOT NULL,
      metric_period TEXT NOT NULL DEFAULT 'seven',
      captured_at TEXT NOT NULL,
      reads INTEGER NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      collections INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      profile_views INTEGER NOT NULL DEFAULT 0,
      follower_delta INTEGER NOT NULL DEFAULT 0,
      source_name TEXT NOT NULL DEFAULT ''
    );
  `);

  addColumnIfMissing(db, "notes", "source_note_id", "TEXT");
  addColumnIfMissing(db, "notes", "source_link", "TEXT");
  addColumnIfMissing(db, "accounts", "xhs_name", "TEXT");
  addColumnIfMissing(db, "accounts", "xhs_account_id", "TEXT");
  addColumnIfMissing(db, "accounts", "login_method", "TEXT NOT NULL DEFAULT 'password'");
  addColumnIfMissing(db, "account_snapshots", "metric_period", "TEXT");
  addColumnIfMissing(db, "account_snapshots", "period_start", "TEXT");
  addColumnIfMissing(db, "account_snapshots", "period_end", "TEXT");
  addColumnIfMissing(db, "account_snapshots", "daily_metric_date", "TEXT");
  addColumnIfMissing(db, "account_snapshots", "source_name", "TEXT");
  addColumnIfMissing(db, "note_snapshots", "metrics_available", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "note_snapshots", "source_name", "TEXT");
  addColumnIfMissing(db, "note_snapshots", "reads_available", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "note_snapshots", "impressions_available", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "note_snapshots", "likes_available", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "note_snapshots", "collections_available", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "note_snapshots", "comments_available", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "note_snapshots", "follower_delta_available", "INTEGER NOT NULL DEFAULT 1");
  db.exec(`
    INSERT OR IGNORE INTO scheduler_settings (id, frequency, run_time, weekday, month_day)
    VALUES (1, 'daily', '10:00', 1, 1);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_account_source
    ON notes(account_id, source_note_id)
    WHERE source_note_id IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_account_daily_metrics_unique
    ON account_daily_metrics(account_id, metric_date, metric_period, source_name);

    CREATE INDEX IF NOT EXISTS idx_account_daily_metrics_date
    ON account_daily_metrics(metric_period, metric_date);

    CREATE INDEX IF NOT EXISTS idx_collection_audits_account
    ON collection_audits(account_id, id DESC);
  `);
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

function seed(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM accounts").get().count;
  if (count > 0) {
    return;
  }
}

export function normalizeCredentialKey(value) {
  return normalizeKey(value || "");
}

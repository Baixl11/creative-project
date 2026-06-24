import { normalizeCredentialKey } from "../database.js";

function mapAccount(row) {
  const syncedName = typeof row.xhs_name === "string" ? row.xhs_name.trim() : row.xhs_name;
  const syncedAccountId = typeof row.xhs_account_id === "string" ? row.xhs_account_id.trim() : row.xhs_account_id;
  const displayName = syncedName || row.name;

  return {
    id: row.id,
    name: displayName,
    displayName,
    configuredName: row.name,
    xhsName: syncedName || null,
    xhsAccountId: syncedAccountId || null,
    loginMethod: row.login_method || "password",
    profileUrl: row.profile_url,
    credentialKey: row.credential_key,
    status: row.status,
    isDefault: Boolean(row.is_default),
    lastCollectedAt: row.last_collected_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeLoginMethod(value) {
  return value === "wechat" ? "wechat" : "password";
}

function nextCredentialKey(db, name) {
  const base = normalizeCredentialKey(name) || "ACCOUNT";
  let candidate = base;
  let index = 2;

  while (db.prepare("SELECT id FROM accounts WHERE credential_key = ?").get(candidate)) {
    candidate = `${base}_${index}`;
    index += 1;
  }

  return candidate;
}

export function createAccountsRepository(db) {
  return {
    list() {
      const rows = db.prepare(`
        SELECT
          accounts.*,
          MAX(account_snapshots.captured_at) AS last_collected_at
        FROM accounts
        LEFT JOIN account_snapshots ON account_snapshots.account_id = accounts.id
        GROUP BY accounts.id
        ORDER BY accounts.is_default DESC, accounts.id ASC
      `).all();

      return rows.map(mapAccount);
    },

    create(input) {
      const name = String(input.name || "").trim();
      const profileUrl = String(input.profileUrl || "").trim();
      const credentialKey = input.credentialKey
        ? normalizeCredentialKey(input.credentialKey)
        : nextCredentialKey(db, name);
      const loginMethod = normalizeLoginMethod(input.loginMethod);

      if (!name) {
        throw Object.assign(new Error("账号名称不能为空"), { statusCode: 400 });
      }
      if (!profileUrl) {
        throw Object.assign(new Error("主页链接不能为空"), { statusCode: 400 });
      }
      if (!credentialKey) {
        throw Object.assign(new Error("凭据 key 不能为空"), { statusCode: 400 });
      }

      const existing = db.prepare("SELECT id FROM accounts WHERE credential_key = ?").get(credentialKey);
      if (existing) {
        throw Object.assign(new Error("凭据 key 已存在，请换一个"), { statusCode: 409 });
      }

      const currentCount = db.prepare("SELECT COUNT(*) AS count FROM accounts").get().count;
      const isDefault = currentCount === 0 ? 1 : 0;

      const result = db.prepare(`
        INSERT INTO accounts (name, profile_url, credential_key, login_method, status, is_default)
        VALUES (?, ?, ?, ?, 'pending_verification', ?)
      `).run(name, profileUrl, credentialKey, loginMethod, isDefault);

      return this.findById(Number(result.lastInsertRowid));
    },

    delete(id) {
      const account = this.findById(id);
      if (!account) {
        throw Object.assign(new Error("账号不存在"), { statusCode: 404 });
      }

      db.prepare("DELETE FROM accounts WHERE id = ?").run(id);

      if (account.isDefault) {
        const next = db.prepare("SELECT id FROM accounts ORDER BY id ASC LIMIT 1").get();
        if (next) {
          db.prepare("UPDATE accounts SET is_default = 1, updated_at = datetime('now') WHERE id = ?").run(next.id);
        }
      }

      return account;
    },

    findById(id) {
      const row = db.prepare(`
        SELECT
          accounts.*,
          MAX(account_snapshots.captured_at) AS last_collected_at
        FROM accounts
        LEFT JOIN account_snapshots ON account_snapshots.account_id = accounts.id
        WHERE accounts.id = ?
        GROUP BY accounts.id
      `).get(id);

      return row ? mapAccount(row) : null;
    },

    findByCredentialKey(credentialKey) {
      const row = db.prepare(`
        SELECT
          accounts.*,
          MAX(account_snapshots.captured_at) AS last_collected_at
        FROM accounts
        LEFT JOIN account_snapshots ON account_snapshots.account_id = accounts.id
        WHERE accounts.credential_key = ?
        GROUP BY accounts.id
      `).get(normalizeCredentialKey(credentialKey));

      return row ? mapAccount(row) : null;
    },

    setDefault(id) {
      const account = this.findById(id);
      if (!account) {
        throw Object.assign(new Error("账号不存在"), { statusCode: 404 });
      }

      db.exec("UPDATE accounts SET is_default = 0;");
      db.prepare("UPDATE accounts SET is_default = 1, updated_at = datetime('now') WHERE id = ?").run(id);

      return this.findById(id);
    },
  };
}

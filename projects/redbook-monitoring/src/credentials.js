import fs from "node:fs";

import { config } from "./config.js";

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function serializeEnvValue(value) {
  const text = String(value || "");
  if (/^[A-Za-z0-9_./:@+-]*$/.test(text)) {
    return text;
  }

  return JSON.stringify(text);
}

function upsertEnvLine(lines, key, value) {
  const matcher = new RegExp(`^\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`);
  const nextLine = `${key}=${serializeEnvValue(value)}`;
  const index = lines.findIndex((line) => matcher.test(line) && !line.trim().startsWith("#"));

  if (index === -1) {
    lines.push(nextLine);
  } else {
    lines[index] = nextLine;
  }
}

export function readLocalEnv() {
  if (!fs.existsSync(config.envPath)) {
    return { exists: false, values: {} };
  }

  const content = fs.readFileSync(config.envPath, "utf8");
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);
    values[key] = parseEnvValue(value);
  }

  return { exists: true, values };
}

export function saveAccountCredentials(account, credentials = {}) {
  const existing = fs.existsSync(config.envPath) ? fs.readFileSync(config.envPath, "utf8") : "";
  const lines = existing ? existing.split(/\r?\n/) : [];
  const localEnv = readLocalEnv();
  const accounts = new Set(String(localEnv.values.XHS_ACCOUNTS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean));
  const prefix = `XHS_${account.credentialKey}`;

  accounts.add(account.credentialKey);
  upsertEnvLine(lines, "XHS_ACCOUNTS", Array.from(accounts).join(","));
  upsertEnvLine(lines, `${prefix}_LOGIN_METHOD`, credentials.loginMethod || account.loginMethod || "password");
  upsertEnvLine(lines, `${prefix}_PROFILE_URL`, credentials.profileUrl || account.profileUrl);

  if (credentials.username) {
    upsertEnvLine(lines, `${prefix}_USERNAME`, credentials.username);
  }
  if (credentials.password) {
    upsertEnvLine(lines, `${prefix}_PASSWORD`, credentials.password);
  }

  fs.writeFileSync(config.envPath, `${lines.filter((line, index) => line.trim() || index < lines.length - 1).join("\n")}\n`, {
    mode: 0o600,
  });
}

export function deleteAccountCredentials(account) {
  if (!fs.existsSync(config.envPath)) {
    return;
  }

  const localEnv = readLocalEnv();
  const prefix = `XHS_${account.credentialKey}`;
  const accounts = new Set(String(localEnv.values.XHS_ACCOUNTS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean));
  const matcher = new RegExp(`^\\s*${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_(USERNAME|PASSWORD|PROFILE_URL|LOGIN_METHOD)\\s*=`);
  const nextLines = fs.readFileSync(config.envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => !matcher.test(line));

  accounts.delete(account.credentialKey);
  upsertEnvLine(nextLines, "XHS_ACCOUNTS", Array.from(accounts).join(","));
  fs.writeFileSync(config.envPath, `${nextLines.filter((line, index) => line.trim() || index < nextLines.length - 1).join("\n")}\n`, {
    mode: 0o600,
  });
}

export function getAccountCredentials(account) {
  const localEnv = readLocalEnv();
  const prefix = `XHS_${account.credentialKey}`;

  return {
    envExists: localEnv.exists,
    loginMethod: localEnv.values[`${prefix}_LOGIN_METHOD`] || account.loginMethod || "password",
    username: localEnv.values[`${prefix}_USERNAME`] || localEnv.values.XHS_USERNAME || "",
    password: localEnv.values[`${prefix}_PASSWORD`] || localEnv.values.XHS_PASSWORD || "",
    profileUrl: localEnv.values[`${prefix}_PROFILE_URL`] || localEnv.values.XHS_PROFILE_URL || "",
  };
}

export function getCredentialStatus(accounts) {
  const localEnv = readLocalEnv();

  return {
    envPath: config.envPath,
    envExists: localEnv.exists,
    accounts: accounts.map((account) => {
      const credentials = getAccountCredentials(account);
      const needsPassword = (account.loginMethod || credentials.loginMethod) !== "wechat";

      return {
        accountId: account.id,
        accountName: account.name,
        credentialKey: account.credentialKey,
        loginMethod: account.loginMethod,
        hasUsername: !needsPassword || Boolean(credentials.username),
        hasPassword: !needsPassword || Boolean(credentials.password),
        hasProfileUrl: Boolean(credentials.profileUrl),
      };
    }),
  };
}

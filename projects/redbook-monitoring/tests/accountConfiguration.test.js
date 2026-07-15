import assert from "node:assert/strict";
import test from "node:test";

import { createAccountConfigurationService } from "../src/services/accountConfiguration.js";

function account(id = 1) {
  return {
    id,
    name: "测试账号",
    credentialKey: "TEST",
    loginMethod: "password",
    profileUrl: "https://www.xiaohongshu.com/user/profile/test",
  };
}

test("新增账号在凭据保存失败时回滚数据库记录", () => {
  const deleted = [];
  const service = createAccountConfigurationService({
    accountsRepository: {
      create: () => account(),
      delete: (id) => deleted.push(id),
    },
    credentialStore: {
      saveAccountCredentials: () => {
        throw new Error("磁盘不可写");
      },
    },
  });

  assert.throws(() => service.create({
    name: "测试账号",
    profileUrl: account().profileUrl,
    username: "13800000000",
    password: "secret",
  }), /磁盘不可写/);
  assert.deepEqual(deleted, [1]);
});

test("删除账号在数据库删除失败时恢复凭据", () => {
  const restored = [];
  const existing = account();
  const service = createAccountConfigurationService({
    accountsRepository: {
      findById: () => existing,
      delete: () => {
        throw new Error("数据库被锁定");
      },
    },
    credentialStore: {
      getAccountCredentials: () => ({
        loginMethod: "password",
        username: "13800000000",
        password: "secret",
        profileUrl: existing.profileUrl,
      }),
      deleteAccountCredentials: () => {},
      saveAccountCredentials: (savedAccount, credentials) => restored.push({ savedAccount, credentials }),
    },
  });

  assert.throws(() => service.delete(1), /数据库被锁定/);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].savedAccount.id, 1);
  assert.equal(restored[0].credentials.username, "13800000000");
});

test("密码登录必须提供账号和密码", () => {
  const service = createAccountConfigurationService({
    accountsRepository: {},
    credentialStore: {},
  });

  assert.throws(
    () => service.create({ loginMethod: "password" }),
    (error) => error.statusCode === 400,
  );
});

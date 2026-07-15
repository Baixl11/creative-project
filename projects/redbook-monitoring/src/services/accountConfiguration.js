function compensationError(error, rollbackError, action) {
  const combined = new Error(`${error.message}；${action}失败：${rollbackError.message}`);
  combined.statusCode = error.statusCode || 500;
  combined.cause = error;
  return combined;
}

export function createAccountConfigurationService({ accountsRepository, credentialStore }) {
  return {
    create(input = {}) {
      const loginMethod = input.loginMethod === "wechat" ? "wechat" : "password";
      const username = String(input.username || "").trim();
      const password = String(input.password || "");

      if (loginMethod === "password" && (!username || !password)) {
        throw Object.assign(new Error("手机号/密码登录需要填写账号和密码"), { statusCode: 400 });
      }

      const account = accountsRepository.create({ ...input, loginMethod });

      try {
        credentialStore.saveAccountCredentials(account, {
          loginMethod,
          username,
          password,
          profileUrl: account.profileUrl,
        });
      } catch (error) {
        try {
          accountsRepository.delete(account.id);
        } catch (rollbackError) {
          throw compensationError(error, rollbackError, "账号数据库回滚");
        }
        throw error;
      }

      return account;
    },

    delete(id) {
      const account = accountsRepository.findById(id);
      if (!account) {
        throw Object.assign(new Error("账号不存在"), { statusCode: 404 });
      }

      const credentials = credentialStore.getAccountCredentials(account);
      credentialStore.deleteAccountCredentials(account);

      try {
        return accountsRepository.delete(id);
      } catch (error) {
        try {
          credentialStore.saveAccountCredentials(account, credentials);
        } catch (rollbackError) {
          throw compensationError(error, rollbackError, "账号凭据回滚");
        }
        throw error;
      }
    },
  };
}

import assert from "node:assert/strict";
import test from "node:test";

import { publicCollectionErrorMessage, sanitizeCollectionLogMessage } from "../src/errorSanitizer.js";
import { assertLocalHost, securityHeaders } from "../src/httpSecurity.js";

test("采集错误不暴露浏览器日志或本地路径", () => {
  const message = publicCollectionErrorMessage(new Error(
    "browserType.launch: Target page, context or browser has been closed\nBrowser logs:\n<launching> /Users/cyan/private/browser",
  ));

  assert.equal(message, "采集浏览器未能正常启动或已被关闭，请稍后重试");
  assert.equal(message.includes("/Users/"), false);
  assert.equal(sanitizeCollectionLogMessage("失败：/private/tmp/session.json"), "失败：[本地路径]");
});

test("HTTP 安全策略包含关键响应头", () => {
  assert.match(securityHeaders["Content-Security-Policy"], /default-src 'self'/);
  assert.equal(securityHeaders["X-Content-Type-Options"], "nosniff");
  assert.equal(securityHeaders["X-Frame-Options"], "DENY");
});

test("默认拒绝监听非本机地址", () => {
  assert.doesNotThrow(() => assertLocalHost("127.0.0.1"));
  assert.throws(() => assertLocalHost("0.0.0.0"), /仅允许监听本机地址/);
  assert.doesNotThrow(() => assertLocalHost("0.0.0.0", true));
});

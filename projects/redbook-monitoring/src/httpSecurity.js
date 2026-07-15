export const securityHeaders = Object.freeze({
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
  ].join("; "),
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
});

export function applySecurityHeaders(app) {
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    for (const [name, value] of Object.entries(securityHeaders)) {
      response.setHeader(name, value);
    }
    next();
  });
}

export function assertLocalHost(host, allowRemoteAccess = false) {
  const normalized = String(host || "").trim().toLowerCase();
  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);

  if (!allowRemoteAccess && !localHosts.has(normalized)) {
    throw new Error("默认仅允许监听本机地址；如确需局域网访问，请显式设置 ALLOW_REMOTE_ACCESS=true");
  }
}

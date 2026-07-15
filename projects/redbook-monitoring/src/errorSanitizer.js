const browserClosedPatterns = [
  /target page, context or browser has been closed/i,
  /browser has been closed/i,
  /browserType\.launch/i,
  /executable doesn't exist/i,
];

const authPatterns = [
  /登录态.*失效/i,
  /session.*(?:expired|invalid)/i,
  /unauthorized/i,
];

function singleLine(value) {
  return String(value || "")
    .replace(/Browser logs:[\s\S]*/i, "")
    .replace(/<launching>[\s\S]*/i, "")
    .replace(/(?:file:\/\/)?\/(?:Users|private|var|tmp)\/[^\s,;，；]+/g, "[本地路径]")
    .replace(/\s+/g, " ")
    .trim();
}

export function publicCollectionErrorMessage(error) {
  const message = singleLine(error?.message || error || "");

  if (authPatterns.some((pattern) => pattern.test(message))) {
    return "登录态已失效，请重新授权后再采集";
  }

  if (browserClosedPatterns.some((pattern) => pattern.test(message))) {
    return "采集浏览器未能正常启动或已被关闭，请稍后重试";
  }

  if (!message) {
    return "采集失败，请稍后重试";
  }

  return message.slice(0, 240);
}

export function sanitizeCollectionLogMessage(message) {
  const text = singleLine(message);
  return (text || "采集状态暂不可用").slice(0, 500);
}

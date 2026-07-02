import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { config } from "../src/config.js";
import { createDashboardRepository } from "../src/repositories/dashboard.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function localToday() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Shanghai",
  });
}

function shiftDate(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

assert(fs.existsSync(config.databasePath), "SQLite 数据库不存在");

const db = new DatabaseSync(config.databasePath, { readOnly: true });
const range = createDashboardRepository(db).dateRange();
const customRange = createDashboardRepository(db).dateRange({
  startDate: "2026-06-10",
  endDate: "2026-06-20",
});
const today = localToday();
const expectedStart = shiftDate(today, -29);
const appSource = fs.readFileSync(new URL("../assets/app.js", import.meta.url), "utf8");

assert(range.defaultEndDate === today, `默认结束日应为 ${today}，实际为 ${range.defaultEndDate}`);
assert(range.defaultStartDate === expectedStart, `默认开始日应为 ${expectedStart}，实际为 ${range.defaultStartDate}`);
assert(range.days === 30, `默认区间应为 30 天，实际为 ${range.days} 天`);
assert(customRange.startDate === "2026-06-10", "自定义开始日未保持");
assert(customRange.endDate === "2026-06-20", "自定义结束日未保持");
assert(customRange.days === 11, `自定义区间应为 11 天，实际为 ${customRange.days} 天`);
assert(appSource.includes("window.sessionStorage.getItem(dateRangeStorageKey)"), "自定义日期未使用 sessionStorage 读取");
assert(appSource.includes("window.sessionStorage.setItem(dateRangeStorageKey"), "自定义日期未使用 sessionStorage 保存");
assert(!appSource.includes("window.localStorage.getItem(dateRangeStorageKey)"), "仍在从 localStorage 读取持久化日期");
assert(!appSource.includes("window.localStorage.setItem(dateRangeStorageKey"), "仍在向 localStorage 保存持久化日期");
assert(appSource.includes("function refreshRollingDefaultDateRange()"), "缺少跨日滚动默认范围逻辑");
assert(appSource.includes("refreshRollingDefaultDateRange();\n    refreshScopedSections()"), "采集完成后未刷新滚动日期范围");
assert(appSource.includes("selectedDateRangeIsCustom = true"), "用户自定义范围未标记为会话内固定");

db.close();

console.log(JSON.stringify({
  status: "ok",
  defaultRange: {
    startDate: range.defaultStartDate,
    endDate: range.defaultEndDate,
    days: range.days,
  },
  customRangeStorage: "sessionStorage",
}, null, 2));

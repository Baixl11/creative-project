import assert from "node:assert/strict";

import { createCollectionScheduler, nextScheduledRunAt, scheduleLabel } from "../src/scheduler.js";
import { normalizeSchedulerSettings } from "../src/repositories/schedulerSettings.js";

function localDate(year, month, day, hour, minute) {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

assert.equal(
  nextScheduledRunAt(localDate(2026, 6, 30, 9, 10), { frequency: "daily", time: "09:15", weekday: 1, monthDay: 1 }).getTime(),
  localDate(2026, 6, 30, 9, 15).getTime(),
  "每天计划应精确到分钟",
);
assert.equal(
  nextScheduledRunAt(localDate(2026, 6, 30, 9, 16), { frequency: "daily", time: "09:15", weekday: 1, monthDay: 1 }).getTime(),
  localDate(2026, 7, 1, 9, 15).getTime(),
  "错过当日时间后应排到次日",
);
assert.equal(
  nextScheduledRunAt(localDate(2026, 6, 30, 11, 0), { frequency: "weekly", time: "10:30", weekday: 2, monthDay: 1 }).getTime(),
  localDate(2026, 7, 7, 10, 30).getTime(),
  "错过当周执行时间后应排到下周",
);
assert.equal(
  nextScheduledRunAt(localDate(2026, 4, 29, 12, 0), { frequency: "monthly", time: "10:00", weekday: 1, monthDay: 31 }).getTime(),
  localDate(2026, 4, 30, 10, 0).getTime(),
  "每月 31 日在小月应取当月最后一天",
);
assert.equal(scheduleLabel({ frequency: "weekly", time: "08:05", weekday: 3, monthDay: 1 }), "每周三 08:05");
assert.equal(scheduleLabel({ frequency: "monthly", time: "18:45", weekday: 1, monthDay: 15 }), "每月 15 日 18:45");
assert.throws(
  () => normalizeSchedulerSettings({ frequency: "yearly", time: "10:00", weekday: 1, monthDay: 1 }),
  /采集周期/,
  "非法周期应被拒绝",
);
assert.throws(
  () => normalizeSchedulerSettings({ frequency: "daily", time: "25:00", weekday: 1, monthDay: 1 }),
  /时间格式/,
  "非法时间应被拒绝",
);

let storedSchedule = { frequency: "daily", time: "10:00", weekday: 1, monthDay: 1 };
const scheduler = createCollectionScheduler({
  accountsRepository: { list: () => [] },
  collectionDataRepository: { saveCollectedData: () => {} },
  collectAccount: async () => ({}),
  dashboardRepository: { createCollectionLog: (input) => input },
  scheduleRepository: {
    get: () => storedSchedule,
    update: (input) => {
      storedSchedule = normalizeSchedulerSettings(input, storedSchedule);
      return storedSchedule;
    },
  },
  listSessions: () => [],
});

const updatedStatus = scheduler.updateSchedule({
  frequency: "weekly",
  time: "16:25",
  weekday: 5,
  monthDay: 1,
});
assert.equal(updatedStatus.time, "每周五 16:25", "更新后状态应立即反映新计划");
assert.deepEqual(updatedStatus.schedule, storedSchedule, "状态中应返回已保存计划");

console.log(JSON.stringify({
  ok: true,
  labels: ["每天 09:15", "每周五 16:25", "每月 15 日 18:45"],
  updatedSchedule: storedSchedule,
}, null, 2));

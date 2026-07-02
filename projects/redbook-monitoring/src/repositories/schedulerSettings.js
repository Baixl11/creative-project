const frequencies = new Set(["daily", "weekly", "monthly"]);
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const defaultSchedulerSettings = Object.freeze({
  frequency: "daily",
  time: "10:00",
  weekday: 1,
  monthDay: 1,
});

function integerInRange(value, min, max, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw Object.assign(new Error(`${fieldName}超出允许范围`), { statusCode: 400 });
  }
  return number;
}

export function normalizeSchedulerSettings(input = {}, fallback = defaultSchedulerSettings) {
  const frequency = String(input.frequency ?? fallback.frequency);
  const time = String(input.time ?? fallback.time);

  if (!frequencies.has(frequency)) {
    throw Object.assign(new Error("采集周期仅支持每天、每周或每月"), { statusCode: 400 });
  }
  if (!timePattern.test(time)) {
    throw Object.assign(new Error("采集时间格式应为 HH:mm"), { statusCode: 400 });
  }

  return {
    frequency,
    time,
    weekday: integerInRange(input.weekday ?? fallback.weekday, 1, 7, "星期"),
    monthDay: integerInRange(input.monthDay ?? fallback.monthDay, 1, 31, "每月日期"),
  };
}

function mapRow(row = {}) {
  return {
    frequency: row.frequency,
    time: row.run_time,
    weekday: Number(row.weekday),
    monthDay: Number(row.month_day),
    updatedAt: row.updated_at || null,
  };
}

export function createSchedulerSettingsRepository(db) {
  function get() {
    const row = db.prepare(`
      SELECT frequency, run_time, weekday, month_day, updated_at
      FROM scheduler_settings
      WHERE id = 1
    `).get();

    return row ? mapRow(row) : { ...defaultSchedulerSettings, updatedAt: null };
  }

  function update(input = {}) {
    const settings = normalizeSchedulerSettings(input, get());
    db.prepare(`
      INSERT INTO scheduler_settings (id, frequency, run_time, weekday, month_day, updated_at)
      VALUES (1, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        frequency = excluded.frequency,
        run_time = excluded.run_time,
        weekday = excluded.weekday,
        month_day = excluded.month_day,
        updated_at = datetime('now')
    `).run(settings.frequency, settings.time, settings.weekday, settings.monthDay);

    return get();
  }

  return { get, update };
}

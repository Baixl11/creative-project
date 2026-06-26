const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value) {
  const text = String(value || "").trim();
  return datePattern.test(text) ? text : "";
}

function localToday() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Shanghai",
  });
}

function dateFromString(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dateToString(value) {
  return value.toISOString().slice(0, 10);
}

function shiftDate(value, days) {
  const date = dateFromString(value);
  date.setUTCDate(date.getUTCDate() + days);
  return dateToString(date);
}

function daysBetween(startDate, endDate) {
  const start = dateFromString(startDate);
  const end = dateFromString(endDate);
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function metricPeriodForRange(range) {
  return daysBetween(range.startDate, range.endDate) <= 7 ? "seven" : "thirty";
}

function maxDate(left, right) {
  if (!left) {
    return right || "";
  }
  if (!right) {
    return left;
  }
  return left > right ? left : right;
}

function minDate(left, right) {
  if (!left) {
    return right || "";
  }
  if (!right) {
    return left;
  }
  return left < right ? left : right;
}

function dateBounds(db) {
  const metricRow = db.prepare(`
    SELECT
      MIN(metric_date) AS min_date,
      MAX(metric_date) AS max_date
    FROM account_daily_metrics
  `).get();
  const noteRow = db.prepare(`
    SELECT
      MIN(published_at) AS min_date,
      MAX(published_at) AS max_date
    FROM notes
  `).get();
  const maxMetricDate = normalizeDate(metricRow?.max_date);
  const maxNoteDate = normalizeDate(noteRow?.max_date);
  const minMetricDate = normalizeDate(metricRow?.min_date);
  const minNoteDate = normalizeDate(noteRow?.min_date);
  const defaultEndDate = maxMetricDate || maxNoteDate || localToday();
  const minAvailableDate = minDate(minMetricDate, minNoteDate) || shiftDate(defaultEndDate, -6);
  const maxAvailableDate = maxDate(maxMetricDate, maxNoteDate) || defaultEndDate;

  return {
    minDate: minAvailableDate,
    maxDate: maxAvailableDate,
    defaultStartDate: shiftDate(defaultEndDate, -6),
    defaultEndDate,
  };
}

function resolveDateRange(db, options = {}) {
  const bounds = dateBounds(db);
  let startDate = normalizeDate(options.startDate) || bounds.defaultStartDate;
  let endDate = normalizeDate(options.endDate) || bounds.defaultEndDate;

  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  return {
    ...bounds,
    startDate,
    endDate,
    days: daysBetween(startDate, endDate),
  };
}

function zeroMetrics() {
  return {
    reads: 0,
    impressions: 0,
    likes: 0,
    collections: 0,
    comments: 0,
    profile_views: 0,
    follower_delta: 0,
  };
}

function numberValue(value) {
  return Number(value || 0);
}

function metricTotals(rows) {
  return rows.reduce((totals, row) => {
    totals.followers += numberValue(row.followers);
    totals.reads += numberValue(row.reads);
    totals.impressions += numberValue(row.impressions);
    totals.likes += numberValue(row.likes);
    totals.collections += numberValue(row.collections);
    totals.comments += numberValue(row.comments);
    totals.profile_views += numberValue(row.profile_views);
    totals.follower_delta += numberValue(row.follower_delta);
    totals.read_delta += numberValue(row.read_delta);
    totals.impression_delta += numberValue(row.impression_delta);
    totals.like_delta += numberValue(row.like_delta);
    totals.collection_delta += numberValue(row.collection_delta);
    totals.comment_delta += numberValue(row.comment_delta);
    totals.profile_view_delta += numberValue(row.profile_view_delta);
    totals.daily_metric_date = maxDate(totals.daily_metric_date, row.daily_metric_date);
    return totals;
  }, {
    account_count: rows.length,
    followers: 0,
    reads: 0,
    impressions: 0,
    likes: 0,
    collections: 0,
    comments: 0,
    profile_views: 0,
    follower_delta: 0,
    read_delta: 0,
    impression_delta: 0,
    like_delta: 0,
    collection_delta: 0,
    comment_delta: 0,
    profile_view_delta: 0,
    metric_period: "custom",
    period_start: rows[0]?.period_start || "",
    period_end: rows[0]?.period_end || "",
    daily_metric_date: "",
    source_name: "account_daily_metrics",
  });
}

export function createDashboardRepository(db) {
  return {
    dateRange(options = {}) {
      return resolveDateRange(db, options);
    },

    overview(options = {}) {
      const range = resolveDateRange(db, options);
      const period = metricPeriodForRange(range);
      const latestSnapshots = db.prepare(`
        SELECT
          accounts.id,
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS name,
          accounts.name AS configured_name,
          accounts.xhs_name,
          accounts.xhs_account_id,
          accounts.status,
          account_snapshots.captured_at,
          COALESCE(account_snapshots.followers, 0) AS followers
        FROM accounts
        LEFT JOIN account_snapshots ON account_snapshots.id = (
          SELECT id
          FROM account_snapshots latest
          WHERE latest.account_id = accounts.id
          ORDER BY latest.captured_at DESC, latest.id DESC
          LIMIT 1
        )
        ORDER BY accounts.is_default DESC, accounts.id ASC
      `).all();

      const rangeMetrics = db.prepare(`
        SELECT
          account_id,
          SUM(reads) AS reads,
          SUM(impressions) AS impressions,
          SUM(likes) AS likes,
          SUM(collections) AS collections,
          SUM(comments) AS comments,
          SUM(profile_views) AS profile_views,
          SUM(follower_delta) AS period_follower_delta,
          MIN(metric_date) AS first_metric_date,
          MAX(metric_date) AS latest_metric_date,
          MAX(NULLIF(source_name, '')) AS source_name
        FROM account_daily_metrics
        WHERE metric_period = ?
          AND metric_date BETWEEN ? AND ?
        GROUP BY account_id
      `).all(period, range.startDate, range.endDate);

      const latestDailyMetrics = db.prepare(`
        WITH latest_dates AS (
          SELECT account_id, MAX(metric_date) AS metric_date
          FROM account_daily_metrics
          WHERE metric_period = ?
            AND metric_date BETWEEN ? AND ?
          GROUP BY account_id
        )
        SELECT
          account_daily_metrics.account_id,
          account_daily_metrics.metric_date,
          SUM(reads) AS read_delta,
          SUM(impressions) AS impression_delta,
          SUM(likes) AS like_delta,
          SUM(collections) AS collection_delta,
          SUM(comments) AS comment_delta,
          SUM(profile_views) AS profile_view_delta,
          SUM(follower_delta) AS follower_delta
        FROM account_daily_metrics
        JOIN latest_dates
          ON latest_dates.account_id = account_daily_metrics.account_id
          AND latest_dates.metric_date = account_daily_metrics.metric_date
        WHERE account_daily_metrics.metric_period = ?
        GROUP BY account_daily_metrics.account_id, account_daily_metrics.metric_date
      `).all(period, range.startDate, range.endDate, period);

      const rangeByAccount = new Map(rangeMetrics.map((row) => [Number(row.account_id), row]));
      const latestByAccount = new Map(latestDailyMetrics.map((row) => [Number(row.account_id), row]));
      const accounts = latestSnapshots.map((account) => {
        const aggregate = rangeByAccount.get(Number(account.id)) || zeroMetrics();
        const latest = latestByAccount.get(Number(account.id)) || {};

        return {
          ...account,
          reads: numberValue(aggregate.reads),
          impressions: numberValue(aggregate.impressions),
          likes: numberValue(aggregate.likes),
          collections: numberValue(aggregate.collections),
          comments: numberValue(aggregate.comments),
          profile_views: numberValue(aggregate.profile_views),
          period_follower_delta: numberValue(aggregate.period_follower_delta),
          follower_delta: numberValue(latest.follower_delta),
          read_delta: numberValue(latest.read_delta),
          impression_delta: numberValue(latest.impression_delta),
          like_delta: numberValue(latest.like_delta),
          collection_delta: numberValue(latest.collection_delta),
          comment_delta: numberValue(latest.comment_delta),
          profile_view_delta: numberValue(latest.profile_view_delta),
          metric_period: "custom",
          metric_source_period: period,
          period_start: range.startDate,
          period_end: range.endDate,
          daily_metric_date: latest.metric_date || "",
          source_name: aggregate.source_name || "account_daily_metrics",
        };
      });
      const totals = metricTotals(accounts);
      totals.period_start = range.startDate;
      totals.period_end = range.endDate;
      totals.metric_source_period = period;

      return { totals, accounts, dateRange: range };
    },

    notes(options = {}) {
      const range = resolveDateRange(db, options);
      return db.prepare(`
        SELECT
          notes.id,
          notes.account_id,
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS account_name,
          accounts.xhs_account_id AS account_xhs_id,
          notes.title,
          notes.type,
          notes.topic,
          notes.published_at,
          note_snapshots.captured_at AS metrics_captured_at,
          note_snapshots.source_name AS metrics_source_name,
          CASE WHEN COALESCE(note_snapshots.reads_available, 1) = 1 THEN note_snapshots.reads ELSE NULL END AS reads,
          CASE WHEN COALESCE(note_snapshots.impressions_available, 1) = 1 THEN note_snapshots.impressions ELSE NULL END AS impressions,
          CASE WHEN COALESCE(note_snapshots.likes_available, 1) = 1 THEN note_snapshots.likes ELSE NULL END AS likes,
          CASE WHEN COALESCE(note_snapshots.collections_available, 1) = 1 THEN note_snapshots.collections ELSE NULL END AS collections,
          CASE WHEN COALESCE(note_snapshots.comments_available, 1) = 1 THEN note_snapshots.comments ELSE NULL END AS comments,
          CASE WHEN COALESCE(note_snapshots.follower_delta_available, 1) = 1 THEN note_snapshots.follower_delta ELSE NULL END AS follower_delta,
          note_snapshots.read_delta,
          note_snapshots.impression_delta
        FROM notes
        JOIN accounts ON accounts.id = notes.account_id
        LEFT JOIN note_snapshots ON note_snapshots.id = (
          SELECT id
          FROM note_snapshots latest
          WHERE latest.note_id = notes.id
            AND latest.metrics_available = 1
          ORDER BY latest.captured_at DESC, latest.id DESC
          LIMIT 1
        )
        WHERE notes.published_at BETWEEN ? AND ?
        ORDER BY notes.published_at DESC, notes.id DESC
      `).all(range.startDate, range.endDate);
    },

    noteCoverage(options = {}) {
      const range = resolveDateRange(db, options);
      return {
        dateRange: range,
        accounts: db.prepare(`
          SELECT
            accounts.id AS account_id,
            COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS account_name,
            accounts.xhs_account_id,
            COUNT(notes.id) AS total_note_count,
            SUM(CASE WHEN notes.published_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS range_note_count,
            MIN(notes.published_at) AS first_published_at,
            MAX(notes.published_at) AS last_published_at,
            MIN(CASE WHEN notes.published_at BETWEEN ? AND ? THEN notes.published_at END) AS range_first_published_at,
            MAX(CASE WHEN notes.published_at BETWEEN ? AND ? THEN notes.published_at END) AS range_last_published_at
          FROM accounts
          LEFT JOIN notes ON notes.account_id = accounts.id
          GROUP BY accounts.id
          ORDER BY accounts.is_default DESC, accounts.id ASC
        `).all(
          range.startDate,
          range.endDate,
          range.startDate,
          range.endDate,
          range.startDate,
          range.endDate,
        ),
      };
    },

    trends({ startDate = "", endDate = "", days = 7, metricPeriod = "seven", accountId = null } = {}) {
      const hasExplicitRange = normalizeDate(startDate) || normalizeDate(endDate);
      const range = hasExplicitRange
        ? resolveDateRange(db, { startDate, endDate })
        : resolveDateRange(db, {
          startDate: shiftDate(dateBounds(db).defaultEndDate, -(Math.max(1, Math.min(Number(days) || 7, 90)) - 1)),
          endDate: dateBounds(db).defaultEndDate,
        });
      const period = hasExplicitRange
        ? metricPeriodForRange(range)
        : (metricPeriod === "thirty" ? "thirty" : "seven");
      const accountFilter = accountId ? "AND account_id = ?" : "";
      const seriesParams = accountId
        ? [period, range.startDate, range.endDate, accountId]
        : [period, range.startDate, range.endDate];
      const series = db.prepare(`
        SELECT
          metric_date,
          SUM(reads) AS reads,
          SUM(impressions) AS impressions,
          SUM(likes) AS likes,
          SUM(collections) AS collections,
          SUM(comments) AS comments,
          SUM(profile_views) AS profile_views,
          SUM(follower_delta) AS follower_delta,
          SUM(likes + collections + comments) AS interactions
        FROM account_daily_metrics
        WHERE metric_period = ?
          AND metric_date BETWEEN ? AND ?
          ${accountFilter}
        GROUP BY metric_date
        ORDER BY metric_date ASC
      `).all(...seriesParams);

      return {
        metricPeriod: period,
        days: range.days,
        startDate: range.startDate,
        endDate: range.endDate,
        accountId,
        series,
      };
    },

    collectionLogs(options = {}) {
      const limitValue = Number(options.limit || 5);
      const limit = Number.isFinite(limitValue)
        ? Math.min(Math.max(Math.trunc(limitValue), 1), 50)
        : 5;
      const startDate = normalizeDate(options.startDate);
      const endDate = normalizeDate(options.endDate);
      const filterStart = startDate && endDate ? minDate(startDate, endDate) : "";
      const filterEnd = startDate && endDate ? maxDate(startDate, endDate) : "";
      const where = filterStart && filterEnd
        ? "WHERE date(collection_logs.created_at, 'localtime') BETWEEN ? AND ?"
        : "";
      const params = filterStart && filterEnd ? [filterStart, filterEnd, limit] : [limit];

      return db.prepare(`
        SELECT
          collection_logs.id,
          collection_logs.account_id,
          collection_logs.level,
          collection_logs.event_type,
          collection_logs.message,
          collection_logs.created_at,
          datetime(collection_logs.created_at, 'localtime') AS created_at_local,
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS account_name,
          accounts.xhs_account_id AS account_xhs_id
        FROM collection_logs
        LEFT JOIN accounts ON accounts.id = collection_logs.account_id
        ${where}
        ORDER BY collection_logs.id DESC
        LIMIT ?
      `).all(...params);
    },

    createCollectionLog({ accountId = null, level = "success", eventType, message }) {
      const result = db.prepare(`
        INSERT INTO collection_logs (account_id, level, event_type, message)
        VALUES (?, ?, ?, ?)
      `).run(accountId, level, eventType, message);

      return db.prepare(`
        SELECT
          collection_logs.id,
          collection_logs.level,
          collection_logs.event_type,
          collection_logs.message,
          collection_logs.created_at,
          datetime(collection_logs.created_at, 'localtime') AS created_at_local,
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS account_name,
          accounts.xhs_account_id AS account_xhs_id
        FROM collection_logs
        LEFT JOIN accounts ON accounts.id = collection_logs.account_id
        WHERE collection_logs.id = ?
      `).get(result.lastInsertRowid);
    },
  };
}

export function createDashboardRepository(db) {
  return {
    overview() {
      const totals = db.prepare(`
        SELECT
          COUNT(DISTINCT accounts.id) AS account_count,
          SUM(account_snapshots.followers) AS followers,
          SUM(account_snapshots.reads) AS reads,
          SUM(account_snapshots.impressions) AS impressions,
          SUM(account_snapshots.likes) AS likes,
          SUM(account_snapshots.collections) AS collections,
          SUM(account_snapshots.comments) AS comments,
          SUM(account_snapshots.profile_views) AS profile_views,
          SUM(account_snapshots.follower_delta) AS follower_delta,
          SUM(account_snapshots.read_delta) AS read_delta,
          SUM(account_snapshots.impression_delta) AS impression_delta,
          SUM(account_snapshots.like_delta) AS like_delta,
          SUM(account_snapshots.collection_delta) AS collection_delta,
          SUM(account_snapshots.comment_delta) AS comment_delta,
          SUM(account_snapshots.profile_view_delta) AS profile_view_delta,
          MAX(account_snapshots.metric_period) AS metric_period,
          MIN(NULLIF(account_snapshots.period_start, '')) AS period_start,
          MAX(NULLIF(account_snapshots.period_end, '')) AS period_end,
          MAX(NULLIF(account_snapshots.daily_metric_date, '')) AS daily_metric_date,
          MAX(NULLIF(account_snapshots.source_name, '')) AS source_name
        FROM accounts
        JOIN account_snapshots ON account_snapshots.id = (
          SELECT id
          FROM account_snapshots latest
          WHERE latest.account_id = accounts.id
          ORDER BY latest.captured_at DESC, latest.id DESC
          LIMIT 1
        )
      `).get();

      const accounts = db.prepare(`
        SELECT
          accounts.id,
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS name,
          accounts.name AS configured_name,
          accounts.xhs_name,
          accounts.xhs_account_id,
          accounts.status,
          account_snapshots.captured_at,
          account_snapshots.followers,
          account_snapshots.reads,
          account_snapshots.impressions,
          account_snapshots.likes,
          account_snapshots.collections,
          account_snapshots.comments,
          account_snapshots.profile_views,
          account_snapshots.follower_delta,
          account_snapshots.read_delta,
          account_snapshots.impression_delta,
          account_snapshots.like_delta,
          account_snapshots.collection_delta,
          account_snapshots.comment_delta,
          account_snapshots.profile_view_delta,
          account_snapshots.metric_period,
          account_snapshots.period_start,
          account_snapshots.period_end,
          account_snapshots.daily_metric_date,
          account_snapshots.source_name
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

      return { totals, accounts };
    },

    notes() {
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
        ORDER BY notes.published_at DESC, notes.id DESC
      `).all();
    },

    trends({ days = 7, metricPeriod = "seven", accountId = null } = {}) {
      const limit = Math.max(1, Math.min(Number(days) || 7, 90));
      const period = metricPeriod === "thirty" ? "thirty" : "seven";
      const accountFilter = accountId ? "AND account_id = ?" : "";
      const dateParams = accountId ? [period, accountId, limit] : [period, limit];
      const dates = db.prepare(`
        SELECT metric_date
        FROM account_daily_metrics
        WHERE metric_period = ?
          ${accountFilter}
        GROUP BY metric_date
        ORDER BY metric_date DESC
        LIMIT ?
      `).all(...dateParams)
        .map((row) => row.metric_date)
        .reverse();

      if (!dates.length) {
        return {
          metricPeriod: period,
          days: limit,
          accountId,
          series: [],
        };
      }

      const placeholders = dates.map(() => "?").join(", ");
      const seriesParams = accountId
        ? [period, accountId, ...dates]
        : [period, ...dates];
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
          ${accountFilter}
          AND metric_date IN (${placeholders})
        GROUP BY metric_date
        ORDER BY metric_date ASC
      `).all(...seriesParams);

      return {
        metricPeriod: period,
        days: limit,
        accountId,
        series,
      };
    },

    collectionLogs() {
      return db.prepare(`
        SELECT
          collection_logs.id,
          collection_logs.account_id,
          collection_logs.level,
          collection_logs.event_type,
          collection_logs.message,
          collection_logs.created_at,
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS account_name,
          accounts.xhs_account_id AS account_xhs_id
        FROM collection_logs
        LEFT JOIN accounts ON accounts.id = collection_logs.account_id
        ORDER BY collection_logs.id DESC
        LIMIT 20
      `).all();
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
          COALESCE(NULLIF(accounts.xhs_name, ''), accounts.name) AS account_name,
          accounts.xhs_account_id AS account_xhs_id
        FROM collection_logs
        LEFT JOIN accounts ON accounts.id = collection_logs.account_id
        WHERE collection_logs.id = ?
      `).get(result.lastInsertRowid);
    },
  };
}

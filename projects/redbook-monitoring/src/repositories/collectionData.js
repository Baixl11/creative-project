function value(input, key) {
  return Number(input?.[key] || 0);
}

export function createCollectionDataRepository(db) {
  return {
    saveCollectedData(accountId, collectedData) {
      const snapshot = collectedData.accountSnapshot || {};
      const profile = collectedData.profile || {};
      const capturedAt = collectedData.capturedAt;

      if (profile.xhsName || profile.xhsAccountId) {
        db.prepare(`
          UPDATE accounts
          SET
            xhs_name = COALESCE(NULLIF(?, ''), xhs_name),
            xhs_account_id = COALESCE(NULLIF(?, ''), xhs_account_id),
            status = 'active',
            updated_at = datetime('now')
          WHERE id = ?
        `).run(profile.xhsName || "", profile.xhsAccountId || "", accountId);
      }

      db.prepare(`
        INSERT INTO account_snapshots (
          account_id, captured_at, followers, reads, impressions, likes, collections,
          comments, profile_views, follower_delta, read_delta, impression_delta,
          like_delta, collection_delta, comment_delta, profile_view_delta,
          metric_period, period_start, period_end, daily_metric_date, source_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        accountId,
        capturedAt,
        value(snapshot, "followers"),
        value(snapshot, "reads"),
        value(snapshot, "impressions"),
        value(snapshot, "likes"),
        value(snapshot, "collections"),
        value(snapshot, "comments"),
        value(snapshot, "profileViews"),
        value(snapshot, "followerDelta"),
        value(snapshot, "readDelta"),
        value(snapshot, "impressionDelta"),
        value(snapshot, "likeDelta"),
        value(snapshot, "collectionDelta"),
        value(snapshot, "commentDelta"),
        value(snapshot, "profileViewDelta"),
        snapshot.metricPeriod || "",
        snapshot.periodStart || "",
        snapshot.periodEnd || "",
        snapshot.dailyMetricDate || "",
        snapshot.sourceName || "",
      );

      this.saveDailyMetrics(accountId, capturedAt, collectedData.dailyMetrics || []);

      const noteSnapshots = collectedData.noteSnapshots?.length
        ? collectedData.noteSnapshots
        : (collectedData.latestNoteSnapshot ? [collectedData.latestNoteSnapshot] : []);

      if (noteSnapshots.length) {
        db.prepare(`
          DELETE FROM notes
          WHERE account_id = ? AND source_note_id IS NULL
        `).run(accountId);
        noteSnapshots.forEach((note) => {
          this.saveNote(accountId, capturedAt, note);
        });
      }
    },

    saveDailyMetrics(accountId, capturedAt, dailyMetrics) {
      if (!dailyMetrics.length) {
        return;
      }

      const saveMetric = db.prepare(`
        INSERT INTO account_daily_metrics (
          account_id, metric_date, metric_period, captured_at, reads, impressions,
          likes, collections, comments, profile_views, follower_delta, source_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(account_id, metric_date, metric_period, source_name)
        DO UPDATE SET
          captured_at = excluded.captured_at,
          reads = excluded.reads,
          impressions = excluded.impressions,
          likes = excluded.likes,
          collections = excluded.collections,
          comments = excluded.comments,
          profile_views = excluded.profile_views,
          follower_delta = excluded.follower_delta
      `);

      dailyMetrics.filter((metric) => metric.metricDate).forEach((metric) => {
        saveMetric.run(
          accountId,
          metric.metricDate,
          metric.metricPeriod || "seven",
          capturedAt,
          value(metric, "reads"),
          value(metric, "impressions"),
          value(metric, "likes"),
          value(metric, "collections"),
          value(metric, "comments"),
          value(metric, "profileViews"),
          value(metric, "followerDelta"),
          metric.sourceName || "",
        );
      });
    },

    saveNote(accountId, capturedAt, note) {
      const existing = db.prepare(`
        SELECT id
        FROM notes
        WHERE account_id = ? AND source_note_id = ?
      `).get(accountId, note.sourceNoteId);

      let noteId = existing?.id;
      if (noteId) {
        db.prepare(`
          UPDATE notes
          SET title = ?, type = ?, topic = ?, published_at = ?, source_link = ?
          WHERE id = ?
        `).run(note.title, note.type, note.topic, note.publishedAt, note.sourceLink, noteId);
      } else {
        const result = db.prepare(`
          INSERT INTO notes (account_id, source_note_id, source_link, title, type, topic, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(accountId, note.sourceNoteId, note.sourceLink, note.title, note.type, note.topic, note.publishedAt);
        noteId = Number(result.lastInsertRowid);
      }

      if (note.metricsAvailable === false) {
        return;
      }

      db.prepare(`
        INSERT INTO note_snapshots (
          note_id, captured_at, reads, impressions, likes, collections, comments,
          follower_delta, read_delta, impression_delta, metrics_available, source_name,
          reads_available, impressions_available, likes_available, collections_available,
          comments_available, follower_delta_available
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        noteId,
        capturedAt,
        value(note, "reads"),
        value(note, "impressions"),
        value(note, "likes"),
        value(note, "collections"),
        value(note, "comments"),
        value(note, "followerDelta"),
        value(note, "readDelta"),
        value(note, "impressionDelta"),
        1,
        note.sourceName || "",
        note.readsAvailable === false ? 0 : 1,
        note.impressionsAvailable === false ? 0 : 1,
        note.likesAvailable === false ? 0 : 1,
        note.collectionsAvailable === false ? 0 : 1,
        note.commentsAvailable === false ? 0 : 1,
        note.followerDeltaAvailable === false ? 0 : 1,
      );
    },

    saveLatestNote(accountId, capturedAt, note) {
      this.saveNote(accountId, capturedAt, note);
    },
  };
}

function value(input, key) {
  return Number(input?.[key] || 0);
}

function noteSnapshotsFromData(collectedData) {
  return collectedData.noteSnapshots?.length
    ? collectedData.noteSnapshots
    : (collectedData.latestNoteSnapshot ? [collectedData.latestNoteSnapshot] : []);
}

function assertNonNegative(record, keys, label) {
  keys.forEach((key) => {
    if (value(record, key) < 0) {
      throw new Error(`${label}${key}不能为负数`);
    }
  });
}

function validateCollectedData(collectedData) {
  const snapshot = collectedData.accountSnapshot || {};
  const notes = noteSnapshotsFromData(collectedData);
  const dailyMetrics = (collectedData.dailyMetrics || []).filter((metric) => metric.metricDate);
  const sourceNoteIds = notes.map((note) => String(note.sourceNoteId || ""));
  const dailyKeys = dailyMetrics.map((metric) => [
    metric.metricDate,
    metric.metricPeriod || "seven",
    metric.sourceName || "",
  ].join("|"));

  if (!collectedData.capturedAt) {
    throw new Error("采集时间缺失");
  }
  if (!collectedData.profile?.xhsAccountId) {
    throw new Error("已登录账号 ID 缺失");
  }
  if (!snapshot.sourceName || !snapshot.metricPeriod) {
    throw new Error("账号指标来源或周期缺失");
  }
  if (sourceNoteIds.some((id) => !id)) {
    throw new Error("存在缺少笔记 ID 的采集记录");
  }
  if (new Set(sourceNoteIds).size !== sourceNoteIds.length) {
    throw new Error("采集结果中存在重复笔记 ID");
  }
  if (new Set(dailyKeys).size !== dailyKeys.length) {
    throw new Error("采集结果中存在重复的按日指标");
  }

  const expectedRaw = collectedData.noteSync?.expectedCount;
  if (collectedData.noteSync?.complete && expectedRaw !== null && expectedRaw !== undefined) {
    const expectedCount = Number(expectedRaw);
    if (Number.isFinite(expectedCount) && expectedCount !== notes.length) {
      throw new Error(`笔记数量不完整：网站 ${expectedCount} 篇，采集 ${notes.length} 篇`);
    }
  }

  const countKeys = ["reads", "impressions", "likes", "collections", "comments", "profileViews"];
  assertNonNegative(snapshot, ["followers", ...countKeys], "账号快照 ");
  dailyMetrics.forEach((metric) => assertNonNegative(metric, countKeys, `日指标 ${metric.metricDate} `));
  notes.forEach((note) => assertNonNegative(
    note,
    ["reads", "impressions", "likes", "collections", "comments"],
    `笔记 ${note.sourceNoteId} `,
  ));

  return { dailyMetrics, notes, sourceNoteIds };
}

function compareValue(issues, actual, expected, label, numeric = true) {
  const left = numeric ? Number(actual || 0) : String(actual || "");
  const right = numeric ? Number(expected || 0) : String(expected || "");
  if (left !== right) {
    issues.push(`${label}：${left} != ${right}`);
  }
}

export function createCollectionDataRepository(db) {
  function saveDailyMetrics(accountId, capturedAt, dailyMetrics) {
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

    dailyMetrics.forEach((metric) => {
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
  }

  function saveNote(accountId, capturedAt, note) {
    const existing = db.prepare(`
      SELECT id FROM notes WHERE account_id = ? AND source_note_id = ?
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
  }

  function saveAudit(accountId, capturedAt, audit) {
    db.prepare(`
      INSERT INTO collection_audits (
        account_id, captured_at, status, source_note_count, stored_note_count,
        daily_metric_count, checked_field_count, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      accountId,
      capturedAt,
      audit.status,
      audit.sourceNoteCount || 0,
      audit.storedNoteCount || 0,
      audit.dailyMetricCount || 0,
      audit.checkedFieldCount || 0,
      audit.message,
    );
  }

  function auditCollectedData(accountId, collectedData, validated) {
    const issues = [];
    let checkedFieldCount = 0;
    const check = (actual, expected, label, numeric = true) => {
      checkedFieldCount += 1;
      compareValue(issues, actual, expected, label, numeric);
    };
    const snapshot = collectedData.accountSnapshot || {};
    const storedSnapshot = db.prepare(`
      SELECT * FROM account_snapshots
      WHERE account_id = ? AND captured_at = ?
      ORDER BY id DESC LIMIT 1
    `).get(accountId, collectedData.capturedAt);

    if (!storedSnapshot) {
      issues.push("账号快照未写入");
    } else {
      [
        ["followers", "followers"], ["reads", "reads"], ["impressions", "impressions"],
        ["likes", "likes"], ["collections", "collections"], ["comments", "comments"],
        ["profile_views", "profileViews"], ["follower_delta", "followerDelta"],
        ["read_delta", "readDelta"], ["impression_delta", "impressionDelta"],
        ["like_delta", "likeDelta"], ["collection_delta", "collectionDelta"],
        ["comment_delta", "commentDelta"], ["profile_view_delta", "profileViewDelta"],
      ].forEach(([column, key]) => check(storedSnapshot[column], snapshot[key], `账号.${key}`));
      check(storedSnapshot.metric_period, snapshot.metricPeriod, "账号.metricPeriod", false);
      check(storedSnapshot.daily_metric_date, snapshot.dailyMetricDate, "账号.dailyMetricDate", false);
      check(storedSnapshot.source_name, snapshot.sourceName, "账号.sourceName", false);
    }

    validated.dailyMetrics.forEach((metric) => {
      const stored = db.prepare(`
        SELECT * FROM account_daily_metrics
        WHERE account_id = ? AND metric_date = ? AND metric_period = ? AND source_name = ?
      `).get(accountId, metric.metricDate, metric.metricPeriod || "seven", metric.sourceName || "");
      if (!stored) {
        issues.push(`日指标 ${metric.metricDate}/${metric.metricPeriod} 未写入`);
        return;
      }
      [
        ["reads", "reads"], ["impressions", "impressions"], ["likes", "likes"],
        ["collections", "collections"], ["comments", "comments"], ["profile_views", "profileViews"],
        ["follower_delta", "followerDelta"],
      ].forEach(([column, key]) => check(stored[column], metric[key], `日指标 ${metric.metricDate}.${key}`));
    });

    validated.notes.forEach((note) => {
      const storedNote = db.prepare(`
        SELECT * FROM notes WHERE account_id = ? AND source_note_id = ?
      `).get(accountId, note.sourceNoteId);
      if (!storedNote) {
        issues.push(`笔记 ${note.sourceNoteId} 未写入`);
        return;
      }
      check(storedNote.title, note.title, `笔记 ${note.sourceNoteId}.title`, false);
      check(storedNote.published_at, note.publishedAt, `笔记 ${note.sourceNoteId}.publishedAt`, false);
      if (note.metricsAvailable === false) {
        return;
      }
      const storedMetric = db.prepare(`
        SELECT * FROM note_snapshots
        WHERE note_id = ? AND captured_at = ?
        ORDER BY id DESC LIMIT 1
      `).get(storedNote.id, collectedData.capturedAt);
      if (!storedMetric) {
        issues.push(`笔记 ${note.sourceNoteId} 指标未写入`);
        return;
      }
      [
        ["reads", "reads"], ["impressions", "impressions"], ["likes", "likes"],
        ["collections", "collections"], ["comments", "comments"],
      ].forEach(([column, key]) => check(storedMetric[column], note[key], `笔记 ${note.sourceNoteId}.${key}`));
      check(storedMetric.source_name, note.sourceName, `笔记 ${note.sourceNoteId}.sourceName`, false);
    });

    const storedNoteCount = Number(db.prepare(`
      SELECT COUNT(*) AS count FROM notes
      WHERE account_id = ? AND source_note_id IS NOT NULL
    `).get(accountId).count || 0);
    if (collectedData.noteSync?.complete && storedNoteCount !== validated.notes.length) {
      issues.push(`完整笔记数量：SQLite ${storedNoteCount} != 网站 ${validated.notes.length}`);
    }
    if (issues.length) {
      throw new Error(issues.slice(0, 5).join("；"));
    }

    const sourceComplete = collectedData.noteSync?.complete === true;
    return {
      status: sourceComplete ? "success" : "warning",
      sourceNoteCount: validated.notes.length,
      storedNoteCount,
      dailyMetricCount: validated.dailyMetrics.length,
      checkedFieldCount,
      message: sourceComplete
        ? `一致性校验通过：${checkedFieldCount} 个字段，笔记 ${storedNoteCount}/${validated.notes.length} 篇，日指标 ${validated.dailyMetrics.length} 条。`
        : "写入一致性校验通过，但网站笔记列表未确认完整；已保留历史笔记待下次复核。",
    };
  }

  function syncMissingNotes(accountId, sourceNoteIds) {
    if (sourceNoteIds.length) {
      const placeholders = sourceNoteIds.map(() => "?").join(", ");
      db.prepare(`
        DELETE FROM notes
        WHERE account_id = ?
          AND source_note_id IS NOT NULL
          AND source_note_id NOT IN (${placeholders})
      `).run(accountId, ...sourceNoteIds);
      return;
    }
    db.prepare("DELETE FROM notes WHERE account_id = ? AND source_note_id IS NOT NULL").run(accountId);
  }

  function saveCollectedData(accountId, collectedData) {
    const snapshot = collectedData.accountSnapshot || {};
    const profile = collectedData.profile || {};
    const capturedAt = collectedData.capturedAt;
    let validated = null;
    let transactionStarted = false;

    try {
      validated = validateCollectedData(collectedData);
      db.exec("BEGIN IMMEDIATE;");
      transactionStarted = true;

      db.prepare(`
        UPDATE accounts
        SET
          xhs_name = COALESCE(NULLIF(?, ''), xhs_name),
          xhs_account_id = COALESCE(NULLIF(?, ''), xhs_account_id),
          status = 'active',
          updated_at = datetime('now')
        WHERE id = ?
      `).run(profile.xhsName || "", profile.xhsAccountId || "", accountId);

      db.prepare(`
        INSERT INTO account_snapshots (
          account_id, captured_at, followers, reads, impressions, likes, collections,
          comments, profile_views, follower_delta, read_delta, impression_delta,
          like_delta, collection_delta, comment_delta, profile_view_delta,
          metric_period, period_start, period_end, daily_metric_date, source_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        accountId, capturedAt, value(snapshot, "followers"), value(snapshot, "reads"),
        value(snapshot, "impressions"), value(snapshot, "likes"), value(snapshot, "collections"),
        value(snapshot, "comments"), value(snapshot, "profileViews"), value(snapshot, "followerDelta"),
        value(snapshot, "readDelta"), value(snapshot, "impressionDelta"), value(snapshot, "likeDelta"),
        value(snapshot, "collectionDelta"), value(snapshot, "commentDelta"), value(snapshot, "profileViewDelta"),
        snapshot.metricPeriod || "", snapshot.periodStart || "", snapshot.periodEnd || "",
        snapshot.dailyMetricDate || "", snapshot.sourceName || "",
      );

      saveDailyMetrics(accountId, capturedAt, validated.dailyMetrics);
      if (validated.notes.length) {
        db.prepare("DELETE FROM notes WHERE account_id = ? AND source_note_id IS NULL").run(accountId);
        validated.notes.forEach((note) => saveNote(accountId, capturedAt, note));
      }
      if (collectedData.noteSync?.complete) {
        syncMissingNotes(accountId, validated.sourceNoteIds);
      }

      const audit = auditCollectedData(accountId, collectedData, validated);
      saveAudit(accountId, capturedAt, audit);
      db.exec("COMMIT;");
      return audit;
    } catch (error) {
      if (transactionStarted) {
        db.exec("ROLLBACK;");
      }
      try {
        saveAudit(accountId, capturedAt || new Date().toISOString(), {
          status: "error",
          sourceNoteCount: validated?.notes.length || 0,
          storedNoteCount: 0,
          dailyMetricCount: validated?.dailyMetrics.length || 0,
          checkedFieldCount: 0,
          message: `数据一致性校验失败：${error.message}`,
        });
      } catch (_auditError) {
        // Preserve the original collection error when audit persistence also fails.
      }
      throw error;
    }
  }

  return {
    auditCollectedData,
    saveAudit,
    saveCollectedData,
    saveDailyMetrics,
    saveLatestNote: saveNote,
    saveNote,
  };
}

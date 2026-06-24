import { listAuthSessions } from "./authSessions.js";

const oneDayMs = 24 * 60 * 60 * 1000;
const defaultHour = 10;
const defaultMinute = 0;

export function nextDailyRunAt(now = new Date(), hour = defaultHour, minute = defaultMinute) {
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setTime(next.getTime() + oneDayMs);
  }

  return next;
}

function formatLocalDateTime(date) {
  return date.toLocaleString("zh-CN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createCollectionScheduler({
  accountsRepository,
  collectionDataRepository,
  collectAccount,
  dashboardRepository,
}) {
  let timer = null;
  let lastRunAt = null;
  let nextRun = nextDailyRunAt();

  function status() {
    return {
      enabled: true,
      time: "每天 10:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "local",
      lastRunAt: lastRunAt ? lastRunAt.toISOString() : null,
      nextRunAt: nextRun.toISOString(),
      nextRunLabel: formatLocalDateTime(nextRun),
    };
  }

  async function run(reason = "scheduled") {
    const accounts = accountsRepository.list();
    const sessions = listAuthSessions(accounts);
    const readyCount = sessions.filter((session) => session.status === "session_ready").length;
    const missing = sessions.filter((session) => session.status !== "session_ready");
    const isScheduled = reason === "scheduled";

    lastRunAt = new Date();
    nextRun = nextDailyRunAt(lastRunAt);

    if (!readyCount) {
      return dashboardRepository.createCollectionLog({
        level: "warning",
        eventType: isScheduled ? "scheduled_precheck" : "manual_precheck",
        message: `${isScheduled ? "定时" : "手动"}采集已触发登录态预检查：${readyCount}/${sessions.length} 个账号可采集，${missing.map((session) => session.accountName).join("、")} 需要人工登录授权。`,
      });
    }

    const readyAccounts = accounts.filter((account) => (
      sessions.some((session) => (
        session.credentialKey === account.credentialKey
          && session.status === "session_ready"
      ))
    ));
    const collected = [];
    const failed = [];

    for (const account of readyAccounts) {
      try {
        const data = await collectAccount(account);
        collectionDataRepository.saveCollectedData(account.id, data);
        collected.push({
          id: account.id,
          name: data.accountName || account.name,
          noteCount: Number(data.noteSync?.actualCount || 0),
          expectedNoteCount: data.noteSync?.expectedCount,
          notesComplete: data.noteSync?.complete !== false,
        });
      } catch (error) {
        failed.push(`${account.name}：${error.message || "采集失败"}`);
      }
    }

    if (failed.length) {
      return dashboardRepository.createCollectionLog({
        level: "error",
        eventType: isScheduled ? "scheduled_collect_failed" : "manual_collect_failed",
        message: `${isScheduled ? "定时" : "手动"}真实采集失败：${failed.join("；")}${missing.length ? `；${missing.map((session) => session.accountName).join("、")} 需要人工登录授权` : ""}`,
      });
    }

    return dashboardRepository.createCollectionLog({
      accountId: collected.length === 1 ? collected[0].id : null,
      level: missing.length || collected.some((account) => !account.notesComplete) ? "warning" : "success",
      eventType: isScheduled
        ? (missing.length ? "scheduled_partial_collect" : "scheduled_collect")
        : (missing.length ? "manual_partial_collect" : "manual_collect"),
      message: `${isScheduled ? "定时" : "手动"}真实采集完成：${collected.map((account) => {
        const expectedText = Number.isFinite(Number(account.expectedNoteCount))
          ? `/${account.expectedNoteCount}`
          : "";
        const completeText = account.notesComplete ? "" : "，需复核完整性";
        return `${account.name}（笔记 ${account.noteCount}${expectedText} 篇${completeText}）`;
      }).join("、")} 已写入 SQLite${missing.length ? `；${missing.map((session) => session.accountName).join("、")} 需要人工登录授权` : ""}。`,
    });
  }

  function scheduleNext() {
    nextRun = nextDailyRunAt();
    const delay = Math.max(1000, nextRun.getTime() - Date.now());

    timer = setTimeout(async () => {
      await run("scheduled");
      scheduleNext();
    }, delay);
  }

  function start() {
    if (timer) {
      return;
    }

    scheduleNext();
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    run,
    start,
    status,
    stop,
  };
}

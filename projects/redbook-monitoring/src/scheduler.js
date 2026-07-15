import { listAuthSessions } from "./authSessions.js";
import { publicCollectionErrorMessage } from "./errorSanitizer.js";
import { defaultSchedulerSettings, normalizeSchedulerSettings } from "./repositories/schedulerSettings.js";

const maxTimerDelay = 2147483647;
const weekdayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function timeParts(time) {
  return time.split(":").map(Number);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function nextScheduledRunAt(now = new Date(), input = defaultSchedulerSettings) {
  const schedule = normalizeSchedulerSettings(input);
  const [hour, minute] = timeParts(schedule.time);
  const next = new Date(now);
  next.setSeconds(0, 0);

  if (schedule.frequency === "daily") {
    next.setHours(hour, minute, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (schedule.frequency === "weekly") {
    const targetDay = schedule.weekday % 7;
    const daysAhead = (targetDay - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + daysAhead);
    next.setHours(hour, minute, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
    return next;
  }

  const setMonthlyCandidate = (year, month) => {
    next.setFullYear(year, month, Math.min(schedule.monthDay, daysInMonth(year, month)));
    next.setHours(hour, minute, 0, 0);
  };

  setMonthlyCandidate(now.getFullYear(), now.getMonth());
  if (next <= now) {
    const nextMonth = now.getMonth() + 1;
    setMonthlyCandidate(now.getFullYear() + Math.floor(nextMonth / 12), nextMonth % 12);
  }

  return next;
}

export function scheduleLabel(input = defaultSchedulerSettings) {
  const schedule = normalizeSchedulerSettings(input);
  if (schedule.frequency === "weekly") {
    return `每${weekdayLabels[schedule.weekday - 1]} ${schedule.time}`;
  }
  if (schedule.frequency === "monthly") {
    return `每月 ${schedule.monthDay} 日 ${schedule.time}`;
  }
  return `每天 ${schedule.time}`;
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
  scheduleRepository = null,
  listSessions = listAuthSessions,
}) {
  let timer = null;
  let lastRunAt = null;
  let schedule = scheduleRepository?.get() || { ...defaultSchedulerSettings };
  let nextRun = nextScheduledRunAt(new Date(), schedule);
  let jobSequence = 0;
  let activeJob = null;
  let lastJob = null;

  function publicLog(log) {
    if (!log) {
      return null;
    }

    return {
      id: log.id,
      level: log.level,
      eventType: log.event_type || log.eventType,
      message: log.message,
      createdAt: log.created_at || log.createdAt,
      accountId: log.account_id || log.accountId || null,
      accountName: log.account_name || log.accountName || null,
    };
  }

  function publicJob(job) {
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      reason: job.reason,
      status: job.status,
      level: job.level,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      message: job.message,
      log: publicLog(job.log),
    };
  }

  function statusFromLog(log) {
    if (log?.level === "success") {
      return "success";
    }
    if (log?.level === "warning") {
      return "warning";
    }

    return "error";
  }

  function jobLabel(reason) {
    return reason === "scheduled" ? "定时" : "手动";
  }

  function collectedAccountText(account) {
    const expectedText = Number.isFinite(Number(account.expectedNoteCount))
      ? `/${account.expectedNoteCount}`
      : "";
    const completeText = account.notesComplete ? "" : "，需复核完整性";
    const auditText = account.audit?.status === "success"
      ? `，${account.audit.checkedFieldCount} 项一致性校验通过`
      : "，写入校验通过但源数据待复核";
    return `${account.name}（笔记 ${account.noteCount}${expectedText} 篇${completeText}${auditText}）`;
  }

  function status() {
    return {
      enabled: true,
      time: scheduleLabel(schedule),
      schedule: { ...schedule },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "local",
      lastRunAt: lastRunAt ? lastRunAt.toISOString() : null,
      nextRunAt: nextRun.toISOString(),
      nextRunLabel: formatLocalDateTime(nextRun),
      activeCollectionJob: publicJob(activeJob),
      lastCollectionJob: publicJob(lastJob),
      collectionJob: publicJob(activeJob || lastJob),
    };
  }

  async function run(reason = "scheduled") {
    const accounts = accountsRepository.list();
    const sessions = listSessions(accounts);
    const readyCount = sessions.filter((session) => session.status === "session_ready").length;
    const missing = sessions.filter((session) => session.status !== "session_ready");
    const isScheduled = reason === "scheduled";

    lastRunAt = new Date();
    nextRun = nextScheduledRunAt(lastRunAt, schedule);

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
        const audit = collectionDataRepository.saveCollectedData(account.id, data);
        collected.push({
          id: account.id,
          name: data.accountName || account.name,
          noteCount: Number(data.noteSync?.actualCount || 0),
          expectedNoteCount: data.noteSync?.expectedCount,
          notesComplete: data.noteSync?.complete !== false,
          audit,
        });
      } catch (error) {
        failed.push(`${account.name}：${publicCollectionErrorMessage(error)}`);
      }
    }

    if (failed.length) {
      const successText = collected.length
        ? `成功 ${collected.length}/${readyAccounts.length} 个：${collected.map(collectedAccountText).join("、")}`
        : `成功 0/${readyAccounts.length} 个`;
      const failedText = `失败 ${failed.length}/${readyAccounts.length} 个：${failed.join("；")}`;
      const missingText = missing.length
        ? `；${missing.map((session) => session.accountName).join("、")} 需要人工登录授权`
        : "";

      return dashboardRepository.createCollectionLog({
        level: collected.length ? "warning" : "error",
        eventType: isScheduled
          ? (collected.length ? "scheduled_partial_failed" : "scheduled_collect_failed")
          : (collected.length ? "manual_partial_failed" : "manual_collect_failed"),
        message: `${isScheduled ? "定时" : "手动"}真实采集${collected.length ? "部分完成" : "失败"}：${successText}；${failedText}${missingText}。`,
      });
    }

    return dashboardRepository.createCollectionLog({
      accountId: collected.length === 1 ? collected[0].id : null,
      level: missing.length || collected.some((account) => !account.notesComplete) ? "warning" : "success",
      eventType: isScheduled
        ? (missing.length ? "scheduled_partial_collect" : "scheduled_collect")
        : (missing.length ? "manual_partial_collect" : "manual_collect"),
      message: `${isScheduled ? "定时" : "手动"}真实采集完成：${collected.map(collectedAccountText).join("、")} 已写入 SQLite${missing.length ? `；${missing.map((session) => session.accountName).join("、")} 需要人工登录授权` : ""}。`,
    });
  }

  async function runWithJob(reason = "scheduled") {
    if (activeJob) {
      return publicJob(activeJob);
    }

    const job = {
      id: ++jobSequence,
      reason,
      status: "running",
      level: "info",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      message: `${jobLabel(reason)}采集正在后台执行。`,
      log: null,
    };

    activeJob = job;

    try {
      const log = await run(reason);
      job.log = log;
      job.level = log.level;
      job.status = statusFromLog(log);
      job.message = log.message || `${jobLabel(reason)}采集已完成。`;
    } catch (error) {
      job.level = "error";
      job.status = "error";
      job.message = `${jobLabel(reason)}采集异常：${publicCollectionErrorMessage(error)}`;

      try {
        job.log = dashboardRepository.createCollectionLog({
          level: "error",
          eventType: reason === "scheduled" ? "scheduled_collect_crashed" : "manual_collect_crashed",
          message: job.message,
        });
      } catch (_logError) {
        job.log = null;
      }
    } finally {
      job.finishedAt = new Date().toISOString();
      lastJob = job;
      activeJob = null;
    }

    return publicJob(job);
  }

  function trigger(reason = "manual") {
    if (activeJob) {
      return {
        accepted: false,
        message: "已有采集任务正在后台运行。",
        job: publicJob(activeJob),
      };
    }

    const running = runWithJob(reason);
    running.catch(() => {});

    return {
      accepted: true,
      message: `${jobLabel(reason)}采集已在后台启动。`,
      job: publicJob(activeJob),
    };
  }

  function collectionStatus() {
    return {
      activeJob: publicJob(activeJob),
      lastJob: publicJob(lastJob),
      job: publicJob(activeJob || lastJob),
    };
  }

  function scheduleNext() {
    nextRun = nextScheduledRunAt(new Date(), schedule);
    const delay = Math.min(maxTimerDelay, Math.max(1000, nextRun.getTime() - Date.now()));

    timer = setTimeout(async () => {
      timer = null;
      if (Date.now() + 1000 < nextRun.getTime()) {
        scheduleNext();
        return;
      }
      await runWithJob("scheduled");
      scheduleNext();
    }, delay);
  }

  function updateSchedule(input) {
    schedule = scheduleRepository
      ? scheduleRepository.update(input)
      : normalizeSchedulerSettings(input, schedule);
    if (timer) {
      clearTimeout(timer);
      timer = null;
      scheduleNext();
    } else {
      nextRun = nextScheduledRunAt(new Date(), schedule);
    }
    return status();
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
    collectionStatus,
    run,
    runWithJob,
    start,
    status,
    stop,
    trigger,
    updateSchedule,
  };
}

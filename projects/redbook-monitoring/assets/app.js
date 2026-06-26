const refreshButtons = document.querySelectorAll("[data-refresh]");
const saveButton = document.querySelector("[data-save]");
const accountForm = document.querySelector("[data-account-form]");
const accountDialog = document.querySelector("[data-account-dialog]");
const openAccountDialogButton = document.querySelector("[data-open-account-dialog]");
const closeAccountDialogButtons = document.querySelectorAll("[data-close-account-dialog]");
const accountList = document.querySelector("[data-account-list]");
const accountCount = document.querySelector("[data-account-count]");
const passwordLoginFields = document.querySelector("[data-password-login-fields]");
const wechatLoginTip = document.querySelector("[data-wechat-login-tip]");
const formMessages = document.querySelectorAll("[data-form-message]");
const storageStatus = document.querySelector("[data-storage-status]");
const credentialsStatus = document.querySelector("[data-credentials-status]");
const scopeTabs = document.querySelectorAll(".scope-tabs");
const statusSummary = document.querySelector("[data-status-summary]");
const overviewNotice = document.querySelector("[data-overview-notice]");
const accountSummary = document.querySelector("[data-account-summary]");
const insightList = document.querySelector("[data-insight-list]");
const interactionTrendChart = document.querySelector("[data-interaction-trend]");
const notesTable = document.querySelector("[data-notes-table]");
const notesSummary = document.querySelector("[data-notes-summary]");
const notesSearchInput = document.querySelector("[data-notes-search]");
const trendFollowersTitle = document.querySelector("[data-trend-followers-title]");
const trendFollowersSummary = document.querySelector("[data-trend-followers-summary]");
const trendFollowersBadge = document.querySelector("[data-trend-followers-badge]");
const trendFollowersChart = document.querySelector("[data-trend-followers-chart]");
const trendImpressionsTitle = document.querySelector("[data-trend-impressions-title]");
const trendImpressionsSummary = document.querySelector("[data-trend-impressions-summary]");
const trendImpressionsBadge = document.querySelector("[data-trend-impressions-badge]");
const trendImpressionsChart = document.querySelector("[data-trend-impressions-chart]");
const trendComparison = document.querySelector("[data-trend-comparison]");
const dateRangeForms = document.querySelectorAll("[data-date-range-form]");
const dateRangeStartInputs = document.querySelectorAll("[data-date-range-start]");
const dateRangeEndInputs = document.querySelectorAll("[data-date-range-end]");
const taskStateGrid = document.querySelector("[data-task-state-grid]");
const taskQueue = document.querySelector("[data-task-queue]");
const collectionLogs = document.querySelector("[data-collection-logs]");
const authSessionList = document.querySelector("[data-auth-session-list]");
const authSessionSummary = document.querySelectorAll("[data-auth-session-summary]");
const schedulerStatus = document.querySelector("[data-scheduler-status]");

const numberFormatter = new Intl.NumberFormat("zh-CN");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateRangeStorageKey = "redbookMonitor.dateRange";
const collectionStatusStorageKey = "redbookMonitor.collectionStatus.seenJob";
let authPollTimer = null;
let collectionStatusPollTimer = null;
let selectedScope = "all";
let selectedDateRange = null;
let availableDateRange = null;
let currentNotes = [];
let currentNoteCoverage = null;
let lastAutoRefreshAt = 0;
let currentCollectionJob = null;
let lastCollectionRefreshJobKey = "";

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatDelta(value, suffix = "最新日") {
  const number = Number(value || 0);
  const formatted = `${number > 0 ? "+" : ""}${formatNumber(number)}`;
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function signedNumber(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${formatNumber(number)}` : formatNumber(number);
}

function formatMetricValue(value) {
  return value === null || value === undefined ? "待采集" : formatNumber(value);
}

function formatOptionalDelta(value, suffix = "") {
  return value === null || value === undefined ? "待采集" : formatDelta(value, suffix);
}

function localToday() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Shanghai",
  });
}

function isDateString(value) {
  return datePattern.test(String(value || ""));
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

function shortDateLabel(value) {
  if (!value || typeof value !== "string") {
    return "最新日";
  }

  const parts = value.split("-");
  return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
}

function displayDateLabel(value) {
  if (!value || typeof value !== "string") {
    return "最新日";
  }
  if (value === "今日" || value === "最新日") {
    return value;
  }

  const parts = value.split("-");
  if (parts.length === 2) {
    return `${Number(parts[0])}月${Number(parts[1])}`;
  }
  if (parts.length === 3) {
    return `${Number(parts[1])}月${Number(parts[2])}`;
  }

  return value;
}

function minDateText(left, right) {
  if (!left) {
    return right || "";
  }
  if (!right) {
    return left;
  }
  return left < right ? left : right;
}

function maxDateText(left, right) {
  if (!left) {
    return right || "";
  }
  if (!right) {
    return left;
  }
  return left > right ? left : right;
}

function compactDateLabel(value) {
  return shortDateLabel(value);
}

function chartCanvasWidth(pointCount, minWidth = 640, pointWidth = 56) {
  return Math.max(minWidth, Math.max(1, pointCount) * pointWidth);
}

function createChartScrollPane(width, className = "chart-scroll-pane") {
  const pane = document.createElement("div");
  pane.className = className;
  pane.style.setProperty("--chart-canvas-width", `${width}px`);
  return pane;
}

function metricDeltaSuffix(record = {}) {
  const date = record.daily_metric_date || record.dailyMetricDate || "";
  if (!date) {
    return "最新日";
  }

  return date === localToday() ? "今日" : shortDateLabel(date);
}

function metricDailyLabel(record = {}) {
  const suffix = metricDeltaSuffix(record);
  return suffix === "今日" ? "今日" : `${displayDateLabel(suffix)} 单日`;
}

function metricPeriodLabel(record = {}) {
  const period = record.metric_period || record.metricPeriod || "";
  const start = record.period_start || record.periodStart || "";
  const end = record.period_end || record.periodEnd || "";
  const label = period === "seven" ? "7日周期" : period === "thirty" ? "30日周期" : "所选区间";

  return start && end ? `${label} ${start} 至 ${end}` : label;
}

function metricSourceLabel(record = {}) {
  const source = record.source_name || record.sourceName || "";
  if (source.includes("/account/base") || source.includes("account_daily_metrics")) {
    return "创作者中心账号数据";
  }

  return source || "本地快照";
}

function hasMetricSnapshot(record = {}) {
  return Boolean(record.captured_at || record.capturedAt);
}

function dateRangeLabel(range = selectedDateRange) {
  if (!range?.startDate || !range?.endDate) {
    return "所选区间";
  }

  return `${displayDateLabel(range.startDate)} 至 ${displayDateLabel(range.endDate)}`;
}

function noteDateRangeLabel(coverage = {}) {
  const first = coverage.first_published_at || "";
  const last = coverage.last_published_at || "";
  if (!first && !last) {
    return "";
  }
  if (!first || first === last) {
    return first || last;
  }

  return `${first} 至 ${last}`;
}

function normalizeNoteCoverage(coverage = {}) {
  return {
    ...coverage,
    total_note_count: Number(coverage.total_note_count || 0),
    range_note_count: Number(coverage.range_note_count || 0),
    first_published_at: coverage.first_published_at || "",
    last_published_at: coverage.last_published_at || "",
  };
}

function normalizeDateRange(startDate, endDate) {
  let start = isDateString(startDate) ? startDate : "";
  let end = isDateString(endDate) ? endDate : "";

  if (!start || !end) {
    return null;
  }
  if (start > end) {
    [start, end] = [end, start];
  }

  return { startDate: start, endDate: end };
}

function readStoredDateRange() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(dateRangeStorageKey) || "null");
    return normalizeDateRange(stored?.startDate, stored?.endDate);
  } catch (_error) {
    return null;
  }
}

function saveDateRange(range) {
  window.localStorage.setItem(dateRangeStorageKey, JSON.stringify(range));
}

function dateRangeSearchParams(extra = {}) {
  const params = new URLSearchParams(extra);
  if (selectedDateRange?.startDate && selectedDateRange?.endDate) {
    params.set("startDate", selectedDateRange.startDate);
    params.set("endDate", selectedDateRange.endDate);
  }
  return params;
}

function apiPathWithDateRange(path, extra = {}) {
  const params = dateRangeSearchParams(extra);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function updateDateRangeControls() {
  dateRangeStartInputs.forEach((input) => {
    input.value = selectedDateRange?.startDate || "";
    input.removeAttribute("min");
    input.removeAttribute("max");
  });
  dateRangeEndInputs.forEach((input) => {
    input.value = selectedDateRange?.endDate || "";
    input.removeAttribute("min");
    input.removeAttribute("max");
  });
}

async function applyDateRange(range) {
  selectedDateRange = range;
  saveDateRange(range);
  updateDateRangeControls();
  await refreshScopedSections();
}

async function initializeDateRange() {
  try {
    availableDateRange = await requestJson("/api/dashboard/date-range");
  } catch (_error) {
    const today = localToday();
    availableDateRange = {
      minDate: shiftDate(today, -29),
      maxDate: today,
      defaultStartDate: shiftDate(today, -6),
      defaultEndDate: today,
    };
  }

  selectedDateRange = readStoredDateRange() || {
    startDate: availableDateRange.defaultStartDate,
    endDate: availableDateRange.defaultEndDate,
  };
  updateDateRangeControls();
}

function accountDisplayName(account) {
  return account?.displayName
    || account?.name
    || account?.account_name
    || account?.configuredName
    || "未命名账号";
}

function accountIdValue(account) {
  return account?.xhsAccountId
    || account?.xhs_account_id
    || account?.account_xhs_id
    || "";
}

function accountIdText(account, fallback = "小红书号：待同步") {
  const id = accountIdValue(account);
  return id ? `小红书号：${id}` : fallback;
}

function loginMethodText(value) {
  return value === "wechat" ? "微信扫码" : "手机号/密码";
}

function currentLoginMethod() {
  return accountForm?.querySelector('input[name="loginMethod"]:checked')?.value || "password";
}

function updateLoginMethodFields() {
  const isWechat = currentLoginMethod() === "wechat";

  if (passwordLoginFields) {
    passwordLoginFields.hidden = isWechat;
  }
  if (wechatLoginTip) {
    wechatLoginTip.hidden = !isWechat;
  }
}

function updateStatusSummary(accounts = []) {
  if (!statusSummary) {
    return;
  }

  const scopedAccounts = accountsForScope(accounts);
  const activeCount = scopedAccounts.filter((account) => account.status === "active").length;
  const pendingCount = scopedAccounts.filter((account) => account.status === "pending" || account.status === "pending_verification").length;
  const errorCount = scopedAccounts.filter((account) => account.status === "error").length;
  const dot = statusSummary.querySelector(".status-dot");
  const parts = [];

  if (activeCount) {
    parts.push(`${activeCount} 正常`);
  }
  if (pendingCount) {
    parts.push(`${pendingCount} 待验证`);
  }
  if (errorCount) {
    parts.push(`${errorCount} 异常`);
  }
  if (!parts.length) {
    parts.push("0 个账号");
  }

  statusSummary.textContent = "";
  if (dot) {
    dot.className = `status-dot ${errorCount ? "error" : pendingCount ? "warning" : "success"}`;
    statusSummary.append(dot, document.createTextNode(parts.join(" · ")));
  } else {
    statusSummary.textContent = parts.join(" · ");
  }
}

function accountScopeKey(account) {
  return `account:${account.id}`;
}

function selectedAccountId() {
  if (!selectedScope.startsWith("account:")) {
    return null;
  }

  return Number(selectedScope.replace("account:", ""));
}

function accountsForScope(accounts = []) {
  const accountId = selectedAccountId();
  if (!accountId) {
    return accounts;
  }

  return accounts.filter((account) => Number(account.id) === accountId);
}

function notesForScope(notes = []) {
  const accountId = selectedAccountId();
  if (!accountId) {
    return notes;
  }

  return notes.filter((note) => Number(note.account_id) === accountId);
}

function noteCoverageForScope() {
  const accounts = Array.isArray(currentNoteCoverage?.accounts) ? currentNoteCoverage.accounts : [];
  const accountId = selectedAccountId();
  if (accountId) {
    const account = accounts.find((item) => Number(item.account_id) === accountId);
    return account ? normalizeNoteCoverage(account) : null;
  }

  const normalized = accounts.map(normalizeNoteCoverage);
  if (!normalized.length) {
    return null;
  }

  return normalized.reduce((summary, account) => ({
    total_note_count: summary.total_note_count + account.total_note_count,
    range_note_count: summary.range_note_count + account.range_note_count,
    first_published_at: minDateText(summary.first_published_at, account.first_published_at),
    last_published_at: maxDateText(summary.last_published_at, account.last_published_at),
  }), {
    total_note_count: 0,
    range_note_count: 0,
    first_published_at: "",
    last_published_at: "",
  });
}

function logsForScope(logs = []) {
  const accountId = selectedAccountId();
  if (!accountId) {
    return logs;
  }

  return logs.filter((log) => !log.account_id || Number(log.account_id) === accountId);
}

function totalsFromAccount(account) {
  if (!account) {
    return {};
  }

  return {
    account_count: 1,
    followers: account.followers,
    reads: account.reads,
    impressions: account.impressions,
    likes: account.likes,
    collections: account.collections,
    comments: account.comments,
    profile_views: account.profile_views,
    follower_delta: account.follower_delta,
    read_delta: account.read_delta,
    impression_delta: account.impression_delta,
    like_delta: account.like_delta,
    collection_delta: account.collection_delta,
    comment_delta: account.comment_delta,
    profile_view_delta: account.profile_view_delta,
    metric_period: account.metric_period,
    period_start: account.period_start,
    period_end: account.period_end,
    daily_metric_date: account.daily_metric_date,
    source_name: account.source_name,
  };
}

function applyAuthSessions(accounts = [], sessions = []) {
  const sessionByAccountId = new Map(sessions.map((session) => [Number(session.accountId), session]));

  return accounts.map((account) => {
    const session = sessionByAccountId.get(Number(account.id));
    if (!session) {
      return account;
    }

    if (session.status === "session_ready" && (account.status === "pending" || account.status === "pending_verification")) {
      return { ...account, status: "active", authSessionStatus: session.status };
    }

    return { ...account, authSessionStatus: session.status };
  });
}

function scopedOverview(payload) {
  const accounts = payload.accounts || [];
  const scopedAccounts = accountsForScope(accounts);
  const scopedTotals = selectedAccountId()
    ? totalsFromAccount(scopedAccounts[0])
    : (payload.totals || {});

  return {
    accounts,
    scopedAccounts,
    totals: scopedTotals,
  };
}

function createScopeChip({ label, caption, scope, active }) {
  const button = document.createElement("button");
  const labelElement = document.createElement("span");

  button.className = active ? "scope-chip active" : "scope-chip";
  button.type = "button";
  button.dataset.scope = scope;
  labelElement.textContent = label;
  button.append(labelElement);

  if (caption) {
    const captionElement = document.createElement("small");
    captionElement.textContent = caption;
    button.append(captionElement);
  }

  return button;
}

function renderScopeTabs(accounts = []) {
  if (!scopeTabs.length) {
    return;
  }

  const visibleAccounts = accounts.filter((account) => account?.id);
  const scopeIsVisible = selectedScope === "all"
    || visibleAccounts.some((account) => accountScopeKey(account) === selectedScope);
  if (!scopeIsVisible) {
    selectedScope = "all";
  }

  scopeTabs.forEach((container) => {
    const chips = [
      createScopeChip({
        label: "全部账号",
        caption: `${visibleAccounts.length} 个账号`,
        scope: "all",
        active: selectedScope === "all",
      }),
      ...visibleAccounts.map((account) => createScopeChip({
        label: accountDisplayName(account),
        caption: accountIdValue(account) ? `ID ${accountIdValue(account)}` : "ID 待同步",
        scope: accountScopeKey(account),
        active: selectedScope === accountScopeKey(account),
      })),
    ];

    container.replaceChildren(...chips);
  });
}

function isCollectionRunning(job = currentCollectionJob) {
  return job?.status === "running";
}

function isCollectionTerminal(job = currentCollectionJob) {
  return ["success", "warning", "error"].includes(job?.status);
}

function collectionJobKey(job) {
  if (!job?.id || !job.status) {
    return "";
  }

  return `${job.id}:${job.status}`;
}

function collectionToastType(job) {
  if (job?.status === "error") {
    return "error";
  }
  if (job?.status === "warning") {
    return "warning";
  }

  return "success";
}

function collectionToastTitle(job) {
  if (job?.status === "error") {
    return "采集失败";
  }
  if (job?.status === "warning") {
    return "采集完成，需处理";
  }

  return "采集成功";
}

function isFreshCollectionJob(job) {
  if (!job?.finishedAt) {
    return false;
  }

  const finishedAt = new Date(job.finishedAt).getTime();
  if (!Number.isFinite(finishedAt)) {
    return false;
  }

  return Date.now() - finishedAt < 30 * 60 * 1000;
}

function storageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (_error) {
    return "";
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
    // localStorage can be unavailable in private or restricted browser contexts.
  }
}

function ensureToastRegion() {
  let region = document.querySelector("[data-toast-region]");
  if (region) {
    return region;
  }

  region = document.createElement("div");
  region.className = "toast-region";
  region.dataset.toastRegion = "";
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-relevant", "additions");
  document.body.append(region);

  return region;
}

function showToast({ title, message, type = "success" }) {
  const region = ensureToastRegion();
  const toast = document.createElement("article");
  const heading = document.createElement("strong");
  const body = document.createElement("p");
  const close = document.createElement("button");

  toast.className = `toast ${type}`;
  heading.textContent = title;
  body.textContent = message;
  close.type = "button";
  close.setAttribute("aria-label", "关闭提示");
  close.textContent = "×";
  close.addEventListener("click", () => toast.remove());
  toast.append(heading, body, close);
  region.append(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 5600);
}

function setRefreshButtonsCollecting(isCollecting) {
  refreshButtons.forEach((button) => {
    if (!button.dataset.idleText) {
      button.dataset.idleText = button.textContent;
    }

    button.disabled = isCollecting;
    button.classList.toggle("is-loading", isCollecting);
    button.textContent = isCollecting ? "采集中..." : button.dataset.idleText;
  });
}

function updateCollectionJobUi(job, options = {}) {
  const previousJob = currentCollectionJob;
  currentCollectionJob = job || null;
  setRefreshButtonsCollecting(isCollectionRunning(currentCollectionJob));

  if (!isCollectionTerminal(currentCollectionJob)) {
    return;
  }

  const key = collectionJobKey(currentCollectionJob);
  if (!key) {
    return;
  }

  if (key !== lastCollectionRefreshJobKey && previousJob?.status === "running") {
    lastCollectionRefreshJobKey = key;
    refreshScopedSections().catch(() => {});
  }

  if (!options.notify || !isFreshCollectionJob(currentCollectionJob)) {
    return;
  }

  if (storageGet(collectionStatusStorageKey) === key) {
    return;
  }

  storageSet(collectionStatusStorageKey, key);
  showToast({
    title: collectionToastTitle(currentCollectionJob),
    message: currentCollectionJob.message || "采集任务已完成。",
    type: collectionToastType(currentCollectionJob),
  });
}

async function pollCollectionStatus(options = {}) {
  try {
    const payload = await requestJson("/api/collections/status");
    updateCollectionJobUi(payload.job, { notify: options.notify !== false });
  } catch (_error) {
    if (!isCollectionRunning()) {
      setRefreshButtonsCollecting(false);
    }
  } finally {
    const delay = isCollectionRunning() ? 2000 : 8000;
    collectionStatusPollTimer = window.setTimeout(() => {
      pollCollectionStatus({ notify: true }).catch(() => {});
    }, delay);
  }
}

function requestCollectionStatusUpdate(options = {}) {
  if (collectionStatusPollTimer) {
    window.clearTimeout(collectionStatusPollTimer);
    collectionStatusPollTimer = null;
  }

  pollCollectionStatus(options).catch(() => {});
}

refreshButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    setRefreshButtonsCollecting(true);

    try {
      const payload = await requestJson("/api/collections/manual", { method: "POST" });
      updateCollectionJobUi(payload.job, { notify: false });
      if (payload.status === "running") {
        showToast({
          title: "采集中",
          message: payload.message || "已有采集任务正在后台运行。",
          type: "warning",
        });
      }
      requestCollectionStatusUpdate({ notify: true });
    } catch (error) {
      setRefreshButtonsCollecting(false);
      showToast({
        title: "启动采集失败",
        message: error.message || "无法启动后台采集任务。",
        type: "error",
      });
    }
  });
});

if (saveButton) {
  saveButton.addEventListener("click", () => {
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = "已保存";

    window.setTimeout(() => {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }, 1000);
  });
}

function statusText(status) {
  const labels = {
    active: "登录正常",
    pending_verification: "待验证",
    pending: "待验证",
    error: "异常",
  };

  return labels[status] || "待验证";
}

function statusClass(status) {
  if (status === "active") {
    return "success";
  }
  if (status === "error") {
    return "error";
  }

  return "warning";
}

function authStatusClass(status) {
  if (status === "session_ready") {
    return "success";
  }
  if (status === "manual_required") {
    return "error";
  }

  return "warning";
}

function authActionText(session) {
  if (session.status === "login_in_progress") {
    return "等待登录";
  }
  if (session.status === "session_ready") {
    return "重新授权";
  }
  if (session.status === "credential_missing") {
    return "补全凭据";
  }
  if (session.loginMethod === "wechat") {
    return "微信扫码";
  }

  return "启动登录";
}

function authDescription(session) {
  if (session.job?.message) {
    return session.job.message;
  }
  if (session.status === "session_ready") {
    return `本地 session 已保存：${session.sessionSavedAt || "时间未知"}`;
  }
  if (session.status === "credential_missing") {
    return "请先在本地 .env 中补全用户名、密码和主页链接。";
  }
  if (session.status === "manual_required") {
    return "上次授权失败或已失效，请重新进行人工登录。";
  }

  return "尚未保存登录态，首次采集前需要人工登录一次。";
}

function setFormMessage(message, type = "") {
  if (!formMessages.length) {
    return;
  }

  formMessages.forEach((formMessage) => {
    formMessage.textContent = message;
    formMessage.classList.remove("error", "success");
    if (type) {
      formMessage.classList.add(type);
    }
  });
}

function openAccountDialog() {
  if (!accountDialog) {
    return;
  }

  if (typeof accountDialog.showModal === "function") {
    accountDialog.showModal();
  } else {
    accountDialog.setAttribute("open", "");
  }

  setFormMessage("提交后会写入本地 SQLite；手机号/密码只保存到本地 .env。");
  accountForm?.querySelector('input[name="accountName"]')?.focus();
}

function closeAccountDialog() {
  if (!accountDialog) {
    return;
  }

  if (typeof accountDialog.close === "function") {
    accountDialog.close();
  } else {
    accountDialog.removeAttribute("open");
  }
}

function updateAccountCount() {
  if (!accountList || !accountCount) {
    return;
  }

  const count = accountList.querySelectorAll(".account-card").length;
  accountCount.textContent = `${count} 个账号`;
  if (storageStatus) {
    storageStatus.textContent = `本地数据库可写，当前 ${count} 个账号。`;
  }
}

function createAccountCard(account) {
  const card = document.createElement("article");
  const avatar = document.createElement("div");
  const body = document.createElement("div");
  const title = document.createElement("div");
  const name = document.createElement("strong");
  const status = document.createElement("span");
  const statusDot = document.createElement("span");
  const url = document.createElement("p");
  const meta = document.createElement("div");
  const xhsId = document.createElement("span");
  const key = document.createElement("span");
  const configuredName = document.createElement("span");
  const lastCollected = document.createElement("span");
  const actions = document.createElement("div");
  const defaultButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = account.isDefault ? "account-card is-active" : "account-card";
  card.dataset.accountId = account.id;
  avatar.className = "account-avatar";
  avatar.textContent = accountDisplayName(account).slice(0, 1) || "新";
  body.className = "account-body";
  title.className = "account-title";
  name.textContent = accountDisplayName(account);
  status.className = "status-pill small";
  statusDot.className = `status-dot ${statusClass(account.status)}`;
  status.append(statusDot, statusText(account.status));
  url.textContent = account.profileUrl;
  meta.className = "account-meta";
  xhsId.textContent = accountIdText(account);
  key.textContent = `登录方式：${loginMethodText(account.loginMethod)}`;
  configuredName.textContent = account.configuredName && account.configuredName !== accountDisplayName(account)
    ? `本地名称：${account.configuredName}`
    : "";
  lastCollected.textContent = account.lastCollectedAt ? `最近采集：${account.lastCollectedAt}` : "最近采集：尚未采集";
  meta.append(xhsId, key);
  if (configuredName.textContent) {
    meta.append(configuredName);
  }
  meta.append(lastCollected);
  title.append(name, status);
  body.append(title, url, meta);
  actions.className = "account-actions";
  defaultButton.className = account.isDefault ? "button secondary active" : "button secondary";
  defaultButton.type = "button";
  defaultButton.dataset.defaultAccount = "";
  defaultButton.disabled = account.isDefault;
  defaultButton.textContent = account.isDefault ? "默认账号" : "设为默认";
  deleteButton.className = "button danger";
  deleteButton.type = "button";
  deleteButton.dataset.deleteAccount = "";
  deleteButton.textContent = "删除";
  actions.append(defaultButton, deleteButton);
  card.append(avatar, body, actions);

  return card;
}

function renderAccounts(accounts) {
  if (!accountList) {
    return;
  }

  accountList.replaceChildren(...accounts.map(createAccountCard));
  updateAccountCount();
}

async function loadAccounts() {
  if (!accountList) {
    return;
  }

  try {
    const response = await fetch("/api/accounts");
    if (!response.ok) {
      throw new Error("账号数据加载失败");
    }
    const payload = await response.json();
    renderAccounts(payload.accounts || []);
    renderScopeTabs(payload.accounts || []);
    setFormMessage("账号配置已从本地 SQLite 加载。", "success");
  } catch (error) {
    updateAccountCount();
    setFormMessage("未连接本地 API，暂时无法显示真实数据。", "error");
  }
}

async function loadScopeAccounts() {
  if (!scopeTabs.length) {
    return;
  }

  try {
    const payload = await requestJson("/api/accounts");
    renderScopeTabs(payload.accounts || []);
  } catch (_error) {
    renderScopeTabs([]);
  }
}

async function loadCredentialStatus() {
  if (!credentialsStatus) {
    return;
  }

  try {
    const payload = await requestJson("/api/credentials/status");
    if (!payload.envExists) {
      credentialsStatus.textContent = "未检测到 .env，请按右侧示例在本地创建。";
      return;
    }

    const readyCount = (payload.accounts || []).filter((account) => (
      account.hasUsername && account.hasPassword && account.hasProfileUrl
    )).length;
    credentialsStatus.textContent = `已检测到 .env，${readyCount}/${payload.accounts.length} 个账号凭据完整。`;
  } catch (_error) {
    credentialsStatus.textContent = "未连接本地 API，无法检测 .env。";
  }
}

function updateAuthSessionSummary(sessions) {
  if (!authSessionSummary.length) {
    return;
  }

  const readyCount = sessions.filter((session) => session.status === "session_ready").length;
  authSessionSummary.forEach((element) => {
    element.textContent = `${readyCount}/${sessions.length} 已授权`;
  });
}

function scheduleAuthSessionPolling(sessions) {
  if (authPollTimer) {
    window.clearTimeout(authPollTimer);
    authPollTimer = null;
  }

  const hasRunningLogin = sessions.some((session) => session.status === "login_in_progress");
  if (!hasRunningLogin) {
    return;
  }

  authPollTimer = window.setTimeout(async () => {
    authPollTimer = null;
    if (taskStateGrid || taskQueue || collectionLogs) {
      await loadTasks();
      return;
    }

    await loadAuthSessions();
  }, 2000);
}

function createAuthSessionItem(session) {
  const item = document.createElement("article");
  const dot = document.createElement("span");
  const body = document.createElement("div");
  const title = document.createElement("div");
  const name = document.createElement("strong");
  const pill = document.createElement("span");
  const pillDot = document.createElement("span");
  const description = document.createElement("p");
  const meta = document.createElement("div");
  const key = document.createElement("span");
  const sessionFile = document.createElement("span");
  const button = document.createElement("button");

  item.className = "auth-item";
  dot.className = `status-dot ${authStatusClass(session.status)}`;
  title.className = "account-title";
  name.textContent = session.accountName;
  pill.className = "status-pill small";
  pillDot.className = `status-dot ${authStatusClass(session.status)}`;
  pill.append(pillDot, session.label);
  title.append(name, pill);
  description.textContent = authDescription(session);
  meta.className = "account-meta";
  key.textContent = `登录方式：${loginMethodText(session.loginMethod)}`;
  sessionFile.textContent = session.sessionFileName ? `session：${session.sessionFileName}` : "session：未生成";
  meta.append(key, sessionFile);
  body.append(title, description, meta);
  button.className = "button secondary";
  button.type = "button";
  button.dataset.authLogin = session.credentialKey;
  button.disabled = session.status === "credential_missing" || session.status === "login_in_progress";
  button.textContent = authActionText(session);
  item.append(dot, body, button);

  return item;
}

async function loadAuthSessions() {
  if (!authSessionList) {
    return [];
  }

  try {
    const payload = await requestJson("/api/auth/sessions");
    const sessions = payload.sessions || [];
    authSessionList.replaceChildren(...sessions.map(createAuthSessionItem));
    updateAuthSessionSummary(sessions);
    scheduleAuthSessionPolling(sessions);
    return sessions;
  } catch (_error) {
    const item = document.createElement("article");
    item.className = "auth-item";
    item.textContent = "未连接本地 API，无法检测登录态。";
    authSessionList.replaceChildren(item);
    updateAuthSessionSummary([]);
    scheduleAuthSessionPolling([]);
    return [];
  }
}

async function loadSchedulerStatus() {
  if (!schedulerStatus) {
    return;
  }

  try {
    const payload = await requestJson("/api/scheduler/status");
    updateCollectionJobUi(payload.collectionJob, { notify: false });
    schedulerStatus.textContent = payload.activeCollectionJob
      ? "后台采集中"
      : `下次 ${payload.nextRunLabel || "10:00"}`;
  } catch (_error) {
    schedulerStatus.textContent = "每天 10:00";
  }
}

async function refreshScopedSections() {
  const tasks = [];

  if (document.querySelector("[data-kpi-card]")) {
    tasks.push(loadOverview());
  }
  if (interactionTrendChart) {
    tasks.push(loadInteractionTrend());
  }
  if (notesTable) {
    tasks.push(loadNotes());
  }
  if (trendComparison) {
    tasks.push(loadTrends());
  }
  if (taskStateGrid || taskQueue || collectionLogs) {
    tasks.push(loadTasks());
  }

  await Promise.all(tasks);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || "请求失败");
  }

  return payload;
}

function setKpiCard(metric, value, delta, deltaSuffix = "最新日", options = {}) {
  const card = document.querySelector(`[data-kpi-card="${metric}"]`);
  if (!card) {
    return;
  }

  const valueElement = card.querySelector("[data-kpi-value]");
  const deltaElement = card.querySelector("[data-kpi-delta]");
  if (valueElement) {
    valueElement.textContent = formatNumber(value);
  }
  if (deltaElement) {
    deltaElement.textContent = options.deltaText || formatDelta(delta, deltaSuffix);
    deltaElement.classList.toggle("up", Number(delta || 0) > 0);
    deltaElement.classList.toggle("muted", Number(delta || 0) === 0);
  }
}

function dailyMetricText(label, value) {
  return `${displayDateLabel(label)}：${formatDelta(value, "")}`;
}

function createSummaryAccountCard(account) {
  const card = document.createElement("article");
  const title = document.createElement("div");
  const name = document.createElement("strong");
  const status = document.createElement("span");
  const dot = document.createElement("span");
  const xhsId = document.createElement("p");
  const metrics = document.createElement("div");
  const followers = document.createElement("span");
  const reads = document.createElement("span");
  const followerDelta = document.createElement("span");

  card.className = "summary-account-card";
  title.className = "account-title";
  name.textContent = accountDisplayName(account);
  status.className = "status-pill small";
  dot.className = `status-dot ${statusClass(account.status)}`;
  status.append(dot, statusText(account.status));
  title.append(name, status);
  xhsId.className = "account-subline";
  xhsId.textContent = accountIdText(account);
  metrics.className = "summary-metrics";
  if (hasMetricSnapshot(account)) {
    followers.append(createMetricValue(account.followers), " 粉丝");
    reads.append(createMetricValue(account.read_delta), ` ${metricDeltaSuffix(account)} 阅读`);
    followerDelta.append(createMetricValue(formatDelta(account.follower_delta, "")), ` ${metricDeltaSuffix(account)} 涨粉`);
  } else {
    followers.append(createMetricValue("待采集"), " 粉丝");
    reads.append(createMetricValue("待采集"), " 阅读");
    followerDelta.append(createMetricValue("待采集"), " 涨粉");
  }
  metrics.append(followers, reads, followerDelta);
  card.append(title, xhsId, metrics);

  return card;
}

function createMetricValue(value) {
  const element = document.createElement("b");
  element.textContent = typeof value === "number" ? formatNumber(value) : (value || "待采集");
  return element;
}

function createInsightItem(title, description) {
  const item = document.createElement("li");
  const strong = document.createElement("strong");
  const span = document.createElement("span");

  strong.textContent = title;
  span.textContent = description;
  item.append(strong, span);

  return item;
}

function renderInsights(totals, accounts) {
  if (!insightList) {
    return;
  }

  const primaryAccount = accounts[0] || null;
  const interactionDelta = Number(totals.like_delta || 0)
    + Number(totals.collection_delta || 0)
    + Number(totals.comment_delta || 0);
  const normalCount = accounts.filter((account) => account.status === "active").length;
  const items = [];

  if (primaryAccount) {
    const primaryDate = metricDeltaSuffix(primaryAccount);
    items.push(createInsightItem(
      `${accountDisplayName(primaryAccount)} 最近采集完成`,
      `${accountIdText(primaryAccount)} · ${primaryDate}阅读 ${formatNumber(primaryAccount.read_delta)} · ${primaryDate}曝光 ${formatNumber(primaryAccount.impression_delta)} · ${metricPeriodLabel(primaryAccount)}累计阅读 ${formatNumber(primaryAccount.reads)}。`,
    ));
  }

  items.push(createInsightItem(
    `互动${metricDailyLabel(totals)}新增 ${formatNumber(interactionDelta)}`,
    `${metricPeriodLabel(totals)} · 点赞 ${formatDelta(totals.like_delta, "")}，收藏 ${formatDelta(totals.collection_delta, "")}，评论 ${formatDelta(totals.comment_delta, "")}。`,
  ));
  items.push(createInsightItem(
    `${normalCount}/${accounts.length || 0} 个账号登录正常`,
    "账号标签、摘要卡片和笔记归属均使用本地同步的小红书昵称与小红书号。",
  ));

  insightList.replaceChildren(...items);
}

function createSvgNode(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function createChartTooltip(container) {
  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.hidden = true;
  tooltip.setAttribute("role", "tooltip");
  container.append(tooltip);
  return tooltip;
}

function renderTooltipContent(tooltip, title, rows = []) {
  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  const rowElements = rows.map(([label, value]) => {
    const row = document.createElement("span");
    const labelElement = document.createElement("em");
    const valueElement = document.createElement("b");
    labelElement.textContent = label;
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    return row;
  });
  tooltip.replaceChildren(titleElement, ...rowElements);
}

function positionChartTooltip(container, tooltip, anchor) {
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const safeInset = 12;
  const anchorCenter = anchorRect.left + anchorRect.width / 2 - containerRect.left;
  const left = Math.min(
    Math.max(anchorCenter, tooltipRect.width / 2 + safeInset),
    containerRect.width - tooltipRect.width / 2 - safeInset,
  );
  const top = Math.max(anchorRect.top - containerRect.top - 10, tooltipRect.height + safeInset);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function attachChartTooltip({
  container,
  tooltip,
  target,
  activeElement = target,
  title,
  rows,
}) {
  function show() {
    renderTooltipContent(tooltip, title, rows);
    tooltip.hidden = false;
    tooltip.classList.add("is-visible");
    activeElement.classList.add("is-hovered");
    positionChartTooltip(container, tooltip, target);
  }

  function hide() {
    tooltip.classList.remove("is-visible");
    activeElement.classList.remove("is-hovered");
    window.setTimeout(() => {
      if (!tooltip.classList.contains("is-visible")) {
        tooltip.hidden = true;
      }
    }, 120);
  }

  target.addEventListener("mouseenter", show);
  target.addEventListener("mousemove", show);
  target.addEventListener("focus", show);
  target.addEventListener("mouseleave", hide);
  target.addEventListener("blur", hide);
}

function renderInteractionTrend(series = []) {
  if (!interactionTrendChart) {
    return;
  }

  interactionTrendChart.replaceChildren();
  interactionTrendChart.classList.add("real-chart");

  if (!series.length) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "暂无真实趋势数据，完成一次采集后生成。";
    interactionTrendChart.append(empty);
    return;
  }

  const points = series.map((item) => ({
    date: item.metric_date,
    likes: Number(item.likes || 0),
    collections: Number(item.collections || 0),
    comments: Number(item.comments || 0),
    interactions: Number(item.interactions || 0),
  }));
  const width = chartCanvasWidth(points.length, 640, 56);
  const height = 248;
  const padding = { top: 28, right: 24, bottom: 34, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.interactions));
  const coordinates = points.map((point, index) => {
    const x = points.length === 1
      ? padding.left + chartWidth / 2
      : padding.left + (chartWidth * index) / (points.length - 1);
    const y = padding.top + chartHeight - (point.interactions / maxValue) * chartHeight;
    return { ...point, x, y };
  });
  const tooltip = createChartTooltip(interactionTrendChart);

  const svg = createSvgNode("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "真实互动趋势",
    preserveAspectRatio: "none",
  });
  [0, 0.5, 1].forEach((ratio) => {
    const y = padding.top + chartHeight * ratio;
    svg.append(createSvgNode("line", {
      x1: padding.left,
      y1: y,
      x2: width - padding.right,
      y2: y,
      class: "chart-grid-line",
    }));
  });

  const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  svg.append(createSvgNode("path", {
    d: path,
    class: "chart-trend-line",
  }));

  coordinates.forEach((point) => {
    const circle = createSvgNode("circle", {
      cx: point.x,
      cy: point.y,
      r: 5,
      class: "chart-point",
    });
    const hitArea = createSvgNode("circle", {
      cx: point.x,
      cy: point.y,
      r: 15,
      class: "chart-hit-area",
      tabindex: 0,
      "aria-label": `${displayDateLabel(point.date)} 互动 ${formatNumber(point.interactions)}`,
    });
    attachChartTooltip({
      container: interactionTrendChart,
      tooltip,
      target: hitArea,
      activeElement: circle,
      title: displayDateLabel(point.date),
      rows: [
        ["互动", formatNumber(point.interactions)],
        ["点赞", formatNumber(point.likes)],
        ["收藏", formatNumber(point.collections)],
        ["评论", formatNumber(point.comments)],
      ],
    });
    svg.append(circle, hitArea);
  });

  coordinates.forEach((point, index) => {
    const label = createSvgNode("text", {
      x: point.x,
      y: height - 12,
      "text-anchor": index === 0 ? "start" : index === coordinates.length - 1 ? "end" : "middle",
      class: "chart-axis-label",
    });
    label.textContent = compactDateLabel(point.date);
    svg.append(label);
  });

  const latest = points[points.length - 1];
  const totalInteractions = points.reduce((sum, point) => sum + point.interactions, 0);
  const legend = document.createElement("div");
  legend.className = "chart-legend";
  legend.textContent = `${latest.date.slice(5)} 互动 ${formatNumber(latest.interactions)} · ${dateRangeLabel()}合计 ${formatNumber(totalInteractions)}`;
  const scrollPane = createChartScrollPane(width);
  scrollPane.append(svg);
  interactionTrendChart.append(scrollPane, legend);
}

async function loadInteractionTrend() {
  if (!interactionTrendChart) {
    return;
  }

  const params = dateRangeSearchParams();
  const accountId = selectedAccountId();
  if (accountId) {
    params.set("accountId", String(accountId));
  }

  try {
    const payload = await requestJson(`/api/dashboard/trends?${params.toString()}`);
    renderInteractionTrend(payload.series || []);
  } catch (_error) {
    renderInteractionTrend([]);
  }
}

async function loadOverview() {
  if (!document.querySelector("[data-kpi-card]")) {
    return;
  }

  try {
    const [payload, authPayload] = await Promise.all([
      requestJson(apiPathWithDateRange("/api/dashboard/overview")),
      requestJson("/api/auth/sessions").catch(() => ({ sessions: [] })),
    ]);
    payload.accounts = applyAuthSessions(payload.accounts || [], authPayload.sessions || []);
    const { accounts, scopedAccounts, totals } = scopedOverview(payload);
    const deltaSuffix = metricDeltaSuffix(totals);
    setKpiCard("followers", totals.followers, totals.follower_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.follower_delta),
    });
    setKpiCard("reads", totals.reads, totals.read_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.read_delta),
    });
    setKpiCard("impressions", totals.impressions, totals.impression_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.impression_delta),
    });
    setKpiCard("likes", totals.likes, totals.like_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.like_delta),
    });
    setKpiCard("collections", totals.collections, totals.collection_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.collection_delta),
    });
    setKpiCard("comments", totals.comments, totals.comment_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.comment_delta),
    });
    setKpiCard("profileViews", totals.profile_views, totals.profile_view_delta, deltaSuffix, {
      deltaText: dailyMetricText(deltaSuffix, totals.profile_view_delta),
    });

    if (overviewNotice) {
      const scopeLabel = selectedAccountId() && scopedAccounts[0]
        ? accountDisplayName(scopedAccounts[0])
        : "全部账号";
      overviewNotice.textContent = `${scopeLabel} · ${dateRangeLabel()} · 阅读/曝光/互动 KPI 主值为所选区间累计，辅助行为 ${metricDailyLabel(totals)}增减 · 粉丝为当前总量 · ${metricSourceLabel(totals)} · ${formatNumber(totals.account_count)} 个账号生成快照`;
    }
    if (accountSummary) {
      accountSummary.replaceChildren(...scopedAccounts.map(createSummaryAccountCard));
    }
    updateStatusSummary(accounts);
    renderInsights(totals, scopedAccounts);
    renderScopeTabs(accounts);
  } catch (_error) {
    if (overviewNotice) {
      overviewNotice.textContent = "未连接本地 API，暂时无法显示真实数据。";
    }
  }
}

function createTableCell(...children) {
  const cell = document.createElement("td");
  cell.append(...children);
  return cell;
}

function createNoteRow(note) {
  const row = document.createElement("tr");
  const titleCell = document.createElement("td");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const accountLabel = document.createElement("span");

  title.textContent = note.title;
  meta.textContent = `${note.type || "图文"} · ${note.topic || "未分类"}`;
  titleCell.append(title, meta);
  accountLabel.className = "account-label";
  accountLabel.textContent = accountIdValue(note)
    ? `${note.account_name} · ID ${accountIdValue(note)}`
    : note.account_name;

  row.append(
    titleCell,
    createTableCell(accountLabel),
    createTableCell(note.published_at),
    createTableCell(formatMetricValue(note.reads), createMiniDelta(note.read_delta)),
    createTableCell(formatMetricValue(note.impressions), createMiniDelta(note.impression_delta)),
    createTableCell(formatMetricValue(note.likes)),
    createTableCell(formatMetricValue(note.collections)),
    createTableCell(formatMetricValue(note.comments)),
  );

  return row;
}

function createMiniDelta(delta) {
  const number = Number(delta || 0);
  if (delta === null || delta === undefined || number === 0) {
    return document.createTextNode("");
  }

  const element = document.createElement("span");
  element.className = number > 0 ? "mini-delta up" : "mini-delta muted";
  element.textContent = ` ${number > 0 ? "+" : ""}${formatNumber(number)}`;
  return element;
}

function createEmptyNoteRow(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 8;
  cell.className = "empty-state";
  cell.textContent = message;
  row.append(cell);

  return row;
}

function renderNotesError(message) {
  if (notesTable) {
    notesTable.replaceChildren(createEmptyNoteRow(message));
  }
  if (notesSummary) {
    notesSummary.textContent = message;
  }
}

function filteredNotes() {
  const query = String(notesSearchInput?.value || "").trim().toLowerCase();
  if (!query) {
    return currentNotes;
  }

  return currentNotes.filter((note) => [
    note.title,
    note.topic,
    note.type,
    note.account_name,
    note.account_xhs_id,
  ].some((value) => String(value || "").toLowerCase().includes(query)));
}

function renderNotesTable() {
  if (!notesTable) {
    return;
  }

  const notes = filteredNotes();
  const query = String(notesSearchInput?.value || "").trim();
  const coverage = noteCoverageForScope();
  const hiddenByDateRange = currentNotes.length === 0
    && coverage?.total_note_count > 0
    && coverage.range_note_count === 0;
  if (notes.length) {
    notesTable.replaceChildren(...notes.map(createNoteRow));
  } else if (hiddenByDateRange) {
    const historyRange = noteDateRangeLabel(coverage);
    const historyText = historyRange ? `，发布时间 ${historyRange}` : "";
    notesTable.replaceChildren(createEmptyNoteRow(
      `当前时间区间内暂无发布笔记；本地已采集 ${formatNumber(coverage.total_note_count)} 篇${historyText}，请调整右上角时间区间查看。`,
    ));
  } else {
    notesTable.replaceChildren(createEmptyNoteRow(query ? "没有匹配的笔记" : "暂无笔记数据"));
  }

  if (notesSummary) {
    const accounts = new Set(notes.map((note) => note.account_name));
    const scopeLabel = selectedAccountId() ? "当前账号" : "全部账号";
    const matchText = query ? ` · 匹配 ${notes.length}/${currentNotes.length} 篇` : "";
    if (hiddenByDateRange) {
      const historyRange = noteDateRangeLabel(coverage);
      const historyText = historyRange ? `（${historyRange}）` : "";
      notesSummary.textContent = `SQLite 数据 · ${scopeLabel} · ${dateRangeLabel()}发布 · 当前区间 0 篇 · 本地已采集 ${formatNumber(coverage.total_note_count)} 篇${historyText}`;
      return;
    }

    notesSummary.textContent = `SQLite 数据 · ${scopeLabel} · ${dateRangeLabel()}发布 · ${accounts.size} 个账号共 ${notes.length} 篇${matchText} · 默认发布时间倒序`;
  }
}

async function loadNotes() {
  if (!notesTable) {
    return;
  }

  let payload;
  try {
    payload = await requestJson(apiPathWithDateRange("/api/dashboard/notes"));
  } catch (_error) {
    currentNoteCoverage = null;
    currentNotes = [];
    renderNotesError("未连接本地 API，暂时无法显示真实数据。");
    return;
  }

  try {
    currentNoteCoverage = payload.coverage || null;
    currentNotes = notesForScope(payload.notes || []);
    renderNotesTable();
  } catch (error) {
    renderNotesError(`笔记数据渲染异常：${error.message || "未知错误"}`);
  }
}

function createComparisonCard(label, strongText, detailText) {
  const card = document.createElement("article");
  const labelElement = document.createElement("span");
  const strong = document.createElement("strong");
  const detail = document.createElement("small");

  labelElement.textContent = label;
  strong.textContent = strongText;
  detail.textContent = detailText;
  card.append(labelElement, strong, detail);

  return card;
}

function renderFollowerGrowthChart(series = []) {
  if (!trendFollowersChart) {
    return;
  }

  trendFollowersChart.replaceChildren();
  trendFollowersChart.classList.add("real-bar-chart");

  if (!series.length) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "暂无真实粉丝增长数据，完成采集后生成。";
    trendFollowersChart.append(empty);
    return;
  }

  const points = series.map((item) => ({
    date: item.metric_date,
    value: Number(item.follower_delta || 0),
  }));
  const maxAbs = Math.max(1, ...points.map((point) => Math.abs(point.value)));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const tooltip = createChartTooltip(trendFollowersChart);
  const width = chartCanvasWidth(points.length, 640, 48);
  const scrollPane = createChartScrollPane(width, "bar-chart-scroll-pane");
  const trackElement = document.createElement("div");
  trackElement.className = "bar-chart-track";

  points.forEach((point) => {
    const item = document.createElement("div");
    const valueLabel = document.createElement("span");
    const track = document.createElement("div");
    const bar = document.createElement("span");
    const dateLabel = document.createElement("small");
    const height = Math.max(4, Math.round((Math.abs(point.value) / maxAbs) * 100));
    const deltaText = signedNumber(point.value);

    item.className = "trend-bar-item";
    valueLabel.className = point.value < 0 ? "trend-bar-value negative" : "trend-bar-value";
    valueLabel.textContent = deltaText;
    track.className = "trend-bar-track";
    bar.className = point.value < 0 ? "trend-bar negative" : "trend-bar";
    bar.style.height = `${height}%`;
    item.tabIndex = 0;
    item.setAttribute("aria-label", `${displayDateLabel(point.date)} 净涨粉 ${deltaText}`);
    dateLabel.textContent = compactDateLabel(point.date);
    track.append(bar);
    item.append(valueLabel, track, dateLabel);
    attachChartTooltip({
      container: trendFollowersChart,
      tooltip,
      target: item,
      activeElement: bar,
      title: displayDateLabel(point.date),
      rows: [
        ["净涨粉", deltaText],
      ],
    });
    trackElement.append(item);
  });

  const legend = document.createElement("p");
  legend.className = "bar-chart-legend";
  legend.textContent = `${points[0].date.slice(5)} 至 ${points[points.length - 1].date.slice(5)} · 净增长 ${total > 0 ? "+" : ""}${formatNumber(total)}`;
  scrollPane.append(trackElement);
  trendFollowersChart.append(scrollPane, legend);
}

function renderExposureReadChart(series = []) {
  if (!trendImpressionsChart) {
    return;
  }

  trendImpressionsChart.replaceChildren();
  trendImpressionsChart.classList.add("real-chart");

  if (!series.length) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "暂无真实曝光与阅读数据，完成采集后生成。";
    trendImpressionsChart.append(empty);
    return;
  }

  const points = series.map((item) => ({
    date: item.metric_date,
    reads: Number(item.reads || 0),
    impressions: Number(item.impressions || 0),
  }));
  const width = chartCanvasWidth(points.length, 640, 56);
  const height = 300;
  const padding = { top: 28, right: 24, bottom: 42, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.reads, point.impressions]));

  function coordinates(key) {
    return points.map((point, index) => {
      const x = points.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (chartWidth * index) / (points.length - 1);
      const y = padding.top + chartHeight - (point[key] / maxValue) * chartHeight;
      return { ...point, x, y, value: point[key] };
    });
  }

  function pathFrom(coords) {
    return coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  }

  const impressionCoords = coordinates("impressions");
  const readCoords = coordinates("reads");
  const tooltip = createChartTooltip(trendImpressionsChart);
  const svg = createSvgNode("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "真实曝光与阅读趋势",
    preserveAspectRatio: "none",
  });

  [0, 0.5, 1].forEach((ratio) => {
    const y = padding.top + chartHeight * ratio;
    svg.append(createSvgNode("line", {
      x1: padding.left,
      y1: y,
      x2: width - padding.right,
      y2: y,
      class: "chart-grid-line",
    }));
  });

  svg.append(createSvgNode("path", {
    d: pathFrom(impressionCoords),
    class: "chart-trend-line",
  }));
  svg.append(createSvgNode("path", {
    d: pathFrom(readCoords),
    class: "chart-trend-line secondary",
  }));

  [
    { coords: impressionCoords, label: "曝光", className: "chart-point", seriesKey: "impressions" },
    { coords: readCoords, label: "阅读", className: "chart-point secondary", seriesKey: "reads" },
  ].forEach((group) => {
    group.coords.forEach((point) => {
      const circle = createSvgNode("circle", {
        cx: point.x,
        cy: point.y,
        r: 4,
        class: group.className,
      });
      const hitArea = createSvgNode("circle", {
        cx: point.x,
        cy: point.y,
        r: 14,
        class: "chart-hit-area",
        tabindex: 0,
        "aria-label": `${displayDateLabel(point.date)} ${group.label} ${formatNumber(point.value)}`,
      });
      attachChartTooltip({
        container: trendImpressionsChart,
        tooltip,
        target: hitArea,
        activeElement: circle,
        title: displayDateLabel(point.date),
        rows: [
          [group.label, formatNumber(point.value)],
          [group.seriesKey === "impressions" ? "阅读" : "曝光", formatNumber(group.seriesKey === "impressions" ? point.reads : point.impressions)],
        ],
      });
      svg.append(circle, hitArea);
    });
  });

  impressionCoords.forEach((point, index) => {
    const label = createSvgNode("text", {
      x: point.x,
      y: height - 12,
      "text-anchor": index === 0 ? "start" : index === impressionCoords.length - 1 ? "end" : "middle",
      class: "chart-axis-label",
    });
    label.textContent = compactDateLabel(point.date);
    svg.append(label);
  });

  const totalReads = points.reduce((sum, point) => sum + point.reads, 0);
  const totalImpressions = points.reduce((sum, point) => sum + point.impressions, 0);
  const legend = document.createElement("div");
  legend.className = "chart-legend split";
  legend.innerHTML = `<span>曝光 ${formatNumber(totalImpressions)}</span><span>阅读 ${formatNumber(totalReads)}</span>`;
  const scrollPane = createChartScrollPane(width);
  scrollPane.append(svg);
  trendImpressionsChart.append(scrollPane, legend);
}

async function loadTrends() {
  if (!trendComparison) {
    return;
  }

  try {
    const trendParams = dateRangeSearchParams();
    const selectedId = selectedAccountId();
    if (selectedId) {
      trendParams.set("accountId", String(selectedId));
    }
    const [payload, trendPayload] = await Promise.all([
      requestJson(apiPathWithDateRange("/api/dashboard/overview")),
      requestJson(`/api/dashboard/trends?${trendParams.toString()}`),
    ]);
    const { accounts, scopedAccounts, totals } = scopedOverview(payload);
    const scopeLabel = selectedAccountId() && scopedAccounts[0]
      ? accountDisplayName(scopedAccounts[0])
      : "全部账号";
    const deltaSuffix = metricDeltaSuffix(totals);
    const trendSeries = trendPayload.series || [];
    const trendTotalFollowers = trendSeries.reduce((sum, point) => sum + Number(point.follower_delta || 0), 0);
    const trendTotalReads = trendSeries.reduce((sum, point) => sum + Number(point.reads || 0), 0);
    const trendTotalImpressions = trendSeries.reduce((sum, point) => sum + Number(point.impressions || 0), 0);
    const trendStart = trendSeries[0]?.metric_date?.slice(5) || "";
    const trendEnd = trendSeries[trendSeries.length - 1]?.metric_date?.slice(5) || "";
    const trendRangeText = trendStart && trendEnd ? `${trendStart} 至 ${trendEnd}` : dateRangeLabel();

    renderFollowerGrowthChart(trendSeries);
    renderExposureReadChart(trendSeries);
    if (trendFollowersTitle) {
      trendFollowersTitle.textContent = `${scopeLabel}粉丝增长`;
    }
    if (trendImpressionsTitle) {
      trendImpressionsTitle.textContent = `${scopeLabel}曝光与阅读`;
    }
    if (trendFollowersSummary) {
      trendFollowersSummary.textContent = `所选区间 · ${dateRangeLabel()} · 有数据日期 ${trendRangeText} · ${scopeLabel} 净增长 ${formatDelta(trendTotalFollowers, "")}，共 ${formatNumber(totals.account_count)} 个账号。`;
    }
    if (trendFollowersBadge) {
      trendFollowersBadge.textContent = formatDelta(trendTotalFollowers, "");
    }
    if (trendImpressionsBadge) {
      trendImpressionsBadge.textContent = formatNumber(trendTotalImpressions);
    }
    if (trendImpressionsSummary) {
      trendImpressionsSummary.textContent = `所选区间 · ${dateRangeLabel()} · 有数据日期 ${trendRangeText} · ${scopeLabel} 曝光 ${formatNumber(trendTotalImpressions)}，阅读 ${formatNumber(trendTotalReads)}。`;
    }

    const cards = scopedAccounts.map((account) => {
      if (!hasMetricSnapshot(account)) {
        return createComparisonCard(
          accountDisplayName(account),
          "待采集",
          `${accountIdText(account)} · ${statusText(account.status)}，暂无可靠数据快照`,
        );
      }

      return createComparisonCard(
        accountDisplayName(account),
        `${formatNumber(account.reads)} 阅读`,
        `${accountIdText(account)} · ${metricPeriodLabel(account)} · 曝光 ${formatNumber(account.impressions)} · ${metricDeltaSuffix(account)}涨粉 ${formatDelta(account.follower_delta, "")}`,
      );
    });
    if (!selectedAccountId()) {
      cards.push(createComparisonCard(
        "全部账号",
        `${formatNumber(totals.reads)} 阅读`,
        `曝光 ${formatNumber(totals.impressions)} · ${deltaSuffix}新增阅读 ${formatDelta(totals.read_delta, "")} · 涨粉 ${formatDelta(totals.follower_delta, "")}`,
      ));
    }
    trendComparison.replaceChildren(...cards);
    renderScopeTabs(accounts);
  } catch (_error) {
    if (trendFollowersSummary) {
      trendFollowersSummary.textContent = "未连接本地 API，暂时无法显示真实数据。";
    }
  }
}

function collectionStartedLabel(job) {
  if (!job?.startedAt) {
    return "正在后台采集";
  }

  return `${new Date(job.startedAt).toLocaleString("zh-CN", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })} 开始后台采集`;
}

function createTaskStateCard(account, authSession, collectionJob) {
  const card = document.createElement("article");
  const dot = document.createElement("span");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const status = statusText(account.status);
  const capturedAt = account.lastCollectedAt || "尚未采集";
  const authLabel = authSession ? authSession.label : "登录态未检测";
  const collecting = isCollectionRunning(collectionJob);

  card.className = "panel state-card";
  dot.className = `status-dot ${collecting ? "warning" : authSession ? authStatusClass(authSession.status) : statusClass(account.status)}`;
  title.textContent = accountDisplayName(account);
  description.textContent = collecting
    ? `${accountIdText(account)} · 后台采集中 · ${authLabel} · 最近采集：${capturedAt}`
    : `${accountIdText(account)} · ${status} · ${authLabel} · 最近采集：${capturedAt}`;
  card.append(dot, title, description);

  return card;
}

function createQueueCard(account, authSession, collectionJob) {
  const card = document.createElement("article");
  const dot = document.createElement("span");
  const name = document.createElement("strong");
  const description = document.createElement("p");
  const collecting = isCollectionRunning(collectionJob);

  dot.className = `status-dot ${collecting ? "warning" : authSession ? authStatusClass(authSession.status) : statusClass(account.status)}`;
  name.textContent = accountDisplayName(account);
  if (collecting) {
    description.textContent = `${accountIdText(account)} · ${collectionStartedLabel(collectionJob)} · ${authSession?.label || "登录态检测中"}`;
  } else if (authSession?.status === "session_ready") {
    description.textContent = `${accountIdText(account)} · 等待下一次 10:00 自动采集 · ${authSession.label} · ${loginMethodText(account.loginMethod)}`;
  } else if (authSession?.status === "login_in_progress") {
    description.textContent = `${accountIdText(account)} · 人工登录进行中 · 完成后保存 session · ${loginMethodText(account.loginMethod)}`;
  } else {
    description.textContent = `${accountIdText(account)} · 采集前需要人工登录授权 · ${loginMethodText(account.loginMethod)}`;
  }
  card.append(dot, name, description);

  return card;
}

function formatLogCreatedAt(log = {}) {
  const value = log.created_at_local || log.createdAtLocal || log.created_at || log.createdAt || "";
  if (!value) {
    return "时间未知";
  }

  return String(value)
    .replace("T", " ")
    .replaceAll("-", "/")
    .slice(0, 16);
}

function createLogItem(log) {
  const item = document.createElement("li");
  const dot = document.createElement("span");
  const body = document.createElement("div");
  const title = document.createElement("strong");
  const message = document.createElement("p");

  dot.className = `timeline-dot ${statusClass(log.level === "success" ? "active" : log.level === "error" ? "error" : "pending")}`;
  title.textContent = `${formatLogCreatedAt(log)} · ${log.account_name || "全部账号"}`;
  message.textContent = log.message;
  body.append(title, message);
  item.append(dot, body);

  return item;
}

function createEmptyLogItem() {
  const item = document.createElement("li");
  const dot = document.createElement("span");
  const body = document.createElement("div");
  const title = document.createElement("strong");
  const message = document.createElement("p");

  dot.className = "timeline-dot warning";
  title.textContent = "暂无采集日志";
  message.textContent = "点击右上角采集后，这里会显示最近 5 次执行记录。";
  body.append(title, message);
  item.append(dot, body);

  return item;
}

async function loadTasks() {
  if (!taskStateGrid && !taskQueue && !collectionLogs) {
    return;
  }

  try {
    const [{ accounts }, { logs }, authPayload, collectionPayload] = await Promise.all([
      requestJson("/api/accounts"),
      requestJson("/api/collection-logs?limit=5"),
      requestJson("/api/auth/sessions"),
      requestJson("/api/collections/status").catch(() => ({ job: null })),
    ]);
    const authSessions = authPayload.sessions || [];
    const collectionJob = collectionPayload.job || null;
    const authByKey = new Map(authSessions.map((session) => [session.credentialKey, session]));
    const scopedAccounts = accountsForScope(accounts);
    const scopedAccountIds = new Set(scopedAccounts.map((account) => Number(account.id)));
    const scopedAuthSessions = selectedAccountId()
      ? authSessions.filter((session) => scopedAccountIds.has(Number(session.accountId)))
      : authSessions;
    const scopedLogs = logsForScope(logs);
    updateCollectionJobUi(collectionJob, { notify: false });
    if (taskStateGrid) {
      taskStateGrid.replaceChildren(...scopedAccounts.map((account) => (
        createTaskStateCard(account, authByKey.get(account.credentialKey), collectionJob)
      )));
    }
    renderScopeTabs(accounts);
    if (taskQueue) {
      taskQueue.replaceChildren(...scopedAccounts.map((account) => (
        createQueueCard(account, authByKey.get(account.credentialKey), collectionJob)
      )));
    }
    if (authSessionList) {
      authSessionList.replaceChildren(...scopedAuthSessions.map(createAuthSessionItem));
      updateAuthSessionSummary(scopedAuthSessions);
      scheduleAuthSessionPolling(scopedAuthSessions);
    }
    if (collectionLogs) {
      collectionLogs.replaceChildren(...(scopedLogs.length ? scopedLogs.map(createLogItem) : [createEmptyLogItem()]));
    }
  } catch (_error) {
    if (collectionLogs) {
      const item = document.createElement("li");
      item.textContent = "未连接本地 API，暂时无法显示真实数据。";
      collectionLogs.replaceChildren(item);
    }
  }
}

if (accountForm && accountList) {
  updateLoginMethodFields();
  loadAccounts();
  loadCredentialStatus();
  loadAuthSessions();

  openAccountDialogButton?.addEventListener("click", openAccountDialog);
  closeAccountDialogButtons.forEach((button) => {
    button.addEventListener("click", closeAccountDialog);
  });
  accountDialog?.addEventListener("click", (event) => {
    if (event.target === accountDialog) {
      closeAccountDialog();
    }
  });

  accountForm.querySelectorAll('input[name="loginMethod"]').forEach((input) => {
    input.addEventListener("change", updateLoginMethodFields);
  });

  accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(accountForm);
    const accountName = String(formData.get("accountName") || "新账号").trim();
    const profileUrl = String(formData.get("profileUrl") || "").trim();
    const loginMethod = String(formData.get("loginMethod") || "password");
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!profileUrl) {
      setFormMessage("主页链接不能为空。", "error");
      return;
    }
    if (loginMethod === "password" && (!username || !password)) {
      setFormMessage("手机号/密码登录需要填写账号和密码。", "error");
      return;
    }

    try {
      await requestJson("/api/accounts", {
        method: "POST",
        body: JSON.stringify({
          name: accountName,
          profileUrl,
          loginMethod,
          username,
          password,
        }),
      });
      await loadAccounts();
      await loadCredentialStatus();
      await loadAuthSessions();
      accountForm.reset();
      updateLoginMethodFields();
      setFormMessage(`账号「${accountName}」已保存。${loginMethod === "wechat" ? "请在登录授权区域扫码授权。" : "登录凭据已写入本地 .env。"}`, "success");
      closeAccountDialog();
    } catch (error) {
      setFormMessage(error.message, "error");
    }
  });

  accountList.addEventListener("click", async (event) => {
    const target = event.target;
    const card = target.closest(".account-card");
    if (!card) {
      return;
    }

    const accountId = card.dataset.accountId;

    if (target.matches("[data-delete-account]")) {
      const accountName = card.querySelector(".account-title strong")?.textContent || "该账号";
      if (!window.confirm(`确认删除「${accountName}」吗？该操作会同步删除本地快照数据。`)) {
        return;
      }

      try {
        await requestJson(`/api/accounts/${accountId}`, { method: "DELETE" });
        await loadAccounts();
        await loadCredentialStatus();
        await loadAuthSessions();
        setFormMessage("账号已从 SQLite 删除。", "success");
      } catch (error) {
        setFormMessage(error.message, "error");
      }
    }

    if (target.matches("[data-default-account]")) {
      try {
        await requestJson(`/api/accounts/${accountId}/default`, { method: "PATCH" });
        await loadAccounts();
        await loadCredentialStatus();
        await loadAuthSessions();
        setFormMessage("默认账号已更新。", "success");
      } catch (error) {
        setFormMessage(error.message, "error");
      }
    }
  });
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.matches("[data-auth-login]")) {
    return;
  }

  const originalText = target.textContent;
  target.disabled = true;
  target.textContent = "正在启动...";

  try {
    await requestJson(`/api/auth/sessions/${target.dataset.authLogin}/bootstrap`, { method: "POST" });
    target.textContent = "等待登录";
    await Promise.all([loadAuthSessions(), loadTasks()]);
  } catch (error) {
    target.textContent = "启动失败";
    setFormMessage(error.message, "error");
  }

  window.setTimeout(() => {
    target.disabled = false;
    target.textContent = originalText;
  }, 1200);
});

if (notesSearchInput) {
  notesSearchInput.addEventListener("input", renderNotesTable);
}

dateRangeForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const startInput = form.querySelector("[data-date-range-start]");
    const endInput = form.querySelector("[data-date-range-end]");
    const range = normalizeDateRange(startInput?.value, endInput?.value);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || "应用";

    if (!range) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "应用中";
    }

    try {
      await applyDateRange(range);
      if (submitButton) {
        submitButton.textContent = "已应用";
      }
    } finally {
      window.setTimeout(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }, 700);
    }
  });
});

async function initializeApp() {
  await initializeDateRange();
  requestCollectionStatusUpdate({ notify: true });
  await loadScopeAccounts();
  await Promise.all([
    loadOverview(),
    loadInteractionTrend(),
    loadNotes(),
    loadTrends(),
    loadTasks(),
    loadSchedulerStatus(),
  ]);
}

initializeApp().catch(() => {});

async function refreshAfterVisibilityChange() {
  const now = Date.now();
  if (now - lastAutoRefreshAt < 3000) {
    return;
  }

  lastAutoRefreshAt = now;
  requestCollectionStatusUpdate({ notify: true });
  await Promise.all([
    loadScopeAccounts(),
    refreshScopedSections(),
  ]);
}

window.addEventListener("focus", () => {
  refreshAfterVisibilityChange().catch(() => {});
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshAfterVisibilityChange().catch(() => {});
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const chip = target.closest(".scope-chip");
  const container = chip?.closest(".scope-tabs");
  if (!chip || !container) {
    return;
  }

  selectedScope = chip.dataset.scope || "all";
  document.querySelectorAll(".scope-tabs .scope-chip").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelectorAll(`.scope-chip[data-scope="${selectedScope}"]`).forEach((item) => {
    item.classList.add("active");
  });
  await refreshScopedSections();
});

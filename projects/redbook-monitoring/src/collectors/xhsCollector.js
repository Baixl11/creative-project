import { chromium } from "playwright";

import { getAuthStorageStatePath } from "../authSessions.js";

const creatorHomeUrl = "https://creator.xiaohongshu.com/new/home";
const noteManagerUrl = "https://creator.xiaohongshu.com/new/note-manager";
const postedNotesSourceName = "/api/galaxy/v2/creator/note/user/posted";

function numberValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function textValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function dateFromTimestamp(value) {
  const timestamp = Number(value || 0);
  if (!timestamp) {
    return new Date().toISOString().slice(0, 10);
  }

  return localDateFromTimestamp(timestamp);
}

function dateFromNoteTime(value) {
  const text = textValue(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : dateFromTimestamp(0);
}

function localDateFromTimestamp(value) {
  const timestamp = Number(value || 0);
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toLocaleDateString("sv-SE", {
    timeZone: "Asia/Shanghai",
  });
}

function localCapturedAt() {
  return new Date().toLocaleString("sv-SE", {
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
}

async function fetchHomeData(page) {
  return page.evaluate(async () => {
    async function getJson(path) {
      const response = await fetch(path, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`请求失败：${path}`);
      }

      return response.json();
    }

    async function tryGetJson(path) {
      try {
        return await getJson(path);
      } catch (_error) {
        return null;
      }
    }

    const personal = await getJson("/api/galaxy/creator/home/personal_info");
    const latestNote = await getJson("/api/galaxy/creator/home/latest_note_data");
    const noteId = latestNote?.data?.noteInfo?.id;
    const noteBase = noteId
      ? await tryGetJson(`/api/galaxy/creator/datacenter/note/base?note_id=${encodeURIComponent(noteId)}`)
      : null;

    return { personal, latestNote, noteBase };
  });
}

async function fetchPostedNotes(page) {
  const seenUrls = new Set();
  const collectedNotes = new Map();
  let lastPage = null;
  let expectedCount = null;

  async function collectResponse(response) {
    const url = response.url();
    if (!url.includes(postedNotesSourceName) || response.status() !== 200 || seenUrls.has(url)) {
      return;
    }

    seenUrls.add(url);
    const body = await response.json().catch(() => null);
    const notes = Array.isArray(body?.data?.notes) ? body.data.notes : [];
    const tagCounts = Array.isArray(body?.data?.tags)
      ? body.data.tags.map((tag) => numberValue(tag?.notes_count)).filter((count) => count >= 0)
      : [];
    if (tagCounts.length) {
      expectedCount = Math.max(...tagCounts);
    }
    notes.forEach((note) => {
      if (note?.id) {
        collectedNotes.set(String(note.id), note);
      }
    });
    lastPage = body?.data?.page;
  }

  const firstResponsePromise = page.waitForResponse((response) => (
    response.url().includes(postedNotesSourceName) && response.status() === 200
  ), { timeout: 25000 });

  await page.goto(noteManagerUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await collectResponse(await firstResponsePromise);

  for (let index = 0; index < 20 && lastPage !== -1; index += 1) {
    const nextResponsePromise = page.waitForResponse((response) => (
      response.url().includes(postedNotesSourceName)
        && response.status() === 200
        && !seenUrls.has(response.url())
    ), { timeout: 3500 }).catch(() => null);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const nextResponse = await nextResponsePromise;
    if (!nextResponse) {
      break;
    }
    await collectResponse(nextResponse);
  }

  return {
    complete: lastPage === -1 && (expectedCount === null || collectedNotes.size >= expectedCount),
    expectedCount,
    notes: [...collectedNotes.values()],
    sourceName: postedNotesSourceName,
  };
}

function assertLoggedIn(page, personal) {
  if (page.url().includes("/login") || !personal?.success) {
    throw Object.assign(new Error("登录态失效，请重新授权。"), { code: "SESSION_EXPIRED" });
  }
}

function latestListPoint(period, key) {
  const list = Array.isArray(period?.[key]) ? period[key] : [];
  const point = list
    .filter((item) => Number(item?.date || 0) > 0)
    .sort((left, right) => Number(right.date) - Number(left.date))[0];

  return {
    count: numberValue(point?.count),
    date: localDateFromTimestamp(point?.date),
  };
}

function dailyMetricsFromPeriod(period, metricPeriod, sourceName) {
  const byDate = new Map();

  function ensureMetric(metricDate) {
    if (!byDate.has(metricDate)) {
      byDate.set(metricDate, {
        metricDate,
        metricPeriod,
        reads: 0,
        impressions: 0,
        likes: 0,
        collections: 0,
        comments: 0,
        profileViews: 0,
        followerDelta: 0,
        sourceName,
      });
    }

    return byDate.get(metricDate);
  }

  function applyList(listKey, metricKey) {
    const list = Array.isArray(period?.[listKey]) ? period[listKey] : [];
    list.forEach((item) => {
      const metricDate = localDateFromTimestamp(item?.date);
      if (!metricDate) {
        return;
      }

      ensureMetric(metricDate)[metricKey] = numberValue(item?.count);
    });
  }

  applyList("view_list", "reads");
  applyList("impl_count_list", "impressions");
  applyList("like_list", "likes");
  applyList("collect_list", "collections");
  applyList("comment_list", "comments");
  applyList("home_view_list", "profileViews");
  applyList("net_rise_fans_count_list", "followerDelta");

  return [...byDate.values()].sort((left, right) => left.metricDate.localeCompare(right.metricDate));
}

function nonNegativeValue(value) {
  const number = numberValue(value);
  return number > 0 ? number : 0;
}

function postedNoteSnapshot(note) {
  return {
    sourceNoteId: String(note.id || ""),
    sourceLink: note.id ? `https://www.xiaohongshu.com/explore/${note.id}` : "",
    title: textValue(note.display_title) || "未命名笔记",
    type: String(note.type || "").toLowerCase().includes("video") ? "视频" : "图文",
    topic: "笔记管理",
    publishedAt: dateFromNoteTime(note.time || note.visible_time || note.schedule_post_time),
    reads: numberValue(note.view_count),
    impressions: 0,
    likes: numberValue(note.likes),
    collections: numberValue(note.collected_count),
    comments: numberValue(note.comments_count),
    followerDelta: 0,
    readDelta: 0,
    impressionDelta: 0,
    metricsAvailable: true,
    readsAvailable: true,
    impressionsAvailable: false,
    likesAvailable: true,
    collectionsAvailable: true,
    commentsAvailable: true,
    followerDeltaAvailable: false,
    sourceName: postedNotesSourceName,
  };
}

function parseCollectedData({ account, personal, accountBase, latestNote, noteBase, postedNotes }) {
  const profile = personal.data || {};
  const seven = accountBase?.data?.seven || {};
  const thirty = accountBase?.data?.thirty || {};
  const accountSourceName = "/api/galaxy/v2/creator/datacenter/account/base";
  const latestView = latestListPoint(seven, "view_list");
  const latestImpression = latestListPoint(seven, "impl_count_list");
  const latestLike = latestListPoint(seven, "like_list");
  const latestCollection = latestListPoint(seven, "collect_list");
  const latestComment = latestListPoint(seven, "comment_list");
  const latestProfileView = latestListPoint(seven, "home_view_list");
  const latestFollower = latestListPoint(seven, "net_rise_fans_count_list");
  const metricDate = latestView.date
    || latestImpression.date
    || localDateFromTimestamp(seven.end_time);
  const noteInfo = latestNote?.data?.noteInfo || null;
  const noteStats = noteBase?.data || {};
  const noteStatsInfo = noteStats.note_info || {};
  const hasNoteMetrics = Boolean(noteBase?.data);

  const accountSnapshot = {
    followers: numberValue(profile.fans_count),
    reads: numberValue(seven.view_count),
    impressions: numberValue(seven.impl_count),
    likes: numberValue(seven.like_count),
    collections: numberValue(seven.collect_count),
    comments: numberValue(seven.comment_count),
    profileViews: numberValue(seven.home_view_count),
    followerDelta: latestFollower.count,
    readDelta: latestView.count,
    impressionDelta: latestImpression.count,
    likeDelta: latestLike.count,
    collectionDelta: latestCollection.count,
    commentDelta: latestComment.count,
    profileViewDelta: latestProfileView.count,
    metricPeriod: "seven",
    periodStart: localDateFromTimestamp(seven.begin_time),
    periodEnd: localDateFromTimestamp(seven.end_time),
    dailyMetricDate: metricDate,
    sourceName: accountSourceName,
  };

  const latestNoteSnapshot = noteInfo ? {
    sourceNoteId: String(noteInfo.id || ""),
    sourceLink: noteInfo.link || "",
    title: noteInfo.title || "未命名笔记",
    type: noteInfo.type === "video" ? "视频" : "图文",
    topic: "创作者中心",
    publishedAt: dateFromTimestamp(noteInfo.postTime),
    reads: nonNegativeValue(noteStats.view_count ?? noteStatsInfo.view_count),
    impressions: nonNegativeValue(noteStats.impl_count),
    likes: nonNegativeValue(noteStats.like_count ?? noteStatsInfo.like_count),
    collections: nonNegativeValue(noteStats.collect_count),
    comments: nonNegativeValue(noteStats.comment_count ?? noteStatsInfo.comment_count),
    followerDelta: nonNegativeValue(noteStats.rise_fans_count),
    readDelta: 0,
    impressionDelta: 0,
    metricsAvailable: hasNoteMetrics,
    readsAvailable: hasNoteMetrics,
    impressionsAvailable: hasNoteMetrics && numberValue(noteStats.impl_count) >= 0,
    likesAvailable: hasNoteMetrics,
    collectionsAvailable: hasNoteMetrics,
    commentsAvailable: hasNoteMetrics,
    followerDeltaAvailable: hasNoteMetrics && numberValue(noteStats.rise_fans_count) >= 0,
    sourceName: hasNoteMetrics ? "/api/galaxy/creator/datacenter/note/base" : "",
  } : null;
  const noteSnapshots = postedNotes?.notes?.length
    ? postedNotes.notes.map(postedNoteSnapshot)
    : (latestNoteSnapshot ? [latestNoteSnapshot] : []);

  return {
    accountId: account.id,
    accountName: profile.name || account.name,
    profile: {
      xhsName: textValue(profile.name),
      xhsAccountId: textValue(profile.red_num || profile.user_id || profile.userId),
    },
    capturedAt: localCapturedAt(),
    accountSnapshot,
    dailyMetrics: [
      ...dailyMetricsFromPeriod(seven, "seven", accountSourceName),
      ...dailyMetricsFromPeriod(thirty, "thirty", accountSourceName),
    ],
    noteSnapshots,
    noteSync: {
      actualCount: noteSnapshots.length,
      expectedCount: postedNotes?.expectedCount ?? null,
      complete: postedNotes?.complete ?? false,
      sourceName: postedNotes?.sourceName || "",
    },
    latestNoteSnapshot,
  };
}

export async function collectXhsAccount(account) {
  const storageState = getAuthStorageStatePath(account);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();
  const accountBasePromise = page.waitForResponse((response) => (
    response.url().includes("/api/galaxy/v2/creator/datacenter/account/base")
      && response.status() === 200
  ), { timeout: 20000 })
    .then((response) => response.json())
    .catch(() => null);

  try {
    await page.goto(creatorHomeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(6000);
    const [homeData, accountBase] = await Promise.all([
      fetchHomeData(page),
      accountBasePromise,
    ]);

    assertLoggedIn(page, homeData.personal);
    if (!homeData.personal?.data?.user_id && !homeData.personal?.data?.red_num) {
      throw new Error("未获取到已登录账号标识，本次数据不予写入。");
    }
    if (!accountBase?.data?.seven || !accountBase?.data?.thirty) {
      throw new Error("未完整获取创作者中心 7 日和 30 日账号数据，本次数据不予写入。");
    }
    const postedNotes = await fetchPostedNotes(page).catch(() => ({ complete: false, notes: [], sourceName: postedNotesSourceName }));
    return parseCollectedData({
      account,
      personal: homeData.personal,
      accountBase,
      latestNote: homeData.latestNote,
      noteBase: homeData.noteBase,
      postedNotes,
    });
  } finally {
    await browser.close();
  }
}

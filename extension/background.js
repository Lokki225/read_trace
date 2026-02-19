"use strict";
(() => {
  // src/extension/logger.ts
  var MAX_LOG_ENTRIES = 200;
  var debugMode = false;
  var logHistory = [];
  function addEntry(level, event, details) {
    const entry = {
      timestamp: Date.now(),
      level,
      event,
      details
    };
    logHistory.push(entry);
    if (logHistory.length > MAX_LOG_ENTRIES) {
      logHistory.splice(0, logHistory.length - MAX_LOG_ENTRIES);
    }
  }
  function log(event, details) {
    addEntry("info", event, details);
    if (debugMode) {
      console.log(`[ReadTrace] ${event}`, details ?? "");
    }
  }
  function debug(message, details) {
    addEntry("debug", message, details);
    if (debugMode) {
      console.debug(`[ReadTrace:debug] ${message}`, details ?? "");
    }
  }
  function warn(message, details) {
    addEntry("warn", message, details);
    console.warn(`[ReadTrace:warn] ${message}`, details ?? "");
  }
  function error(message, err) {
    const details = err instanceof Error ? { message: err.message, stack: err.stack } : err;
    addEntry("error", message, details);
    console.error(`[ReadTrace:error] ${message}`, details ?? "");
  }

  // src/extension/api.ts
  var SYNC_TIMEOUT_MS = 5e3;
  var API_BASE_URL = "http://localhost:3000";
  var authToken = null;
  function buildHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
  }
  async function syncProgress(update, userId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
    const url = `${API_BASE_URL}/api/progress/sync`;
    log("api:sync:start", { series_id: update.series_id, chapter: update.chapter });
    try {
      const body = {
        series_id: update.series_id,
        chapter: update.chapter,
        scroll_position: update.scroll_position,
        timestamp: update.timestamp,
        seriesTitle: update.seriesTitle
      };
      if (userId) {
        body.user_id = userId;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const statusCode = response.status;
        if (statusCode >= 400 && statusCode < 500) {
          warn("api:sync:client-error", { status: statusCode, series_id: update.series_id });
          return { success: false, error: `Client error: ${statusCode}` };
        }
        warn("api:sync:server-error", { status: statusCode, series_id: update.series_id });
        return { success: false, error: `Server error: ${statusCode}` };
      }
      const data = await response.json();
      log("api:sync:success", { series_id: update.series_id, synced_at: data.synced_at });
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        warn("api:sync:timeout", { series_id: update.series_id });
        return { success: false, error: "API sync timeout - queuing for retry" };
      }
      error("api:sync:error", err);
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }

  // src/extension/queue/syncQueue.ts
  var QUEUE_STORAGE_KEY = "readtrace_sync_queue";
  var MAX_QUEUE_SIZE = 100;
  var MAX_RETRIES = 5;
  var queue = [];
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  function add(update) {
    const queued = {
      ...update,
      id: generateId(),
      retries: 0
    };
    queue.push(queued);
    log("queue:add", { id: queued.id, series_id: update.series_id, chapter: update.chapter });
    if (queue.length > MAX_QUEUE_SIZE) {
      const removed = queue.splice(0, queue.length - MAX_QUEUE_SIZE);
      warn("queue:overflow", { removed: removed.length, message: "Storage quota exceeded - removing oldest entries" });
    }
    save();
    return queued;
  }
  function remove(id) {
    const before = queue.length;
    queue = queue.filter((item) => item.id !== id);
    if (queue.length < before) {
      log("queue:remove", { id });
      save();
    }
  }
  function getAll() {
    return [...queue];
  }
  function save() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [QUEUE_STORAGE_KEY]: queue }).catch((err) => {
          error("queue:save:error", err);
        });
      } else {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
      }
    } catch (err) {
      error("queue:save:error", err);
    }
  }
  async function load() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(QUEUE_STORAGE_KEY);
        const stored = result[QUEUE_STORAGE_KEY];
        if (stored && Array.isArray(stored)) {
          queue = stored;
          log("queue:load", { count: queue.length });
        }
      } else {
        const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            queue = parsed;
            log("queue:load", { count: queue.length });
          }
        }
      }
    } catch (err) {
      error("queue:load:error", err);
      queue = [];
    }
  }
  function incrementRetry(id) {
    const item = queue.find((q) => q.id === id);
    if (item) {
      item.retries += 1;
      item.lastRetry = Date.now();
      save();
    }
  }
  function removeExhausted() {
    const before = queue.length;
    queue = queue.filter((item) => item.retries < MAX_RETRIES);
    const removed = before - queue.length;
    if (removed > 0) {
      warn("queue:exhausted-removed", { removed });
      save();
    }
  }

  // src/extension/queue/deduplicator.ts
  var DEDUP_WINDOW_MS = 5 * 60 * 1e3;
  function makeKey(seriesId, chapter) {
    return `${seriesId}::${chapter}`;
  }
  var store = /* @__PURE__ */ new Map();
  function add2(update) {
    const key = makeKey(update.series_id, update.chapter);
    const existing = store.get(key);
    if (!existing || update.timestamp >= existing.timestamp) {
      store.set(key, { ...update });
      log("dedup:add", { key, timestamp: update.timestamp });
    }
  }
  function isDuplicate(update) {
    const key = makeKey(update.series_id, update.chapter);
    const existing = store.get(key);
    if (!existing) {
      return false;
    }
    const isDup = update.timestamp <= existing.timestamp;
    if (isDup) {
      log("dedup:duplicate-detected", { key, incoming: update.timestamp, existing: existing.timestamp });
    }
    return isDup;
  }

  // src/extension/background.ts
  var isOnline = typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" ? navigator.onLine : true;
  var isInitialized = false;
  var cachedUserId = null;
  var currentReadingState = {
    seriesTitle: null,
    chapterNumber: null,
    scrollPosition: 0,
    lastUpdate: null
  };
  async function getCachedUserId() {
    if (cachedUserId) return cachedUserId;
    try {
      const result = await chrome.storage.local.get("readtrace_user_id");
      if (result == null ? void 0 : result.readtrace_user_id) {
        cachedUserId = result.readtrace_user_id;
        return cachedUserId;
      }
    } catch (err) {
      debug("background:get-user-id-error", err);
    }
    return null;
  }
  function getIsOnline() {
    return isOnline;
  }
  function getIsInitialized() {
    return isInitialized;
  }
  function normalizeUpdate(raw) {
    const seriesId = raw.series_id ?? raw.seriesTitle;
    const seriesTitle = raw.seriesTitle;
    const chapter = raw.chapter ?? raw.chapterNumber;
    const scrollPosition = raw.scroll_position ?? raw.scrollPosition;
    const timestamp = raw.timestamp;
    const url = raw.url;
    if (typeof seriesId !== "string" || seriesId.length === 0 || typeof chapter !== "number" || chapter <= 0 || typeof scrollPosition !== "number" || scrollPosition < 0 || typeof timestamp !== "number" || timestamp <= 0 || typeof url !== "string") {
      return null;
    }
    return { series_id: seriesId, chapter, scroll_position: scrollPosition, timestamp, url, seriesTitle };
  }
  async function handleProgressUpdate(update) {
    debug("background:handle-update", { series_id: update.series_id, chapter: update.chapter });
    if (isDuplicate(update)) {
      log("background:duplicate-skipped", { series_id: update.series_id, chapter: update.chapter });
      return { success: true, queued: false };
    }
    add2(update);
    if (!isOnline) {
      add(update);
      log("background:queued-offline", { series_id: update.series_id });
      return { success: true, queued: true };
    }
    const userId = await getCachedUserId();
    const result = await syncProgress(update, userId || void 0);
    if (!result.success) {
      add(update);
      log("background:queued-after-failure", { series_id: update.series_id, error: result.error });
      return { success: false, queued: true, error: result.error };
    }
    return { success: true, queued: false };
  }
  async function processQueue() {
    var _a;
    const pending = getAll();
    if (pending.length === 0) {
      debug("background:queue-empty");
      return;
    }
    log("background:processing-queue", { count: pending.length });
    const userId = await getCachedUserId();
    for (const item of pending) {
      const result = await syncProgress(item, userId || void 0);
      if (result.success) {
        remove(item.id);
        log("background:queue-item-synced", { id: item.id, series_id: item.series_id });
      } else if ((_a = result.error) == null ? void 0 : _a.includes("Client error")) {
        remove(item.id);
        warn("background:queue-item-dropped", { id: item.id, error: result.error });
      } else {
        incrementRetry(item.id);
        warn("background:queue-item-failed", { id: item.id, retries: item.retries + 1, error: result.error });
      }
    }
    removeExhausted();
  }
  function onOnline() {
    isOnline = true;
    log("background:online");
    processQueue().catch((err) => error("background:process-queue-error", err));
  }
  function onOffline() {
    isOnline = false;
    log("background:offline");
  }
  function getQueuedUpdates() {
    return getAll();
  }
  function handleMessage(message, _sender, sendResponse) {
    var _a;
    const msg = message;
    if (!msg) {
      sendResponse({ success: false, queued: false, error: "Invalid message" });
      return false;
    }
    if (msg.type === "PROGRESS_UPDATE") {
      const normalized = msg.payload && typeof msg.payload === "object" ? normalizeUpdate(msg.payload) : null;
      if (!normalized) {
        warn("background:invalid-payload", { payload: msg.payload });
        sendResponse({ success: false, queued: false, error: "Invalid progress data" });
        return false;
      }
      const raw = msg.payload;
      currentReadingState = {
        seriesTitle: raw.seriesTitle ?? raw.series_id,
        chapterNumber: raw.chapterNumber ?? raw.chapter,
        scrollPosition: raw.scrollPosition ?? raw.scroll_position,
        lastUpdate: (/* @__PURE__ */ new Date()).toLocaleTimeString()
      };
      handleProgressUpdate(normalized).then(sendResponse).catch((err) => {
        error("background:message-handler-error", err);
        sendResponse({ success: false, queued: false, error: "Internal error" });
      });
      return true;
    }
    if (msg.type === "GET_POPUP_STATE") {
      sendResponse({
        isOnline,
        lastUpdate: currentReadingState.lastUpdate,
        seriesTitle: currentReadingState.seriesTitle,
        chapterNumber: currentReadingState.chapterNumber,
        scrollPosition: currentReadingState.scrollPosition,
        isSyncing: false,
        syncError: null
      });
      return false;
    }
    if (msg.type === "SET_USER_ID") {
      const userId = (_a = msg.payload) == null ? void 0 : _a.userId;
      if (userId) {
        cachedUserId = userId;
        chrome.storage.local.set({ readtrace_user_id: userId });
        log("background:user-id-set", { userId });
      }
      sendResponse({ success: true });
      return false;
    }
    if (msg.type === "MANUAL_SYNC") {
      processQueue().then(() => sendResponse({ success: true })).catch((err) => {
        error("background:manual-sync-error", err);
        sendResponse({ success: false, error: "Sync failed" });
      });
      return true;
    }
    sendResponse({ success: false, queued: false, error: "Unknown message type" });
    return false;
  }
  if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
    self.addEventListener("online", onOnline);
    self.addEventListener("offline", onOffline);
  }
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleMessage);
  }
  async function initialize() {
    if (isInitialized) return;
    await load();
    isInitialized = true;
    log("background:initialized", { isOnline });
  }
  initialize().catch((err) => error("background:init-error", err));
})();

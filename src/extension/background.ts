import { BackgroundProgressUpdate, BackgroundMessage, BackgroundMessageResponse } from './types';
import { syncProgress } from './api';
import * as queue from './queue/syncQueue';
import * as dedup from './queue/deduplicator';
import { log, warn, error as logError, debug } from './logger';
import { getCurrentUserId } from './supabase';

let isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
let isInitialized = false;
let cachedUserId: string | null = null;

let currentReadingState: {
  seriesTitle: string | null;
  chapterNumber: number | null;
  scrollPosition: number;
  lastUpdate: string | null;
} = {
  seriesTitle: null,
  chapterNumber: null,
  scrollPosition: 0,
  lastUpdate: null,
};

async function getCachedUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  
  try {
    const result = await (chrome as any).storage.local.get('readtrace_user_id');
    if (result?.readtrace_user_id) {
      cachedUserId = result.readtrace_user_id;
      return cachedUserId;
    }
  } catch (err) {
    debug('background:get-user-id-error', err);
  }
  return null;
}

export function getIsOnline(): boolean {
  return isOnline;
}

export function getIsInitialized(): boolean {
  return isInitialized;
}

function normalizeUpdate(raw: Record<string, unknown>): BackgroundProgressUpdate | null {
  // Accept both content script camelCase format and background snake_case format
  const seriesId = (raw.series_id ?? raw.seriesTitle) as string | undefined;
  const seriesTitle = raw.seriesTitle as string | undefined;
  const chapter = (raw.chapter ?? raw.chapterNumber) as number | undefined;
  const scrollPosition = (raw.scroll_position ?? raw.scrollPosition) as number | undefined;
  const timestamp = raw.timestamp as number | undefined;
  const url = raw.url as string | undefined;

  if (
    typeof seriesId !== 'string' || seriesId.length === 0 ||
    typeof chapter !== 'number' || chapter <= 0 ||
    typeof scrollPosition !== 'number' || scrollPosition < 0 ||
    typeof timestamp !== 'number' || timestamp <= 0 ||
    typeof url !== 'string'
  ) {
    return null;
  }

  return { series_id: seriesId, chapter, scroll_position: scrollPosition, timestamp, url, seriesTitle };
}

function validateUpdate(update: unknown): update is BackgroundProgressUpdate {
  if (!update || typeof update !== 'object') return false;
  return normalizeUpdate(update as Record<string, unknown>) !== null;
}

export async function handleProgressUpdate(
  update: BackgroundProgressUpdate
): Promise<BackgroundMessageResponse> {
  debug('background:handle-update', { series_id: update.series_id, chapter: update.chapter });

  if (dedup.isDuplicate(update)) {
    log('background:duplicate-skipped', { series_id: update.series_id, chapter: update.chapter });
    return { success: true, queued: false };
  }

  dedup.add(update);

  if (!isOnline) {
    queue.add(update);
    log('background:queued-offline', { series_id: update.series_id });
    return { success: true, queued: true };
  }

  const userId = await getCachedUserId();
  const result = await syncProgress(update, userId || undefined);

  if (!result.success) {
    queue.add(update);
    log('background:queued-after-failure', { series_id: update.series_id, error: result.error });
    return { success: false, queued: true, error: result.error };
  }

  return { success: true, queued: false };
}

export async function processQueue(): Promise<void> {
  const pending = queue.getAll();

  if (pending.length === 0) {
    debug('background:queue-empty');
    return;
  }

  log('background:processing-queue', { count: pending.length });
  const userId = await getCachedUserId();

  for (const item of pending) {
    const result = await syncProgress(item, userId || undefined);

    if (result.success) {
      queue.remove(item.id);
      log('background:queue-item-synced', { id: item.id, series_id: item.series_id });
    } else if (result.error?.includes('Client error')) {
      // 4xx = permanent failure (e.g. auth/validation), don't retry
      queue.remove(item.id);
      warn('background:queue-item-dropped', { id: item.id, error: result.error });
    } else {
      queue.incrementRetry(item.id);
      warn('background:queue-item-failed', { id: item.id, retries: item.retries + 1, error: result.error });
    }
  }

  queue.removeExhausted();
}

export function onOnline(): void {
  isOnline = true;
  log('background:online');
  processQueue().catch((err) => logError('background:process-queue-error', err));
}

export function onOffline(): void {
  isOnline = false;
  log('background:offline');
}

export function getQueuedUpdates(): ReturnType<typeof queue.getAll> {
  return queue.getAll();
}

function handleMessage(
  message: unknown,
  _sender: unknown,
  sendResponse: (response: any) => void
): boolean {
  const msg = message as any;

  if (!msg) {
    sendResponse({ success: false, queued: false, error: 'Invalid message' });
    return false;
  }

  if (msg.type === 'PROGRESS_UPDATE') {
    const normalized = msg.payload && typeof msg.payload === 'object'
      ? normalizeUpdate(msg.payload as Record<string, unknown>)
      : null;

    if (!normalized) {
      warn('background:invalid-payload', { payload: msg.payload });
      sendResponse({ success: false, queued: false, error: 'Invalid progress data' });
      return false;
    }

    // Update popup-visible reading state
    const raw = msg.payload as Record<string, unknown>;
    currentReadingState = {
      seriesTitle: (raw.seriesTitle ?? raw.series_id) as string,
      chapterNumber: (raw.chapterNumber ?? raw.chapter) as number,
      scrollPosition: (raw.scrollPosition ?? raw.scroll_position) as number,
      lastUpdate: new Date().toLocaleTimeString(),
    };

    handleProgressUpdate(normalized)
      .then(sendResponse)
      .catch((err) => {
        logError('background:message-handler-error', err);
        sendResponse({ success: false, queued: false, error: 'Internal error' });
      });

    return true;
  }

  if (msg.type === 'GET_POPUP_STATE') {
    sendResponse({
      isOnline,
      lastUpdate: currentReadingState.lastUpdate,
      seriesTitle: currentReadingState.seriesTitle,
      chapterNumber: currentReadingState.chapterNumber,
      scrollPosition: currentReadingState.scrollPosition,
      isSyncing: false,
      syncError: null,
    });
    return false;
  }

  if (msg.type === 'SET_USER_ID') {
    const userId = msg.payload?.userId as string | undefined;
    if (userId) {
      cachedUserId = userId;
      (chrome as any).storage.local.set({ readtrace_user_id: userId });
      log('background:user-id-set', { userId });
    }
    sendResponse({ success: true });
    return false;
  }

  if (msg.type === 'MANUAL_SYNC') {
    processQueue()
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        logError('background:manual-sync-error', err);
        sendResponse({ success: false, error: 'Sync failed' });
      });
    return true;
  }

  sendResponse({ success: false, queued: false, error: 'Unknown message type' });
  return false;
}

// Register listeners synchronously at module load (before any async work)
if (typeof self !== 'undefined' && typeof (self as Window & typeof globalThis).addEventListener === 'function') {
  (self as Window & typeof globalThis).addEventListener('online', onOnline);
  (self as Window & typeof globalThis).addEventListener('offline', onOffline);
}

if (
  typeof chrome !== 'undefined' &&
  chrome.runtime &&
  chrome.runtime.onMessage
) {
  chrome.runtime.onMessage.addListener(handleMessage);
}

export async function initialize(): Promise<void> {
  if (isInitialized) return;

  await queue.load();

  isInitialized = true;
  log('background:initialized', { isOnline });
}

// Initialize queue and mark ready
initialize().catch((err) => logError('background:init-error', err));

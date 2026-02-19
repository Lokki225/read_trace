import { BackgroundProgressUpdate, BackgroundMessage, BackgroundMessageResponse } from './types';
import { syncProgress } from './api';
import * as queue from './queue/syncQueue';
import * as dedup from './queue/deduplicator';
import { log, warn, error as logError, debug } from './logger';

let isOnline = true;
let isInitialized = false;

export function getIsOnline(): boolean {
  return isOnline;
}

export function getIsInitialized(): boolean {
  return isInitialized;
}

function validateUpdate(update: unknown): update is BackgroundProgressUpdate {
  if (!update || typeof update !== 'object') return false;
  const u = update as Record<string, unknown>;
  return (
    typeof u.series_id === 'string' &&
    u.series_id.length > 0 &&
    typeof u.chapter === 'number' &&
    u.chapter > 0 &&
    typeof u.scroll_position === 'number' &&
    u.scroll_position >= 0 &&
    u.scroll_position <= 100 &&
    typeof u.timestamp === 'number' &&
    u.timestamp > 0 &&
    typeof u.url === 'string'
  );
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

  const result = await syncProgress(update);

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
  } else {
    log('background:processing-queue', { count: pending.length });

    for (const item of pending) {
      const result = await syncProgress(item);

      if (result.success) {
        queue.remove(item.id);
        log('background:queue-item-synced', { id: item.id, series_id: item.series_id });
      } else {
        queue.incrementRetry(item.id);
        warn('background:queue-item-failed', { id: item.id, retries: item.retries + 1, error: result.error });
      }
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
  sendResponse: (response: BackgroundMessageResponse) => void
): boolean {
  const msg = message as BackgroundMessage;

  if (!msg || msg.type !== 'PROGRESS_UPDATE') {
    sendResponse({ success: false, queued: false, error: 'Unknown message type' });
    return false;
  }

  if (!validateUpdate(msg.payload)) {
    warn('background:invalid-payload', { payload: msg.payload });
    sendResponse({ success: false, queued: false, error: 'Invalid progress data' });
    return false;
  }

  handleProgressUpdate(msg.payload)
    .then(sendResponse)
    .catch((err) => {
      logError('background:message-handler-error', err);
      sendResponse({ success: false, queued: false, error: 'Internal error' });
    });

  return true;
}

export function initialize(): void {
  if (isInitialized) return;

  queue.load();

  isOnline =
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;

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

  isInitialized = true;
  log('background:initialized', { isOnline });
}

import { BackgroundProgressUpdate, QueuedUpdate } from '../types';
import { log, warn, error as logError } from '../logger';

const QUEUE_STORAGE_KEY = 'readtrace_sync_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 5;

let queue: QueuedUpdate[] = [];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function add(update: BackgroundProgressUpdate): QueuedUpdate {
  const queued: QueuedUpdate = {
    ...update,
    id: generateId(),
    retries: 0,
  };

  queue.push(queued);
  log('queue:add', { id: queued.id, series_id: update.series_id, chapter: update.chapter });

  if (queue.length > MAX_QUEUE_SIZE) {
    const removed = queue.splice(0, queue.length - MAX_QUEUE_SIZE);
    warn('queue:overflow', { removed: removed.length, message: 'Storage quota exceeded - removing oldest entries' });
  }

  save();
  return queued;
}

export function remove(id: string): void {
  const before = queue.length;
  queue = queue.filter((item) => item.id !== id);
  if (queue.length < before) {
    log('queue:remove', { id });
    save();
  }
}

export function getAll(): QueuedUpdate[] {
  return [...queue];
}

export function size(): number {
  return queue.length;
}

export function clear(): void {
  queue = [];
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch {
    // localStorage may not be available in all contexts
  }
  log('queue:clear');
}

export function save(): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    logError('queue:save:error', err);
  }
}

export function load(): void {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as QueuedUpdate[];
      if (Array.isArray(parsed)) {
        queue = parsed;
        log('queue:load', { count: queue.length });
      }
    }
  } catch (err) {
    logError('queue:load:error', err);
    queue = [];
  }
}

export function incrementRetry(id: string): void {
  const item = queue.find((q) => q.id === id);
  if (item) {
    item.retries += 1;
    item.lastRetry = Date.now();
    save();
  }
}

export function removeExhausted(): void {
  const before = queue.length;
  queue = queue.filter((item) => item.retries < MAX_RETRIES);
  const removed = before - queue.length;
  if (removed > 0) {
    warn('queue:exhausted-removed', { removed });
    save();
  }
}

export function getMaxRetries(): number {
  return MAX_RETRIES;
}

const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

export function getBackoffDelay(retries: number): number {
  const delay = BASE_BACKOFF_MS * Math.pow(2, retries);
  return Math.min(delay, MAX_BACKOFF_MS);
}

export function isReadyForRetry(item: QueuedUpdate): boolean {
  if (item.retries === 0) return true;
  if (!item.lastRetry) return true;
  const delay = getBackoffDelay(item.retries);
  return Date.now() - item.lastRetry >= delay;
}

export function getRetryReady(): QueuedUpdate[] {
  return queue.filter(isReadyForRetry);
}

export function addFromOffline(update: BackgroundProgressUpdate): QueuedUpdate {
  const existing = queue.find(
    (q) => q.series_id === update.series_id && q.chapter === update.chapter
  );
  if (existing) {
    if (update.timestamp > existing.timestamp) {
      existing.scroll_position = update.scroll_position;
      existing.timestamp = update.timestamp;
      existing.url = update.url;
      save();
      log('queue:offline-update-merged', { id: existing.id, series_id: update.series_id });
    }
    return existing;
  }
  return add(update);
}

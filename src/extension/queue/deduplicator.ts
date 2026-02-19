import { BackgroundProgressUpdate } from '../types';
import { log } from '../logger';

const DEDUP_WINDOW_MS = 5 * 60 * 1000;

type DeduplicationKey = string;

function makeKey(seriesId: string, chapter: number): DeduplicationKey {
  return `${seriesId}::${chapter}`;
}

const store = new Map<DeduplicationKey, BackgroundProgressUpdate>();

export function add(update: BackgroundProgressUpdate): void {
  const key = makeKey(update.series_id, update.chapter);
  const existing = store.get(key);

  if (!existing || update.timestamp >= existing.timestamp) {
    store.set(key, { ...update });
    log('dedup:add', { key, timestamp: update.timestamp });
  }
}

export function isDuplicate(update: BackgroundProgressUpdate): boolean {
  const key = makeKey(update.series_id, update.chapter);
  const existing = store.get(key);

  if (!existing) {
    return false;
  }

  const isDup = update.timestamp <= existing.timestamp;
  if (isDup) {
    log('dedup:duplicate-detected', { key, incoming: update.timestamp, existing: existing.timestamp });
  }
  return isDup;
}

export function getLatest(seriesId: string, chapter: number): BackgroundProgressUpdate | null {
  const key = makeKey(seriesId, chapter);
  return store.get(key) ?? null;
}

export function deduplicate(updates: BackgroundProgressUpdate[]): BackgroundProgressUpdate[] {
  const latestMap = new Map<DeduplicationKey, BackgroundProgressUpdate>();

  for (const update of updates) {
    const key = makeKey(update.series_id, update.chapter);
    const existing = latestMap.get(key);
    if (!existing || update.timestamp > existing.timestamp) {
      latestMap.set(key, update);
    }
  }

  return Array.from(latestMap.values());
}

export function purgeExpired(): void {
  const cutoff = Date.now() - DEDUP_WINDOW_MS;
  let purged = 0;

  for (const [key, update] of store.entries()) {
    if (update.timestamp < cutoff) {
      store.delete(key);
      purged++;
    }
  }

  if (purged > 0) {
    log('dedup:purge', { purged });
  }
}

export function clear(): void {
  store.clear();
  log('dedup:clear');
}

export function size(): number {
  return store.size;
}

import { BackgroundProgressUpdate } from '../types';
import { log, warn, error as logError } from '../logger';

export const OFFLINE_STORAGE_KEY = 'readtrace_offline_progress';
export const MAX_OFFLINE_ENTRIES = 200;
export const QUOTA_WARN_BYTES = 4 * 1024 * 1024; // 4MB warning threshold

export interface OfflineProgress {
  id: string;
  series_id: string;
  chapter: number;
  scroll_position: number;
  timestamp: number;
  synced: boolean;
  url: string;
}

export interface StorageStats {
  count: number;
  estimatedBytes: number;
  nearingQuota: boolean;
}

function generateId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function estimateBytes(data: string): number {
  return new Blob([data]).size;
}

function readFromStorage(): OfflineProgress[] {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineProgress[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    logError('offlineStorage:read:error', err);
    return [];
  }
}

function writeToStorage(entries: OfflineProgress[]): void {
  try {
    const serialized = JSON.stringify(entries);
    const bytes = estimateBytes(serialized);

    if (bytes > QUOTA_WARN_BYTES) {
      warn('offlineStorage:quota-warning', {
        estimatedBytes: bytes,
        threshold: QUOTA_WARN_BYTES,
        message: 'Approaching localStorage quota limit',
      });
    }

    localStorage.setItem(OFFLINE_STORAGE_KEY, serialized);
  } catch (err) {
    logError('offlineStorage:write:error', err);
  }
}

export function saveProgress(update: BackgroundProgressUpdate): OfflineProgress {
  const entries = readFromStorage();

  const existing = entries.findIndex(
    (e) => e.series_id === update.series_id && e.chapter === update.chapter
  );

  const entry: OfflineProgress = {
    id: existing >= 0 ? entries[existing].id : generateId(),
    series_id: update.series_id,
    chapter: update.chapter,
    scroll_position: update.scroll_position,
    timestamp: update.timestamp,
    synced: false,
    url: update.url,
  };

  if (existing >= 0) {
    entries[existing] = entry;
    log('offlineStorage:update', { id: entry.id, series_id: entry.series_id });
  } else {
    entries.push(entry);
    log('offlineStorage:save', { id: entry.id, series_id: entry.series_id });
  }

  if (entries.length > MAX_OFFLINE_ENTRIES) {
    const unsynced = entries.filter((e) => !e.synced);
    const synced = entries.filter((e) => e.synced);
    synced.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.length - MAX_OFFLINE_ENTRIES;
    const removed = synced.splice(0, toRemove);
    warn('offlineStorage:overflow', {
      removed: removed.length,
      message: 'Storage quota exceeded - removing oldest synced entries',
    });
    const kept = [...unsynced, ...synced];
    kept.sort((a, b) => a.timestamp - b.timestamp);
    writeToStorage(kept);
    return entry;
  }

  writeToStorage(entries);
  return entry;
}

export function getUnsynced(): OfflineProgress[] {
  return readFromStorage().filter((e) => !e.synced);
}

export function getAll(): OfflineProgress[] {
  return readFromStorage();
}

export function markSynced(id: string): void {
  const entries = readFromStorage();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries[idx].synced = true;
    writeToStorage(entries);
    log('offlineStorage:mark-synced', { id });
  }
}

export function removeSynced(): number {
  const entries = readFromStorage();
  const before = entries.length;
  const remaining = entries.filter((e) => !e.synced);
  writeToStorage(remaining);
  const removed = before - remaining.length;
  if (removed > 0) {
    log('offlineStorage:remove-synced', { removed });
  }
  return removed;
}

export function clear(): void {
  try {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    log('offlineStorage:clear');
  } catch (err) {
    logError('offlineStorage:clear:error', err);
  }
}

export function getStats(): StorageStats {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY) ?? '[]';
    const entries = readFromStorage();
    const bytes = estimateBytes(raw);
    return {
      count: entries.length,
      estimatedBytes: bytes,
      nearingQuota: bytes > QUOTA_WARN_BYTES,
    };
  } catch {
    return { count: 0, estimatedBytes: 0, nearingQuota: false };
  }
}

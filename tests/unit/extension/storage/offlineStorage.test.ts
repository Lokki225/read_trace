import { BackgroundProgressUpdate } from '../../../../src/extension/types';

jest.mock('../../../../src/extension/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  setDebugMode: jest.fn(),
  isDebugMode: jest.fn(() => false),
}));

import {
  saveProgress,
  getUnsynced,
  getAll,
  markSynced,
  removeSynced,
  clear,
  getStats,
  OFFLINE_STORAGE_KEY,
  MAX_OFFLINE_ENTRIES,
} from '../../../../src/extension/storage/offlineStorage';

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-abc',
  chapter: 5,
  scroll_position: 42,
  timestamp: 1700000000000,
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('offlineStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveProgress()', () => {
    it('should save a new entry to localStorage', () => {
      const update = makeUpdate();
      const entry = saveProgress(update);

      expect(entry.series_id).toBe(update.series_id);
      expect(entry.chapter).toBe(update.chapter);
      expect(entry.scroll_position).toBe(update.scroll_position);
      expect(entry.timestamp).toBe(update.timestamp);
      expect(entry.synced).toBe(false);
      expect(entry.url).toBe(update.url);
      expect(typeof entry.id).toBe('string');
      expect(entry.id).toMatch(/^offline-/);
    });

    it('should persist entry to localStorage', () => {
      saveProgress(makeUpdate());
      const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });

    it('should update existing entry for same series_id + chapter', () => {
      const update1 = makeUpdate({ scroll_position: 10, timestamp: 1000 });
      const entry1 = saveProgress(update1);

      const update2 = makeUpdate({ scroll_position: 80, timestamp: 2000 });
      const entry2 = saveProgress(update2);

      expect(entry1.id).toBe(entry2.id);
      const all = getAll();
      expect(all).toHaveLength(1);
      expect(all[0].scroll_position).toBe(80);
    });

    it('should store multiple entries for different series', () => {
      saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));
      expect(getAll()).toHaveLength(2);
    });

    it('should store multiple entries for same series but different chapters', () => {
      saveProgress(makeUpdate({ chapter: 1 }));
      saveProgress(makeUpdate({ chapter: 2 }));
      expect(getAll()).toHaveLength(2);
    });

    it('should enforce MAX_OFFLINE_ENTRIES by removing oldest synced entries', () => {
      for (let i = 0; i < MAX_OFFLINE_ENTRIES; i++) {
        const entry = saveProgress(makeUpdate({ series_id: `series-${i}`, chapter: 1, timestamp: i }));
        if (i < 10) {
          markSynced(entry.id);
        }
      }
      saveProgress(makeUpdate({ series_id: 'series-overflow', chapter: 1, timestamp: MAX_OFFLINE_ENTRIES + 1 }));
      const all = getAll();
      expect(all.length).toBeLessThanOrEqual(MAX_OFFLINE_ENTRIES);
    });

    it('should return entry with correct shape', () => {
      const entry = saveProgress(makeUpdate());
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('series_id');
      expect(entry).toHaveProperty('chapter');
      expect(entry).toHaveProperty('scroll_position');
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('synced');
      expect(entry).toHaveProperty('url');
    });
  });

  describe('getUnsynced()', () => {
    it('should return only unsynced entries', () => {
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      const e2 = saveProgress(makeUpdate({ series_id: 'series-2' }));
      markSynced(e1.id);

      const unsynced = getUnsynced();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].id).toBe(e2.id);
    });

    it('should return empty array when all synced', () => {
      const e = saveProgress(makeUpdate());
      markSynced(e.id);
      expect(getUnsynced()).toHaveLength(0);
    });

    it('should return all entries when none synced', () => {
      saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));
      expect(getUnsynced()).toHaveLength(2);
    });

    it('should return empty array when storage is empty', () => {
      expect(getUnsynced()).toHaveLength(0);
    });
  });

  describe('getAll()', () => {
    it('should return all entries regardless of sync status', () => {
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));
      markSynced(e1.id);

      expect(getAll()).toHaveLength(2);
    });

    it('should return empty array when no entries', () => {
      expect(getAll()).toHaveLength(0);
    });
  });

  describe('markSynced()', () => {
    it('should mark entry as synced', () => {
      const entry = saveProgress(makeUpdate());
      markSynced(entry.id);

      const all = getAll();
      expect(all[0].synced).toBe(true);
    });

    it('should not throw for unknown id', () => {
      expect(() => markSynced('nonexistent-id')).not.toThrow();
    });

    it('should only mark the specified entry', () => {
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      const e2 = saveProgress(makeUpdate({ series_id: 'series-2' }));
      markSynced(e1.id);

      const all = getAll();
      const entry1 = all.find((e) => e.id === e1.id)!;
      const entry2 = all.find((e) => e.id === e2.id)!;
      expect(entry1.synced).toBe(true);
      expect(entry2.synced).toBe(false);
    });
  });

  describe('removeSynced()', () => {
    it('should remove all synced entries and return count', () => {
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));
      markSynced(e1.id);

      const removed = removeSynced();
      expect(removed).toBe(1);
      expect(getAll()).toHaveLength(1);
      expect(getAll()[0].synced).toBe(false);
    });

    it('should return 0 when nothing to remove', () => {
      saveProgress(makeUpdate());
      expect(removeSynced()).toBe(0);
    });

    it('should return 0 when storage is empty', () => {
      expect(removeSynced()).toBe(0);
    });

    it('should remove all entries when all synced', () => {
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      const e2 = saveProgress(makeUpdate({ series_id: 'series-2' }));
      markSynced(e1.id);
      markSynced(e2.id);

      const removed = removeSynced();
      expect(removed).toBe(2);
      expect(getAll()).toHaveLength(0);
    });
  });

  describe('clear()', () => {
    it('should remove all entries from localStorage', () => {
      saveProgress(makeUpdate());
      clear();
      expect(localStorage.getItem(OFFLINE_STORAGE_KEY)).toBeNull();
    });

    it('should result in empty getAll()', () => {
      saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));
      clear();
      expect(getAll()).toHaveLength(0);
    });
  });

  describe('getStats()', () => {
    it('should return count of 0 when empty', () => {
      const stats = getStats();
      expect(stats.count).toBe(0);
      expect(stats.estimatedBytes).toBeGreaterThanOrEqual(0);
      expect(stats.nearingQuota).toBe(false);
    });

    it('should return correct count after saving entries', () => {
      saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));
      const stats = getStats();
      expect(stats.count).toBe(2);
    });

    it('should return estimatedBytes > 0 when entries exist', () => {
      saveProgress(makeUpdate());
      const stats = getStats();
      expect(stats.estimatedBytes).toBeGreaterThan(0);
    });

    it('should return nearingQuota false for small data', () => {
      saveProgress(makeUpdate());
      expect(getStats().nearingQuota).toBe(false);
    });
  });

  describe('data integrity', () => {
    it('should preserve data across multiple read/write cycles', () => {
      const update = makeUpdate({ series_id: 'integrity-test', chapter: 7, scroll_position: 55 });
      saveProgress(update);

      const all = getAll();
      expect(all[0].series_id).toBe('integrity-test');
      expect(all[0].chapter).toBe(7);
      expect(all[0].scroll_position).toBe(55);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem(OFFLINE_STORAGE_KEY, 'not-valid-json{{{');
      expect(() => getAll()).not.toThrow();
      expect(getAll()).toHaveLength(0);
    });

    it('should handle non-array JSON in localStorage gracefully', () => {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify({ not: 'an array' }));
      expect(getAll()).toHaveLength(0);
    });
  });
});

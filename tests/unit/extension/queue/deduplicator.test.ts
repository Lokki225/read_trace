import {
  add,
  isDuplicate,
  getLatest,
  deduplicate,
  purgeExpired,
  clear,
  size,
} from '../../../../src/extension/queue/deduplicator';
import { BackgroundProgressUpdate } from '../../../../src/extension/types';

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-123',
  chapter: 10,
  scroll_position: 50,
  timestamp: 1000,
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('deduplicator', () => {
  beforeEach(() => {
    clear();
  });

  describe('add()', () => {
    it('should add an update to the store', () => {
      add(makeUpdate());
      expect(size()).toBe(1);
    });

    it('should replace existing entry if newer timestamp', () => {
      add(makeUpdate({ timestamp: 1000 }));
      add(makeUpdate({ timestamp: 2000 }));
      expect(size()).toBe(1);
      const latest = getLatest('series-123', 10);
      expect(latest?.timestamp).toBe(2000);
    });

    it('should NOT replace existing entry if older timestamp', () => {
      add(makeUpdate({ timestamp: 2000 }));
      add(makeUpdate({ timestamp: 1000 }));
      const latest = getLatest('series-123', 10);
      expect(latest?.timestamp).toBe(2000);
    });

    it('should track different series+chapter combinations separately', () => {
      add(makeUpdate({ series_id: 'series-1', chapter: 1 }));
      add(makeUpdate({ series_id: 'series-1', chapter: 2 }));
      add(makeUpdate({ series_id: 'series-2', chapter: 1 }));
      expect(size()).toBe(3);
    });
  });

  describe('isDuplicate()', () => {
    it('should return false when no entry exists', () => {
      const update = makeUpdate();
      expect(isDuplicate(update)).toBe(false);
    });

    it('should return true when update has same or older timestamp', () => {
      const update1 = makeUpdate({ timestamp: 1000 });
      const update2 = makeUpdate({ timestamp: 1001 });

      add(update2);
      expect(isDuplicate(update1)).toBe(true);
    });

    it('should return false when update has newer timestamp', () => {
      const update1 = makeUpdate({ timestamp: 1000 });
      const update2 = makeUpdate({ timestamp: 2000 });

      add(update1);
      expect(isDuplicate(update2)).toBe(false);
    });

    it('should return true for exact same timestamp', () => {
      const update = makeUpdate({ timestamp: 1000 });
      add(update);
      expect(isDuplicate(makeUpdate({ timestamp: 1000 }))).toBe(true);
    });

    it('should not consider different series as duplicates', () => {
      add(makeUpdate({ series_id: 'series-1', timestamp: 5000 }));
      expect(isDuplicate(makeUpdate({ series_id: 'series-2', timestamp: 1000 }))).toBe(false);
    });

    it('should not consider different chapters as duplicates', () => {
      add(makeUpdate({ chapter: 10, timestamp: 5000 }));
      expect(isDuplicate(makeUpdate({ chapter: 11, timestamp: 1000 }))).toBe(false);
    });
  });

  describe('getLatest()', () => {
    it('should return null when no entry exists', () => {
      expect(getLatest('series-123', 10)).toBeNull();
    });

    it('should return the latest update for series+chapter', () => {
      add(makeUpdate({ timestamp: 1000 }));
      add(makeUpdate({ timestamp: 2000 }));
      const latest = getLatest('series-123', 10);
      expect(latest?.timestamp).toBe(2000);
    });

    it('should return null for unknown series', () => {
      add(makeUpdate({ series_id: 'series-1' }));
      expect(getLatest('series-unknown', 10)).toBeNull();
    });
  });

  describe('deduplicate()', () => {
    it('should return empty array for empty input', () => {
      expect(deduplicate([])).toEqual([]);
    });

    it('should keep only the latest update per series+chapter', () => {
      const updates = [
        makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 1000 }),
        makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 2000 }),
        makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 1500 }),
      ];
      const result = deduplicate(updates);
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBe(2000);
    });

    it('should keep separate entries for different series', () => {
      const updates = [
        makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 1000 }),
        makeUpdate({ series_id: 'series-2', chapter: 10, timestamp: 2000 }),
      ];
      const result = deduplicate(updates);
      expect(result).toHaveLength(2);
    });

    it('should keep separate entries for different chapters', () => {
      const updates = [
        makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 1000 }),
        makeUpdate({ series_id: 'series-1', chapter: 11, timestamp: 1000 }),
      ];
      const result = deduplicate(updates);
      expect(result).toHaveLength(2);
    });

    it('should handle single update', () => {
      const updates = [makeUpdate()];
      const result = deduplicate(updates);
      expect(result).toHaveLength(1);
    });
  });

  describe('purgeExpired()', () => {
    it('should remove entries older than 5 minutes', () => {
      const oldTimestamp = Date.now() - 6 * 60 * 1000;
      add(makeUpdate({ timestamp: oldTimestamp }));
      expect(size()).toBe(1);
      purgeExpired();
      expect(size()).toBe(0);
    });

    it('should keep recent entries', () => {
      add(makeUpdate({ timestamp: Date.now() }));
      purgeExpired();
      expect(size()).toBe(1);
    });
  });

  describe('clear()', () => {
    it('should remove all entries', () => {
      add(makeUpdate({ series_id: 'series-1' }));
      add(makeUpdate({ series_id: 'series-2' }));
      clear();
      expect(size()).toBe(0);
    });
  });

  describe('size()', () => {
    it('should return 0 for empty store', () => {
      expect(size()).toBe(0);
    });

    it('should return correct count', () => {
      add(makeUpdate({ series_id: 'series-1', chapter: 1 }));
      add(makeUpdate({ series_id: 'series-1', chapter: 2 }));
      expect(size()).toBe(2);
    });
  });
});

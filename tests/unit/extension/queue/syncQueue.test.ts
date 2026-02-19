import {
  add,
  remove,
  getAll,
  size,
  clear,
  save,
  load,
  incrementRetry,
  removeExhausted,
  getMaxRetries,
} from '../../../../src/extension/queue/syncQueue';
import { BackgroundProgressUpdate } from '../../../../src/extension/types';

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-123',
  chapter: 10,
  scroll_position: 50,
  timestamp: Date.now(),
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('syncQueue', () => {
  beforeEach(() => {
    clear();
    localStorage.clear();
  });

  describe('add()', () => {
    it('should add an update and return a QueuedUpdate with id and retries=0', () => {
      const update = makeUpdate();
      const queued = add(update);

      expect(queued.id).toBeTruthy();
      expect(queued.retries).toBe(0);
      expect(queued.series_id).toBe(update.series_id);
      expect(queued.chapter).toBe(update.chapter);
    });

    it('should increase queue size by 1', () => {
      expect(size()).toBe(0);
      add(makeUpdate());
      expect(size()).toBe(1);
    });

    it('should add multiple updates', () => {
      add(makeUpdate({ series_id: 'series-1' }));
      add(makeUpdate({ series_id: 'series-2' }));
      expect(size()).toBe(2);
    });

    it('should persist to localStorage on add', () => {
      add(makeUpdate());
      const stored = localStorage.getItem('readtrace_sync_queue');
      expect(stored).toBeTruthy();
    });
  });

  describe('remove()', () => {
    it('should remove an update by id', () => {
      const queued = add(makeUpdate());
      remove(queued.id);
      expect(size()).toBe(0);
    });

    it('should not throw when removing non-existent id', () => {
      expect(() => remove('non-existent-id')).not.toThrow();
    });

    it('should only remove the matching item', () => {
      const q1 = add(makeUpdate({ series_id: 'series-1' }));
      add(makeUpdate({ series_id: 'series-2' }));
      remove(q1.id);
      expect(size()).toBe(1);
      expect(getAll()[0].series_id).toBe('series-2');
    });
  });

  describe('getAll()', () => {
    it('should return all queued updates', () => {
      add(makeUpdate({ series_id: 'series-1' }));
      add(makeUpdate({ series_id: 'series-2' }));
      const all = getAll();
      expect(all).toHaveLength(2);
    });

    it('should return a copy (not reference)', () => {
      add(makeUpdate());
      const all1 = getAll();
      const all2 = getAll();
      expect(all1).not.toBe(all2);
    });

    it('should return empty array when queue is empty', () => {
      expect(getAll()).toEqual([]);
    });
  });

  describe('size()', () => {
    it('should return 0 for empty queue', () => {
      expect(size()).toBe(0);
    });

    it('should return correct count after adds', () => {
      add(makeUpdate());
      add(makeUpdate());
      expect(size()).toBe(2);
    });
  });

  describe('clear()', () => {
    it('should remove all items from queue', () => {
      add(makeUpdate());
      add(makeUpdate());
      clear();
      expect(size()).toBe(0);
    });

    it('should remove from localStorage', () => {
      add(makeUpdate());
      clear();
      expect(localStorage.getItem('readtrace_sync_queue')).toBeNull();
    });
  });

  describe('save() and load()', () => {
    it('should persist queue to localStorage', () => {
      add(makeUpdate({ series_id: 'series-persist' }));
      save();
      const stored = localStorage.getItem('readtrace_sync_queue');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].series_id).toBe('series-persist');
    });

    it('should restore queue from localStorage on load()', () => {
      add(makeUpdate({ series_id: 'series-restore' }));
      const stored = localStorage.getItem('readtrace_sync_queue');
      expect(stored).toBeTruthy();

      jest.resetModules();
      localStorage.setItem('readtrace_sync_queue', stored!);

      const freshQueue = require('../../../../src/extension/queue/syncQueue');
      freshQueue.load();
      expect(freshQueue.size()).toBe(1);
      expect(freshQueue.getAll()[0].series_id).toBe('series-restore');
    });

    it('should handle empty localStorage gracefully', () => {
      localStorage.clear();
      expect(() => load()).not.toThrow();
      expect(size()).toBe(0);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('readtrace_sync_queue', 'not-valid-json{{{');
      expect(() => load()).not.toThrow();
      expect(size()).toBe(0);
    });
  });

  describe('incrementRetry()', () => {
    it('should increment retries for the given id', () => {
      const queued = add(makeUpdate());
      incrementRetry(queued.id);
      const all = getAll();
      expect(all[0].retries).toBe(1);
    });

    it('should set lastRetry timestamp', () => {
      const before = Date.now();
      const queued = add(makeUpdate());
      incrementRetry(queued.id);
      const all = getAll();
      expect(all[0].lastRetry).toBeGreaterThanOrEqual(before);
    });

    it('should not throw for non-existent id', () => {
      expect(() => incrementRetry('ghost-id')).not.toThrow();
    });
  });

  describe('removeExhausted()', () => {
    it('should remove items that have reached max retries', () => {
      const queued = add(makeUpdate());
      const maxRetries = getMaxRetries();
      for (let i = 0; i < maxRetries; i++) {
        incrementRetry(queued.id);
      }
      removeExhausted();
      expect(size()).toBe(0);
    });

    it('should keep items below max retries', () => {
      const queued = add(makeUpdate());
      incrementRetry(queued.id);
      removeExhausted();
      expect(size()).toBe(1);
    });
  });

  describe('queue overflow', () => {
    it('should cap queue at 100 items and remove oldest', () => {
      for (let i = 0; i < 110; i++) {
        add(makeUpdate({ series_id: `series-${i}`, timestamp: i }));
      }
      expect(size()).toBe(100);
      const all = getAll();
      expect(all[0].series_id).toBe('series-10');
    });
  });
});

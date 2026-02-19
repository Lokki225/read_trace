import { BackgroundProgressUpdate } from '../../../src/extension/types';

jest.mock('../../../src/extension/api', () => ({
  syncProgress: jest.fn(),
  setAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
}));

jest.mock('../../../src/extension/queue/syncQueue', () => ({
  add: jest.fn(),
  remove: jest.fn(),
  getAll: jest.fn(() => []),
  size: jest.fn(() => 0),
  clear: jest.fn(),
  save: jest.fn(),
  load: jest.fn(),
  incrementRetry: jest.fn(),
  removeExhausted: jest.fn(),
  getMaxRetries: jest.fn(() => 5),
}));

jest.mock('../../../src/extension/queue/deduplicator', () => ({
  add: jest.fn(),
  isDuplicate: jest.fn(() => false),
  getLatest: jest.fn(() => null),
  deduplicate: jest.fn((arr: unknown[]) => arr),
  purgeExpired: jest.fn(),
  clear: jest.fn(),
  size: jest.fn(() => 0),
}));

jest.mock('../../../src/extension/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  setDebugMode: jest.fn(),
  isDebugMode: jest.fn(() => false),
}));

import { syncProgress } from '../../../src/extension/api';
import * as queueModule from '../../../src/extension/queue/syncQueue';
import * as dedupModule from '../../../src/extension/queue/deduplicator';
import {
  handleProgressUpdate,
  processQueue,
  getQueuedUpdates,
  onOnline,
  onOffline,
  getIsOnline,
} from '../../../src/extension/background';

const mockSyncProgress = syncProgress as jest.MockedFunction<typeof syncProgress>;
const mockQueueAdd = queueModule.add as jest.MockedFunction<typeof queueModule.add>;
const mockQueueRemove = queueModule.remove as jest.MockedFunction<typeof queueModule.remove>;
const mockQueueGetAll = queueModule.getAll as jest.MockedFunction<typeof queueModule.getAll>;
const mockQueueIncrementRetry = queueModule.incrementRetry as jest.MockedFunction<typeof queueModule.incrementRetry>;
const mockQueueRemoveExhausted = queueModule.removeExhausted as jest.MockedFunction<typeof queueModule.removeExhausted>;
const mockDedupIsDuplicate = dedupModule.isDuplicate as jest.MockedFunction<typeof dedupModule.isDuplicate>;
const mockDedupAdd = dedupModule.add as jest.MockedFunction<typeof dedupModule.add>;

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-123',
  chapter: 10,
  scroll_position: 50,
  timestamp: Date.now(),
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('background script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDedupIsDuplicate.mockReturnValue(false);
    mockSyncProgress.mockResolvedValue({ success: true, synced_at: new Date().toISOString() });
    mockQueueGetAll.mockReturnValue([]);
    onOnline();
  });

  describe('handleProgressUpdate()', () => {
    it('should sync to API when online and not duplicate', async () => {
      mockDedupIsDuplicate.mockReturnValue(false);
      mockSyncProgress.mockResolvedValue({ success: true, synced_at: '2026-01-01T00:00:00Z' });

      const result = await handleProgressUpdate(makeUpdate());

      expect(mockSyncProgress).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.queued).toBe(false);
    });

    it('should skip duplicate updates', async () => {
      mockDedupIsDuplicate.mockReturnValue(true);

      const result = await handleProgressUpdate(makeUpdate());

      expect(mockSyncProgress).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.queued).toBe(false);
    });

    it('should add to deduplicator for non-duplicate updates', async () => {
      mockDedupIsDuplicate.mockReturnValue(false);
      mockSyncProgress.mockResolvedValue({ success: true });

      await handleProgressUpdate(makeUpdate());

      expect(mockDedupAdd).toHaveBeenCalledTimes(1);
    });

    it('should queue update when API sync fails', async () => {
      mockDedupIsDuplicate.mockReturnValue(false);
      mockSyncProgress.mockResolvedValue({ success: false, error: 'Server error: 500' });

      const result = await handleProgressUpdate(makeUpdate());

      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
      expect(result.queued).toBe(true);
      expect(result.success).toBe(false);
    });

    it('should queue update when offline (not call API)', async () => {
      onOffline();
      mockDedupIsDuplicate.mockReturnValue(false);

      const result = await handleProgressUpdate(makeUpdate());

      expect(mockSyncProgress).not.toHaveBeenCalled();
      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
      expect(result.queued).toBe(true);
      expect(result.success).toBe(true);
    });
  });

  describe('processQueue()', () => {
    it('should do nothing when queue is empty', async () => {
      mockQueueGetAll.mockReturnValue([]);
      await processQueue();
      expect(mockSyncProgress).not.toHaveBeenCalled();
    });

    it('should sync and remove each queued item on success', async () => {
      const item = { ...makeUpdate(), id: 'item-1', retries: 0 };
      mockQueueGetAll.mockReturnValue([item]);
      mockSyncProgress.mockResolvedValue({ success: true, synced_at: '2026-01-01T00:00:00Z' });

      await processQueue();

      expect(mockSyncProgress).toHaveBeenCalledWith(item);
      expect(mockQueueRemove).toHaveBeenCalledWith('item-1');
    });

    it('should increment retry and not remove on failure', async () => {
      const item = { ...makeUpdate(), id: 'item-2', retries: 0 };
      mockQueueGetAll.mockReturnValue([item]);
      mockSyncProgress.mockResolvedValue({ success: false, error: 'timeout' });

      await processQueue();

      expect(mockQueueRemove).not.toHaveBeenCalled();
      expect(mockQueueIncrementRetry).toHaveBeenCalledWith('item-2');
    });

    it('should call removeExhausted after processing', async () => {
      mockQueueGetAll.mockReturnValue([]);
      jest.clearAllMocks();
      await processQueue();
      expect(mockQueueRemoveExhausted).toHaveBeenCalledTimes(1);
    });

    it('should process multiple queued items', async () => {
      const items = [
        { ...makeUpdate({ series_id: 'series-1' }), id: 'item-1', retries: 0 },
        { ...makeUpdate({ series_id: 'series-2' }), id: 'item-2', retries: 0 },
      ];
      mockQueueGetAll.mockReturnValue(items);
      mockSyncProgress.mockResolvedValue({ success: true });

      await processQueue();

      expect(mockSyncProgress).toHaveBeenCalledTimes(2);
      expect(mockQueueRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('getQueuedUpdates()', () => {
    it('should return queued updates from the queue', () => {
      const items = [{ ...makeUpdate(), id: 'item-1', retries: 0 }];
      mockQueueGetAll.mockReturnValue(items);
      expect(getQueuedUpdates()).toEqual(items);
    });
  });

  describe('onOnline() and onOffline()', () => {
    it('should set isOnline to false when onOffline called', () => {
      onOffline();
      expect(getIsOnline()).toBe(false);
    });

    it('should set isOnline to true when onOnline called', () => {
      onOffline();
      onOnline();
      expect(getIsOnline()).toBe(true);
    });

    it('should trigger processQueue when onOnline called', async () => {
      mockQueueGetAll.mockReturnValue([]);
      onOnline();
      await new Promise((r) => setTimeout(r, 20));
      expect(mockQueueRemoveExhausted).toHaveBeenCalled();
    });
  });
});

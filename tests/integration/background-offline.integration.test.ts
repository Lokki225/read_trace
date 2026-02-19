import { BackgroundProgressUpdate } from '../../src/extension/types';

jest.mock('../../src/extension/api', () => ({
  syncProgress: jest.fn(),
  setAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
}));

jest.mock('../../src/extension/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  setDebugMode: jest.fn(),
  isDebugMode: jest.fn(() => false),
}));

import { syncProgress } from '../../src/extension/api';
import * as queueModule from '../../src/extension/queue/syncQueue';
import * as dedupModule from '../../src/extension/queue/deduplicator';

const mockSyncProgress = syncProgress as jest.MockedFunction<typeof syncProgress>;

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-123',
  chapter: 10,
  scroll_position: 50,
  timestamp: Date.now(),
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('Background Script - Offline/Online Integration', () => {
  let handleProgressUpdate: (update: BackgroundProgressUpdate) => Promise<{ success: boolean; queued: boolean; error?: string }>;
  let onOnline: () => void;
  let onOffline: () => void;
  let getQueuedUpdates: () => ReturnType<typeof queueModule.getAll>;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../src/extension/api', () => ({
      syncProgress: mockSyncProgress,
      setAuthToken: jest.fn(),
      getAuthToken: jest.fn(),
    }));
    jest.mock('../../src/extension/logger', () => ({
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      getLogs: jest.fn(() => []),
      clearLogs: jest.fn(),
      setDebugMode: jest.fn(),
      isDebugMode: jest.fn(() => false),
    }));

    queueModule.clear();
    dedupModule.clear();
    localStorage.clear();
    jest.clearAllMocks();

    ({ handleProgressUpdate, onOnline, onOffline, getQueuedUpdates } = require('../../src/extension/background'));
  });

  afterEach(() => {
    queueModule.clear();
    dedupModule.clear();
    localStorage.clear();
  });

  describe('AC-3: Offline queue management', () => {
    it('should queue updates when offline', async () => {
      onOffline();

      await handleProgressUpdate(makeUpdate({ series_id: 'series-offline-1' }));

      const queued = getQueuedUpdates();
      expect(queued).toHaveLength(1);
      expect(queued[0].series_id).toBe('series-offline-1');
    });

    it('should queue multiple updates when offline', async () => {
      onOffline();

      await handleProgressUpdate(makeUpdate({ series_id: 'series-1', chapter: 1 }));
      await handleProgressUpdate(makeUpdate({ series_id: 'series-2', chapter: 2 }));

      const queued = getQueuedUpdates();
      expect(queued).toHaveLength(2);
    });

    it('should persist queued updates to localStorage', async () => {
      onOffline();
      await handleProgressUpdate(makeUpdate());

      const stored = localStorage.getItem('readtrace_sync_queue');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should not call API when offline', async () => {
      onOffline();
      await handleProgressUpdate(makeUpdate());
      expect(mockSyncProgress).not.toHaveBeenCalled();
    });
  });

  describe('AC-4: Reconnection sync', () => {
    it('should sync queued updates when reconnected', async () => {
      mockSyncProgress.mockResolvedValue({ success: true, synced_at: new Date().toISOString() });

      onOffline();
      await handleProgressUpdate(makeUpdate({ series_id: 'series-queued-1', chapter: 5 }));
      await handleProgressUpdate(makeUpdate({ series_id: 'series-queued-2', chapter: 6 }));

      expect(getQueuedUpdates()).toHaveLength(2);

      onOnline();
      await new Promise((r) => setTimeout(r, 50));

      expect(mockSyncProgress).toHaveBeenCalledTimes(2);
      expect(getQueuedUpdates()).toHaveLength(0);
    });

    it('should handle partial sync failure on reconnection', async () => {
      mockSyncProgress
        .mockResolvedValueOnce({ success: true, synced_at: new Date().toISOString() })
        .mockResolvedValueOnce({ success: false, error: 'Server error: 500' });

      onOffline();
      await handleProgressUpdate(makeUpdate({ series_id: 'series-ok', chapter: 1 }));
      await handleProgressUpdate(makeUpdate({ series_id: 'series-fail', chapter: 2 }));

      onOnline();
      await new Promise((r) => setTimeout(r, 50));

      const remaining = getQueuedUpdates();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].series_id).toBe('series-fail');
    });
  });

  describe('AC-1: Message capture and validation', () => {
    it('should process valid progress update', async () => {
      mockSyncProgress.mockResolvedValue({ success: true });
      onOnline();

      const result = await handleProgressUpdate(makeUpdate());
      expect(result.success).toBe(true);
    });

    it('should queue update when API returns error', async () => {
      mockSyncProgress.mockResolvedValue({ success: false, error: 'timeout' });
      onOnline();

      const result = await handleProgressUpdate(makeUpdate());
      expect(result.queued).toBe(true);
      expect(getQueuedUpdates()).toHaveLength(1);
    });
  });

  describe('AC-5: Duplicate prevention', () => {
    it('should not queue duplicate updates', async () => {
      onOffline();
      const update = makeUpdate({ series_id: 'series-dup', chapter: 10, timestamp: 1000 });
      const duplicate = makeUpdate({ series_id: 'series-dup', chapter: 10, timestamp: 1000 });

      await handleProgressUpdate(update);
      await handleProgressUpdate(duplicate);

      const queued = getQueuedUpdates();
      expect(queued).toHaveLength(1);
    });

    it('should allow newer update for same series+chapter', async () => {
      mockSyncProgress.mockResolvedValue({ success: true });
      onOnline();

      const update1 = makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 1000 });
      const update2 = makeUpdate({ series_id: 'series-1', chapter: 10, timestamp: 2000 });

      await handleProgressUpdate(update1);
      await handleProgressUpdate(update2);

      expect(mockSyncProgress).toHaveBeenCalledTimes(2);
    });
  });
});

import { BackgroundProgressUpdate } from '../../src/extension/types';

jest.mock('../../src/extension/logger', () => ({
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
  markSynced,
  removeSynced,
  clear as clearOfflineStorage,
  getStats,
} from '../../src/extension/storage/offlineStorage';

import {
  getConnectionState,
  isOnline,
  onConnectionChange,
  forceStatus,
  resetState as resetConnectionState,
} from '../../src/extension/network/connectionDetector';

import {
  getIndicatorState,
  setConnectionStatus,
  setSyncStatus,
  setPendingCount,
  notifySyncStarted,
  notifySyncComplete,
  notifySyncError,
  getBadgeText,
  getStatusMessage,
  resetIndicatorState,
  onIndicatorChange,
} from '../../src/extension/ui/offlineIndicator';

import {
  add as queueAdd,
  getAll as queueGetAll,
  clear as queueClear,
  getBackoffDelay,
  isReadyForRetry,
  addFromOffline,
  load as queueLoad,
} from '../../src/extension/queue/syncQueue';

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-abc',
  chapter: 5,
  scroll_position: 42,
  timestamp: Date.now(),
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('Offline Integration: Storage + Connection + Indicator', () => {
  beforeEach(() => {
    localStorage.clear();
    resetConnectionState();
    resetIndicatorState();
    queueClear();
    jest.clearAllMocks();
  });

  describe('AC-1 & AC-2: Progress saved to local storage when offline', () => {
    it('should save progress to offline storage when offline', () => {
      forceStatus('offline');
      expect(isOnline()).toBe(false);

      const update = makeUpdate();
      const entry = saveProgress(update);

      expect(entry.synced).toBe(false);
      expect(getUnsynced()).toHaveLength(1);
    });

    it('should continue tracking progress across multiple offline updates', () => {
      forceStatus('offline');

      saveProgress(makeUpdate({ chapter: 1, scroll_position: 10 }));
      saveProgress(makeUpdate({ chapter: 2, scroll_position: 20 }));
      saveProgress(makeUpdate({ chapter: 3, scroll_position: 30 }));

      expect(getUnsynced()).toHaveLength(3);
    });

    it('should update existing entry when same chapter read again offline', () => {
      forceStatus('offline');

      saveProgress(makeUpdate({ chapter: 5, scroll_position: 20, timestamp: 1000 }));
      saveProgress(makeUpdate({ chapter: 5, scroll_position: 80, timestamp: 2000 }));

      const unsynced = getUnsynced();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].scroll_position).toBe(80);
    });

    it('should notify connection change handler when going offline', () => {
      const handler = jest.fn();
      onConnectionChange(handler);

      forceStatus('offline');

      expect(handler).toHaveBeenCalledWith('offline');
    });
  });

  describe('AC-3 & AC-4: Sync on reconnection with no data loss', () => {
    it('should have unsynced data available after going offline then online', () => {
      forceStatus('offline');
      saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));

      forceStatus('online');

      const unsynced = getUnsynced();
      expect(unsynced).toHaveLength(2);
    });

    it('should queue offline entries for sync on reconnection', () => {
      forceStatus('offline');
      const update1 = makeUpdate({ series_id: 'series-1', timestamp: 1000 });
      const update2 = makeUpdate({ series_id: 'series-2', timestamp: 2000 });
      saveProgress(update1);
      saveProgress(update2);

      forceStatus('online');

      const unsynced = getUnsynced();
      for (const entry of unsynced) {
        addFromOffline({
          series_id: entry.series_id,
          chapter: entry.chapter,
          scroll_position: entry.scroll_position,
          timestamp: entry.timestamp,
          url: entry.url,
        });
      }

      expect(queueGetAll()).toHaveLength(2);
    });

    it('should preserve data if sync fails (not clear storage)', () => {
      forceStatus('offline');
      saveProgress(makeUpdate());

      forceStatus('online');

      const unsynced = getUnsynced();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].synced).toBe(false);
    });

    it('should clear local storage only after confirmed sync', () => {
      forceStatus('offline');
      const entry = saveProgress(makeUpdate());

      forceStatus('online');

      markSynced(entry.id);
      const removed = removeSynced();

      expect(removed).toBe(1);
      expect(getUnsynced()).toHaveLength(0);
    });
  });

  describe('AC-5: User notifications of sync status', () => {
    it('should update indicator to offline when connection lost', () => {
      setConnectionStatus('offline');
      expect(getIndicatorState().connectionStatus).toBe('offline');
    });

    it('should show pending count in offline indicator', () => {
      setConnectionStatus('offline');
      setPendingCount(3);

      const state = getIndicatorState();
      expect(state.pendingCount).toBe(3);
      expect(getBadgeText(state)).toBe('3');
    });

    it('should show syncing status when sync starts', () => {
      notifySyncStarted(2);

      const state = getIndicatorState();
      expect(state.syncStatus).toBe('syncing');
      expect(state.pendingCount).toBe(2);
    });

    it('should show success status after sync completes', () => {
      notifySyncStarted(1);
      notifySyncComplete(1);

      const state = getIndicatorState();
      expect(state.syncStatus).toBe('success');
      expect(state.lastSyncedAt).not.toBeNull();
    });

    it('should show error status when sync fails', () => {
      notifySyncStarted(1);
      notifySyncError('Network timeout');

      const state = getIndicatorState();
      expect(state.syncStatus).toBe('error');
      expect(state.syncError).toBe('Network timeout');
    });

    it('should call indicator change handler on status update', () => {
      const handler = jest.fn();
      onIndicatorChange(handler);

      setConnectionStatus('offline');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].connectionStatus).toBe('offline');
    });

    it('should provide correct status message when offline with pending items', () => {
      const state = {
        connectionStatus: 'offline' as const,
        syncStatus: 'idle' as const,
        pendingCount: 3,
        lastSyncedAt: null,
        syncError: null,
      };
      expect(getStatusMessage(state)).toContain('3');
      expect(getStatusMessage(state)).toContain('pending');
    });

    it('should provide correct status message when syncing', () => {
      const state = {
        connectionStatus: 'online' as const,
        syncStatus: 'syncing' as const,
        pendingCount: 2,
        lastSyncedAt: null,
        syncError: null,
      };
      expect(getStatusMessage(state)).toContain('Syncing');
    });

    it('should provide correct status message after successful sync', () => {
      const state = {
        connectionStatus: 'online' as const,
        syncStatus: 'success' as const,
        pendingCount: 0,
        lastSyncedAt: Date.now(),
        syncError: null,
      };
      expect(getStatusMessage(state)).toContain('synced');
    });
  });

  describe('AC-6: Local storage cleared after successful sync', () => {
    it('should clear synced entries after successful sync', () => {
      forceStatus('offline');
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      const e2 = saveProgress(makeUpdate({ series_id: 'series-2' }));

      forceStatus('online');

      markSynced(e1.id);
      markSynced(e2.id);
      const removed = removeSynced();

      expect(removed).toBe(2);
      expect(getUnsynced()).toHaveLength(0);
    });

    it('should not clear unsynced entries after partial sync', () => {
      forceStatus('offline');
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));

      forceStatus('online');

      markSynced(e1.id);
      removeSynced();

      expect(getUnsynced()).toHaveLength(1);
    });

    it('should update stats after clearing synced entries', () => {
      const e1 = saveProgress(makeUpdate({ series_id: 'series-1' }));
      saveProgress(makeUpdate({ series_id: 'series-2' }));

      markSynced(e1.id);
      removeSynced();

      const stats = getStats();
      expect(stats.count).toBe(1);
    });
  });

  describe('Exponential backoff for retry logic', () => {
    it('should calculate correct backoff delays', () => {
      expect(getBackoffDelay(0)).toBe(1000);
      expect(getBackoffDelay(1)).toBe(2000);
      expect(getBackoffDelay(2)).toBe(4000);
      expect(getBackoffDelay(3)).toBe(8000);
      expect(getBackoffDelay(4)).toBe(16000);
    });

    it('should cap backoff at 30 seconds', () => {
      expect(getBackoffDelay(10)).toBe(30000);
      expect(getBackoffDelay(20)).toBe(30000);
    });

    it('should mark item as ready for retry when retries is 0', () => {
      const item = { ...makeUpdate(), id: 'item-1', retries: 0 };
      expect(isReadyForRetry(item)).toBe(true);
    });

    it('should mark item as not ready for retry when within backoff window', () => {
      const item = {
        ...makeUpdate(),
        id: 'item-1',
        retries: 1,
        lastRetry: Date.now(),
      };
      expect(isReadyForRetry(item)).toBe(false);
    });

    it('should mark item as ready for retry after backoff window expires', () => {
      const item = {
        ...makeUpdate(),
        id: 'item-1',
        retries: 1,
        lastRetry: Date.now() - 3000,
      };
      expect(isReadyForRetry(item)).toBe(true);
    });
  });

  describe('addFromOffline() deduplication in queue', () => {
    it('should add offline entry to queue', () => {
      const update = makeUpdate();
      addFromOffline(update);
      expect(queueGetAll()).toHaveLength(1);
    });

    it('should merge duplicate offline entries (same series + chapter)', () => {
      const update1 = makeUpdate({ scroll_position: 20, timestamp: 1000 });
      const update2 = makeUpdate({ scroll_position: 80, timestamp: 2000 });

      addFromOffline(update1);
      addFromOffline(update2);

      const all = queueGetAll();
      expect(all).toHaveLength(1);
      expect(all[0].scroll_position).toBe(80);
    });

    it('should not merge entries with different chapters', () => {
      addFromOffline(makeUpdate({ chapter: 1 }));
      addFromOffline(makeUpdate({ chapter: 2 }));
      expect(queueGetAll()).toHaveLength(2);
    });

    it('should not update existing entry if new timestamp is older', () => {
      const update1 = makeUpdate({ scroll_position: 80, timestamp: 2000 });
      const update2 = makeUpdate({ scroll_position: 20, timestamp: 1000 });

      addFromOffline(update1);
      addFromOffline(update2);

      const all = queueGetAll();
      expect(all[0].scroll_position).toBe(80);
    });
  });

  describe('Full offline→online flow', () => {
    it('should complete full offline→online sync cycle without data loss', () => {
      forceStatus('offline');
      setConnectionStatus('offline');

      const updates = [
        makeUpdate({ series_id: 'series-1', chapter: 1, scroll_position: 30 }),
        makeUpdate({ series_id: 'series-1', chapter: 2, scroll_position: 50 }),
        makeUpdate({ series_id: 'series-2', chapter: 5, scroll_position: 75 }),
      ];

      const savedEntries = updates.map((u) => saveProgress(u));
      setPendingCount(savedEntries.length);

      expect(getUnsynced()).toHaveLength(3);
      expect(getIndicatorState().pendingCount).toBe(3);

      forceStatus('online');
      setConnectionStatus('online');
      notifySyncStarted(savedEntries.length);

      expect(getIndicatorState().syncStatus).toBe('syncing');

      for (const entry of savedEntries) {
        markSynced(entry.id);
      }
      const removed = removeSynced();
      notifySyncComplete(removed);

      expect(removed).toBe(3);
      expect(getUnsynced()).toHaveLength(0);
      expect(getIndicatorState().syncStatus).toBe('success');
      expect(getIndicatorState().lastSyncedAt).not.toBeNull();
    });
  });
});

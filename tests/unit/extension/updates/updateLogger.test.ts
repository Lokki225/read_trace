import {
  logUpdateEvent,
  getUpdateLog,
  getRecentUpdateLog,
  getUpdateLogByType,
  clearUpdateLog,
  logUpdateCheck,
  logUpdateAvailable,
  logUpdateInstalled,
  logUpdateFailed,
  logNotificationDismissed,
  getLastSuccessfulUpdate,
  getLastUpdateCheck
} from '../../../../src/extension/updates/updateLogger';

const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

(global as any).chrome = mockChrome;

describe('updateLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChrome.storage.local.get.mockResolvedValue({});
    mockChrome.storage.local.set.mockResolvedValue(undefined);
    mockChrome.storage.local.remove.mockResolvedValue(undefined);
  });

  describe('logUpdateEvent', () => {
    it('should add event to log', async () => {
      await logUpdateEvent({
        type: 'check',
        version: '1.1.0'
      });

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
      const call = mockChrome.storage.local.set.mock.calls[0][0];
      expect(call.readtrace_update_log).toBeDefined();
      expect(call.readtrace_update_log[0].type).toBe('check');
    });

    it('should set timestamp if not provided', async () => {
      const beforeTime = Date.now();
      await logUpdateEvent({
        type: 'check',
        version: '1.1.0'
      });
      const afterTime = Date.now();

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(entry.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should preserve provided timestamp', async () => {
      const customTime = 1000000;
      await logUpdateEvent({
        type: 'check',
        version: '1.1.0',
        timestamp: customTime
      });

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.timestamp).toBe(customTime);
    });

    it('should remove old entries beyond retention period', async () => {
      const thirtyDaysAgo = Date.now() - (31 * 24 * 60 * 60 * 1000);
      const yesterday = Date.now() - (24 * 60 * 60 * 1000);

      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: [
          { type: 'check', version: '1.0.0', timestamp: thirtyDaysAgo },
          { type: 'check', version: '1.1.0', timestamp: yesterday }
        ]
      });

      await logUpdateEvent({
        type: 'check',
        version: '1.2.0'
      });

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const logs = call.readtrace_update_log;
      expect(logs.length).toBe(2);
      expect(logs[0].version).toBe('1.1.0');
    });

    it('should trim to max entries', async () => {
      const oldLogs = Array.from({ length: 101 }, (_, i) => ({
        type: 'check' as const,
        version: `1.0.${i}`,
        timestamp: Date.now() - (100 - i) * 1000
      }));

      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: oldLogs
      });

      await logUpdateEvent({
        type: 'check',
        version: '1.1.0'
      });

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const logs = call.readtrace_update_log;
      expect(logs.length).toBeLessThanOrEqual(100);
    });

    it('should handle storage error silently', async () => {
      mockChrome.storage.local.set.mockRejectedValue(new Error('Storage error'));

      await expect(
        logUpdateEvent({ type: 'check', version: '1.1.0' })
      ).resolves.toBeUndefined();
    });
  });

  describe('getUpdateLog', () => {
    it('should return all log entries', async () => {
      const logs = [
        { type: 'check' as const, version: '1.0.0', timestamp: Date.now() },
        { type: 'available' as const, version: '1.1.0', timestamp: Date.now() }
      ];
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: logs
      });

      const result = await getUpdateLog();

      expect(result).toEqual(logs);
    });

    it('should return empty array if no logs', async () => {
      const result = await getUpdateLog();
      expect(result).toEqual([]);
    });

    it('should handle storage error silently', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'));

      const result = await getUpdateLog();
      expect(result).toEqual([]);
    });
  });

  describe('getRecentUpdateLog', () => {
    it('should return recent entries', async () => {
      const logs = Array.from({ length: 20 }, (_, i) => ({
        type: 'check' as const,
        version: `1.0.${i}`,
        timestamp: Date.now()
      }));
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: logs
      });

      const result = await getRecentUpdateLog(5);

      expect(result.length).toBe(5);
      expect(result[0].version).toBe('1.0.15');
    });

    it('should default to 10 entries', async () => {
      const logs = Array.from({ length: 20 }, (_, i) => ({
        type: 'check' as const,
        version: `1.0.${i}`,
        timestamp: Date.now()
      }));
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: logs
      });

      const result = await getRecentUpdateLog();

      expect(result.length).toBe(10);
    });
  });

  describe('getUpdateLogByType', () => {
    it('should filter logs by type', async () => {
      const logs = [
        { type: 'check' as const, version: '1.0.0', timestamp: Date.now() },
        { type: 'available' as const, version: '1.1.0', timestamp: Date.now() },
        { type: 'check' as const, version: '1.2.0', timestamp: Date.now() }
      ];
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: logs
      });

      const result = await getUpdateLogByType('check');

      expect(result.length).toBe(2);
      expect(result.every(log => log.type === 'check')).toBe(true);
    });

    it('should return empty array if no matching logs', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: []
      });

      const result = await getUpdateLogByType('installed');

      expect(result).toEqual([]);
    });
  });

  describe('clearUpdateLog', () => {
    it('should remove log from storage', async () => {
      await clearUpdateLog();

      expect(mockChrome.storage.local.remove).toHaveBeenCalledWith('readtrace_update_log');
    });

    it('should handle error silently', async () => {
      mockChrome.storage.local.remove.mockRejectedValue(new Error('Remove error'));

      await expect(clearUpdateLog()).resolves.toBeUndefined();
    });
  });

  describe('logUpdateCheck', () => {
    it('should log update check with versions', async () => {
      await logUpdateCheck('1.0.0', '1.1.0');

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.type).toBe('check');
      expect(entry.currentVersion).toBe('1.0.0');
      expect(entry.version).toBe('1.1.0');
    });

    it('should log error if provided', async () => {
      await logUpdateCheck('1.0.0', '1.1.0', 'Network error');

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.error).toBe('Network error');
    });
  });

  describe('logUpdateAvailable', () => {
    it('should log update available event', async () => {
      await logUpdateAvailable('1.1.0');

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.type).toBe('available');
      expect(entry.version).toBe('1.1.0');
    });
  });

  describe('logUpdateInstalled', () => {
    it('should log update installed event', async () => {
      await logUpdateInstalled('1.1.0');

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.type).toBe('installed');
      expect(entry.version).toBe('1.1.0');
    });
  });

  describe('logUpdateFailed', () => {
    it('should log update failed event with error', async () => {
      await logUpdateFailed('1.1.0', 'Installation failed');

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.type).toBe('failed');
      expect(entry.version).toBe('1.1.0');
      expect(entry.error).toBe('Installation failed');
    });
  });

  describe('logNotificationDismissed', () => {
    it('should log dismissed notification', async () => {
      await logNotificationDismissed('1.1.0');

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const entry = call.readtrace_update_log[0];
      expect(entry.type).toBe('dismissed');
      expect(entry.version).toBe('1.1.0');
    });
  });

  describe('getLastSuccessfulUpdate', () => {
    it('should return last installed update', async () => {
      const logs = [
        { type: 'check' as const, version: '1.0.0', timestamp: Date.now() - 1000 },
        { type: 'installed' as const, version: '1.1.0', timestamp: Date.now() }
      ];
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: logs
      });

      const result = await getLastSuccessfulUpdate();

      expect(result?.type).toBe('installed');
      expect(result?.version).toBe('1.1.0');
    });

    it('should return null if no successful updates', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: [
          { type: 'check' as const, version: '1.0.0', timestamp: Date.now() }
        ]
      });

      const result = await getLastSuccessfulUpdate();

      expect(result).toBeNull();
    });
  });

  describe('getLastUpdateCheck', () => {
    it('should return last update check', async () => {
      const logs = [
        { type: 'check' as const, version: '1.0.0', timestamp: Date.now() - 1000 },
        { type: 'check' as const, version: '1.1.0', timestamp: Date.now() }
      ];
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: logs
      });

      const result = await getLastUpdateCheck();

      expect(result?.type).toBe('check');
      expect(result?.version).toBe('1.1.0');
    });

    it('should return null if no checks', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_log: []
      });

      const result = await getLastUpdateCheck();

      expect(result).toBeNull();
    });
  });
});

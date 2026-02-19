import * as updateService from '../../src/extension/updates/updateService';
import * as updateNotifier from '../../src/extension/updates/updateNotifier';
import * as updateInstaller from '../../src/extension/updates/updateInstaller';
import * as updateLogger from '../../src/extension/updates/updateLogger';
import * as updateLifecycle from '../../src/extension/updates/updateLifecycle';

const mockChrome = {
  runtime: {
    getManifest: jest.fn(() => ({ version: '1.0.0' })),
    getURL: jest.fn((path: string) => `chrome-extension://id/${path}`),
    requestUpdateCheck: jest.fn(),
    onInstalled: {
      addListener: jest.fn()
    }
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
    onButtonClicked: {
      addListener: jest.fn()
    },
    onClosed: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

(global as any).chrome = mockChrome;

describe('Extension Updates Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChrome.storage.local.get.mockResolvedValue({});
    mockChrome.storage.local.set.mockResolvedValue(undefined);
    mockChrome.storage.local.remove.mockResolvedValue(undefined);
    mockChrome.notifications.create.mockResolvedValue('notification-id');
    mockChrome.notifications.clear.mockResolvedValue(true);
    mockChrome.runtime.requestUpdateCheck.mockImplementation((callback: (status: string) => void) => {
      callback('update_available');
    });
  });

  describe('Full Update Flow: Check → Notify → Install', () => {
    it('should complete full update flow', async () => {
      // Step 1: Check for updates
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.1.0' })
        })
      ) as jest.Mock;

      const checkResult = await updateService.checkForUpdates();
      expect(checkResult.isUpdateAvailable).toBe(true);
      expect(checkResult.latestVersion).toBe('1.1.0');

      // Step 2: Log the check
      await updateLogger.logUpdateCheck(checkResult.currentVersion, checkResult.latestVersion);
      expect(mockChrome.storage.local.set).toHaveBeenCalled();

      // Step 3: Notify user
      await updateNotifier.notifyUpdateAvailable({
        version: '1.1.0',
        features: ['New feature'],
        bugFixes: ['Bug fix']
      });
      expect(mockChrome.notifications.create).toHaveBeenCalled();

      // Step 4: Log notification
      await updateLogger.logUpdateAvailable('1.1.0');

      // Step 5: Request update installation
      const installResult = await updateInstaller.requestUpdate();
      expect(installResult.status).toBe('update_available');

      // Step 6: Log successful installation
      await updateLogger.logUpdateInstalled('1.1.0');

      // Verify flow completed
      const logs = await updateLogger.getUpdateLog();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should handle no update available scenario', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.0.0' })
        })
      ) as jest.Mock;

      const checkResult = await updateService.checkForUpdates();
      expect(checkResult.isUpdateAvailable).toBe(false);

      await updateLogger.logUpdateCheck(checkResult.currentVersion, checkResult.latestVersion);

      // Should not notify if no update available
      expect(mockChrome.notifications.create).not.toHaveBeenCalled();
    });

    it('should handle update check failure gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

      const checkResult = await updateService.checkForUpdates();
      expect(checkResult.error).toBeDefined();

      await updateLogger.logUpdateCheck(
        checkResult.currentVersion,
        checkResult.latestVersion,
        checkResult.error
      );

      const logs = await updateLogger.getUpdateLog();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.error).toBeDefined();
    });
  });

  describe('Manual Update Check', () => {
    it('should allow manual update check from settings', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.1.0' })
        })
      ) as jest.Mock;

      // Simulate user clicking "Check for Updates" button
      const result = await updateService.checkForUpdates();

      expect(result.isUpdateAvailable).toBe(true);
      expect(result.lastCheckTime).toBeGreaterThan(0);
    });

    it('should clear cache for fresh check', async () => {
      // First check
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.0.0' })
        })
      ) as jest.Mock;

      await updateService.checkForUpdates();
      expect(mockChrome.storage.local.set).toHaveBeenCalled();

      // Clear cache
      await updateService.clearUpdateCache();
      expect(mockChrome.storage.local.remove).toHaveBeenCalled();

      // Second check should be fresh
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.1.0' })
        })
      ) as jest.Mock;

      mockChrome.storage.local.get.mockResolvedValue({});
      const result = await updateService.checkForUpdates();
      expect(result.latestVersion).toBe('1.1.0');
    });
  });

  describe('State Preservation During Update', () => {
    it('should preserve lifecycle state across updates', async () => {
      // Initialize lifecycle
      await updateLifecycle.initializeLifecycle();

      const state = await updateLifecycle.getLifecycleState();
      expect(state).toBeDefined();
      expect(state?.lastVersion).toBe('1.0.0');

      // Simulate update event
      await updateLifecycle.handleInstallEvent('update');

      const updatedState = await updateLifecycle.getLifecycleState();
      expect(updatedState?.updateCount).toBeGreaterThan(0);
    });

    it('should track installation date', async () => {
      await updateLifecycle.initializeLifecycle();

      const installDate = await updateLifecycle.getInstallationDate();
      expect(installDate).toBeDefined();
      expect(installDate).toBeInstanceOf(Date);
    });

    it('should track update count', async () => {
      await updateLifecycle.initializeLifecycle();

      let count = await updateLifecycle.getUpdateCount();
      expect(count).toBe(0);

      await updateLifecycle.handleInstallEvent('update');

      count = await updateLifecycle.getUpdateCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Update History and Logging', () => {
    it('should maintain update history', async () => {
      // Log multiple events
      await updateLogger.logUpdateCheck('1.0.0', '1.1.0');
      await updateLogger.logUpdateAvailable('1.1.0');
      await updateLogger.logUpdateInstalled('1.1.0');

      const logs = await updateLogger.getUpdateLog();
      expect(logs.length).toBe(3);
      expect(logs[0].type).toBe('check');
      expect(logs[1].type).toBe('available');
      expect(logs[2].type).toBe('installed');
    });

    it('should retrieve recent updates', async () => {
      // Log multiple events
      for (let i = 0; i < 15; i++) {
        await updateLogger.logUpdateCheck('1.0.0', `1.${i}.0`);
      }

      const recent = await updateLogger.getRecentUpdateLog(5);
      expect(recent.length).toBe(5);
    });

    it('should filter logs by type', async () => {
      await updateLogger.logUpdateCheck('1.0.0', '1.1.0');
      await updateLogger.logUpdateAvailable('1.1.0');
      await updateLogger.logUpdateInstalled('1.1.0');
      await updateLogger.logUpdateFailed('1.2.0', 'Installation failed');

      const installed = await updateLogger.getUpdateLogByType('installed');
      expect(installed.length).toBe(1);
      expect(installed[0].type).toBe('installed');

      const failed = await updateLogger.getUpdateLogByType('failed');
      expect(failed.length).toBe(1);
      expect(failed[0].type).toBe('failed');
    });

    it('should get last successful update', async () => {
      await updateLogger.logUpdateInstalled('1.0.0');
      await updateLogger.logUpdateInstalled('1.1.0');
      await updateLogger.logUpdateFailed('1.2.0', 'Error');

      const last = await updateLogger.getLastSuccessfulUpdate();
      expect(last?.version).toBe('1.1.0');
      expect(last?.type).toBe('installed');
    });

    it('should get last update check', async () => {
      await updateLogger.logUpdateCheck('1.0.0', '1.0.5');
      await updateLogger.logUpdateCheck('1.0.5', '1.1.0');

      const last = await updateLogger.getLastUpdateCheck();
      expect(last?.version).toBe('1.1.0');
      expect(last?.type).toBe('check');
    });
  });

  describe('Notification Interaction', () => {
    it('should handle install now button click', async () => {
      const onInstall = jest.fn();
      const onDismiss = jest.fn();

      updateNotifier.setupNotificationHandler(onInstall, onDismiss);

      // Simulate button click
      const listener = (mockChrome.notifications.onButtonClicked.addListener as jest.Mock).mock.calls[0][0];
      listener('readtrace_update_available', 0);

      expect(onInstall).toHaveBeenCalled();
    });

    it('should handle dismiss button click', async () => {
      const onInstall = jest.fn();
      const onDismiss = jest.fn();

      updateNotifier.setupNotificationHandler(onInstall, onDismiss);

      // Simulate button click
      const listener = (mockChrome.notifications.onButtonClicked.addListener as jest.Mock).mock.calls[0][0];
      listener('readtrace_update_available', 1);

      expect(onDismiss).toHaveBeenCalled();
    });

    it('should handle notification closed event', async () => {
      const onClosed = jest.fn();

      updateNotifier.setupNotificationClosedHandler(onClosed);

      // Simulate closed event
      const listener = (mockChrome.notifications.onClosed.addListener as jest.Mock).mock.calls[0][0];
      listener('readtrace_update_available');

      expect(onClosed).toHaveBeenCalled();
    });

    it('should prevent duplicate notifications for same version', async () => {
      mockChrome.notifications.create.mockClear();

      // First notification
      await updateNotifier.notifyUpdateAvailable({ version: '1.1.0' });
      expect(mockChrome.notifications.create).toHaveBeenCalledTimes(1);

      // Dismiss it
      await updateNotifier.dismissNotification('1.1.0');

      // Try to notify again
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_notification_dismissed_1_1_0: { version: '1.1.0' }
      });

      await updateNotifier.notifyUpdateAvailable({ version: '1.1.0' });
      expect(mockChrome.notifications.create).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should allow notification for new version after dismissing old', async () => {
      mockChrome.notifications.create.mockClear();

      // Dismiss 1.1.0
      await updateNotifier.dismissNotification('1.1.0');

      // Notify for 1.2.0
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_notification_dismissed_1_1_0: { version: '1.1.0' }
      });

      await updateNotifier.notifyUpdateAvailable({ version: '1.2.0' });
      expect(mockChrome.notifications.create).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle storage errors gracefully', async () => {
      mockChrome.storage.local.set.mockRejectedValue(new Error('Storage quota exceeded'));

      // Should not throw
      await expect(
        updateLogger.logUpdateEvent({ type: 'check', version: '1.1.0' })
      ).resolves.toBeUndefined();
    });

    it('should handle notification API errors gracefully', async () => {
      mockChrome.notifications.create.mockRejectedValue(new Error('Notifications disabled'));

      // Should not throw
      await expect(
        updateNotifier.notifyUpdateAvailable({ version: '1.1.0' })
      ).resolves.toBeUndefined();
    });

    it('should handle network timeouts gracefully', async () => {
      global.fetch = jest.fn(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        })
      ) as jest.Mock;

      const result = await updateService.checkForUpdates();
      expect(result.error).toBeDefined();
      expect(result.isUpdateAvailable).toBe(false);
    });
  });

  describe('Version Comparison Edge Cases', () => {
    it('should handle major version upgrades', () => {
      expect(updateService.compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(updateService.compareVersions('2.0.0', '1.0.0')).toBe(1);
    });

    it('should handle minor version upgrades', () => {
      expect(updateService.compareVersions('1.1.0', '1.2.0')).toBe(-1);
      expect(updateService.compareVersions('1.2.0', '1.1.0')).toBe(1);
    });

    it('should handle patch version upgrades', () => {
      expect(updateService.compareVersions('1.0.1', '1.0.2')).toBe(-1);
      expect(updateService.compareVersions('1.0.2', '1.0.1')).toBe(1);
    });

    it('should handle equal versions', () => {
      expect(updateService.compareVersions('1.0.0', '1.0.0')).toBe(0);
    });

    it('should handle malformed versions', () => {
      expect(updateService.compareVersions('1.a.0', '1.0.0')).toBe(0);
      expect(updateService.compareVersions('', '1.0.0')).toBe(-1);
    });
  });
});

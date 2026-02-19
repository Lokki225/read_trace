import {
  notifyUpdateAvailable,
  clearNotification,
  dismissNotification,
  getNotificationDismissed,
  clearDismissedRecord,
  setupNotificationHandler,
  setupNotificationClosedHandler
} from '../../../../src/extension/updates/updateNotifier';

const mockChrome = {
  runtime: {
    getURL: jest.fn((path: string) => `chrome-extension://id/${path}`)
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

describe('updateNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChrome.storage.local.get.mockResolvedValue({});
    mockChrome.storage.local.set.mockResolvedValue(undefined);
    mockChrome.storage.local.remove.mockResolvedValue(undefined);
    mockChrome.notifications.create.mockResolvedValue('notification-id');
    mockChrome.notifications.clear.mockResolvedValue(true);
  });

  describe('notifyUpdateAvailable', () => {
    it('should create notification with version', async () => {
      await notifyUpdateAvailable({
        version: '1.1.0',
        features: ['Feature 1'],
        bugFixes: ['Fix 1']
      });

      expect(mockChrome.notifications.create).toHaveBeenCalledWith(
        'readtrace_update_available',
        expect.objectContaining({
          type: 'basic',
          title: 'ReadTrace Update Available',
          message: expect.stringContaining('1.1.0')
        })
      );
    });

    it('should include features in notification details', async () => {
      await notifyUpdateAvailable({
        version: '1.1.0',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      });

      const call = mockChrome.notifications.create.mock.calls[0];
      expect(call[1].contextMessage).toContain('Feature 1');
      expect(call[1].contextMessage).toContain('Feature 2');
    });

    it('should include bug fixes in notification details', async () => {
      await notifyUpdateAvailable({
        version: '1.1.0',
        bugFixes: ['Fix 1', 'Fix 2']
      });

      const call = mockChrome.notifications.create.mock.calls[0];
      expect(call[1].contextMessage).toContain('Fix 1');
    });

    it('should not notify if already dismissed', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_notification_dismissed_1_1_0: { version: '1.1.0', dismissedAt: Date.now() }
      });

      await notifyUpdateAvailable({ version: '1.1.0' });

      expect(mockChrome.notifications.create).not.toHaveBeenCalled();
    });

    it('should handle notification creation error silently', async () => {
      mockChrome.notifications.create.mockRejectedValue(new Error('Notification error'));

      await expect(
        notifyUpdateAvailable({ version: '1.1.0' })
      ).resolves.toBeUndefined();
    });

    it('should include buttons for user interaction', async () => {
      await notifyUpdateAvailable({ version: '1.1.0' });

      const call = mockChrome.notifications.create.mock.calls[0];
      expect(call[1].buttons).toBeDefined();
      expect(call[1].buttons?.length).toBe(2);
      expect(call[1].buttons?.[0].title).toBe('Install Now');
      expect(call[1].buttons?.[1].title).toBe('Dismiss');
    });
  });

  describe('clearNotification', () => {
    it('should clear notification', async () => {
      await clearNotification();

      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('readtrace_update_available');
    });

    it('should handle error silently', async () => {
      mockChrome.notifications.clear.mockRejectedValue(new Error('Clear error'));

      await expect(clearNotification()).resolves.toBeUndefined();
    });
  });

  describe('dismissNotification', () => {
    it('should mark notification as dismissed', async () => {
      await dismissNotification('1.1.0');

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          readtrace_notification_dismissed_1_1_0: expect.objectContaining({
            version: '1.1.0'
          })
        })
      );
    });

    it('should store dismissal timestamp', async () => {
      const beforeTime = Date.now();
      await dismissNotification('1.1.0');
      const afterTime = Date.now();

      const call = mockChrome.storage.local.set.mock.calls[0][0];
      const dismissedData = call.readtrace_notification_dismissed_1_1_0;
      expect(dismissedData.dismissedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(dismissedData.dismissedAt).toBeLessThanOrEqual(afterTime);
    });

    it('should handle storage error silently', async () => {
      mockChrome.storage.local.set.mockRejectedValue(new Error('Storage error'));

      await expect(dismissNotification('1.1.0')).resolves.toBeUndefined();
    });
  });

  describe('getNotificationDismissed', () => {
    it('should return true if dismissed', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_notification_dismissed_1_1_0: { version: '1.1.0' }
      });

      const dismissed = await getNotificationDismissed('1.1.0');

      expect(dismissed).toBe(true);
    });

    it('should return false if not dismissed', async () => {
      mockChrome.storage.local.get.mockResolvedValue({});

      const dismissed = await getNotificationDismissed('1.1.0');

      expect(dismissed).toBe(false);
    });

    it('should handle storage error silently', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'));

      const dismissed = await getNotificationDismissed('1.1.0');

      expect(dismissed).toBe(false);
    });
  });

  describe('clearDismissedRecord', () => {
    it('should remove dismissed record', async () => {
      await clearDismissedRecord('1.1.0');

      expect(mockChrome.storage.local.remove).toHaveBeenCalledWith('readtrace_notification_dismissed_1_1_0');
    });

    it('should handle error silently', async () => {
      mockChrome.storage.local.remove.mockRejectedValue(new Error('Remove error'));

      await expect(clearDismissedRecord('1.1.0')).resolves.toBeUndefined();
    });
  });

  describe('setupNotificationHandler', () => {
    it('should register button click listener', () => {
      const onInstall = jest.fn();
      const onDismiss = jest.fn();

      setupNotificationHandler(onInstall, onDismiss);

      expect(mockChrome.notifications.onButtonClicked.addListener).toHaveBeenCalled();
    });

    it('should call onInstallNow for button 0', () => {
      const onInstall = jest.fn();
      const onDismiss = jest.fn();

      setupNotificationHandler(onInstall, onDismiss);

      const listener = (mockChrome.notifications.onButtonClicked.addListener as jest.Mock).mock.calls[0][0];
      listener('readtrace_update_available', 0);

      expect(onInstall).toHaveBeenCalled();
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should call onDismiss for button 1', () => {
      const onInstall = jest.fn();
      const onDismiss = jest.fn();

      setupNotificationHandler(onInstall, onDismiss);

      const listener = (mockChrome.notifications.onButtonClicked.addListener as jest.Mock).mock.calls[0][0];
      listener('readtrace_update_available', 1);

      expect(onDismiss).toHaveBeenCalled();
      expect(onInstall).not.toHaveBeenCalled();
    });

    it('should ignore clicks on other notifications', () => {
      const onInstall = jest.fn();
      const onDismiss = jest.fn();

      setupNotificationHandler(onInstall, onDismiss);

      const listener = (mockChrome.notifications.onButtonClicked.addListener as jest.Mock).mock.calls[0][0];
      listener('other_notification', 0);

      expect(onInstall).not.toHaveBeenCalled();
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should handle setup error silently', () => {
      mockChrome.notifications.onButtonClicked.addListener.mockImplementation(() => {
        throw new Error('Setup error');
      });

      expect(() => {
        setupNotificationHandler(jest.fn(), jest.fn());
      }).not.toThrow();
    });
  });

  describe('setupNotificationClosedHandler', () => {
    it('should register closed listener', () => {
      setupNotificationClosedHandler(jest.fn());

      expect(mockChrome.notifications.onClosed.addListener).toHaveBeenCalled();
    });

    it('should call callback when notification closed', () => {
      const onClosed = jest.fn();

      setupNotificationClosedHandler(onClosed);

      const listener = mockChrome.notifications.onClosed.addListener.mock.calls[0][0];
      listener('readtrace_update_available');

      expect(onClosed).toHaveBeenCalled();
    });

    it('should ignore close events for other notifications', () => {
      const onClosed = jest.fn();

      setupNotificationClosedHandler(onClosed);

      const listener = mockChrome.notifications.onClosed.addListener.mock.calls[0][0];
      listener('other_notification');

      expect(onClosed).not.toHaveBeenCalled();
    });

    it('should handle setup error silently', () => {
      mockChrome.notifications.onClosed.addListener.mockImplementation(() => {
        throw new Error('Setup error');
      });

      expect(() => {
        setupNotificationClosedHandler(jest.fn());
      }).not.toThrow();
    });
  });
});

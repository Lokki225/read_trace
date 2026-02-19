/**
 * Update Notifier - Handles user notifications for available updates
 * Displays non-blocking notifications and manages user interactions
 */

export interface NotificationOptions {
  version: string;
  features?: string[];
  bugFixes?: string[];
  onInstallNow?: () => void;
  onDismiss?: () => void;
}

const NOTIFICATION_ID = 'readtrace_update_available';
const NOTIFICATION_DISMISSED_KEY = 'readtrace_notification_dismissed';

/**
 * Show update available notification
 * Uses chrome.notifications API for non-blocking alerts
 */
export async function notifyUpdateAvailable(options: NotificationOptions): Promise<void> {
  try {
    // Check if user has dismissed this notification
    const dismissed = await getNotificationDismissed(options.version);
    if (dismissed) {
      return;
    }

    const message = `ReadTrace ${options.version} is available`;
    const details = buildNotificationDetails(options);

    await (chrome as any).notifications.create(NOTIFICATION_ID, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.svg'),
      title: 'ReadTrace Update Available',
      message,
      contextMessage: details,
      requireInteraction: false,
      buttons: [
        { title: 'Install Now' },
        { title: 'Dismiss' }
      ]
    });
  } catch (err) {
    // Silently fail - notifications are optional
  }
}

/**
 * Build notification details from update info
 */
function buildNotificationDetails(options: NotificationOptions): string {
  const parts: string[] = [];
  
  if (options.features && options.features.length > 0) {
    parts.push(`New: ${options.features.slice(0, 2).join(', ')}`);
  }
  
  if (options.bugFixes && options.bugFixes.length > 0) {
    parts.push(`Fixed: ${options.bugFixes.slice(0, 2).join(', ')}`);
  }
  
  return parts.join(' • ') || 'Click to install the latest version';
}

/**
 * Clear update notification
 */
export async function clearNotification(): Promise<void> {
  try {
    await (chrome as any).notifications.clear(NOTIFICATION_ID);
  } catch {
    // Silently fail
  }
}

/**
 * Mark notification as dismissed for a version
 */
export async function dismissNotification(version: string): Promise<void> {
  try {
    const dismissed = await getNotificationDismissed(version);
    if (!dismissed) {
      const key = `${NOTIFICATION_DISMISSED_KEY}_${version}`;
      await (chrome as any).storage.local.set({
        [key]: {
          version,
          dismissedAt: Date.now()
        }
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Check if notification was dismissed for a version
 */
export async function getNotificationDismissed(version: string): Promise<boolean> {
  try {
    const key = `${NOTIFICATION_DISMISSED_KEY}_${version}`;
    const result = await (chrome as any).storage.local.get(key);
    return !!result[key];
  } catch {
    return false;
  }
}

/**
 * Clear dismissed notification record for a version
 */
export async function clearDismissedRecord(version: string): Promise<void> {
  try {
    const key = `${NOTIFICATION_DISMISSED_KEY}_${version}`;
    await (chrome as any).storage.local.remove(key);
  } catch {
    // Silently fail
  }
}

/**
 * Setup notification click handler
 * Calls appropriate callback based on button clicked
 */
export function setupNotificationHandler(
  onInstallNow: () => void,
  onDismiss: () => void
): void {
  try {
    if ((chrome as any).notifications && (chrome as any).notifications.onButtonClicked) {
      (chrome as any).notifications.onButtonClicked.addListener(
        (notificationId: string, buttonIndex: number) => {
          if (notificationId === NOTIFICATION_ID) {
            if (buttonIndex === 0) {
              onInstallNow();
            } else if (buttonIndex === 1) {
              onDismiss();
            }
          }
        }
      );
    }
  } catch {
    // Silently fail - handler setup is optional
  }
}

/**
 * Setup notification closed handler
 */
export function setupNotificationClosedHandler(onClosed: () => void): void {
  try {
    if ((chrome as any).notifications && (chrome as any).notifications.onClosed) {
      (chrome as any).notifications.onClosed.addListener((notificationId: string) => {
        if (notificationId === NOTIFICATION_ID) {
          onClosed();
        }
      });
    }
  } catch {
    // Silently fail - handler setup is optional
  }
}

/**
 * Update Logger - Handles logging of all update-related events
 * Stores update history in chrome.storage.local for retrieval
 */

export interface UpdateLogEntry {
  timestamp?: number;
  type: 'check' | 'available' | 'installed' | 'failed' | 'dismissed';
  version?: string;
  currentVersion?: string;
  error?: string;
  details?: Record<string, unknown>;
}

const UPDATE_LOG_KEY = 'readtrace_update_log';
const MAX_LOG_ENTRIES = 100;
const LOG_RETENTION_DAYS = 30;

/**
 * Log an update event
 */
export async function logUpdateEvent(entry: UpdateLogEntry): Promise<void> {
  try {
    const logs = await getUpdateLog();
    
    // Add new entry
    logs.push({
      ...entry,
      timestamp: entry.timestamp || Date.now()
    });
    
    // Remove old entries (older than retention period)
    const cutoffTime = Date.now() - (LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const filtered = logs.filter(log => (log.timestamp ?? 0) > cutoffTime);
    
    // Keep only recent entries if exceeding max
    const trimmed = filtered.slice(-MAX_LOG_ENTRIES);
    
    await (chrome as any).storage.local.set({
      [UPDATE_LOG_KEY]: trimmed
    });
  } catch (err) {
    // Silently fail - logging is optional
  }
}

/**
 * Get all update log entries
 */
export async function getUpdateLog(): Promise<UpdateLogEntry[]> {
  try {
    const result = await (chrome as any).storage.local.get(UPDATE_LOG_KEY);
    return result[UPDATE_LOG_KEY] || [];
  } catch {
    return [];
  }
}

/**
 * Get recent update log entries
 */
export async function getRecentUpdateLog(limit: number = 10): Promise<UpdateLogEntry[]> {
  try {
    const logs = await getUpdateLog();
    return logs.slice(-limit);
  } catch {
    return [];
  }
}

/**
 * Get update log entries of specific type
 */
export async function getUpdateLogByType(type: UpdateLogEntry['type']): Promise<UpdateLogEntry[]> {
  try {
    const logs = await getUpdateLog();
    return logs.filter(log => log.type === type);
  } catch {
    return [];
  }
}

/**
 * Clear all update logs
 */
export async function clearUpdateLog(): Promise<void> {
  try {
    await (chrome as any).storage.local.remove(UPDATE_LOG_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Log update check
 */
export async function logUpdateCheck(
  currentVersion: string,
  latestVersion: string,
  error?: string
): Promise<void> {
  await logUpdateEvent({
    type: 'check',
    currentVersion,
    version: latestVersion,
    error,
    details: {
      isUpdateAvailable: !error && latestVersion > currentVersion
    }
  });
}

/**
 * Log update available notification
 */
export async function logUpdateAvailable(version: string): Promise<void> {
  await logUpdateEvent({
    type: 'available',
    version
  });
}

/**
 * Log successful update installation
 */
export async function logUpdateInstalled(version: string): Promise<void> {
  await logUpdateEvent({
    type: 'installed',
    version
  });
}

/**
 * Log failed update
 */
export async function logUpdateFailed(version: string, error: string): Promise<void> {
  await logUpdateEvent({
    type: 'failed',
    version,
    error
  });
}

/**
 * Log dismissed notification
 */
export async function logNotificationDismissed(version: string): Promise<void> {
  await logUpdateEvent({
    type: 'dismissed',
    version
  });
}

/**
 * Get last successful update
 */
export async function getLastSuccessfulUpdate(): Promise<UpdateLogEntry | null> {
  try {
    const logs = await getUpdateLogByType('installed');
    return logs.length > 0 ? logs[logs.length - 1] : null;
  } catch {
    return null;
  }
}

/**
 * Get last update check
 */
export async function getLastUpdateCheck(): Promise<UpdateLogEntry | null> {
  try {
    const logs = await getUpdateLogByType('check');
    return logs.length > 0 ? logs[logs.length - 1] : null;
  } catch {
    return null;
  }
}

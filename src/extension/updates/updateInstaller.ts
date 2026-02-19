/**
 * Update Installer - Handles extension update installation
 * Uses chrome.runtime.requestUpdateCheck() API for installation
 */

export interface InstallationResult {
  success: boolean;
  status: 'update_available' | 'no_update' | 'throttled' | 'error';
  error?: string;
}

/**
 * Request browser to check for and install updates
 * This uses the native Chrome update mechanism
 */
export async function requestUpdate(): Promise<InstallationResult> {
  try {
    if (!chrome.runtime || !chrome.runtime.requestUpdateCheck) {
      return {
        success: false,
        status: 'error',
        error: 'chrome.runtime.requestUpdateCheck not available'
      };
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({
          success: false,
          status: 'error',
          error: 'Update check timeout'
        });
      }, 10000); // 10 second timeout

      try {
        chrome.runtime.requestUpdateCheck((status: string) => {
          clearTimeout(timeoutId);

          if (status === 'update_available') {
            resolve({
              success: true,
              status: 'update_available'
            });
          } else if (status === 'no_update') {
            resolve({
              success: true,
              status: 'no_update'
            });
          } else if (status === 'throttled') {
            resolve({
              success: false,
              status: 'throttled',
              error: 'Update check throttled by browser'
            });
          } else {
            resolve({
              success: false,
              status: 'error',
              error: `Unknown status: ${status}`
            });
          }
        });
      } catch (err) {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    });
  } catch (err) {
    return {
      success: false,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Check if update installation is supported
 */
export function isUpdateSupported(): boolean {
  return !!(chrome && chrome.runtime && chrome.runtime.requestUpdateCheck);
}

/**
 * Get update status from last check
 * Returns the status of the most recent update check
 */
export async function getUpdateStatus(): Promise<string | null> {
  try {
    const result = await (chrome as any).storage.local.get('readtrace_last_update_status');
    return result.readtrace_last_update_status || null;
  } catch {
    return null;
  }
}

/**
 * Store update status for reference
 */
export async function storeUpdateStatus(status: string): Promise<void> {
  try {
    await (chrome as any).storage.local.set({
      readtrace_last_update_status: status,
      readtrace_last_update_check: Date.now()
    });
  } catch {
    // Silently fail
  }
}

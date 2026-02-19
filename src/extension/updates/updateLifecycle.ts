/**
 * Update Lifecycle - Handles extension lifecycle events related to updates
 * Manages state preservation and reinitialization during updates
 */

import * as updateLogger from './updateLogger';

export interface LifecycleState {
  lastVersion: string;
  installTime: number;
  updateCount: number;
}

const LIFECYCLE_STATE_KEY = 'readtrace_lifecycle_state';

/**
 * Initialize lifecycle tracking
 * Should be called once on extension startup
 */
export async function initializeLifecycle(): Promise<void> {
  try {
    const state = await getLifecycleState();
    if (!state) {
      const manifest = chrome.runtime.getManifest();
      const newState: LifecycleState = {
        lastVersion: manifest.version || '0.0.0',
        installTime: Date.now(),
        updateCount: 0
      };
      await saveLifecycleState(newState);
    }
  } catch {
    // Silently fail
  }
}

/**
 * Get current lifecycle state
 */
export async function getLifecycleState(): Promise<LifecycleState | null> {
  try {
    const result = await (chrome as any).storage.local.get(LIFECYCLE_STATE_KEY);
    return result[LIFECYCLE_STATE_KEY] || null;
  } catch {
    return null;
  }
}

/**
 * Save lifecycle state
 */
export async function saveLifecycleState(state: LifecycleState): Promise<void> {
  try {
    await (chrome as any).storage.local.set({
      [LIFECYCLE_STATE_KEY]: state
    });
  } catch {
    // Silently fail
  }
}

/**
 * Handle extension install/update event
 * Called when extension is installed or updated
 */
export async function handleInstallEvent(reason: string): Promise<void> {
  try {
    const manifest = chrome.runtime.getManifest();
    const currentVersion = manifest.version || '0.0.0';
    const state = await getLifecycleState();

    if (reason === 'install') {
      // New installation
      const newState: LifecycleState = {
        lastVersion: currentVersion,
        installTime: Date.now(),
        updateCount: 0
      };
      await saveLifecycleState(newState);
      await updateLogger.logUpdateInstalled(currentVersion);
    } else if (reason === 'update') {
      // Extension updated
      const previousVersion = state?.lastVersion || '0.0.0';
      const newState: LifecycleState = {
        lastVersion: currentVersion,
        installTime: state?.installTime || Date.now(),
        updateCount: (state?.updateCount || 0) + 1
      };
      await saveLifecycleState(newState);
      await updateLogger.logUpdateInstalled(currentVersion);
      
      // Perform any necessary cleanup or reinitialization
      await handleUpdateTransition(previousVersion, currentVersion);
    }
  } catch (err) {
    // Silently fail
  }
}

/**
 * Handle transition from one version to another
 * Preserve user state and reinitialize if needed
 */
async function handleUpdateTransition(previousVersion: string, newVersion: string): Promise<void> {
  try {
    // Preserve any critical state here
    // For now, just log the transition
    
    // In production, you might:
    // 1. Migrate data from old format to new format
    // 2. Clear obsolete cached data
    // 3. Reinitialize services
    // 4. Notify user of update
  } catch {
    // Silently fail
  }
}

/**
 * Get extension installation date
 */
export async function getInstallationDate(): Promise<Date | null> {
  try {
    const state = await getLifecycleState();
    return state ? new Date(state.installTime) : null;
  } catch {
    return null;
  }
}

/**
 * Get total number of updates
 */
export async function getUpdateCount(): Promise<number> {
  try {
    const state = await getLifecycleState();
    return state?.updateCount || 0;
  } catch {
    return 0;
  }
}

/**
 * Get last version before current
 */
export async function getLastVersion(): Promise<string> {
  try {
    const state = await getLifecycleState();
    return state?.lastVersion || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Setup install/update event listener
 * Should be called once during extension initialization
 */
export function setupInstallListener(): void {
  try {
    if (chrome.runtime && chrome.runtime.onInstalled) {
      chrome.runtime.onInstalled.addListener((details) => {
        handleInstallEvent(details.reason).catch(() => {
          // Silently fail
        });
      });
    }
  } catch {
    // Silently fail
  }
}

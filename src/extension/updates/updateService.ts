/**
 * Update Service - Handles version checking and update availability detection
 * Manages update checks, caching, and version comparison logic
 */

export interface UpdateCheckResult {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  lastCheckTime: number;
  error?: string;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  features: string[];
  bugFixes: string[];
  downloadUrl: string;
}

const UPDATE_CHECK_CACHE_KEY = 'readtrace_update_check_cache';
const UPDATE_CHECK_TIMEOUT = 5000; // 5 seconds
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Parse semantic version string into comparable format
 * @param version - Version string (e.g., "1.2.3")
 * @returns Array of [major, minor, patch] numbers
 */
export function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.');
  const major = parseInt(parts[0] || '0', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parseInt(parts[2] || '0', 10);
  
  return [major, minor, patch];
}

/**
 * Compare two semantic versions
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const [maj1, min1, pat1] = parseVersion(v1);
  const [maj2, min2, pat2] = parseVersion(v2);

  if (maj1 !== maj2) return maj1 < maj2 ? -1 : 1;
  if (min1 !== min2) return min1 < min2 ? -1 : 1;
  if (pat1 !== pat2) return pat1 < pat2 ? -1 : 1;
  
  return 0;
}

/**
 * Get current extension version from manifest
 */
export async function getCurrentVersion(): Promise<string> {
  try {
    const manifest = chrome.runtime.getManifest();
    return manifest.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Get cached update check result
 */
async function getCachedCheckResult(): Promise<UpdateCheckResult | null> {
  try {
    const result = await (chrome as any).storage.local.get(UPDATE_CHECK_CACHE_KEY);
    const cached = result[UPDATE_CHECK_CACHE_KEY];
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.lastCheckTime > CACHE_DURATION) {
      return null; // Cache expired
    }
    
    return cached;
  } catch {
    return null;
  }
}

/**
 * Cache update check result
 */
async function cacheCheckResult(result: UpdateCheckResult): Promise<void> {
  try {
    await (chrome as any).storage.local.set({
      [UPDATE_CHECK_CACHE_KEY]: result
    });
  } catch {
    // Silently fail - caching is optional
  }
}

/**
 * Fetch latest version from update server
 * In production, this would call an actual update server
 * For now, returns a mock response
 */
async function fetchLatestVersion(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT);
    
    // In production, this would be a real endpoint
    // For testing, we'll use a mock that always returns current version
    const response = await fetch('https://api.readtrace.local/extension/latest-version', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json() as { version: string };
    return data.version || '0.0.0';
  } catch (err) {
    // Network error or timeout - return current version (no update available)
    return await getCurrentVersion();
  }
}

/**
 * Check for extension updates
 * Returns cached result if available and fresh, otherwise performs new check
 */
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  const currentVersion = await getCurrentVersion();
  
  // Check cache first
  const cached = await getCachedCheckResult();
  if (cached && cached.currentVersion === currentVersion) {
    return cached;
  }
  
  try {
    const latestVersion = await fetchLatestVersion();
    const isUpdateAvailable = compareVersions(currentVersion, latestVersion) < 0;
    
    const result: UpdateCheckResult = {
      isUpdateAvailable,
      currentVersion,
      latestVersion,
      lastCheckTime: Date.now()
    };
    
    await cacheCheckResult(result);
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return {
      isUpdateAvailable: false,
      currentVersion,
      latestVersion: currentVersion,
      lastCheckTime: Date.now(),
      error
    };
  }
}

/**
 * Clear update check cache (useful for testing or manual refresh)
 */
export async function clearUpdateCache(): Promise<void> {
  try {
    await (chrome as any).storage.local.remove(UPDATE_CHECK_CACHE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Get update info for a specific version
 * In production, this would fetch from update server
 */
export async function getUpdateInfo(version: string): Promise<UpdateInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT);
    
    const response = await fetch(`https://api.readtrace.local/extension/updates/${version}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json() as UpdateInfo;
  } catch {
    return null;
  }
}

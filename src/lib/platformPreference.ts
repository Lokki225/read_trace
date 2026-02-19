/**
 * Platform Preference Utility
 * 
 * Handles resume URL selection based on user platform preferences with
 * intelligent fallback to most recent platform when preference unavailable.
 */

import { UnifiedProgress, AlternativeProgress } from '@/model/schemas/unifiedState';

/**
 * Platform preference configuration
 */
export interface PlatformPreferenceConfig {
  preferred_platforms: string[];
  last_selected_platform?: string;
}

/**
 * Selects the best resume URL based on preferences and available platforms
 * 
 * Priority order:
 * 1. Preferred platform (if has progress)
 * 2. Last manually selected platform (if available)
 * 3. Most recent platform (by timestamp)
 * 4. First available alternative
 * 5. null if no progress available
 * 
 * @param unifiedProgress - The unified progress data
 * @param preferences - User's platform preferences
 * @param manualOverride - Optional manual platform selection
 * @returns Resume URL or null if no progress available
 */
export function selectResumeUrl(
  unifiedProgress: UnifiedProgress | null,
  preferences: PlatformPreferenceConfig,
  manualOverride?: string
): string | null {
  if (!unifiedProgress) {
    return null;
  }

  // If manual override provided, use it
  if (manualOverride) {
    const overridePlatform = unifiedProgress.alternatives.find(
      alt => alt.platform === manualOverride
    );
    
    if (overridePlatform && overridePlatform.resume_url) {
      return overridePlatform.resume_url;
    }
    
    // Fallback if override platform not found
    if (unifiedProgress.platform === manualOverride && unifiedProgress.resume_url) {
      return unifiedProgress.resume_url;
    }
  }

  // Check preferred platforms in order
  if (preferences.preferred_platforms && preferences.preferred_platforms.length > 0) {
    for (const preferredPlatform of preferences.preferred_platforms) {
      // Check if preferred platform is the current (most recent)
      if (unifiedProgress.platform === preferredPlatform && unifiedProgress.resume_url) {
        return unifiedProgress.resume_url;
      }

      // Check if preferred platform is in alternatives
      const preferredAlternative = unifiedProgress.alternatives.find(
        alt => alt.platform === preferredPlatform
      );
      
      if (preferredAlternative && preferredAlternative.resume_url) {
        return preferredAlternative.resume_url;
      }
    }
  }

  // Check last manually selected platform
  if (preferences.last_selected_platform) {
    if (unifiedProgress.platform === preferences.last_selected_platform && unifiedProgress.resume_url) {
      return unifiedProgress.resume_url;
    }

    const lastSelectedAlternative = unifiedProgress.alternatives.find(
      alt => alt.platform === preferences.last_selected_platform
    );
    
    if (lastSelectedAlternative && lastSelectedAlternative.resume_url) {
      return lastSelectedAlternative.resume_url;
    }
  }

  // Fallback to most recent platform
  if (unifiedProgress.resume_url) {
    return unifiedProgress.resume_url;
  }

  // Fallback to first available alternative with resume URL
  const firstAvailable = unifiedProgress.alternatives.find(alt => alt.resume_url);
  return firstAvailable?.resume_url ?? null;
}

/**
 * Gets all available platforms for a series
 * 
 * @param unifiedProgress - The unified progress data
 * @returns Array of platform names with progress
 */
export function getAvailablePlatforms(unifiedProgress: UnifiedProgress | null): string[] {
  if (!unifiedProgress) {
    return [];
  }

  const platforms = [unifiedProgress.platform];
  const alternativePlatforms = unifiedProgress.alternatives.map(alt => alt.platform);
  
  return [...new Set([...platforms, ...alternativePlatforms])];
}

/**
 * Validates a platform identifier against available platforms
 * 
 * @param platform - Platform identifier to validate
 * @param unifiedProgress - The unified progress data
 * @returns true if platform is available, false otherwise
 */
export function isValidPlatform(
  platform: string,
  unifiedProgress: UnifiedProgress | null
): boolean {
  if (!unifiedProgress) {
    return false;
  }

  if (unifiedProgress.platform === platform) {
    return true;
  }

  return unifiedProgress.alternatives.some(alt => alt.platform === platform);
}

/**
 * Gets platform display name (user-friendly)
 * 
 * @param platform - Platform identifier
 * @returns Display name for the platform
 */
export function getPlatformDisplayName(platform: string): string {
  const displayNames: Record<string, string> = {
    mangadex: 'MangaDex',
    webtoon: 'Webtoon',
    webtoons: 'Webtoon',
    'www.webtoons.com': 'Webtoon',
    'webtoons.com': 'Webtoon',
    unknown: 'Unknown Platform',
  };

  return displayNames[platform.toLowerCase()] || platform;
}

/**
 * Normalizes platform identifier to standard format
 * 
 * @param platform - Platform identifier (may be URL or name)
 * @returns Normalized platform identifier
 */
export function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase().trim();

  // Normalize Webtoon variants
  if (normalized.includes('webtoon')) {
    return 'webtoon';
  }

  // Normalize MangaDex variants
  if (normalized.includes('mangadex')) {
    return 'mangadex';
  }

  return normalized;
}

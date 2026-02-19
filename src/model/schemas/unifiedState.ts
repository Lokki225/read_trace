/**
 * Unified Reading State Across Platforms
 * 
 * Types for managing reading progress across multiple scanlation platforms
 * (MangaDex, Webtoon, etc.) with conflict resolution and platform preferences.
 */

/**
 * Platform-specific progress information
 */
export interface PlatformProgress {
  platform: string;
  current_chapter: number;
  total_chapters: number;
  scroll_position: number;
  updated_at: string;
  resume_url: string | null;
}

/**
 * Alternative platform option for resume selection
 */
export interface AlternativeProgress {
  platform: string;
  current_chapter: number;
  updated_at: string;
  resume_url: string | null;
}

/**
 * Unified progress response combining most recent progress with alternatives
 */
export interface UnifiedProgress {
  series_id: string;
  current_chapter: number;
  total_chapters: number;
  scroll_position: number;
  platform: string;
  updated_at: string;
  resume_url: string | null;
  alternatives: AlternativeProgress[];
}

/**
 * User platform preferences for resume navigation
 */
export interface PlatformPreferences {
  user_id: string;
  preferred_platforms: string[];
  last_selected_platform?: string;
  updated_at: string;
}

/**
 * Result of unified state resolution
 */
export interface UnifiedStateResolution {
  success: boolean;
  progress: UnifiedProgress | null;
  error?: string;
}

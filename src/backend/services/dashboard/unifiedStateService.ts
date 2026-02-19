/**
 * Unified State Service
 * 
 * Resolves reading progress across multiple scanlation platforms using
 * last-write-wins conflict resolution strategy with tie-breaking by chapter number.
 */

import { UnifiedProgress, AlternativeProgress, UnifiedStateResolution } from '@/model/schemas/unifiedState';
import { Database } from '@/lib/supabase';

type ReadingProgressRow = Database['public']['Tables']['reading_progress']['Row'];

/**
 * Compares two timestamps for conflict resolution
 * Returns: -1 if a is older, 1 if b is older, 0 if equal
 */
function compareTimestamps(a: string, b: string): number {
  const timeA = new Date(a).getTime();
  const timeB = new Date(b).getTime();
  
  if (timeA < timeB) return -1;
  if (timeA > timeB) return 1;
  return 0;
}

/**
 * Validates a progress entry has required fields
 */
function isValidProgress(progress: ReadingProgressRow): boolean {
  return !!(
    progress.id &&
    progress.user_id &&
    progress.series_id &&
    progress.platform &&
    progress.chapter_number !== null &&
    progress.updated_at
  );
}

/**
 * Selects the most recent progress entry using last-write-wins strategy
 * Tie-breaking order: timestamp → chapter number → platform name
 */
function selectMostRecentProgress(
  entries: ReadingProgressRow[]
): ReadingProgressRow | null {
  if (entries.length === 0) return null;
  
  return entries.reduce((mostRecent, current) => {
    const timestampComparison = compareTimestamps(mostRecent.updated_at, current.updated_at);
    
    if (timestampComparison > 0) {
      // mostRecent is older, use current
      return current;
    } else if (timestampComparison < 0) {
      // current is older, keep mostRecent
      return mostRecent;
    } else {
      // Timestamps are equal, tie-break by chapter number
      const mostRecentChapter = mostRecent.chapter_number ?? 0;
      const currentChapter = current.chapter_number ?? 0;
      
      if (currentChapter > mostRecentChapter) {
        return current;
      } else if (currentChapter < mostRecentChapter) {
        return mostRecent;
      } else {
        // Chapters equal, tie-break by platform name (alphabetical)
        const platformComparison = (mostRecent.platform || '').localeCompare(current.platform || '');
        return platformComparison > 0 ? current : mostRecent;
      }
    }
  });
}

/**
 * Converts a reading_progress row to AlternativeProgress format
 */
function toAlternativeProgress(progress: ReadingProgressRow): AlternativeProgress {
  return {
    platform: progress.platform,
    current_chapter: progress.chapter_number ?? 0,
    updated_at: progress.updated_at,
    resume_url: null,
  };
}

/**
 * Gets unified reading progress for a series across all platforms
 * 
 * @param seriesId - The series ID to get progress for
 * @param userId - The user ID (for authorization)
 * @param supabase - Supabase client instance
 * @returns UnifiedStateResolution with progress and alternatives
 */
export async function getUnifiedProgress(
  seriesId: string,
  userId: string,
  supabase: any
): Promise<UnifiedStateResolution> {
  try {
    // Query all progress entries for this series
    const { data: progressEntries, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('series_id', seriesId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return {
        success: false,
        progress: null,
        error: `Failed to fetch progress: ${error.message}`,
      };
    }

    if (!progressEntries || progressEntries.length === 0) {
      return {
        success: true,
        progress: null,
      };
    }

    // Filter valid entries
    const validEntries = progressEntries.filter(isValidProgress);
    
    if (validEntries.length === 0) {
      return {
        success: true,
        progress: null,
      };
    }

    // Select most recent progress
    const mostRecent = selectMostRecentProgress(validEntries);
    
    if (!mostRecent) {
      return {
        success: true,
        progress: null,
      };
    }

    // Build alternatives (all other platforms)
    const alternatives: AlternativeProgress[] = validEntries
      .filter((entry: ReadingProgressRow) => entry.platform !== mostRecent.platform)
      .map(toAlternativeProgress);

    // Build unified progress response
    const unifiedProgress: UnifiedProgress = {
      series_id: seriesId,
      current_chapter: mostRecent.chapter_number ?? 0,
      total_chapters: 0,
      scroll_position: mostRecent.scroll_position ?? 0,
      platform: mostRecent.platform,
      updated_at: mostRecent.updated_at,
      resume_url: null,
      alternatives,
    };

    return {
      success: true,
      progress: unifiedProgress,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      progress: null,
      error: `Unexpected error in getUnifiedProgress: ${errorMessage}`,
    };
  }
}

/**
 * Gets unified progress for multiple series (batch operation)
 * 
 * @param seriesIds - Array of series IDs
 * @param userId - The user ID (for authorization)
 * @param supabase - Supabase client instance
 * @returns Map of series ID to UnifiedProgress
 */
export async function getUnifiedProgressBatch(
  seriesIds: string[],
  userId: string,
  supabase: any
): Promise<Map<string, UnifiedProgress | null>> {
  const results = new Map<string, UnifiedProgress | null>();

  for (const seriesId of seriesIds) {
    const resolution = await getUnifiedProgress(seriesId, userId, supabase);
    results.set(seriesId, resolution.progress);
  }

  return results;
}

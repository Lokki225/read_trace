import { createServerClient } from '@/lib/supabase';
import { DashboardData, UserSeries } from '@/model/schemas/dashboard';
import { groupSeriesByStatus } from './dashboardDomain';

function deduplicateByNormalizedTitle(series: UserSeries[]): UserSeries[] {
  const seen = new Map<string, UserSeries>();
  for (const item of series) {
    if (!seen.has(item.normalized_title)) {
      seen.set(item.normalized_title, item);
    }
  }
  return Array.from(seen.values());
}

export async function fetchUserSeriesGrouped(userId: string): Promise<DashboardData> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('user_series' as any)
    .select(
      'id, user_id, title, normalized_title, platform, source_url, import_id, status, current_chapter, total_chapters, cover_url, genres, progress_percentage, resume_url, last_read_at, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false, nullsFirst: false } as any)
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const deduplicated = deduplicateByNormalizedTitle((data as unknown as UserSeries[]) ?? []);
  return groupSeriesByStatus(deduplicated);
}

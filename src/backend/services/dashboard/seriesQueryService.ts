import { createServerClient } from '@/lib/supabase';
import { DashboardData, UserSeries } from '@/model/schemas/dashboard';
import { groupSeriesByStatus } from './dashboardDomain';

export async function fetchUserSeriesGrouped(userId: string): Promise<DashboardData> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('user_series' as any)
    .select(
      'id, user_id, title, normalized_title, platform, source_url, import_id, status, current_chapter, total_chapters, cover_url, genres, progress_percentage, last_read_at, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false, nullsFirst: false } as any)
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return groupSeriesByStatus((data as unknown as UserSeries[]) ?? []);
}

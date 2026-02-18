'use client';

import { useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSeriesStore } from '@/store/seriesStore';

export function useProgressRealtime(userId: string | null) {
  const updateSeriesProgress = useSeriesStore((state) => state.updateSeriesProgress);

  useEffect(() => {
    if (!userId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const channel = supabase
      .channel(`reading_progress:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reading_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            if (newData.series_id) {
              updateSeriesProgress(newData.series_id, {
                current_chapter: newData.current_chapter ?? undefined,
                total_chapters: newData.total_chapters ?? undefined,
                progress_percentage: newData.progress_percentage ?? undefined,
                last_read_at: newData.last_read_at ?? undefined,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, updateSeriesProgress]);
}

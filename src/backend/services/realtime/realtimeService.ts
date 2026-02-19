import { createBrowserClient } from '@supabase/ssr';
import { resolveConflict, ConflictUpdate } from './conflictResolver';

export type ProgressChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export type ProgressUpdateHandler = (payload: ProgressChangePayload) => void;

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface RealtimeServiceOptions {
  onProgressUpdate: ProgressUpdateHandler;
  onConflict?: (incoming: ConflictUpdate, existing: ConflictUpdate) => void;
}

function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

export function subscribeToProgressUpdates(
  userId: string,
  options: RealtimeServiceOptions
): RealtimeSubscription {
  const supabase = createSupabaseClient();

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
        options.onProgressUpdate(payload as ProgressChangePayload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => channel.unsubscribe(),
  };
}

export function handleConflictingUpdate(
  incoming: ConflictUpdate,
  existing: ConflictUpdate,
  onConflict?: (incoming: ConflictUpdate, existing: ConflictUpdate) => void
): ConflictUpdate {
  const resolution = resolveConflict(incoming, existing);

  if (onConflict) {
    onConflict(incoming, existing);
  }

  return resolution;
}

export function buildProgressUpdate(payload: ProgressChangePayload): ConflictUpdate | null {
  if (payload.eventType === 'DELETE') return null;

  const data = payload.new;
  const seriesId = data.series_id as string | null;
  const userId = data.user_id as string | null;

  if (!seriesId || !userId) return null;

  return {
    series_id: seriesId,
    user_id: userId,
    current_chapter: data.current_chapter as number | undefined,
    progress_percentage: data.progress_percentage as number | undefined,
    last_read_at: data.last_read_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

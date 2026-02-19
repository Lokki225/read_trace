export interface ConflictUpdate {
  series_id: string;
  user_id: string;
  current_chapter?: number;
  progress_percentage?: number;
  last_read_at?: string;
  updated_at?: string;
}

export interface ConflictResolution extends ConflictUpdate {
  resolved_by: 'last-write-wins';
  conflict_detected: boolean;
}

function getTimestamp(update: ConflictUpdate): number {
  const ts = update.updated_at ?? update.last_read_at;
  if (!ts) return 0;
  return new Date(ts).getTime();
}

export function isNewerUpdate(
  incoming: ConflictUpdate,
  existing: ConflictUpdate
): boolean {
  return getTimestamp(incoming) > getTimestamp(existing);
}

export function resolveConflict(
  incoming: ConflictUpdate,
  existing: ConflictUpdate
): ConflictResolution {
  const incomingTs = getTimestamp(incoming);
  const existingTs = getTimestamp(existing);

  if (incomingTs > existingTs) {
    return { ...incoming, resolved_by: 'last-write-wins', conflict_detected: true };
  }

  if (incomingTs === existingTs) {
    const incomingChapter = incoming.current_chapter ?? 0;
    const existingChapter = existing.current_chapter ?? 0;
    if (incomingChapter > existingChapter) {
      return { ...incoming, resolved_by: 'last-write-wins', conflict_detected: true };
    }
  }

  return { ...existing, resolved_by: 'last-write-wins', conflict_detected: true };
}

export function mergeProgressUpdates(
  base: ConflictUpdate,
  incoming: ConflictUpdate
): ConflictUpdate {
  const baseTs = getTimestamp(base);
  const incomingTs = getTimestamp(incoming);
  const laterTs = incomingTs >= baseTs ? incoming.updated_at : base.updated_at;

  return {
    series_id: base.series_id,
    user_id: base.user_id,
    current_chapter: incoming.current_chapter ?? base.current_chapter,
    progress_percentage: incoming.progress_percentage ?? base.progress_percentage,
    last_read_at: incomingTs >= baseTs ? incoming.last_read_at : base.last_read_at,
    updated_at: laterTs,
  };
}

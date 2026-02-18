import { formatDistanceToNow, format } from 'date-fns';

export function formatLastRead(date: string | Date | null): string {
  if (!date) return 'Never';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  return format(dateObj, 'MMM d, yyyy');
}

export function formatChapterDisplay(current: number | null, total: number | null): string {
  if (current === null || current === undefined) return '--';
  if (total === null || total === undefined) return `Ch. ${current}`;
  return `Ch. ${current} / ${total}`;
}

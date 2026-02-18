export function calculateProgress(current: number, total: number | null): number {
  if (!total || total <= 0) return 0;
  const pct = Math.round((current / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function formatProgressPercentage(percentage: number): string {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
  return `${clamped}%`;
}

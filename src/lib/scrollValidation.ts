export const SCROLL_MIN = 0;
export const SCROLL_MAX = 100;
export const SCROLL_PIXEL_TOLERANCE = 2;

export function isValidScrollPosition(position: number): boolean {
  return (
    typeof position === 'number' &&
    !isNaN(position) &&
    isFinite(position) &&
    position >= SCROLL_MIN &&
    position <= SCROLL_MAX
  );
}

export function clampScrollPosition(position: number): number {
  if (typeof position !== 'number' || isNaN(position) || !isFinite(position)) {
    return SCROLL_MIN;
  }
  return Math.min(SCROLL_MAX, Math.max(SCROLL_MIN, Math.round(position)));
}

export function percentageToPixels(percentage: number, scrollableHeight: number): number {
  if (scrollableHeight <= 0) return 0;
  const clamped = clampScrollPosition(percentage);
  return Math.round((clamped / 100) * scrollableHeight);
}

export function pixelsToPercentage(pixels: number, scrollableHeight: number): number {
  if (scrollableHeight <= 0) return 0;
  const raw = (pixels / scrollableHeight) * 100;
  return clampScrollPosition(raw);
}

export function isPositionStillValid(
  storedPercentage: number,
  currentScrollableHeight: number
): boolean {
  if (!isValidScrollPosition(storedPercentage)) return false;
  if (currentScrollableHeight <= 0) return storedPercentage === 0;
  return true;
}

export function getScrollableHeight(): number {
  if (typeof document === 'undefined') return 0;
  return Math.max(
    0,
    document.documentElement.scrollHeight - document.documentElement.clientHeight
  );
}

export function getCurrentScrollPixels(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.scrollY || document.documentElement.scrollTop || 0);
}

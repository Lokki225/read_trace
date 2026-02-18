const SCROLL_POSITION_PREFIX = 'scroll_tab_';

export const getScrollPositionKey = (tabId: string): string => {
  return `${SCROLL_POSITION_PREFIX}${tabId}`;
};

export const saveScrollPosition = (tabId: string, position: number): void => {
  if (typeof window === 'undefined') return;
  try {
    const key = getScrollPositionKey(tabId);
    sessionStorage.setItem(key, position.toString());
  } catch (error) {
    console.warn('Failed to save scroll position:', error);
  }
};

export const getScrollPosition = (tabId: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const key = getScrollPositionKey(tabId);
    const position = sessionStorage.getItem(key);
    return position ? parseInt(position, 10) : 0;
  } catch (error) {
    console.warn('Failed to get scroll position:', error);
    return 0;
  }
};

export const clearScrollPosition = (tabId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const key = getScrollPositionKey(tabId);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear scroll position:', error);
  }
};

export const clearAllScrollPositions = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(sessionStorage).filter((key) =>
      key.startsWith(SCROLL_POSITION_PREFIX)
    );
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear all scroll positions:', error);
  }
};

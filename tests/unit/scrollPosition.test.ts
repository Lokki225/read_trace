import {
  getScrollPositionKey,
  saveScrollPosition,
  getScrollPosition,
  clearScrollPosition,
  clearAllScrollPositions,
} from '@/lib/scrollPosition';

describe('scrollPosition utilities', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('getScrollPositionKey', () => {
    it('should return correct key format', () => {
      const key = getScrollPositionKey('reading');
      expect(key).toBe('scroll_tab_reading');
    });

    it('should handle different tab IDs', () => {
      expect(getScrollPositionKey('completed')).toBe('scroll_tab_completed');
      expect(getScrollPositionKey('on_hold')).toBe('scroll_tab_on_hold');
    });
  });

  describe('saveScrollPosition', () => {
    it('should save scroll position to sessionStorage', () => {
      saveScrollPosition('reading', 500);
      const stored = sessionStorage.getItem('scroll_tab_reading');
      expect(stored).toBe('500');
    });

    it('should overwrite existing position', () => {
      saveScrollPosition('reading', 100);
      saveScrollPosition('reading', 200);
      const stored = sessionStorage.getItem('scroll_tab_reading');
      expect(stored).toBe('200');
    });

    it('should handle multiple tabs independently', () => {
      saveScrollPosition('reading', 100);
      saveScrollPosition('completed', 200);
      expect(sessionStorage.getItem('scroll_tab_reading')).toBe('100');
      expect(sessionStorage.getItem('scroll_tab_completed')).toBe('200');
    });

    it('should handle zero position', () => {
      saveScrollPosition('reading', 0);
      expect(sessionStorage.getItem('scroll_tab_reading')).toBe('0');
    });

    it('should handle large positions', () => {
      saveScrollPosition('reading', 999999);
      expect(sessionStorage.getItem('scroll_tab_reading')).toBe('999999');
    });
  });

  describe('getScrollPosition', () => {
    it('should retrieve saved scroll position', () => {
      sessionStorage.setItem('scroll_tab_reading', '500');
      const position = getScrollPosition('reading');
      expect(position).toBe(500);
    });

    it('should return 0 if position not found', () => {
      const position = getScrollPosition('reading');
      expect(position).toBe(0);
    });

    it('should parse string to number', () => {
      sessionStorage.setItem('scroll_tab_reading', '123');
      const position = getScrollPosition('reading');
      expect(typeof position).toBe('number');
      expect(position).toBe(123);
    });

    it('should handle invalid stored values', () => {
      sessionStorage.setItem('scroll_tab_reading', 'invalid');
      const position = getScrollPosition('reading');
      expect(isNaN(position)).toBe(true);
    });
  });

  describe('clearScrollPosition', () => {
    it('should remove scroll position for specific tab', () => {
      sessionStorage.setItem('scroll_tab_reading', '500');
      clearScrollPosition('reading');
      expect(sessionStorage.getItem('scroll_tab_reading')).toBeNull();
    });

    it('should not affect other tabs', () => {
      sessionStorage.setItem('scroll_tab_reading', '100');
      sessionStorage.setItem('scroll_tab_completed', '200');
      clearScrollPosition('reading');
      expect(sessionStorage.getItem('scroll_tab_completed')).toBe('200');
    });

    it('should handle clearing non-existent position', () => {
      expect(() => clearScrollPosition('reading')).not.toThrow();
    });
  });

  describe('clearAllScrollPositions', () => {
    it('should remove all scroll positions', () => {
      sessionStorage.setItem('scroll_tab_reading', '100');
      sessionStorage.setItem('scroll_tab_completed', '200');
      sessionStorage.setItem('scroll_tab_on_hold', '300');
      clearAllScrollPositions();
      expect(sessionStorage.getItem('scroll_tab_reading')).toBeNull();
      expect(sessionStorage.getItem('scroll_tab_completed')).toBeNull();
      expect(sessionStorage.getItem('scroll_tab_on_hold')).toBeNull();
    });

    it('should not affect non-scroll-position keys', () => {
      sessionStorage.setItem('scroll_tab_reading', '100');
      sessionStorage.setItem('other_key', 'value');
      clearAllScrollPositions();
      expect(sessionStorage.getItem('other_key')).toBe('value');
      expect(sessionStorage.getItem('scroll_tab_reading')).toBeNull();
    });

    it('should handle empty sessionStorage', () => {
      expect(() => clearAllScrollPositions()).not.toThrow();
    });
  });
});

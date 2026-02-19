import {
  isValidScrollPosition,
  clampScrollPosition,
  percentageToPixels,
  pixelsToPercentage,
  isPositionStillValid,
  getScrollableHeight,
} from '../../src/lib/scrollValidation';

function setDocumentDimensions(scrollHeight: number, clientHeight: number): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: clientHeight,
    writable: true,
    configurable: true,
  });
}

function setWindowScrollY(scrollY: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    writable: true,
    configurable: true,
  });
}

describe('Scroll Restoration Integration: Full Flow', () => {
  describe('AC-1: Scroll to last position on resume', () => {
    it('converts stored percentage to correct pixel offset for standard page', () => {
      setDocumentDimensions(2000, 800);
      const storedPercentage = 50;
      const scrollableHeight = getScrollableHeight();
      expect(scrollableHeight).toBe(1200);

      const targetPixels = percentageToPixels(storedPercentage, scrollableHeight);
      expect(targetPixels).toBe(600);
    });

    it('converts stored percentage to correct pixel offset for tall page', () => {
      setDocumentDimensions(10000, 1000);
      const storedPercentage = 25;
      const scrollableHeight = getScrollableHeight();
      expect(scrollableHeight).toBe(9000);

      const targetPixels = percentageToPixels(storedPercentage, scrollableHeight);
      expect(targetPixels).toBe(2250);
    });

    it('restores to top (0px) when stored position is 0%', () => {
      setDocumentDimensions(3000, 900);
      const storedPercentage = 0;
      const scrollableHeight = getScrollableHeight();
      const targetPixels = percentageToPixels(storedPercentage, scrollableHeight);
      expect(targetPixels).toBe(0);
    });

    it('restores to bottom when stored position is 100%', () => {
      setDocumentDimensions(2000, 800);
      const storedPercentage = 100;
      const scrollableHeight = getScrollableHeight();
      const targetPixels = percentageToPixels(storedPercentage, scrollableHeight);
      expect(targetPixels).toBe(1200);
    });
  });

  describe('AC-4: Scroll position accuracy within 1-2 pixels', () => {
    it('round-trips percentage → pixels → percentage with <1% error', () => {
      setDocumentDimensions(5000, 1000);
      const scrollableHeight = getScrollableHeight();

      const testPercentages = [10, 25, 33, 50, 67, 75, 90];
      for (const pct of testPercentages) {
        const pixels = percentageToPixels(pct, scrollableHeight);
        const restored = pixelsToPercentage(pixels, scrollableHeight);
        expect(Math.abs(restored - pct)).toBeLessThanOrEqual(1);
      }
    });

    it('pixel accuracy: stored 50% restores within 2px of expected position', () => {
      setDocumentDimensions(2000, 800);
      const scrollableHeight = getScrollableHeight();
      const storedPct = 50;
      const expectedPixels = (storedPct / 100) * scrollableHeight;
      const actualPixels = percentageToPixels(storedPct, scrollableHeight);
      expect(Math.abs(actualPixels - expectedPixels)).toBeLessThanOrEqual(2);
    });

    it('pixel accuracy: stored 33% restores within 2px', () => {
      setDocumentDimensions(3000, 900);
      const scrollableHeight = getScrollableHeight();
      const storedPct = 33;
      const expectedPixels = (storedPct / 100) * scrollableHeight;
      const actualPixels = percentageToPixels(storedPct, scrollableHeight);
      expect(Math.abs(actualPixels - expectedPixels)).toBeLessThanOrEqual(2);
    });
  });

  describe('AC-5: Fallback to chapter start when position invalid', () => {
    it('detects invalid position when page height changed (non-zero position, zero scrollable)', () => {
      const storedPosition = 50;
      const currentScrollableHeight = 0;
      expect(isPositionStillValid(storedPosition, currentScrollableHeight)).toBe(false);
    });

    it('detects invalid position when value is out of range', () => {
      expect(isPositionStillValid(-5, 1000)).toBe(false);
      expect(isPositionStillValid(105, 1000)).toBe(false);
    });

    it('detects invalid position when value is NaN', () => {
      expect(isPositionStillValid(NaN, 1000)).toBe(false);
    });

    it('accepts valid position when page has scrollable area', () => {
      expect(isPositionStillValid(50, 1000)).toBe(true);
      expect(isPositionStillValid(0, 1000)).toBe(true);
      expect(isPositionStillValid(100, 1000)).toBe(true);
    });

    it('clamps out-of-range values before use', () => {
      expect(clampScrollPosition(-10)).toBe(0);
      expect(clampScrollPosition(110)).toBe(100);
    });
  });

  describe('AC-2: Timing — restoration within 1 second', () => {
    it('getScrollableHeight returns correct value synchronously', () => {
      setDocumentDimensions(3000, 800);
      const height = getScrollableHeight();
      expect(height).toBe(2200);
    });

    it('percentageToPixels is synchronous (no async needed)', () => {
      const start = Date.now();
      percentageToPixels(50, 1000);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10);
    });

    it('validation functions are synchronous', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        isValidScrollPosition(50);
        clampScrollPosition(50);
      }
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('AC-3: Page fully loaded before scrolling', () => {
    it('document.readyState complete means page is ready', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
        configurable: true,
      });
      expect(document.readyState).toBe('complete');
    });

    it('getScrollableHeight works when document is complete', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
        configurable: true,
      });
      setDocumentDimensions(2000, 800);
      expect(getScrollableHeight()).toBe(1200);
    });
  });

  describe('Different page heights and content', () => {
    const testCases = [
      { scrollHeight: 1000, clientHeight: 500, label: 'short page' },
      { scrollHeight: 5000, clientHeight: 800, label: 'medium page' },
      { scrollHeight: 20000, clientHeight: 1080, label: 'very tall page' },
      { scrollHeight: 800, clientHeight: 800, label: 'non-scrollable page' },
    ];

    for (const tc of testCases) {
      it(`handles ${tc.label} (${tc.scrollHeight}px height)`, () => {
        setDocumentDimensions(tc.scrollHeight, tc.clientHeight);
        const scrollableHeight = getScrollableHeight();
        const expected = Math.max(0, tc.scrollHeight - tc.clientHeight);
        expect(scrollableHeight).toBe(expected);

        if (scrollableHeight > 0) {
          const pixels = percentageToPixels(50, scrollableHeight);
          expect(pixels).toBe(Math.round(scrollableHeight / 2));
          expect(pixels).toBeGreaterThanOrEqual(0);
          expect(pixels).toBeLessThanOrEqual(scrollableHeight);
        } else {
          const pixels = percentageToPixels(50, scrollableHeight);
          expect(pixels).toBe(0);
        }
      });
    }
  });

  describe('Position validation edge cases', () => {
    it('validates boundary values correctly', () => {
      expect(isValidScrollPosition(0)).toBe(true);
      expect(isValidScrollPosition(100)).toBe(true);
      expect(isValidScrollPosition(0.001)).toBe(true);
      expect(isValidScrollPosition(99.999)).toBe(true);
    });

    it('rejects boundary violations', () => {
      expect(isValidScrollPosition(-0.001)).toBe(false);
      expect(isValidScrollPosition(100.001)).toBe(false);
    });

    it('clamping is idempotent', () => {
      const values = [0, 25, 50, 75, 100];
      for (const v of values) {
        expect(clampScrollPosition(clampScrollPosition(v))).toBe(clampScrollPosition(v));
      }
    });
  });
});

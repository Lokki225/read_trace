import {
  extractScrollProgress,
  extractPageProgress,
} from '../../../src/extension/adapters/mangadex';

import {
  extractWebtoonScrollProgress,
  extractWebtoonPageProgress,
} from '../../../src/extension/adapters/webtoon';

import { calculateScrollPosition } from '../../../src/extension/content';

function makeScrollDocument(overrides: {
  scrollTop?: number;
  scrollHeight?: number;
  clientHeight?: number;
}): Document {
  const doc = document.implementation.createHTMLDocument('');
  const { scrollTop = 0, scrollHeight = 1000, clientHeight = 500 } = overrides;

  Object.defineProperty(doc.documentElement, 'scrollTop', {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(doc.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(doc.documentElement, 'clientHeight', {
    value: clientHeight,
    writable: true,
    configurable: true,
  });

  return doc;
}

function makePageDocument(pages: number, currentPage?: number): Document {
  const doc = document.implementation.createHTMLDocument('');
  for (let i = 1; i <= pages; i++) {
    const img = doc.createElement('img');
    img.className = 'page';
    img.setAttribute('data-page', String(i));
    img.setAttribute('src', `page${i}.jpg`);
    doc.body.appendChild(img);
  }
  return doc;
}

function makeWebtoonImageDocument(count: number): Document {
  const doc = document.implementation.createHTMLDocument('');
  const list = doc.createElement('div');
  list.id = '_imageList';
  for (let i = 0; i < count; i++) {
    const img = doc.createElement('img');
    img.setAttribute('src', `panel${i + 1}.jpg`);
    list.appendChild(img);
  }
  doc.body.appendChild(list);
  return doc;
}

// ─── MangaDex Scroll Position ─────────────────────────────────────────────────

describe('extractScrollProgress (MangaDex)', () => {
  it('returns 0 when at top of page', () => {
    const doc = makeScrollDocument({ scrollTop: 0, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(0);
  });

  it('returns 100 when at bottom of page', () => {
    const doc = makeScrollDocument({ scrollTop: 500, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(100);
  });

  it('returns 50 when halfway through page', () => {
    const doc = makeScrollDocument({ scrollTop: 250, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(50);
  });

  it('returns 0 when scrollHeight equals clientHeight (no scroll)', () => {
    const doc = makeScrollDocument({ scrollTop: 0, scrollHeight: 500, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(0);
  });

  it('returns 0 when scrollHeight is less than clientHeight', () => {
    const doc = makeScrollDocument({ scrollTop: 0, scrollHeight: 400, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(0);
  });

  it('caps at 100 even if scrollTop exceeds scrollable area', () => {
    const doc = makeScrollDocument({ scrollTop: 600, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(100);
  });

  it('returns 25 when one quarter through', () => {
    const doc = makeScrollDocument({ scrollTop: 125, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(25);
  });

  it('returns 75 when three quarters through', () => {
    const doc = makeScrollDocument({ scrollTop: 375, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(75);
  });

  it('handles large page heights correctly', () => {
    const doc = makeScrollDocument({ scrollTop: 5000, scrollHeight: 20000, clientHeight: 1000 });
    expect(extractScrollProgress(doc)).toBe(Math.round((5000 / 19000) * 100));
  });

  it('handles small scroll increments', () => {
    const doc = makeScrollDocument({ scrollTop: 10, scrollHeight: 1000, clientHeight: 500 });
    expect(extractScrollProgress(doc)).toBe(2);
  });
});

// ─── MangaDex Page Progress ───────────────────────────────────────────────────

describe('extractPageProgress (MangaDex)', () => {
  it('returns null when no page images found', () => {
    const doc = document.implementation.createHTMLDocument('');
    const result = extractPageProgress(doc);
    expect(result.pageNumber).toBeNull();
    expect(result.totalPages).toBeNull();
  });

  it('returns page count from data-page attribute', () => {
    const doc = makePageDocument(10, 1);
    const result = extractPageProgress(doc);
    expect(result.totalPages).toBe(10);
    expect(result.pageNumber).toBe(1);
  });

  it('returns page 1 as default when no data-page attribute', () => {
    const doc = document.implementation.createHTMLDocument('');
    const img = doc.createElement('img');
    img.className = 'page';
    doc.body.appendChild(img);
    const result = extractPageProgress(doc);
    expect(result.pageNumber).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('returns correct total for 5 pages', () => {
    const doc = makePageDocument(5);
    const result = extractPageProgress(doc);
    expect(result.totalPages).toBe(5);
  });

  it('returns correct total for 20 pages', () => {
    const doc = makePageDocument(20);
    const result = extractPageProgress(doc);
    expect(result.totalPages).toBe(20);
  });
});

// ─── Webtoon Scroll Position ──────────────────────────────────────────────────

describe('extractWebtoonScrollProgress', () => {
  it('returns 0 when at top', () => {
    const doc = makeScrollDocument({ scrollTop: 0, scrollHeight: 2000, clientHeight: 800 });
    expect(extractWebtoonScrollProgress(doc)).toBe(0);
  });

  it('returns 100 when at bottom', () => {
    const doc = makeScrollDocument({ scrollTop: 1200, scrollHeight: 2000, clientHeight: 800 });
    expect(extractWebtoonScrollProgress(doc)).toBe(100);
  });

  it('returns 50 when halfway', () => {
    const doc = makeScrollDocument({ scrollTop: 600, scrollHeight: 2000, clientHeight: 800 });
    expect(extractWebtoonScrollProgress(doc)).toBe(50);
  });

  it('returns 0 when no scrollable area', () => {
    const doc = makeScrollDocument({ scrollTop: 0, scrollHeight: 800, clientHeight: 800 });
    expect(extractWebtoonScrollProgress(doc)).toBe(0);
  });

  it('handles very tall webtoon pages', () => {
    const doc = makeScrollDocument({ scrollTop: 10000, scrollHeight: 50000, clientHeight: 1000 });
    expect(extractWebtoonScrollProgress(doc)).toBe(Math.round((10000 / 49000) * 100));
  });
});

// ─── Webtoon Page Progress ────────────────────────────────────────────────────

describe('extractWebtoonPageProgress', () => {
  it('returns null when no images found', () => {
    const doc = document.implementation.createHTMLDocument('');
    const result = extractWebtoonPageProgress(doc);
    expect(result.pageNumber).toBeNull();
    expect(result.totalPages).toBeNull();
  });

  it('returns correct panel count from _imageList', () => {
    const doc = makeWebtoonImageDocument(12);
    const result = extractWebtoonPageProgress(doc);
    expect(result.totalPages).toBe(12);
  });

  it('always returns null pageNumber for webtoon (vertical scroll)', () => {
    const doc = makeWebtoonImageDocument(10);
    const result = extractWebtoonPageProgress(doc);
    expect(result.pageNumber).toBeNull();
  });

  it('returns correct count for 20 panels', () => {
    const doc = makeWebtoonImageDocument(20);
    const result = extractWebtoonPageProgress(doc);
    expect(result.totalPages).toBe(20);
  });
});

// ─── Content Script Scroll Position ──────────────────────────────────────────

describe('calculateScrollPosition (content script)', () => {
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
  const originalScrollHeight = Object.getOwnPropertyDescriptor(
    document.documentElement,
    'scrollHeight'
  );
  const originalClientHeight = Object.getOwnPropertyDescriptor(
    document.documentElement,
    'clientHeight'
  );

  afterEach(() => {
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    }
    if (originalScrollHeight) {
      Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight);
    }
    if (originalClientHeight) {
      Object.defineProperty(document.documentElement, 'clientHeight', originalClientHeight);
    }
  });

  function mockScrollState(scrollY: number, scrollHeight: number, clientHeight: number): void {
    Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: scrollHeight, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: clientHeight, writable: true, configurable: true });
  }

  it('returns 0 at top of page', () => {
    mockScrollState(0, 1000, 500);
    expect(calculateScrollPosition()).toBe(0);
  });

  it('returns 100 at bottom of page', () => {
    mockScrollState(500, 1000, 500);
    expect(calculateScrollPosition()).toBe(100);
  });

  it('returns 50 at halfway point', () => {
    mockScrollState(250, 1000, 500);
    expect(calculateScrollPosition()).toBe(50);
  });

  it('returns 0 when no scrollable area', () => {
    mockScrollState(0, 500, 500);
    expect(calculateScrollPosition()).toBe(0);
  });

  it('clamps to 100 when scrolled past bottom', () => {
    mockScrollState(600, 1000, 500);
    expect(calculateScrollPosition()).toBe(100);
  });

  it('clamps to 0 when scrollY is negative', () => {
    mockScrollState(-10, 1000, 500);
    expect(calculateScrollPosition()).toBe(0);
  });

  it('handles different viewport sizes correctly', () => {
    mockScrollState(200, 2000, 800);
    const position = calculateScrollPosition();
    expect(position).toBeGreaterThan(0);
    expect(position).toBeLessThan(100);
    expect(position).toBe(Math.min(100, Math.max(0, (200 / (2000 - 800)) * 100)));
  });

  it('returns correct value for mobile viewport', () => {
    mockScrollState(100, 1500, 375);
    const expected = Math.min(100, Math.max(0, (100 / (1500 - 375)) * 100));
    expect(calculateScrollPosition()).toBeCloseTo(expected, 5);
  });

  it('returns correct value for large desktop viewport', () => {
    mockScrollState(500, 5000, 1080);
    const expected = Math.min(100, Math.max(0, (500 / (5000 - 1080)) * 100));
    expect(calculateScrollPosition()).toBeCloseTo(expected, 5);
  });
});

// ─── Scroll Position Accuracy Validation ─────────────────────────────────────

describe('scroll position accuracy validation', () => {
  it('scroll position is always between 0 and 100', () => {
    const testCases = [
      { scrollTop: 0, scrollHeight: 1000, clientHeight: 500 },
      { scrollTop: 250, scrollHeight: 1000, clientHeight: 500 },
      { scrollTop: 500, scrollHeight: 1000, clientHeight: 500 },
      { scrollTop: 1000, scrollHeight: 1000, clientHeight: 500 },
      { scrollTop: 0, scrollHeight: 500, clientHeight: 500 },
    ];

    for (const tc of testCases) {
      const doc = makeScrollDocument(tc);
      const pos = extractScrollProgress(doc);
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThanOrEqual(100);
    }
  });

  it('scroll position increases monotonically as user scrolls down', () => {
    const scrollPositions = [0, 100, 200, 300, 400, 500];
    const results: number[] = [];

    for (const scrollTop of scrollPositions) {
      const doc = makeScrollDocument({ scrollTop, scrollHeight: 1000, clientHeight: 500 });
      results.push(extractScrollProgress(doc));
    }

    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThanOrEqual(results[i - 1]);
    }
  });

  it('position restoration accuracy: stored position matches recalculated position', () => {
    const scrollTop = 250;
    const scrollHeight = 1000;
    const clientHeight = 500;

    const doc = makeScrollDocument({ scrollTop, scrollHeight, clientHeight });
    const storedPosition = extractScrollProgress(doc);

    const expectedScrollTop = (storedPosition / 100) * (scrollHeight - clientHeight);
    expect(Math.abs(expectedScrollTop - scrollTop)).toBeLessThan(1);
  });
});

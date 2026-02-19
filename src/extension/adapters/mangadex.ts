import { PlatformAdapter } from '../types';
import { PlatformAdapterV2, SeriesInfo, ChapterInfo, ProgressInfo } from './types';

const MANGADEX_URL_PATTERN = /^https:\/\/mangadex\.org\/(chapter|title)\/([a-f0-9-]+)/;

const MANGADEX_URL_PATTERNS = {
  chapter: /^https:\/\/mangadex\.org\/chapter\/([a-f0-9-]+)/,
  title: /^https:\/\/mangadex\.org\/title\/([a-f0-9-]+)/,
};

const CHAPTER_NUMBER_PATTERNS = [
  /\/chapter\/[a-f0-9-]+\/(\d+(?:\.\d+)?)/,
  /[Cc]hapter[-\s]+(\d+(?:\.\d+)?)/,
  /[Cc]h\.?[-\s]*(\d+(?:\.\d+)?)/,
];

const SERIES_TITLE_SELECTORS = [
  'meta[property="og:title"]',
  'meta[name="title"]',
  'h1[class*="title"]',
  'h2[class*="title"]',
  '.manga-title',
  '[data-testid="series-title"]',
];

const PAGE_IMAGE_SELECTORS = [
  'img[class*="page"]',
  'img[data-page]',
  '.reader-image',
  '[class*="reader"] img',
];

export function extractSeriesTitle(document: Document): string | null {
  for (const selector of SERIES_TITLE_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      const content =
        element.getAttribute('content') || element.textContent || null;
      if (content) {
        return sanitizeTitle(content.trim());
      }
    }
  }

  if (document.title) {
    const titleParts = document.title.split(' - ');
    if (titleParts.length > 1) {
      return sanitizeTitle(titleParts[0].trim());
    }
    return sanitizeTitle(document.title.trim());
  }

  return null;
}

export function extractChapterNumber(
  url: string,
  document: Document
): number | null {
  for (const pattern of CHAPTER_NUMBER_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  }

  const pageTitle = document.title || '';
  for (const pattern of CHAPTER_NUMBER_PATTERNS) {
    const match = pageTitle.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  }

  const headings = document.querySelectorAll('h1, h2, h3');
  for (const heading of headings) {
    const text = heading.textContent || '';
    for (const pattern of CHAPTER_NUMBER_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num) && num > 0) {
          return num;
        }
      }
    }
  }

  return null;
}

export function extractChapterTitle(document: Document): string | null {
  const titleEl = document.querySelector('h1, h2, [class*="chapter-title"]');
  if (titleEl && titleEl.textContent) {
    return titleEl.textContent.trim() || null;
  }
  return null;
}

export function extractScrollProgress(doc: Document): number {
  const scrollEl = doc.documentElement || doc.body;
  const scrollTop = scrollEl.scrollTop;
  const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
  if (scrollHeight <= 0) return 0;
  return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
}

export function extractPageProgress(doc: Document): { pageNumber: number | null; totalPages: number | null } {
  for (const selector of PAGE_IMAGE_SELECTORS) {
    const images = doc.querySelectorAll(selector);
    if (images.length > 0) {
      const pageAttr = (images[0] as HTMLElement).getAttribute('data-page');
      if (pageAttr) {
        return { pageNumber: parseInt(pageAttr, 10), totalPages: images.length };
      }
      return { pageNumber: 1, totalPages: images.length };
    }
  }
  return { pageNumber: null, totalPages: null };
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, '')
    .trim()
    .substring(0, 200);
}

export function matchesMangaDex(url: string): boolean {
  return (
    MANGADEX_URL_PATTERNS.chapter.test(url) ||
    MANGADEX_URL_PATTERNS.title.test(url)
  );
}

export const mangadexAdapter: PlatformAdapter = {
  name: 'MangaDex',
  matches: matchesMangaDex,
  extractSeriesTitle,
  extractChapterNumber,
};

export class MangaDexAdapter implements PlatformAdapterV2 {
  name = 'MangaDex';
  urlPattern = MANGADEX_URL_PATTERN;

  validatePage(): boolean {
    return matchesMangaDex(window.location.href);
  }

  async detectSeries(): Promise<SeriesInfo | null> {
    const title = extractSeriesTitle(document);
    if (!title) return null;
    return {
      title,
      platform: 'MangaDex',
      url: window.location.href,
    };
  }

  async detectChapter(): Promise<ChapterInfo | null> {
    const number = extractChapterNumber(window.location.href, document);
    if (number === null) return null;
    return {
      number,
      title: extractChapterTitle(document),
      url: window.location.href,
    };
  }

  async detectProgress(): Promise<ProgressInfo> {
    const scrollPosition = extractScrollProgress(document);
    const { pageNumber, totalPages } = extractPageProgress(document);
    return {
      scrollPosition,
      pageNumber,
      totalPages,
      percentComplete: scrollPosition,
    };
  }
}

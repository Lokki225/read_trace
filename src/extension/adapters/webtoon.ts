import { PlatformAdapter } from '../types';
import { PlatformAdapterV2, SeriesInfo, ChapterInfo, ProgressInfo } from './types';

const WEBTOON_URL_PATTERN = /^https:\/\/www\.webtoons\.com\/[a-z]{2}\/(.*?)\/(.*?)\/viewer/;

const WEBTOON_URL_PATTERNS = {
  viewer: /^https:\/\/www\.webtoons\.com\/[a-z]{2}\/(.*?)\/(.*?)\/viewer/,
  episode: /^https:\/\/www\.webtoons\.com\/[a-z]{2}\/(.*?)\/(.*?)\/list/,
};

const EPISODE_NUMBER_PATTERNS = [
  /[Ee]p(?:isode)?\.?\s*(\d+)/,
  /#(\d+)/,
  /episode_no=(\d+)/,
  /\[Ep\.\s*(\d+)\]/,
];

const SERIES_TITLE_SELECTORS = [
  'meta[property="og:title"]',
  'meta[name="title"]',
  'h1.subj',
  'h1[class*="title"]',
  '.info .subj',
  '[class*="series-title"]',
  'h1',
];

const EPISODE_TITLE_SELECTORS = [
  'h1.subj_episode',
  '[class*="episode-title"]',
  '.episode_title',
  'h2',
];

const WEBTOON_IMAGE_SELECTORS = [
  '#_imageList img',
  '.viewer_img img',
  '[class*="viewer"] img',
  'img[class*="episode"]',
];

export function extractWebtoonSeriesTitle(doc: Document): string | null {
  for (const selector of SERIES_TITLE_SELECTORS) {
    const el = doc.querySelector(selector);
    if (el) {
      const content = el.getAttribute('content') || el.textContent || null;
      if (content && content.trim()) {
        return sanitizeWebtoonTitle(content.trim());
      }
    }
  }
  return null;
}

export function extractWebtoonEpisodeNumber(url: string, doc: Document): number | null {
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const episodeNo = urlParams.get('episode_no');
  if (episodeNo) {
    const num = parseInt(episodeNo, 10);
    if (!isNaN(num) && num > 0) return num;
  }

  for (const pattern of EPISODE_NUMBER_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  const pageTitle = doc.title || '';
  for (const pattern of EPISODE_NUMBER_PATTERNS) {
    const match = pageTitle.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  for (const selector of EPISODE_TITLE_SELECTORS) {
    const el = doc.querySelector(selector);
    if (el && el.textContent) {
      for (const pattern of EPISODE_NUMBER_PATTERNS) {
        const match = el.textContent.match(pattern);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > 0) return num;
        }
      }
    }
  }

  return null;
}

export function extractWebtoonEpisodeTitle(doc: Document): string | null {
  for (const selector of EPISODE_TITLE_SELECTORS) {
    const el = doc.querySelector(selector);
    if (el && el.textContent && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }
  return null;
}

export function extractWebtoonScrollProgress(doc: Document): number {
  const scrollEl = doc.documentElement || doc.body;
  const scrollTop = scrollEl.scrollTop;
  const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
  if (scrollHeight <= 0) return 0;
  return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
}

export function extractWebtoonPageProgress(doc: Document): { pageNumber: number | null; totalPages: number | null } {
  for (const selector of WEBTOON_IMAGE_SELECTORS) {
    const images = doc.querySelectorAll(selector);
    if (images.length > 0) {
      return { pageNumber: null, totalPages: images.length };
    }
  }
  return { pageNumber: null, totalPages: null };
}

export function matchesWebtoon(url: string): boolean {
  return (
    WEBTOON_URL_PATTERNS.viewer.test(url) ||
    WEBTOON_URL_PATTERNS.episode.test(url)
  );
}

function sanitizeWebtoonTitle(title: string): string {
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, '')
    .trim()
    .substring(0, 200);
}

export const webtoonAdapter: PlatformAdapter = {
  name: 'Webtoon',
  matches: matchesWebtoon,
  extractSeriesTitle: extractWebtoonSeriesTitle,
  extractChapterNumber: extractWebtoonEpisodeNumber,
};

export class WebtoonAdapter implements PlatformAdapterV2 {
  name = 'Webtoon';
  urlPattern = WEBTOON_URL_PATTERN;

  validatePage(): boolean {
    return matchesWebtoon(window.location.href);
  }

  async detectSeries(): Promise<SeriesInfo | null> {
    const title = extractWebtoonSeriesTitle(document);
    if (!title) return null;
    return {
      title,
      platform: 'Webtoon',
      url: window.location.href,
    };
  }

  async detectChapter(): Promise<ChapterInfo | null> {
    const number = extractWebtoonEpisodeNumber(window.location.href, document);
    if (number === null) return null;
    return {
      number,
      title: extractWebtoonEpisodeTitle(document),
      url: window.location.href,
    };
  }

  async detectProgress(): Promise<ProgressInfo> {
    const scrollPosition = extractWebtoonScrollProgress(document);
    const { pageNumber, totalPages } = extractWebtoonPageProgress(document);
    const percentComplete = totalPages
      ? Math.round(((pageNumber ?? 0) / totalPages) * 100)
      : scrollPosition;
    return {
      scrollPosition,
      pageNumber,
      totalPages,
      percentComplete,
    };
  }
}

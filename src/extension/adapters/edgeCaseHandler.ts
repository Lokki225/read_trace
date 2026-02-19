import { log, warn } from '../logger';
import { logEdgeCase } from '../analytics/accuracyLogger';

export type EdgeCaseType =
  | 'multi-chapter'
  | 'horizontal-scroll'
  | 'vertical-scroll'
  | 'dynamic-content'
  | 'missing-metadata'
  | 'malformed-html'
  | 'special-characters'
  | 'unknown';

export interface EdgeCaseResult {
  handled: boolean;
  edgeCaseType: EdgeCaseType;
  seriesTitle: string | null;
  chapterNumber: number | null;
  scrollPosition: number;
  totalPages: number | null;
  notes: string;
}

export interface PageLayout {
  isVerticalScroll: boolean;
  isHorizontalScroll: boolean;
  isMultiChapter: boolean;
  isDynamicContent: boolean;
  hasMissingMetadata: boolean;
  hasMalformedHtml: boolean;
}

const SPECIAL_CHAR_PATTERN = /[^\x00-\x7F]/;
const MULTI_CHAPTER_SELECTORS = [
  '[data-chapter]',
  '.chapter-container',
  '[class*="chapter-section"]',
  '[class*="multi-chapter"]',
];
const HORIZONTAL_SCROLL_SELECTORS = [
  '[class*="horizontal"]',
  '[class*="manga-reader"]',
  '.reader-horizontal',
  '[data-reading-mode="horizontal"]',
];
const DYNAMIC_CONTENT_SELECTORS = [
  '[data-lazy]',
  '[loading="lazy"]',
  '[class*="lazy-load"]',
  '[class*="infinite-scroll"]',
];

export function detectPageLayout(doc: Document): PageLayout {
  const hasMultiChapter = MULTI_CHAPTER_SELECTORS.some(
    (sel) => doc.querySelector(sel) !== null
  );

  const hasHorizontalScroll = HORIZONTAL_SCROLL_SELECTORS.some(
    (sel) => doc.querySelector(sel) !== null
  );

  const hasDynamicContent = DYNAMIC_CONTENT_SELECTORS.some(
    (sel) => doc.querySelector(sel) !== null
  );

  const titleEl = doc.querySelector('title, h1, h2, meta[property="og:title"]');
  const hasMissingMetadata = !titleEl || !titleEl.textContent?.trim();

  const bodyHtml = doc.body?.innerHTML ?? '';
  const hasMalformedHtml =
    (bodyHtml.match(/<[^>]+/g) || []).length >
    (bodyHtml.match(/<[^>]+>/g) || []).length;

  const isVerticalScroll =
    !hasHorizontalScroll &&
    (doc.querySelector('#_imageList') !== null ||
      doc.querySelector('[class*="webtoon"]') !== null ||
      doc.querySelector('[class*="vertical"]') !== null);

  return {
    isVerticalScroll,
    isHorizontalScroll: hasHorizontalScroll,
    isMultiChapter: hasMultiChapter,
    isDynamicContent: hasDynamicContent,
    hasMissingMetadata,
    hasMalformedHtml,
  };
}

export function handleMultiChapterPage(
  doc: Document,
  url: string,
  platform: string
): EdgeCaseResult {
  logEdgeCase(platform, url, 'multi-chapter', { url });

  const chapterContainers = MULTI_CHAPTER_SELECTORS.flatMap((sel) =>
    Array.from(doc.querySelectorAll(sel))
  );

  const chapterNumbers: number[] = [];
  for (const container of chapterContainers) {
    const chapterAttr =
      container.getAttribute('data-chapter') ||
      container.getAttribute('data-chapter-number');
    if (chapterAttr) {
      const num = parseFloat(chapterAttr);
      if (!isNaN(num) && num > 0) {
        chapterNumbers.push(num);
      }
    }
  }

  const currentChapter =
    chapterNumbers.length > 0 ? Math.max(...chapterNumbers) : null;

  const scrollEl = doc.documentElement || doc.body;
  const scrollTop = scrollEl.scrollTop;
  const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
  const scrollPosition =
    scrollHeight > 0
      ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
      : 0;

  const titleEl = doc.querySelector(
    'meta[property="og:title"], h1, title'
  );
  const seriesTitle =
    titleEl?.getAttribute('content') || titleEl?.textContent?.trim() || null;

  log('edgeCaseHandler:multi-chapter', {
    platform,
    chaptersFound: chapterNumbers.length,
    currentChapter,
  });

  return {
    handled: true,
    edgeCaseType: 'multi-chapter',
    seriesTitle,
    chapterNumber: currentChapter,
    scrollPosition,
    totalPages: chapterContainers.length > 0 ? chapterContainers.length : null,
    notes: `Multi-chapter page with ${chapterNumbers.length} chapter markers detected`,
  };
}

export function handleHorizontalScrollPage(
  doc: Document,
  url: string,
  platform: string
): EdgeCaseResult {
  logEdgeCase(platform, url, 'horizontal-scroll', { url });

  const pageImages = doc.querySelectorAll(
    'img[data-page], .page-image, [class*="reader"] img'
  );
  const totalPages = pageImages.length > 0 ? pageImages.length : null;

  let currentPage: number | null = null;
  if (pageImages.length > 0) {
    const firstImg = pageImages[0] as HTMLElement;
    const pageAttr = firstImg.getAttribute('data-page');
    if (pageAttr) {
      currentPage = parseInt(pageAttr, 10);
    }
  }

  const scrollPosition =
    totalPages && currentPage
      ? Math.round((currentPage / totalPages) * 100)
      : 0;

  const titleEl = doc.querySelector(
    'meta[property="og:title"], h1, title'
  );
  const seriesTitle =
    titleEl?.getAttribute('content') || titleEl?.textContent?.trim() || null;

  const chapterEl = doc.querySelector(
    'h2, [class*="chapter-title"], [data-chapter]'
  );
  let chapterNumber: number | null = null;
  if (chapterEl) {
    const text = chapterEl.textContent || '';
    const match = text.match(/[Cc]h(?:apter)?\.?\s*(\d+(?:\.\d+)?)/);
    if (match) {
      chapterNumber = parseFloat(match[1]);
    }
  }

  log('edgeCaseHandler:horizontal-scroll', {
    platform,
    totalPages,
    currentPage,
    scrollPosition,
  });

  return {
    handled: true,
    edgeCaseType: 'horizontal-scroll',
    seriesTitle,
    chapterNumber,
    scrollPosition,
    totalPages,
    notes: `Horizontal scroll layout with ${totalPages ?? 0} pages`,
  };
}

export function handleDynamicContent(
  doc: Document,
  url: string,
  platform: string
): EdgeCaseResult {
  logEdgeCase(platform, url, 'dynamic-content', { url });

  const allImages = doc.querySelectorAll('img');
  const loadedImages = Array.from(allImages).filter(
    (img) =>
      img.complete &&
      img.naturalWidth > 0 &&
      !img.getAttribute('data-lazy') &&
      img.getAttribute('loading') !== 'lazy'
  );

  const totalImages = allImages.length;
  const loadedCount = loadedImages.length;
  const loadProgress =
    totalImages > 0 ? Math.round((loadedCount / totalImages) * 100) : 0;

  const scrollEl = doc.documentElement || doc.body;
  const scrollTop = scrollEl.scrollTop;
  const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
  const scrollPosition =
    scrollHeight > 0
      ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
      : 0;

  const titleEl = doc.querySelector(
    'meta[property="og:title"], h1, title'
  );
  const seriesTitle =
    titleEl?.getAttribute('content') || titleEl?.textContent?.trim() || null;

  warn('edgeCaseHandler:dynamic-content', {
    platform,
    totalImages,
    loadedCount,
    loadProgress,
  });

  return {
    handled: true,
    edgeCaseType: 'dynamic-content',
    seriesTitle,
    chapterNumber: null,
    scrollPosition,
    totalPages: totalImages > 0 ? totalImages : null,
    notes: `Dynamic content: ${loadedCount}/${totalImages} images loaded (${loadProgress}%)`,
  };
}

export function handleMissingMetadata(
  doc: Document,
  url: string,
  platform: string
): EdgeCaseResult {
  logEdgeCase(platform, url, 'missing-metadata', { url });

  let seriesTitle: string | null = null;
  const candidates = [
    doc.querySelector('title'),
    doc.querySelector('h1'),
    doc.querySelector('h2'),
    doc.querySelector('[class*="title"]'),
  ];

  for (const el of candidates) {
    const text = el?.textContent?.trim();
    if (text && text.length > 0) {
      seriesTitle = text.substring(0, 200);
      break;
    }
  }

  let chapterNumber: number | null = null;
  const urlMatch = url.match(/(?:chapter|ch|ep)[-_/]?(\d+(?:\.\d+)?)/i);
  if (urlMatch) {
    const num = parseFloat(urlMatch[1]);
    if (!isNaN(num) && num > 0) {
      chapterNumber = num;
    }
  }

  const scrollEl = doc.documentElement || doc.body;
  const scrollTop = scrollEl.scrollTop;
  const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
  const scrollPosition =
    scrollHeight > 0
      ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
      : 0;

  warn('edgeCaseHandler:missing-metadata', {
    platform,
    url,
    recoveredTitle: seriesTitle,
    recoveredChapter: chapterNumber,
  });

  return {
    handled: seriesTitle !== null || chapterNumber !== null,
    edgeCaseType: 'missing-metadata',
    seriesTitle,
    chapterNumber,
    scrollPosition,
    totalPages: null,
    notes: `Missing metadata: recovered title=${seriesTitle !== null}, chapter=${chapterNumber !== null}`,
  };
}

export function handleSpecialCharacters(title: string): string {
  return title
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[<>"'&]/g, '')
    .trim()
    .substring(0, 200);
}

export function hasSpecialCharacters(text: string): boolean {
  return SPECIAL_CHAR_PATTERN.test(text);
}

export function handleEdgeCase(
  doc: Document,
  url: string,
  platform: string
): EdgeCaseResult | null {
  const layout = detectPageLayout(doc);

  if (layout.isMultiChapter) {
    return handleMultiChapterPage(doc, url, platform);
  }

  if (layout.isHorizontalScroll) {
    return handleHorizontalScrollPage(doc, url, platform);
  }

  if (layout.isDynamicContent) {
    return handleDynamicContent(doc, url, platform);
  }

  if (layout.hasMissingMetadata) {
    return handleMissingMetadata(doc, url, platform);
  }

  return null;
}

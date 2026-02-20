import { ResumePlatform, ResumeUrlData, ResumeNavigationResult } from '@/types/resume';

const ALLOWED_DOMAINS: Record<ResumePlatform, string[]> = {
  mangadex: ['mangadex.org'],
  webtoon: ['webtoons.com', 'www.webtoons.com'],
  unknown: [],
};

export function constructMangaDexUrl(chapterId: string, pageNumber?: number, originalUrl?: string | null): string {
  // Prefer original URL to extract the real chapter UUID and existing page segment
  if (originalUrl) {
    try {
      const parsed = new URL(originalUrl);
      const match = parsed.pathname.match(/\/chapter\/([^/]+)(?:\/(\d+))?/);
      const sourceChapterId = match?.[1] || chapterId;
      const sourcePage = match?.[2];

      const effectiveId = sourceChapterId || chapterId;
      const effectivePage = pageNumber !== undefined && pageNumber !== null ? pageNumber : sourcePage;

      parsed.pathname = `/chapter/${encodeURIComponent(effectiveId)}${
        effectivePage !== undefined && effectivePage !== null ? `/${effectivePage}` : ''
      }`;

      // Remove conflicting page query if present unless we're intentionally setting it
      if (pageNumber === undefined || pageNumber === null) {
        parsed.searchParams.delete('page');
      } else {
        parsed.searchParams.set('page', String(pageNumber));
      }

      return parsed.toString();
    } catch {
      // Fall back to canonical build below
    }
  }

  const base = `https://mangadex.org/chapter/${encodeURIComponent(chapterId)}`;
  if (pageNumber !== undefined && pageNumber !== null) {
    return `${base}/${pageNumber}`;
  }
  return base;
}

export function constructWebtoonUrl(
  seriesSlug: string,
  episodeNumber: number,
  _pageNumber?: number,
  originalUrl?: string | null
): string {
  // Prefer rebuilding from the original URL to preserve locale/title_no structure
  if (originalUrl) {
    try {
      const parsed = new URL(originalUrl);
      parsed.searchParams.set('episode_no', String(episodeNumber));
      return parsed.toString();
    } catch {
      // Fall back to slug-based construction below
    }
  }

  return `https://www.webtoons.com/en/${encodeURIComponent(seriesSlug)}?episode_no=${episodeNumber}`;
}

export function validateResumeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const allAllowed = Object.values(ALLOWED_DOMAINS).flat();
    return allAllowed.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export function buildResumeUrl(data: ResumeUrlData): string | null {
  if (!data.seriesId || data.chapterNumber === undefined || data.chapterNumber === null || data.chapterNumber < 0) {
    return null;
  }

  try {
    let url: string;

    switch (data.platform) {
      case 'mangadex':
        url = constructMangaDexUrl(data.seriesId, data.pageNumber, data.originalUrl);
        break;
      case 'webtoon':
        url = constructWebtoonUrl(data.seriesId, data.chapterNumber, data.pageNumber, data.originalUrl);
        break;
      default:
        return null;
    }

    return validateResumeUrl(url) ? url : null;
  } catch {
    return null;
  }
}

export function navigateToResume(url: string): ResumeNavigationResult {
  if (!validateResumeUrl(url)) {
    return { success: false, url: null, error: 'Invalid or disallowed URL' };
  }

  try {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return { success: true, url };
  } catch (err) {
    return {
      success: false,
      url: null,
      error: err instanceof Error ? err.message : 'Navigation failed',
    };
  }
}

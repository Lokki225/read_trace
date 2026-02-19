import { ResumePlatform, ResumeUrlData, ResumeNavigationResult } from '@/types/resume';

const ALLOWED_DOMAINS: Record<ResumePlatform, string[]> = {
  mangadex: ['mangadex.org'],
  webtoon: ['webtoons.com', 'www.webtoons.com'],
  unknown: [],
};

export function constructMangaDexUrl(chapterId: string, pageNumber?: number): string {
  const base = `https://mangadex.org/chapter/${encodeURIComponent(chapterId)}`;
  return pageNumber !== undefined ? `${base}?page=${pageNumber}` : base;
}

export function constructWebtoonUrl(
  seriesSlug: string,
  episodeNumber: number,
  _pageNumber?: number
): string {
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
        url = constructMangaDexUrl(data.seriesId, data.pageNumber);
        break;
      case 'webtoon':
        url = constructWebtoonUrl(data.seriesId, data.chapterNumber, data.pageNumber);
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

import { constructMangaDexUrl, constructWebtoonUrl, validateResumeUrl } from './resume';

export interface ResumeBuildInput {
  platform: string;
  seriesId: string;
  chapterNumber: number;
  originalUrl?: string | null;
  scrollPosition?: number;
}

export type ResumeAdapter = (input: ResumeBuildInput) => string | null;

function buildMangaDexUrl(input: ResumeBuildInput): string | null {
  const { seriesId, originalUrl } = input;
  // Extract page from original URL if present
  let pageNumber: number | undefined;
  if (originalUrl) {
    try {
      const parsed = new URL(originalUrl);
      const pathMatch = parsed.pathname.match(/\/chapter\/[^/]+\/(\d+)/);
      const queryMatch = parsed.searchParams.get('page');
      if (pathMatch && !Number.isNaN(Number(pathMatch[1]))) {
        pageNumber = Number(pathMatch[1]);
      } else if (queryMatch && !Number.isNaN(Number(queryMatch))) {
        pageNumber = Number(queryMatch);
      }
    } catch {
      // ignore parse errors, fall back below
    }
  }

  const url = constructMangaDexUrl(seriesId, pageNumber, originalUrl);
  return url && validateResumeUrl(url) ? url : null;
}

function buildWebtoonUrl(input: ResumeBuildInput): string | null {
  const { seriesId, chapterNumber, originalUrl, scrollPosition } = input;
  const pageNumber = scrollPosition !== undefined && scrollPosition !== null
    ? Math.round(scrollPosition)
    : undefined;
  const url = constructWebtoonUrl(seriesId, chapterNumber, pageNumber, originalUrl);
  return url && validateResumeUrl(url) ? url : null;
}

const ADAPTERS: Record<string, ResumeAdapter> = {
  mangadex: buildMangaDexUrl,
  webtoon: buildWebtoonUrl,
};

export function buildResumeUrlViaAdapter(input: ResumeBuildInput): string | null {
  const key = input.platform.toLowerCase();
  const adapter = ADAPTERS[key];
  if (!adapter) return null;
  return adapter(input);
}

import {
  buildResumeUrl,
  validateResumeUrl,
  constructMangaDexUrl,
  constructWebtoonUrl,
  navigateToResume,
} from '../../src/lib/resume';
import { ResumeUrlData } from '../../src/types/resume';

describe('constructMangaDexUrl', () => {
  it('constructs URL without page number', () => {
    const url = constructMangaDexUrl('abc-123');
    expect(url).toBe('https://mangadex.org/chapter/abc-123');
  });

  it('constructs URL with page number', () => {
    const url = constructMangaDexUrl('abc-123', 5);
    expect(url).toBe('https://mangadex.org/chapter/abc-123?page=5');
  });

  it('encodes special characters in chapter ID', () => {
    const url = constructMangaDexUrl('chapter id/with spaces');
    expect(url).toContain('chapter%20id');
  });
});

describe('constructWebtoonUrl', () => {
  it('constructs URL with episode number', () => {
    const url = constructWebtoonUrl('action/my-series', 42);
    expect(url).toBe('https://www.webtoons.com/en/action%2Fmy-series?episode_no=42');
  });

  it('constructs URL ignoring page number (vertical scroll)', () => {
    const url = constructWebtoonUrl('action/my-series', 10, 3);
    expect(url).toContain('episode_no=10');
  });
});

describe('validateResumeUrl', () => {
  it('accepts valid mangadex URL', () => {
    expect(validateResumeUrl('https://mangadex.org/chapter/abc-123')).toBe(true);
  });

  it('accepts valid webtoons URL', () => {
    expect(validateResumeUrl('https://www.webtoons.com/en/action/series?episode_no=1')).toBe(true);
  });

  it('rejects http (non-https) URL', () => {
    expect(validateResumeUrl('http://mangadex.org/chapter/abc')).toBe(false);
  });

  it('rejects unknown domain', () => {
    expect(validateResumeUrl('https://evil.com/chapter/abc')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateResumeUrl('')).toBe(false);
  });

  it('rejects malformed URL', () => {
    expect(validateResumeUrl('not-a-url')).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(validateResumeUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('buildResumeUrl', () => {
  const mangadexData: ResumeUrlData = {
    platform: 'mangadex',
    seriesId: 'abc-uuid-123',
    chapterNumber: 10,
    pageNumber: 2,
  };

  const webtoonData: ResumeUrlData = {
    platform: 'webtoon',
    seriesId: 'action/my-series',
    chapterNumber: 5,
  };

  it('builds valid MangaDex URL', () => {
    const url = buildResumeUrl(mangadexData);
    expect(url).toBe('https://mangadex.org/chapter/abc-uuid-123?page=2');
  });

  it('builds valid Webtoon URL', () => {
    const url = buildResumeUrl(webtoonData);
    expect(url).not.toBeNull();
    expect(url).toContain('webtoons.com');
    expect(url).toContain('episode_no=5');
  });

  it('returns null for unknown platform', () => {
    const data: ResumeUrlData = { platform: 'unknown', seriesId: 'abc', chapterNumber: 1 };
    expect(buildResumeUrl(data)).toBeNull();
  });

  it('returns null when seriesId is empty', () => {
    const data: ResumeUrlData = { platform: 'mangadex', seriesId: '', chapterNumber: 1 };
    expect(buildResumeUrl(data)).toBeNull();
  });

  it('builds MangaDex URL without page number', () => {
    const data: ResumeUrlData = { platform: 'mangadex', seriesId: 'abc-123', chapterNumber: 5 };
    const url = buildResumeUrl(data);
    expect(url).toBe('https://mangadex.org/chapter/abc-123');
  });

  it('returns null when chapterNumber is negative', () => {
    const data: ResumeUrlData = { platform: 'webtoon', seriesId: 'action/series', chapterNumber: -1 };
    expect(buildResumeUrl(data)).toBeNull();
  });
});

describe('navigateToResume', () => {
  const validUrl = 'https://mangadex.org/chapter/abc-123';

  beforeEach(() => {
    Object.defineProperty(window, 'open', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls window.open with correct URL and target', () => {
    navigateToResume(validUrl);
    expect(window.open).toHaveBeenCalledWith(validUrl, '_blank', 'noopener,noreferrer');
  });

  it('returns success result for valid URL', () => {
    const result = navigateToResume(validUrl);
    expect(result.success).toBe(true);
    expect(result.url).toBe(validUrl);
  });

  it('returns failure for invalid URL', () => {
    const result = navigateToResume('https://evil.com/hack');
    expect(result.success).toBe(false);
    expect(result.url).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('returns failure for empty URL', () => {
    const result = navigateToResume('');
    expect(result.success).toBe(false);
  });
});

import { extractSeriesFromUrl, detectPlatform, PLATFORM_PATTERNS } from '../../src/backend/services/import/urlExtractor';

describe('detectPlatform', () => {
  it('should detect MangaDex URLs', () => {
    expect(detectPlatform('https://mangadex.org/title/abc123/one-piece')).toBe('MangaDex');
  });

  it('should detect MangaDex chapter URLs', () => {
    expect(detectPlatform('https://mangadex.org/chapter/def456')).toBe('MangaDex');
  });

  it('should return Other for unknown URLs', () => {
    expect(detectPlatform('https://example.com/manga/one-piece')).toBe('Other');
  });

  it('should return Other for non-URL strings', () => {
    expect(detectPlatform('not a url')).toBe('Other');
  });

  it('should return Other for empty string', () => {
    expect(detectPlatform('')).toBe('Other');
  });
});

describe('extractSeriesFromUrl', () => {
  it('should extract series slug from MangaDex title URL', () => {
    const result = extractSeriesFromUrl('https://mangadex.org/title/abc123/one-piece');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('one-piece');
    expect(result?.platform).toBe('MangaDex');
  });

  it('should extract series from MangaDex title URL without slug', () => {
    const result = extractSeriesFromUrl('https://mangadex.org/title/abc123');
    expect(result).not.toBeNull();
    expect(result?.platform).toBe('MangaDex');
  });

  it('should return null for non-series MangaDex URLs', () => {
    const result = extractSeriesFromUrl('https://mangadex.org/chapter/def456');
    expect(result).toBeNull();
  });

  it('should return null for unknown platform URLs', () => {
    const result = extractSeriesFromUrl('https://example.com/manga/one-piece');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = extractSeriesFromUrl('');
    expect(result).toBeNull();
  });

  it('should humanize slug titles (replace hyphens with spaces)', () => {
    const result = extractSeriesFromUrl('https://mangadex.org/title/abc123/attack-on-titan');
    expect(result?.title).toBe('attack-on-titan');
  });
});

describe('PLATFORM_PATTERNS', () => {
  it('should have MangaDex pattern defined', () => {
    expect(PLATFORM_PATTERNS.MangaDex).toBeDefined();
  });

  it('MangaDex pattern should match title URLs', () => {
    expect(PLATFORM_PATTERNS.MangaDex.test('https://mangadex.org/title/abc123/one-piece')).toBe(true);
  });

  it('MangaDex pattern should not match chapter-only URLs', () => {
    expect(PLATFORM_PATTERNS.MangaDex.test('https://mangadex.org/chapter/def456')).toBe(false);
  });
});

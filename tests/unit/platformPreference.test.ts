import {
  selectResumeUrl,
  getAvailablePlatforms,
  isValidPlatform,
  getPlatformDisplayName,
  normalizePlatform,
  PlatformPreferenceConfig,
} from '@/lib/platformPreference';
import { UnifiedProgress } from '@/model/schemas/unifiedState';

describe('platformPreference', () => {
  const mockUnifiedProgress = (overrides = {}): UnifiedProgress => ({
    series_id: 'series-456',
    current_chapter: 10,
    total_chapters: 100,
    scroll_position: 0.5,
    platform: 'mangadex',
    updated_at: new Date().toISOString(),
    resume_url: 'https://mangadex.org/chapter/123',
    alternatives: [
      {
        platform: 'webtoon',
        current_chapter: 8,
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        resume_url: 'https://webtoons.com/series/456',
      },
      {
        platform: 'custom-site',
        current_chapter: 7,
        updated_at: new Date(Date.now() - 7200000).toISOString(),
        resume_url: 'https://custom.com/series/789',
      },
    ],
    ...overrides,
  });

  describe('selectResumeUrl', () => {
    it('should return null when progress is null', () => {
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['mangadex'],
      };

      const result = selectResumeUrl(null, preferences);

      expect(result).toBeNull();
    });

    it('should return most recent platform URL when no preference set', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: [],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://mangadex.org/chapter/123');
    });

    it('should return preferred platform URL when available', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['webtoon'],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://webtoons.com/series/456');
    });

    it('should fallback to most recent when preferred platform unavailable', () => {
      const progress = mockUnifiedProgress({
        alternatives: [
          {
            platform: 'custom-site',
            current_chapter: 7,
            updated_at: new Date().toISOString(),
            resume_url: 'https://custom.com/series/789',
          },
        ],
      });
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['webtoon'],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://mangadex.org/chapter/123');
    });

    it('should respect preference order', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['custom-site', 'webtoon', 'mangadex'],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://custom.com/series/789');
    });

    it('should use manual override when provided', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['mangadex'],
      };

      const result = selectResumeUrl(progress, preferences, 'webtoon');

      expect(result).toBe('https://webtoons.com/series/456');
    });

    it('should use last selected platform when no preference', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: [],
        last_selected_platform: 'webtoon',
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://webtoons.com/series/456');
    });

    it('should prioritize preference over last selected', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['custom-site'],
        last_selected_platform: 'webtoon',
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://custom.com/series/789');
    });

    it('should handle missing resume_url in alternatives', () => {
      const progress = mockUnifiedProgress({
        alternatives: [
          {
            platform: 'webtoon',
            current_chapter: 8,
            updated_at: new Date().toISOString(),
            resume_url: null,
          },
        ],
      });
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['webtoon'],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://mangadex.org/chapter/123');
    });

    it('should return null when no resume URLs available', () => {
      const progress = mockUnifiedProgress({
        resume_url: null,
        alternatives: [
          {
            platform: 'webtoon',
            current_chapter: 8,
            updated_at: new Date().toISOString(),
            resume_url: null,
          },
        ],
      });
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: [],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBeNull();
    });

    it('should fallback to first available alternative', () => {
      const progress = mockUnifiedProgress({
        resume_url: null,
        alternatives: [
          {
            platform: 'webtoon',
            current_chapter: 8,
            updated_at: new Date().toISOString(),
            resume_url: 'https://webtoons.com/series/456',
          },
        ],
      });
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: [],
      };

      const result = selectResumeUrl(progress, preferences);

      expect(result).toBe('https://webtoons.com/series/456');
    });

    it('should handle manual override for alternative platform', () => {
      const progress = mockUnifiedProgress();
      const preferences: PlatformPreferenceConfig = {
        preferred_platforms: ['mangadex'],
      };

      const result = selectResumeUrl(progress, preferences, 'custom-site');

      expect(result).toBe('https://custom.com/series/789');
    });
  });

  describe('getAvailablePlatforms', () => {
    it('should return empty array when progress is null', () => {
      const result = getAvailablePlatforms(null);

      expect(result).toEqual([]);
    });

    it('should return all platforms with progress', () => {
      const progress = mockUnifiedProgress();

      const result = getAvailablePlatforms(progress);

      expect(result).toContain('mangadex');
      expect(result).toContain('webtoon');
      expect(result).toContain('custom-site');
      expect(result).toHaveLength(3);
    });

    it('should not include duplicates', () => {
      const progress = mockUnifiedProgress({
        alternatives: [
          {
            platform: 'mangadex',
            current_chapter: 5,
            updated_at: new Date().toISOString(),
            resume_url: null,
          },
        ],
      });

      const result = getAvailablePlatforms(progress);

      expect(result.filter(p => p === 'mangadex')).toHaveLength(1);
    });

    it('should return only main platform when no alternatives', () => {
      const progress = mockUnifiedProgress({
        alternatives: [],
      });

      const result = getAvailablePlatforms(progress);

      expect(result).toEqual(['mangadex']);
    });
  });

  describe('isValidPlatform', () => {
    it('should return false when progress is null', () => {
      const result = isValidPlatform('mangadex', null);

      expect(result).toBe(false);
    });

    it('should return true for main platform', () => {
      const progress = mockUnifiedProgress();

      const result = isValidPlatform('mangadex', progress);

      expect(result).toBe(true);
    });

    it('should return true for alternative platform', () => {
      const progress = mockUnifiedProgress();

      const result = isValidPlatform('webtoon', progress);

      expect(result).toBe(true);
    });

    it('should return false for unavailable platform', () => {
      const progress = mockUnifiedProgress();

      const result = isValidPlatform('unknown-platform', progress);

      expect(result).toBe(false);
    });
  });

  describe('getPlatformDisplayName', () => {
    it('should return display name for mangadex', () => {
      const result = getPlatformDisplayName('mangadex');

      expect(result).toBe('MangaDex');
    });

    it('should return display name for webtoon', () => {
      const result = getPlatformDisplayName('webtoon');

      expect(result).toBe('Webtoon');
    });

    it('should return display name for webtoons variant', () => {
      const result = getPlatformDisplayName('webtoons');

      expect(result).toBe('Webtoon');
    });

    it('should handle case insensitivity', () => {
      const result = getPlatformDisplayName('MANGADEX');

      expect(result).toBe('MangaDex');
    });

    it('should return original platform for unknown platforms', () => {
      const result = getPlatformDisplayName('custom-site');

      expect(result).toBe('custom-site');
    });

    it('should return display name for unknown platform', () => {
      const result = getPlatformDisplayName('unknown');

      expect(result).toBe('Unknown Platform');
    });
  });

  describe('normalizePlatform', () => {
    it('should normalize mangadex', () => {
      const result = normalizePlatform('MangaDex');

      expect(result).toBe('mangadex');
    });

    it('should normalize webtoon variants', () => {
      expect(normalizePlatform('Webtoon')).toBe('webtoon');
      expect(normalizePlatform('webtoons')).toBe('webtoon');
      expect(normalizePlatform('www.webtoons.com')).toBe('webtoon');
      expect(normalizePlatform('webtoons.com')).toBe('webtoon');
    });

    it('should trim whitespace', () => {
      const result = normalizePlatform('  mangadex  ');

      expect(result).toBe('mangadex');
    });

    it('should return lowercase for unknown platforms', () => {
      const result = normalizePlatform('Custom-Site');

      expect(result).toBe('custom-site');
    });

    it('should handle empty string', () => {
      const result = normalizePlatform('');

      expect(result).toBe('');
    });
  });
});

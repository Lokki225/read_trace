import { getUnifiedProgress } from '@/backend/services/dashboard/unifiedStateService';
import { selectResumeUrl, getAvailablePlatforms, isValidPlatform } from '@/lib/platformPreference';
import { UnifiedProgress } from '@/model/schemas/unifiedState';

describe('Unified State Integration Tests', () => {
  const mockProgressRow = (overrides = {}) => ({
    id: 'progress-1',
    user_id: 'user-123',
    series_id: 'series-456',
    chapter_number: 10,
    page_number: 5,
    scroll_position: 0.5,
    platform: 'mangadex',
    last_read_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  const createMockSupabase = (data: any[], error: any = null) => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data,
              error,
            }),
          }),
        }),
      }),
    }),
  });

  describe('Read on Site A then Site B', () => {
    it('should show most recent progress from Site B', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 5,
        updated_at: oneHourAgo.toISOString(),
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: now.toISOString(),
      });

      const mockSupabase = createMockSupabase([mangadexProgress, webtoonProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.platform).toBe('webtoon');
      expect(result.progress?.current_chapter).toBe(8);
      expect(result.progress?.alternatives).toHaveLength(1);
    });
  });

  describe('Dashboard reflects unified state', () => {
    it('should display correct current position with platform indicator', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 5,
        updated_at: oneHourAgo.toISOString(),
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: now.toISOString(),
      });

      const mockSupabase = createMockSupabase([mangadexProgress, webtoonProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.current_chapter).toBe(8);
      expect(result.progress?.platform).toBe('webtoon');
    });
  });

  describe('Resume with platform selection', () => {
    it('should navigate to selected platform', () => {
      const unifiedProgress: UnifiedProgress = {
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
        ],
      };

      const preferences = {
        preferred_platforms: [],
      };

      const result = selectResumeUrl(unifiedProgress, preferences, 'webtoon');

      expect(result).toBe('https://webtoons.com/series/456');
    });
  });

  describe('Platform preference resolution', () => {
    it('should use preferred platform when available', () => {
      const unifiedProgress: UnifiedProgress = {
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
        ],
      };

      const preferences = {
        preferred_platforms: ['webtoon'],
      };

      const result = selectResumeUrl(unifiedProgress, preferences);

      expect(result).toBe('https://webtoons.com/series/456');
    });

    it('should fallback to most recent when preferred unavailable', () => {
      const unifiedProgress: UnifiedProgress = {
        series_id: 'series-456',
        current_chapter: 10,
        total_chapters: 100,
        scroll_position: 0.5,
        platform: 'mangadex',
        updated_at: new Date().toISOString(),
        resume_url: 'https://mangadex.org/chapter/123',
        alternatives: [
          {
            platform: 'custom-site',
            current_chapter: 8,
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            resume_url: 'https://custom.com/series/456',
          },
        ],
      };

      const preferences = {
        preferred_platforms: ['webtoon'],
      };

      const result = selectResumeUrl(unifiedProgress, preferences);

      expect(result).toBe('https://mangadex.org/chapter/123');
    });
  });

  describe('Conflict resolution during sync', () => {
    it('should resolve conflicts with last-write-wins strategy', async () => {
      const now = new Date();
      const oneSecondAgo = new Date(now.getTime() - 1000);

      const olderProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 5,
        updated_at: oneSecondAgo.toISOString(),
      });

      const newerProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: now.toISOString(),
      });

      const mockSupabase = createMockSupabase([olderProgress, newerProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.platform).toBe('webtoon');
      expect(result.progress?.current_chapter).toBe(8);
    });
  });

  describe('Platform indicator displays correctly', () => {
    it('should show platform badge on series card', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 5,
        updated_at: oneHourAgo.toISOString(),
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: now.toISOString(),
      });

      const mockSupabase = createMockSupabase([mangadexProgress, webtoonProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.progress?.platform).toBe('webtoon');
      expect(getAvailablePlatforms(result.progress)).toContain('webtoon');
      expect(getAvailablePlatforms(result.progress)).toContain('mangadex');
    });
  });

  describe('Alternatives dropdown populated', () => {
    it('should show all available platforms with progress', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 5,
        updated_at: twoHoursAgo.toISOString(),
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: oneHourAgo.toISOString(),
      });

      const customProgress = mockProgressRow({
        platform: 'custom-site',
        chapter_number: 7,
        updated_at: now.toISOString(),
      });

      const mockSupabase = createMockSupabase([mangadexProgress, webtoonProgress, customProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      const platforms = getAvailablePlatforms(result.progress);
      expect(platforms).toHaveLength(3);
      expect(platforms).toContain('custom-site');
      expect(platforms).toContain('webtoon');
      expect(platforms).toContain('mangadex');
    });
  });

  describe('Resume navigation completes in time', () => {
    it('should resolve unified progress quickly', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 5,
        updated_at: oneHourAgo.toISOString(),
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: now.toISOString(),
      });

      const mockSupabase = createMockSupabase([mangadexProgress, webtoonProgress]);

      const startTime = Date.now();
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Fallback when preferred platform unavailable', () => {
    it('should fallback to most recent when preferred has no progress', () => {
      const unifiedProgress: UnifiedProgress = {
        series_id: 'series-456',
        current_chapter: 10,
        total_chapters: 100,
        scroll_position: 0.5,
        platform: 'mangadex',
        updated_at: new Date().toISOString(),
        resume_url: 'https://mangadex.org/chapter/123',
        alternatives: [],
      };

      const preferences = {
        preferred_platforms: ['webtoon'],
      };

      const result = selectResumeUrl(unifiedProgress, preferences);

      expect(result).toBe('https://mangadex.org/chapter/123');
    });
  });

  describe('Manual override persists', () => {
    it('should use manually selected platform', () => {
      const unifiedProgress: UnifiedProgress = {
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
        ],
      };

      const preferences = {
        preferred_platforms: ['mangadex'],
      };

      const result = selectResumeUrl(unifiedProgress, preferences, 'webtoon');

      expect(result).toBe('https://webtoons.com/series/456');
    });
  });

  describe('Validation of platform data', () => {
    it('should validate platform is available', () => {
      const unifiedProgress: UnifiedProgress = {
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
            updated_at: new Date().toISOString(),
            resume_url: 'https://webtoons.com/series/456',
          },
        ],
      };

      expect(isValidPlatform('mangadex', unifiedProgress)).toBe(true);
      expect(isValidPlatform('webtoon', unifiedProgress)).toBe(true);
      expect(isValidPlatform('unknown-platform', unifiedProgress)).toBe(false);
    });
  });
});

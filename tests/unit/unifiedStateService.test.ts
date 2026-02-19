import { getUnifiedProgress, getUnifiedProgressBatch } from '@/backend/services/dashboard/unifiedStateService';

describe('unifiedStateService', () => {
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

  describe('getUnifiedProgress', () => {
    it('should return null when no progress exists', async () => {
      const mockSupabase = createMockSupabase([]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress).toBeNull();
    });

    it('should return single platform progress when only one platform has data', async () => {
      const progressData = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 10,
      });

      const mockSupabase = createMockSupabase([progressData]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress).not.toBeNull();
      expect(result.progress?.platform).toBe('mangadex');
      expect(result.progress?.current_chapter).toBe(10);
      expect(result.progress?.alternatives).toHaveLength(0);
    });

    it('should select most recent progress across multiple platforms', async () => {
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
      expect(result.progress?.alternatives[0].platform).toBe('mangadex');
    });

    it('should tie-break by chapter number when timestamps are equal', async () => {
      const sameTime = new Date().toISOString();

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 10,
        updated_at: sameTime,
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 8,
        updated_at: sameTime,
      });

      const mockSupabase = createMockSupabase([mangadexProgress, webtoonProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.platform).toBe('mangadex');
      expect(result.progress?.current_chapter).toBe(10);
    });

    it('should tie-break by platform name when timestamps and chapters are equal', async () => {
      const sameTime = new Date().toISOString();

      const mangadexProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 10,
        updated_at: sameTime,
      });

      const webtoonProgress = mockProgressRow({
        platform: 'webtoon',
        chapter_number: 10,
        updated_at: sameTime,
      });

      const mockSupabase = createMockSupabase([webtoonProgress, mangadexProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.platform).toBe('mangadex');
    });

    it('should include all alternatives in response', async () => {
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

      expect(result.success).toBe(true);
      expect(result.progress?.platform).toBe('custom-site');
      expect(result.progress?.current_chapter).toBe(7);
      expect(result.progress?.alternatives).toHaveLength(2);
      expect(result.progress?.alternatives.map(a => a.platform)).toContain('webtoon');
      expect(result.progress?.alternatives.map(a => a.platform)).toContain('mangadex');
    });

    it('should filter out entries with null chapter numbers', async () => {
      const validProgress = mockProgressRow({
        chapter_number: 10,
      });

      const invalidProgress = mockProgressRow({
        chapter_number: null,
      });

      const mockSupabase = createMockSupabase([validProgress, invalidProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.current_chapter).toBe(10);
      expect(result.progress?.alternatives).toHaveLength(0);
    });

    it('should return error when database query fails', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database connection failed' },
                }),
              }),
            }),
          }),
        }),
      };
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(false);
      expect(result.progress).toBeNull();
      expect(result.error).toContain('Database connection failed');
    });

    it('should handle unexpected errors gracefully', async () => {
      const mockSupabase = {
        from: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };

      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(false);
      expect(result.progress).toBeNull();
      expect(result.error).toContain('Unexpected error');
    });

    it('should filter out invalid entries', async () => {
      const validProgress = mockProgressRow({
        platform: 'mangadex',
        chapter_number: 10,
      });

      const invalidProgress = mockProgressRow({
        platform: '',
        chapter_number: 5,
      });

      const mockSupabase = createMockSupabase([validProgress, invalidProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.platform).toBe('mangadex');
      expect(result.progress?.alternatives).toHaveLength(0);
    });

    it('should handle large chapter numbers correctly', async () => {
      const largeChapterProgress = mockProgressRow({
        chapter_number: 500,
      });

      const mockSupabase = createMockSupabase([largeChapterProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.current_chapter).toBe(500);
    });

    it('should handle decimal chapter numbers (webtoons)', async () => {
      const decimalChapterProgress = mockProgressRow({
        chapter_number: 10.5,
      });

      const mockSupabase = createMockSupabase([decimalChapterProgress]);
      const result = await getUnifiedProgress('series-456', 'user-123', mockSupabase);

      expect(result.success).toBe(true);
      expect(result.progress?.current_chapter).toBe(10.5);
    });
  });

  describe('getUnifiedProgressBatch', () => {
    it('should return map of series to progress', async () => {
      let callCount = 0;
      const mockSupabase = {
        from: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockImplementation(() => {
                  callCount++;
                  if (callCount === 1) {
                    return Promise.resolve({
                      data: [mockProgressRow({ series_id: 'series-1' })],
                      error: null,
                    });
                  } else {
                    return Promise.resolve({
                      data: [],
                      error: null,
                    });
                  }
                }),
              }),
            }),
          }),
        })),
      };

      const result = await getUnifiedProgressBatch(['series-1', 'series-2'], 'user-123', mockSupabase);

      expect(result.size).toBe(2);
      expect(result.get('series-1')).not.toBeNull();
      expect(result.get('series-2')).toBeNull();
    });

    it('should handle empty series list', async () => {
      const mockSupabase = createMockSupabase([]);
      const result = await getUnifiedProgressBatch([], 'user-123', mockSupabase);

      expect(result.size).toBe(0);
    });
  });
});

import { renderHook, act } from '@testing-library/react';
import { useSeriesStore } from '@/store/seriesStore';
import { applyFilters } from '@/lib/search';
import { SeriesStatus, UserSeries } from '@/model/schemas/dashboard';

const mockSeries: UserSeries[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Attack on Titan',
    normalized_title: 'attack on titan',
    platform: 'mangadex',
    source_url: null,
    import_id: null,
    status: SeriesStatus.READING,
    current_chapter: 50,
    total_chapters: 139,
    cover_url: 'https://example.com/aot.jpg',
    genres: ['action', 'adventure', 'supernatural'],
    progress_percentage: 36,
    last_read_at: '2026-02-18T10:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Demon Slayer',
    normalized_title: 'demon slayer',
    platform: 'mangadex',
    source_url: null,
    import_id: null,
    status: SeriesStatus.COMPLETED,
    current_chapter: 205,
    total_chapters: 205,
    cover_url: 'https://example.com/ds.jpg',
    genres: ['action', 'adventure', 'supernatural'],
    progress_percentage: 100,
    last_read_at: '2026-02-15T10:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    title: 'Solo Leveling',
    normalized_title: 'solo leveling',
    platform: 'other',
    source_url: null,
    import_id: null,
    status: SeriesStatus.ON_HOLD,
    current_chapter: 100,
    total_chapters: 200,
    cover_url: 'https://example.com/sl.jpg',
    genres: ['action', 'fantasy'],
    progress_percentage: 50,
    last_read_at: '2026-02-10T10:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  },
  {
    id: '4',
    user_id: 'user1',
    title: 'Romantic Comedy',
    normalized_title: 'romantic comedy',
    platform: 'mangadex',
    source_url: null,
    import_id: null,
    status: SeriesStatus.PLAN_TO_READ,
    current_chapter: 0,
    total_chapters: 50,
    cover_url: 'https://example.com/rc.jpg',
    genres: ['romance', 'comedy'],
    progress_percentage: 0,
    last_read_at: null,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
];

describe('Search and Filter Integration', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSeriesStore());
    act(() => {
      result.current.resetFilters();
      result.current.setSeries([]);
    });
  });

  describe('Search + Platform Filter', () => {
    it('should combine search and platform filters correctly', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('action');
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
      expect(filtered.every((s) => s.platform === 'mangadex')).toBe(true);
      expect(
        filtered.every((s) => s.genres.some((g) => g === 'action'))
      ).toBe(true);
    });

    it('should return empty when search matches but platform does not', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('attack');
        result.current.setFilters({ platforms: ['other'] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Search + Status Filter', () => {
    it('should combine search and status filters correctly', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('action');
        result.current.setFilters({ statuses: [SeriesStatus.READING] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe(SeriesStatus.READING);
    });

    it('should handle multiple status filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('action');
        result.current.setFilters({
          statuses: [SeriesStatus.READING, SeriesStatus.COMPLETED],
        });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
    });
  });

  describe('All Filters Combined', () => {
    it('should apply search, platform, and status filters together', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('action');
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Attack on Titan');
    });

    it('should return empty when no series match all filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('nonexistent');
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Filter Reset', () => {
    it('should show all series after clearing filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('action');
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      let filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);

      act(() => {
        result.current.resetFilters();
      });

      filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(4);
    });

    it('should clear search query on reset', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSearchQuery('attack');
      });

      expect(result.current.searchQuery).toBe('attack');

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchQuery).toBe('');
    });

    it('should clear all filters on reset', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      expect(result.current.filters.platforms).toEqual(['mangadex']);
      expect(result.current.filters.statuses).toEqual([SeriesStatus.READING]);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.platforms).toEqual([]);
      expect(result.current.filters.statuses).toEqual([]);
    });
  });

  describe('Dynamic Filter Updates', () => {
    it('should update results when search query changes', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('attack');
      });

      let filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);

      act(() => {
        result.current.setSearchQuery('demon');
      });

      filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Demon Slayer');
    });

    it('should update results when platform filter changes', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      let filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(3);

      act(() => {
        result.current.setFilters({ platforms: ['other'] });
      });

      filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Solo Leveling');
    });

    it('should update results when status filter changes', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setFilters({ statuses: [SeriesStatus.READING] });
      });

      let filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);

      act(() => {
        result.current.setFilters({
          statuses: [SeriesStatus.READING, SeriesStatus.COMPLETED],
        });
      });

      filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Complex Filtering Scenarios', () => {
    it('should handle genre-based search with platform filter', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('supernatural');
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((s) => s.genres.includes('supernatural'))
      ).toBe(true);
    });

    it('should handle platform-based search', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('mangadex');
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(3);
      expect(filtered.every((s) => s.platform === 'mangadex')).toBe(true);
    });

    it('should handle partial title search with multiple filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('on');
        result.current.setFilters({
          platforms: ['mangadex', 'other'],
          statuses: [SeriesStatus.READING, SeriesStatus.ON_HOLD],
        });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty series array', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries([]);
        result.current.setSearchQuery('attack');
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty search query', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('');
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(4);
    });

    it('should handle case-insensitive search with filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('ATTACK');
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Attack on Titan');
    });
  });
});

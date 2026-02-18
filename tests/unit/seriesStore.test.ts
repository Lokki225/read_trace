import { renderHook, act } from '@testing-library/react';
import { useSeriesStore } from '@/store/seriesStore';
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
    genres: ['action', 'adventure'],
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
    genres: ['action', 'adventure'],
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
];

describe('Series Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSeriesStore());
    act(() => {
      result.current.resetFilters();
      result.current.setSeries([]);
    });
  });

  describe('setSeries', () => {
    it('should set series data', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
      });

      expect(result.current.series).toEqual(mockSeries);
    });

    it('should replace existing series', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
      });

      expect(result.current.series).toHaveLength(3);

      act(() => {
        result.current.setSeries([mockSeries[0]]);
      });

      expect(result.current.series).toHaveLength(1);
      expect(result.current.series[0].title).toBe('Attack on Titan');
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSearchQuery('attack');
      });

      expect(result.current.searchQuery).toBe('attack');
    });

    it('should update search query', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSearchQuery('attack');
      });

      expect(result.current.searchQuery).toBe('attack');

      act(() => {
        result.current.setSearchQuery('demon');
      });

      expect(result.current.searchQuery).toBe('demon');
    });

    it('should allow empty search query', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSearchQuery('attack');
      });

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('setFilters', () => {
    it('should set platform filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      expect(result.current.filters.platforms).toEqual(['mangadex']);
    });

    it('should set status filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({ statuses: [SeriesStatus.READING] });
      });

      expect(result.current.filters.statuses).toEqual([SeriesStatus.READING]);
    });

    it('should set both platform and status filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      expect(result.current.filters.platforms).toEqual(['mangadex']);
      expect(result.current.filters.statuses).toEqual([SeriesStatus.READING]);
    });

    it('should update filters without replacing unspecified filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      act(() => {
        result.current.setFilters({ platforms: ['other'] });
      });

      expect(result.current.filters.platforms).toEqual(['other']);
      expect(result.current.filters.statuses).toEqual([SeriesStatus.READING]);
    });

    it('should allow multiple platform filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({
          platforms: ['mangadex', 'other'],
        });
      });

      expect(result.current.filters.platforms).toEqual(['mangadex', 'other']);
    });

    it('should allow multiple status filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setFilters({
          statuses: [SeriesStatus.READING, SeriesStatus.COMPLETED],
        });
      });

      expect(result.current.filters.statuses).toEqual([
        SeriesStatus.READING,
        SeriesStatus.COMPLETED,
      ]);
    });
  });

  describe('resetFilters', () => {
    it('should reset search query and filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSearchQuery('attack');
        result.current.setFilters({
          platforms: ['mangadex'],
          statuses: [SeriesStatus.READING],
        });
      });

      expect(result.current.searchQuery).toBe('attack');
      expect(result.current.filters.platforms).toEqual(['mangadex']);
      expect(result.current.filters.statuses).toEqual([SeriesStatus.READING]);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.filters.platforms).toEqual([]);
      expect(result.current.filters.statuses).toEqual([]);
    });

    it('should not affect series data', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('attack');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.series).toEqual(mockSeries);
    });
  });

  describe('getFilteredSeries', () => {
    it('should return all series when no filters applied', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(3);
    });

    it('should filter by search query', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('attack');
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Attack on Titan');
    });

    it('should filter by platform', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
      expect(filtered.every((s) => s.platform === 'mangadex')).toBe(true);
    });

    it('should filter by status', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setFilters({ statuses: [SeriesStatus.READING] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe(SeriesStatus.READING);
    });

    it('should combine search and platform filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('action');
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);
      expect(filtered.every((s) => s.platform === 'mangadex')).toBe(true);
    });

    it('should combine all filters', () => {
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

    it('should return empty array when no series match filters', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setSearchQuery('nonexistent');
      });

      const filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(0);
    });

    it('should update filtered results when search query changes', () => {
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

    it('should update filtered results when filters change', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setSeries(mockSeries);
        result.current.setFilters({ platforms: ['mangadex'] });
      });

      let filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(2);

      act(() => {
        result.current.setFilters({ platforms: ['other'] });
      });

      filtered = result.current.getFilteredSeries();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Solo Leveling');
    });
  });
});

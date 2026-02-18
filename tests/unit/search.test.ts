import {
  normalizeQuery,
  searchSeries,
  filterByPlatforms,
  filterByStatuses,
  applyFilters,
} from '@/lib/search';
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

describe('Search Utilities', () => {
  describe('normalizeQuery', () => {
    it('should convert to lowercase', () => {
      expect(normalizeQuery('ATTACK')).toBe('attack');
    });

    it('should trim whitespace', () => {
      expect(normalizeQuery('  attack  ')).toBe('attack');
    });

    it('should handle empty strings', () => {
      expect(normalizeQuery('')).toBe('');
    });

    it('should handle mixed case with spaces', () => {
      expect(normalizeQuery('  Attack On Titan  ')).toBe('attack on titan');
    });
  });

  describe('searchSeries', () => {
    it('should return all series when query is empty', () => {
      const results = searchSeries(mockSeries, '');
      expect(results).toHaveLength(4);
    });

    it('should return all series when query is whitespace only', () => {
      const results = searchSeries(mockSeries, '   ');
      expect(results).toHaveLength(4);
    });

    it('should match series by title case-insensitively', () => {
      const results = searchSeries(mockSeries, 'attack');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Attack on Titan');
    });

    it('should match partial title', () => {
      const results = searchSeries(mockSeries, 'attack on');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Attack on Titan');
    });

    it('should match series by genre', () => {
      const results = searchSeries(mockSeries, 'romance');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Romantic Comedy');
    });

    it('should match series by platform', () => {
      const results = searchSeries(mockSeries, 'mangadex');
      expect(results).toHaveLength(3);
    });

    it('should match multiple series with same genre', () => {
      const results = searchSeries(mockSeries, 'action');
      expect(results).toHaveLength(3);
    });

    it('should be case-insensitive for genre matching', () => {
      const results = searchSeries(mockSeries, 'ACTION');
      expect(results).toHaveLength(3);
    });

    it('should return empty array when no matches found', () => {
      const results = searchSeries(mockSeries, 'nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should match partial genre names', () => {
      const results = searchSeries(mockSeries, 'adv');
      expect(results).toHaveLength(2);
    });
  });

  describe('filterByPlatforms', () => {
    it('should return all series when platforms array is empty', () => {
      const results = filterByPlatforms(mockSeries, []);
      expect(results).toHaveLength(4);
    });

    it('should filter by single platform', () => {
      const results = filterByPlatforms(mockSeries, ['mangadex']);
      expect(results).toHaveLength(3);
      expect(results.every((s) => s.platform === 'mangadex')).toBe(true);
    });

    it('should filter by multiple platforms', () => {
      const results = filterByPlatforms(mockSeries, ['mangadex', 'other']);
      expect(results).toHaveLength(4);
    });

    it('should return empty array when no series match platform', () => {
      const results = filterByPlatforms(mockSeries, ['nonexistent']);
      expect(results).toHaveLength(0);
    });

    it('should filter by other platform', () => {
      const results = filterByPlatforms(mockSeries, ['other']);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Solo Leveling');
    });
  });

  describe('filterByStatuses', () => {
    it('should return all series when statuses array is empty', () => {
      const results = filterByStatuses(mockSeries, []);
      expect(results).toHaveLength(4);
    });

    it('should filter by single status', () => {
      const results = filterByStatuses(mockSeries, [SeriesStatus.READING]);
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe(SeriesStatus.READING);
    });

    it('should filter by multiple statuses', () => {
      const results = filterByStatuses(mockSeries, [
        SeriesStatus.READING,
        SeriesStatus.COMPLETED,
      ]);
      expect(results).toHaveLength(2);
    });

    it('should filter by all statuses', () => {
      const results = filterByStatuses(mockSeries, [
        SeriesStatus.READING,
        SeriesStatus.COMPLETED,
        SeriesStatus.ON_HOLD,
        SeriesStatus.PLAN_TO_READ,
      ]);
      expect(results).toHaveLength(4);
    });

    it('should return empty array when no series match status', () => {
      const results = filterByStatuses(mockSeries, []);
      expect(results).toHaveLength(4);
    });
  });

  describe('applyFilters', () => {
    it('should return all series with empty filters', () => {
      const results = applyFilters(mockSeries, {});
      expect(results).toHaveLength(4);
    });

    it('should apply search query only', () => {
      const results = applyFilters(mockSeries, { searchQuery: 'attack' });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Attack on Titan');
    });

    it('should apply platform filter only', () => {
      const results = applyFilters(mockSeries, { platforms: ['mangadex'] });
      expect(results).toHaveLength(3);
    });

    it('should apply status filter only', () => {
      const results = applyFilters(mockSeries, {
        statuses: [SeriesStatus.READING],
      });
      expect(results).toHaveLength(1);
    });

    it('should combine search and platform filters (AND logic)', () => {
      const results = applyFilters(mockSeries, {
        searchQuery: 'action',
        platforms: ['mangadex'],
      });
      expect(results).toHaveLength(2);
      expect(results.every((s) => s.platform === 'mangadex')).toBe(true);
    });

    it('should combine search and status filters (AND logic)', () => {
      const results = applyFilters(mockSeries, {
        searchQuery: 'action',
        statuses: [SeriesStatus.READING, SeriesStatus.COMPLETED],
      });
      expect(results).toHaveLength(2);
    });

    it('should combine all three filters (AND logic)', () => {
      const results = applyFilters(mockSeries, {
        searchQuery: 'action',
        platforms: ['mangadex'],
        statuses: [SeriesStatus.READING],
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Attack on Titan');
    });

    it('should return empty array when no series match all filters', () => {
      const results = applyFilters(mockSeries, {
        searchQuery: 'attack',
        platforms: ['other'],
      });
      expect(results).toHaveLength(0);
    });

    it('should handle complex filter combinations', () => {
      const results = applyFilters(mockSeries, {
        searchQuery: 'adventure',
        platforms: ['mangadex', 'other'],
        statuses: [SeriesStatus.READING, SeriesStatus.ON_HOLD],
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Attack on Titan');
    });
  });
});

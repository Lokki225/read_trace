import { UserSeries, SeriesStatus } from '@/model/schemas/dashboard';
import { SearchFilters } from '@/model/schemas/search';

export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

export function searchSeries(
  series: UserSeries[],
  searchQuery: string
): UserSeries[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return series;
  }

  const normalized = normalizeQuery(searchQuery);

  return series.filter((s) => {
    const titleMatch = normalizeQuery(s.title).includes(normalized);
    const platformMatch = normalizeQuery(s.platform).includes(normalized);
    const genreMatch = s.genres.some((genre) =>
      normalizeQuery(genre).includes(normalized)
    );

    return titleMatch || platformMatch || genreMatch;
  });
}

export function filterByPlatforms(
  series: UserSeries[],
  platforms: string[]
): UserSeries[] {
  if (!platforms || platforms.length === 0) {
    return series;
  }

  return series.filter((s) => platforms.includes(s.platform));
}

export function filterByStatuses(
  series: UserSeries[],
  statuses: SeriesStatus[]
): UserSeries[] {
  if (!statuses || statuses.length === 0) {
    return series;
  }

  return series.filter((s) => statuses.includes(s.status));
}

export function applyFilters(
  series: UserSeries[],
  filters: Partial<SearchFilters>
): UserSeries[] {
  let result = series;

  if (filters.searchQuery) {
    result = searchSeries(result, filters.searchQuery);
  }

  if (filters.platforms && filters.platforms.length > 0) {
    result = filterByPlatforms(result, filters.platforms);
  }

  if (filters.statuses && filters.statuses.length > 0) {
    result = filterByStatuses(result, filters.statuses);
  }

  return result;
}

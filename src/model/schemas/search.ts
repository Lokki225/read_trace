import { SeriesStatus, UserSeries } from './dashboard';

export interface SearchQuery {
  text: string;
}

export interface FilterState {
  platforms: string[];
  statuses: SeriesStatus[];
}

export interface SearchFilters extends FilterState {
  searchQuery: string;
}

export interface SearchResult {
  series: UserSeries[];
  totalCount: number;
  filteredCount: number;
}

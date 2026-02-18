export interface InfiniteScrollState {
  series: any[];
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export interface PaginationParams {
  offset: number;
  limit: number;
  status?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
}

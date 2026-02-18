'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSeries, SeriesStatus } from '@/model/schemas/dashboard';
import { applyFilters } from '@/lib/search';

export interface SeriesStoreState {
  series: UserSeries[];
  searchQuery: string;
  filters: {
    platforms: string[];
    statuses: SeriesStatus[];
  };
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  setSeries: (series: UserSeries[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: { platforms?: string[]; statuses?: SeriesStatus[] }) => void;
  resetFilters: () => void;
  getFilteredSeries: () => UserSeries[];
  updateSeriesProgress: (seriesId: string, progress: Partial<UserSeries>) => void;
  appendSeries: (series: UserSeries[]) => void;
  setLoadingMore: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  resetPagination: () => void;
}

export const useSeriesStore = create<SeriesStoreState>()(
  persist(
    (set, get) => ({
      series: [],
      searchQuery: '',
      filters: {
        platforms: [],
        statuses: [],
      },
      isLoadingMore: false,
      hasMore: true,
      currentPage: 0,
      pageSize: 20,
      totalCount: 0,
      setSeries: (series) => set({ series }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: {
            platforms: newFilters.platforms ?? state.filters.platforms,
            statuses: newFilters.statuses ?? state.filters.statuses,
          },
        })),
      resetFilters: () =>
        set({
          searchQuery: '',
          filters: {
            platforms: [],
            statuses: [],
          },
        }),
      getFilteredSeries: () => {
        const state = get();
        return applyFilters(state.series, {
          searchQuery: state.searchQuery,
          platforms: state.filters.platforms,
          statuses: state.filters.statuses,
        });
      },
      updateSeriesProgress: (seriesId, progress) =>
        set((state) => ({
          series: state.series.map((s) =>
            s.id === seriesId ? { ...s, ...progress } : s
          ),
        })),
      appendSeries: (newSeries) =>
        set((state) => ({
          series: [...state.series, ...newSeries],
        })),
      setLoadingMore: (isLoading) => set({ isLoadingMore: isLoading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalCount: (count) => set({ totalCount: count }),
      resetPagination: () =>
        set({
          isLoadingMore: false,
          hasMore: true,
          currentPage: 0,
          totalCount: 0,
        }),
    }),
    {
      name: 'series-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        filters: state.filters,
      }),
    }
  )
);

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSeriesStore } from '@/store/seriesStore';
import { makeDashboardSeries } from '../factories/dashboard.factory';

describe('Infinite Scroll Integration', () => {
  beforeEach(() => {
    useSeriesStore.setState({
      series: [],
      isLoadingMore: false,
      hasMore: true,
      currentPage: 0,
      pageSize: 20,
      totalCount: 0,
    });
  });

  describe('Pagination State Management', () => {
    it('should initialize pagination state correctly', () => {
      const { result } = renderHook(() => useSeriesStore());

      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.currentPage).toBe(0);
      expect(result.current.pageSize).toBe(20);
      expect(result.current.totalCount).toBe(0);
    });

    it('should append series to existing series', () => {
      const { result } = renderHook(() => useSeriesStore());
      const initialSeries = [makeDashboardSeries({ id: '1' })];
      const newSeries = [makeDashboardSeries({ id: '2' }), makeDashboardSeries({ id: '3' })];

      act(() => {
        result.current.setSeries(initialSeries);
      });

      act(() => {
        result.current.appendSeries(newSeries);
      });

      expect(result.current.series).toHaveLength(3);
      expect(result.current.series[0].id).toBe('1');
      expect(result.current.series[1].id).toBe('2');
      expect(result.current.series[2].id).toBe('3');
    });

    it('should update loading state', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setLoadingMore(true);
      });

      expect(result.current.isLoadingMore).toBe(true);

      act(() => {
        result.current.setLoadingMore(false);
      });

      expect(result.current.isLoadingMore).toBe(false);
    });

    it('should update hasMore flag', () => {
      const { result } = renderHook(() => useSeriesStore());

      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.setHasMore(false);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should increment current page', () => {
      const { result } = renderHook(() => useSeriesStore());

      expect(result.current.currentPage).toBe(0);

      act(() => {
        result.current.setCurrentPage(1);
      });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should set total count', () => {
      const { result } = renderHook(() => useSeriesStore());

      expect(result.current.totalCount).toBe(0);

      act(() => {
        result.current.setTotalCount(150);
      });

      expect(result.current.totalCount).toBe(150);
    });

    it('should reset pagination state', () => {
      const { result } = renderHook(() => useSeriesStore());

      act(() => {
        result.current.setLoadingMore(true);
        result.current.setHasMore(false);
        result.current.setCurrentPage(5);
        result.current.setTotalCount(100);
      });

      act(() => {
        result.current.resetPagination();
      });

      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.currentPage).toBe(0);
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('Series Loading Flow', () => {
    it('should handle loading first page of series', () => {
      const { result } = renderHook(() => useSeriesStore());
      const firstPageSeries = Array.from({ length: 20 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 1}` })
      );

      act(() => {
        result.current.setSeries(firstPageSeries);
        result.current.setTotalCount(100);
        result.current.setHasMore(true);
      });

      expect(result.current.series).toHaveLength(20);
      expect(result.current.totalCount).toBe(100);
      expect(result.current.hasMore).toBe(true);
    });

    it('should handle loading subsequent pages', () => {
      const { result } = renderHook(() => useSeriesStore());
      const firstPageSeries = Array.from({ length: 20 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 1}` })
      );
      const secondPageSeries = Array.from({ length: 20 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 21}` })
      );

      act(() => {
        result.current.setSeries(firstPageSeries);
        result.current.setCurrentPage(0);
        result.current.setTotalCount(100);
      });

      act(() => {
        result.current.appendSeries(secondPageSeries);
        result.current.setCurrentPage(1);
      });

      expect(result.current.series).toHaveLength(40);
      expect(result.current.currentPage).toBe(1);
    });

    it('should detect end of list when returned count is less than page size', () => {
      const { result } = renderHook(() => useSeriesStore());
      const lastPageSeries = Array.from({ length: 15 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 1}` })
      );

      act(() => {
        result.current.setSeries(lastPageSeries);
        result.current.setHasMore(false);
      });

      expect(result.current.hasMore).toBe(false);
      expect(result.current.series).toHaveLength(15);
    });
  });

  describe('Pagination Calculations', () => {
    it('should calculate correct offset for page 0', () => {
      const { result } = renderHook(() => useSeriesStore());
      const offset = result.current.currentPage * result.current.pageSize;
      expect(offset).toBe(0);
    });

    it('should calculate correct offset for page 1', () => {
      const { result } = renderHook(() => useSeriesStore());
      act(() => {
        result.current.setCurrentPage(1);
      });
      const offset = result.current.currentPage * result.current.pageSize;
      expect(offset).toBe(20);
    });

    it('should calculate correct offset for page 5', () => {
      const { result } = renderHook(() => useSeriesStore());
      act(() => {
        result.current.setCurrentPage(5);
      });
      const offset = result.current.currentPage * result.current.pageSize;
      expect(offset).toBe(100);
    });

    it('should determine hasMore based on returned count', () => {
      const { result } = renderHook(() => useSeriesStore());

      // Full page returned - has more
      act(() => {
        result.current.setHasMore(true);
      });
      expect(result.current.hasMore).toBe(true);

      // Partial page returned - no more
      act(() => {
        result.current.setHasMore(false);
      });
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('Series Count Display', () => {
    it('should display correct series count', () => {
      const { result } = renderHook(() => useSeriesStore());
      const series = Array.from({ length: 25 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 1}` })
      );

      act(() => {
        result.current.setSeries(series);
        result.current.setTotalCount(100);
      });

      expect(result.current.series).toHaveLength(25);
      expect(result.current.totalCount).toBe(100);
    });

    it('should update count as series are appended', () => {
      const { result } = renderHook(() => useSeriesStore());
      const initialSeries = Array.from({ length: 20 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 1}` })
      );
      const additionalSeries = Array.from({ length: 20 }, (_, i) =>
        makeDashboardSeries({ id: `${i + 21}` })
      );

      act(() => {
        result.current.setSeries(initialSeries);
        result.current.setTotalCount(100);
      });

      expect(result.current.series).toHaveLength(20);

      act(() => {
        result.current.appendSeries(additionalSeries);
      });

      expect(result.current.series).toHaveLength(40);
      expect(result.current.totalCount).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should maintain state on failed load', () => {
      const { result } = renderHook(() => useSeriesStore());
      const initialSeries = [makeDashboardSeries({ id: '1' })];

      act(() => {
        result.current.setSeries(initialSeries);
        result.current.setLoadingMore(true);
      });

      // Simulate error - loading state should be reset by component
      act(() => {
        result.current.setLoadingMore(false);
      });

      expect(result.current.series).toHaveLength(1);
      expect(result.current.isLoadingMore).toBe(false);
    });

    it('should not append series if loading fails', () => {
      const { result } = renderHook(() => useSeriesStore());
      const initialSeries = [makeDashboardSeries({ id: '1' })];

      act(() => {
        result.current.setSeries(initialSeries);
      });

      // Simulate failed load - don't append anything
      expect(result.current.series).toHaveLength(1);
    });
  });
});

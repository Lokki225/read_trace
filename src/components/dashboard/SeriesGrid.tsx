'use client';

import { UserSeries } from '@/model/schemas/dashboard';
import { SeriesCard } from './SeriesCard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { LoadingIndicator } from './LoadingIndicator';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface SeriesGridProps {
  series: UserSeries[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalCount?: number;
  className?: string;
  onCardClick?: (series: UserSeries) => void;
  onLoadMore?: () => void;
}

export function SeriesGrid({
  series,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  totalCount = 0,
  className = '',
  onCardClick,
  onLoadMore,
}: SeriesGridProps) {
  const observerTarget = useInfiniteScroll(
    () => {
      if (onLoadMore && hasMore && !isLoadingMore) {
        onLoadMore();
      }
    },
    { threshold: 200 }
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        data-testid="series-grid"
        className={[
          'grid gap-4',
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
          className,
        ].join(' ')}
      >
        {series.map((item, index) => (
          <SeriesCard
            key={item.id}
            series={item}
            index={index}
            onClick={onCardClick}
          />
        ))}
      </div>

      {series.length > 0 && (
        <div className="flex items-center justify-center py-4 text-sm text-gray-600">
          {totalCount > 0 && (
            <span>
              Showing {series.length} of {totalCount} series
            </span>
          )}
        </div>
      )}

      <LoadingIndicator isLoading={isLoadingMore} />

      {hasMore && <div ref={observerTarget} className="h-4" data-testid="infinite-scroll-trigger" />}

      {!hasMore && series.length > 0 && (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <span>No more series to load</span>
        </div>
      )}
    </div>
  );
}

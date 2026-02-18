'use client';

import { useEffect } from 'react';
import { SeriesStatus, UserSeries } from '@/model/schemas/dashboard';
import { EmptyState } from './EmptyState';
import { SeriesGrid } from './SeriesGrid';
import { useSeriesStore } from '@/store/seriesStore';
import { getScrollPosition, saveScrollPosition } from '@/lib/scrollPosition';

interface TabPanelProps {
  series: UserSeries[];
  tabId: string;
  labelId: string;
  status: SeriesStatus;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalCount?: number;
  onLoadMore?: () => void;
}

export function TabPanel({
  series,
  tabId,
  labelId,
  status,
  isLoadingMore = false,
  hasMore = false,
  totalCount = 0,
  onLoadMore,
}: TabPanelProps) {
  useEffect(() => {
    const savedPosition = getScrollPosition(status);
    if (savedPosition > 0) {
      window.scrollTo(0, savedPosition);
    }
  }, [status]);

  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition(status, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [status]);

  return (
    <div role="tabpanel" id={tabId} aria-labelledby={labelId} className="mt-6">
      {series.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <SeriesGrid
          series={series}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          totalCount={totalCount}
          onLoadMore={onLoadMore}
        />
      )}
    </div>
  );
}

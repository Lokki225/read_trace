'use client';

import { useState, useRef, KeyboardEvent, useEffect, useCallback } from 'react';
import { DashboardData, SeriesStatus } from '@/model/schemas/dashboard';
import {
  getTabConfigs,
  getSeriesForStatus,
  getTabLabel,
} from '@/backend/services/dashboard/dashboardDomain';
import { TabPanel } from './TabPanel';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { useSeriesStore } from '@/store/seriesStore';

interface DashboardTabsProps {
  data: DashboardData;
}

export function DashboardTabs({ data }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<SeriesStatus>(SeriesStatus.READING);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabConfigs = getTabConfigs();
  const {
    setSeries,
    getFilteredSeries,
    appendSeries,
    setLoadingMore,
    setHasMore,
    setCurrentPage,
    setTotalCount,
    isLoadingMore,
    hasMore,
    currentPage,
    totalCount,
  } = useSeriesStore();

  // Combine all series from all tabs and set in store
  useEffect(() => {
    const allSeries = [
      ...data.reading,
      ...data.completed,
      ...data.on_hold,
      ...data.plan_to_read,
    ];
    setSeries(allSeries);
    setTotalCount(allSeries.length);
  }, [data, setSeries, setTotalCount]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const offset = currentPage * 20;
      const response = await fetch(
        `/api/series?offset=${offset}&limit=20&status=${activeTab}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Series API error (${response.status}):`, errorData);
        throw new Error(`Failed to load more series: ${response.status} ${response.statusText}`);
      }

      const { data: newSeries, hasMore: moreAvailable, total } = await response.json();

      appendSeries(newSeries);
      setHasMore(moreAvailable);
      setCurrentPage(currentPage + 1);
      setTotalCount(total);
    } catch (error) {
      console.error('Error loading more series:', error);
      setLoadingMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    currentPage,
    activeTab,
    appendSeries,
    setHasMore,
    setCurrentPage,
    setTotalCount,
    setLoadingMore,
  ]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabConfigs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabConfigs.length) % tabConfigs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabConfigs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      tabRefs.current[nextIndex]?.focus();
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabConfigs[index].status);
    }
  };

  // Get filtered series - if status filters are active, show filtered series regardless of tab
  // Otherwise, filter by active tab status
  const allFiltered = getFilteredSeries();
  const { filters, searchQuery } = useSeriesStore();
  const hasStatusFilter = filters.statuses.length > 0;
  const hasPlatformFilter = filters.platforms.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasAnyFilter = hasStatusFilter || hasPlatformFilter || hasSearchQuery;
  
  const filteredSeries = hasStatusFilter
    ? allFiltered
    : allFiltered.filter((s) => s.status === activeTab);

  // Generate results header text
  const getResultsHeader = () => {
    if (!hasAnyFilter) return null;

    const parts: string[] = [];
    
    if (hasSearchQuery) {
      parts.push(`Search results for "${searchQuery}"`);
    }
    
    if (hasPlatformFilter || hasStatusFilter) {
      const filterParts: string[] = [];
      if (hasPlatformFilter) {
        filterParts.push(`Platform: ${filters.platforms.join(', ')}`);
      }
      if (hasStatusFilter) {
        const statusLabels = filters.statuses.map((s) => getTabLabel(s));
        filterParts.push(`Status: ${statusLabels.join(', ')}`);
      }
      parts.push(filterParts.join(' • '));
    }

    return parts.join(' • ');
  };

  const resultsHeader = getResultsHeader();

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchBar />
        </div>
        <FilterPanel />
      </div>

      {/* Tabs - Only show when no filters applied */}
      {!hasAnyFilter && (
        <div
          role="tablist"
          aria-label="Series reading status"
          className="flex overflow-x-auto border-b border-[#FFEDE3]"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabConfigs.map((tab, index) => {
            const isActive = activeTab === tab.status;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                id={tab.id}
                aria-selected={isActive}
                aria-controls={tab.panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.status)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={[
                  'shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  'min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:ring-inset',
                  isActive
                    ? 'text-[#FF7A45] border-b-2 border-[#FF7A45]'
                    : 'text-[#6C757D] hover:text-[#222222] border-b-2 border-transparent',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Header - Show when filters are applied */}
      {resultsHeader && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Filtered Results:</span> {resultsHeader}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {filteredSeries.length} {filteredSeries.length === 1 ? 'series' : 'series'} found
          </p>
        </div>
      )}

      {/* Tab Panels with Filtered Series */}
      {hasAnyFilter ? (
        <TabPanel
          key="filtered"
          series={filteredSeries}
          tabId="filtered-panel"
          labelId="filtered-label"
          status={activeTab}
        />
      ) : (
        tabConfigs.map((tab) =>
          activeTab === tab.status ? (
            <TabPanel
              key={tab.status}
              series={filteredSeries}
              tabId={tab.panelId}
              labelId={tab.id}
              status={tab.status}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              totalCount={totalCount}
              onLoadMore={handleLoadMore}
            />
          ) : null
        )
      )}
    </div>
  );
}

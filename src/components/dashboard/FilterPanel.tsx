'use client';

import { useState, useEffect } from 'react';
import { useSeriesStore } from '@/store/seriesStore';
import { SeriesStatus } from '@/model/schemas/dashboard';
import { ChevronDown, X } from 'lucide-react';
import { CustomSite } from '@/types/preferences';

const BUILT_IN_PLATFORMS = ['mangadex', 'other'];

const STATUS_OPTIONS = [
  { value: SeriesStatus.READING, label: 'Reading' },
  { value: SeriesStatus.COMPLETED, label: 'Completed' },
  { value: SeriesStatus.ON_HOLD, label: 'On Hold' },
  { value: SeriesStatus.PLAN_TO_READ, label: 'Plan to Read' },
];

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [customSites, setCustomSites] = useState<CustomSite[]>([]);
  const [loadingCustomSites, setLoadingCustomSites] = useState(true);
  const { filters, setFilters, resetFilters } = useSeriesStore();

  // Fetch custom sites on mount
  useEffect(() => {
    const fetchCustomSites = async () => {
      try {
        const response = await fetch('/api/user/custom-sites');
        if (response.ok) {
          const data = await response.json();
          setCustomSites(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch custom sites:', err);
      } finally {
        setLoadingCustomSites(false);
      }
    };

    fetchCustomSites();
  }, []);

  const handlePlatformChange = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter((p) => p !== platform)
      : [...filters.platforms, platform];

    setFilters({ platforms: newPlatforms });
  };

  const handleStatusChange = (status: SeriesStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    setFilters({ statuses: newStatuses });
  };

  const hasActiveFilters =
    filters.platforms.length > 0 || filters.statuses.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Toggle filters"
        type="button"
      >
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
            {filters.platforms.length + filters.statuses.length}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-4">
            {/* Platform Filters */}
            <div className="mb-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Platform
              </h3>
              {loadingCustomSites ? (
                <p className="text-sm text-gray-500 italic">Loading platforms...</p>
              ) : (
                <div className="space-y-2">
                  {/* Built-in platforms */}
                  {BUILT_IN_PLATFORMS.map((platform) => (
                    <label
                      key={platform}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.platforms.includes(platform)}
                        onChange={() => handlePlatformChange(platform)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        aria-label={`Filter by ${platform}`}
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {platform}
                      </span>
                    </label>
                  ))}

                  {/* Custom sites */}
                  {customSites.length > 0 && (
                    <>
                      <div className="my-2 border-t border-gray-200" />
                      {customSites.map((site) => (
                        <label
                          key={site.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.platforms.includes(site.id)}
                            onChange={() => handlePlatformChange(site.id)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            aria-label={`Filter by ${site.name}`}
                          />
                          <span className="text-sm text-gray-700">{site.name}</span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Status Filters */}
            <div className="mb-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Status
              </h3>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(value)}
                      onChange={() => handleStatusChange(value)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      aria-label={`Filter by ${label}`}
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  resetFilters();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                type="button"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { DashboardData, SeriesStatus } from '@/model/schemas/dashboard';
import {
  getTabConfigs,
  getSeriesForStatus,
} from '@/backend/services/dashboard/dashboardDomain';
import { TabPanel } from './TabPanel';

interface DashboardTabsProps {
  data: DashboardData;
}

export function DashboardTabs({ data }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<SeriesStatus>(SeriesStatus.READING);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabConfigs = getTabConfigs();

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

  return (
    <div>
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

      {tabConfigs.map((tab) =>
        activeTab === tab.status ? (
          <TabPanel
            key={tab.status}
            series={getSeriesForStatus(data, tab.status)}
            tabId={tab.panelId}
            labelId={tab.id}
            status={tab.status}
          />
        ) : null
      )}
    </div>
  );
}

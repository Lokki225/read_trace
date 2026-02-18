# Implementation Tasks - Phase 3: Presentation Layer

**Feature**: Dashboard Layout with Tabbed Interface
**Phase**: Presentation Layer (React Components & Dashboard Page)
**Dependencies**: Phase 1 and Phase 2 complete
**Estimated Duration**: 1 day

## Phase Overview

Phase 3 builds all React components for the dashboard: the tabbed navigation, tab panels, empty states, loading skeleton, and the dashboard page itself. All components follow WCAG 2.1 AA accessibility standards, use the ReadTrace brand color palette, and are fully responsive.

## Phase Completion Criteria

- [ ] `DashboardTabs` client component with full keyboard navigation
- [ ] `TabPanel` component with correct ARIA attributes
- [ ] `EmptyState` component with per-tab messages and CTA
- [ ] `DashboardSkeleton` loading component
- [ ] `src/app/dashboard/page.tsx` wired to query service
- [ ] All components unit tested (>80% coverage)
- [ ] Responsive design verified at 320px, 768px, 1280px
- [ ] axe-core accessibility tests pass with zero violations
- [ ] `npm run type-check` passes with zero errors

---

## Task 3.1: Create DashboardSkeleton Loading Component

**File**: `src/components/dashboard/DashboardSkeleton.tsx`

**Description**: Create a loading skeleton that displays while series data is being fetched. The skeleton should approximate the layout of the real dashboard to prevent layout shift.

**Acceptance Criteria**:
- Renders skeleton tab bar with 4 placeholder tabs
- Renders 6 skeleton series card placeholders
- Has `role="status"` and `aria-busy="true"` for screen readers
- Uses Tailwind `animate-pulse` for loading animation
- Uses brand color palette (Background Cream, Card Peach)
- Has `data-testid="skeleton-tabs"` and `data-testid="skeleton-card"` for testing

**Implementation Details**:
```tsx
// src/components/dashboard/DashboardSkeleton.tsx

export function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading your series library">
      {/* Skeleton tab bar */}
      <div
        data-testid="skeleton-tabs"
        className="flex gap-2 border-b border-[#FFEDE3] mb-6"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-t bg-[#FFEDE3] animate-pulse"
          />
        ))}
      </div>

      {/* Skeleton series cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            data-testid="skeleton-card"
            className="rounded-lg bg-[#FFEDE3] animate-pulse"
            style={{ height: '200px' }}
          />
        ))}
      </div>

      <span className="sr-only">Loading series library...</span>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- DashboardSkeleton.test.tsx
```

**Dependencies**: Phase 1 (types only)

**Estimated Time**: 30 minutes

---

## Task 3.2: Create EmptyState Component

**File**: `src/components/dashboard/EmptyState.tsx`

**Description**: Create a per-tab empty state component that displays an encouraging message and a call-to-action when a tab has no series. The message must be specific to each status.

**Acceptance Criteria**:
- Accepts `status: SeriesStatus` prop
- Renders status-specific encouraging message
- Renders a CTA link appropriate to the status
- For "Reading" and "Plan to Read": CTA links to `/onboarding/import`
- For "Completed" and "On Hold": CTA links to `/dashboard` (manage existing series)
- Uses brand color palette
- Accessible: CTA has descriptive `aria-label`

**Implementation Details**:
```tsx
// src/components/dashboard/EmptyState.tsx

'use client';

import Link from 'next/link';
import { SeriesStatus } from '@/model/schemas/dashboard';

interface EmptyStateProps {
  status: SeriesStatus;
}

const EMPTY_STATE_CONFIG: Record<
  SeriesStatus,
  { message: string; cta: string; href: string }
> = {
  [SeriesStatus.READING]: {
    message: "No series being read yet. Start your reading journey!",
    cta: "Import your reading history",
    href: "/onboarding/import",
  },
  [SeriesStatus.COMPLETED]: {
    message: "No completed series yet. Keep reading!",
    cta: "Browse your reading list",
    href: "/dashboard",
  },
  [SeriesStatus.ON_HOLD]: {
    message: "No series on hold. Good to know you're keeping up!",
    cta: "View your reading list",
    href: "/dashboard",
  },
  [SeriesStatus.PLAN_TO_READ]: {
    message: "No series planned yet. Add some to your reading list!",
    cta: "Import series to plan",
    href: "/onboarding/import",
  },
};

export function EmptyState({ status }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[status];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">📚</div>
      <p className="text-[#222222] text-lg font-medium mb-2">
        {config.message}
      </p>
      <Link
        href={config.href}
        className="mt-4 inline-block px-6 py-3 bg-[#FF7A45] text-white rounded-lg font-medium hover:bg-[#e86a35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:ring-offset-2"
        aria-label={config.cta}
      >
        {config.cta}
      </Link>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- EmptyState.test.tsx
```

**Dependencies**: Phase 1 (SeriesStatus enum)

**Estimated Time**: 45 minutes

---

## Task 3.3: Create TabPanel Component

**File**: `src/components/dashboard/TabPanel.tsx`

**Description**: Create the tab panel component that renders the series list for the active tab. For Story 3-1, series are rendered as minimal cards (title + status badge). Full card design is Story 3.2.

**Acceptance Criteria**:
- Accepts `series: UserSeries[]`, `tabId: string`, `labelId: string` props
- Has `role="tabpanel"` and `aria-labelledby={labelId}`
- Renders each series as a minimal card with title and status badge
- Shows `EmptyState` when `series` array is empty
- Series cards have `data-testid="series-card"` for testing
- Responsive grid: 2 columns mobile, 3 columns tablet, 4 columns desktop

**Implementation Details**:
```tsx
// src/components/dashboard/TabPanel.tsx

import { UserSeries, SeriesStatus } from '@/model/schemas/dashboard';
import { EmptyState } from './EmptyState';

interface TabPanelProps {
  series: UserSeries[];
  tabId: string;
  labelId: string;
  status: SeriesStatus;
}

export function TabPanel({ series, tabId, labelId, status }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={tabId}
      aria-labelledby={labelId}
      className="mt-6"
    >
      {series.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {series.map((item) => (
            <div
              key={item.id}
              data-testid="series-card"
              className="rounded-lg bg-[#FFEDE3] p-4 border border-[#FFD5BE]"
            >
              <h3 className="text-[#222222] font-medium text-sm truncate">
                {item.title}
              </h3>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#FF7A45] text-white">
                {item.platform}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- TabPanel.test.tsx
```

**Dependencies**: Phase 1, Task 3.2

**Estimated Time**: 45 minutes

---

## Task 3.4: Create DashboardTabs Client Component

**File**: `src/components/dashboard/DashboardTabs.tsx`

**Description**: Create the main tabbed interface client component. This is the most complex component in this story — it manages active tab state, renders the tab bar with full ARIA compliance, handles keyboard navigation, and renders the correct `TabPanel` for the active tab.

**Acceptance Criteria**:
- Marked `'use client'` directive
- Accepts `data: DashboardData` prop
- Manages `activeTab: SeriesStatus` state (default: `SeriesStatus.READING`)
- Renders `role="tablist"` container
- Each tab button: `role="tab"`, `aria-selected`, `aria-controls`, `id`
- Active tab: brand orange underline (`border-b-2 border-[#FF7A45]`)
- Inactive tabs: default style with hover state
- Keyboard navigation: ArrowRight/ArrowLeft moves focus, Enter/Space activates
- Tab bar horizontally scrollable on mobile (`overflow-x-auto`)
- Renders `TabPanel` for active tab only
- All tabs have 44px minimum height touch target

**Implementation Details**:
```tsx
// src/components/dashboard/DashboardTabs.tsx

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { DashboardData, SeriesStatus } from '@/model/schemas/dashboard';
import { getTabConfigs, getSeriesForStatus } from '@/backend/services/dashboard/dashboardDomain';
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
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Series reading status"
        className="flex overflow-x-auto border-b border-[#FFEDE3] scrollbar-hide"
      >
        {tabConfigs.map((tab, index) => {
          const isActive = activeTab === tab.status;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              id={tab.id}
              aria-selected={isActive}
              aria-controls={`panel-${tab.status}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.status)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                'flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
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

      {/* Active tab panel */}
      {tabConfigs.map((tab) =>
        activeTab === tab.status ? (
          <TabPanel
            key={tab.status}
            series={getSeriesForStatus(data, tab.status)}
            tabId={`panel-${tab.status}`}
            labelId={tab.id}
            status={tab.status}
          />
        ) : null
      )}
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- DashboardTabs.test.tsx
```

**Dependencies**: Phase 1, Tasks 3.2, 3.3

**Estimated Time**: 2 hours

---

## Task 3.5: Update Dashboard Page

**File**: `src/app/dashboard/page.tsx`

**Description**: Update the dashboard page to be a server component that fetches series data using the query service and renders the `DashboardTabs` component wrapped in a `Suspense` boundary for the loading skeleton.

**Acceptance Criteria**:
- Server component (no `'use client'`)
- Gets authenticated user from Supabase session
- Calls `fetchUserSeriesGrouped(userId)` from Phase 2
- Wraps content in `Suspense` with `DashboardSkeleton` fallback
- Handles unauthenticated state (middleware handles redirect, but page should be safe)
- Renders `DashboardTabs` with fetched data
- Page title: "My Library | ReadTrace"

**Implementation Details**:
```tsx
// src/app/dashboard/page.tsx

import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { fetchUserSeriesGrouped } from '@/backend/services/dashboard/seriesQueryService';

export const metadata = {
  title: 'My Library | ReadTrace',
};

async function DashboardContent() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dashboardData = await fetchUserSeriesGrouped(user.id);

  return <DashboardTabs data={dashboardData} />;
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#222222] mb-6">
          My Library
        </h1>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}
```

**Verification**:
```bash
npm run build
npm run test -- tests/integration/dashboard-page.integration.test.ts
```

**Dependencies**: Phase 2, Tasks 3.1, 3.4

**Estimated Time**: 1 hour

---

## Task 3.6: Write Unit Tests for All Components

**Files**:
- `tests/unit/DashboardSkeleton.test.tsx`
- `tests/unit/EmptyState.test.tsx`
- `tests/unit/TabPanel.test.tsx`
- `tests/unit/DashboardTabs.test.tsx`

**Description**: Write unit tests for all four components. Tests must cover rendering, interaction, and accessibility attributes.

**Acceptance Criteria**:
- `DashboardSkeleton`: renders skeleton tabs, skeleton cards, aria-busy
- `EmptyState`: renders per-status message, renders CTA link for each status
- `TabPanel`: renders series titles, shows EmptyState when empty, correct ARIA
- `DashboardTabs`: renders 4 tabs, default Reading active, tab click switches panel, keyboard navigation (ArrowRight/Left/Enter), ARIA attributes correct
- All tests pass
- Combined coverage >80% for component files

**Verification**:
```bash
npm run test -- tests/unit/DashboardSkeleton.test.tsx tests/unit/EmptyState.test.tsx tests/unit/TabPanel.test.tsx tests/unit/DashboardTabs.test.tsx --coverage
```

**Dependencies**: Tasks 3.1, 3.2, 3.3, 3.4

**Estimated Time**: 2 hours

---

## Phase 3 Completion Checklist

- [ ] `src/components/dashboard/DashboardSkeleton.tsx` created
- [ ] `src/components/dashboard/EmptyState.tsx` created
- [ ] `src/components/dashboard/TabPanel.tsx` created
- [ ] `src/components/dashboard/DashboardTabs.tsx` created with full keyboard navigation
- [ ] `src/app/dashboard/page.tsx` updated with server component + Suspense
- [ ] All component unit tests created and passing
- [ ] `npm run type-check` passes with zero errors
- [ ] Responsive design verified at 320px, 768px, 1280px viewports
- [ ] Code review approved
- [ ] Ready for Phase 4

**Status**: Not Started
**Last Updated**: 2026-02-18
**Owner**: [Developer Name]

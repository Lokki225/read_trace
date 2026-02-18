# Implementation Tasks - Phase 1: Domain Layer

**Feature**: Dashboard Layout with Tabbed Interface
**Phase**: Domain Layer (Business Logic, Types & Pure Functions)
**Dependencies**: None
**Estimated Duration**: 0.5 day

## Phase Overview

Phase 1 establishes all TypeScript interfaces, enums, and pure data transformation functions for the dashboard. This phase has zero UI or database dependencies — all logic is pure and independently testable.

## Phase Completion Criteria

- [ ] All dashboard TypeScript interfaces and enums defined
- [ ] `groupSeriesByStatus` pure function implemented and tested
- [ ] `getTabLabel` and `getTabOrder` helpers implemented and tested
- [ ] Unit tests passing (>80% coverage for this phase)
- [ ] No dependencies on UI, database, or Next.js
- [ ] `npm run type-check` passes with zero errors

---

## Task 1.1: Define Dashboard TypeScript Interfaces and Enums

**File**: `src/model/schemas/dashboard.ts`

**Description**: Create all TypeScript types for dashboard data structures. These types are the contract between the data layer and presentation layer.

**Acceptance Criteria**:
- `SeriesStatus` enum with all four valid values
- `UserSeries` interface matching `user_series` table schema from migration 007
- `DashboardData` interface grouping series by status
- `TabConfig` interface for tab metadata (id, label, status)
- All types exported for use across layers

**Implementation Details**:
```typescript
// src/model/schemas/dashboard.ts

export enum SeriesStatus {
  READING = 'reading',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  PLAN_TO_READ = 'plan_to_read',
}

export interface UserSeries {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  status: SeriesStatus;
  current_chapter: number;
  total_chapters: number | null;
  cover_url: string | null;
  last_read_at: string | null;
  created_at: string;
}

export interface DashboardData {
  reading: UserSeries[];
  completed: UserSeries[];
  on_hold: UserSeries[];
  plan_to_read: UserSeries[];
}

export interface TabConfig {
  id: string;
  label: string;
  status: SeriesStatus;
  ariaLabel: string;
}

export type DashboardError = {
  message: string;
  code?: string;
};
```

**Verification**:
```bash
npx tsc --noEmit
```

**Dependencies**: None

**Estimated Time**: 30 minutes

---

## Task 1.2: Implement groupSeriesByStatus Pure Function

**File**: `src/backend/services/dashboard/dashboardDomain.ts`

**Description**: Create a pure function that takes a flat array of `UserSeries` and groups them into a `DashboardData` object by status. This is the core business logic of the dashboard.

**Acceptance Criteria**:
- Accepts `UserSeries[]` input
- Returns `DashboardData` with all four status buckets
- Empty arrays for statuses with no matching series
- Handles empty input array
- Handles 100 series in <10ms
- No side effects, no external dependencies

**Implementation Details**:
```typescript
// src/backend/services/dashboard/dashboardDomain.ts

import { DashboardData, SeriesStatus, UserSeries } from '@/model/schemas/dashboard';

export function groupSeriesByStatus(series: UserSeries[]): DashboardData {
  const result: DashboardData = {
    reading: [],
    completed: [],
    on_hold: [],
    plan_to_read: [],
  };

  for (const item of series) {
    switch (item.status) {
      case SeriesStatus.READING:
        result.reading.push(item);
        break;
      case SeriesStatus.COMPLETED:
        result.completed.push(item);
        break;
      case SeriesStatus.ON_HOLD:
        result.on_hold.push(item);
        break;
      case SeriesStatus.PLAN_TO_READ:
        result.plan_to_read.push(item);
        break;
    }
  }

  return result;
}
```

**Verification**:
```bash
npm run test -- dashboardDomain.test.ts
```

**Dependencies**: Task 1.1

**Estimated Time**: 30 minutes

---

## Task 1.3: Implement Tab Configuration Helpers

**File**: `src/backend/services/dashboard/dashboardDomain.ts` (append to existing file)

**Description**: Create helper functions for tab metadata — labels, ordering, and ARIA attributes. These are pure functions with no side effects.

**Acceptance Criteria**:
- `getTabConfigs()` returns ordered array of `TabConfig` for all four tabs
- `getTabLabel(status)` returns correct display label for each status
- Labels match UX specification exactly: "Reading", "Completed", "On Hold", "Plan to Read"
- Tab order is fixed: Reading → Completed → On Hold → Plan to Read

**Implementation Details**:
```typescript
// Append to src/backend/services/dashboard/dashboardDomain.ts

import { TabConfig, SeriesStatus } from '@/model/schemas/dashboard';

export function getTabLabel(status: SeriesStatus): string {
  const labels: Record<SeriesStatus, string> = {
    [SeriesStatus.READING]: 'Reading',
    [SeriesStatus.COMPLETED]: 'Completed',
    [SeriesStatus.ON_HOLD]: 'On Hold',
    [SeriesStatus.PLAN_TO_READ]: 'Plan to Read',
  };
  return labels[status];
}

export function getTabConfigs(): TabConfig[] {
  return [
    {
      id: 'tab-reading',
      label: 'Reading',
      status: SeriesStatus.READING,
      ariaLabel: 'Reading series',
    },
    {
      id: 'tab-completed',
      label: 'Completed',
      status: SeriesStatus.COMPLETED,
      ariaLabel: 'Completed series',
    },
    {
      id: 'tab-on-hold',
      label: 'On Hold',
      status: SeriesStatus.ON_HOLD,
      ariaLabel: 'Series on hold',
    },
    {
      id: 'tab-plan-to-read',
      label: 'Plan to Read',
      status: SeriesStatus.PLAN_TO_READ,
      ariaLabel: 'Series planned to read',
    },
  ];
}

export function getSeriesForStatus(
  data: DashboardData,
  status: SeriesStatus
): UserSeries[] {
  const map: Record<SeriesStatus, UserSeries[]> = {
    [SeriesStatus.READING]: data.reading,
    [SeriesStatus.COMPLETED]: data.completed,
    [SeriesStatus.ON_HOLD]: data.on_hold,
    [SeriesStatus.PLAN_TO_READ]: data.plan_to_read,
  };
  return map[status];
}
```

**Verification**:
```bash
npm run test -- dashboardDomain.test.ts
```

**Dependencies**: Task 1.1

**Estimated Time**: 30 minutes

---

## Task 1.4: Write Unit Tests for Domain Layer

**File**: `tests/unit/dashboardDomain.test.ts`

**Description**: Write comprehensive unit tests for all domain functions. Tests must be written before implementation is marked complete (TDD: red-green-refactor).

**Acceptance Criteria**:
- Tests for `groupSeriesByStatus`: correct grouping, empty input, 100 series, unknown status ignored
- Tests for `getTabLabel`: all four statuses return correct labels
- Tests for `getTabConfigs`: returns 4 configs in correct order
- Tests for `getSeriesForStatus`: returns correct array for each status
- All tests pass
- Coverage >80% for `dashboardDomain.ts`

**Implementation Details**:
```typescript
// tests/unit/dashboardDomain.test.ts

import {
  groupSeriesByStatus,
  getTabLabel,
  getTabConfigs,
  getSeriesForStatus,
} from '@/backend/services/dashboard/dashboardDomain';
import { SeriesStatus, UserSeries } from '@/model/schemas/dashboard';

const makeSeries = (overrides: Partial<UserSeries> = {}): UserSeries => ({
  id: 'series-1',
  user_id: 'user-123',
  title: 'Test Series',
  platform: 'mangadex',
  status: SeriesStatus.READING,
  current_chapter: 1,
  total_chapters: null,
  cover_url: null,
  last_read_at: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('groupSeriesByStatus', () => {
  it('groups series into correct status buckets', () => {
    const series = [
      makeSeries({ id: '1', status: SeriesStatus.READING }),
      makeSeries({ id: '2', status: SeriesStatus.COMPLETED }),
      makeSeries({ id: '3', status: SeriesStatus.ON_HOLD }),
      makeSeries({ id: '4', status: SeriesStatus.PLAN_TO_READ }),
      makeSeries({ id: '5', status: SeriesStatus.READING }),
    ];
    const result = groupSeriesByStatus(series);
    expect(result.reading).toHaveLength(2);
    expect(result.completed).toHaveLength(1);
    expect(result.on_hold).toHaveLength(1);
    expect(result.plan_to_read).toHaveLength(1);
  });

  it('returns empty arrays for statuses with no series', () => {
    const series = [makeSeries({ status: SeriesStatus.READING })];
    const result = groupSeriesByStatus(series);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('handles empty input array', () => {
    const result = groupSeriesByStatus([]);
    expect(result.reading).toEqual([]);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('handles 100 series in under 10ms', () => {
    const series = Array.from({ length: 100 }, (_, i) =>
      makeSeries({
        id: String(i),
        status: Object.values(SeriesStatus)[i % 4] as SeriesStatus,
      })
    );
    const start = performance.now();
    groupSeriesByStatus(series);
    expect(performance.now() - start).toBeLessThan(10);
  });
});

describe('getTabLabel', () => {
  it('returns correct label for each status', () => {
    expect(getTabLabel(SeriesStatus.READING)).toBe('Reading');
    expect(getTabLabel(SeriesStatus.COMPLETED)).toBe('Completed');
    expect(getTabLabel(SeriesStatus.ON_HOLD)).toBe('On Hold');
    expect(getTabLabel(SeriesStatus.PLAN_TO_READ)).toBe('Plan to Read');
  });
});

describe('getTabConfigs', () => {
  it('returns exactly 4 tab configs', () => {
    expect(getTabConfigs()).toHaveLength(4);
  });

  it('returns tabs in correct order', () => {
    const configs = getTabConfigs();
    expect(configs[0].status).toBe(SeriesStatus.READING);
    expect(configs[1].status).toBe(SeriesStatus.COMPLETED);
    expect(configs[2].status).toBe(SeriesStatus.ON_HOLD);
    expect(configs[3].status).toBe(SeriesStatus.PLAN_TO_READ);
  });

  it('each config has required fields', () => {
    getTabConfigs().forEach(config => {
      expect(config.id).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.status).toBeDefined();
      expect(config.ariaLabel).toBeDefined();
    });
  });
});

describe('getSeriesForStatus', () => {
  it('returns correct series array for each status', () => {
    const readingSeries = makeSeries({ status: SeriesStatus.READING });
    const data = {
      reading: [readingSeries],
      completed: [],
      on_hold: [],
      plan_to_read: [],
    };
    expect(getSeriesForStatus(data, SeriesStatus.READING)).toEqual([readingSeries]);
    expect(getSeriesForStatus(data, SeriesStatus.COMPLETED)).toEqual([]);
  });
});
```

**Verification**:
```bash
npm run test -- tests/unit/dashboardDomain.test.ts --coverage
```

**Dependencies**: Tasks 1.1, 1.2, 1.3

**Estimated Time**: 45 minutes

---

## Phase 1 Completion Checklist

- [ ] `src/model/schemas/dashboard.ts` created with all interfaces and enums
- [ ] `src/backend/services/dashboard/dashboardDomain.ts` created with all pure functions
- [ ] `tests/unit/dashboardDomain.test.ts` created and all tests passing
- [ ] `npm run type-check` passes with zero errors
- [ ] Test coverage >80% for domain files
- [ ] No external dependencies (no Supabase, no React, no Next.js)
- [ ] Code review approved
- [ ] Ready for Phase 2

**Status**: Not Started
**Last Updated**: 2026-02-18
**Owner**: [Developer Name]

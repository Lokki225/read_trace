# Implementation Tasks - Phase 4: Integration & Testing

**Feature**: Dashboard Layout with Tabbed Interface
**Phase**: Integration & Testing (Full Validation, Accessibility & Performance)
**Dependencies**: Phases 1, 2, and 3 complete
**Estimated Duration**: 1 day

## Phase Overview

Phase 4 validates the complete dashboard implementation end-to-end. This phase runs the full test suite to confirm zero regressions, verifies accessibility compliance with axe-core, validates performance targets, and updates all tracking files to mark the story complete.

## Phase Completion Criteria

- [ ] All 535 existing tests continue to pass (zero regressions)
- [ ] All new tests pass (unit + integration)
- [ ] axe-core accessibility tests pass with zero violations
- [ ] Dashboard page integration test passes
- [ ] Performance verified: <3s load, <100ms tab switch
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `IMPLEMENTATION_STATUS.json` updated
- [ ] Story file marked complete

---

## Task 4.1: Run Full Regression Test Suite

**Description**: Run the complete test suite to confirm all 535 existing tests still pass after the new implementation. Any regression must be fixed before proceeding.

**Acceptance Criteria**:
- All 535 pre-existing tests pass
- Zero test regressions introduced
- New tests also pass

**Verification**:
```bash
npm run test -- --passWithNoTests
```

**Expected Output**:
```
Test Suites: X passed, X total
Tests:       535+ passed, 0 failed
```

**Dependencies**: Phases 1, 2, 3 complete

**Estimated Time**: 15 minutes

---

## Task 4.2: Write Dashboard Page Integration Test

**File**: `tests/integration/dashboard-page.integration.test.ts`

**Description**: Write integration tests that verify the dashboard page correctly wires the query service to the `DashboardTabs` component. Tests use mocked service to isolate page logic.

**Acceptance Criteria**:
- Test: page renders DashboardTabs with data from service
- Test: page renders empty state when service returns empty data
- Test: page handles service error gracefully
- Test: page renders DashboardSkeleton during loading (Suspense)
- All tests pass

**Implementation Details**:
```typescript
// tests/integration/dashboard-page.integration.test.ts

import { render, screen } from '@testing-library/react';
import * as seriesQueryService from '@/backend/services/dashboard/seriesQueryService';
import { mockDashboardData, mockEmptyDashboardData } from '../factories/dashboard.factory';

jest.mock('@/backend/services/dashboard/seriesQueryService');
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
  })),
}));
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ getAll: () => [] })),
}));

describe('Dashboard page integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders DashboardTabs with series data', async () => {
    jest.spyOn(seriesQueryService, 'fetchUserSeriesGrouped')
      .mockResolvedValue(mockDashboardData);

    render(await import('@/app/dashboard/page').then(m => m.default()));

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByText('Naruto')).toBeInTheDocument();
  });

  it('renders empty state when user has no series', async () => {
    jest.spyOn(seriesQueryService, 'fetchUserSeriesGrouped')
      .mockResolvedValue(mockEmptyDashboardData);

    render(await import('@/app/dashboard/page').then(m => m.default()));

    expect(screen.getByText(/no series being read/i)).toBeInTheDocument();
  });
});
```

**Verification**:
```bash
npm run test -- tests/integration/dashboard-page.integration.test.ts
```

**Dependencies**: Phase 3 complete

**Estimated Time**: 1 hour

---

## Task 4.3: Create Test Data Factory

**File**: `tests/factories/dashboard.factory.ts`

**Description**: Create a test data factory for dashboard data, following the existing factory pattern in `tests/factories/`. This factory is used across all dashboard tests.

**Acceptance Criteria**:
- `makeDashboardSeries(overrides?)` factory function
- `mockDashboardData` with series in all four statuses
- `mockEmptyDashboardData` with empty arrays for all statuses
- Follows existing factory pattern from `tests/factories/user.factory.ts`

**Implementation Details**:
```typescript
// tests/factories/dashboard.factory.ts

import { UserSeries, DashboardData, SeriesStatus } from '@/model/schemas/dashboard';

export const makeDashboardSeries = (
  overrides: Partial<UserSeries> = {}
): UserSeries => ({
  id: `series-${Math.random().toString(36).slice(2, 9)}`,
  user_id: 'user-123',
  title: 'Test Series',
  platform: 'mangadex',
  status: SeriesStatus.READING,
  current_chapter: 1,
  total_chapters: null,
  cover_url: null,
  last_read_at: '2026-02-18T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const mockDashboardData: DashboardData = {
  reading: [
    makeDashboardSeries({ id: 'series-1', title: 'Naruto', status: SeriesStatus.READING }),
    makeDashboardSeries({ id: 'series-2', title: 'One Piece', status: SeriesStatus.READING }),
  ],
  completed: [
    makeDashboardSeries({ id: 'series-3', title: 'Fullmetal Alchemist', status: SeriesStatus.COMPLETED }),
  ],
  on_hold: [
    makeDashboardSeries({ id: 'series-4', title: 'Bleach', status: SeriesStatus.ON_HOLD }),
  ],
  plan_to_read: [
    makeDashboardSeries({ id: 'series-5', title: 'Hunter x Hunter', status: SeriesStatus.PLAN_TO_READ }),
  ],
};

export const mockEmptyDashboardData: DashboardData = {
  reading: [],
  completed: [],
  on_hold: [],
  plan_to_read: [],
};
```

**Verification**:
```bash
npx tsc --noEmit
```

**Dependencies**: Phase 1 (types)

**Estimated Time**: 30 minutes

---

## Task 4.4: Run Accessibility Tests with axe-core

**Description**: Run axe-core automated accessibility tests against all dashboard components to verify zero WCAG 2.1 AA violations.

**Acceptance Criteria**:
- Zero axe-core violations on `DashboardTabs` component
- Zero axe-core violations on `EmptyState` component
- Zero axe-core violations on `TabPanel` component
- Zero axe-core violations on `DashboardSkeleton` component
- Tests are added to existing unit test files

**Implementation Details**:
```typescript
// Add to tests/unit/DashboardTabs.test.tsx

import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('DashboardTabs accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<DashboardTabs data={mockDashboardData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Add to tests/unit/EmptyState.test.tsx

describe('EmptyState accessibility', () => {
  it('should have no accessibility violations for each status', async () => {
    for (const status of Object.values(SeriesStatus)) {
      const { container } = render(<EmptyState status={status} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
```

**Verification**:
```bash
npm run test -- --testNamePattern="accessibility"
```

**Dependencies**: Phase 3 complete, `jest-axe` package available

**Estimated Time**: 1 hour

**Note**: If `jest-axe` is not installed, add it:
```bash
npm install --save-dev jest-axe @types/jest-axe
```

---

## Task 4.5: Verify TypeScript and Linting

**Description**: Run TypeScript type checking and ESLint to confirm zero errors across all new files.

**Acceptance Criteria**:
- `npm run type-check` exits with code 0
- `npm run lint` exits with code 0
- No `any` types without explicit justification
- No unused imports or variables

**Verification**:
```bash
npx tsc --noEmit
npm run lint
```

**Dependencies**: Phases 1, 2, 3 complete

**Estimated Time**: 15 minutes (fix any issues found)

---

## Task 4.6: Verify Performance Targets

**Description**: Manually verify dashboard performance targets are met using browser DevTools and React DevTools Profiler.

**Acceptance Criteria**:
- Dashboard LCP < 3 seconds with 100 series in Supabase test project
- Tab switch < 100ms (React DevTools Profiler)
- Supabase query < 500ms (Supabase dashboard logs)
- Lighthouse Performance score > 85

**Verification Steps**:
1. Start dev server: `npm run dev`
2. Open Chrome DevTools → Network tab
3. Navigate to `/dashboard` with 100 series in test Supabase project
4. Measure LCP in Performance tab
5. Open React DevTools Profiler
6. Click each tab and measure render time
7. Run Lighthouse audit on `/dashboard`

**Pass Criteria**:
```
LCP: < 3000ms ✅
Tab switch render: < 100ms ✅
Supabase query: < 500ms ✅
Lighthouse Performance: > 85 ✅
```

**Dependencies**: Phase 3 complete, Supabase test project with 100 series

**Estimated Time**: 30 minutes

---

## Task 4.7: Update IMPLEMENTATION_STATUS.json

**File**: `IMPLEMENTATION_STATUS.json`

**Description**: Update the implementation status tracker to reflect Story 3-1 completion.

**Acceptance Criteria**:
- `currentWork.story` updated to "Story 3-1 Complete"
- `currentWork.status` set to "done"
- `completionStatus.epic3` section added with Story 3-1 status
- `testingMetrics.totalTestCount` updated with new test count
- `confidenceScore.overall` updated if applicable

**Implementation Details**:
```json
{
  "currentWork": {
    "epic": "3-Series Management & Dashboard",
    "story": "3-1-dashboard-layout-with-tabbed-interface",
    "status": "done",
    "description": "Dashboard tabbed interface with 4 status tabs, Supabase query service, full accessibility"
  },
  "completionStatus": {
    "epic3": {
      "name": "Series Management & Dashboard",
      "totalStories": 6,
      "completedStories": 1,
      "inProgressStories": 0,
      "stories": {
        "3-1-dashboard-layout-with-tabbed-interface": {
          "status": "done",
          "completedDate": "2026-02-18",
          "confidenceScore": 92
        }
      }
    }
  }
}
```

**Verification**:
```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('IMPLEMENTATION_STATUS.json', 'utf8')); console.log('Valid JSON')"
```

**Dependencies**: All tasks complete

**Estimated Time**: 15 minutes

---

## Task 4.8: Final Test Count Verification

**Description**: Run the complete test suite one final time to confirm the total test count and zero failures.

**Acceptance Criteria**:
- All pre-existing 535 tests pass (zero regressions)
- All new dashboard tests pass
- Total test count documented in story completion notes
- Zero failing tests

**Verification**:
```bash
npm run test -- --passWithNoTests --verbose 2>&1 | tail -20
```

**Expected Output**:
```
Test Suites: X passed, X total
Tests:       560+ passed, 0 failed, 0 skipped
Snapshots:   0 total
Time:        Xs
```

**Dependencies**: All previous tasks complete

**Estimated Time**: 10 minutes

---

## Phase 4 Completion Checklist

- [ ] Full regression test suite passes (535+ tests, 0 failures)
- [ ] Dashboard page integration test passes
- [ ] Test data factory created (`tests/factories/dashboard.factory.ts`)
- [ ] axe-core accessibility tests pass with zero violations
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] Performance targets verified (<3s load, <100ms tab switch)
- [ ] `IMPLEMENTATION_STATUS.json` updated
- [ ] Final test count documented
- [ ] Story 3-1 marked complete
- [ ] Ready for Story 3-2 (Series Card Component)

## Story 3-1 Definition of Done

All of the following must be true before Story 3-1 is marked complete:

- [ ] All 10 acceptance criteria from `acceptance-criteria.md` satisfied
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing (>70% coverage)
- [ ] Zero axe-core accessibility violations
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Performance targets met (<3s load, <100ms tab switch)
- [ ] Zero regressions in existing test suite
- [ ] `IMPLEMENTATION_STATUS.json` updated
- [ ] Code review approved
- [ ] Product Layer files complete (this document)

**Status**: Not Started
**Last Updated**: 2026-02-18
**Owner**: [Developer Name]

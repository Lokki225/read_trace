# Implementation Tasks - Phase 2: Data Layer

**Feature**: Dashboard Layout with Tabbed Interface
**Phase**: Data Layer (Supabase Query Service & Database Integration)
**Dependencies**: Phase 1 complete
**Estimated Duration**: 0.5 day

## Phase Overview

Phase 2 implements the Supabase query service that fetches series data for the authenticated user and groups it by status. This phase bridges the database and the presentation layer, with comprehensive error handling and type safety.

## Phase Completion Criteria

- [ ] `seriesQueryService.ts` implemented with `fetchUserSeriesGrouped`
- [ ] Supabase query filters by `user_id` (RLS enforced)
- [ ] Error handling for Supabase failures
- [ ] Integration tests passing (>70% coverage)
- [ ] `npm run type-check` passes with zero errors
- [ ] Query verified to use correct `user_series` column names from migration 007

---

## Task 2.1: Verify user_series Table Schema

**File**: `database/migrations/007_create_user_series.sql` (read-only verification)

**Description**: Before implementing the query service, verify the exact column names and types in the `user_series` table from Story 2-5. This prevents schema mismatch bugs.

**Acceptance Criteria**:
- Confirm `user_series` table has: `id`, `user_id`, `title`, `platform`, `status`, `current_chapter`, `total_chapters`, `cover_url`, `last_read_at`, `created_at`
- Confirm `status` column stores values: `'reading'`, `'completed'`, `'on_hold'`, `'plan_to_read'`
- Confirm RLS policies exist for user isolation
- Update `UserSeries` interface in `src/model/schemas/dashboard.ts` if any discrepancy found

**Implementation Details**:
```bash
# Read the migration file to verify schema
cat database/migrations/007_create_user_series.sql
```

**Verification**:
- Manually compare migration columns with `UserSeries` interface from Phase 1
- Fix any discrepancies in `src/model/schemas/dashboard.ts`

**Dependencies**: Phase 1 complete

**Estimated Time**: 15 minutes

---

## Task 2.2: Implement Series Query Service

**File**: `src/backend/services/dashboard/seriesQueryService.ts`

**Description**: Create the Supabase query service that fetches all series for the authenticated user and returns them grouped by status using the domain function from Phase 1.

**Acceptance Criteria**:
- `fetchUserSeriesGrouped(userId: string)` function exported
- Queries `user_series` table filtered by `user_id`
- Selects only required columns (not `SELECT *`)
- Orders by `last_read_at DESC` for consistent ordering
- Applies `LIMIT 100` to prevent performance issues
- Calls `groupSeriesByStatus` from Phase 1 to group results
- Throws descriptive error on Supabase failure
- Uses server-side Supabase client (`createServerClient`)

**Implementation Details**:
```typescript
// src/backend/services/dashboard/seriesQueryService.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DashboardData, UserSeries } from '@/model/schemas/dashboard';
import { groupSeriesByStatus } from './dashboardDomain';

export async function fetchUserSeriesGrouped(userId: string): Promise<DashboardData> {
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

  const { data, error } = await supabase
    .from('user_series')
    .select(
      'id, user_id, title, platform, status, current_chapter, total_chapters, cover_url, last_read_at, created_at'
    )
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return groupSeriesByStatus((data as UserSeries[]) ?? []);
}
```

**Verification**:
```bash
npm run test -- dashboard-query.integration.test.ts
npx tsc --noEmit
```

**Dependencies**: Phase 1, Task 2.1

**Estimated Time**: 1 hour

---

## Task 2.3: Write Integration Tests for Series Query Service

**File**: `tests/integration/dashboard-query.integration.test.ts`

**Description**: Write integration tests for `fetchUserSeriesGrouped` using the existing Supabase mock pattern from the project. Tests verify correct query construction, grouping, and error handling.

**Acceptance Criteria**:
- Test: fetches series for authenticated user
- Test: returns empty groups when user has no series
- Test: throws on Supabase error
- Test: filters by correct user_id (not another user's data)
- Test: handles 100 series correctly
- Test: orders by last_read_at descending
- All tests pass
- Uses existing `tests/__mocks__/supabase.ts` mock pattern

**Implementation Details**:
```typescript
// tests/integration/dashboard-query.integration.test.ts

import { fetchUserSeriesGrouped } from '@/backend/services/dashboard/seriesQueryService';
import { SeriesStatus } from '@/model/schemas/dashboard';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ getAll: () => [] })),
}));

const { createServerClient } = require('@supabase/ssr');

const makeMockSeries = (overrides = {}) => ({
  id: 'series-1',
  user_id: 'user-123',
  title: 'Test Series',
  platform: 'mangadex',
  status: 'reading',
  current_chapter: 1,
  total_chapters: null,
  cover_url: null,
  last_read_at: '2026-02-18T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const buildMockSupabase = (data: unknown[], error: unknown = null) => {
  const limitMock = jest.fn().mockResolvedValue({ data, error });
  const orderMock = jest.fn().mockReturnValue({ limit: limitMock });
  const eqMock = jest.fn().mockReturnValue({ order: orderMock });
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
  const fromMock = jest.fn().mockReturnValue({ select: selectMock });

  createServerClient.mockReturnValue({ from: fromMock });

  return { fromMock, selectMock, eqMock, orderMock, limitMock };
};

describe('fetchUserSeriesGrouped', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches and groups series for authenticated user', async () => {
    const mockData = [
      makeMockSeries({ id: '1', status: 'reading' }),
      makeMockSeries({ id: '2', status: 'completed' }),
      makeMockSeries({ id: '3', status: 'reading' }),
    ];
    buildMockSupabase(mockData);

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toHaveLength(2);
    expect(result.completed).toHaveLength(1);
    expect(result.on_hold).toHaveLength(0);
    expect(result.plan_to_read).toHaveLength(0);
  });

  it('returns empty groups when user has no series', async () => {
    buildMockSupabase([]);

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toEqual([]);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('throws on Supabase error', async () => {
    buildMockSupabase(null as any, { message: 'Connection failed' });

    await expect(fetchUserSeriesGrouped('user-123')).rejects.toThrow(
      'Connection failed'
    );
  });

  it('filters by the correct user_id', async () => {
    const { eqMock } = buildMockSupabase([]);

    await fetchUserSeriesGrouped('user-456');

    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-456');
  });

  it('applies limit of 100', async () => {
    const { limitMock } = buildMockSupabase([]);

    await fetchUserSeriesGrouped('user-123');

    expect(limitMock).toHaveBeenCalledWith(100);
  });

  it('handles 100 series without errors', async () => {
    const mockData = Array.from({ length: 100 }, (_, i) =>
      makeMockSeries({
        id: String(i),
        status: ['reading', 'completed', 'on_hold', 'plan_to_read'][i % 4],
      })
    );
    buildMockSupabase(mockData);

    const result = await fetchUserSeriesGrouped('user-123');
    const total =
      result.reading.length +
      result.completed.length +
      result.on_hold.length +
      result.plan_to_read.length;

    expect(total).toBe(100);
  });
});
```

**Verification**:
```bash
npm run test -- tests/integration/dashboard-query.integration.test.ts --coverage
```

**Dependencies**: Task 2.2

**Estimated Time**: 1 hour

---

## Phase 2 Completion Checklist

- [ ] `database/migrations/007_create_user_series.sql` schema verified
- [ ] `src/backend/services/dashboard/seriesQueryService.ts` implemented
- [ ] `tests/integration/dashboard-query.integration.test.ts` created and all tests passing
- [ ] `npm run type-check` passes with zero errors
- [ ] Integration test coverage >70%
- [ ] Query uses correct column names from migration 007
- [ ] Error handling covers Supabase failures
- [ ] Code review approved
- [ ] Ready for Phase 3

**Status**: Not Started
**Last Updated**: 2026-02-18
**Owner**: [Developer Name]

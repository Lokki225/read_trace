# Test Scenarios: Dashboard Layout with Tabbed Interface

## Overview

**Feature**: Dashboard Layout with Tabbed Interface
**Feature ID**: dashboard-tabbed-interface
**Story**: 3-1
**Last Updated**: 2026-02-18

This document outlines comprehensive test scenarios for the dashboard tabbed interface.

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% — Domain logic, status grouping, component rendering
- **Integration Tests**: 30% — Supabase query service, page data flow
- **End-to-End Tests**: 10% — Complete dashboard user journey

### Test Coverage Goals

- Unit Tests: 80%+ code coverage
- Integration Tests: 70%+ feature coverage
- End-to-End Tests: Critical user flows only

---

## Unit Tests

### Test Suite 1: SeriesStatus Domain Logic

**File**: `tests/unit/dashboardDomain.test.ts`

#### Test Case 1.1: Status Enum Values

```typescript
describe('SeriesStatus', () => {
  it('should define all four valid status values', () => {
    expect(SeriesStatus.READING).toBe('reading');
    expect(SeriesStatus.COMPLETED).toBe('completed');
    expect(SeriesStatus.ON_HOLD).toBe('on_hold');
    expect(SeriesStatus.PLAN_TO_READ).toBe('plan_to_read');
  });

  it('should have exactly four status values', () => {
    expect(Object.values(SeriesStatus)).toHaveLength(4);
  });
});
```

**Purpose**: Verify status enum is complete and correct
**Preconditions**: None
**Expected Result**: All four statuses defined with correct string values

---

#### Test Case 1.2: groupSeriesByStatus Groups Correctly

```typescript
describe('groupSeriesByStatus', () => {
  it('should group series into correct status buckets', () => {
    const series = [
      { id: '1', title: 'Naruto', status: 'reading' },
      { id: '2', title: 'Bleach', status: 'completed' },
      { id: '3', title: 'One Piece', status: 'reading' },
      { id: '4', title: 'HxH', status: 'on_hold' },
      { id: '5', title: 'FMA', status: 'plan_to_read' },
    ];

    const grouped = groupSeriesByStatus(series);

    expect(grouped.reading).toHaveLength(2);
    expect(grouped.completed).toHaveLength(1);
    expect(grouped.on_hold).toHaveLength(1);
    expect(grouped.plan_to_read).toHaveLength(1);
  });

  it('should return empty arrays for statuses with no series', () => {
    const series = [{ id: '1', title: 'Naruto', status: 'reading' }];
    const grouped = groupSeriesByStatus(series);

    expect(grouped.completed).toEqual([]);
    expect(grouped.on_hold).toEqual([]);
    expect(grouped.plan_to_read).toEqual([]);
  });

  it('should handle empty series array', () => {
    const grouped = groupSeriesByStatus([]);

    expect(grouped.reading).toEqual([]);
    expect(grouped.completed).toEqual([]);
    expect(grouped.on_hold).toEqual([]);
    expect(grouped.plan_to_read).toEqual([]);
  });

  it('should handle 100 series without performance issues', () => {
    const series = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      title: `Series ${i}`,
      status: ['reading', 'completed', 'on_hold', 'plan_to_read'][i % 4],
    }));

    const start = performance.now();
    const grouped = groupSeriesByStatus(series);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(10);
    expect(
      grouped.reading.length + grouped.completed.length +
      grouped.on_hold.length + grouped.plan_to_read.length
    ).toBe(100);
  });
});
```

**Purpose**: Verify series grouping logic is correct and performant
**Preconditions**: None
**Expected Result**: Series correctly distributed into status buckets

---

#### Test Case 1.3: getTabLabel Returns Correct Labels

```typescript
describe('getTabLabel', () => {
  it('should return correct display label for each status', () => {
    expect(getTabLabel('reading')).toBe('Reading');
    expect(getTabLabel('completed')).toBe('Completed');
    expect(getTabLabel('on_hold')).toBe('On Hold');
    expect(getTabLabel('plan_to_read')).toBe('Plan to Read');
  });
});
```

**Purpose**: Verify tab labels match UX specification
**Preconditions**: None
**Expected Result**: Labels match design spec exactly

---

### Test Suite 2: DashboardTabs Component

**File**: `tests/unit/DashboardTabs.test.tsx`

#### Test Case 2.1: Renders All Four Tabs

```typescript
describe('DashboardTabs', () => {
  it('should render all four tab buttons', () => {
    render(<DashboardTabs data={mockDashboardData} />);

    expect(screen.getByRole('tab', { name: 'Reading' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'On Hold' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Plan to Read' })).toBeInTheDocument();
  });

  it('should have "Reading" tab active by default', () => {
    render(<DashboardTabs data={mockDashboardData} />);

    const readingTab = screen.getByRole('tab', { name: 'Reading' });
    expect(readingTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should have tablist role on container', () => {
    render(<DashboardTabs data={mockDashboardData} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
```

**Purpose**: Verify tab rendering and default state
**Preconditions**: Mock dashboard data available
**Expected Result**: All tabs rendered, Reading active by default

---

#### Test Case 2.2: Tab Click Switches Active Tab

```typescript
describe('DashboardTabs tab switching', () => {
  it('should switch active tab on click', async () => {
    render(<DashboardTabs data={mockDashboardData} />);

    const completedTab = screen.getByRole('tab', { name: 'Completed' });
    await userEvent.click(completedTab);

    expect(completedTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Reading' }))
      .toHaveAttribute('aria-selected', 'false');
  });

  it('should show correct series panel after tab click', async () => {
    const data = {
      reading: [{ id: '1', title: 'Reading Series', status: 'reading' }],
      completed: [{ id: '2', title: 'Completed Series', status: 'completed' }],
      on_hold: [],
      plan_to_read: [],
    };

    render(<DashboardTabs data={data} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Completed' }));

    expect(screen.getByText('Completed Series')).toBeInTheDocument();
    expect(screen.queryByText('Reading Series')).not.toBeInTheDocument();
  });
});
```

**Purpose**: Verify tab switching shows correct content
**Preconditions**: Mock data with series in multiple statuses
**Expected Result**: Correct panel shown after tab click

---

#### Test Case 2.3: Keyboard Navigation

```typescript
describe('DashboardTabs keyboard navigation', () => {
  it('should move focus to next tab on ArrowRight', async () => {
    render(<DashboardTabs data={mockDashboardData} />);

    const readingTab = screen.getByRole('tab', { name: 'Reading' });
    readingTab.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveFocus();
  });

  it('should move focus to previous tab on ArrowLeft', async () => {
    render(<DashboardTabs data={mockDashboardData} />);

    const completedTab = screen.getByRole('tab', { name: 'Completed' });
    completedTab.focus();
    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveFocus();
  });

  it('should activate tab on Enter key', async () => {
    render(<DashboardTabs data={mockDashboardData} />);

    const completedTab = screen.getByRole('tab', { name: 'Completed' });
    completedTab.focus();
    await userEvent.keyboard('{Enter}');

    expect(completedTab).toHaveAttribute('aria-selected', 'true');
  });
});
```

**Purpose**: Verify keyboard navigation meets WCAG 2.1 AA
**Preconditions**: Component rendered
**Expected Result**: Arrow keys navigate, Enter activates

---

### Test Suite 3: TabPanel Component

**File**: `tests/unit/TabPanel.test.tsx`

#### Test Case 3.1: Renders Series List

```typescript
describe('TabPanel', () => {
  it('should render series titles for the active tab', () => {
    const series = [
      { id: '1', title: 'Naruto', status: 'reading' },
      { id: '2', title: 'Bleach', status: 'reading' },
    ];

    render(<TabPanel series={series} tabId="reading" labelId="tab-reading" />);

    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.getByText('Bleach')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(
      <TabPanel series={[]} tabId="reading" labelId="tab-reading" />
    );

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-reading');
  });
});
```

**Purpose**: Verify tab panel renders series and has correct ARIA
**Preconditions**: Series data available
**Expected Result**: Series displayed with correct accessibility attributes

---

### Test Suite 4: EmptyState Component

**File**: `tests/unit/EmptyState.test.tsx`

#### Test Case 4.1: Renders Per-Tab Empty Message

```typescript
describe('EmptyState', () => {
  it('should render encouraging message for Reading tab', () => {
    render(<EmptyState status="reading" />);
    expect(screen.getByText(/no series being read/i)).toBeInTheDocument();
  });

  it('should render encouraging message for Completed tab', () => {
    render(<EmptyState status="completed" />);
    expect(screen.getByText(/no completed series/i)).toBeInTheDocument();
  });

  it('should render a call-to-action for all statuses', () => {
    render(<EmptyState status="reading" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
```

**Purpose**: Verify empty state is encouraging and has CTA
**Preconditions**: None
**Expected Result**: Status-specific message and CTA rendered

---

### Test Suite 5: DashboardSkeleton Component

**File**: `tests/unit/DashboardSkeleton.test.tsx`

#### Test Case 5.1: Renders Loading Skeleton

```typescript
describe('DashboardSkeleton', () => {
  it('should render skeleton tab bar', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId('skeleton-tabs')).toBeInTheDocument();
  });

  it('should render skeleton series cards', () => {
    render(<DashboardSkeleton />);
    const skeletonCards = screen.getAllByTestId('skeleton-card');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('should have aria-busy attribute for screen readers', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
```

**Purpose**: Verify skeleton loading state renders correctly
**Preconditions**: None
**Expected Result**: Skeleton renders with accessibility attributes

---

## Integration Tests

### Test Suite 1: Series Query Service

**File**: `tests/integration/dashboard-query.integration.test.ts`

#### Test Case 1.1: Fetches Series for Authenticated User

```typescript
describe('seriesQueryService', () => {
  it('should fetch all series for the authenticated user', async () => {
    const mockSeries = [
      { id: '1', user_id: 'user-123', title: 'Naruto', status: 'reading' },
      { id: '2', user_id: 'user-123', title: 'Bleach', status: 'completed' },
    ];

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockSeries, error: null }),
      }),
    });

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toHaveLength(1);
    expect(result.completed).toHaveLength(1);
    expect(result.reading[0].title).toBe('Naruto');
  });

  it('should return empty groups when user has no series', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toEqual([]);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('should throw on Supabase error', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed' },
        }),
      }),
    });

    await expect(fetchUserSeriesGrouped('user-123')).rejects.toThrow(
      'Connection failed'
    );
  });

  it('should only fetch series belonging to the specified user', async () => {
    const eqSpy = jest.fn().mockResolvedValue({ data: [], error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: eqSpy }),
    });

    await fetchUserSeriesGrouped('user-123');

    expect(eqSpy).toHaveBeenCalledWith('user_id', 'user-123');
  });
});
```

**Purpose**: Verify Supabase query service fetches and groups correctly
**Preconditions**: Supabase mock configured
**Expected Result**: Series fetched, grouped by status, errors handled

---

#### Test Case 1.2: Handles 100 Series

```typescript
describe('seriesQueryService with large dataset', () => {
  it('should handle 100 series without errors', async () => {
    const mockSeries = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      user_id: 'user-123',
      title: `Series ${i}`,
      status: ['reading', 'completed', 'on_hold', 'plan_to_read'][i % 4],
    }));

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockSeries, error: null }),
      }),
    });

    const result = await fetchUserSeriesGrouped('user-123');
    const total = result.reading.length + result.completed.length +
      result.on_hold.length + result.plan_to_read.length;

    expect(total).toBe(100);
  });
});
```

**Purpose**: Verify service handles maximum expected series count
**Preconditions**: Mock returns 100 series
**Expected Result**: All 100 series grouped correctly

---

### Test Suite 2: Dashboard Page Integration

**File**: `tests/integration/dashboard-page.integration.test.ts`

#### Test Case 2.1: Page Renders with Series Data

```typescript
describe('Dashboard page integration', () => {
  it('should render dashboard with series data from service', async () => {
    const mockData = {
      reading: [{ id: '1', title: 'Naruto', status: 'reading' }],
      completed: [],
      on_hold: [],
      plan_to_read: [],
    };

    jest.spyOn(seriesQueryService, 'fetchUserSeriesGrouped')
      .mockResolvedValue(mockData);

    const { container } = render(await DashboardPage());

    expect(container).toHaveTextContent('Naruto');
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should render empty state when user has no series', async () => {
    jest.spyOn(seriesQueryService, 'fetchUserSeriesGrouped')
      .mockResolvedValue({ reading: [], completed: [], on_hold: [], plan_to_read: [] });

    render(await DashboardPage());

    expect(screen.getByText(/no series being read/i)).toBeInTheDocument();
  });
});
```

**Purpose**: Verify page wires service to components correctly
**Preconditions**: Service mock, component renders
**Expected Result**: Page renders with correct data flow

---

## End-to-End Tests

### Test Suite 1: Dashboard User Journey

**File**: `tests/e2e/dashboard.e2e.test.ts`

#### Test Case 1.1: Authenticated User Views Dashboard

```typescript
describe('Dashboard E2E', () => {
  it('should display dashboard with tabs after login', async () => {
    await page.goto('http://localhost:3000/dashboard');

    await page.waitForSelector('[role="tablist"]');

    expect(await page.$('[role="tab"][name="Reading"]')).toBeTruthy();
    expect(await page.$('[role="tab"][name="Completed"]')).toBeTruthy();
    expect(await page.$('[role="tab"][name="On Hold"]')).toBeTruthy();
    expect(await page.$('[role="tab"][name="Plan to Read"]')).toBeTruthy();
  });

  it('should switch tabs and show correct series', async () => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('[role="tablist"]');

    await page.click('[role="tab"][aria-label="Completed"]');

    const activeTab = await page.$('[role="tab"][aria-selected="true"]');
    const label = await activeTab?.evaluate(el => el.textContent);
    expect(label).toBe('Completed');
  });
});
```

**Purpose**: Verify complete dashboard flow from user perspective
**Preconditions**: App running, test user with series data
**Expected Result**: Dashboard loads, tabs work, series displayed

---

## Manual Testing Scenarios

### Scenario 1: First-Time Dashboard Visit

**Steps**:
1. Log in with a new account (no series)
2. Navigate to `/dashboard`
3. Observe loading skeleton
4. Observe empty state on all tabs
5. Verify CTA links work

**Expected Result**: Empty state shown with encouraging message and working CTA

---

### Scenario 2: Dashboard with Multiple Series

**Steps**:
1. Log in with account that has series in all four statuses
2. Navigate to `/dashboard`
3. Click each tab in order
4. Verify correct series appear in each tab
5. Verify active tab highlighting

**Expected Result**: Correct series in each tab, clear active tab indication

---

### Scenario 3: Mobile Dashboard

**Steps**:
1. Open dashboard on mobile device (or DevTools mobile emulation)
2. Verify all tabs are accessible via horizontal scroll
3. Tap each tab
4. Verify touch targets are large enough (44px+)
5. Verify no horizontal overflow

**Expected Result**: Fully functional on mobile, no overflow issues

---

### Scenario 4: Keyboard-Only Navigation

**Steps**:
1. Open dashboard
2. Tab to the tab bar
3. Use arrow keys to navigate between tabs
4. Press Enter to activate a tab
5. Verify focus indicators are visible

**Expected Result**: Full keyboard navigation works, focus visible

---

### Scenario 5: Screen Reader Compatibility

**Steps**:
1. Enable VoiceOver (macOS) or NVDA (Windows)
2. Navigate to dashboard
3. Verify tab bar is announced as "tablist"
4. Verify each tab is announced with its label and selected state
5. Verify tab panel content is announced after tab activation

**Expected Result**: Screen reader announces all relevant information

---

## Test Data

### Mock Dashboard Data

```typescript
export const mockDashboardData = {
  reading: [
    {
      id: 'series-1',
      user_id: 'user-123',
      title: 'Naruto',
      platform: 'mangadex',
      status: 'reading',
      current_chapter: 450,
      total_chapters: 700,
      cover_url: null,
      last_read_at: '2026-02-17T10:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'series-2',
      user_id: 'user-123',
      title: 'One Piece',
      platform: 'mangadex',
      status: 'reading',
      current_chapter: 1100,
      total_chapters: null,
      cover_url: null,
      last_read_at: '2026-02-18T08:00:00Z',
      created_at: '2026-01-02T00:00:00Z',
    },
  ],
  completed: [
    {
      id: 'series-3',
      user_id: 'user-123',
      title: 'Fullmetal Alchemist',
      platform: 'mangadex',
      status: 'completed',
      current_chapter: 108,
      total_chapters: 108,
      cover_url: null,
      last_read_at: '2026-01-15T12:00:00Z',
      created_at: '2025-12-01T00:00:00Z',
    },
  ],
  on_hold: [
    {
      id: 'series-4',
      user_id: 'user-123',
      title: 'Bleach',
      platform: 'mangadex',
      status: 'on_hold',
      current_chapter: 300,
      total_chapters: 686,
      cover_url: null,
      last_read_at: '2025-11-01T00:00:00Z',
      created_at: '2025-10-01T00:00:00Z',
    },
  ],
  plan_to_read: [
    {
      id: 'series-5',
      user_id: 'user-123',
      title: 'Hunter x Hunter',
      platform: 'mangadex',
      status: 'plan_to_read',
      current_chapter: 0,
      total_chapters: null,
      cover_url: null,
      last_read_at: null,
      created_at: '2026-02-01T00:00:00Z',
    },
  ],
};

export const mockEmptyDashboardData = {
  reading: [],
  completed: [],
  on_hold: [],
  plan_to_read: [],
};
```

---

## Performance Testing

### Dashboard Load Performance

- **Target**: <3 seconds LCP with 100 series
- **Measurement**: Chrome DevTools Lighthouse, Network tab
- **Test**: Load dashboard with 100 series in Supabase test project
- **Pass Criteria**: LCP < 3000ms

### Tab Switch Performance

- **Target**: <100ms tab switch
- **Measurement**: React DevTools Profiler
- **Test**: Click each tab and measure render time
- **Pass Criteria**: Tab panel update < 100ms

### Supabase Query Performance

- **Target**: <500ms query time
- **Measurement**: Supabase dashboard query logs
- **Test**: Query `user_series` with 100 rows, filter by user_id
- **Pass Criteria**: Query execution < 500ms

---

## Accessibility Testing

### axe-core Automated Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Dashboard accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<DashboardTabs data={mockDashboardData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Accessibility Checks

- [ ] Tab bar announced as "tablist" by screen reader
- [ ] Each tab announced with label and selected state
- [ ] Tab panel content announced after activation
- [ ] Focus indicator visible on all interactive elements
- [ ] Color contrast meets 4.5:1 ratio (verified with Colour Contrast Analyser)
- [ ] Touch targets 44px+ on mobile

---

**Document Status**: APPROVED
**Last Reviewed**: 2026-02-18
**Next Review**: 2026-03-18

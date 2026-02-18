# Story 3.1: Dashboard Layout with Tabbed Interface

Status: ready-for-dev

## Story

As a user,
I want to see my series organized in a tabbed dashboard interface,
So that I can easily find series by their reading status.

## Acceptance Criteria

1. Dashboard displays four tabs: "Reading", "Completed", "On Hold", and "Plan to Read"
2. Each tab displays only series in that corresponding status
3. Tabs are responsive and work on mobile and desktop
4. Active tab is clearly highlighted with visual indicator
5. Dashboard loads in under 3 seconds with up to 100 series
6. Tab switching does not require page reload
7. Tab state persists across page navigation (localStorage or URL state)
8. Empty state message displays when tab has no series

## Tasks / Subtasks

- [ ] Task 1: Create DashboardPage component with tab state management (AC: 1, 2, 7)
  - [ ] Subtask 1.1: Set up Next.js page component at src/app/dashboard/page.tsx
  - [ ] Subtask 1.2: Implement tab state using Zustand store (useSeriesStore)
  - [ ] Subtask 1.3: Add localStorage persistence for active tab
  - [ ] Subtask 1.4: Create TabNavigation component with four tab buttons
- [ ] Task 2: Implement tab content rendering with series filtering (AC: 2, 5)
  - [ ] Subtask 2.1: Create TabContent component that filters series by status
  - [ ] Subtask 2.2: Fetch user_series from Supabase with status filter
  - [ ] Subtask 2.3: Implement loading state during data fetch
  - [ ] Subtask 2.4: Add error handling for fetch failures
- [ ] Task 3: Style tabs with responsive design (AC: 3, 4, 6)
  - [ ] Subtask 3.1: Use Tailwind CSS for tab styling with orange accent color
  - [ ] Subtask 3.2: Implement active tab indicator (underline or background)
  - [ ] Subtask 3.3: Add mobile-responsive layout (stack tabs vertically on small screens)
  - [ ] Subtask 3.4: Ensure 44px minimum touch targets for mobile
- [ ] Task 4: Implement empty state and performance optimization (AC: 5, 8)
  - [ ] Subtask 4.1: Create EmptyState component for tabs with no series
  - [ ] Subtask 4.2: Implement React.memo for TabContent to prevent unnecessary re-renders
  - [ ] Subtask 4.3: Add performance metrics logging (dashboard load time)
  - [ ] Subtask 4.4: Verify <3 second load time with 100 series
- [ ] Task 5: Write comprehensive tests (AC: all)
  - [ ] Subtask 5.1: Unit test tab switching logic
  - [ ] Subtask 5.2: Integration test series filtering by status
  - [ ] Subtask 5.3: E2E test full dashboard flow (load, switch tabs, verify content)
  - [ ] Subtask 5.4: Test responsive behavior on mobile viewport

## Dev Notes

### Architecture & Patterns

- **State Management**: Use Zustand `useSeriesStore` with selectors to prevent unnecessary re-renders
  - Store shape: `{ series: Series[], activeTab: 'reading' | 'completed' | 'onHold' | 'planToRead', setActiveTab, fetchSeries }`
  - Fetch series on component mount with `useEffect` hook
  - Filter series client-side after fetch (avoid multiple DB queries)

- **Data Flow**: 
  - Component mounts → fetch user_series from Supabase → store in Zustand → render filtered by activeTab
  - Tab click → update Zustand state → localStorage sync → re-render TabContent
  
- **Performance Considerations**:
  - Fetch all series once, filter client-side (reduces DB queries)
  - Use React.memo on TabContent to prevent re-renders when other tabs switch
  - Implement skeleton loading state for better perceived performance
  - Consider pagination if >100 series (future enhancement per Epic 3.5)

- **Responsive Design**:
  - Desktop: Tabs in horizontal row at top
  - Tablet (768px+): Same horizontal layout
  - Mobile (<768px): Tabs stack or scroll horizontally with overflow
  - Touch targets: 44px minimum height per WCAG guidelines

### Project Structure Notes

- **New Files**:
  - `src/app/dashboard/page.tsx` - Main dashboard page component
  - `src/app/dashboard/layout.tsx` - Optional dashboard layout wrapper
  - `src/components/dashboard/TabNavigation.tsx` - Tab button group
  - `src/components/dashboard/TabContent.tsx` - Content area for active tab
  - `src/components/dashboard/EmptyState.tsx` - Empty tab message
  - `tests/integration/dashboard.integration.test.ts` - Integration tests
  - `tests/e2e/dashboard.e2e.test.ts` - E2E tests

- **Modified Files**:
  - `src/lib/supabase.ts` - Ensure Database type includes user_series table
  - `package.json` - No new dependencies needed (Zustand already present)

- **Alignment with Architecture**:
  - Follows feature-based organization: `src/app/dashboard/` + `src/components/dashboard/`
  - Uses Zustand store pattern established in architecture
  - Respects BMAD boundaries: no direct database access in components
  - API layer will be added in future stories (currently direct Supabase client)

### Testing Standards Summary

- **Unit Tests**: Tab switching logic, filtering logic, state updates
- **Integration Tests**: Series fetch + filter + render flow
- **E2E Tests**: Full user journey (login → dashboard → switch tabs → verify content)
- **Coverage Target**: 80%+ for critical paths (tab logic, filtering)
- **Test Patterns**: Use React Testing Library with `render`, `screen`, `userEvent`
- **Mocks**: Mock Supabase client with test data factories

### References

- [Epic 3 Overview: Series Management & Dashboard](../../planning-artifacts/epics.md#epic-3-series-management--dashboard)
- [Story 3.1 Requirements](../../planning-artifacts/epics.md#story-31-dashboard-layout-with-tabbed-interface)
- [Architecture: Frontend Structure](../../planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: State Management Patterns](../../planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Design System](../../planning-artifacts/epics.md#design-system-requirements-from-ux-design)
- [UX Design: Tabbed Interface](../../planning-artifacts/ux-design-specification.md)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Cascade)

### Debug Log References

None yet - story created fresh

### Completion Notes List

- Story file created with comprehensive context
- All acceptance criteria mapped to tasks
- Architecture patterns documented
- Testing strategy defined
- References to source documents provided

### File List

To be populated during implementation:
- src/app/dashboard/page.tsx
- src/app/dashboard/layout.tsx
- src/components/dashboard/TabNavigation.tsx
- src/components/dashboard/TabContent.tsx
- src/components/dashboard/EmptyState.tsx
- tests/integration/dashboard.integration.test.ts
- tests/e2e/dashboard.e2e.test.ts

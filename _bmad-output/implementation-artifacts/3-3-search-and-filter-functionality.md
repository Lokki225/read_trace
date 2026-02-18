# Story 3.3: Search and Filter Functionality

Status: ready-for-dev

## Story

As a user with many series,
I want to search and filter my series library,
So that I can quickly find specific series.

## Acceptance Criteria

1. Search box filters series in real-time as user types
2. Search matches series titles, genres, and platforms
3. User can filter by platform (MangaDex, other supported sites)
4. User can filter by status (Reading, Completed, On Hold, Plan to Read)
5. User can combine multiple filters simultaneously
6. Search results update without page reload
7. Search is case-insensitive
8. Clear/reset button removes all filters and shows all series

## Tasks / Subtasks

- [ ] Task 1: Create SearchBar component with real-time filtering (AC: 1, 7)
  - [ ] Subtask 1.1: Build SearchBar.tsx component with text input
  - [ ] Subtask 1.2: Implement debounced search (300ms delay)
  - [ ] Subtask 1.3: Add case-insensitive search logic
  - [ ] Subtask 1.4: Update Zustand store with search query
- [ ] Task 2: Implement multi-field search matching (AC: 2)
  - [ ] Subtask 2.1: Create searchSeries utility function
  - [ ] Subtask 2.2: Match against title, genres, and platform fields
  - [ ] Subtask 2.3: Handle partial matches (substring search)
  - [ ] Subtask 2.4: Test with various search terms
- [ ] Task 3: Create FilterPanel component with multiple filters (AC: 3, 4, 5)
  - [ ] Subtask 3.1: Build FilterPanel.tsx with platform and status filters
  - [ ] Subtask 3.2: Implement platform filter (checkbox group)
  - [ ] Subtask 3.3: Implement status filter (checkbox group)
  - [ ] Subtask 3.4: Update Zustand store with active filters
  - [ ] Subtask 3.5: Support combining multiple filters (AND logic)
- [ ] Task 4: Implement filter application and reset (AC: 6, 8)
  - [ ] Subtask 4.1: Create applyFilters utility function
  - [ ] Subtask 4.2: Combine search + platform + status filters
  - [ ] Subtask 4.3: Update TabContent to use filtered series
  - [ ] Subtask 4.4: Add Clear Filters button
  - [ ] Subtask 4.5: Persist filter state to localStorage
- [ ] Task 5: Write comprehensive tests (AC: all)
  - [ ] Subtask 5.1: Unit test search matching logic
  - [ ] Subtask 5.2: Unit test filter application
  - [ ] Subtask 5.3: Unit test filter combination
  - [ ] Subtask 5.4: Integration test search + filter flow
  - [ ] Subtask 5.5: E2E test user search/filter journey

## Dev Notes

### Architecture & Patterns

- **State Management** (Zustand useSeriesStore):
  ```typescript
  {
    series: Series[]
    searchQuery: string
    filters: {
      platforms: string[] // ['mangadex', 'other']
      statuses: string[] // ['reading', 'completed']
    }
    setSearchQuery: (query: string) => void
    setFilters: (filters: Filters) => void
    resetFilters: () => void
    getFilteredSeries: () => Series[] // Computed selector
  }
  ```

- **Search Logic**:
  - Debounce search input by 300ms to avoid excessive filtering
  - Case-insensitive comparison using `.toLowerCase()`
  - Match against: `title`, `genres` (array), `platform`
  - Substring matching: `title.includes(query)` or `genre.includes(query)`

- **Filter Logic**:
  - Platform filter: `series.platform` in selected platforms
  - Status filter: `series.status` in selected statuses
  - Combine with AND logic: series must match search AND all active filters
  - Empty filter array = no filtering for that dimension

- **Performance Considerations**:
  - Use Zustand selector `getFilteredSeries` to memoize results
  - Debounce search to avoid excessive re-renders
  - Consider useMemo for complex filter calculations
  - Filter client-side (all series already fetched in Story 3-1)

- **UI/UX Patterns**:
  - SearchBar at top of dashboard (always visible)
  - FilterPanel below tabs or in collapsible sidebar
  - Show active filter count badge
  - Clear Filters button only visible when filters active
  - Real-time result count display

### Project Structure Notes

- **New Files**:
  - `src/components/dashboard/SearchBar.tsx` - Search input component
  - `src/components/dashboard/FilterPanel.tsx` - Filter controls
  - `src/lib/search.ts` - Search/filter utility functions
  - `tests/unit/search.test.ts` - Search logic tests
  - `tests/unit/FilterPanel.test.tsx` - Filter component tests

- **Modified Files**:
  - `src/store/seriesStore.ts` - Add search/filter state and selectors
  - `src/components/dashboard/TabContent.tsx` - Use filtered series from store
  - `src/app/dashboard/page.tsx` - Add SearchBar and FilterPanel components

- **Integration Points**:
  - SearchBar → updates Zustand store
  - FilterPanel → updates Zustand store
  - TabContent → reads filtered series from Zustand selector
  - No new API calls needed (client-side filtering)

### Testing Standards Summary

- **Unit Tests**: Search matching, filter logic, filter combination
- **Integration Tests**: Search + filter interaction, state updates
- **E2E Tests**: User search/filter workflow
- **Coverage Target**: 85%+ for search/filter logic
- **Test Patterns**: Jest with React Testing Library

### References

- [Story 3.3 Requirements](../../planning-artifacts/epics.md#story-33-search--filter-functionality)
- [Architecture: State Management](../../planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Communication Patterns](../../planning-artifacts/architecture.md#communication-patterns)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Cascade)

### Debug Log References

None yet - story created fresh

### Completion Notes List

- Story file created with comprehensive context
- Search and filter logic documented
- State management structure defined
- Performance considerations noted
- Testing strategy outlined

### File List

To be populated during implementation:
- src/components/dashboard/SearchBar.tsx
- src/components/dashboard/FilterPanel.tsx
- src/lib/search.ts
- tests/unit/search.test.ts
- tests/unit/FilterPanel.test.tsx

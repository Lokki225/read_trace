# Story 3.5: Infinite Scroll for Large Libraries

Status: ready-for-dev

## Story

As a user with many series,
I want to scroll through my library without pagination,
So that I can browse my series smoothly.

## Acceptance Criteria

1. When user has more than 20 series in a tab, additional series load automatically
2. Loading indicator appears while fetching more series
3. No page reload is required for loading additional content
4. Scroll position is maintained when returning to the tab
5. Performance remains smooth with up to 100+ series
6. Infinite scroll works on mobile and desktop
7. User can see how many series are loaded vs. total available
8. Graceful handling when reaching end of list (no more series to load)

## Tasks / Subtasks

- [ ] Task 1: Implement infinite scroll detection (AC: 1, 2)
  - [ ] Subtask 1.1: Create IntersectionObserver hook for scroll detection
  - [ ] Subtask 1.2: Trigger load when user scrolls near bottom (200px threshold)
  - [ ] Subtask 1.3: Implement loading state in Zustand store
  - [ ] Subtask 1.4: Add loading indicator component
- [ ] Task 2: Implement pagination/chunking logic (AC: 1, 5)
  - [ ] Subtask 2.1: Fetch series in chunks of 20
  - [ ] Subtask 2.2: Store loaded series in Zustand
  - [ ] Subtask 2.3: Track current page/offset
  - [ ] Subtask 2.4: Prevent duplicate fetches
- [ ] Task 3: Maintain scroll position and state (AC: 4, 7)
  - [ ] Subtask 3.1: Save scroll position when leaving tab
  - [ ] Subtask 3.2: Restore scroll position when returning
  - [ ] Subtask 3.3: Display "X of Y series loaded" counter
  - [ ] Subtask 3.4: Use sessionStorage for scroll position
- [ ] Task 4: Optimize performance and handle edge cases (AC: 5, 6, 8)
  - [ ] Subtask 4.1: Use React.memo for series cards
  - [ ] Subtask 4.2: Implement virtual scrolling for 100+ series
  - [ ] Subtask 4.3: Handle end-of-list gracefully
  - [ ] Subtask 4.4: Test performance with 100+ series
- [ ] Task 5: Write comprehensive tests (AC: all)
  - [ ] Subtask 5.1: Unit test IntersectionObserver hook
  - [ ] Subtask 5.2: Unit test pagination logic
  - [ ] Subtask 5.3: Integration test infinite scroll flow
  - [ ] Subtask 5.4: E2E test scroll position persistence
  - [ ] Subtask 5.5: Performance test with 100+ series

## Dev Notes

### Architecture & Patterns

- **Infinite Scroll Hook** (useInfiniteScroll):
  ```typescript
  const useInfiniteScroll = (callback: () => void, threshold = 200) => {
    const observerTarget = useRef<HTMLDivElement>(null)
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) callback()
      }, { rootMargin: `${threshold}px` })
      
      if (observerTarget.current) {
        observer.observe(observerTarget.current)
      }
      return () => observer.disconnect()
    }, [callback, threshold])
    
    return observerTarget
  }
  ```

- **State Management** (useSeriesStore):
  ```typescript
  {
    series: Series[]
    isLoadingMore: boolean
    hasMore: boolean
    currentPage: number
    pageSize: number // 20
    totalCount: number
    loadMoreSeries: () => Promise<void>
    setScrollPosition: (position: number) => void
    getScrollPosition: () => number
  }
  ```

- **Pagination Strategy**:
  - Fetch in chunks of 20 series per request
  - Use offset/limit: `offset = page * 20`, `limit = 20`
  - Track `hasMore` flag: if returned count < 20, no more series
  - Prevent duplicate requests with `isLoadingMore` flag

- **Scroll Position Persistence**:
  - Save to sessionStorage on tab change: `sessionStorage.setItem('scroll_tab_reading', scrollY)`
  - Restore on tab return: `window.scrollTo(0, scrollPosition)`
  - Clear on logout

- **Performance Optimization**:
  - Virtual scrolling: Use `react-window` for 100+ series
  - Memoize SeriesCard components
  - Debounce scroll events (100ms)
  - Lazy load images below fold

- **API Pattern**:
  - Endpoint: `GET /api/series?userId=X&status=reading&offset=0&limit=20`
  - Response: `{ data: Series[], hasMore: boolean, total: number }`

### Project Structure Notes

- **New Files**:
  - `src/hooks/useInfiniteScroll.ts` - IntersectionObserver hook
  - `src/components/dashboard/SeriesGrid.tsx` - Updated with infinite scroll
  - `src/components/dashboard/LoadingIndicator.tsx` - Loading state display
  - `src/lib/scrollPosition.ts` - Scroll position utilities
  - `tests/unit/useInfiniteScroll.test.ts` - Hook tests
  - `tests/integration/infiniteScroll.integration.test.ts` - Integration tests

- **Modified Files**:
  - `src/store/seriesStore.ts` - Add pagination state and actions
  - `src/app/api/series/route.ts` - Add offset/limit query params
  - `src/components/dashboard/TabContent.tsx` - Add infinite scroll container
  - `package.json` - Add react-window (optional, for virtual scrolling)

- **Dependencies**:
  - `react-window` - Optional, for virtual scrolling with 100+ series
  - IntersectionObserver - Native browser API (no dependency)

### Testing Standards Summary

- **Unit Tests**: IntersectionObserver hook, pagination logic, scroll position
- **Integration Tests**: Infinite scroll flow, state updates, API calls
- **E2E Tests**: Full user journey (scroll, load, persist position)
- **Performance Tests**: Verify smooth scrolling with 100+ series
- **Coverage Target**: 80%+ for scroll logic

### References

- [Story 3.5 Requirements](../../planning-artifacts/epics.md#story-35-infinite-scroll-for-large-libraries)
- [Architecture: Performance Patterns](../../planning-artifacts/architecture.md#performance-requirements-from-prd)
- [Architecture: Communication Patterns](../../planning-artifacts/architecture.md#communication-patterns)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Cascade)

### Debug Log References

None yet - story created fresh

### Completion Notes List

- Story file created with comprehensive context
- IntersectionObserver pattern documented
- Pagination strategy defined
- Scroll position persistence approach detailed
- Performance optimization techniques outlined

### File List

To be populated during implementation:
- src/hooks/useInfiniteScroll.ts
- src/components/dashboard/LoadingIndicator.tsx
- src/lib/scrollPosition.ts
- tests/unit/useInfiniteScroll.test.ts
- tests/integration/infiniteScroll.integration.test.ts

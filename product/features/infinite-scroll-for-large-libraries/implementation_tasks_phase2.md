# Implementation Tasks: Infinite Scroll for Large Libraries - Phase 2

## Phase 2: Database & Backend Integration

### API Endpoint Setup
- [ ] **Create series pagination endpoint** - Backend support for chunked loading
  - File: `src/app/api/series/route.ts`
  - Verify: Supports `offset` and `limit` query parameters
  - Verify: Returns `{ data: Series[], hasMore: boolean, total: number }`
  
- [ ] **Update Zustand store** - State management for pagination
  - File: `src/store/seriesStore.ts`
  - Verify: Tracks `currentPage`, `pageSize`, `hasMore`, `isLoadingMore`
  - Verify: Implements `loadMoreSeries()` action

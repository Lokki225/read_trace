# Story 3.4: Series Progress Indicators

Status: ready-for-dev

## Story

As a user,
I want to see my reading progress for each series,
So that I can track how far I've progressed through each story.

## Acceptance Criteria

1. Series card displays a progress bar showing percentage completion (0-100%)
2. Progress bar shows current chapter/page number
3. Progress bar shows total chapters (if available)
4. Progress bar displays last read date
5. Progress updates in real-time as user reads
6. Progress bar uses the orange accent color (#FF7A45)
7. Progress indicators are accessible with proper ARIA labels
8. Progress calculation handles edge cases (no chapters, in-progress series)

## Tasks / Subtasks

- [ ] Task 1: Create ProgressIndicator component with percentage bar (AC: 1, 6)
  - [ ] Subtask 1.1: Build ProgressIndicator.tsx component
  - [ ] Subtask 1.2: Implement percentage bar using Tailwind CSS
  - [ ] Subtask 1.3: Style with orange accent color (#FF7A45)
  - [ ] Subtask 1.4: Add smooth progress animation (transition)
- [ ] Task 2: Display chapter/page and date information (AC: 2, 3, 4)
  - [ ] Subtask 2.1: Add chapter display (current/total format)
  - [ ] Subtask 2.2: Format last read date (relative: "2 days ago" or absolute)
  - [ ] Subtask 2.3: Handle missing data gracefully (show "--" or "Not started")
  - [ ] Subtask 2.4: Layout: bar on top, metadata below
- [ ] Task 3: Implement real-time progress updates (AC: 5)
  - [ ] Subtask 3.1: Subscribe to reading_progress Supabase Realtime
  - [ ] Subtask 3.2: Update Zustand store on progress change
  - [ ] Subtask 3.3: Re-render ProgressIndicator with new data
  - [ ] Subtask 3.4: Handle connection errors gracefully
- [ ] Task 4: Handle edge cases and accessibility (AC: 7, 8)
  - [ ] Subtask 4.1: Handle series with no chapters (show 0%)
  - [ ] Subtask 4.2: Handle series with unknown total chapters
  - [ ] Subtask 4.3: Add ARIA labels for screen readers
  - [ ] Subtask 4.4: Test with various data scenarios
- [ ] Task 5: Write comprehensive tests (AC: all)
  - [ ] Subtask 5.1: Unit test progress calculation
  - [ ] Subtask 5.2: Unit test date formatting
  - [ ] Subtask 5.3: Unit test edge case handling
  - [ ] Subtask 5.4: Integration test Realtime updates
  - [ ] Subtask 5.5: Accessibility test (ARIA labels)

## Dev Notes

### Architecture & Patterns

- **Data Shape** (from reading_progress table):
  ```typescript
  interface ReadingProgress {
    id: string
    user_id: string
    series_id: string
    current_chapter: number
    total_chapters?: number
    current_page?: number
    total_pages?: number
    progress_percentage: number // Calculated: (current / total) * 100
    last_read_date: string // ISO 8601
    last_read_platform: string
    updated_at: string
  }
  ```

- **Progress Calculation**:
  - If `total_chapters` exists: `(current_chapter / total_chapters) * 100`
  - If only `current_page` exists: `(current_page / total_pages) * 100`
  - If neither: `0%` (not started)
  - Cap at 100% to prevent overflow

- **Real-time Updates**:
  - Subscribe to `reading_progress` table filtered by `user_id`
  - Listen for INSERT and UPDATE events
  - Update Zustand store on change
  - Trigger re-render of affected SeriesCard
  - Unsubscribe on component unmount

- **Date Formatting**:
  - Use `date-fns` library for relative dates ("2 days ago")
  - Fallback to absolute date if older than 7 days
  - Format: "Last read: 2 days ago" or "Last read: Feb 18, 2026"

- **Performance Considerations**:
  - Memoize ProgressIndicator to prevent unnecessary re-renders
  - Debounce Realtime updates (100ms) to avoid excessive renders
  - Only subscribe to current user's progress
  - Unsubscribe when component unmounts

### Project Structure Notes

- **New Files**:
  - `src/components/dashboard/ProgressIndicator.tsx` - Progress bar component
  - `src/lib/progress.ts` - Progress calculation utilities
  - `src/lib/dateFormat.ts` - Date formatting utilities
  - `tests/unit/progress.test.ts` - Progress calculation tests
  - `tests/unit/dateFormat.test.ts` - Date formatting tests
  - `tests/integration/progressRealtime.integration.test.ts` - Realtime tests

- **Modified Files**:
  - `src/components/dashboard/SeriesCard.tsx` - Add ProgressIndicator
  - `src/store/seriesStore.ts` - Add Realtime subscription logic
  - `package.json` - Add date-fns dependency (if not present)

- **Dependencies**:
  - `date-fns` - For date formatting and relative time
  - Already have: `@supabase/supabase-js` (Realtime)

### Testing Standards Summary

- **Unit Tests**: Progress calculation, date formatting, edge cases
- **Integration Tests**: Realtime subscription and updates
- **Coverage Target**: 85%+ for progress logic
- **Test Patterns**: Jest with React Testing Library
- **Mock Supabase Realtime**: Use jest.mock for subscription testing

### References

- [Story 3.4 Requirements](../../planning-artifacts/epics.md#story-34-series-progress-indicators)
- [Architecture: Real-time Patterns](../../planning-artifacts/architecture.md#communication-patterns)
- [Database: reading_progress table](../../planning-artifacts/epics.md#epic-3-series-management--dashboard)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Cascade)

### Debug Log References

None yet - story created fresh

### Completion Notes List

- Story file created with comprehensive context
- Progress calculation logic documented
- Real-time update strategy defined
- Edge case handling specified
- Date formatting approach detailed

### File List

To be populated during implementation:
- src/components/dashboard/ProgressIndicator.tsx
- src/lib/progress.ts
- src/lib/dateFormat.ts
- tests/unit/progress.test.ts
- tests/unit/dateFormat.test.ts
- tests/integration/progressRealtime.integration.test.ts

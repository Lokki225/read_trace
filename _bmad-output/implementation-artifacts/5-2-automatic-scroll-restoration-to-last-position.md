# Story 5.2: Automatic Scroll Restoration to Last Position

Status: done

## Story

As a user,
I want to be automatically scrolled to my last reading position,
So that I don't have to manually find where I left off.

## Acceptance Criteria

1. **Given** I click resume on a series
   **When** the page loads
   **Then** the browser automatically scrolls to my last position

2. **Given** the page is loading
   **When** scroll restoration is triggered
   **Then** scroll restoration happens within 1 second

3. **Given** the page is loading content
   **When** scroll restoration occurs
   **Then** the page is fully loaded before scrolling

4. **Given** I have a saved scroll position
   **When** the page scrolls to that position
   **Then** scroll position is accurate to within 1-2 pixels

5. **Given** my saved scroll position is no longer valid
   **When** the page loads
   **Then** I'm scrolled to the chapter start

6. **Given** scroll restoration occurs
   **When** the user sees the page
   **Then** visual feedback confirms the scroll action

## Tasks / Subtasks

- [ ] Task 1: Add scroll_position field to reading_progress schema (AC: #1, #4)
  - [ ] Subtask 1.1: Update database/migrations to add scroll_position INTEGER to reading_progress
  - [ ] Subtask 1.2: Update src/model/schemas/extension.ts with scroll_position: number
  - [ ] Subtask 1.3: Update src/lib/supabase.ts Database type for reading_progress

- [ ] Task 2: Create scroll position tracking in extension (AC: #1, #4)
  - [ ] Subtask 2.1: Update src/extension/content.ts to track scroll position
  - [ ] Subtask 2.2: Debounce scroll events (500ms) to avoid excessive updates
  - [ ] Subtask 2.3: Calculate scroll percentage (0-100) or pixel offset
  - [ ] Subtask 2.4: Send scroll position with progress updates

- [ ] Task 3: Create scroll restoration hook (AC: #1, #2, #3, #5, #6)
  - [ ] Subtask 3.1: Create src/hooks/useScrollRestoration.ts
  - [ ] Subtask 3.2: Fetch scroll position from reading_progress
  - [ ] Subtask 3.3: Wait for page to be fully loaded (document.readyState === 'complete')
  - [ ] Subtask 3.4: Restore scroll position with smooth animation
  - [ ] Subtask 3.5: Handle invalid positions (scroll to chapter start)
  - [ ] Subtask 3.6: Add visual feedback (highlight, pulse animation)

- [ ] Task 4: Integrate scroll restoration into reading pages (AC: #1, #2, #3, #5, #6)
  - [ ] Subtask 4.1: Create src/extension/pages/ReaderPage.tsx or similar
  - [ ] Subtask 4.2: Use useScrollRestoration hook on page mount
  - [ ] Subtask 4.3: Pass series_id and chapter_id to hook
  - [ ] Subtask 4.4: Handle loading states gracefully

- [ ] Task 5: Add scroll position validation (AC: #4, #5)
  - [ ] Subtask 5.1: Create src/lib/scrollValidation.ts
  - [ ] Subtask 5.2: Validate scroll position against page height
  - [ ] Subtask 5.3: Clamp position to valid range (0 to max scroll)
  - [ ] Subtask 5.4: Detect if position is no longer valid (page changed)

- [ ] Task 6: Add tests for scroll restoration (AC: all)
  - [ ] Subtask 6.1: Create tests/unit/useScrollRestoration.test.ts (15+ tests)
  - [ ] Subtask 6.2: Test scroll position calculation
  - [ ] Subtask 6.3: Test page load detection
  - [ ] Subtask 6.4: Test position validation and clamping
  - [ ] Subtask 6.5: Test visual feedback (animation)

- [ ] Task 7: Add integration tests (AC: all)
  - [ ] Subtask 7.1: Create tests/integration/scroll-restoration.integration.test.ts
  - [ ] Subtask 7.2: Test full flow: resume → page load → scroll restoration
  - [ ] Subtask 7.3: Test with different page heights and content
  - [ ] Subtask 7.4: Test timing (within 1 second)

## Dev Notes

### Architecture & Patterns

- **Hook Pattern**: useScrollRestoration is a custom React hook for reusability
- **Data Flow**: reading_progress table stores scroll_position → hook fetches → restores on mount
- **Timing**: Use document.readyState or window.onload to ensure page is ready
- **Validation**: Scroll position must be validated against current page height
- **Visual Feedback**: Use CSS animation (pulse or highlight) to show scroll action

### Technical Requirements

- **Database**: Add scroll_position INTEGER column to reading_progress table
- **Schema**: Update ProgressData interface with scroll_position: number
- **Extension**: Modify content.ts to track and send scroll position with updates
- **Hook**: Create useScrollRestoration with async loading and error handling
- **Timing**: Scroll restoration must complete within 1 second
- **Accuracy**: Position accurate to within 1-2 pixels (use Math.round())

### File Structure Requirements

```
src/
  extension/
    content.ts                (modify - track scroll position)
  hooks/
    useScrollRestoration.ts   (new)
  lib/
    scrollValidation.ts       (new)
  model/schemas/
    extension.ts              (modify - add scroll_position)
  lib/
    supabase.ts               (modify - reading_progress type)
database/
  migrations/
    013_add_scroll_position_to_reading_progress.sql (new)
tests/
  unit/
    useScrollRestoration.test.ts (new)
    scrollValidation.test.ts  (new)
  integration/
    scroll-restoration.integration.test.ts (new)
```

### Testing Requirements

- **Unit Tests**: useScrollRestoration hook (15+ tests)
  - Scroll position calculation
  - Page load detection
  - Position validation and clamping
  - Error handling (missing data)
  - Timing (within 1 second)
  - Visual feedback animation

- **Unit Tests**: scrollValidation utility (8+ tests)
  - Valid position detection
  - Position clamping
  - Edge cases (0, max, negative)

- **Integration Tests**: Full scroll restoration flow (10+ tests)
  - Resume → page load → scroll restoration
  - Different page heights
  - Timing validation
  - Visual feedback

- **Coverage Target**: 90%+ for scroll restoration logic

### Previous Story Intelligence

**Story 5.1 (Resume Button)** established:
- Resume navigation to scanlation sites
- Loading state feedback
- Navigation within 2 seconds

**Story 4.1 (Content Script)** established:
- DOM monitoring and scroll tracking
- Progress update sending
- Debouncing patterns (500ms)

**Story 4.3 (Realtime Subscriptions)** established:
- reading_progress table structure
- Supabase update patterns
- Conflict resolution

### Architecture Compliance

**BMAD Boundaries**:
- Extension: content.ts (DOM monitoring, scroll tracking)
- Hook: useScrollRestoration (UI logic, React integration)
- Lib: scrollValidation.ts (pure utility functions)
- Database: reading_progress table (data persistence)

**Forbidden Patterns**:
- ❌ Direct DOM manipulation outside of React (use refs if needed)
- ❌ Global scroll state (use local hook state)
- ❌ Synchronous scroll (use requestAnimationFrame)

### Performance Considerations

- **Debouncing**: Scroll tracking debounced at 500ms (from Story 4.1)
- **Loading**: Use document.readyState to avoid premature scrolling
- **Animation**: Use CSS transitions for smooth scroll (requestAnimationFrame)
- **Validation**: Validate position before scrolling (prevent invalid jumps)
- **Timeout**: Set 1-second timeout for scroll restoration

### Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+ (full support)
- **Scroll Behavior**: Use smooth scroll if supported, fallback to instant
- **Page Load Detection**: Use document.readyState (all modern browsers)

### References

- [Epic 5 Overview](../planning-artifacts/epics.md#epic-5-one-click-resume--navigation)
- [Story 4.1 Content Script](./4-1-browser-extension-content-script-for-dom-monitoring.md)
- [Story 4.3 Realtime Subscriptions](./4-3-supabase-real-time-subscriptions-for-cross-device-sync.md)
- [Architecture: Reading Progress](../planning-artifacts/architecture.md#reading-progress-tracking)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Completion Notes List

- [ ] Database migration created for scroll_position column
- [ ] Extension content.ts updated to track scroll position
- [ ] useScrollRestoration hook created with full error handling
- [ ] scrollValidation utility created with edge case handling
- [ ] Visual feedback animation implemented
- [ ] All unit tests passing (23+ tests)
- [ ] All integration tests passing (10+ tests)
- [ ] Timing validation confirmed (within 1 second)
- [ ] Code review checklist completed
- [ ] Confidence score ≥90% achieved

### File List

- [ ] database/migrations/013_add_scroll_position_to_reading_progress.sql
- [ ] src/extension/content.ts (modified)
- [ ] src/hooks/useScrollRestoration.ts
- [ ] src/lib/scrollValidation.ts
- [ ] src/model/schemas/extension.ts (modified)
- [ ] src/lib/supabase.ts (modified)
- [ ] tests/unit/useScrollRestoration.test.ts
- [ ] tests/unit/scrollValidation.test.ts
- [ ] tests/integration/scroll-restoration.integration.test.ts

### Change Log

- Initial story creation with comprehensive context

# Implementation Tasks: Phase 3 - Core Implementation

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 3: Core Implementation

### Business Logic Implementation

- [ ] **Implement scrollValidation utility**
  - File: `src/lib/scrollValidation.ts`
  - Implement: `isValidPosition(position: number, pageHeight: number): boolean`
    - Check: position >= 0 and position <= pageHeight
    - Return: true if valid, false otherwise
  - Implement: `clampPosition(position: number, pageHeight: number): number`
    - Clamp position to valid range [0, pageHeight]
    - Return: clamped position
  - Implement: `calculateScrollPercentage(pixels: number, pageHeight: number): number`
    - Convert pixel offset to percentage (0-100)
    - Return: percentage value
  - Verify: All functions are pure with no side effects
  - Verify: Edge cases handled (0, negative, exceeds max)

### React Hook Implementation

- [ ] **Create useScrollRestoration hook**
  - File: `src/hooks/useScrollRestoration.ts`
  - Implement: Hook parameters (seriesId, chapterId, userId)
  - Implement: Fetch scroll position from reading_progress
  - Implement: Wait for document.readyState === 'complete'
  - Implement: Validate position before restoring
  - Implement: Smooth scroll animation using window.scrollTo()
  - Implement: Visual feedback (pulse animation)
  - Implement: Error handling for missing data
  - Implement: Timeout (1 second max)
  - Verify: Follows React hooks best practices
  - Verify: Proper cleanup on unmount

### Extension Content Script Updates

- [ ] **Update content.ts to track scroll position**
  - File: `src/extension/content.ts`
  - Add: Track scroll position in state
  - Add: Debounce scroll events (500ms)
  - Add: Include scroll_position in progress updates
  - Verify: Scroll tracking doesn't impact performance
  - Verify: Debouncing works correctly

### Page Integration

- [ ] **Create or update reader page component**
  - File: `src/app/reader/[seriesId]/[chapterId]/page.tsx` (or similar)
  - Add: useScrollRestoration hook on mount
  - Add: Pass series_id, chapter_id to hook
  - Add: Handle loading states gracefully
  - Verify: Scroll restoration happens on page load
  - Verify: Visual feedback visible to user

### Visual Feedback Implementation

- [ ] **Create scroll restoration animation**
  - File: `src/styles/scroll-restoration.css` (or in component)
  - Add: Pulse animation for visual feedback
  - Add: Highlight effect on restored content
  - Verify: Animation is subtle and non-intrusive
  - Verify: Animation completes within 1 second

---

## Verification Checklist

- [ ] scrollValidation utility created and tested
- [ ] useScrollRestoration hook created with error handling
- [ ] Extension content.ts updated to track scroll position
- [ ] Reader page integrated with scroll restoration
- [ ] Visual feedback animation implemented
- [ ] All edge cases handled (invalid positions, missing data)
- [ ] Timing validated (within 1 second)
- [ ] No performance regressions

---

## Notes

- Use requestAnimationFrame for smooth scrolling
- Validate position against current page height
- Handle dynamic content that changes page height
- Fallback to top of page if position invalid
- Visual feedback via CSS animation (pulse or highlight)

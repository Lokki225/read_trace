# Implementation Tasks - Phase 3: Core Implementation

**Story**: 5-1 - Resume Button on Series Cards  
**Phase**: 3 - Core Implementation  
**Depends On**: Phase 2 Complete  

## Phase 3: Core Implementation

### Task 1: Implement ResumeButton Component

- [ ] Create `src/components/dashboard/ResumeButton.tsx`:
  - Accept ResumeButtonProps (seriesId, seriesTitle, resumeUrl)
  - Implement loading state with useState
  - Render button with orange background (#FF7A45)
  - Add loading spinner during navigation
  - Implement onClick handler with window.open()
  - Add aria-label with series title
  - Add keyboard support (Enter/Space)
  - Add hover effects (darker orange)
  - Add focus indicator
  - Wrap with React.memo for performance
  - Add JSDoc comments

- [ ] Component features:
  - Loading spinner from existing LoadingIndicator component
  - Button disabled during loading
  - 2-second timeout for navigation
  - Error handling with user message
  - Responsive design (44x44px minimum on mobile)

### Task 2: Implement Fallback Message Component

- [ ] Create fallback message in ResumeButton:
  - Show "Start Reading" message when resumeUrl is null
  - Include link to series page
  - Style consistently with card design
  - Make accessible to screen readers

### Task 3: Integrate ResumeButton into SeriesCard

- [ ] Update `src/components/dashboard/SeriesCard.tsx`:
  - Import ResumeButton component
  - Add resumeUrl prop to SeriesCard
  - Conditionally render ResumeButton or fallback message
  - Pass seriesId, seriesTitle, resumeUrl to ResumeButton
  - Maintain existing SeriesCard styling and layout
  - Update SeriesCard JSDoc comments

### Task 4: Update SeriesGrid Component

- [ ] Verify `src/components/dashboard/SeriesGrid.tsx`:
  - Passes resume_url from series data to SeriesCard
  - No changes needed if data flow is correct
  - Verify type safety

### Task 5: Create Unit Tests for ResumeButton

- [ ] Create `tests/unit/ResumeButton.test.tsx`:
  - Test rendering with resumeUrl
  - Test rendering without resumeUrl (fallback message)
  - Test loading state on click
  - Test button disabled during loading
  - Test spinner visibility
  - Test aria-label
  - Test keyboard activation (Enter/Space)
  - Test hover effects
  - Test focus indicator
  - Test responsive design
  - Test error handling
  - Test window.open() called with correct URL
  - Minimum 12 tests

- [ ] Run tests: `npm test -- tests/unit/ResumeButton.test.tsx`
- [ ] Verify 90%+ code coverage

### Task 6: Create Integration Tests for SeriesCard + ResumeButton

- [ ] Create `tests/integration/resume-button.integration.test.tsx`:
  - Test ResumeButton renders in SeriesCard
  - Test data flow from SeriesCard to ResumeButton
  - Test navigation opens new tab
  - Test fallback message displays when no resumeUrl
  - Test SeriesCard memo prevents unnecessary re-renders
  - Test multiple cards render independently
  - Minimum 8 tests

- [ ] Run tests: `npm test -- tests/integration/resume-button.integration.test.tsx`
- [ ] Verify tests pass

### Task 7: Update Component Tests

- [ ] Update `tests/unit/SeriesCard.test.tsx`:
  - Add tests for ResumeButton integration
  - Test resumeUrl prop passed correctly
  - Test fallback message rendering
  - Verify existing tests still pass

- [ ] Update `tests/unit/SeriesGrid.test.tsx`:
  - Verify resume_url data passed to SeriesCard
  - Verify existing tests still pass

### Task 8: Verify Full Integration

- [ ] Run full test suite: `npm test`
- [ ] Verify no regressions
- [ ] Check code coverage (target: 90%+)
- [ ] Verify TypeScript compilation: `npm run build`
- [ ] Run linter: `npm run lint`

## Verification Commands

```bash
# Run ResumeButton tests
npm test -- tests/unit/ResumeButton.test.tsx

# Run integration tests
npm test -- tests/integration/resume-button.integration.test.tsx

# Run all tests
npm test

# Check coverage
npm test -- --coverage

# Build project
npm run build

# Run linter
npm run lint
```

## Quality Gates

- [ ] ResumeButton component implemented
- [ ] Fallback message implemented
- [ ] SeriesCard integration complete
- [ ] All unit tests passing (12+ tests)
- [ ] All integration tests passing (8+ tests)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code coverage ≥90%
- [ ] No regressions in existing tests

## Notes

- Follow existing SeriesCard patterns (React.memo, Tailwind CSS)
- Use orange brand color (#FF7A45) consistently
- Ensure accessibility (aria-label, keyboard support, focus indicators)
- Handle all error cases gracefully
- Test on mobile and desktop viewports

---

**Status**: READY FOR PHASE 4  
**Estimated Duration**: 4-5 hours  
**Last Updated**: 2026-02-19

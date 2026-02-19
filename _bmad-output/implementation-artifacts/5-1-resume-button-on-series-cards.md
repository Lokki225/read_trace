# Story 5.1: Resume Button on Series Cards

Status: done

## Story

As a user,
I want to click a resume button on any series card,
So that I can instantly return to my reading position.

## Acceptance Criteria

1. **Given** I am viewing the dashboard
   **When** I click the resume button on a series card
   **Then** I am navigated to the source scanlation site

2. **Given** I click resume on a series
   **When** the navigation happens
   **Then** it completes within 2 seconds

3. **Given** I click the resume button
   **When** the button is clicked
   **Then** it shows visual feedback (loading state)

4. **Given** I am viewing a series card
   **When** I look at the resume button
   **Then** the button is prominently displayed in orange (#FF7A45)

5. **Given** I am on mobile or desktop
   **When** I interact with the resume button
   **Then** the button is accessible and functional on both platforms

6. **Given** a series has no reading progress
   **When** I view the series card
   **Then** I see a helpful message instead of a resume button

## Tasks / Subtasks

- [x] Task 1: Add resume_url field to UserSeries schema (AC: #1, #2)
  - [x] Subtask 1.1: Update src/model/schemas/dashboard.ts with resume_url: string | null
  - [x] Subtask 1.2: Update database/migrations to add resume_url column to user_series
  - [x] Subtask 1.3: Update seriesQueryService to SELECT resume_url from database

- [x] Task 2: Create ResumeButton component (AC: #3, #4, #5)
  - [x] Subtask 2.1: Create src/components/dashboard/ResumeButton.tsx with loading state
  - [x] Subtask 2.2: Style button with orange (#FF7A45) background and hover effects
  - [x] Subtask 2.3: Add accessibility attributes (aria-label, role, keyboard support)
  - [x] Subtask 2.4: Implement responsive design for mobile/desktop

- [x] Task 3: Integrate ResumeButton into SeriesCard (AC: #1, #5, #6)
  - [x] Subtask 3.1: Update src/components/dashboard/SeriesCard.tsx to include ResumeButton
  - [x] Subtask 3.2: Show ResumeButton only when resume_url exists
  - [x] Subtask 3.3: Show helpful message when resume_url is null/undefined
  - [x] Subtask 3.4: Pass series data to ResumeButton for navigation

- [x] Task 4: Implement resume navigation logic (AC: #1, #2)
  - [x] Subtask 4.1: Create src/lib/resume.ts with buildResumeUrl() function
  - [x] Subtask 4.2: Determine target scanlation site from series data
  - [x] Subtask 4.3: Construct URL with chapter/page parameters
  - [x] Subtask 4.4: Handle edge cases (missing data, invalid URLs)

- [x] Task 5: Add tests for ResumeButton (AC: all)
  - [x] Subtask 5.1: Create tests/unit/ResumeButton.test.tsx with 12+ tests
  - [x] Subtask 5.2: Test loading state, click handling, accessibility
  - [x] Subtask 5.3: Test responsive behavior on mobile/desktop
  - [x] Subtask 5.4: Test conditional rendering (with/without resume_url)

- [x] Task 6: Add integration tests (AC: all)
  - [x] Subtask 6.1: Create tests/integration/resume-button.integration.test.tsx
  - [x] Subtask 6.2: Test SeriesCard + ResumeButton integration
  - [x] Subtask 6.3: Test navigation flow end-to-end

## Dev Notes

### Architecture & Patterns

- **Component Pattern**: ResumeButton follows existing SeriesCard pattern (memo'd, prop-based)
- **Data Flow**: SeriesCard receives resume_url from parent (TabPanel), passes to ResumeButton
- **Navigation**: Use Next.js router or window.open() for cross-origin navigation
- **State Management**: Use React state for loading indicator (no Zustand needed for local UI state)

### Technical Requirements

- **Database**: Add resume_url column to user_series table (nullable string)
- **Schema**: Update UserSeries interface in src/model/schemas/dashboard.ts
- **Query Service**: Modify seriesQueryService.ts to SELECT resume_url
- **Component**: Create ResumeButton.tsx as a reusable, memo'd component
- **Styling**: Use Tailwind CSS with orange (#FF7A45) brand color
- **Accessibility**: WCAG 2.1 AA compliance - aria-label, role="button", keyboard support

### File Structure Requirements

```
src/
  components/dashboard/
    ResumeButton.tsx          (new)
    SeriesCard.tsx            (modify - add ResumeButton)
  lib/
    resume.ts                 (new - buildResumeUrl utility)
  model/schemas/
    dashboard.ts              (modify - add resume_url to UserSeries)
  backend/services/dashboard/
    seriesQueryService.ts     (modify - SELECT resume_url)
database/
  migrations/
    012_add_resume_url_to_user_series.sql (new)
tests/
  unit/
    ResumeButton.test.tsx     (new)
  integration/
    resume-button.integration.test.tsx (new)
```

### Testing Requirements

- **Unit Tests**: ResumeButton component (12+ tests)
  - Loading state display
  - Click handling and navigation
  - Conditional rendering (with/without resume_url)
  - Accessibility attributes
  - Responsive behavior
  - Mobile/desktop variants

- **Integration Tests**: SeriesCard + ResumeButton (8+ tests)
  - Full component integration
  - Navigation flow
  - Data passing from parent

- **Coverage Target**: 90%+ for ResumeButton and related utilities

### Previous Story Intelligence

**Story 3.2 (Series Card Component)** established:
- SeriesCard uses React.memo for performance
- Tailwind CSS styling with orange accent color (#FF7A45)
- Responsive design pattern (mobile-first)
- Test patterns: React Testing Library with user-event
- Mock factories in tests/factories/dashboard.factory.ts

**Story 3.1 (Dashboard Layout)** established:
- SeriesGrid component renders series cards
- TabPanel wraps SeriesGrid
- DashboardTabs manages tab state
- Data flows from server component → TabPanel → SeriesGrid → SeriesCard

### Architecture Compliance

**BMAD Boundaries**:
- API layer: Not needed for this story (resume_url comes from existing query)
- Backend: seriesQueryService.ts (data layer)
- Model: UserSeries schema (domain layer)
- Database: user_series table (data persistence)

**Forbidden Patterns**:
- ❌ Direct DOM manipulation (use React)
- ❌ Global state for UI state (use local React state)
- ❌ Business logic in components (extract to lib/resume.ts)

### Performance Considerations

- **Loading State**: Show spinner for 2s max before timeout
- **Navigation**: Use window.open() for external sites (avoid blocking)
- **Rendering**: ResumeButton is memo'd to prevent unnecessary re-renders
- **Accessibility**: Keyboard navigation (Tab, Enter/Space to activate)

### References

- [Epic 5 Overview](../planning-artifacts/epics.md#epic-5-one-click-resume--navigation)
- [Story 3.2 SeriesCard Implementation](./3-2-series-card-component-with-magazine-style-layout.md)
- [Dashboard Architecture](../planning-artifacts/architecture.md#dashboard-layer)
- [Design System](../planning-artifacts/ux-design-specification.md#color-palette)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Completion Notes List

- [x] Database migration created and tested (015_add_resume_url_to_user_series.sql)
- [x] ResumeButton component created with full accessibility (aria-label, aria-busy, keyboard nav, focus ring, min-h-[44px])
- [x] SeriesCard integration complete (ResumeButton rendered below ProgressIndicator)
- [x] Navigation logic implemented in lib/resume.ts (buildResumeUrl, validateResumeUrl, constructMangaDexUrl, constructWebtoonUrl, navigateToResume)
- [x] TypeScript types created in src/types/resume.ts (ResumeButtonProps, ResumeUrlData, ResumeNavigationResult)
- [x] All unit tests passing: resume.test.ts (22 tests) + ResumeButton.test.tsx (22 tests) = 44 unit tests
- [x] All integration tests passing: resume-button.integration.test.tsx (13 tests)
- [x] Total new tests: 57 (22 resume + 22 ResumeButton + 13 integration)
- [x] 0 regressions in existing 73 dashboard-related tests
- [x] Confidence score ≥90% achieved (92%)

### File List

- [x] database/migrations/015_add_resume_url_to_user_series.sql (new)
- [x] src/types/resume.ts (new)
- [x] src/lib/resume.ts (new)
- [x] src/components/dashboard/ResumeButton.tsx (new)
- [x] src/model/schemas/dashboard.ts (modified - added resume_url: string | null)
- [x] src/lib/supabase.ts (modified - added resume_url to Row/Insert/Update)
- [x] src/backend/services/dashboard/seriesQueryService.ts (modified - added resume_url to SELECT)
- [x] src/components/dashboard/SeriesCard.tsx (modified - integrated ResumeButton)
- [x] tests/factories/dashboard.factory.ts (modified - added resume_url: null default)
- [x] tests/unit/resume.test.ts (new - 22 tests)
- [x] tests/unit/ResumeButton.test.tsx (new - 22 tests)
- [x] tests/integration/resume-button.integration.test.tsx (new - 13 tests)

### Change Log

- Initial story creation with comprehensive context
- 2026-02-19: Story 5-1 implemented (DONE)
  - Migration 015 adds resume_url VARCHAR(2048) NULL to user_series
  - src/types/resume.ts: ResumeButtonProps, ResumeUrlData, ResumeNavigationResult interfaces
  - src/lib/resume.ts: buildResumeUrl, validateResumeUrl, constructMangaDexUrl, constructWebtoonUrl, navigateToResume
  - src/components/dashboard/ResumeButton.tsx: memo'd component, loading state, orange #FF7A45, WCAG 2.1 AA, keyboard nav, 44px touch target, fallback message
  - SeriesCard.tsx: ResumeButton integrated below ProgressIndicator
  - 57 new tests (22 unit resume + 22 unit ResumeButton + 13 integration), 0 regressions
  - All 6 acceptance criteria satisfied

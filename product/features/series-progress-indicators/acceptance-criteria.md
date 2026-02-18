# Acceptance Criteria: Series Progress Indicators

## Overview

**Feature**: Series Progress Indicators  
**Feature ID**: 3-4  
**Story**: [Story 3.4: Series Progress Indicators](../../../_bmad-output/implementation-artifacts/3-4-series-progress-indicators.md)  
**Last Updated**: 2026-02-18  

This document defines the acceptance criteria for the series progress indicators using Behavior-Driven Development (BDD) format with Gherkin syntax.

## Acceptance Criteria

### AC-1: Progress Bar Percentage Display

```gherkin
Given a series card on the dashboard
When the user views the card
Then a progress bar must be visible
And it must accurately represent the percentage completion (0-100%)
And it must use the brand orange color (#FF7A45)
```

**Rationale**: Provides immediate visual feedback on reading status.  
**Related User Story**: 3.4  
**Test Scenarios**: [test-scenarios.md](./test-scenarios.md)

---

### AC-2: Chapter and Page Information

```gherkin
Given a series with reading progress data
When the user views the progress indicator
Then it must display the current chapter/page number
And it must display the total chapters if available (e.g., "Ch. 12 / 50")
```

**Rationale**: Gives users specific context about their exact position in the series.  
**Related User Story**: 3.4  
**Test Scenarios**: [test-scenarios.md](./test-scenarios.md)

---

### AC-3: Last Read Date

```gherkin
Given a series that has been read
When the user views the progress indicator
Then it must display the last read date
And the date should be formatted relatively for recent activity (e.g., "2 days ago")
```

**Rationale**: Helps users identify which series they've interacted with most recently.  
**Related User Story**: 3.4  
**Test Scenarios**: [test-scenarios.md](./test-scenarios.md)

---

### AC-4: Real-time Progress Updates

```gherkin
Given the dashboard is open
When reading progress is updated (e.g., via the extension or another tab)
Then the progress bar and metadata must update in real-time without a page refresh
```

**Rationale**: Ensures the UI always reflects the most current data without manual intervention.  
**Related User Story**: 3.4  
**Test Scenarios**: [test-scenarios.md](./test-scenarios.md)

---

### AC-5: Accessibility and ARIA Support

```gherkin
Given a user navigating with a screen reader
When they focus on the progress indicator
Then they must hear a clear description of the progress (e.g., "Progress: 45 percent, Chapter 12 of 50")
And the progress bar must use appropriate ARIA roles (e.g., role="progressbar")
```

**Rationale**: Ensures the feature is usable by all users, including those with visual impairments.  
**Related User Story**: 3.4  
**Test Scenarios**: [test-scenarios.md](./test-scenarios.md)

---

### AC-6: Edge Case Handling

```gherkin
Given a series with no chapters or unknown total chapters
When the user views the progress indicator
Then it must handle the missing data gracefully (e.g., show 0% or "Not started")
And it should not break the layout or display "NaN" or "Infinity"
```

**Rationale**: Prevents UI breakage and confusing states when data is incomplete.  
**Related User Story**: 3.4  
**Test Scenarios**: [test-scenarios.md](./test-scenarios.md)

## Functional Requirements

### Core Functionality

- [ ] **Requirement 1**: ProgressIndicator component renders a visual bar.
  - Acceptance: Bar width matches percentage calculation.
  - Priority: CRITICAL

- [ ] **Requirement 2**: Real-time subscription to `reading_progress` table.
  - Acceptance: UI updates within 500ms of database change.
  - Priority: HIGH

- [ ] **Requirement 3**: Relative date formatting logic.
  - Acceptance: Activity within 7 days shows as relative ("X days ago"), older shows absolute.
  - Priority: MEDIUM

### Edge Cases and Error Handling

- [ ] **Error Case 1**: Network connection lost for Realtime.
  - Expected Behavior: Indicator shows last known state, optionally a "disconnected" icon.
  - Error Message: None required, but status should be consistent.

- [ ] **Edge Case 1**: Total chapters = 0.
  - Expected Behavior: Progress = 0%, avoid division by zero.

## Non-Functional Requirements

### Performance

- [ ] **Load Time**: < 200ms for progress calculation on initial load.
- [ ] **Animation**: Progress transitions must be smooth (300ms ease-in-out).

### Security

- [ ] **Authorization**: Only show progress data for the authenticated user.
- [ ] **Data Protection**: Ensure no sensitive metadata is leaked in progress payloads.

### Accessibility

- [ ] **WCAG 2.1 Level AA**: All progress text and bars must meet contrast requirements.
- [ ] **Keyboard Navigation**: Focus states for the progress area if interactive.

## Data Requirements

- [ ] **Supabase Table**: `reading_progress` must have `current_chapter`, `total_chapters`, `last_read_at`.
- [ ] **Realtime**: Must enable Realtime on `reading_progress` table for the user.

## Integration Requirements

- [ ] **Extension Integration**: Progress updates sent from the browser extension must trigger the Realtime update.

## Browser and Device Support

- [ ] **Chrome/Firefox/Safari**: Latest 2 versions.
- [ ] **Mobile**: Responsive layout for small screens (320px+).

## Quality Gates

- [ ] **Unit Tests**: 90%+ coverage for calculation and formatting logic.
- [ ] **Integration Tests**: Realtime update flow verified.

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-18  

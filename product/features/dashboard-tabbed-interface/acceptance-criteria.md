# Acceptance Criteria: Dashboard Layout with Tabbed Interface

## Overview

**Feature**: Dashboard Layout with Tabbed Interface
**Feature ID**: dashboard-tabbed-interface
**Story**: 3-1
**Last Updated**: 2026-02-18

This document defines the acceptance criteria for the dashboard tabbed interface using Behavior-Driven Development (BDD) format with Gherkin syntax.

## Acceptance Criteria

### AC-1: Dashboard Displays Four Status Tabs

```gherkin
Given I am authenticated and on the dashboard page
When the dashboard loads
Then I see four tabs labeled "Reading", "Completed", "On Hold", and "Plan to Read"
And the tabs are displayed in that order
And the "Reading" tab is active by default
```

**Rationale**: Users need clear, labeled tabs to navigate their series by status.
**Related User Story**: Story 3-1
**Test Scenarios**: Tab rendering, default active state

---

### AC-2: Each Tab Displays Only Its Matching Series

```gherkin
Given I have series with different statuses in my library
When I click the "Completed" tab
Then I see only series with status "completed"
And I do not see series with status "reading", "on_hold", or "plan_to_read"
```

**Rationale**: Tab filtering is the core function of the tabbed interface.
**Related User Story**: Story 3-1
**Test Scenarios**: Tab filtering by status

---

### AC-3: Active Tab Is Clearly Highlighted

```gherkin
Given I am on the dashboard
When I click the "On Hold" tab
Then the "On Hold" tab is visually highlighted with the brand orange color (#FF7A45)
And all other tabs are displayed in the inactive style
And the active tab has aria-selected="true"
```

**Rationale**: Users must always know which tab is currently active.
**Related User Story**: Story 3-1
**Test Scenarios**: Active tab styling, ARIA state

---

### AC-4: Tab Switch Happens Without Page Reload

```gherkin
Given I am viewing the "Reading" tab
When I click the "Plan to Read" tab
Then the series list updates immediately without a full page reload
And the URL does not change
And the transition completes in under 100ms
```

**Rationale**: Client-side tab switching provides a smooth, app-like experience.
**Related User Story**: Story 3-1
**Test Scenarios**: Tab switch performance, no navigation

---

### AC-5: Dashboard Loads in Under 3 Seconds with Up to 100 Series

```gherkin
Given I have 100 series in my library
When I navigate to the dashboard
Then the dashboard is fully interactive within 3 seconds
And all series in the active tab are visible
And no loading errors occur
```

**Rationale**: Performance is a hard requirement from the PRD (FR9).
**Related User Story**: Story 3-1
**Test Scenarios**: Performance testing with 100 series

---

### AC-6: Empty State Shown When Tab Has No Series

```gherkin
Given I have no series with status "completed"
When I click the "Completed" tab
Then I see an empty state message specific to that tab
And the message is encouraging, not an error
And a call-to-action is displayed to help the user add series
```

**Rationale**: Empty states guide users toward productive actions.
**Related User Story**: Story 3-1
**Test Scenarios**: Empty state per tab

---

### AC-7: Loading Skeleton Displays During Data Fetch

```gherkin
Given I navigate to the dashboard
When the series data is being fetched from Supabase
Then a loading skeleton is displayed in place of the series list
And the skeleton matches the approximate layout of the series cards
And the skeleton disappears once data is loaded
```

**Rationale**: Loading feedback prevents users from thinking the page is broken.
**Related User Story**: Story 3-1
**Test Scenarios**: Loading state rendering

---

### AC-8: Tabs Are Responsive on Mobile and Desktop

```gherkin
Given I am viewing the dashboard on a mobile device (320px viewport)
When the dashboard loads
Then all four tabs are accessible via horizontal scroll
And the active tab is visible without scrolling
And touch targets are at least 44px in height
```

**Rationale**: Responsive design is required (NFR17).
**Related User Story**: Story 3-1
**Test Scenarios**: Mobile responsiveness

---

### AC-9: Keyboard Navigation Works for Tabs

```gherkin
Given I am on the dashboard with keyboard focus on the tab bar
When I press the right arrow key
Then focus moves to the next tab
And when I press Enter or Space
Then the focused tab becomes active and its series are displayed
```

**Rationale**: Keyboard navigation is required for WCAG 2.1 AA compliance (NFR16).
**Related User Story**: Story 3-1
**Test Scenarios**: Keyboard accessibility

---

### AC-10: Tabs Use Correct ARIA Attributes

```gherkin
Given I am on the dashboard
When I inspect the tab bar with a screen reader
Then the tab container has role="tablist"
And each tab has role="tab"
And each tab panel has role="tabpanel"
And the active tab has aria-selected="true"
And inactive tabs have aria-selected="false"
And each tab panel has aria-labelledby pointing to its tab
```

**Rationale**: ARIA attributes are required for screen reader compatibility (NFR16).
**Related User Story**: Story 3-1
**Test Scenarios**: ARIA compliance

---

## Functional Requirements

### Core Functionality

- [ ] **Four Tabs Rendered**: "Reading", "Completed", "On Hold", "Plan to Read" tabs exist
  - Acceptance: All four tabs visible on dashboard load
  - Priority: CRITICAL

- [ ] **Tab Filtering**: Each tab shows only series matching its status
  - Acceptance: Series with `status = 'reading'` appear only in Reading tab
  - Priority: CRITICAL

- [ ] **Active Tab Highlight**: Active tab has brand orange visual indicator
  - Acceptance: Active tab uses `#FF7A45` color, inactive tabs use default style
  - Priority: CRITICAL

- [ ] **Client-Side Tab Switch**: Switching tabs does not trigger page reload
  - Acceptance: Tab switch completes in <100ms with no network request
  - Priority: HIGH

- [ ] **Default Tab**: "Reading" tab is active on initial load
  - Acceptance: Reading tab is highlighted and its series shown on first render
  - Priority: HIGH

- [ ] **Empty State**: Per-tab empty state shown when no series match
  - Acceptance: Encouraging message + CTA displayed when tab has 0 series
  - Priority: HIGH

- [ ] **Loading Skeleton**: Skeleton shown during data fetch
  - Acceptance: Skeleton renders before data arrives, disappears after
  - Priority: HIGH

### Edge Cases and Error Handling

- [ ] **Supabase Query Failure**: System handles database errors gracefully
  - Expected Behavior: Error message displayed, retry option offered
  - Error Message: "Unable to load your series. Please try again."

- [ ] **User Has No Series**: Dashboard shows empty state for all tabs
  - Expected Behavior: All tabs show empty state with onboarding CTA
  - Error Message: None (not an error state)

- [ ] **Single Series**: Dashboard works correctly with exactly 1 series
  - Expected Behavior: Series appears in correct tab, no layout issues

- [ ] **100 Series**: Dashboard loads within 3 seconds with maximum series count
  - Expected Behavior: All series load, no pagination needed for this story

- [ ] **Network Timeout**: Supabase query times out
  - Expected Behavior: Error state shown after timeout, user can retry
  - Error Message: "Connection timed out. Please refresh the page."

## Non-Functional Requirements

### Performance

- [ ] **Dashboard Load**: <3 seconds LCP with up to 100 series
- [ ] **Tab Switch**: <100ms (client-side only, no network)
- [ ] **Supabase Query**: <500ms for series fetch
- [ ] **Time to Interactive**: <300ms after data loads (web platform threshold)

### Accessibility

- [ ] **WCAG 2.1 AA**: Full compliance verified with axe-core
- [ ] **Keyboard Navigation**: Arrow keys navigate tabs, Enter/Space activates
- [ ] **Screen Reader**: Tab roles and states announced correctly
- [ ] **Color Contrast**: All text meets 4.5:1 contrast ratio
- [ ] **Focus Indicators**: Visible focus ring on all interactive elements
- [ ] **Touch Targets**: Minimum 44px height for all tab buttons (mobile)

### Responsiveness

- [ ] **Mobile (320px+)**: Tabs horizontally scrollable, content readable
- [ ] **Tablet (768px+)**: All tabs visible without scroll
- [ ] **Desktop (1280px+)**: Full layout with optimal spacing
- [ ] **No Horizontal Overflow**: Content never overflows viewport width

### Security

- [ ] **Auth Required**: Dashboard only accessible to authenticated users (middleware)
- [ ] **RLS Enforced**: Users only see their own series (Supabase RLS)
- [ ] **No Data Leakage**: Series from other users never appear

## Data Requirements

### Data Validation

- [ ] **Status Values**: Only valid statuses ('reading', 'completed', 'on_hold', 'plan_to_read') are accepted
- [ ] **User Isolation**: Query always filters by authenticated user's ID
- [ ] **Series Count**: Handles 0 to 100+ series without errors

### Data Storage

- [ ] **Read-Only**: This story only reads from `user_series`, no writes
- [ ] **Supabase RLS**: Row Level Security policies enforce user isolation

## Integration Requirements

### Supabase Integration

- [ ] **Server-Side Fetch**: Series data fetched in server component (not client-side)
- [ ] **Auth Session**: Supabase session used to identify user for query
- [ ] **Error Handling**: Supabase errors caught and handled gracefully

### Next.js Integration

- [ ] **App Router**: Dashboard uses Next.js App Router conventions
- [ ] **Server Component**: Page component is a server component
- [ ] **Client Component**: Tab switching logic in a client component
- [ ] **Suspense**: React Suspense used for loading skeleton

## Browser and Device Support

### Browsers

- [ ] **Chrome**: Latest 2 versions
- [ ] **Firefox**: Latest 2 versions
- [ ] **Safari**: Latest 2 versions
- [ ] **Edge**: Latest 2 versions

### Devices

- [ ] **Desktop**: Windows, macOS, Linux
- [ ] **Mobile**: iOS (latest 2 versions), Android (latest 2 versions)
- [ ] **Tablet**: iPad, Android tablets

## Quality Gates

### Testing Requirements

- [ ] **Unit Tests**: 80%+ coverage for domain logic and components
- [ ] **Integration Tests**: 70%+ coverage for Supabase query service
- [ ] **Accessibility Tests**: Zero violations with axe-core
- [ ] **No Regressions**: All 535 existing tests continue to pass

### Code Quality

- [ ] **TypeScript**: No type errors in strict mode
- [ ] **ESLint**: No linting errors
- [ ] **No `any`**: No untyped `any` without explicit justification
- [ ] **Component Separation**: Server/client component boundary respected

### Performance Testing

- [ ] **Load Time**: Verified <3s with 100 series in test environment
- [ ] **Tab Switch**: Verified <100ms with browser DevTools
- [ ] **Lighthouse**: Performance score >85

## Verification Checklist

### Before Marking Complete

- [ ] All acceptance criteria are met
- [ ] All test scenarios pass
- [ ] No regressions in existing functionality (535 tests passing)
- [ ] Performance metrics verified
- [ ] Accessibility testing completed (axe-core)
- [ ] Responsive design tested on mobile and desktop
- [ ] Code review approved
- [ ] Ready for Story 3-2 (Series Card Component)

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | |
| QA Lead | | | |
| Tech Lead | | | |

## Notes

- Series cards in this story are minimal placeholders (title + status badge only)
- Full card design with cover images and metadata is Story 3-2
- Tab state is managed client-side (React useState), not in URL for MVP
- Consider URL-based tab state in future for deep-linking support

---

**Document Status**: APPROVED
**Last Reviewed**: 2026-02-18
**Next Review**: 2026-03-18

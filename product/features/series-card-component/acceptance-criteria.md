# Acceptance Criteria: Series Card Component with Magazine-Style Layout

## Overview

**Feature**: Series Card Component with Magazine-Style Layout  
**Feature ID**: 3-2  
**Story**: 3-2  
**Last Updated**: 2026-02-18  

This document defines the acceptance criteria for the series card component feature using Behavior-Driven Development (BDD) format with Gherkin syntax.

## Acceptance Criteria

### AC-1: Card displays cover image with proper dimensions

```gherkin
Given a series with a cover image URL
When the SeriesCard component renders
Then the cover image displays at 100px × 140px (5:7 aspect ratio)
And the image is lazy-loaded for performance
And a placeholder appears while image loads
```

**Rationale**: Users need to quickly recognize series by their cover art. Consistent dimensions ensure proper grid layout.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 1.1, 1.2  

---

### AC-2: Card shows series metadata (title, genres, platform)

```gherkin
Given a series with title, genres, and platform information
When the SeriesCard component renders
Then the series title displays prominently
And genre tags display below the title
And platform information displays (e.g., "MangaDex")
```

**Rationale**: Users need to identify series by title and understand where they're reading from.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 1.3  

---

### AC-3: Card displays reading progress as percentage bar

```gherkin
Given a series with progress_percentage (0-100)
When the SeriesCard component renders
Then a progress bar displays showing the percentage
And the bar fills from left to right proportionally
And the percentage number displays (e.g., "45%")
```

**Rationale**: Users need to see at a glance how far they've progressed in each series.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 2.1  

---

### AC-4: Card includes status badge with color coding

```gherkin
Given a series with status (reading, completed, onHold, planToRead)
When the SeriesCard component renders
Then a status badge displays with appropriate label
And the badge uses color coding:
  - Reading: Orange (#FF7A45)
  - Completed: Green
  - On Hold: Yellow
  - Plan to Read: Gray
```

**Rationale**: Status badges provide quick visual identification of series state.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 1.4  

---

### AC-5: Cards use orange-based color palette with WCAG AA contrast

```gherkin
Given the card design with orange accent color (#FF7A45)
When the card renders
Then all text meets WCAG 2.1 AA contrast ratio (4.5:1 minimum)
And the orange accent color is used consistently for interactive elements
And the background uses cream (#FFF8F2) or peach (#FFEDE3)
```

**Rationale**: Accessibility compliance ensures all users can read and interact with cards.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Accessibility Test Suite 1.1  

---

### AC-6: Cards are responsive across mobile, tablet, and desktop

```gherkin
Given the SeriesGrid component with multiple cards
When viewing on different screen sizes:
  - Mobile (< 640px): 1-2 columns
  - Tablet (640px - 1024px): 2-3 columns
  - Desktop (> 1024px): 4-5 columns
Then cards resize and reflow appropriately
And spacing adjusts for each breakpoint
And cards remain usable on all sizes
```

**Rationale**: Users access the app on various devices and need responsive layouts.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Integration Test Suite 1.1  

---

### AC-7: Cards have hover effects on desktop

```gherkin
Given a SeriesCard on desktop view
When user hovers over the card
Then a subtle shadow appears (elevation effect)
And the card slightly scales up (1.02x)
And the transition is smooth (200ms)
And no hover effect on mobile/touch devices
```

**Rationale**: Hover effects provide visual feedback and improve desktop UX.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 2.2  

---

### AC-8: Cards are accessible with semantic HTML and ARIA labels

```gherkin
Given a SeriesCard component
When the card renders
Then semantic HTML is used (article, img with alt text)
And ARIA labels describe status badges
And keyboard navigation works (Tab, Enter)
And screen readers can read all content
```

**Rationale**: Accessibility ensures all users can interact with the component.  
**Related User Story**: Story 3-2  
**Test Scenarios**: Test-scenarios.md - Accessibility Test Suite 1.2  

---

## Functional Requirements

### Core Functionality

- [ ] **SeriesCard Component**: Renders a single series card with all metadata
  - Acceptance: Component renders without errors
  - Priority: CRITICAL

- [ ] **SeriesGrid Component**: Renders multiple cards in responsive grid
  - Acceptance: Grid adapts to screen size
  - Priority: CRITICAL

- [ ] **StatusBadge Component**: Displays status with color coding
  - Acceptance: Badge renders with correct color and label
  - Priority: HIGH

- [ ] **ProgressBar Component**: Shows reading progress as percentage
  - Acceptance: Bar fills proportionally, percentage displays
  - Priority: HIGH

### Edge Cases and Error Handling

- [ ] **Missing Cover Image**: Fallback placeholder displays
  - Expected Behavior: Shows placeholder SVG or icon
  - Error Message: No error, graceful fallback

- [ ] **Missing Progress Data**: Shows "Not started" or 0%
  - Expected Behavior: Displays default state
  - Error Message: No error message needed

- [ ] **Very Long Series Title**: Title truncates with ellipsis
  - Expected Behavior: Text truncates after 2 lines
  - Error Message: No error, visual truncation

## Non-Functional Requirements

### Performance

- [ ] **Load Time**: Cards should render in < 500ms
- [ ] **Image Lazy Loading**: Images below fold load only when needed
- [ ] **Memoization**: SeriesCard memoized to prevent unnecessary re-renders
- [ ] **Scalability**: Grid should handle 100+ cards smoothly

### Security

- [ ] **Input Sanitization**: Series data sanitized before display
- [ ] **XSS Prevention**: No user input directly rendered as HTML
- [ ] **Image URL Validation**: Only trusted image URLs loaded

### Accessibility

- [ ] **WCAG 2.1 Level AA**: All content complies with WCAG 2.1 Level AA standards
- [ ] **Keyboard Navigation**: All functionality accessible via keyboard
- [ ] **Screen Reader Support**: Content properly labeled for screen readers
- [ ] **Color Contrast**: Text contrast ratio at least 4.5:1 for normal text
- [ ] **Focus Indicators**: Visible focus indicators on all interactive elements

### Usability

- [ ] **Mobile Responsive**: Feature works on devices with screen width 320px and above
- [ ] **Touch Friendly**: Interactive elements at least 44x44 pixels
- [ ] **Loading States**: Loading indicator appears while images load
- [ ] **Error Messages**: Clear messages for any errors

## Data Requirements

### Data Validation

- [ ] **Required Fields**: title, status, progress_percentage
- [ ] **Format Validation**: progress_percentage must be 0-100
- [ ] **Image URL**: Must be valid HTTPS URL or empty
- [ ] **Status Values**: Must be one of (reading, completed, onHold, planToRead)

### Data Storage

- [ ] **Persistence**: Data comes from user_series table
- [ ] **Caching**: Series data cached in Zustand store
- [ ] **Retention**: Data retained per user's library

## Integration Requirements

### API Integration

- [ ] **Data Source**: Fetches from Supabase user_series table
- [ ] **Real-time Updates**: Subscribes to series changes
- [ ] **Error Handling**: Gracefully handles API errors

### Third-Party Services

- [ ] **Image CDN**: Images loaded from Supabase storage or external URLs
- [ ] **Fallback Behavior**: Placeholder shown if image unavailable

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

- [ ] **Unit Tests**: 85%+ coverage for card components
- [ ] **Integration Tests**: 70%+ coverage for grid layout
- [ ] **Accessibility Tests**: All WCAG AA criteria verified
- [ ] **Manual Testing**: Tested on multiple devices and browsers

### Code Quality

- [ ] **Code Review**: Approved by tech lead
- [ ] **Linting**: No linting errors
- [ ] **Type Safety**: TypeScript strict mode compliance
- [ ] **Documentation**: Components documented with JSDoc

### Performance Testing

- [ ] **Load Testing**: Tested with 100+ cards
- [ ] **Memory Profiling**: No memory leaks detected
- [ ] **Bundle Size**: Bundle size increase < 50KB

## Verification Checklist

### Before Marking Complete

- [ ] All acceptance criteria are met
- [ ] All test scenarios pass
- [ ] No regressions in existing functionality
- [ ] Performance metrics are met
- [ ] Accessibility testing completed
- [ ] Documentation is complete
- [ ] Code review approved
- [ ] Ready for deployment

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | |
| QA Lead | | | |
| Tech Lead | | | |

## Notes

[Any additional notes, clarifications, or open questions]

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18  
**Next Review**: 2026-02-25

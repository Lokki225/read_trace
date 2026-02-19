# Test Scenarios - Resume Button on Series Cards

## Overview

**Feature**: Resume Button on Series Cards  
**Feature ID**: 5-1  
**Story**: Story 5.1  
**Last Updated**: 2026-02-19  

## Test Strategy

Testing pyramid: 60% unit tests, 30% integration tests, 10% E2E tests

## Unit Tests

### Test Suite 1: ResumeButton Component

**File**: `tests/unit/ResumeButton.test.tsx`

**Test Cases**:
1. Renders resume button when resume_url exists
2. Shows loading state on click
3. Hides button when resume_url is null
4. Has correct orange styling (#FF7A45)
5. Keyboard accessible (Enter/Space activation)
6. Displays aria-label with series title
7. Button disabled during loading
8. Spinner visible during navigation
9. Responsive on mobile (44x44px minimum)
10. Hover effect visible
11. Focus indicator visible
12. Fallback message renders when no resume_url

**Coverage Target**: 90%+

### Test Suite 2: buildResumeUrl Utility

**File**: `tests/unit/resume.test.ts`

**Test Cases**:
1. Builds correct MangaDex URL format
2. Builds correct Webtoon URL format
3. Handles missing page number gracefully
4. Validates URL format before returning
5. Sanitizes special characters in parameters
6. Handles null/undefined inputs
7. Returns null for invalid data
8. Constructs URL with chapter and page parameters

**Coverage Target**: 90%+

## Integration Tests

### Test Suite 1: SeriesCard + ResumeButton Integration

**File**: `tests/integration/resume-button.integration.test.tsx`

**Test Cases**:
1. ResumeButton renders within SeriesCard when resume_url exists
2. SeriesCard passes resume_url correctly to ResumeButton
3. Navigation opens new tab with correct URL
4. Loading state propagates from button to parent
5. Fallback message displays in SeriesCard when no resume_url
6. SeriesCard memo prevents unnecessary re-renders
7. Multiple series cards render independently
8. Navigation flow end-to-end (click → loading → tab open)

**Coverage Target**: 80%+

## End-to-End Tests

### Test Suite 1: Resume Reading Flow

**File**: `tests/e2e/resume-button.e2e.test.ts`

**Test Cases**:
1. User navigates to dashboard, sees series cards with resume buttons
2. User clicks resume button, new tab opens to correct chapter
3. User sees loading state during navigation
4. User can keyboard navigate to resume button and activate with Enter

## Error Handling Tests

**Test Cases**:
1. Invalid resume URL shows error message
2. Network timeout shows timeout message
3. Missing series data handled gracefully
4. Pop-up blocker interference detected and communicated

## Performance Tests

**Test Cases**:
1. Button renders in <100ms
2. Click response in <200ms
3. Navigation initiates within 2 seconds
4. No memory leaks with multiple renders
5. SeriesGrid with 100+ cards performs smoothly

## Accessibility Tests

**Test Cases**:
1. Keyboard navigation (Tab, Enter, Space)
2. Screen reader announces button purpose
3. Focus indicator visible
4. Color contrast meets 4.5:1 minimum
5. Touch target 44x44px on mobile
6. Loading state announced to screen readers

## Test Data

**Valid Data**:
```json
{
  "seriesId": "123",
  "seriesTitle": "One Piece",
  "platform": "mangadex",
  "chapterNumber": 1050,
  "pageNumber": 15,
  "resume_url": "https://mangadex.org/chapter/abc-123?page=15"
}
```

**Invalid Data**:
```json
{
  "seriesId": "456",
  "seriesTitle": "Naruto",
  "resume_url": null
}
```

---

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-19

# Test Scenarios

## Overview

**Feature**: Unified Reading State Across Platforms  
**Feature ID**: 5-3  
**Story**: 5-3  
**Last Updated**: 2026-02-19  

This document outlines comprehensive test scenarios for validating feature functionality.

## Test Strategy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \
    /        \ Integration Tests (30%)
   /          \
  /____________\
 /              \
/                \ Unit Tests (60%)
/__________________\
```

### Test Coverage Goals

- **Unit Tests**: 90%+ code coverage for services and utilities
- **Integration Tests**: 85%+ feature coverage for unified state flow
- **End-to-End Tests**: Critical user flows (resume with platform selection)

## Unit Tests

### Test Suite 1: unifiedStateService

**File**: `tests/unit/unifiedStateService.test.ts`

#### Test Case 1.1: Single platform progress
- **Purpose**: Verify service returns progress when only one platform has data
- **Preconditions**: User has progress on MangaDex only
- **Expected Result**: Returns MangaDex progress with platform indicator

#### Test Case 1.2: Multiple platforms - select most recent
- **Purpose**: Verify service selects most recent progress across platforms
- **Preconditions**: User has progress on MangaDex (ch 10, 2 hours ago) and Webtoon (ch 8, 1 hour ago)
- **Expected Result**: Returns Webtoon progress (most recent)

#### Test Case 1.3: Identical timestamps - tie-break by chapter
- **Purpose**: Verify tie-breaking when timestamps are equal
- **Preconditions**: MangaDex (ch 10, same timestamp) and Webtoon (ch 8, same timestamp)
- **Expected Result**: Returns MangaDex progress (higher chapter)

#### Test Case 1.4: No progress available
- **Purpose**: Verify graceful handling when no progress exists
- **Preconditions**: User has no reading progress for series
- **Expected Result**: Returns null or empty progress object

#### Test Case 1.5: Include alternatives in response
- **Purpose**: Verify alternatives array includes all platforms with progress
- **Preconditions**: User has progress on MangaDex, Webtoon, and custom site
- **Expected Result**: Returns most recent with alternatives array containing other platforms

#### Test Case 1.6: Handle null/undefined values
- **Purpose**: Verify service handles missing or null data gracefully
- **Preconditions**: Database returns null timestamps or missing chapters
- **Expected Result**: Filters out invalid entries, returns valid progress

#### Test Case 1.7: Performance with 10+ platforms
- **Purpose**: Verify service performs efficiently with many platforms
- **Preconditions**: User has progress on 10+ different platforms
- **Expected Result**: Returns result in <200ms

#### Test Case 1.8: Concurrent updates same series
- **Purpose**: Verify service handles concurrent updates correctly
- **Preconditions**: Multiple updates to same series from different platforms
- **Expected Result**: Returns most recent without race conditions

#### Test Case 1.9: Large chapter numbers
- **Purpose**: Verify service handles large chapter numbers correctly
- **Preconditions**: Series with 500+ chapters
- **Expected Result**: Correctly compares and selects based on chapter number

#### Test Case 1.10: Decimal chapter numbers (webtoons)
- **Purpose**: Verify service handles decimal chapters (e.g., 10.5)
- **Preconditions**: Webtoon with decimal chapter numbers
- **Expected Result**: Correctly compares decimal values

#### Test Case 1.11: Special platform names
- **Purpose**: Verify service handles platform names with special characters
- **Preconditions**: Platform names with hyphens, underscores, dots
- **Expected Result**: Correctly identifies and returns platform

#### Test Case 1.12: Empty alternatives array
- **Purpose**: Verify alternatives array is empty when only one platform has progress
- **Preconditions**: Only MangaDex has progress
- **Expected Result**: alternatives array is empty or not included

### Test Suite 2: platformPreference

**File**: `tests/unit/platformPreference.test.ts`

#### Test Case 2.1: Preferred platform available
- **Purpose**: Verify selectResumeUrl returns preferred platform URL
- **Preconditions**: User prefers MangaDex, has progress on MangaDex
- **Expected Result**: Returns MangaDex resume URL

#### Test Case 2.2: Preferred platform not available - fallback
- **Purpose**: Verify fallback to most recent when preferred unavailable
- **Preconditions**: User prefers MangaDex, only has progress on Webtoon
- **Expected Result**: Returns Webtoon resume URL

#### Test Case 2.3: Manual override
- **Purpose**: Verify manual platform selection overrides preference
- **Preconditions**: User prefers MangaDex but selects Webtoon
- **Expected Result**: Returns Webtoon resume URL

#### Test Case 2.4: No preference set
- **Purpose**: Verify defaults to most recent when no preference
- **Preconditions**: User has no platform preference set
- **Expected Result**: Returns most recent platform URL

#### Test Case 2.5: Multiple preferred platforms
- **Purpose**: Verify respects preference order
- **Preconditions**: User prefers [MangaDex, Webtoon], has progress on both
- **Expected Result**: Returns MangaDex (first preference)

#### Test Case 2.6: Preferred platform has no progress
- **Purpose**: Verify fallback to next preference
- **Preconditions**: User prefers [MangaDex, Webtoon], only has Webtoon progress
- **Expected Result**: Returns Webtoon URL

#### Test Case 2.7: No platforms available
- **Purpose**: Verify graceful handling when no progress exists
- **Preconditions**: User has no progress on any platform
- **Expected Result**: Returns null or empty string

#### Test Case 2.8: Invalid platform in preference
- **Purpose**: Verify skips invalid platforms
- **Preconditions**: Preference includes non-existent platform
- **Expected Result**: Skips invalid, uses next valid preference

#### Test Case 2.9: Preference persistence
- **Purpose**: Verify preference is remembered across calls
- **Preconditions**: User sets preference to Webtoon
- **Expected Result**: Subsequent calls use Webtoon preference

#### Test Case 2.10: Update preference
- **Purpose**: Verify preference can be updated
- **Preconditions**: User changes preference from MangaDex to Webtoon
- **Expected Result**: New preference is used

## Integration Tests

### Integration Test Suite 1: Unified State Flow

**File**: `tests/integration/unified-state.integration.test.ts`

#### Test Case 1.1: Read on Site A then Site B
- **Purpose**: Verify full flow of reading on multiple sites
- **Components Involved**: Extension, unifiedStateService, seriesQueryService, ResumeButton
- **Preconditions**: User reads ch 5 on MangaDex, then ch 8 on Webtoon
- **Expected Result**: Dashboard shows ch 8 (Webtoon), resume navigates to Webtoon

#### Test Case 1.2: Dashboard reflects unified state
- **Purpose**: Verify dashboard displays most recent progress
- **Components Involved**: seriesQueryService, unifiedStateService, SeriesCard
- **Preconditions**: User has progress on multiple platforms
- **Expected Result**: Series card shows most recent chapter and platform badge

#### Test Case 1.3: Resume with platform selection
- **Purpose**: Verify resume dropdown works correctly
- **Components Involved**: ResumeButton, platformPreference, navigation
- **Preconditions**: User has progress on MangaDex and Webtoon
- **Expected Result**: Dropdown shows both options, selection navigates correctly

#### Test Case 1.4: Platform preference resolution
- **Purpose**: Verify preference is used for resume navigation
- **Components Involved**: platformPreference, user preferences, ResumeButton
- **Preconditions**: User prefers Webtoon, has progress on both sites
- **Expected Result**: Resume navigates to Webtoon without dropdown

#### Test Case 1.5: Conflict resolution during sync
- **Purpose**: Verify conflicts are resolved correctly
- **Components Involved**: Extension, conflictResolver, unifiedStateService
- **Preconditions**: Simultaneous updates from two platforms
- **Expected Result**: Most recent update is selected, older is discarded

#### Test Case 1.6: Extension tracks platform
- **Purpose**: Verify extension includes platform in progress updates
- **Components Involved**: Extension content script, adapter registry
- **Preconditions**: User reads on MangaDex
- **Expected Result**: Progress update includes platform='mangadex'

#### Test Case 1.7: seriesQueryService uses unified state
- **Purpose**: Verify seriesQueryService calls unifiedStateService
- **Components Involved**: seriesQueryService, unifiedStateService, database
- **Preconditions**: User has progress on multiple platforms
- **Expected Result**: Query returns unified progress with platform info

#### Test Case 1.8: Platform indicator displays correctly
- **Purpose**: Verify platform badge shows on series card
- **Components Involved**: SeriesCard, platform indicator component
- **Preconditions**: Series has unified progress
- **Expected Result**: Platform badge displays correct platform name

#### Test Case 1.9: Alternatives dropdown populated
- **Purpose**: Verify alternatives dropdown shows all available platforms
- **Components Involved**: ResumeButton, alternatives array
- **Preconditions**: User has progress on 3+ platforms
- **Expected Result**: Dropdown shows all platforms with progress

#### Test Case 1.10: Resume navigation completes in time
- **Purpose**: Verify resume navigation meets performance target
- **Components Involved**: ResumeButton, navigation, platform resolution
- **Preconditions**: User clicks resume button
- **Expected Result**: Navigation completes in <2 seconds

#### Test Case 1.11: Fallback when preferred platform unavailable
- **Purpose**: Verify fallback to most recent works
- **Components Involved**: platformPreference, unifiedStateService
- **Preconditions**: User prefers MangaDex, only has Webtoon progress
- **Expected Result**: Resume navigates to Webtoon

#### Test Case 1.12: Manual override persists
- **Purpose**: Verify manual selection is remembered
- **Components Involved**: ResumeButton, preference storage
- **Preconditions**: User manually selects Webtoon
- **Expected Result**: Next resume uses Webtoon (optional feature)

## Error Handling Tests

### Error Test Suite 1: Invalid Data

#### Test Case 1.1: Null progress data
- **Error Type**: Missing data
- **Trigger Condition**: Database returns null for all platforms
- **Expected Behavior**: Return empty progress, show "No progress" message
- **Error Message**: "No reading progress found for this series"

#### Test Case 1.2: Invalid platform identifier
- **Error Type**: Data validation
- **Trigger Condition**: Platform not in adapter registry
- **Expected Behavior**: Log error, skip invalid platform
- **Error Message**: "Unknown platform: invalid_platform"

#### Test Case 1.3: Corrupted timestamp
- **Error Type**: Data integrity
- **Trigger Condition**: Invalid timestamp format in database
- **Expected Behavior**: Filter out invalid entry, use valid entries
- **Error Message**: "Invalid timestamp format, skipping entry"

#### Test Case 1.4: Missing resume URL
- **Error Type**: Data completeness
- **Trigger Condition**: Platform has no resume_url
- **Expected Behavior**: Show fallback message, disable resume
- **Error Message**: "Cannot resume on this platform"

## Performance Tests

### Performance Test Suite 1: Unified State Resolution

#### Test Case 1.1: Single series resolution
- **Metric**: Resolution time
- **Target**: <200ms
- **Baseline**: Unknown
- **Test**: Call getUnifiedProgress() for single series

#### Test Case 1.2: Batch resolution (100 series)
- **Metric**: Batch resolution time
- **Target**: <5s for 100 series
- **Baseline**: Unknown
- **Test**: Call getUnifiedProgress() for 100 series

#### Test Case 1.3: Platform preference resolution
- **Metric**: Preference resolution time
- **Target**: <100ms
- **Baseline**: Unknown
- **Test**: Call selectResumeUrl() with 10+ platforms

#### Test Case 1.4: Memory usage
- **Metric**: Heap memory increase
- **Target**: <10MB for 1000 operations
- **Baseline**: Unknown
- **Test**: Perform 1000 unified state resolutions

## Accessibility Tests

### Accessibility Test Suite 1: Platform Selection

#### Test Case 1.1: Keyboard navigation
- **Purpose**: Verify platform dropdown accessible via keyboard
- **Standard**: WCAG 2.1 Level AA
- **Test**: Tab to dropdown, use arrow keys to select, press Enter

#### Test Case 1.2: Screen reader support
- **Purpose**: Verify platform labels readable by screen readers
- **Standard**: WCAG 2.1 Level AA
- **Test**: Verify aria-label on platform badge and dropdown

#### Test Case 1.3: Color contrast
- **Purpose**: Verify platform badge meets contrast requirements
- **Standard**: WCAG 2.1 Level AA (4.5:1)
- **Test**: Measure contrast ratio of platform badge text

#### Test Case 1.4: Focus indicators
- **Purpose**: Verify visible focus on interactive elements
- **Standard**: WCAG 2.1 Level AA
- **Test**: Tab through all interactive elements, verify visible focus

## Test Data

### Data Set 1: Valid Multi-Platform Progress

```json
{
  "series_id": "uuid-123",
  "platforms": [
    {
      "platform": "mangadex",
      "current_chapter": 10,
      "total_chapters": 150,
      "scroll_position": 0.5,
      "updated_at": "2026-02-19T10:00:00Z"
    },
    {
      "platform": "webtoon",
      "current_chapter": 8,
      "total_chapters": 200,
      "scroll_position": 0.3,
      "updated_at": "2026-02-19T09:00:00Z"
    }
  ]
}
```

**Usage**: Multi-platform selection tests, conflict resolution tests  
**Validity**: Valid, expected to pass  

### Data Set 2: Invalid Platform Data

```json
{
  "series_id": "uuid-123",
  "platforms": [
    {
      "platform": "invalid_site",
      "current_chapter": null,
      "total_chapters": null,
      "scroll_position": null,
      "updated_at": "invalid-date"
    }
  ]
}
```

**Usage**: Error handling tests, data validation tests  
**Validity**: Invalid, expected to fail gracefully  

## Test Execution

### Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test -- --testPathPattern="unit"

# Run integration tests
npm run test -- --testPathPattern="integration"

# Run specific test file
npm run test -- tests/unit/unifiedStateService.test.ts

# Run tests with coverage
npm run test -- --coverage
```

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-19  
**Next Review**: 2026-02-26

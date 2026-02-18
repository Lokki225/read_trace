# Test Scenarios: Series Progress Indicators

## Overview

**Feature**: Series Progress Indicators  
**Feature ID**: 3-4  
**Story**: [Story 3.4: Series Progress Indicators](../../../_bmad-output/implementation-artifacts/3-4-series-progress-indicators.md)  
**Last Updated**: 2026-02-18  

This document outlines comprehensive test scenarios for validating the series progress indicator functionality, including unit tests, integration tests, and end-to-end tests.

## Test Strategy

### Testing Pyramid

```text
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

- **Unit Tests**: 90%+ code coverage for progress calculation and date formatting
- **Integration Tests**: 80%+ feature coverage for Realtime updates
- **End-to-End Tests**: Critical user flows (progress update reflection)

## Unit Tests

### Test Suite 1: Progress Calculation Utility

**File**: `tests/unit/progress.test.ts`

#### Test Case 1.1: Standard Chapter Completion

```typescript
describe('calculateProgress', () => {
  it('should return 50% when current is 25 and total is 50', () => {
    const progress = calculateProgress({ current_chapter: 25, total_chapters: 50 });
    expect(progress).toBe(50);
  });
});
```

**Purpose**: Verify correct percentage calculation for standard chapter progress.  
**Preconditions**: Valid current and total chapter counts.  
**Expected Result**: Correct percentage returned.

#### Test Case 1.2: Handle Zero Total Chapters

```typescript
it('should return 0% when total chapters is 0 or undefined', () => {
  const progress = calculateProgress({ current_chapter: 10, total_chapters: 0 });
  expect(progress).toBe(0);
});
```

**Purpose**: Prevent division by zero and handle incomplete data.  
**Preconditions**: `total_chapters` is 0 or undefined.  
**Expected Result**: 0% progress returned.

### Test Suite 2: Date Formatting Utility

**File**: `tests/unit/dateFormat.test.ts`

#### Test Case 2.1: Relative Date Formatting

```typescript
describe('formatLastRead', () => {
  it('should return "2 days ago" for a date 2 days in the past', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    expect(formatLastRead(twoDaysAgo)).toBe('2 days ago');
  });
});
```

**Purpose**: Verify human-readable relative date formatting.  
**Preconditions**: Date within the last 7 days.  
**Expected Result**: Correct relative string returned.

## Integration Tests

### Integration Test Suite 1: Realtime Progress Updates

**File**: `tests/integration/progressRealtime.integration.test.ts`

#### Test Case 1.1: UI Update on Database Change

```typescript
describe('Progress Realtime Integration', () => {
  it('should update ProgressIndicator when reading_progress table changes', async () => {
    // Arrange: Mock Supabase Realtime subscription
    // Act: Simulate an INSERT event on reading_progress
    // Assert: Verify component re-renders with new percentage
  });
});
```

**Purpose**: Ensure the dashboard reflects progress updates immediately.  
**Components Involved**: `SeriesCard`, `ProgressIndicator`, `seriesStore`, Supabase Realtime.  
**Preconditions**: Authenticated user, dashboard open.  
**Expected Result**: Progress bar width and text update automatically.

## End-to-End Tests

### E2E Test Suite 1: Full Progress Reflection Flow

**File**: `tests/e2e/progress-flow.e2e.test.ts`

#### Test Case 1.1: Extension Update to Dashboard Reflection

```typescript
test('should show updated progress after reading a new chapter', async ({ page }) => {
  // 1. User is on dashboard, sees series at 10%
  // 2. Simulate reading event (via API or mock extension)
  // 3. Verify dashboard progress bar moves to new percentage
});
```

**Purpose**: Validate the entire end-to-end flow from data change to UI update.  
**User Persona**: Active reader.  
**Expected Result**: Dashboard UI reflects the update without refresh.

## Accessibility Tests

### Accessibility Test Suite 1: Screen Reader Support

#### Test Case 1.1: ARIA Labels for Progress

```typescript
it('should have descriptive ARIA labels for the progress bar', async () => {
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toHaveAttribute('aria-valuenow', '45');
  expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('Progress: 45%'));
});
```

**Purpose**: Verify accessibility standards compliance.  
**Standard**: WCAG 2.1 Level AA.

## Test Data

### Test Data Sets

#### Data Set 1: Valid Reading Progress

```json
{
  "current_chapter": 15,
  "total_chapters": 30,
  "last_read_at": "2026-02-18T10:00:00Z"
}
```

**Usage**: Most unit and integration tests.  
**Validity**: Valid, expected to pass.

#### Data Set 2: Missing Total Chapters

```json
{
  "current_chapter": 5,
  "total_chapters": null,
  "last_read_at": "2026-02-17T15:30:00Z"
}
```

**Usage**: Edge case testing.  
**Validity**: Valid data but requires graceful handling.

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-18  

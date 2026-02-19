# Test Scenarios

## Overview

**Feature**: 95% Accuracy Cross-Platform State Synchronization  
**Feature ID**: 4-6  
**Story**: 4-6  
**Last Updated**: 2026-02-18  

This document outlines comprehensive test scenarios for validating feature functionality, including unit tests, integration tests, and end-to-end tests.

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

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: 80%+ feature coverage
- **End-to-End Tests**: Critical user flows only

## Unit Tests

### Test Suite 1: Chapter Detection Accuracy

**File**: `tests/unit/extension/accuracy.test.ts`

#### Test Case 1.1: Detect chapter from MangaDex URL

```typescript
describe('Chapter Detection', () => {
  it('should detect chapter number from MangaDex URL', () => {
    const url = 'https://mangadex.org/chapter/abc123';
    const chapter = detectChapter(url);
    expect(chapter).toBe('1.0');
  });
});
```

**Purpose**: Verify basic chapter detection from standard URLs  
**Preconditions**: Valid MangaDex URL provided  
**Expected Result**: Correct chapter number extracted  

#### Test Case 1.2: Detect chapter from page HTML

```typescript
it('should detect chapter from page HTML metadata', () => {
  const html = '<meta property="og:title" content="Chapter 42">';
  const chapter = detectChapterFromHTML(html);
  expect(chapter).toBe('42');
});
```

**Purpose**: Verify chapter detection from HTML metadata  
**Preconditions**: HTML with chapter metadata provided  
**Expected Result**: Chapter extracted from metadata  

#### Test Case 1.3: Handle missing chapter metadata

```typescript
it('should return null when chapter metadata missing', () => {
  const html = '<html><body>No chapter info</body></html>';
  const chapter = detectChapterFromHTML(html);
  expect(chapter).toBeNull();
});
```

**Purpose**: Verify graceful handling of missing metadata  
**Preconditions**: HTML without chapter metadata  
**Expected Result**: Returns null without throwing  

### Test Suite 2: Scroll Position Tracking

**File**: `tests/unit/extension/scrollTracking.test.ts`

#### Test Case 2.1: Calculate scroll percentage

```typescript
describe('Scroll Position Tracking', () => {
  it('should calculate scroll percentage correctly', () => {
    const scrollTop = 500;
    const pageHeight = 2000;
    const percentage = calculateScrollPercentage(scrollTop, pageHeight);
    expect(percentage).toBe(25);
  });
});
```

**Purpose**: Verify scroll percentage calculation  
**Preconditions**: Valid scroll position and page height  
**Expected Result**: Correct percentage calculated  

#### Test Case 2.2: Restore scroll position

```typescript
it('should restore scroll position from percentage', () => {
  const percentage = 50;
  const pageHeight = 2000;
  const scrollTop = restoreScrollPosition(percentage, pageHeight);
  expect(scrollTop).toBe(1000);
});
```

**Purpose**: Verify scroll position restoration  
**Preconditions**: Valid percentage and page height  
**Expected Result**: Correct scroll position calculated  

#### Test Case 2.3: Handle edge case - top of page

```typescript
it('should handle scroll at top of page', () => {
  const percentage = calculateScrollPercentage(0, 2000);
  expect(percentage).toBe(0);
});
```

**Purpose**: Verify edge case handling  
**Preconditions**: Scroll at top of page  
**Expected Result**: Returns 0 percentage  

### Test Suite 3: Edge Case Handler

**File**: `tests/unit/extension/edgeCaseHandler.test.ts`

#### Test Case 3.1: Detect webtoon format

```typescript
describe('Edge Case Handler', () => {
  it('should detect webtoon format', () => {
    const html = '<div class="webtoon-viewer">...</div>';
    const format = detectFormat(html);
    expect(format).toBe('webtoon');
  });
});
```

**Purpose**: Verify webtoon format detection  
**Preconditions**: Webtoon HTML structure provided  
**Expected Result**: Format identified as webtoon  

#### Test Case 3.2: Handle horizontal scroll layout

```typescript
it('should handle horizontal scroll layout', () => {
  const html = '<div class="horizontal-scroll">...</div>';
  const isHorizontal = isHorizontalScrollLayout(html);
  expect(isHorizontal).toBe(true);
});
```

**Purpose**: Verify horizontal scroll detection  
**Preconditions**: Horizontal scroll HTML provided  
**Expected Result**: Correctly identified as horizontal  

#### Test Case 3.3: Handle dynamic content loading

```typescript
it('should wait for dynamic content to load', async () => {
  const element = document.createElement('div');
  const content = await waitForDynamicContent(element, 5000);
  expect(content).toBeDefined();
});
```

**Purpose**: Verify dynamic content handling  
**Preconditions**: Element with dynamic content  
**Expected Result**: Waits for content to load  

### Test Suite 4: Accuracy Logger

**File**: `tests/unit/extension/accuracyLogger.test.ts`

#### Test Case 4.1: Log detection success

```typescript
describe('Accuracy Logger', () => {
  it('should log successful detection', () => {
    const log = logDetectionSuccess('mangadex', 'chapter-42', 0.95);
    expect(log.success).toBe(true);
    expect(log.confidence).toBe(0.95);
  });
});
```

**Purpose**: Verify success logging  
**Preconditions**: Successful detection event  
**Expected Result**: Logged with confidence score  

#### Test Case 4.2: Log detection failure

```typescript
it('should log detection failure with context', () => {
  const log = logDetectionFailure('unknown-site', 'no-metadata', 'Missing chapter metadata');
  expect(log.success).toBe(false);
  expect(log.error).toBe('Missing chapter metadata');
});
```

**Purpose**: Verify failure logging  
**Preconditions**: Detection failure event  
**Expected Result**: Logged with error details  

#### Test Case 4.3: Calculate accuracy metrics

```typescript
it('should calculate accuracy percentage', () => {
  const metrics = calculateAccuracyMetrics(95, 100);
  expect(metrics.accuracy).toBe(95);
  expect(metrics.failureRate).toBe(5);
});
```

**Purpose**: Verify metrics calculation  
**Preconditions**: Success and total counts provided  
**Expected Result**: Correct metrics calculated  

## Integration Tests

### Integration Test Suite 1: Chapter Detection Across Sites

**File**: `tests/integration/accuracy-detection.integration.test.ts`

#### Test Case 1.1: MangaDex chapter detection

```typescript
describe('Chapter Detection Integration', () => {
  it('should detect chapters on MangaDex snapshot', async () => {
    const html = loadFixture('mangadex-snapshot.html');
    const chapters = detectChaptersFromSnapshot(html);
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters[0]).toMatch(/^\d+(\.\d+)?$/);
  });
});
```

**Purpose**: Verify detection on real site snapshot  
**Components Involved**: HTML parser, chapter detector, fixture loader  
**Preconditions**: MangaDex HTML snapshot available  
**Expected Result**: Chapters detected correctly  

#### Test Case 1.2: Multiple platform detection

```typescript
it('should detect chapters across multiple platforms', async () => {
  const platforms = ['mangadex', 'webtoon', 'custom'];
  for (const platform of platforms) {
    const html = loadFixture(`${platform}-snapshot.html`);
    const chapters = detectChaptersFromSnapshot(html);
    expect(chapters.length).toBeGreaterThan(0);
  }
});
```

**Purpose**: Verify multi-platform support  
**Components Involved**: Multiple site adapters  
**Preconditions**: Snapshots for all platforms  
**Expected Result**: All platforms detected successfully  

### Integration Test Suite 2: Scroll Position Persistence

**File**: `tests/integration/scroll-persistence.integration.test.ts`

#### Test Case 2.1: Save and restore scroll position

```typescript
describe('Scroll Position Persistence', () => {
  it('should save and restore scroll position', async () => {
    const originalPosition = 500;
    await saveScrollPosition('chapter-42', originalPosition);
    const restored = await getScrollPosition('chapter-42');
    expect(restored).toBe(originalPosition);
  });
});
```

**Purpose**: Verify persistence across sessions  
**Components Involved**: Storage service, scroll tracker  
**Preconditions**: Storage service available  
**Expected Result**: Position persisted and restored  

#### Test Case 2.2: Handle multiple chapters

```typescript
it('should track positions for multiple chapters', async () => {
  await saveScrollPosition('chapter-1', 100);
  await saveScrollPosition('chapter-2', 200);
  expect(await getScrollPosition('chapter-1')).toBe(100);
  expect(await getScrollPosition('chapter-2')).toBe(200);
});
```

**Purpose**: Verify multi-chapter tracking  
**Components Involved**: Storage service  
**Preconditions**: Storage service available  
**Expected Result**: Each chapter position tracked independently  

### Integration Test Suite 3: Accuracy Metrics Collection

**File**: `tests/integration/accuracy-metrics.integration.test.ts`

#### Test Case 3.1: Collect and aggregate metrics

```typescript
describe('Accuracy Metrics', () => {
  it('should collect and aggregate accuracy metrics', async () => {
    await logDetectionSuccess('mangadex', 'ch-1', 0.95);
    await logDetectionSuccess('mangadex', 'ch-2', 0.92);
    const metrics = await getAccuracyMetrics('mangadex');
    expect(metrics.accuracy).toBeGreaterThan(90);
  });
});
```

**Purpose**: Verify metrics aggregation  
**Components Involved**: Logger, metrics aggregator, database  
**Preconditions**: Database available  
**Expected Result**: Metrics correctly aggregated  

## End-to-End Tests

### E2E Test Suite 1: Complete Reading Session

**File**: `tests/e2e/reading-session.spec.ts`  
**Tool**: Playwright

#### Test Case 1.1: Read chapter and track progress

```typescript
test('should track reading progress through chapter', async ({ page }) => {
  await page.goto('https://mangadex.org/chapter/abc123');
  
  // Scroll through chapter
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1000);
  
  // Verify progress tracked
  const progress = await page.evaluate(() => {
    return window.readtraceExtension?.getProgress?.();
  });
  
  expect(progress).toBeDefined();
  expect(progress.chapter).toBe('1.0');
  expect(progress.scrollPercentage).toBeGreaterThan(0);
});
```

**Purpose**: Verify complete reading session tracking  
**User Persona**: Regular manga reader  
**Steps**:
1. Navigate to manga chapter
2. Scroll through content
3. Verify progress captured

**Expected Result**: Progress tracked with chapter and scroll position  

#### Test Case 1.2: Resume reading from saved position

```typescript
test('should resume reading from saved position', async ({ page }) => {
  // First session - read and save
  await page.goto('https://mangadex.org/chapter/abc123');
  await page.evaluate(() => window.scrollBy(0, 500));
  
  // Second session - verify position restored
  await page.reload();
  const scrollTop = await page.evaluate(() => window.scrollY);
  
  expect(scrollTop).toBeGreaterThan(400);
});
```

**Purpose**: Verify position restoration across sessions  
**User Persona**: Regular manga reader  
**Steps**:
1. Read and save position
2. Reload page
3. Verify position restored

**Expected Result**: Position restored to previous location  

## Error Handling Tests

### Error Test Suite 1: Detection Failures

#### Test Case 1.1: Handle missing chapter metadata

```typescript
it('should handle missing chapter metadata gracefully', () => {
  const html = '<html><body>No metadata</body></html>';
  expect(() => detectChapterFromHTML(html)).not.toThrow();
  const result = detectChapterFromHTML(html);
  expect(result).toBeNull();
});
```

**Error Type**: Missing metadata  
**Trigger Condition**: HTML without chapter information  
**Expected Behavior**: Returns null without throwing  
**Error Message**: None (graceful degradation)  

#### Test Case 1.2: Handle malformed HTML

```typescript
it('should recover from malformed HTML', () => {
  const html = '<html><body><div>Unclosed tags';
  const result = detectChapterFromHTML(html);
  expect(result).toBeDefined();
});
```

**Error Type**: Malformed HTML  
**Trigger Condition**: Invalid HTML structure  
**Expected Behavior**: Attempts recovery with heuristics  
**Recovery Strategy**: Use fallback detection methods  

## Performance Tests

### Performance Test Suite 1: Detection Speed

#### Test Case 1.1: Chapter detection under 500ms

```typescript
it('should detect chapter in under 500ms', async () => {
  const startTime = performance.now();
  const chapter = await detectChapter('https://mangadex.org/chapter/abc123');
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(500);
});
```

**Metric**: Detection time  
**Target**: <500ms  
**Baseline**: TBD after initial implementation  

#### Test Case 1.2: No memory leaks during extended use

```typescript
it('should not leak memory during 1000 detections', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  for (let i = 0; i < 1000; i++) {
    await detectChapter(`https://mangadex.org/chapter/test${i}`);
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const increase = finalMemory - initialMemory;
  
  expect(increase).toBeLessThan(10 * 1024 * 1024); // 10MB
});
```

**Metric**: Memory usage  
**Target**: <10MB increase for 1000 operations  

## Accessibility Tests

### Accessibility Test Suite 1: Error Messages

#### Test Case 1.1: Error messages are accessible

```typescript
it('should display accessible error messages', async ({ page }) => {
  const errorMessage = page.locator('[role="alert"]');
  await expect(errorMessage).toBeVisible();
  const text = await errorMessage.textContent();
  expect(text).toBeTruthy();
});
```

**Purpose**: Verify error message accessibility  
**Standard**: WCAG 2.1 Level AA  

## Test Data

### Test Data Sets

#### Data Set 1: Valid Chapter Detection

```json
{
  "url": "https://mangadex.org/chapter/abc123",
  "html": "<meta property='og:title' content='Chapter 42'>",
  "expectedChapter": "42",
  "expectedAccuracy": 0.95
}
```

**Usage**: Chapter detection tests  
**Validity**: Valid, expected to pass  

#### Data Set 2: Invalid/Missing Metadata

```json
{
  "url": "https://unknown-site.com/chapter",
  "html": "<html><body>No metadata</body></html>",
  "expectedChapter": null,
  "expectedAccuracy": 0
}
```

**Usage**: Error handling tests  
**Validity**: Invalid, expected to fail gracefully  

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=unit

# Run integration tests
npm test -- --testPathPattern=integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage Report

```bash
npm test -- --coverage --coverageReporters=html
```

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | |
| Tech Lead | | | |

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18  
**Next Review**: 2026-02-25

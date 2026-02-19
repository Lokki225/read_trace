# Test Scenarios: Platform Adapter Architecture

## Overview

**Feature**: Platform Adapter Architecture for MangaDex & Additional Sites  
**Feature ID**: 4-4  
**Story**: 4-4  
**Last Updated**: 2026-02-18  

This document outlines comprehensive test scenarios for validating adapter functionality, including unit tests, integration tests, and error handling.

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

- **Unit Tests**: 85%+ code coverage for adapter logic
- **Integration Tests**: Real site snapshots or mock DOM structures
- **End-to-End Tests**: Critical user flows (content script detection)

## Unit Tests

### Test Suite 1: Adapter Interface

**File**: `tests/unit/extension/adapters/adapter.test.ts`

#### Test Case 1.1: Adapter implements required interface

```typescript
describe('PlatformAdapter Interface', () => {
  it('should implement all required methods', () => {
    const adapter = new MangaDexAdapter();
    expect(adapter.name).toBeDefined();
    expect(adapter.urlPattern).toBeDefined();
    expect(typeof adapter.detectSeries).toBe('function');
    expect(typeof adapter.detectChapter).toBe('function');
    expect(typeof adapter.detectProgress).toBe('function');
    expect(typeof adapter.validatePage).toBe('function');
  });
});
```

**Purpose**: Verify all adapters implement the required interface  
**Preconditions**: Adapter class instantiated  
**Expected Result**: All methods and properties exist  

#### Test Case 1.2: URL pattern matching

```typescript
it('should match correct URLs', () => {
  const adapter = new MangaDexAdapter();
  expect(adapter.urlPattern.test('https://mangadex.org/title/abc123')).toBe(true);
  expect(adapter.urlPattern.test('https://example.com/manga')).toBe(false);
});
```

**Purpose**: Verify URL pattern matching works correctly  
**Preconditions**: Adapter instantiated  
**Expected Result**: Correct URLs match, incorrect URLs don't  

### Test Suite 2: MangaDex Adapter

**File**: `tests/unit/extension/adapters/mangadex.test.ts`

#### Test Case 2.1: Series detection from meta tags

```typescript
describe('MangaDexAdapter', () => {
  it('should extract series title from meta tags', () => {
    const mockDOM = createMockMangaDexPage();
    const adapter = new MangaDexAdapter();
    const series = adapter.detectSeries(mockDOM);
    expect(series.title).toBe('Solo Leveling');
    expect(series.url).toBeDefined();
  });
});
```

**Purpose**: Verify series title extraction from MangaDex pages  
**Preconditions**: Mock MangaDex DOM structure  
**Expected Result**: Correct series title extracted  

#### Test Case 2.2: Chapter detection from URL

```typescript
it('should extract chapter number from URL', () => {
  const mockDOM = createMockMangaDexPage({ url: 'https://mangadex.org/chapter/xyz789' });
  const adapter = new MangaDexAdapter();
  const chapter = adapter.detectChapter(mockDOM);
  expect(chapter.number).toBe(123);
  expect(chapter.url).toBeDefined();
});
```

**Purpose**: Verify chapter number extraction  
**Preconditions**: Mock MangaDex chapter page  
**Expected Result**: Correct chapter number extracted  

#### Test Case 2.3: Page progress detection

```typescript
it('should detect current page and total pages', () => {
  const mockDOM = createMockMangaDexPage();
  const adapter = new MangaDexAdapter();
  const progress = adapter.detectProgress(mockDOM);
  expect(progress.currentPage).toBeGreaterThan(0);
  expect(progress.totalPages).toBeGreaterThan(progress.currentPage);
});
```

**Purpose**: Verify progress detection from page indicators  
**Preconditions**: Mock MangaDex reading page  
**Expected Result**: Current and total pages detected  

#### Test Case 2.4: Page validation

```typescript
it('should validate MangaDex reading pages', () => {
  const readingPageDOM = createMockMangaDexPage();
  const nonReadingPageDOM = createMockMangaDexPage({ isReadingPage: false });
  const adapter = new MangaDexAdapter();
  expect(adapter.validatePage(readingPageDOM)).toBe(true);
  expect(adapter.validatePage(nonReadingPageDOM)).toBe(false);
});
```

**Purpose**: Verify page validation works correctly  
**Preconditions**: Mock reading and non-reading pages  
**Expected Result**: Correct validation results  

### Test Suite 3: Secondary Platform Adapter

**File**: `tests/unit/extension/adapters/[platform].test.ts`

#### Test Case 3.1: Platform-specific selector accuracy

```typescript
describe('[PlatformName]Adapter', () => {
  it('should extract data using platform-specific selectors', () => {
    const mockDOM = createMock[Platform]Page();
    const adapter = new [Platform]Adapter();
    const series = adapter.detectSeries(mockDOM);
    expect(series.title).toBeDefined();
    expect(series.title.length).toBeGreaterThan(0);
  });
});
```

**Purpose**: Verify platform-specific selectors work  
**Preconditions**: Mock platform DOM structure  
**Expected Result**: Data extracted correctly  

## Integration Tests

### Integration Test Suite 1: Adapter Registry

**File**: `tests/integration/adapters/registry.integration.test.ts`

#### Test Case 1.1: Adapter detection by URL

```typescript
describe('Adapter Registry', () => {
  it('should detect correct adapter for MangaDex URL', () => {
    const url = 'https://mangadex.org/title/abc123';
    const adapter = detectAdapter(url);
    expect(adapter).toBeInstanceOf(MangaDexAdapter);
  });

  it('should detect correct adapter for secondary platform', () => {
    const url = 'https://[platform].com/manga/xyz';
    const adapter = detectAdapter(url);
    expect(adapter).toBeInstanceOf([Platform]Adapter);
  });

  it('should return null for unsupported sites', () => {
    const url = 'https://unsupported.com/manga';
    const adapter = detectAdapter(url);
    expect(adapter).toBeNull();
  });
});
```

**Purpose**: Verify adapter registry correctly detects adapters  
**Components Involved**: Adapter registry, all adapters  
**Preconditions**: All adapters registered  
**Expected Result**: Correct adapters detected or null for unsupported sites  

### Integration Test Suite 2: Real Site Snapshots

**File**: `tests/integration/adapters/real-sites.integration.test.ts`

#### Test Case 2.1: MangaDex real page snapshot

```typescript
describe('MangaDex Real Site Integration', () => {
  it('should extract data from real MangaDex page snapshot', () => {
    const realPageHTML = loadFixture('mangadex-page-snapshot.html');
    const adapter = new MangaDexAdapter();
    const series = adapter.detectSeries(realPageHTML);
    const chapter = adapter.detectChapter(realPageHTML);
    const progress = adapter.detectProgress(realPageHTML);
    
    expect(series.title).toBeDefined();
    expect(chapter.number).toBeDefined();
    expect(progress.currentPage).toBeDefined();
  });
});
```

**Purpose**: Verify adapters work with real site HTML  
**API Endpoints**: None (content script only)  
**Preconditions**: Real site HTML snapshots in fixtures  
**Expected Result**: All data extracted correctly  

#### Test Case 2.2: Secondary platform real page snapshot

```typescript
it('should extract data from real [platform] page snapshot', () => {
  const realPageHTML = loadFixture('[platform]-page-snapshot.html');
  const adapter = new [Platform]Adapter();
  const series = adapter.detectSeries(realPageHTML);
  const chapter = adapter.detectChapter(realPageHTML);
  
  expect(series.title).toBeDefined();
  expect(chapter.number).toBeDefined();
});
```

**Purpose**: Verify secondary adapter works with real site HTML  
**Preconditions**: Real site HTML snapshots  
**Expected Result**: Data extracted correctly  

## Error Handling Tests

### Error Test Suite 1: Missing Elements

#### Test Case 1.1: Handle missing series title

```typescript
describe('Error Handling - Missing Elements', () => {
  it('should handle missing series title gracefully', () => {
    const mockDOM = createMockMangaDexPage({ omitTitle: true });
    const adapter = new MangaDexAdapter();
    const series = adapter.detectSeries(mockDOM);
    expect(series).not.toBeNull();
    expect(series.title).toBeNull();
  });
});
```

**Error Type**: Missing DOM element  
**Trigger Condition**: Required selector not found  
**Expected Behavior**: Return null for missing field, not throw error  
**Error Message**: Log warning in console  

#### Test Case 1.2: Handle missing chapter number

```typescript
it('should handle missing chapter number gracefully', () => {
  const mockDOM = createMockMangaDexPage({ omitChapter: true });
  const adapter = new MangaDexAdapter();
  const chapter = adapter.detectChapter(mockDOM);
  expect(chapter).not.toBeNull();
  expect(chapter.number).toBeNull();
});
```

**Error Type**: Missing chapter data  
**Trigger Condition**: Chapter selector not found  
**Expected Behavior**: Return null for chapter number  
**Recovery Strategy**: Continue with null value, let extension handle  

### Error Test Suite 2: Malformed HTML

#### Test Case 2.1: Handle malformed HTML

```typescript
describe('Error Handling - Malformed HTML', () => {
  it('should handle malformed HTML without crashing', () => {
    const malformedHTML = '<div><p>Unclosed tag<div>Nested wrong</p>';
    const adapter = new MangaDexAdapter();
    expect(() => adapter.detectSeries(malformedHTML)).not.toThrow();
  });
});
```

**Error Type**: Malformed HTML  
**Trigger Condition**: Invalid HTML structure  
**Expected Behavior**: Gracefully degrade, attempt fallback selectors  
**Recovery Strategy**: Return null values, log debug info  

### Error Test Suite 3: Dynamic Content

#### Test Case 3.1: Handle dynamically loaded content

```typescript
describe('Error Handling - Dynamic Content', () => {
  it('should handle content loaded after initial page load', async () => {
    const mockDOM = createMockMangaDexPage({ dynamicContent: true });
    const adapter = new MangaDexAdapter();
    const series = await adapter.detectSeries(mockDOM);
    expect(series).toBeDefined();
  });
});
```

**Error Type**: Dynamic content not immediately available  
**Trigger Condition**: Content loaded via JavaScript  
**Expected Behavior**: Retry or use MutationObserver  
**Recovery Strategy**: Wait for content or return null  

## Performance Tests

### Performance Test Suite 1: Detection Speed

#### Test Case 1.1: Adapter detection performance

```typescript
describe('Performance - Detection', () => {
  it('should detect adapter in under 100ms', () => {
    const url = 'https://mangadex.org/title/abc123';
    const startTime = performance.now();
    const adapter = detectAdapter(url);
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

**Metric**: Adapter detection time  
**Target**: <100ms  
**Baseline**: TBD  

#### Test Case 1.2: Data extraction performance

```typescript
it('should extract data in under 500ms', () => {
  const mockDOM = createMockMangaDexPage();
  const adapter = new MangaDexAdapter();
  const startTime = performance.now();
  adapter.detectSeries(mockDOM);
  adapter.detectChapter(mockDOM);
  adapter.detectProgress(mockDOM);
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(500);
});
```

**Metric**: Data extraction time  
**Target**: <500ms  
**Baseline**: TBD  

## Test Data

### Test Data Sets

#### Data Set 1: Valid MangaDex Page

```json
{
  "title": "Solo Leveling",
  "chapterNumber": 123,
  "currentPage": 5,
  "totalPages": 20,
  "url": "https://mangadex.org/chapter/xyz789"
}
```

**Usage**: MangaDex adapter tests  
**Validity**: Valid, expected to pass  

#### Data Set 2: Valid Secondary Platform Page

```json
{
  "title": "Tower of God",
  "chapterNumber": 456,
  "currentPage": 10,
  "totalPages": 30,
  "url": "https://[platform].com/manga/abc123"
}
```

**Usage**: Secondary platform adapter tests  
**Validity**: Valid, expected to pass  

#### Data Set 3: Missing Elements

```json
{
  "title": null,
  "chapterNumber": null,
  "currentPage": null,
  "totalPages": null
}
```

**Usage**: Error handling tests  
**Validity**: Invalid/incomplete, expected to handle gracefully  

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run adapter tests only
npm test -- --testPathPattern=adapters

# Run with coverage
npm test -- --coverage

# Run integration tests
npm test -- --testPathPattern=integration
```

### Test Coverage Report

```bash
npm test -- --coverage --coverageReporters=html
```

## Test Maintenance

### Test Review Checklist

- [ ] Tests are independent and can run in any order
- [ ] Tests have clear, descriptive names
- [ ] Tests follow AAA (Arrange-Act-Assert) pattern
- [ ] No hardcoded values or magic numbers
- [ ] Proper setup and teardown
- [ ] Tests are not flaky or intermittent
- [ ] Tests have reasonable execution time

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | |
| Tech Lead | | | |

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18  
**Next Review**: [YYYY-MM-DD]

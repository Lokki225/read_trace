# Test Scenarios

## Overview

**Feature**: Browser Extension Content Script for DOM Monitoring  
**Feature ID**: 4-1  
**Story**: 4-1  
**Last Updated**: 2026-02-18  

This document outlines comprehensive test scenarios for validating the content script functionality.

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

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: 70%+ feature coverage
- **End-to-End Tests**: Critical user flows only

## Unit Tests

### Test Suite 1: MangaDex Adapter

**File**: `tests/unit/extension/adapters/mangadex.test.ts`

#### Test Case 1.1: Extract Series Title from Metadata

```typescript
describe('MangaDex Adapter', () => {
  it('should extract series title from og:title meta tag', () => {
    const dom = createMockDOM({
      metaTags: { 'og:title': 'Solo Leveling' }
    });
    const title = mangadexAdapter.extractSeriesTitle(dom);
    expect(title).toBe('Solo Leveling');
  });
});
```

**Purpose**: Verify accurate series title extraction  
**Preconditions**: Mock DOM with og:title meta tag  
**Expected Result**: Returns exact series title  

#### Test Case 1.2: Extract Chapter Number from URL

```typescript
it('should extract chapter number from URL path', () => {
  const url = 'https://mangadex.org/chapter/12345/1';
  const chapterNum = mangadexAdapter.extractChapterNumber(url);
  expect(chapterNum).toBe(12345);
});
```

**Purpose**: Verify chapter extraction from various URL formats  
**Preconditions**: Valid MangaDex chapter URL  
**Expected Result**: Returns numeric chapter ID  

#### Test Case 1.3: Handle Missing Series Title

```typescript
it('should return null when series title not found', () => {
  const dom = createMockDOM({ metaTags: {} });
  const title = mangadexAdapter.extractSeriesTitle(dom);
  expect(title).toBeNull();
});
```

**Purpose**: Verify graceful handling of missing data  
**Preconditions**: DOM without title meta tag  
**Expected Result**: Returns null, no errors thrown  

### Test Suite 2: Content Script Core

**File**: `tests/unit/extension/content.test.ts`

#### Test Case 2.1: Initialize Content Script

```typescript
describe('Content Script', () => {
  it('should initialize and establish background communication', () => {
    const script = new ContentScript();
    expect(script.isInitialized).toBe(true);
  });
});
```

**Purpose**: Verify script initialization  
**Preconditions**: Script loaded in DOM  
**Expected Result**: Script ready for monitoring  

#### Test Case 2.2: Debounce Scroll Events

```typescript
it('should debounce scroll events with 500ms delay', async () => {
  const script = new ContentScript();
  const updateSpy = jest.fn();
  script.onProgressUpdate = updateSpy;
  
  // Simulate rapid scroll events
  for (let i = 0; i < 10; i++) {
    script.handleScroll();
  }
  
  await new Promise(resolve => setTimeout(resolve, 600));
  expect(updateSpy).toHaveBeenCalledTimes(1);
});
```

**Purpose**: Verify scroll event debouncing  
**Preconditions**: Rapid scroll events triggered  
**Expected Result**: Only one update sent after debounce delay  

#### Test Case 2.3: Send Progress Update Message

```typescript
it('should send progress update to background script', async () => {
  const script = new ContentScript();
  const sendMessageSpy = jest.spyOn(chrome.runtime, 'sendMessage');
  
  await script.sendProgressUpdate({
    seriesTitle: 'Solo Leveling',
    chapterNumber: 100,
    scrollPosition: 50
  });
  
  expect(sendMessageSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'PROGRESS_UPDATE'
    })
  );
});
```

**Purpose**: Verify message passing to background script  
**Preconditions**: Progress data available  
**Expected Result**: Message sent with correct format  

### Test Suite 3: Adapter Registry

**File**: `tests/unit/extension/adapters/index.test.ts`

#### Test Case 3.1: Detect Adapter for URL

```typescript
describe('Adapter Registry', () => {
  it('should detect MangaDex adapter for MangaDex URLs', () => {
    const url = 'https://mangadex.org/chapter/12345/1';
    const adapter = adapterRegistry.getAdapter(url);
    expect(adapter).toBe(mangadexAdapter);
  });
});
```

**Purpose**: Verify adapter detection logic  
**Preconditions**: URL from supported site  
**Expected Result**: Correct adapter returned  

#### Test Case 3.2: Return Null for Unsupported Sites

```typescript
it('should return null for unsupported sites', () => {
  const url = 'https://example.com/page';
  const adapter = adapterRegistry.getAdapter(url);
  expect(adapter).toBeNull();
});
```

**Purpose**: Verify graceful handling of unsupported sites  
**Preconditions**: URL from unsupported site  
**Expected Result**: Returns null, no errors  

## Integration Tests

### Integration Test Suite 1: Content Script with Adapter

**File**: `tests/integration/content-script.integration.test.ts`

#### Test Case 1.1: Full Reading Session Simulation

```typescript
describe('Content Script Integration', () => {
  beforeEach(() => {
    setupMockDOM();
    initializeContentScript();
  });

  it('should track complete reading session', async () => {
    // Simulate page load
    const title = await contentScript.detectSeriesTitle();
    expect(title).toBe('Solo Leveling');
    
    // Simulate chapter navigation
    const chapter = await contentScript.detectChapterNumber();
    expect(chapter).toBe(100);
    
    // Simulate scrolling
    contentScript.simulateScroll(25);
    await waitForDebounce();
    
    // Verify update sent
    expect(backgroundScriptMock.lastMessage).toEqual(
      expect.objectContaining({
        type: 'PROGRESS_UPDATE',
        payload: expect.objectContaining({
          seriesTitle: 'Solo Leveling',
          chapterNumber: 100,
          scrollPosition: 25
        })
      })
    );
  });
});
```

**Purpose**: Verify end-to-end content script workflow  
**Components Involved**: Content script, adapter, message passing  
**Preconditions**: Mock DOM and background script  
**Expected Result**: Complete reading session tracked accurately  

#### Test Case 1.2: Handle Rapid Chapter Navigation

```typescript
it('should handle rapid chapter navigation correctly', async () => {
  // Navigate to chapter 100
  contentScript.simulateNavigation('chapter/100');
  await waitForDebounce();
  
  // Quickly navigate to chapter 101
  contentScript.simulateNavigation('chapter/101');
  await waitForDebounce();
  
  // Verify both updates sent in order
  const messages = backgroundScriptMock.getAllMessages();
  expect(messages).toHaveLength(2);
  expect(messages[0].payload.chapterNumber).toBe(100);
  expect(messages[1].payload.chapterNumber).toBe(101);
});
```

**Purpose**: Verify handling of rapid navigation  
**Components Involved**: Content script, adapter  
**Preconditions**: Multiple chapter navigation events  
**Expected Result**: All updates sent in correct order  

### Integration Test Suite 2: Message Passing

**File**: `tests/integration/message-passing.integration.test.ts`

#### Test Case 2.1: Successful Message Delivery

```typescript
describe('Message Passing', () => {
  it('should deliver progress update to background script', async () => {
    const message = {
      type: 'PROGRESS_UPDATE',
      payload: {
        seriesTitle: 'Solo Leveling',
        chapterNumber: 100,
        scrollPosition: 50,
        timestamp: Date.now(),
        url: 'https://mangadex.org/chapter/12345/1'
      }
    };
    
    const response = await sendMessage(message);
    expect(response.success).toBe(true);
  });
});
```

**Purpose**: Verify message delivery reliability  
**API Endpoints**: chrome.runtime.sendMessage  
**Preconditions**: Background script listening  
**Expected Result**: Message delivered successfully  

## Error Handling Tests

### Error Test Suite 1: Missing DOM Elements

#### Test Case 1.1: Handle Missing Series Title

```typescript
it('should handle missing series title gracefully', () => {
  const dom = createMockDOM({ metaTags: {} });
  const title = mangadexAdapter.extractSeriesTitle(dom);
  
  expect(title).toBeNull();
  expect(console.warn).toHaveBeenCalledWith(
    'Could not extract series title from page'
  );
});
```

**Error Type**: Missing DOM element  
**Trigger Condition**: Series title meta tag not present  
**Expected Behavior**: Returns null, logs warning  
**Error Message**: "Could not extract series title from page"  

#### Test Case 1.2: Handle Invalid Chapter Number

```typescript
it('should handle invalid chapter number format', () => {
  const url = 'https://mangadex.org/invalid-url';
  const chapter = mangadexAdapter.extractChapterNumber(url);
  
  expect(chapter).toBeNull();
  expect(console.error).toHaveBeenCalledWith(
    'Invalid chapter format detected'
  );
});
```

**Error Type**: Invalid data format  
**Trigger Condition**: URL doesn't match expected pattern  
**Expected Behavior**: Returns null, logs error  
**Error Message**: "Invalid chapter format detected"  

## Performance Tests

### Performance Test Suite 1: Script Injection

#### Test Case 1.1: Injection Time

```typescript
it('should inject content script in under 100ms', async () => {
  const startTime = performance.now();
  await injectContentScript();
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(100);
});
```

**Metric**: Injection time  
**Target**: <100ms  

#### Test Case 1.2: Scroll Event Processing

```typescript
it('should process scroll events in under 50ms', async () => {
  const startTime = performance.now();
  contentScript.handleScroll();
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(50);
});
```

**Metric**: Event processing latency  
**Target**: <50ms  

#### Test Case 1.3: Memory Usage

```typescript
it('should use less than 5MB of memory', () => {
  const initialMemory = performance.memory.usedJSHeapSize;
  
  // Simulate 1000 scroll events
  for (let i = 0; i < 1000; i++) {
    contentScript.handleScroll();
  }
  
  const finalMemory = performance.memory.usedJSHeapSize;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB
});
```

**Metric**: Memory usage  
**Target**: <5MB increase after 1000 events  

## Test Data

### Test Data Sets

#### Data Set 1: Valid MangaDex Page

```json
{
  "url": "https://mangadex.org/chapter/12345/1",
  "metaTags": {
    "og:title": "Solo Leveling - Chapter 100",
    "og:image": "https://..."
  },
  "scrollPosition": 50,
  "expectedSeriesTitle": "Solo Leveling",
  "expectedChapterNumber": 12345
}
```

**Usage**: Happy path tests  
**Validity**: Valid, expected to pass  

#### Data Set 2: Invalid Chapter URL

```json
{
  "url": "https://mangadex.org/invalid",
  "expectedChapterNumber": null,
  "expectedError": "Invalid chapter format detected"
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

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/unit/extension/content.test.ts
```

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | |
| Tech Lead | | | |

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18  
**Next Review**: [YYYY-MM-DD]

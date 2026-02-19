# Test Scenarios

## Overview

**Feature**: Background Script & Real-Time Progress Synchronization  
**Feature ID**: 4-2  
**Story**: 4-2  
**Last Updated**: 2026-02-18  

This document outlines comprehensive test scenarios for validating the background script functionality.

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

### Test Suite 1: Background Service Worker

**File**: `tests/unit/extension/background.test.ts`

#### Test Case 1.1: Initialize Background Script

```typescript
describe('Background Service Worker', () => {
  it('should initialize and register message listener', () => {
    const script = new BackgroundScript();
    expect(script.isInitialized).toBe(true);
  });
});
```

**Purpose**: Verify background script initializes correctly  
**Preconditions**: Script loaded in extension context  
**Expected Result**: Message listener registered  

#### Test Case 1.2: Receive Progress Update

```typescript
it('should receive and process progress update from content script', async () => {
  const update = {
    series_id: 'series-123',
    chapter: 100,
    scroll_position: 50,
    timestamp: Date.now()
  };
  
  const response = await sendMessage(update);
  expect(response.success).toBe(true);
});
```

**Purpose**: Verify message reception and processing  
**Preconditions**: Background script initialized  
**Expected Result**: Update processed successfully  

#### Test Case 1.3: Send to API

```typescript
it('should send progress to API within 5 seconds', async () => {
  const startTime = Date.now();
  await backgroundScript.syncProgress(testUpdate);
  const elapsed = Date.now() - startTime;
  
  expect(elapsed).toBeLessThan(5000);
});
```

**Purpose**: Verify API sync latency  
**Preconditions**: API endpoint available  
**Expected Result**: Sync completes within 5 seconds  

### Test Suite 2: Sync Queue

**File**: `tests/unit/extension/queue/syncQueue.test.ts`

#### Test Case 2.1: Add Update to Queue

```typescript
describe('Sync Queue', () => {
  it('should add update to queue when offline', () => {
    const queue = new SyncQueue();
    queue.addUpdate(testUpdate);
    
    expect(queue.size()).toBe(1);
  });
});
```

**Purpose**: Verify queue add operation  
**Preconditions**: Queue initialized  
**Expected Result**: Update added to queue  

#### Test Case 2.2: Persist Queue to localStorage

```typescript
it('should persist queue to localStorage', () => {
  const queue = new SyncQueue();
  queue.addUpdate(testUpdate);
  queue.save();
  
  const stored = localStorage.getItem('syncQueue');
  expect(stored).toBeTruthy();
});
```

**Purpose**: Verify queue persistence  
**Preconditions**: localStorage available  
**Expected Result**: Queue saved to storage  

#### Test Case 2.3: Process Queue

```typescript
it('should process all queued updates', async () => {
  const queue = new SyncQueue();
  queue.addUpdate(update1);
  queue.addUpdate(update2);
  
  const results = await queue.processAll();
  expect(results).toHaveLength(2);
  expect(queue.size()).toBe(0);
});
```

**Purpose**: Verify queue processing  
**Preconditions**: Queue has updates, API available  
**Expected Result**: All updates processed and removed  

### Test Suite 3: Deduplicator

**File**: `tests/unit/extension/queue/deduplicator.test.ts`

#### Test Case 3.1: Detect Duplicate Update

```typescript
describe('Deduplicator', () => {
  it('should detect duplicate updates', () => {
    const dedup = new Deduplicator();
    const update1 = { series_id: 'series-1', chapter: 100, timestamp: 1000 };
    const update2 = { series_id: 'series-1', chapter: 100, timestamp: 1001 };
    
    dedup.add(update1);
    const isDuplicate = dedup.isDuplicate(update2);
    
    expect(isDuplicate).toBe(true);
  });
});
```

**Purpose**: Verify duplicate detection  
**Preconditions**: Deduplicator initialized  
**Expected Result**: Duplicate correctly identified  

#### Test Case 3.2: Keep Latest Update

```typescript
it('should keep latest update and discard old', () => {
  const dedup = new Deduplicator();
  const update1 = { series_id: 'series-1', chapter: 100, timestamp: 1000 };
  const update2 = { series_id: 'series-1', chapter: 100, timestamp: 2000 };
  
  dedup.add(update1);
  dedup.add(update2);
  
  const latest = dedup.getLatest('series-1', 100);
  expect(latest.timestamp).toBe(2000);
});
```

**Purpose**: Verify deduplication strategy  
**Preconditions**: Multiple updates for same series+chapter  
**Expected Result**: Latest update kept  

## Integration Tests

### Integration Test Suite 1: Offline/Online Transitions

**File**: `tests/integration/background-offline.integration.test.ts`

#### Test Case 1.1: Queue Updates When Offline

```typescript
describe('Offline/Online Transitions', () => {
  it('should queue updates when offline', async () => {
    simulateOffline();
    
    await backgroundScript.handleProgressUpdate(testUpdate);
    
    const queued = await backgroundScript.getQueuedUpdates();
    expect(queued).toHaveLength(1);
  });
});
```

**Purpose**: Verify offline queueing  
**Components Involved**: Background script, sync queue  
**Preconditions**: Network offline  
**Expected Result**: Update queued locally  

#### Test Case 1.2: Sync When Reconnected

```typescript
it('should sync queued updates when reconnected', async () => {
  simulateOffline();
  await backgroundScript.handleProgressUpdate(update1);
  await backgroundScript.handleProgressUpdate(update2);
  
  simulateOnline();
  await backgroundScript.onOnline();
  
  const queued = await backgroundScript.getQueuedUpdates();
  expect(queued).toHaveLength(0);
});
```

**Purpose**: Verify reconnection sync  
**Components Involved**: Background script, sync queue, API client  
**Preconditions**: Updates queued offline, connection restored  
**Expected Result**: All queued updates synced  

### Integration Test Suite 2: API Communication

**File**: `tests/integration/background-api.integration.test.ts`

#### Test Case 2.1: Successful API Sync

```typescript
describe('API Communication', () => {
  it('should successfully sync to API', async () => {
    const response = await backgroundScript.syncToAPI(testUpdate);
    
    expect(response.success).toBe(true);
    expect(response.synced_at).toBeTruthy();
  });
});
```

**Purpose**: Verify API communication  
**API Endpoints**: POST `/api/progress/sync`  
**Preconditions**: API available, valid update  
**Expected Result**: Update synced successfully  

#### Test Case 2.2: Handle API Errors

```typescript
it('should handle API errors gracefully', async () => {
  mockAPIError(500);
  
  await backgroundScript.syncToAPI(testUpdate);
  
  const queued = await backgroundScript.getQueuedUpdates();
  expect(queued).toHaveLength(1);
});
```

**Purpose**: Verify error handling  
**API Endpoints**: POST `/api/progress/sync`  
**Preconditions**: API returns error  
**Expected Result**: Update queued for retry  

## Error Handling Tests

### Error Test Suite 1: Network Failures

#### Test Case 1.1: Handle Network Timeout

```typescript
it('should handle network timeout', async () => {
  mockNetworkTimeout();
  
  await backgroundScript.syncToAPI(testUpdate);
  
  const queued = await backgroundScript.getQueuedUpdates();
  expect(queued).toHaveLength(1);
});
```

**Error Type**: Network timeout  
**Trigger Condition**: API request exceeds timeout  
**Expected Behavior**: Update queued for retry  

#### Test Case 1.2: Handle Connection Lost

```typescript
it('should handle connection lost during sync', async () => {
  const syncPromise = backgroundScript.syncToAPI(testUpdate);
  simulateOffline();
  
  await syncPromise;
  
  const queued = await backgroundScript.getQueuedUpdates();
  expect(queued).toHaveLength(1);
});
```

**Error Type**: Connection lost  
**Trigger Condition**: Network disconnected during sync  
**Expected Behavior**: Update queued for retry  

## Performance Tests

### Performance Test Suite 1: Sync Latency

#### Test Case 1.1: API Sync Latency

```typescript
it('should sync to API in under 5 seconds', async () => {
  const startTime = performance.now();
  await backgroundScript.syncToAPI(testUpdate);
  const elapsed = performance.now() - startTime;
  
  expect(elapsed).toBeLessThan(5000);
});
```

**Metric**: Sync latency  
**Target**: <5 seconds  

#### Test Case 1.2: Queue Processing Speed

```typescript
it('should process queue at <100ms per update', async () => {
  const updates = generateTestUpdates(100);
  
  const startTime = performance.now();
  await backgroundScript.processQueue(updates);
  const elapsed = performance.now() - startTime;
  
  expect(elapsed / updates.length).toBeLessThan(100);
});
```

**Metric**: Queue processing speed  
**Target**: <100ms per update  

## Test Data

### Test Data Sets

#### Data Set 1: Valid Progress Update

```json
{
  "series_id": "series-123",
  "chapter": 100,
  "scroll_position": 50,
  "timestamp": 1708270800000,
  "url": "https://mangadex.org/chapter/12345/1"
}
```

**Usage**: Happy path tests  
**Validity**: Valid, expected to pass  

#### Data Set 2: Invalid Update (Missing Fields)

```json
{
  "series_id": "series-123",
  "chapter": 100
}
```

**Usage**: Error handling tests  
**Validity**: Invalid, expected to fail validation  

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
npm test -- tests/unit/extension/background.test.ts
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

# Test Scenarios

## Overview

**Feature**: Local Storage for Offline Functionality  
**Feature ID**: 4-5  
**Story**: 4-5  
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

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: 70%+ feature coverage
- **End-to-End Tests**: Critical user flows only

## Unit Tests

### Test Suite 1: Offline Storage

**File**: `tests/unit/extension/storage/offlineStorage.test.ts`

#### Test Case 1.1: Add Offline Progress

```typescript
describe('OfflineStorage', () => {
  it('should add offline progress to localStorage', () => {
    const progress = {
      series_id: 'series-1',
      chapter: 5,
      scroll_position: 0.5,
      timestamp: Date.now()
    };
    
    const result = offlineStorage.addProgress(progress);
    
    expect(result.id).toBeDefined();
    expect(result.synced).toBe(false);
  });
});
```

**Purpose**: Verify offline progress can be stored  
**Preconditions**: localStorage available  
**Expected Result**: Progress stored with unique ID  

#### Test Case 1.2: Retrieve Offline Progress

```typescript
it('should retrieve offline progress from localStorage', () => {
  const progress = { series_id: 'series-1', chapter: 5 };
  const stored = offlineStorage.addProgress(progress);
  
  const retrieved = offlineStorage.getProgress(stored.id);
  
  expect(retrieved).toEqual(stored);
});
```

**Purpose**: Verify offline progress can be retrieved  
**Preconditions**: Progress stored in localStorage  
**Expected Result**: Retrieved data matches stored data  

#### Test Case 1.3: Clear Offline Progress

```typescript
it('should clear offline progress after sync', () => {
  const progress = { series_id: 'series-1', chapter: 5 };
  const stored = offlineStorage.addProgress(progress);
  
  offlineStorage.clearProgress(stored.id);
  
  expect(offlineStorage.getProgress(stored.id)).toBeUndefined();
});
```

**Purpose**: Verify offline progress can be cleared  
**Preconditions**: Progress stored in localStorage  
**Expected Result**: Progress removed from storage  

#### Test Case 1.4: Handle Storage Quota Exceeded

```typescript
it('should handle storage quota exceeded', () => {
  // Fill storage to near capacity
  const progress = { series_id: 'series-1', chapter: 5 };
  
  const result = offlineStorage.addProgress(progress);
  
  expect(result.error).toBeDefined();
  expect(result.error).toContain('quota');
});
```

**Purpose**: Verify graceful handling of quota limits  
**Preconditions**: Storage near capacity  
**Expected Result**: Error returned, old data cleaned up  

### Test Suite 2: Connection Detector

**File**: `tests/unit/extension/network/connectionDetector.test.ts`

#### Test Case 2.1: Detect Online State

```typescript
describe('ConnectionDetector', () => {
  it('should detect online state', () => {
    const detector = new ConnectionDetector();
    
    expect(detector.isOnline()).toBe(navigator.onLine);
  });
});
```

**Purpose**: Verify online state detection  
**Preconditions**: Browser online  
**Expected Result**: isOnline() returns true  

#### Test Case 2.2: Detect Offline State

```typescript
it('should detect offline state', () => {
  // Simulate offline
  Object.defineProperty(navigator, 'onLine', { value: false });
  
  const detector = new ConnectionDetector();
  
  expect(detector.isOnline()).toBe(false);
});
```

**Purpose**: Verify offline state detection  
**Preconditions**: Browser offline  
**Expected Result**: isOnline() returns false  

#### Test Case 2.3: Debounce Connection Changes

```typescript
it('should debounce rapid connection changes', (done) => {
  const detector = new ConnectionDetector();
  const callback = jest.fn();
  
  detector.onConnectionChange(callback);
  
  // Simulate rapid changes
  window.dispatchEvent(new Event('online'));
  window.dispatchEvent(new Event('offline'));
  window.dispatchEvent(new Event('online'));
  
  setTimeout(() => {
    // Should only call once due to debouncing
    expect(callback.mock.calls.length).toBeLessThanOrEqual(2);
    done();
  }, 600);
});
```

**Purpose**: Verify debouncing of connection changes  
**Preconditions**: Connection detector with debounce  
**Expected Result**: Rapid changes debounced  

## Integration Tests

### Integration Test Suite 1: Offline→Online Sync

**File**: `tests/integration/offline.integration.test.ts`

#### Test Case 1.1: Sync Offline Data on Reconnection

```typescript
describe('Offline Integration', () => {
  it('should sync offline data when connection restored', async () => {
    // Go offline
    offlineStorage.addProgress({ series_id: 'series-1', chapter: 5 });
    
    // Simulate reconnection
    window.dispatchEvent(new Event('online'));
    
    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify sync completed
    expect(syncQueue.isSyncing()).toBe(false);
    expect(offlineStorage.getAllProgress()).toHaveLength(0);
  });
});
```

**Purpose**: Verify offline data syncs on reconnection  
**Components Involved**: OfflineStorage, ConnectionDetector, SyncQueue  
**Preconditions**: Offline data exists  
**Expected Result**: Data synced and storage cleared  

#### Test Case 1.2: Preserve Data If Sync Fails

```typescript
it('should preserve offline data if sync fails', async () => {
  const progress = { series_id: 'series-1', chapter: 5 };
  offlineStorage.addProgress(progress);
  
  // Mock sync failure
  jest.spyOn(syncQueue, 'sync').mockRejectedValue(new Error('Sync failed'));
  
  window.dispatchEvent(new Event('online'));
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Data should still be in storage
  expect(offlineStorage.getAllProgress()).toHaveLength(1);
});
```

**Purpose**: Verify data preservation on sync failure  
**Components Involved**: OfflineStorage, SyncQueue  
**Preconditions**: Sync fails  
**Expected Result**: Data preserved for retry  

#### Test Case 1.3: Handle Partial Sync Failures

```typescript
it('should handle partial sync failures', async () => {
  offlineStorage.addProgress({ series_id: 'series-1', chapter: 5 });
  offlineStorage.addProgress({ series_id: 'series-2', chapter: 3 });
  
  // Mock partial failure
  jest.spyOn(syncQueue, 'sync').mockResolvedValue({
    successful: 1,
    failed: 1
  });
  
  window.dispatchEvent(new Event('online'));
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Failed entry should remain
  expect(offlineStorage.getAllProgress()).toHaveLength(1);
});
```

**Purpose**: Verify handling of partial sync failures  
**Components Involved**: OfflineStorage, SyncQueue  
**Preconditions**: Multiple offline entries, partial failure  
**Expected Result**: Failed entries retained, successful cleared  

### Integration Test Suite 2: Storage Quota Management

**File**: `tests/integration/storage-quota.integration.test.ts`

#### Test Case 2.1: Clean Up Old Data When Quota Exceeded

```typescript
describe('Storage Quota', () => {
  it('should clean up old data when quota exceeded', () => {
    // Add old data
    const oldProgress = { series_id: 'series-1', chapter: 5, timestamp: Date.now() - 86400000 };
    offlineStorage.addProgress(oldProgress);
    
    // Add new data
    const newProgress = { series_id: 'series-2', chapter: 3, timestamp: Date.now() };
    offlineStorage.addProgress(newProgress);
    
    // Trigger quota check
    offlineStorage.checkQuota();
    
    // Old data should be deleted
    expect(offlineStorage.getAllProgress()).toHaveLength(1);
    expect(offlineStorage.getAllProgress()[0].series_id).toBe('series-2');
  });
});
```

**Purpose**: Verify quota management and cleanup  
**Components Involved**: OfflineStorage  
**Preconditions**: Storage near capacity  
**Expected Result**: Old data deleted, recent data preserved  

## End-to-End Tests

### E2E Test Suite 1: Complete Offline Reading Flow

**File**: `tests/e2e/offline-reading.spec.ts`  
**Tool**: Playwright

#### Test Case 1.1: Read Offline and Sync

```typescript
test('should read offline and sync when reconnected', async ({ page }) => {
  // Open reading page
  await page.goto('http://localhost:3000/read/series-1');
  
  // Go offline
  await page.context().setOffline(true);
  
  // Continue reading
  await page.click('[data-testid="next-chapter"]');
  
  // Verify offline indicator
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  
  // Go online
  await page.context().setOffline(false);
  
  // Verify sync status
  await expect(page.locator('[data-testid="sync-status"]')).toContainText('Synced');
});
```

**Purpose**: Verify complete offline reading and sync flow  
**User Persona**: Mobile reader with unreliable connection  
**Steps**:
1. Open reading page
2. Simulate offline
3. Continue reading
4. Verify offline indicator
5. Simulate reconnection
6. Verify sync completion

**Expected Result**: Offline reading works, sync completes successfully  

## Error Handling Tests

### Error Test Suite 1: Storage Errors

#### Test Case 1.1: Handle localStorage Unavailable

```typescript
it('should handle localStorage unavailable', () => {
  // Disable localStorage
  Storage.prototype.setItem = jest.fn(() => {
    throw new Error('QuotaExceededError');
  });
  
  const result = offlineStorage.addProgress({ series_id: 'series-1', chapter: 5 });
  
  expect(result.error).toBeDefined();
});
```

**Error Type**: Storage unavailable  
**Trigger Condition**: localStorage disabled or quota exceeded  
**Expected Behavior**: Error returned, graceful degradation  
**Error Message**: "Unable to save offline data"  

## Performance Tests

### Performance Test Suite 1: Storage Operations

#### Test Case 1.1: Add Progress Performance

```typescript
it('should add progress in under 100ms', () => {
  const startTime = performance.now();
  
  offlineStorage.addProgress({ series_id: 'series-1', chapter: 5 });
  
  const duration = performance.now() - startTime;
  
  expect(duration).toBeLessThan(100);
});
```

**Metric**: Add operation latency  
**Target**: <100ms  
**Baseline**: TBD after first run  

#### Test Case 1.2: Sync Performance with 100 Entries

```typescript
it('should sync 100 entries in under 5 seconds', async () => {
  // Add 100 offline entries
  for (let i = 0; i < 100; i++) {
    offlineStorage.addProgress({ series_id: `series-${i}`, chapter: i });
  }
  
  const startTime = performance.now();
  
  await syncQueue.sync();
  
  const duration = performance.now() - startTime;
  
  expect(duration).toBeLessThan(5000);
});
```

**Metric**: Sync latency  
**Target**: <5 seconds  
**Baseline**: TBD after first run  

## Test Data

### Test Data Sets

#### Data Set 1: Valid Offline Progress

```json
{
  "series_id": "series-123",
  "chapter": 10,
  "scroll_position": 0.5,
  "timestamp": 1645123456789
}
```

**Usage**: All positive test cases  
**Validity**: Valid, expected to pass  

#### Data Set 2: Multiple Offline Entries

```json
[
  { "series_id": "series-1", "chapter": 5, "timestamp": 1645123456789 },
  { "series_id": "series-2", "chapter": 10, "timestamp": 1645123456790 },
  { "series_id": "series-3", "chapter": 3, "timestamp": 1645123456791 }
]
```

**Usage**: Sync and quota management tests  
**Validity**: Valid multiple entries  

## Test Execution

### Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test -- --testPathPattern=unit

# Run integration tests
npm run test -- --testPathPattern=integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
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

# Test Scenarios

## Overview

**Feature**: Supabase Real-Time Subscriptions for Cross-Device Sync  
**Feature ID**: 4-3  
**Story**: 4-3  
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

### Test Suite 1: Realtime Service

**File**: `tests/unit/services/realtimeService.test.ts`

#### Test Case 1.1: Initialize Realtime Client

```typescript
describe('RealtimeService', () => {
  it('should initialize Supabase Realtime client on startup', () => {
    const service = new RealtimeService(supabaseClient);
    expect(service.isConnected()).toBe(true);
  });
});
```

**Purpose**: Verify Realtime client initializes correctly  
**Preconditions**: Supabase client available  
**Expected Result**: Client connects to Realtime service  

#### Test Case 1.2: Subscribe to Progress Updates

```typescript
it('should subscribe to progress updates for current user', async () => {
  const service = new RealtimeService(supabaseClient);
  const userId = 'user-123';
  
  const subscription = service.subscribeToProgress(userId);
  
  expect(subscription).toBeDefined();
  expect(subscription.isActive()).toBe(true);
});
```

**Purpose**: Verify subscription creation  
**Preconditions**: Realtime service initialized  
**Expected Result**: Active subscription returned  

#### Test Case 1.3: Unsubscribe from Progress Updates

```typescript
it('should unsubscribe from progress updates', async () => {
  const service = new RealtimeService(supabaseClient);
  const subscription = service.subscribeToProgress('user-123');
  
  service.unsubscribe(subscription);
  
  expect(subscription.isActive()).toBe(false);
});
```

**Purpose**: Verify subscription cleanup  
**Preconditions**: Active subscription exists  
**Expected Result**: Subscription becomes inactive  

#### Test Case 1.4: Handle Subscription Errors

```typescript
it('should handle subscription errors gracefully', async () => {
  const service = new RealtimeService(supabaseClient);
  const onError = jest.fn();
  
  service.subscribeToProgress('user-123', { onError });
  // Simulate error
  
  expect(onError).toHaveBeenCalled();
});
```

**Purpose**: Verify error handling in subscriptions  
**Preconditions**: Subscription with error handler  
**Expected Result**: Error handler called on subscription error  

### Test Suite 2: Conflict Resolver

**File**: `tests/unit/services/conflictResolver.test.ts`

#### Test Case 2.1: Resolve Conflict with Last-Write-Wins

```typescript
describe('ConflictResolver', () => {
  it('should resolve conflict by selecting most recent update', () => {
    const update1 = { 
      chapter: 5, 
      updated_at: new Date('2026-02-18T10:00:00Z') 
    };
    const update2 = { 
      chapter: 6, 
      updated_at: new Date('2026-02-18T10:00:01Z') 
    };
    
    const resolved = ConflictResolver.resolve([update1, update2]);
    
    expect(resolved.chapter).toBe(6);
  });
});
```

**Purpose**: Verify last-write-wins conflict resolution  
**Preconditions**: Two conflicting updates with different timestamps  
**Expected Result**: Most recent update selected  

#### Test Case 2.2: Detect Concurrent Updates

```typescript
it('should detect concurrent updates from same user', () => {
  const updates = [
    { device: 'phone', chapter: 5, timestamp: Date.now() },
    { device: 'tablet', chapter: 5, timestamp: Date.now() }
  ];
  
  const conflict = ConflictResolver.detectConflict(updates);
  
  expect(conflict).toBe(true);
});
```

**Purpose**: Verify conflict detection logic  
**Preconditions**: Multiple updates with same timestamp  
**Expected Result**: Conflict detected  

#### Test Case 2.3: Log Conflicts for Analytics

```typescript
it('should log conflicts for analytics', () => {
  const logSpy = jest.spyOn(logger, 'info');
  
  ConflictResolver.resolve([update1, update2]);
  
  expect(logSpy).toHaveBeenCalledWith(
    expect.stringContaining('conflict')
  );
});
```

**Purpose**: Verify conflict logging  
**Preconditions**: Conflicting updates  
**Expected Result**: Conflict logged  

### Test Suite 3: useRealtimeProgress Hook

**File**: `tests/unit/hooks/useRealtimeProgress.test.tsx`

#### Test Case 3.1: Subscribe on Mount

```typescript
describe('useRealtimeProgress', () => {
  it('should subscribe to progress updates on mount', () => {
    const { result } = renderHook(() => useRealtimeProgress('user-123'));
    
    expect(result.current.isSubscribed).toBe(true);
  });
});
```

**Purpose**: Verify hook subscribes on component mount  
**Preconditions**: Hook rendered  
**Expected Result**: Subscription active  

#### Test Case 3.2: Update Local State on Realtime Event

```typescript
it('should update local state when Realtime event received', async () => {
  const { result } = renderHook(() => useRealtimeProgress('user-123'));
  
  // Simulate Realtime event
  act(() => {
    result.current.handleProgressUpdate({
      series_id: 'series-1',
      chapter: 10
    });
  });
  
  expect(result.current.progress.chapter).toBe(10);
});
```

**Purpose**: Verify state updates on Realtime events  
**Preconditions**: Hook with subscription  
**Expected Result**: Local state updated  

#### Test Case 3.3: Cleanup on Unmount

```typescript
it('should unsubscribe on unmount', () => {
  const { unmount } = renderHook(() => useRealtimeProgress('user-123'));
  
  unmount();
  
  expect(mockSubscription.unsubscribe).toHaveBeenCalled();
});
```

**Purpose**: Verify cleanup on component unmount  
**Preconditions**: Hook mounted  
**Expected Result**: Subscription cleaned up  

## Integration Tests

### Integration Test Suite 1: Multi-Device Synchronization

**File**: `tests/integration/realtime.integration.test.ts`

#### Test Case 1.1: Sync Progress Across Two Devices

```typescript
describe('Realtime Integration', () => {
  it('should sync progress from device 1 to device 2', async () => {
    // Setup two subscriptions (simulating two devices)
    const device1 = new RealtimeService(supabaseClient);
    const device2 = new RealtimeService(supabaseClient);
    
    const sub1 = device1.subscribeToProgress('user-123');
    const sub2 = device2.subscribeToProgress('user-123');
    
    // Update on device 1
    await updateProgress('user-123', { chapter: 10 });
    
    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify device 2 received update
    expect(sub2.lastUpdate.chapter).toBe(10);
  });
});
```

**Purpose**: Verify cross-device synchronization  
**Components Involved**: Realtime service, Supabase backend  
**Preconditions**: Two active subscriptions  
**Expected Result**: Update propagates to both devices  

#### Test Case 1.2: Resolve Conflicts in Multi-Device Scenario

```typescript
it('should resolve conflicts when updates occur simultaneously', async () => {
  const device1 = new RealtimeService(supabaseClient);
  const device2 = new RealtimeService(supabaseClient);
  
  const sub1 = device1.subscribeToProgress('user-123');
  const sub2 = device2.subscribeToProgress('user-123');
  
  // Simultaneous updates
  await Promise.all([
    updateProgress('user-123', { chapter: 10 }),
    updateProgress('user-123', { chapter: 11 })
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Both devices should have same final state
  expect(sub1.lastUpdate.chapter).toBe(sub2.lastUpdate.chapter);
});
```

**Purpose**: Verify conflict resolution in concurrent updates  
**Components Involved**: Realtime service, conflict resolver  
**Preconditions**: Two subscriptions with simultaneous updates  
**Expected Result**: Both devices converge to same state  

#### Test Case 1.3: Maintain Consistency During Network Interruption

```typescript
it('should maintain consistency when network reconnects', async () => {
  const service = new RealtimeService(supabaseClient);
  const sub = service.subscribeToProgress('user-123');
  
  // Simulate network interruption
  service.disconnect();
  
  // Update while disconnected
  await updateProgress('user-123', { chapter: 10 });
  
  // Reconnect
  service.reconnect();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Should receive missed update
  expect(sub.lastUpdate.chapter).toBe(10);
});
```

**Purpose**: Verify consistency during network issues  
**Components Involved**: Realtime service, reconnection logic  
**Preconditions**: Subscription with network interruption  
**Expected Result**: Missed updates received after reconnect  

### Integration Test Suite 2: Dashboard Real-Time Updates

**File**: `tests/integration/dashboard-realtime.integration.test.ts`

#### Test Case 2.1: Dashboard Updates Within 1 Second

```typescript
describe('Dashboard Realtime Integration', () => {
  it('should update dashboard within 1 second of progress change', async () => {
    const { getByTestId } = render(<Dashboard userId="user-123" />);
    
    const startTime = Date.now();
    
    // Update progress
    await updateProgress('user-123', { chapter: 10 });
    
    // Wait for update
    await waitFor(() => {
      expect(getByTestId('progress-display')).toHaveTextContent('10');
    }, { timeout: 1000 });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });
});
```

**Purpose**: Verify dashboard update latency  
**Components Involved**: Dashboard component, Realtime service  
**Preconditions**: Dashboard rendered with subscription  
**Expected Result**: UI updates within 1 second  

#### Test Case 2.2: Optimistic Updates in Dashboard

```typescript
it('should show optimistic update immediately', async () => {
  const { getByTestId } = render(<Dashboard userId="user-123" />);
  
  // User updates progress
  fireEvent.click(getByTestId('next-chapter-btn'));
  
  // Should show update immediately (optimistic)
  expect(getByTestId('progress-display')).toHaveTextContent('11');
});
```

**Purpose**: Verify optimistic UI updates  
**Components Involved**: Dashboard, progress update handler  
**Preconditions**: Dashboard with update capability  
**Expected Result**: UI updates before server confirmation  

## End-to-End Tests

### E2E Test Suite 1: Cross-Device Synchronization Flow

**File**: `tests/e2e/realtime.spec.ts`  
**Tool**: Playwright

#### Test Case 1.1: Complete Cross-Device Sync Flow

```typescript
test('should sync reading progress across two browser windows', async ({ browser }) => {
  // Open two browser contexts (simulating two devices)
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  
  // Login on both devices
  await page1.goto('http://localhost:3000/login');
  await page1.fill('[name="email"]', 'user@example.com');
  await page1.fill('[name="password"]', 'password');
  await page1.click('[type="submit"]');
  
  await page2.goto('http://localhost:3000/login');
  await page2.fill('[name="email"]', 'user@example.com');
  await page2.fill('[name="password"]', 'password');
  await page2.click('[type="submit"]');
  
  // Wait for dashboard load
  await page1.waitForSelector('[data-testid="series-card"]');
  await page2.waitForSelector('[data-testid="series-card"]');
  
  // Update progress on device 1
  await page1.click('[data-testid="next-chapter"]');
  
  // Verify update appears on device 2 within 1 second
  const startTime = Date.now();
  await page2.waitForFunction(
    () => document.querySelector('[data-testid="progress"]')?.textContent.includes('10'),
    { timeout: 1000 }
  );
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(1000);
});
```

**Purpose**: Verify complete cross-device sync user flow  
**User Persona**: Multi-device reader  
**Steps**:
1. Login on two devices
2. Navigate to dashboard
3. Update progress on device 1
4. Verify update appears on device 2

**Expected Result**: Update syncs within 1 second  

## Error Handling Tests

### Error Test Suite 1: Subscription Failures

#### Test Case 1.1: Handle Subscription Connection Error

```typescript
it('should handle subscription connection error gracefully', async () => {
  const service = new RealtimeService(mockFailingClient);
  const onError = jest.fn();
  
  try {
    service.subscribeToProgress('user-123', { onError });
  } catch (error) {
    expect(onError).toHaveBeenCalled();
  }
});
```

**Error Type**: Connection error  
**Trigger Condition**: Supabase Realtime service unavailable  
**Expected Behavior**: Error handler called, fallback to polling  
**Error Message**: "Connection lost. Retrying..."  

#### Test Case 1.2: Handle Concurrent Update Conflict

```typescript
it('should recover from concurrent update conflict', async () => {
  const service = new RealtimeService(supabaseClient);
  
  const result = await service.handleConflict([update1, update2]);
  
  expect(result).toBeDefined();
  expect(result.resolved).toBe(true);
});
```

**Error Type**: Conflict error  
**Trigger Condition**: Simultaneous updates from multiple devices  
**Expected Behavior**: Conflict resolved transparently  
**Recovery Strategy**: Last-write-wins resolution  

## Performance Tests

### Performance Test Suite 1: Subscription Latency

#### Test Case 1.1: Measure Update Delivery Latency

```typescript
it('should deliver updates within 500ms', async () => {
  const service = new RealtimeService(supabaseClient);
  const measurements = [];
  
  for (let i = 0; i < 10; i++) {
    const startTime = performance.now();
    
    await updateProgress('user-123', { chapter: i });
    await waitForUpdate(service);
    
    const duration = performance.now() - startTime;
    measurements.push(duration);
  }
  
  const avgDuration = measurements.reduce((a, b) => a + b) / measurements.length;
  expect(avgDuration).toBeLessThan(500);
});
```

**Metric**: Update delivery latency  
**Target**: <500ms  
**Baseline**: TBD after first run  

#### Test Case 1.2: Memory Usage Under Load

```typescript
it('should not leak memory with 100+ concurrent subscriptions', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  const subscriptions = [];
  for (let i = 0; i < 100; i++) {
    const service = new RealtimeService(supabaseClient);
    subscriptions.push(service.subscribeToProgress(`user-${i}`));
  }
  
  // Cleanup
  subscriptions.forEach(sub => sub.unsubscribe());
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
});
```

**Metric**: Memory usage  
**Target**: No significant increase after repeated operations  

## Accessibility Tests

### Accessibility Test Suite 1: Sync Status Indicators

#### Test Case 1.1: Sync Status Has Proper ARIA Labels

```typescript
it('should have proper ARIA labels for sync status', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  
  const syncStatus = page.locator('[data-testid="sync-status"]');
  const ariaLabel = await syncStatus.getAttribute('aria-label');
  
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel).toMatch(/syncing|synced|error/i);
});
```

**Purpose**: Verify screen reader compatibility  
**Standard**: WCAG 2.1 Level AA  

## Test Data

### Test Data Sets

#### Data Set 1: Valid Progress Update

```json
{
  "user_id": "user-123",
  "series_id": "series-456",
  "chapter_number": 10,
  "updated_at": "2026-02-18T10:00:00Z"
}
```

**Usage**: All positive test cases  
**Validity**: Valid, expected to pass  

#### Data Set 2: Conflicting Updates

```json
[
  {
    "user_id": "user-123",
    "series_id": "series-456",
    "chapter_number": 10,
    "updated_at": "2026-02-18T10:00:00Z"
  },
  {
    "user_id": "user-123",
    "series_id": "series-456",
    "chapter_number": 11,
    "updated_at": "2026-02-18T10:00:01Z"
  }
]
```

**Usage**: Conflict resolution tests  
**Validity**: Valid conflict scenario  

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

# Test Scenarios: Automatic Browser Extension Updates

## Overview

**Feature**: Automatic Browser Extension Updates  
**Feature ID**: 5-4  
**Story**: 5-4  
**Last Updated**: 2026-02-19  

This document outlines comprehensive test scenarios for validating automatic update functionality.

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

- **Unit Tests**: 85%+ code coverage (lower due to chrome API mocking complexity)
- **Integration Tests**: 70%+ feature coverage
- **End-to-End Tests**: Critical user flows only

## Unit Tests

### Test Suite 1: updateService

**File**: `tests/unit/extension/updates/updateService.test.ts`

#### Test Case 1.1: Version Comparison

```typescript
describe('updateService', () => {
  it('should correctly identify newer versions', () => {
    const isNewer = compareVersions('1.0.0', '1.0.1');
    expect(isNewer).toBe(true);
  });
});
```

**Purpose**: Verify semantic versioning comparison works correctly  
**Preconditions**: updateService loaded  
**Expected Result**: Correctly identifies newer, older, and equal versions  

#### Test Case 1.2: Update Check with Network Error

```typescript
it('should handle network timeout gracefully', async () => {
  const result = await checkForUpdates({ timeout: 5000 });
  expect(result.error).toBeDefined();
  expect(result.isUpdateAvailable).toBe(false);
});
```

**Purpose**: Verify graceful handling of network failures  
**Preconditions**: Network timeout configured  
**Expected Result**: Returns error, retries on next check  

#### Test Case 1.3: Update Check Caching

```typescript
it('should cache update check result for 24 hours', async () => {
  const result1 = await checkForUpdates();
  const result2 = await checkForUpdates();
  expect(result2.fromCache).toBe(true);
});
```

**Purpose**: Verify update check results are cached  
**Preconditions**: First check completed  
**Expected Result**: Second check within 24h returns cached result  

#### Test Case 1.4: Version Parsing

```typescript
it('should parse version from manifest.json', () => {
  const version = parseVersionFromManifest();
  expect(version).toMatch(/^\d+\.\d+\.\d+$/);
});
```

**Purpose**: Verify version extraction from manifest  
**Preconditions**: Manifest.json accessible  
**Expected Result**: Returns valid semantic version string  

#### Test Case 1.5: Deduplication of Simultaneous Checks

```typescript
it('should deduplicate simultaneous update checks', async () => {
  const results = await Promise.all([
    checkForUpdates(),
    checkForUpdates(),
    checkForUpdates()
  ]);
  expect(results.every(r => r.version === results[0].version)).toBe(true);
});
```

**Purpose**: Verify multiple simultaneous checks don't cause issues  
**Preconditions**: Multiple checks triggered at once  
**Expected Result**: Only one actual check performed, all get same result  

### Test Suite 2: updateNotifier

**File**: `tests/unit/extension/updates/updateNotifier.test.ts`

#### Test Case 2.1: Notification Display

```typescript
describe('updateNotifier', () => {
  it('should display update notification', async () => {
    const notificationId = await notifyUpdateAvailable({
      version: '1.0.1',
      releaseNotes: 'Bug fixes'
    });
    expect(notificationId).toBeDefined();
  });
});
```

**Purpose**: Verify notification is displayed to user  
**Preconditions**: chrome.notifications API mocked  
**Expected Result**: Notification created with correct content  

#### Test Case 2.2: User Dismissal

```typescript
it('should handle user dismissal of notification', async () => {
  const handler = jest.fn();
  onNotificationDismissed(handler);
  simulateNotificationDismissal();
  expect(handler).toHaveBeenCalled();
});
```

**Purpose**: Verify dismissal handler is called  
**Preconditions**: Notification displayed  
**Expected Result**: Handler called when user dismisses  

#### Test Case 2.3: Notification Content

```typescript
it('should include version and release notes in notification', async () => {
  const notificationId = await notifyUpdateAvailable({
    version: '1.0.1',
    releaseNotes: 'Security fixes and performance improvements'
  });
  const notification = getNotificationContent(notificationId);
  expect(notification.message).toContain('1.0.1');
  expect(notification.message).toContain('Security fixes');
});
```

**Purpose**: Verify notification contains useful information  
**Preconditions**: Update info provided  
**Expected Result**: Notification includes version and changes  

#### Test Case 2.4: Non-Blocking Behavior

```typescript
it('should not block user interaction', async () => {
  const startTime = Date.now();
  await notifyUpdateAvailable({ version: '1.0.1' });
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(100);
});
```

**Purpose**: Verify notification doesn't block UI  
**Preconditions**: Notification system ready  
**Expected Result**: Notification displays quickly without blocking  

### Test Suite 3: updateLogger

**File**: `tests/unit/extension/updates/updateLogger.test.ts`

#### Test Case 3.1: Log Entry Creation

```typescript
describe('updateLogger', () => {
  it('should create log entry for update check', async () => {
    await logUpdateCheck('1.0.0', 'success');
    const logs = await getUpdateLogs();
    expect(logs.length).toBeGreaterThan(0);
  });
});
```

**Purpose**: Verify log entries are created  
**Preconditions**: Logger initialized  
**Expected Result**: Log entry stored in chrome.storage.local  

#### Test Case 3.2: Log Retrieval

```typescript
it('should retrieve update logs with correct format', async () => {
  await logUpdateCheck('1.0.0', 'success');
  const logs = await getUpdateLogs();
  expect(logs[0]).toHaveProperty('timestamp');
  expect(logs[0]).toHaveProperty('version');
  expect(logs[0]).toHaveProperty('status');
});
```

**Purpose**: Verify logs can be retrieved with all fields  
**Preconditions**: Log entries exist  
**Expected Result**: Logs returned with timestamp, version, status  

#### Test Case 3.3: 30-Day Retention

```typescript
it('should remove logs older than 30 days', async () => {
  const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
  await logUpdateCheck('1.0.0', 'success', oldDate);
  await cleanupOldLogs();
  const logs = await getUpdateLogs();
  expect(logs.length).toBe(0);
});
```

**Purpose**: Verify old logs are automatically removed  
**Preconditions**: Logs older than 30 days exist  
**Expected Result**: Old logs deleted, recent logs retained  

#### Test Case 3.4: Error Logging

```typescript
it('should log update errors with details', async () => {
  const error = new Error('Network timeout');
  await logUpdateError('1.0.0', error);
  const logs = await getUpdateLogs();
  expect(logs[0].error).toContain('Network timeout');
});
```

**Purpose**: Verify errors are logged with details  
**Preconditions**: Error occurs during update  
**Expected Result**: Error message and stack stored in log  

## Integration Tests

### Integration Test Suite 1: Full Update Flow

**File**: `tests/integration/extension-updates.integration.test.ts`

#### Test Case 1.1: Check → Notify → Install Flow

```typescript
describe('Extension Update Flow', () => {
  it('should complete full update flow', async () => {
    // Check for updates
    const updateAvailable = await checkForUpdates();
    expect(updateAvailable).toBe(true);
    
    // Notify user
    const notificationId = await notifyUpdateAvailable({
      version: '1.0.1'
    });
    expect(notificationId).toBeDefined();
    
    // Install update
    const installResult = await requestUpdateInstallation();
    expect(installResult.success).toBe(true);
  });
});
```

**Purpose**: Verify complete update flow works end-to-end  
**Components Involved**: updateService, updateNotifier, updateInstaller  
**Preconditions**: All services initialized  
**Expected Result**: Update check → notification → installation succeeds  

#### Test Case 1.2: State Preservation During Update

```typescript
it('should preserve extension state during update', async () => {
  const initialState = await getExtensionState();
  await requestUpdateInstallation();
  const finalState = await getExtensionState();
  expect(finalState).toEqual(initialState);
});
```

**Purpose**: Verify user state is preserved  
**Components Involved**: updateInstaller, updateLifecycle  
**Preconditions**: Extension has state to preserve  
**Expected Result**: State identical before and after update  

#### Test Case 1.3: Manual Update Check

```typescript
it('should allow manual update check from settings', async () => {
  const result = await manualUpdateCheck();
  expect(result.checked).toBe(true);
  expect(result.lastCheckTime).toBeDefined();
});
```

**Purpose**: Verify manual check works from settings page  
**Components Involved**: updateService, settings page  
**Preconditions**: Settings page loaded  
**Expected Result**: Manual check completes, time updated  

#### Test Case 1.4: Error Recovery

```typescript
it('should recover from update check failure', async () => {
  simulateNetworkError();
  const result1 = await checkForUpdates();
  expect(result1.error).toBeDefined();
  
  clearNetworkError();
  const result2 = await checkForUpdates();
  expect(result2.error).toBeUndefined();
});
```

**Purpose**: Verify system recovers from errors  
**Components Involved**: updateService, error handling  
**Preconditions**: Network error simulated  
**Expected Result**: First check fails, second succeeds  

#### Test Case 1.5: Update History Display

```typescript
it('should display update history in settings', async () => {
  await logUpdateCheck('1.0.0', 'success');
  await logUpdateCheck('1.0.1', 'success');
  
  const history = await getUpdateHistoryForDisplay();
  expect(history.length).toBe(2);
  expect(history[0].version).toBe('1.0.1');
});
```

**Purpose**: Verify update history displayed correctly  
**Components Involved**: updateLogger, settings page  
**Preconditions**: Multiple updates logged  
**Expected Result**: History shown in reverse chronological order  

## Error Handling Tests

### Error Test Suite 1: Network Errors

#### Test Case 1.1: Timeout Handling

```typescript
it('should handle update check timeout', async () => {
  const result = await checkForUpdates({ timeout: 100 });
  expect(result.error).toContain('timeout');
  expect(result.isUpdateAvailable).toBe(false);
});
```

**Error Type**: Network timeout  
**Trigger Condition**: Network request exceeds timeout  
**Expected Behavior**: Return error, don't crash  
**Error Message**: "Update check failed: timeout"  

#### Test Case 1.2: Connection Failure

```typescript
it('should handle connection failure', async () => {
  simulateNoNetwork();
  const result = await checkForUpdates();
  expect(result.error).toBeDefined();
});
```

**Error Type**: No network connection  
**Trigger Condition**: Network unavailable  
**Expected Behavior**: Graceful error, retry later  
**Recovery Strategy**: Retry on next scheduled check  

### Error Test Suite 2: Installation Errors

#### Test Case 2.1: Installation Failure

```typescript
it('should handle update installation failure', async () => {
  simulateInstallationFailure();
  const result = await requestUpdateInstallation();
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

**Error Type**: Installation failure  
**Trigger Condition**: Chrome API returns error  
**Expected Behavior**: Log error, allow manual retry  
**Error Message**: "Update installation failed"  

## Performance Tests

### Performance Test Suite 1: Update Check Performance

#### Test Case 1.1: Update Check Speed

```typescript
it('should complete update check in under 5 seconds', async () => {
  const startTime = performance.now();
  await checkForUpdates();
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(5000);
});
```

**Metric**: Update check time  
**Target**: < 5 seconds  
**Baseline**: Unknown (first measurement)  

#### Test Case 1.2: Memory Usage

```typescript
it('should not leak memory during repeated checks', async () => {
  const initialMemory = performance.memory.usedJSHeapSize;
  for (let i = 0; i < 100; i++) {
    await checkForUpdates();
  }
  const finalMemory = performance.memory.usedJSHeapSize;
  const increase = finalMemory - initialMemory;
  expect(increase).toBeLessThan(5 * 1024 * 1024); // 5MB
});
```

**Metric**: Memory usage  
**Target**: < 5MB increase after 100 checks  

## Accessibility Tests

### Accessibility Test Suite 1: Settings Page

#### Test Case 1.1: Keyboard Navigation

```typescript
it('should be navigable via keyboard', async ({ page }) => {
  await page.goto('chrome-extension://[id]/popup/settings.html');
  
  // Tab to check button
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="check-button"]')).toBeFocused();
  
  // Tab to history
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="history-list"]')).toBeFocused();
});
```

**Purpose**: Verify keyboard accessibility  
**Standard**: WCAG 2.1 Level AA  

#### Test Case 1.2: Screen Reader Support

```typescript
it('should have proper ARIA labels', async ({ page }) => {
  await page.goto('chrome-extension://[id]/popup/settings.html');
  
  const button = page.locator('[data-testid="check-button"]');
  const ariaLabel = await button.getAttribute('aria-label');
  expect(ariaLabel).toBe('Check for extension updates');
});
```

**Purpose**: Verify screen reader compatibility  
**Standard**: WCAG 2.1 Level AA  

## Test Data

### Data Set 1: Valid Update Data

```json
{
  "currentVersion": "1.0.0",
  "latestVersion": "1.0.1",
  "isUpdateAvailable": true,
  "releaseNotes": "Bug fixes and performance improvements"
}
```

**Usage**: Positive test cases  
**Validity**: Valid, expected to pass  

### Data Set 2: No Update Available

```json
{
  "currentVersion": "1.0.1",
  "latestVersion": "1.0.1",
  "isUpdateAvailable": false
}
```

**Usage**: Test when already on latest version  
**Validity**: Valid, expected to pass  

### Data Set 3: Invalid Version Format

```json
{
  "currentVersion": "invalid",
  "latestVersion": "1.0.1"
}
```

**Usage**: Error handling tests  
**Validity**: Invalid, expected to fail gracefully  

## Test Execution

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=extension/updates

# Run integration tests
npm test -- --testPathPattern=extension-updates.integration

# Run tests with coverage
npm test -- --coverage
```

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-19  
**Next Review**: 2026-03-19

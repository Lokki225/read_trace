# Implementation Tasks - Phase 3: Core Implementation & Testing

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Jest, Chrome Extension APIs

---

## Phase 3: Core Implementation & Testing

### Background Script Core

- [ ] **Implement background service worker**
  - Implement: Message listener initialization
  - Implement: Online/offline event handlers
  - Implement: Queue processing on reconnection
  - Implement: API sync with deduplication
  - Include: Comprehensive error handling
  - Include: Event logging
  - Verify: All handlers work correctly

- [ ] **Implement sync workflow**
  - Implement: Receive update from content script
  - Implement: Validate progress data
  - Implement: Check for duplicates
  - Implement: Queue if offline, sync if online
  - Implement: Handle API responses
  - Verify: Complete workflow works end-to-end

### Unit Tests for Background Script

- [ ] **Create tests/unit/extension/background.test.ts**
  - Test: Background script initialization
  - Test: Message reception and processing
  - Test: API sync within 5 seconds
  - Test: Error handling for API failures
  - Test: Logging of all events
  - Verify: 80%+ code coverage

- [ ] **Create tests/unit/extension/queue/syncQueue.test.ts**
  - Test: Add update to queue
  - Test: Persist queue to localStorage
  - Test: Load queue from localStorage
  - Test: Process all queued updates
  - Test: Handle storage quota exceeded
  - Verify: All queue operations tested

- [ ] **Create tests/unit/extension/queue/deduplicator.test.ts**
  - Test: Detect duplicate updates
  - Test: Keep latest update
  - Test: Handle rapid fire updates
  - Test: Efficient lookup
  - Verify: Deduplication logic tested

### Integration Tests

- [ ] **Create tests/integration/background-offline.integration.test.ts**
  - Test: Queue updates when offline
  - Test: Sync queued updates when reconnected
  - Test: Handle multiple offline/online transitions
  - Test: Preserve queue across extension reloads
  - Verify: Offline scenarios work correctly

- [ ] **Create tests/integration/background-api.integration.test.ts**
  - Test: Successful API sync
  - Test: Handle API errors
  - Test: Retry logic with backoff
  - Test: Handle timeouts
  - Verify: API communication tested

### Mock Setup

- [ ] **Create test mocks for browser APIs**
  - Mock: `chrome.runtime.onMessage`
  - Mock: `chrome.runtime.sendMessage`
  - Mock: `window.addEventListener` for online/offline
  - Mock: `localStorage` for queue persistence
  - Mock: `fetch` for API calls
  - Verify: Mocks work with Jest

- [ ] **Create test data factories**
  - Create: `makeProgressUpdate()` factory
  - Create: `makeQueuedUpdate()` factory
  - Create: `makeSyncResponse()` factory
  - Create: Test data sets for various scenarios
  - Verify: Factories generate valid test data

### Performance Testing

- [ ] **Test sync latency**
  - Measure: Time to sync single update
  - Target: <5 seconds
  - Verify: Meets performance requirement

- [ ] **Test queue processing speed**
  - Measure: Time to process 100 updates
  - Target: <100ms per update
  - Verify: Meets performance requirement

- [ ] **Test memory usage**
  - Measure: Memory after processing 1000 updates
  - Target: <10MB
  - Verify: No memory leaks

---

## Verification Commands

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

# Check coverage report
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

---

## Notes Section

**Implementation Notes**:
- Mock localStorage to avoid quota issues in tests
- Mock fetch to test API error scenarios
- Use fake timers for testing retry backoff
- Test both happy path and error scenarios

**Time Estimates**:
- Phase 3 (Core & Testing): ~4-5 hours

---

## References

- **Jest Testing**: https://jestjs.io/docs/getting-started
- **Mock Functions**: https://jestjs.io/docs/mock-functions
- **Async Testing**: https://jestjs.io/docs/asynchronous

# Implementation Tasks - Phase 3: Platform Adapters & Testing

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Jest, DOM Testing

---

## Phase 3: Platform Adapters & Testing

### MangaDex Adapter Implementation

- [ ] **Implement MangaDex DOM selectors**
  - Define: Series title selector (og:title meta tag)
  - Define: Chapter number selector (URL pattern matching)
  - Define: Chapter container selector (for DOM structure)
  - Include: Fallback selectors for different page layouts
  - Verify: Selectors work on live MangaDex pages

- [ ] **Implement MangaDex data extraction**
  - Implement: `extractSeriesTitle()` with fallbacks
  - Implement: `extractChapterNumber()` with URL parsing
  - Implement: `getScrollPercentage()` for reading progress
  - Include: Error handling for missing elements
  - Verify: Accurate extraction on various MangaDex pages

### Unit Tests for Adapters

- [ ] **Create tests/unit/extension/adapters/mangadex.test.ts**
  - Test: Series title extraction from meta tags
  - Test: Chapter number extraction from URLs
  - Test: Handling of missing data
  - Test: Handling of malformed URLs
  - Test: Edge cases (very long titles, invalid formats)
  - Verify: 80%+ code coverage for adapter

- [ ] **Create tests/unit/extension/content.test.ts**
  - Test: Content script initialization
  - Test: Scroll event debouncing
  - Test: Message sending to background script
  - Test: Error handling and recovery
  - Test: Memory cleanup on unload
  - Verify: 80%+ code coverage for content script

### Unit Tests for Utilities

- [ ] **Create tests/unit/extension/utils.test.ts**
  - Test: `debounce()` function with various delays
  - Test: `getScrollPercentage()` calculation accuracy
  - Test: `validateProgressUpdate()` with valid/invalid data
  - Test: Logging functions
  - Verify: All utility functions tested

### Integration Tests

- [ ] **Create tests/integration/content-script.integration.test.ts**
  - Test: Full reading session simulation
  - Test: Rapid chapter navigation
  - Test: Scroll position tracking accuracy
  - Test: Message delivery to background script
  - Test: Error recovery and retry logic
  - Verify: 70%+ feature coverage

- [ ] **Create tests/integration/adapter-detection.integration.test.ts**
  - Test: Adapter detection for MangaDex URLs
  - Test: Fallback for unsupported sites
  - Test: Multiple adapter registration
  - Verify: Correct adapter selected for each URL

### Mock DOM Setup

- [ ] **Create tests/mocks/mangadex-dom.ts**
  - Create: Mock DOM structure for MangaDex pages
  - Include: Meta tags with series title
  - Include: Chapter container elements
  - Include: Various page layouts
  - Verify: Mocks accurately represent real pages

- [ ] **Create tests/mocks/browser-apis.ts**
  - Mock: `chrome.runtime.sendMessage()`
  - Mock: `chrome.runtime.onMessage`
  - Mock: Window scroll events
  - Mock: MutationObserver
  - Verify: Mocks work with Jest

### Test Data

- [ ] **Create test data sets**
  - Valid MangaDex URLs with chapter numbers
  - Invalid URLs that should fail gracefully
  - Edge case URLs (very long, special characters)
  - Various series titles (long, special characters, unicode)
  - Verify: Test data covers all scenarios

---

## Verification Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=unit

# Run integration tests
npm test -- --testPathPattern=integration

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/unit/extension/adapters/mangadex.test.ts

# Check coverage report
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

---

## Notes Section

**Implementation Notes**:
- Mock DOM should accurately represent real MangaDex structure
- Test data should include edge cases and error scenarios
- Integration tests should simulate real user workflows

**Time Estimates**:
- Phase 3 (Adapters & Testing): ~4-5 hours

---

## References

- **Jest Testing**: https://jestjs.io/docs/getting-started
- **DOM Testing Library**: https://testing-library.com/docs/dom-testing-library/intro/
- **Mock Functions**: https://jestjs.io/docs/mock-functions

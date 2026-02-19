# Implementation Tasks - Phase 2: Core Content Script Implementation

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Chrome Extension APIs, Jest

---

## Phase 2: Core Content Script Implementation

### Content Script Core

- [ ] **Create src/extension/content.ts**
  - Implement: `ContentScript` class as main entry point
  - Implement: `initialize()` method to set up DOM monitoring
  - Implement: `detectSeriesTitle()` method using adapter
  - Implement: `detectChapterNumber()` method using adapter
  - Implement: `handleScroll()` method with debouncing
  - Implement: `sendProgressUpdate(data)` method with message passing
  - Include: Error handling for all operations
  - Include: Logging for debugging
  - Verify: Script initializes without errors on page load

### DOM Monitoring

- [ ] **Implement scroll position tracking**
  - Add: `window.addEventListener('scroll', handleScroll)` with debouncing
  - Add: `MutationObserver` for DOM changes (chapter navigation)
  - Add: Cleanup handlers for page unload
  - Verify: Scroll events properly debounced, no memory leaks

- [ ] **Implement page load detection**
  - Add: `document.addEventListener('DOMContentLoaded', ...)` handler
  - Add: Fallback for already-loaded pages
  - Add: Initial data extraction on load
  - Verify: Works on pages that load before script injection

### Message Passing Interface

- [ ] **Implement chrome.runtime.sendMessage**
  - Implement: Message format with type and payload
  - Implement: Error handling for failed messages
  - Implement: Retry logic with exponential backoff
  - Implement: Message validation before sending
  - Verify: Messages delivered to background script successfully

- [ ] **Implement message listener**
  - Add: `chrome.runtime.onMessage.addListener()` for responses
  - Add: Timeout handling for responses
  - Add: Error logging for failed deliveries
  - Verify: Can receive responses from background script

### Platform Adapter Integration

- [ ] **Integrate adapter registry**
  - Implement: Adapter detection based on current URL
  - Implement: Fallback handling if no adapter found
  - Implement: Error handling for adapter failures
  - Verify: Correct adapter selected for each site

- [ ] **Implement data extraction pipeline**
  - Create: `extractPageData()` method that uses adapter
  - Include: Series title extraction
  - Include: Chapter number extraction
  - Include: Scroll position calculation
  - Include: Timestamp and URL capture
  - Verify: All data extracted accurately

### Error Handling & Logging

- [ ] **Implement comprehensive error handling**
  - Add: Try-catch blocks around DOM operations
  - Add: Graceful fallbacks for missing data
  - Add: Error logging to console
  - Add: Error recovery mechanisms
  - Verify: Script continues running even if operations fail

- [ ] **Implement debug logging**
  - Add: Configurable debug mode
  - Add: Detailed logging of extraction steps
  - Add: Message passing logs
  - Add: Performance timing logs
  - Verify: Logs help with troubleshooting

### Performance Optimization

- [ ] **Optimize DOM queries**
  - Cache: DOM element references where possible
  - Use: Efficient selectors (avoid complex queries)
  - Implement: Query result caching
  - Verify: Selector execution <10ms

- [ ] **Implement memory management**
  - Add: Cleanup for event listeners on unload
  - Add: WeakMap for caches to allow garbage collection
  - Add: Periodic memory checks
  - Verify: No memory leaks over extended sessions

---

## Verification Commands

```bash
# Run unit tests for content script
npm test -- tests/unit/extension/content.test.ts

# Run integration tests
npm test -- tests/integration/content-script.integration.test.ts

# Check for memory leaks
npm run test:memory

# Lint extension code
npm run lint -- src/extension/
```

---

## Notes Section

**Implementation Notes**:
- Content scripts have access to page DOM but not page JavaScript
- Message passing is the only way to communicate with background script
- Debouncing prevents excessive updates during rapid scrolling

**Time Estimates**:
- Phase 2 (Core Implementation): ~4-5 hours

---

## References

- **Content Script Security**: https://developer.chrome.com/docs/extensions/mv3/content_scripts/
- **Message Passing**: https://developer.chrome.com/docs/extensions/mv3/messaging/
- **DOM APIs**: https://developer.mozilla.org/en-US/docs/Web/API/Document

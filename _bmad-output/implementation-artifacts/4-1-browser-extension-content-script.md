# Story 4.1: Browser Extension Content Script for DOM Monitoring

Status: ready-for-dev

## Story

As a developer,
I want to create a content script that monitors the DOM for reading progress,
So that ReadTrace can automatically detect when users are reading.

## Acceptance Criteria

1. **Given** the browser extension is installed
   **When** I navigate to a supported scanlation site (MangaDex)
   **Then** the content script injects and monitors the page

2. **Given** the content script is active on a reading page
   **When** the page loads
   **Then** it detects the series title from page metadata or DOM

3. **Given** the content script is monitoring
   **When** I navigate through chapters
   **Then** it detects the current chapter number accurately

4. **Given** I am reading a chapter
   **When** I scroll through the page
   **Then** it monitors scroll position to track page progress

5. **Given** progress is detected
   **When** reading state changes
   **Then** it sends progress updates to the background script

6. **Given** multiple supported sites exist
   **When** the content script runs
   **Then** it respects site-specific DOM structures for MangaDex and other platforms

## Tasks / Subtasks

- [ ] Task 1: Create extension directory structure and manifest.json (AC: #1)
  - [ ] Create extension/ directory with manifest.json (Manifest V3)
  - [ ] Define content script entry points for supported sites
  - [ ] Configure permissions for DOM access and messaging

- [ ] Task 2: Implement DOM selectors for MangaDex (AC: #2, #3)
  - [ ] Create src/extension/adapters/mangadex.ts with DOM selectors
  - [ ] Extract series title from page metadata
  - [ ] Extract chapter number from page structure
  - [ ] Test selectors against live MangaDex pages

- [ ] Task 3: Create content script core (AC: #1, #4, #5)
  - [ ] Create src/extension/content.ts
  - [ ] Implement DOM observer for scroll position tracking
  - [ ] Implement progress detection logic
  - [ ] Create message passing interface to background script

- [ ] Task 4: Implement platform adapter system (AC: #6)
  - [ ] Create src/extension/adapters/index.ts with adapter registry
  - [ ] Define PlatformAdapter interface
  - [ ] Implement adapter detection based on URL
  - [ ] Create extensible pattern for adding new sites

- [ ] Task 5: Add comprehensive testing (AC: #1-6)
  - [ ] Create tests/unit/extension/content.test.ts
  - [ ] Create tests/unit/extension/adapters/mangadex.test.ts
  - [ ] Mock DOM structures for testing
  - [ ] Test adapter detection and selector accuracy

## Dev Notes

### Architecture Patterns
- **Extension Structure**: Manifest V3 with content script, background script, popup
- **DOM Monitoring**: MutationObserver for dynamic content, scroll event listeners
- **Platform Adapters**: Strategy pattern for site-specific DOM parsing
- **Message Passing**: chrome.runtime.sendMessage for content→background communication

### Source Tree Components
- `extension/manifest.json` - Extension configuration
- `src/extension/content.ts` - Content script entry point
- `src/extension/adapters/` - Platform-specific DOM selectors
- `src/extension/types.ts` - Shared types for extension
- `src/model/schemas/extension.ts` - Domain types for progress data

### Testing Standards
- Unit tests for adapter selectors with mocked DOM
- Integration tests with real site structures (if possible)
- Minimum 80% coverage for content script logic
- Test both happy path and edge cases (missing elements, malformed HTML)

### Project Structure Notes

**Extension Directory Structure:**
```
extension/
  manifest.json          # Manifest V3 configuration
  icons/                 # Extension icons (16, 48, 128px)
  popup.html            # Popup UI
  popup.js              # Popup script
src/
  extension/
    content.ts          # Content script (injected into pages)
    background.ts       # Background service worker
    adapters/
      index.ts          # Adapter registry
      mangadex.ts       # MangaDex-specific selectors
      [other-sites].ts  # Additional platform adapters
    types.ts            # Extension-specific types
    utils.ts            # Shared utilities
```

**Manifest V3 Key Points:**
- `content_scripts` array with `matches` patterns for supported sites
- `background.service_worker` instead of background page
- `host_permissions` for DOM access on supported sites
- `permissions` for messaging and storage

### References

- [Epic 4 Specification: Cross-Platform Reading Progress Tracking](../planning-artifacts/epics.md#epic-4)
- [Architecture: Browser Extension Design](../planning-artifacts/architecture.md#browser-extension)
- [Chrome Extension Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [MangaDex DOM Structure Analysis](../docs/ai-memory/platform-analysis.md)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Debug Log References

### Completion Notes List

### File List

- [ ] extension/manifest.json
- [ ] src/extension/content.ts
- [ ] src/extension/adapters/index.ts
- [ ] src/extension/adapters/mangadex.ts
- [ ] src/extension/types.ts
- [ ] tests/unit/extension/content.test.ts
- [ ] tests/unit/extension/adapters/mangadex.test.ts

### Change Log

[To be updated during implementation]

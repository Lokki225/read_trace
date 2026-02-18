# Story 4.4: Platform Adapter Architecture for MangaDex & Additional Sites

Status: ready-for-dev

## Story

As a developer,
I want to create a flexible platform adapter system,
So that ReadTrace can support multiple scanlation sites.

## Acceptance Criteria

1. **Given** the extension needs to support multiple sites
   **When** I implement platform adapters
   **Then** each adapter defines site-specific DOM selectors

2. **Given** different sites have different HTML structures
   **When** adapters are used
   **Then** adapters handle different HTML structures

3. **Given** adapters are implemented
   **When** the content script runs
   **Then** adapters provide series title, chapter, and page detection

4. **Given** a new platform needs support
   **When** a developer creates a new adapter
   **Then** new platforms can be added by creating new adapters

5. **Given** multiple adapters exist
   **When** they are tested
   **Then** adapters are tested against real site structures

6. **Given** MangaDex and one additional platform are needed
   **When** adapters are implemented
   **Then** MangaDex and one additional platform are fully supported

## Tasks / Subtasks

- [ ] Task 1: Create adapter interface and registry (AC: #1, #3)
  - [ ] Create src/extension/adapters/types.ts with PlatformAdapter interface
  - [ ] Define adapter contract: detectSeries, detectChapter, detectProgress
  - [ ] Create src/extension/adapters/index.ts with adapter registry
  - [ ] Implement adapter detection based on URL pattern

- [ ] Task 2: Implement MangaDex adapter (AC: #1, #2, #3)
  - [ ] Create src/extension/adapters/mangadex.ts
  - [ ] Extract series title from meta tags or page structure
  - [ ] Extract chapter number from URL or page content
  - [ ] Implement scroll position tracking for page progress
  - [ ] Test against live MangaDex pages

- [ ] Task 3: Implement second platform adapter (AC: #1, #2, #3, #6)
  - [ ] Choose second platform (e.g., Webtoon, Tapas, or custom)
  - [ ] Create src/extension/adapters/[platform].ts
  - [ ] Implement platform-specific DOM selectors
  - [ ] Test against live site pages
  - [ ] Document platform-specific quirks

- [ ] Task 4: Create adapter testing framework (AC: #5)
  - [ ] Create tests/unit/extension/adapters/adapter.test.ts
  - [ ] Create mock DOM structures for each platform
  - [ ] Implement selector validation tests
  - [ ] Create integration tests with real site snapshots

- [ ] Task 5: Add extensibility documentation (AC: #4)
  - [ ] Create docs/ADAPTER_DEVELOPMENT.md
  - [ ] Document adapter interface and requirements
  - [ ] Provide step-by-step guide for adding new platforms
  - [ ] Include examples and common patterns

## Dev Notes

### Architecture Patterns
- **Strategy Pattern**: Each adapter implements PlatformAdapter interface
- **Registry Pattern**: Central adapter registry with URL-based detection
- **Selector-Based**: DOM selectors for extracting reading data
- **Extensible Design**: Easy to add new platforms without modifying core
- **Error Handling**: Graceful fallback for unsupported sites

### Source Tree Components
- `src/extension/adapters/types.ts` - Adapter interface definition
- `src/extension/adapters/index.ts` - Adapter registry and detection
- `src/extension/adapters/mangadex.ts` - MangaDex implementation
- `src/extension/adapters/[platform].ts` - Additional platform adapters
- `tests/unit/extension/adapters/` - Adapter tests
- `docs/ADAPTER_DEVELOPMENT.md` - Developer guide

### Testing Standards
- Unit tests for each adapter's selector accuracy
- Mock DOM structures matching real site HTML
- Integration tests with real site snapshots (if available)
- Test edge cases: missing elements, malformed HTML, dynamic content
- Minimum 85% coverage for adapter logic

### Project Structure Notes

**Adapter Interface:**
```typescript
interface PlatformAdapter {
  name: string;
  urlPattern: RegExp;
  detectSeries(): Promise<SeriesInfo>;
  detectChapter(): Promise<ChapterInfo>;
  detectProgress(): Promise<ProgressInfo>;
  validatePage(): boolean;
}
```

**Adapter Registry Pattern:**
```typescript
const adapters = [
  new MangaDexAdapter(),
  new [PlatformName]Adapter(),
];

function detectAdapter(url: string): PlatformAdapter | null {
  return adapters.find(a => a.urlPattern.test(url)) || null;
}
```

**Platform-Specific Considerations:**
- MangaDex: Uses meta tags for series info, URL for chapter
- Webtoon: Dynamic content, requires MutationObserver
- Tapas: Different DOM structure, custom selectors
- Document quirks and workarounds for each platform

### References

- [Epic 4 Specification: Cross-Platform Reading Progress Tracking](../planning-artifacts/epics.md#epic-4)
- [Architecture: Platform Adapter System](../planning-artifacts/architecture.md#platform-adapters)
- [MangaDex DOM Analysis](../docs/ai-memory/platform-analysis.md#mangadex)
- [Adapter Development Guide](../docs/ADAPTER_DEVELOPMENT.md)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Debug Log References

### Completion Notes List

### File List

- [ ] src/extension/adapters/types.ts
- [ ] src/extension/adapters/index.ts
- [ ] src/extension/adapters/mangadex.ts
- [ ] src/extension/adapters/[platform].ts
- [ ] tests/unit/extension/adapters/adapter.test.ts
- [ ] tests/unit/extension/adapters/mangadex.test.ts
- [ ] tests/unit/extension/adapters/[platform].test.ts
- [ ] docs/ADAPTER_DEVELOPMENT.md

### Change Log

[To be updated during implementation]

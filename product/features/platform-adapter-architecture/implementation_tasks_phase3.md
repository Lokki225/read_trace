# Implementation Tasks Phase 3: Secondary Platform Adapter

> **Purpose**: Implement adapter for second platform (Webtoon, Tapas, or other).
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Jest, DOM APIs

---

## Phase 3: Secondary Platform Adapter Implementation

### Platform Selection

- [ ] **Select secondary platform** - Choose platform to support
  - Decision: Choose between Webtoon, Tapas, or other platform
  - Criteria: User demand, HTML stability, selector accessibility
  - Document: Rationale for platform choice
  - Verify: Platform has stable, accessible HTML structure

### Secondary Platform Adapter Development

- [ ] **Create secondary platform adapter class** - Platform-specific implementation
  - Create: `src/extension/adapters/[platform].ts`
  - Include: Class extending or implementing PlatformAdapter
  - Include: `name = "[Platform Name]"`
  - Include: `urlPattern = /[platform-domain]/`
  - Include: All required methods: detectSeries, detectChapter, detectProgress, validatePage
  - Verify: Follows adapter interface contract
  - Verify: TypeScript strict mode compliance

- [ ] **Implement series detection** - Extract series information
  - In: `src/extension/adapters/[platform].ts`
  - Include: `detectSeries()` method
  - Include: Extract title using platform-specific selectors
  - Include: Extract series URL
  - Include: Handle platform-specific HTML structure
  - Include: Return SeriesInfo object
  - Include: Handle missing elements gracefully
  - Verify: Works with real platform pages

- [ ] **Implement chapter detection** - Extract chapter information
  - In: `src/extension/adapters/[platform].ts`
  - Include: `detectChapter()` method
  - Include: Extract chapter number using platform-specific selectors
  - Include: Extract chapter URL
  - Include: Handle various chapter number formats
  - Include: Return ChapterInfo object
  - Verify: Works with real platform pages

- [ ] **Implement progress detection** - Track reading progress
  - In: `src/extension/adapters/[platform].ts`
  - Include: `detectProgress()` method
  - Include: Extract current page using platform-specific selectors
  - Include: Extract total pages
  - Include: Handle dynamic content if needed
  - Include: Return ProgressInfo object
  - Verify: Works with real platform pages

- [ ] **Implement page validation** - Verify readable pages
  - In: `src/extension/adapters/[platform].ts`
  - Include: `validatePage()` method
  - Include: Check if page is a readable page
  - Include: Verify required elements exist
  - Include: Return boolean
  - Verify: Correctly identifies reading vs non-reading pages

### Register Secondary Adapter

- [ ] **Register adapter in registry** - Add to adapter list
  - In: `src/extension/adapters/index.ts`
  - Include: Import secondary platform adapter
  - Include: Add to adapters array
  - Include: Verify URL pattern doesn't conflict with MangaDex
  - Verify: Adapter is properly registered

### Secondary Platform Documentation

- [ ] **Document platform selectors** - Selector reference
  - In: `docs/ADAPTER_DEVELOPMENT.md`
  - Include: Section for secondary platform
  - Include: List of CSS selectors used
  - Include: Rationale for each selector choice
  - Include: Known quirks and workarounds
  - Include: Links to platform documentation
  - Verify: Selectors are stable and well-documented

### Secondary Platform Testing

- [ ] **Create unit tests** - Selector accuracy
  - Create: `tests/unit/extension/adapters/[platform].test.ts`
  - Include: Test series detection with mock DOM
  - Include: Test chapter detection with mock DOM
  - Include: Test progress detection with mock DOM
  - Include: Test page validation
  - Include: Test error handling (missing elements)
  - Verify: All tests pass
  - Verify: Coverage ≥85% for adapter logic

- [ ] **Create real site snapshot tests** - Integration testing
  - Create: `tests/integration/adapters/[platform].integration.test.ts`
  - Include: Load real platform page HTML snapshot
  - Include: Test data extraction from real page
  - Include: Verify extracted data is correct
  - Include: Test multiple page types
  - Verify: Tests pass with real site HTML

- [ ] **Create test fixtures** - Real page snapshots
  - Create: `tests/fixtures/[platform]-title-page.html`
  - Create: `tests/fixtures/[platform]-chapter-page.html`
  - Include: Real HTML from platform pages
  - Include: Minimal HTML (remove scripts, styles for size)
  - Verify: Fixtures are realistic and maintainable

- [ ] **Test adapter registry detection** - URL pattern matching
  - In: `tests/unit/extension/adapters/adapter.test.ts`
  - Include: Test detectAdapter() returns secondary platform adapter for platform URLs
  - Include: Test URL pattern matching works correctly
  - Verify: Registry correctly detects secondary platform

---

## Verification Commands

```bash
# Run secondary platform adapter tests
npm test -- --testPathPattern=\[platform\]

# Run with coverage
npm test -- --coverage --testPathPattern=\[platform\]

# Run integration tests
npm test -- --testPathPattern=integration/adapters/\[platform\]

# Run all adapter tests
npm test -- --testPathPattern=adapters

# Build project
npm run build
```

---

## Notes Section

**Implementation Notes**:
- Document platform-specific quirks and workarounds
- Test selectors against multiple pages to verify stability
- Consider dynamic content loading if applicable
- Handle edge cases (missing elements, malformed HTML)

**Selector Stability**:
- Use stable selectors (IDs, data attributes) when available
- Avoid nth-child and complex paths
- Test selectors against multiple pages
- Document rationale for selector choices

**Time Estimates**:
- Platform selection: ~1 hour
- Series detection: ~3 hours
- Chapter detection: ~2 hours
- Progress detection: ~3 hours
- Page validation: ~1 hour
- Registry integration: ~1 hour
- Unit tests: ~4 hours
- Integration tests: ~3 hours
- Documentation: ~2 hours
- **Phase 3 Total**: ~20 hours

---

## References

- **Adapter Interface**: `src/extension/adapters/types.ts`
- **Adapter Registry**: `src/extension/adapters/index.ts`
- **MangaDex Adapter**: `src/extension/adapters/mangadex.ts`
- **Test Scenarios**: `product/features/platform-adapter-architecture/test-scenarios.md`
- **Risks**: `product/features/platform-adapter-architecture/risks.md`

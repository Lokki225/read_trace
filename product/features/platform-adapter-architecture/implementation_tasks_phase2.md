# Implementation Tasks Phase 2: MangaDex Adapter Implementation

> **Purpose**: Implement MangaDex adapter with full DOM selector extraction.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Jest, DOM APIs

---

## Phase 2: MangaDex Adapter Implementation

### MangaDex Adapter Development

- [ ] **Create MangaDex adapter class** - Platform-specific implementation
  - Create: `src/extension/adapters/mangadex.ts`
  - Include: Class extending or implementing PlatformAdapter
  - Include: `name = "MangaDex"`
  - Include: `urlPattern = /mangadex\.org/`
  - Include: All required methods: detectSeries, detectChapter, detectProgress, validatePage
  - Verify: Follows adapter interface contract
  - Verify: TypeScript strict mode compliance

- [ ] **Implement series detection** - Extract series information
  - In: `src/extension/adapters/mangadex.ts`
  - Include: `detectSeries()` method
  - Include: Extract title from meta tags or page structure
  - Include: Extract series URL
  - Include: Return SeriesInfo object
  - Include: Handle missing elements gracefully (return null for missing fields)
  - Verify: Works with real MangaDex pages

- [ ] **Implement chapter detection** - Extract chapter information
  - In: `src/extension/adapters/mangadex.ts`
  - Include: `detectChapter()` method
  - Include: Extract chapter number from URL or page content
  - Include: Extract chapter URL
  - Include: Handle various chapter number formats
  - Include: Return ChapterInfo object
  - Verify: Works with real MangaDex pages

- [ ] **Implement progress detection** - Track reading progress
  - In: `src/extension/adapters/mangadex.ts`
  - Include: `detectProgress()` method
  - Include: Extract current page from page indicators
  - Include: Extract total pages from page counter
  - Include: Calculate scroll percentage if available
  - Include: Return ProgressInfo object
  - Verify: Handles various page indicator formats

- [ ] **Implement page validation** - Verify readable pages
  - In: `src/extension/adapters/mangadex.ts`
  - Include: `validatePage()` method
  - Include: Check if page is a readable manga page
  - Include: Verify required elements exist
  - Include: Return boolean
  - Verify: Correctly identifies reading vs non-reading pages

### MangaDex Selector Documentation

- [ ] **Document MangaDex selectors** - Selector reference
  - Create: `docs/ADAPTER_DEVELOPMENT.md` section for MangaDex
  - Include: List of CSS selectors used
  - Include: Rationale for each selector choice
  - Include: Known quirks and workarounds
  - Include: Links to MangaDex page structure documentation
  - Verify: Selectors are stable and well-documented

### MangaDex Testing

- [ ] **Create MangaDex unit tests** - Selector accuracy
  - Create: `tests/unit/extension/adapters/mangadex.test.ts`
  - Include: Test series detection with mock DOM
  - Include: Test chapter detection with mock DOM
  - Include: Test progress detection with mock DOM
  - Include: Test page validation
  - Include: Test error handling (missing elements)
  - Verify: All tests pass
  - Verify: Coverage ≥85% for adapter logic

- [ ] **Create real site snapshot tests** - Integration testing
  - Create: `tests/integration/adapters/mangadex.integration.test.ts`
  - Include: Load real MangaDex page HTML snapshot
  - Include: Test data extraction from real page
  - Include: Verify extracted data is correct
  - Include: Test multiple page types (title page, chapter page, etc.)
  - Verify: Tests pass with real site HTML

- [ ] **Create test fixtures** - Real page snapshots
  - Create: `tests/fixtures/mangadex-title-page.html`
  - Create: `tests/fixtures/mangadex-chapter-page.html`
  - Include: Real HTML from MangaDex pages
  - Include: Minimal HTML (remove scripts, styles for size)
  - Verify: Fixtures are realistic and maintainable

---

## Verification Commands

```bash
# Run MangaDex adapter tests
npm test -- --testPathPattern=mangadex

# Run with coverage
npm test -- --coverage --testPathPattern=mangadex

# Run integration tests
npm test -- --testPathPattern=integration/adapters/mangadex

# Build project
npm run build
```

---

## Notes Section

**Implementation Notes**:
- MangaDex uses meta tags for series info (og:title, og:url)
- Chapter number can be extracted from URL or page content
- Page indicators are typically in footer or header
- Consider MutationObserver for dynamically loaded content

**Selector Stability**:
- Use stable selectors (IDs, data attributes) when available
- Avoid nth-child and complex paths
- Test selectors against multiple pages to verify stability

**Time Estimates**:
- Series detection: ~3 hours
- Chapter detection: ~2 hours
- Progress detection: ~3 hours
- Page validation: ~1 hour
- Unit tests: ~4 hours
- Integration tests: ~3 hours
- Documentation: ~2 hours
- **Phase 2 Total**: ~18 hours

---

## References

- **Adapter Interface**: `src/extension/adapters/types.ts`
- **Adapter Registry**: `src/extension/adapters/index.ts`
- **Test Scenarios**: `product/features/platform-adapter-architecture/test-scenarios.md`
- **Risks**: `product/features/platform-adapter-architecture/risks.md`

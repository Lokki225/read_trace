# Implementation Tasks - Phase 2: Database & Backend Integration

**Story**: 5-1 - Resume Button on Series Cards  
**Phase**: 2 - Database & Backend Integration  
**Depends On**: Phase 1 Complete  

## Phase 2: Database & Backend Integration

### Task 1: Apply Database Migration

- [ ] Run migration: `supabase db push`
- [ ] Verify column added to user_series table
- [ ] Verify index created for query performance
- [ ] Test migration rollback: `supabase db reset` (on dev environment only)
- [ ] Confirm data integrity after migration

### Task 2: Implement Resume URL Construction Logic

- [ ] Implement `buildResumeUrl()` in `src/lib/resume.ts`:
  - Accept ResumeUrlData parameter
  - Determine platform from data
  - Call appropriate platform-specific constructor
  - Validate constructed URL
  - Return URL or null if invalid

- [ ] Implement `validateResumeUrl()`:
  - Check URL format (must be valid URL)
  - Check domain is whitelisted (mangadex.org, webtoons.com, etc.)
  - Return boolean

- [ ] Implement `constructMangaDexUrl()`:
  - Format: `https://mangadex.org/chapter/{chapterId}?page={pageNumber}`
  - Handle missing pageNumber (optional parameter)
  - Return constructed URL

- [ ] Implement `constructWebtoonUrl()`:
  - Format: `https://www.webtoons.com/en/{series}/{episode}?episode_no={episodeNumber}`
  - Handle missing pageNumber
  - Return constructed URL

### Task 3: Test Resume URL Construction

- [ ] Create unit tests in `tests/unit/resume.test.ts`:
  - Test buildResumeUrl with valid data
  - Test buildResumeUrl with missing data
  - Test validateResumeUrl with valid URLs
  - Test validateResumeUrl with invalid URLs
  - Test constructMangaDexUrl
  - Test constructWebtoonUrl
  - Test URL encoding for special characters
  - Test error handling

- [ ] Run tests: `npm test -- tests/unit/resume.test.ts`
- [ ] Verify 100% code coverage for resume.ts

### Task 4: Update Series Query Service

- [ ] Verify seriesQueryService.ts includes resume_url in SELECT
- [ ] Test query returns resume_url field
- [ ] Verify type safety (no type errors)
- [ ] Test with actual database data

### Task 5: Create Integration Tests

- [ ] Create `tests/integration/resume-url-construction.integration.test.ts`:
  - Test URL construction with real series data
  - Test database query returns resume_url
  - Test data flow from database to component

- [ ] Run integration tests: `npm test -- tests/integration/resume-url-construction.integration.test.ts`
- [ ] Verify tests pass

### Task 6: Verify Data Layer

- [ ] Run full test suite: `npm test`
- [ ] Verify no regressions in existing tests
- [ ] Check test coverage (target: 90%+)
- [ ] Verify TypeScript compilation: `npm run build`

## Verification Commands

```bash
# Apply migration
supabase db push

# Run resume utility tests
npm test -- tests/unit/resume.test.ts

# Run integration tests
npm test -- tests/integration/resume-url-construction.integration.test.ts

# Run full test suite
npm test

# Check coverage
npm test -- --coverage

# Build project
npm run build
```

## Quality Gates

- [ ] All unit tests passing (resume.test.ts)
- [ ] All integration tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code coverage ≥90%
- [ ] No regressions in existing tests

## Notes

- Database migration must succeed before proceeding
- URL construction must be thoroughly tested
- All error cases must be handled gracefully
- Type safety is critical (no `any` types)

---

**Status**: READY FOR PHASE 3  
**Estimated Duration**: 3-4 hours  
**Last Updated**: 2026-02-19

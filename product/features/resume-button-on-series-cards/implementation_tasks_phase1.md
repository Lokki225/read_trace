# Implementation Tasks - Phase 1: Architecture & Setup

**Story**: 5-1 - Resume Button on Series Cards  
**Phase**: 1 - Architecture & Setup  
**Status**: Ready for Development  

## Pre-Implementation Checklist

- [ ] Read spec.md - Understand feature requirements
- [ ] Read acceptance-criteria.md - Understand success criteria
- [ ] Read test-scenarios.md - Understand testing requirements
- [ ] Read risks.md - Understand potential issues
- [ ] Check FEATURE_STATUS.json - Verify feature is SPECIFIED state
- [ ] Review Story 3.2 (Series Card Component) for patterns
- [ ] Review Story 3.1 (Dashboard Layout) for data flow

## Phase 1: Architecture & Setup

### Task 1: Create Feature Directory Structure

- [ ] Verify `product/features/resume-button-on-series-cards/` exists
- [ ] Confirm all documentation files present (acceptance-criteria.md, test-scenarios.md, spec.md, risks.md)

### Task 2: Create TypeScript Type Definitions

- [ ] Create `src/types/resume.ts` with:
  - `ResumeButtonProps` interface (seriesId, seriesTitle, resumeUrl, onNavigate)
  - `ResumeUrlData` interface (platform, seriesId, chapterNumber, pageNumber)
  - `ResumeNavigationResult` interface (success, url, error)

### Task 3: Create Utility Library Structure

- [ ] Create `src/lib/resume.ts` with function stubs:
  - `buildResumeUrl(data: ResumeUrlData): string | null`
  - `validateResumeUrl(url: string): boolean`
  - `constructMangaDexUrl(seriesId: string, chapterNumber: number, pageNumber?: number): string`
  - `constructWebtoonUrl(seriesId: string, episodeNumber: number, pageNumber?: number): string`

### Task 4: Update Database Schema

- [ ] Create `database/migrations/012_add_resume_url_to_user_series.sql`:
  - Add `resume_url VARCHAR(2048) NULL` column to user_series table
  - Add index on resume_url for query performance
  - Include migration rollback instructions

### Task 5: Update TypeScript Models

- [ ] Update `src/model/schemas/dashboard.ts`:
  - Add `resume_url: string | null` to UserSeries interface
  - Add JSDoc comments explaining field purpose

- [ ] Update `src/lib/supabase.ts`:
  - Add resume_url to user_series Row type
  - Add resume_url to user_series Insert type
  - Add resume_url to user_series Update type

### Task 6: Update Data Layer

- [ ] Update `src/backend/services/dashboard/seriesQueryService.ts`:
  - Modify SELECT statement to include resume_url
  - Add type safety for new field
  - Test query returns correct data

### Task 7: Create Component Structure

- [ ] Create `src/components/dashboard/ResumeButton.tsx` (stub):
  - Export ResumeButton component (memo'd)
  - Accept ResumeButtonProps
  - Placeholder JSX

- [ ] Create test file `tests/unit/ResumeButton.test.tsx` (stub):
  - Test suite structure
  - Mock setup

## Verification Commands

```bash
# Verify TypeScript compilation
npm run build

# Verify types
npx tsc --noEmit

# Verify database migration syntax
cat database/migrations/012_add_resume_url_to_user_series.sql

# Run linter
npm run lint
```

## Task Dependencies

- ✅ All pre-implementation checks must pass before proceeding to Phase 2
- ✅ Database migration must be created before seriesQueryService update
- ✅ TypeScript types must be defined before component creation
- ✅ Data layer must be updated before component integration

## Notes

- Follow existing SeriesCard patterns (React.memo, prop-based)
- Use TypeScript strict mode
- Maintain consistency with Story 3.2 implementation
- All new code must be type-safe (no `any` types)

---

**Status**: READY FOR PHASE 2  
**Estimated Duration**: 2-3 hours  
**Last Updated**: 2026-02-19

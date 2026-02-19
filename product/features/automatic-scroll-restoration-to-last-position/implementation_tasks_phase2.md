# Implementation Tasks: Phase 2 - Database & Backend Integration

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 2: Database & Backend Integration

### Supabase Database Schema

- [ ] **Create migration file for scroll_position**
  - Create: `database/migrations/014_add_scroll_position_to_reading_progress.sql`
  - Add: `scroll_position INTEGER DEFAULT 0` column to reading_progress table
  - Add: Index on (user_id, series_id, chapter_id) for efficient queries
  - Verify: Migration uses IF NOT EXISTS for idempotency
  - Verify: Includes proper comments explaining the column

- [ ] **Verify RLS policies**
  - File: `database/migrations/008_create_reading_progress.sql`
  - Verify: Existing RLS policies allow UPDATE on scroll_position
  - Verify: Users can only update their own reading_progress records

### API Integration

- [ ] **Update reading_progress queries**
  - File: `src/backend/services/dashboard/seriesQueryService.ts` (or similar)
  - Add: Include `scroll_position` in SELECT queries
  - Verify: Queries fetch scroll_position when fetching reading_progress

- [ ] **Create scroll position update service**
  - Create: `src/backend/services/reading/scrollPositionService.ts`
  - Implement: `updateScrollPosition(userId, seriesId, chapterId, position): Promise<void>`
  - Implement: Error handling for invalid positions
  - Verify: Uses Supabase client with proper authentication

### Testing Database Integration

- [ ] **Test migration**
  - Command: `supabase db push`
  - Verify: Migration applies without errors
  - Verify: scroll_position column exists on reading_progress table

- [ ] **Test RLS policies**
  - Verify: Users can read their own scroll_position
  - Verify: Users can update their own scroll_position
  - Verify: Users cannot access other users' scroll_position

---

## Verification Checklist

- [ ] Database migration created and tested
- [ ] scroll_position column added to reading_progress
- [ ] Supabase types updated in `src/lib/supabase.ts`
- [ ] RLS policies verified for scroll_position access
- [ ] API service created for updating scroll position
- [ ] No breaking changes to existing queries

---

## Notes

- Scroll position stored as INTEGER (pixels)
- Default value is 0 (top of page)
- Index on (user_id, series_id, chapter_id) for fast lookups
- RLS policies inherited from reading_progress table

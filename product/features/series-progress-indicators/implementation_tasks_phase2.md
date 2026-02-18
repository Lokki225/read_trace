# Implementation Tasks: Series Progress Indicators - Phase 2

## Phase 2: Database & Backend Integration

### Supabase Database Schema
- [ ] **Verify existing migration** - Ensure `reading_progress` table exists
  - File: `database/migrations/008_create_reading_progress.sql`
  - Verify: Includes `current_chapter`, `total_chapters`, `last_read_at`
  
- [ ] **Enable Realtime** - Enable Realtime for the `reading_progress` table
  - Command: `supabase db push` (if migration needed)
  - Verify: Realtime is active for the table

### API Integration
- [ ] **Implement Realtime Subscription** - Update store to listen for changes
  - File: `src/store/seriesStore.ts`
  - Verify: Subscription filters by current user ID
  - Verify: Correctly updates local state on `INSERT` and `UPDATE` events

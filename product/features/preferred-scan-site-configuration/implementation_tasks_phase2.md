# Implementation Tasks: Preferred Scan Site Configuration - Phase 2

## Phase 2: Database & Backend Integration

### Supabase Database Schema
- [ ] **Create migration file** - Add preferences columns
  - Create: `database/migrations/011_add_preferred_sites.sql`
  - Verify: Adds `preferred_sites` (TEXT[]) and `preferred_sites_updated_at` (TIMESTAMP)
  
- [ ] **Define Row Level Security (RLS)** - Access control
  - Verify: Only users can read/write their own preferences

### API Integration
- [ ] **Create API endpoint** - Save preferences
  - Create: `src/app/api/user/preferences/sites/route.ts`
  - Verify: POST endpoint accepts `{ preferred_sites: string[] }`
  - Verify: Returns updated user profile
  
- [ ] **Update Supabase types** - Type safety
  - File: `src/lib/supabase.ts`
  - Verify: Includes `preferred_sites` field

# Implementation Tasks - Phase 2: Database & Backend Integration

> **Purpose**: Database schema, migrations, and backend service implementation.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 2: Database & Backend Integration

### Supabase Database Schema

- [ ] **Create migration file** - Database structure
  - Create: `database/migrations/012_realtime_setup.sql` 
  - Naming: Use timestamp + descriptive name
  - Verify: Includes tables, indexes, RLS policies
  
- [ ] **Define database triggers** - Update broadcasting
  - Include: Trigger on reading_progress INSERT
  - Include: Trigger on reading_progress UPDATE
  - Include: Trigger on reading_progress DELETE
  - Verify: Triggers update updated_at timestamp
  - Verify: Triggers broadcast via Realtime
  
- [ ] **Define Row Level Security (RLS)** - Access control
  - Include: SELECT policy - users can only see their own progress
  - Include: INSERT policy - users can only insert their own progress
  - Include: UPDATE policy - users can only update their own progress
  - Include: DELETE policy - users can only delete their own progress
  - Verify: Policies enforce authentication and authorization
  
- [ ] **Create database indexes** - Performance optimization
  - Include: Index on (user_id, series_id) for fast lookups
  - Include: Index on updated_at for sorting
  - Include: Index on user_id for filtering
  - Verify: No over-indexing

### Realtime Service Implementation

- [ ] **Create RealtimeService class** - Subscription management
  - Create: `src/backend/services/realtime/realtimeService.ts` 
  - Implement: Constructor with Supabase client
  - Implement: subscribeToProgress(userId) method
  - Implement: unsubscribe(subscription) method
  - Implement: handleProgressUpdate(payload) method
  - Implement: Error handling and reconnection logic
  - Verify: Type-safe with TypeScript
  
- [ ] **Implement subscription lifecycle** - Connection management
  - Implement: Connection establishment
  - Implement: Subscription creation with filters
  - Implement: Event listener registration
  - Implement: Cleanup on unsubscribe
  - Verify: No memory leaks
  
- [ ] **Implement error handling** - Graceful degradation
  - Implement: Connection error handling
  - Implement: Subscription error handling
  - Implement: Automatic reconnection with exponential backoff
  - Implement: Fallback to polling if Realtime unavailable
  - Verify: Errors logged for debugging

### Conflict Resolver Implementation

- [ ] **Create ConflictResolver class** - Conflict handling
  - Create: `src/backend/services/realtime/conflictResolver.ts` 
  - Implement: detectConflict(updates) method
  - Implement: resolve(updates) method
  - Implement: Last-write-wins strategy based on updated_at
  - Verify: Type-safe with TypeScript
  
- [ ] **Implement conflict detection** - Identify conflicts
  - Implement: Detect simultaneous updates
  - Implement: Detect updates with same timestamp
  - Implement: Log conflicts for analytics
  - Verify: All edge cases handled
  
- [ ] **Implement conflict resolution** - Deterministic resolution
  - Implement: Compare updated_at timestamps
  - Implement: Select most recent update
  - Implement: Handle timestamp ties (use device ID as tiebreaker)
  - Verify: Resolution is deterministic

### API Integration

- [ ] **Create API client** - Supabase integration
  - Create: `src/backend/services/realtime/api.ts` 
  - Implement: updateProgress() function
  - Implement: getProgress() function
  - Implement: subscribeToProgress() function
  - Verify: Type-safe queries, error handling
  
- [ ] **Implement data fetching** - Server/client components
  - Verify: Use Next.js server components where possible
  - Verify: Error handling, loading states
  - Verify: Proper authentication checks
  
- [ ] **Test API integration** - Connectivity
  - Verify: Can fetch/post data successfully
  - Verify: Supabase connection works
  - Verify: RLS policies are enforced

### Database Testing

- [ ] **Test RLS policies** - Access control verification
  - Create: `tests/integration/realtime-rls.test.ts` 
  - Test: User can only see their own progress
  - Test: User cannot see other users' progress
  - Test: User cannot modify other users' progress
  - Verify: All policies enforced
  
- [ ] **Test triggers** - Update broadcasting
  - Create: `tests/integration/realtime-triggers.test.ts` 
  - Test: INSERT trigger fires on new progress
  - Test: UPDATE trigger fires on progress change
  - Test: DELETE trigger fires on progress deletion
  - Test: updated_at timestamp is set correctly
  - Verify: All triggers work as expected

---

## Verification Commands

```bash
# Push migrations to Supabase
supabase db push

# Test RLS policies
npm run test -- tests/integration/realtime-rls.test.ts

# Test triggers
npm run test -- tests/integration/realtime-triggers.test.ts

# Run all tests
npm run test

# Check database schema
supabase db pull
```

---

## Notes

**Database Design**:
- reading_progress table already exists from Story 2-5
- Triggers will be added via migration 012
- RLS policies will be enforced at database level
- Indexes will improve query performance

**Migration Strategy**:
- Use IF NOT EXISTS for idempotency
- Test migrations in development first
- Verify RLS policies before production deployment
- Monitor trigger performance in production

**Performance Considerations**:
- Indexes on frequently queried columns
- Trigger performance should be minimal
- RLS policy evaluation should be fast
- Monitor query performance with EXPLAIN ANALYZE

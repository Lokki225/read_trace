# Story 4.3: Supabase Real-Time Subscriptions for Cross-Device Sync

Status: ready-for-dev

## Story

As a developer,
I want to implement Supabase Realtime subscriptions for progress synchronization,
So that reading state updates across all user devices instantly.

## Acceptance Criteria

1. **Given** a user is logged in on multiple devices
   **When** they update reading progress on one device
   **Then** the progress is saved to Supabase

2. **Given** progress is saved to Supabase
   **When** Realtime subscriptions are active
   **Then** Realtime subscriptions push the update to other devices

3. **Given** an update is received on another device
   **When** the dashboard is open
   **Then** the dashboard reflects the update within 1 second

4. **Given** progress updates occur
   **When** the browser extension is running
   **Then** the browser extension updates its local state

5. **Given** conflicting updates occur on multiple devices
   **When** both updates reach Supabase
   **Then** conflict resolution favors the most recent update

6. **Given** updates are synced across devices
   **When** a user checks their reading state
   **Then** users see consistent state across all devices

## Tasks / Subtasks

- [ ] Task 1: Create Realtime subscription service (AC: #1, #2)
  - [ ] Create src/backend/services/realtime/realtimeService.ts
  - [ ] Implement Supabase Realtime client initialization
  - [ ] Create subscription management (subscribe/unsubscribe)
  - [ ] Implement progress table subscriptions

- [ ] Task 2: Implement dashboard Realtime integration (AC: #3)
  - [ ] Create src/hooks/useRealtimeProgress.ts
  - [ ] Implement real-time progress updates in dashboard
  - [ ] Add optimistic updates for instant UI feedback
  - [ ] Test update latency (<1 second)

- [ ] Task 3: Integrate extension with Realtime (AC: #4)
  - [ ] Update src/extension/background.ts for Realtime events
  - [ ] Implement extension state sync from Realtime updates
  - [ ] Create extension notification system for updates
  - [ ] Test cross-device synchronization

- [ ] Task 4: Implement conflict resolution (AC: #5)
  - [ ] Create src/backend/services/realtime/conflictResolver.ts
  - [ ] Implement last-write-wins strategy based on timestamp
  - [ ] Create conflict detection logic
  - [ ] Add database triggers for conflict handling

- [ ] Task 5: Add comprehensive testing (AC: #1-6)
  - [ ] Create tests/integration/realtime.integration.test.ts
  - [ ] Create tests/unit/hooks/useRealtimeProgress.test.tsx
  - [ ] Test multi-device synchronization scenarios
  - [ ] Test conflict resolution with concurrent updates

## Dev Notes

### Architecture Patterns
- **Realtime Subscriptions**: Supabase Realtime with PostgreSQL LISTEN/NOTIFY
- **Conflict Resolution**: Last-write-wins with timestamp comparison
- **Optimistic Updates**: Immediate UI updates with server reconciliation
- **Event Broadcasting**: Pub/sub pattern for cross-device updates
- **State Consistency**: Eventual consistency with conflict resolution

### Source Tree Components
- `src/backend/services/realtime/realtimeService.ts` - Realtime client
- `src/backend/services/realtime/conflictResolver.ts` - Conflict handling
- `src/hooks/useRealtimeProgress.ts` - React hook for subscriptions
- `src/extension/realtime.ts` - Extension Realtime integration
- `database/migrations/` - Realtime trigger setup

### Testing Standards
- Integration tests with real Supabase instance (or emulator)
- Multi-device simulation tests
- Conflict resolution scenario tests
- Latency measurement tests (<1 second target)
- Minimum 80% coverage for Realtime logic

### Project Structure Notes

**Realtime Subscription Pattern:**
```typescript
// Subscribe to progress updates for current user
const subscription = supabase
  .channel(`progress:${userId}`)
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'reading_progress' },
    (payload) => handleProgressUpdate(payload)
  )
  .subscribe();
```

**Conflict Resolution Strategy:**
- Compare `updated_at` timestamps
- Favor most recent update
- Log conflicts for analytics
- Notify user if manual resolution needed

**Database Triggers:**
- Update `updated_at` on every change
- Broadcast changes via Realtime
- Validate data integrity before accepting

### References

- [Epic 4 Specification: Cross-Platform Reading Progress Tracking](../planning-artifacts/epics.md#epic-4)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Architecture: Real-Time Synchronization](../planning-artifacts/architecture.md#realtime)
- [Database Schema: reading_progress](../database/migrations/)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Debug Log References

### Completion Notes List

### File List

- [ ] src/backend/services/realtime/realtimeService.ts
- [ ] src/backend/services/realtime/conflictResolver.ts
- [ ] src/hooks/useRealtimeProgress.ts
- [ ] src/extension/realtime.ts
- [ ] tests/integration/realtime.integration.test.ts
- [ ] tests/unit/hooks/useRealtimeProgress.test.tsx
- [ ] tests/unit/realtime/conflictResolver.test.ts

### Change Log

[To be updated during implementation]

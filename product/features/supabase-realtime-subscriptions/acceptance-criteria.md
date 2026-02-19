# Acceptance Criteria

## Overview

**Feature**: Supabase Real-Time Subscriptions for Cross-Device Sync  
**Feature ID**: 4-3  
**Story**: 4-3  
**Last Updated**: 2026-02-18  

This document defines the acceptance criteria for the feature using Behavior-Driven Development (BDD) format with Gherkin syntax.

## Acceptance Criteria

### AC-1: Progress Updates Saved to Supabase

```gherkin
Given a user is logged in on multiple devices
When they update reading progress on one device
Then the progress is saved to Supabase
And the update includes timestamp and user_id
And the update is persisted in the reading_progress table
```

**Rationale**: Ensures that all reading progress updates are properly persisted to the database, forming the foundation for cross-device synchronization.  
**Related User Story**: Story 4-3  
**Test Scenarios**: Integration test for progress update persistence  

---

### AC-2: Realtime Subscriptions Push Updates to Other Devices

```gherkin
Given progress is saved to Supabase
When Realtime subscriptions are active
Then Realtime subscriptions push the update to other devices
And the update is delivered within 1 second
And the subscription receives the correct payload
```

**Rationale**: Validates that Supabase Realtime subscriptions are properly configured and actively broadcasting updates to all connected clients.  
**Related User Story**: Story 4-3  
**Test Scenarios**: Integration test for subscription delivery  

---

### AC-3: Dashboard Reflects Updates Within 1 Second

```gherkin
Given an update is received on another device
When the dashboard is open
Then the dashboard reflects the update within 1 second
And the UI updates without page reload
And the user sees consistent state
```

**Rationale**: Ensures users experience real-time feedback on their reading progress across devices without manual refresh.  
**Related User Story**: Story 4-3  
**Test Scenarios**: Integration test for dashboard update latency  

---

### AC-4: Browser Extension Updates Local State

```gherkin
Given progress updates occur
When the browser extension is running
Then the browser extension updates its local state
And the extension receives Realtime events
And the extension state remains in sync with server
```

**Rationale**: Ensures the browser extension participates in the real-time synchronization ecosystem and maintains consistent state.  
**Related User Story**: Story 4-3  
**Test Scenarios**: Integration test for extension state sync  

---

### AC-5: Conflict Resolution Favors Most Recent Update

```gherkin
Given conflicting updates occur on multiple devices
When both updates reach Supabase
Then conflict resolution favors the most recent update
And the most recent timestamp is used as tiebreaker
And conflicts are logged for analytics
```

**Rationale**: Implements a deterministic conflict resolution strategy to ensure eventual consistency across devices.  
**Related User Story**: Story 4-3  
**Test Scenarios**: Unit test for conflict resolver, integration test for concurrent updates  

---

### AC-6: Consistent State Across All Devices

```gherkin
Given updates are synced across devices
When a user checks their reading state
Then users see consistent state across all devices
And all devices show the same progress value
And no data loss occurs during sync
```

**Rationale**: Validates the end-to-end synchronization guarantee that users experience consistent reading state regardless of device.  
**Related User Story**: Story 4-3  
**Test Scenarios**: Integration test for multi-device consistency  

---

## Functional Requirements

### Core Functionality

- [ ] **Requirement 1**: Supabase Realtime client initialization
  - Acceptance: Client connects to Supabase Realtime service on app startup
  - Priority: CRITICAL

- [ ] **Requirement 2**: Subscription management (subscribe/unsubscribe)
  - Acceptance: Can subscribe to progress updates for current user, unsubscribe on cleanup
  - Priority: CRITICAL

- [ ] **Requirement 3**: Progress table subscriptions
  - Acceptance: Subscriptions listen to reading_progress table changes for current user
  - Priority: CRITICAL

- [ ] **Requirement 4**: Optimistic updates in dashboard
  - Acceptance: UI updates immediately on user action, reconciles with server
  - Priority: HIGH

- [ ] **Requirement 5**: Conflict detection and resolution
  - Acceptance: Detects concurrent updates, applies last-write-wins strategy
  - Priority: HIGH

- [ ] **Requirement 6**: Extension integration with Realtime
  - Acceptance: Extension receives and processes Realtime events
  - Priority: HIGH

### Edge Cases and Error Handling

- [ ] **Error Case 1**: Network disconnection during sync
  - Expected Behavior: Queue updates locally, sync on reconnect
  - Error Message: "Syncing..." indicator shown to user

- [ ] **Error Case 2**: Subscription failure
  - Expected Behavior: Graceful fallback to polling, retry with exponential backoff
  - Error Message: "Connection lost. Retrying..." notification

- [ ] **Error Case 3**: Concurrent updates from same user
  - Expected Behavior: Last update wins, previous updates discarded
  - Error Message: None (transparent to user)

- [ ] **Edge Case 1**: User logs in on new device while syncing
  - Expected Behavior: New device receives full sync, then incremental updates
  - Error Message: None (transparent)

- [ ] **Edge Case 2**: Realtime subscription timeout
  - Expected Behavior: Automatic reconnection with exponential backoff
  - Error Message: None (transparent)

## Non-Functional Requirements

### Performance

- [ ] **Update Latency**: <1000ms from update on one device to reflection on another
- [ ] **Subscription Response Time**: <500ms for Realtime event delivery
- [ ] **Throughput**: Support 100+ concurrent subscriptions per user
- [ ] **Scalability**: System should handle 10,000+ concurrent users with real-time sync

### Security

- [ ] **Authentication**: Only authenticated users can subscribe to their own progress
- [ ] **Authorization**: Row-level security (RLS) enforces user isolation
- [ ] **Data Protection**: Updates include user_id validation before processing
- [ ] **Input Validation**: All progress updates validated before persistence

### Accessibility

- [ ] **WCAG 2.1 Level AA**: All UI elements comply with WCAG 2.1 Level AA standards
- [ ] **Keyboard Navigation**: All functionality accessible via keyboard
- [ ] **Screen Reader Support**: Sync status indicators properly labeled
- [ ] **Color Contrast**: Status indicators have sufficient contrast ratio

### Usability

- [ ] **Mobile Responsive**: Real-time sync works on mobile devices
- [ ] **Touch Friendly**: Interactive elements at least 44x44 pixels
- [ ] **Loading States**: Sync status clearly indicated to user
- [ ] **Error Messages**: Clear, actionable error messages for sync failures

## Data Requirements

### Data Validation

- [ ] **Required Fields**: user_id, series_id, chapter_number, updated_at
- [ ] **Format Validation**: chapter_number must be positive integer
- [ ] **Range Validation**: chapter_number <= total_chapters
- [ ] **Uniqueness**: (user_id, series_id) combination is unique per update

### Data Storage

- [ ] **Persistence**: Updates persisted to reading_progress table in Supabase
- [ ] **Backup**: Supabase automatic backups enabled
- [ ] **Retention**: Data retained indefinitely per privacy policy

## Integration Requirements

### API Integration

- [ ] **Endpoint**: Supabase Realtime service
- [ ] **Method**: WebSocket (postgres_changes)
- [ ] **Request Format**: Channel subscription with filters
- [ ] **Response Format**: Payload with event type, old, new records
- [ ] **Error Handling**: Automatic reconnection with exponential backoff

### Third-Party Services

- [ ] **Service**: Supabase Realtime
- [ ] **Integration Point**: Dashboard and extension subscribe to progress updates
- [ ] **Fallback Behavior**: Fallback to polling if Realtime unavailable

## Browser and Device Support

### Browsers

- [ ] **Chrome**: Latest 2 versions
- [ ] **Firefox**: Latest 2 versions
- [ ] **Safari**: Latest 2 versions
- [ ] **Edge**: Latest 2 versions

### Devices

- [ ] **Desktop**: Windows, macOS, Linux
- [ ] **Mobile**: iOS (latest 2 versions), Android (latest 2 versions)
- [ ] **Tablet**: iPad, Android tablets

## Quality Gates

### Testing Requirements

- [ ] **Unit Tests**: 80%+ code coverage for realtime service and conflict resolver
- [ ] **Integration Tests**: 70%+ coverage for subscription and sync flows
- [ ] **End-to-End Tests**: Critical user flows (multi-device sync, conflict resolution)
- [ ] **Manual Testing**: Cross-device synchronization scenarios

### Code Quality

- [ ] **Code Review**: Approved by 1+ reviewer
- [ ] **Linting**: No linting errors
- [ ] **Type Safety**: TypeScript strict mode compliance
- [ ] **Documentation**: Code documented with comments where needed

### Performance Testing

- [ ] **Load Testing**: Tested with 100+ concurrent subscriptions
- [ ] **Stress Testing**: Tested under high-frequency update scenarios
- [ ] **Memory Profiling**: No memory leaks detected
- [ ] **Bundle Size**: Bundle size increase < 5%

## Verification Checklist

### Before Marking Complete

- [ ] All acceptance criteria are met
- [ ] All test scenarios pass
- [ ] No regressions in existing functionality
- [ ] Performance metrics are met (<1s latency)
- [ ] Security review completed (RLS policies verified)
- [ ] Accessibility testing completed
- [ ] Documentation is complete
- [ ] Code review approved
- [ ] Ready for deployment

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | |
| QA Lead | | | |
| Tech Lead | | | |

## Notes

- Realtime subscriptions use Supabase's PostgreSQL LISTEN/NOTIFY mechanism
- Last-write-wins conflict resolution based on updated_at timestamp
- Optimistic updates provide immediate UI feedback while server reconciles
- Extension integration via message-passing pattern (existing pattern in codebase)

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18  
**Next Review**: 2026-02-25

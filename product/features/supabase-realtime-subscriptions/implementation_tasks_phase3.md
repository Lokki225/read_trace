# Implementation Tasks - Phase 3: Core Implementation

> **Purpose**: React components, hooks, and extension integration.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 3: Core Implementation

### Business Logic Implementation

- [ ] **Implement utility functions** - Domain operations
  - Create: `src/backend/services/realtime/utils.ts` 
  - Implement: formatProgressUpdate() - normalize update format
  - Implement: validateProgressUpdate() - validate update data
  - Implement: calculateLatency() - measure update latency
  - Verify: Each function has single responsibility
  - Verify: Pure functions, no side effects
  
- [ ] **Implement data transformations** - Data mapping
  - Implement: Realtime payload → UI model transformation
  - Implement: Form input → API request transformation
  - Implement: API response → UI state transformation
  - Verify: All transformations are type-safe

### React Hook Implementation

- [ ] **Create useRealtimeProgress hook** - Dashboard integration
  - Create: `src/hooks/useRealtimeProgress.ts` 
  - Implement: Subscribe on mount
  - Implement: Handle Realtime events
  - Implement: Update local state
  - Implement: Cleanup on unmount
  - Verify: Proper useEffect dependencies
  - Verify: No memory leaks
  
- [ ] **Implement optimistic updates** - Immediate UI feedback
  - Implement: Update UI immediately on user action
  - Implement: Queue update for server
  - Implement: Reconcile with server response
  - Implement: Rollback on error
  - Verify: User sees immediate feedback
  
- [ ] **Implement error handling** - Graceful degradation
  - Implement: Subscription error handling
  - Implement: Update error handling
  - Implement: Fallback to polling
  - Implement: User notification on errors
  - Verify: Errors don't crash component

### Dashboard Integration

- [ ] **Integrate hook with Dashboard** - Connect to existing component
  - Modify: `src/components/dashboard/DashboardTabs.tsx` 
  - Add: useRealtimeProgress hook
  - Add: Event listeners for Realtime updates
  - Add: Loading states for sync
  - Verify: Dashboard updates without page reload
  
- [ ] **Add sync status indicator** - User feedback
  - Create: `src/components/dashboard/SyncStatus.tsx` 
  - Implement: Show "Syncing...", "Synced", "Error" states
  - Implement: Update on subscription events
  - Implement: Accessible ARIA labels
  - Verify: Visible and clear to users
  
- [ ] **Update SeriesCard component** - Display sync status
  - Modify: `src/components/dashboard/SeriesCard.tsx` 
  - Add: Sync status indicator
  - Add: Last sync timestamp
  - Add: Manual refresh button
  - Verify: Responsive design maintained

### Extension Integration

- [ ] **Create extension Realtime handler** - Extension integration
  - Create: `src/extension/realtime.ts` 
  - Implement: Subscribe to Realtime events
  - Implement: Handle progress updates
  - Implement: Update extension state
  - Implement: Message-passing to background script
  - Verify: Extension receives updates
  
- [ ] **Update background script** - Process Realtime events
  - Modify: `src/extension/background.ts` 
  - Add: Realtime event listener
  - Add: State update handler
  - Add: Notification system
  - Verify: Extension state stays in sync
  
- [ ] **Update content script** - Reflect synced state
  - Modify: `src/extension/content.ts` 
  - Add: Listen for state updates from background
  - Add: Update UI with synced progress
  - Verify: Content script reflects latest state

### State Management

- [ ] **Implement React hooks** - Local state
  - Verify: useState used correctly
  - Verify: useEffect dependencies correct
  - Verify: No unnecessary re-renders
  
- [ ] **Implement custom hooks** - Shared logic
  - Verify: Single responsibility
  - Verify: Reusable across components
  
- [ ] **Implement context** - Global state (if needed)
  - Verify: Minimal context, avoid prop drilling
  - Verify: Memoization for performance

### Error Handling

- [ ] **Implement error boundaries** - React error handling
  - Create: `src/components/RealtimeErrorBoundary.tsx` 
  - Verify: Graceful error UI
  - Verify: Error logging
  
- [ ] **Implement error messages** - User feedback
  - Implement: Clear, actionable messages
  - Implement: Internationalization ready (i18n)
  - Verify: Errors don't block user interaction

---

## Verification Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Format code
npm run format

# Build project
npm run build

# Start dev server
npm run dev
```

---

## Notes

**Hook Design**:
- useRealtimeProgress manages subscription lifecycle
- Optimistic updates provide immediate feedback
- Fallback to polling if Realtime unavailable
- Error handling is transparent to user

**Component Integration**:
- Dashboard uses useRealtimeProgress hook
- SyncStatus component shows sync state
- SeriesCard displays last sync time
- Extension receives updates via message-passing

**Performance Considerations**:
- Memoize components to avoid unnecessary re-renders
- Use useCallback for event handlers
- Optimize subscription event handling
- Monitor performance with React DevTools

**Testing Strategy**:
- Unit tests for hooks and utilities
- Integration tests for component interactions
- E2E tests for user flows
- Performance tests for latency measurement

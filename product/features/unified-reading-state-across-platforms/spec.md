# Feature Specification

## Overview

**Feature ID**: 5-3  
**Feature Title**: Unified Reading State Across Platforms  
**Epic**: 5  
**Story**: 5-3  
**Status**: PROPOSED  
**Confidence Level**: MEDIUM  
**Priority**: HIGH  
**Last Updated**: 2026-02-19  

## Executive Summary

Users read the same manga series across multiple scanlation sites (MangaDex, Webtoon, etc.). This feature unifies their reading progress across all platforms, showing the most recent position regardless of where they last read. When resuming, the system intelligently navigates to the appropriate platform based on user preferences while allowing manual override.

## Problem Statement

### User Problem
Users often read the same series on different scanlation sites depending on availability, translation quality, or site preference. Currently, ReadTrace tracks progress per site independently, forcing users to manually track which site has their most recent progress. This creates confusion and friction when resuming reading.

### Business Problem
Incomplete progress tracking reduces user engagement and trust in the platform. Users may abandon ReadTrace if it doesn't accurately reflect their reading across their preferred sites.

### Current State
Progress is tracked per platform independently. Users must manually check multiple series entries to find their most recent position.

### Desired State
ReadTrace automatically unifies progress across all platforms, showing the most recent position with platform indicators. Resume navigation intelligently selects the appropriate platform based on user preferences.

## Feature Description

### What is this feature?
A unified progress resolution system that:
1. Tracks which platform (MangaDex, Webtoon, etc.) each progress entry came from
2. Queries all platforms for a given series and selects the most recent update
3. Displays platform information on series cards
4. Intelligently resolves resume navigation based on platform preferences
5. Allows manual platform selection when resuming

### Who is it for?
- **Casual Readers**: Users who read on multiple sites depending on availability
- **Completionists**: Users who want accurate progress tracking across all sources
- **Power Users**: Users with large libraries who need efficient resume navigation

### When would they use it?
- Checking dashboard to see reading progress
- Resuming a series from the dashboard
- Switching between preferred reading platforms
- Managing series across multiple sites

### Why is it important?
- **User Trust**: Accurate progress tracking builds confidence in the platform
- **Engagement**: Seamless resume experience encourages continued use
- **Flexibility**: Supports users' multi-platform reading habits
- **Competitive Advantage**: Differentiates ReadTrace from single-platform trackers

## Scope

### In Scope
- Platform tracking in reading_progress table
- Unified state resolution service (getUnifiedProgress)
- Platform preference resolution (selectResumeUrl)
- ResumeButton platform awareness and selection
- Extension platform detection and tracking
- Conflict resolution using last-write-wins strategy
- Dashboard display of platform information
- Unit and integration tests (90%+ coverage)

### Out of Scope
- Automatic platform preference learning (future enhancement)
- Cross-platform reading recommendations
- Platform-specific features or optimizations
- Mobile app support (web only for now)
- Real-time platform status monitoring

### Assumptions
- Platform adapters are already implemented (Story 4-4)
- Conflict resolver exists (Story 4-3)
- ResumeButton component exists (Story 5-1)
- Users have reading progress on multiple platforms
- Platform identifiers are stable and unique

## Technical Architecture

### System Components
- **Database Layer**: reading_progress table with platform column
- **Service Layer**: unifiedStateService for progress resolution
- **Utility Layer**: platformPreference for resume URL selection
- **Component Layer**: ResumeButton with platform indicator and dropdown
- **Extension Layer**: Content script with platform detection

### Data Model
```typescript
// reading_progress table
{
  id: UUID,
  user_id: UUID,
  series_id: UUID,
  platform: VARCHAR(50),        // NEW: 'mangadex', 'webtoon', etc.
  current_chapter: FLOAT,
  total_chapters: INT,
  scroll_position: FLOAT,
  updated_at: TIMESTAMP,
  created_at: TIMESTAMP
}

// UnifiedProgress (service response)
{
  series_id: UUID,
  current_chapter: FLOAT,
  total_chapters: INT,
  scroll_position: FLOAT,
  platform: VARCHAR(50),
  updated_at: TIMESTAMP,
  alternatives: Array<{
    platform: VARCHAR(50),
    current_chapter: FLOAT,
    updated_at: TIMESTAMP
  }>
}
```

### API Endpoints
- `GET /api/series/{id}/unified-progress` - Get unified progress for series
- `POST /api/resume/{id}` - Navigate to resume URL with platform selection

### Integration Points
- **Adapter Registry**: Detect platform from URL
- **Conflict Resolver**: Resolve simultaneous updates
- **ResumeButton Component**: Display and handle platform selection
- **Extension Content Script**: Track platform in progress updates

### Performance Requirements
- Unified state resolution: <200ms per series
- Platform preference resolution: <100ms
- Dashboard load with 100+ series: <2s
- Resume navigation: <2s to target site

## User Experience

### User Flows

**Flow 1: Check Unified Progress**
1. User navigates to dashboard
2. Series card displays most recent progress across all platforms
3. Platform badge shows which site has latest update
4. User can see alternative platforms in card details

**Flow 2: Resume with Platform Selection**
1. User clicks resume button on series card
2. System determines preferred platform (with fallback)
3. If preferred platform available, navigate directly
4. If not available, show dropdown to select alternative
5. Navigate to selected platform's resume URL

**Flow 3: Manual Platform Override**
1. User clicks resume button
2. Dropdown shows available platforms with progress
3. User selects preferred platform
4. Navigate to that platform's resume URL

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation for platform dropdown
- Screen reader labels for platform indicators
- Color contrast 4.5:1 for all text
- Focus indicators on all interactive elements

### Mobile Considerations
- Platform dropdown optimized for touch (44x44px minimum)
- Responsive layout for small screens
- Touch-friendly platform selection
- Fast load times on mobile networks

## Acceptance Criteria

### Functional Requirements
- [ ] Platform tracked in reading_progress table
- [ ] Unified state resolution returns most recent progress
- [ ] Platform preference resolution with fallback
- [ ] ResumeButton shows platform indicator
- [ ] Platform dropdown allows manual selection
- [ ] Extension detects and tracks platform
- [ ] Conflict resolution uses last-write-wins
- [ ] Dashboard displays platform information

### Non-Functional Requirements
- [ ] Unified state resolution <200ms
- [ ] Platform preference resolution <100ms
- [ ] 90%+ test coverage
- [ ] WCAG 2.1 Level AA accessible
- [ ] Mobile responsive (320px+)
- [ ] No performance regression on dashboard

### Quality Gates
- [ ] Unit test coverage: 90%+
- [ ] Integration test coverage: 85%+
- [ ] Code review approval
- [ ] Performance testing passed
- [ ] Security review passed
- [ ] Accessibility testing passed

## Dependencies

### Technical Dependencies
- Story 4-4: Platform Adapter Architecture (platform detection)
- Story 4-3: Realtime Subscriptions (conflict resolver)
- Story 5-1: Resume Button (component to enhance)
- Supabase: reading_progress table

### Feature Dependencies
- Browser Extension Content Script (platform tracking)
- Series Dashboard (display unified state)
- ResumeButton Component (platform selection)

### External Dependencies
- Scanlation site stability (MangaDex, Webtoon, etc.)
- Adapter registry accuracy

## Risks and Mitigations

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Platform detection fails | Medium | High | Fallback to generic platform, log errors |
| Timestamp collisions | Low | Medium | Tie-break by chapter number, then platform name |
| Query performance degrades | Low | High | Add index on (series_id, updated_at) |
| Adapter registry out of sync | Medium | Medium | Validate platform against registry, error handling |

### Performance Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Unified state resolution slow | Low | Medium | Cache results for 5-10 seconds |
| Dashboard load time increases | Medium | Medium | Batch queries, lazy load alternatives |
| Memory usage increases | Low | Medium | Proper cleanup, limit cached entries |

### Security Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Platform data exposed | Low | High | RLS policies, user_id validation |
| Invalid platform injection | Low | Medium | Validate platform against registry |

## Success Metrics

### User Metrics
- Resume click-through rate: 60%+
- User satisfaction with progress accuracy: 90%+
- Platform selection usage: 30%+

### Business Metrics
- Reduced support tickets about progress accuracy
- Increased user engagement (resume frequency)
- Improved user retention

### Technical Metrics
- Unified state resolution: <200ms (p95)
- Test coverage: 90%+
- Zero regressions in existing tests
- Platform detection accuracy: 95%+

## Implementation Approach

### Phase 1: Foundation
- Add platform column to reading_progress table
- Update TypeScript schemas
- Create unifiedStateService with getUnifiedProgress()

### Phase 2: Integration
- Update extension to track platform
- Integrate unifiedStateService into seriesQueryService
- Create platformPreference utility

### Phase 3: UI Enhancement
- Update ResumeButton with platform indicator
- Add platform dropdown for selection
- Update series card display

### Phase 4: Testing & Validation
- Unit tests for services (22+ tests)
- Integration tests for full flow (12+ tests)
- Performance testing
- Accessibility testing

## Timeline

- **Specification**: 2026-02-19 (complete)
- **Implementation**: 2026-02-20 to 2026-02-28 (9 days)
- **Testing**: 2026-02-28 to 2026-03-05 (5 days)
- **Deployment**: 2026-03-05 (target)

## Resources

### Team
- **Product Owner**: Product Team
- **Lead Developer**: AI Agent
- **QA Lead**: AI Agent
- **Designer**: Product Team

### Effort Estimate
- Development: 5 story points (3-4 days)
- Testing: 3 story points (2-3 days)
- Documentation: 1 story point (0.5 days)

## References

### Related Documents
- Story 4-4: Platform Adapter Architecture
- Story 4-3: Realtime Subscriptions
- Story 5-1: Resume Button
- Epic 5: One-Click Resume & Navigation

### External References
- Supabase Documentation
- TypeScript Best Practices
- WCAG 2.1 Guidelines

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-19  
**Next Review Date**: 2026-02-26

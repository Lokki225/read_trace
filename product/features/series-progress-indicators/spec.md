# Feature Specification: Series Progress Indicators

## Overview

**Feature ID**: 3-4  
**Feature Title**: Series Progress Indicators  
**Epic**: 3 (Series Management & Dashboard)  
**Story**: [Story 3.4: Series Progress Indicators](../../../_bmad-output/implementation-artifacts/3-4-series-progress-indicators.md)  
**Status**: PROPOSED  
**Confidence Level**: MEDIUM  
**Priority**: HIGH  
**Last Updated**: 2026-02-18  

## Executive Summary

This feature provides users with visual feedback on their reading progress for each series in their library. It includes a percentage-based progress bar and detailed metadata (current/total chapters and last read date) with real-time updates to ensure the dashboard always reflects the user's latest activity.

## Problem Statement

### User Problem
Users often forget where they left off in a series or which series they've read recently, making it difficult to manage their reading list.

### Business Problem
Lack of progress indicators reduces user engagement and return visits, as users may feel lost in their own library.

### Current State
The dashboard shows series cards but without specific progress data or visual completion indicators.

### Desired State
Each series card clearly shows a progress bar, current chapter position, and last read timestamp, updated in real-time.

## Feature Description

### What is this feature?
A UI component embedded in the `SeriesCard` that calculates and displays reading progress based on `reading_progress` data from Supabase.

### Who is it for?
Active readers who want to track their progress across multiple series.

### When would they use it?
Whenever they visit the dashboard to decide what to read next or review their history.

### Why is it important?
It provides the core "tracking" value proposition of the ReadTrace platform.

## Scope

### In Scope
- Progress bar component with orange accent color (#FF7A45).
- Percentage calculation (current / total).
- Chapter/Page number display.
- Relative date formatting ("2 days ago").
- Real-time updates via Supabase subscriptions.
- Accessibility (ARIA labels and roles).

### Out of Scope
- Detailed reading history graphs (future feature).
- Manual progress editing on the dashboard (handled via extension or import).

## Technical Architecture

### System Components
- **UI**: `ProgressIndicator` component (React).
- **State**: `seriesStore` (Zustand) for handling Realtime updates.
- **Backend**: Supabase `reading_progress` table and Realtime engine.

### Data Model
- `reading_progress` table: `user_id`, `series_id`, `current_chapter`, `total_chapters`, `last_read_at`.

### Performance Requirements
- **Progress Calculation**: < 50ms per card.
- **Update Latency**: < 500ms from DB change to UI reflection.

## User Experience

### User Flows
1. User opens dashboard -> Progress bars are visible on all cards.
2. User reads a chapter on a scan site -> Extension updates DB -> Dashboard progress bar animates to new position.

### Accessibility Requirements
- **WCAG 2.1 Level AA**: Proper contrast and ARIA labels.
- **Keyboard Navigation**: Focus indicators for interactive progress elements.

## Acceptance Criteria
Refer to [acceptance-criteria.md](./acceptance-criteria.md).

## Dependencies

### Technical Dependencies
- `date-fns`: For relative date formatting.
- `Supabase Realtime`: For live updates.

### Feature Dependencies
- Story 3-1: Dashboard Layout (completed).
- Story 3-2: Series Card Component (completed).

## Risks and Mitigations
Refer to [risks.md](./risks.md).

## Success Metrics
- **User Engagement**: Increase in click-through rate from dashboard to reading.
- **Data Accuracy**: 100% alignment between DB state and UI display.

## Implementation Approach

### Phase 1: Foundation
- Define types and progress calculation utilities.
- Implement date formatting helpers.

### Phase 2: UI Implementation
- Create `ProgressIndicator` component.
- Integrate into `SeriesCard`.

### Phase 3: Real-time Integration
- Implement Supabase Realtime subscription in `seriesStore`.
- Add animations and smooth transitions.

**Document Status**: PROPOSED  
**Last Reviewed**: 2026-02-18  

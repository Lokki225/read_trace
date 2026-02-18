# Feature Specification: Preferred Scan Site Configuration

## Overview

**Feature ID**: 3-6  
**Feature Title**: Preferred Scan Site Configuration  
**Epic**: 3  
**Story**: 3-6  
**Status**: PROPOSED  
**Confidence Level**: HIGH  
**Priority**: MEDIUM  
**Last Updated**: 2026-02-18  

## Executive Summary

Preferred Scan Site Configuration allows users to set and reorder their preferred scanlation sites. The browser extension uses these preferences to prioritize site detection and resume functionality.

## Problem Statement

Users read on multiple scanlation sites but want to prioritize certain sites. The extension should respect user preferences when detecting reading and providing resume functionality.

## Feature Description

PreferredSitesForm component with drag-and-drop reordering. Supported platforms (MangaDex, others) with checkboxes. Save to Supabase user_profiles. Extension fetches and uses preferences. Resume button navigates to preferred site.

## Scope

### In Scope
- PreferredSitesForm component with drag-and-drop
- Platform selection with checkboxes
- Save to user_profiles.preferred_sites
- Extension integration for site detection
- Resume button uses preferred site
- Default preferences (MangaDex first)
- Settings page for updates
- Onboarding step

### Out of Scope
- Custom site addition
- Site priority weighting
- Site availability checking

## Technical Architecture

### Components
- PreferredSitesForm.tsx
- PreferredSitesStep.tsx (onboarding)
- API endpoint: POST /api/user/preferences/sites
- Platform definitions in lib/platforms.ts

### Data Model
user_profiles.preferred_sites (TEXT[] array), preferred_sites_updated_at timestamp.

### Performance Requirements
- Form save: < 500ms
- Extension preference fetch: < 1s

## Acceptance Criteria

- [x] Select from supported platforms
- [x] Reorder preferences (drag-and-drop)
- [x] Save to Supabase
- [x] Extension uses preferences
- [x] Update preferences anytime
- [x] Display in settings/onboarding
- [x] Default preferences if skipped
- [x] Resume uses preferred site

## Dependencies

- Story 2-4 (Browser Extension Installation)
- Story 3-1 (Dashboard)
- user_profiles table

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Extension sync issues | Implement polling/messaging |
| Preferred site unavailable | Fallback to any available site |
| Drag-and-drop complexity | Use react-beautiful-dnd |

## Success Metrics

- Users can configure preferences in < 30 seconds
- 80%+ test coverage
- Extension respects preferences 100% of time

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18

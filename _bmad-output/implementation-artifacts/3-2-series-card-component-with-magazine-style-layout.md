# Story 3.2: Series Card Component with Magazine-Style Layout

Status: ready-for-dev

## Story

As a user,
I want to see series displayed as attractive cards with cover images and metadata,
So that I can quickly recognize and manage my reading library.

## Acceptance Criteria

1. Each series card displays a 100px × 140px cover image slot with fallback placeholder
2. Card shows series title, genre tags, and platform information
3. Card displays current reading progress as a percentage bar
4. Card includes a status badge (Reading, Completed, On Hold, Plan to Read)
5. Cards use the orange-based color palette with proper contrast ratios (4.5:1 minimum)
6. Cards are responsive and adapt to different screen sizes (mobile, tablet, desktop)
7. Cards have hover effects on desktop (subtle shadow/scale increase)
8. Cards are accessible with proper semantic HTML and ARIA labels

## Tasks / Subtasks

- [ ] Task 1: Create SeriesCard component with image and metadata (AC: 1, 2, 4)
  - [ ] Subtask 1.1: Build SeriesCard.tsx component structure
  - [ ] Subtask 1.2: Implement 100px × 140px image container with aspect ratio
  - [ ] Subtask 1.3: Add image fallback/placeholder for missing covers
  - [ ] Subtask 1.4: Display series title, genres, and platform as metadata
  - [ ] Subtask 1.5: Create StatusBadge component with color coding
- [ ] Task 2: Implement progress indicator and styling (AC: 3, 5, 7)
  - [ ] Subtask 2.1: Create ProgressBar component showing percentage
  - [ ] Subtask 2.2: Style with orange accent color (#FF7A45)
  - [ ] Subtask 2.3: Add hover effects (shadow, scale) for desktop
  - [ ] Subtask 2.4: Verify color contrast ratios meet WCAG AA (4.5:1)
- [ ] Task 3: Implement responsive grid layout (AC: 6)
  - [ ] Subtask 3.1: Create SeriesGrid component using CSS Grid
  - [ ] Subtask 3.2: Desktop: 4-5 columns, Tablet: 2-3 columns, Mobile: 1-2 columns
  - [ ] Subtask 3.3: Add responsive gap/padding adjustments
  - [ ] Subtask 3.4: Test on multiple screen sizes (375px, 768px, 1024px, 1440px)
- [ ] Task 4: Ensure accessibility and semantic HTML (AC: 8)
  - [ ] Subtask 4.1: Use semantic HTML (article, img with alt text)
  - [ ] Subtask 4.2: Add ARIA labels for status badges
  - [ ] Subtask 4.3: Ensure keyboard navigation works (Tab, Enter)
  - [ ] Subtask 4.4: Test with screen reader (NVDA/JAWS simulation)
- [ ] Task 5: Write comprehensive tests (AC: all)
  - [ ] Subtask 5.1: Unit test SeriesCard rendering with various props
  - [ ] Subtask 5.2: Unit test image fallback behavior
  - [ ] Subtask 5.3: Unit test progress bar calculation
  - [ ] Subtask 5.4: Integration test SeriesGrid responsive layout
  - [ ] Subtask 5.5: Accessibility test (contrast, ARIA, keyboard nav)

## Dev Notes

### Architecture & Patterns

- **Component Structure**:
  - `SeriesCard.tsx` - Main card component (receives series object)
  - `SeriesGrid.tsx` - Grid container for multiple cards
  - `StatusBadge.tsx` - Reusable status badge component
  - `ProgressBar.tsx` - Reusable progress indicator component

- **Data Shape** (from user_series table):
  ```typescript
  interface Series {
    id: string
    user_id: string
    title: string
    cover_image_url?: string
    platform: string // 'mangadex', 'other'
    genres: string[] // ['action', 'adventure']
    status: 'reading' | 'completed' | 'onHold' | 'planToRead'
    current_chapter?: number
    total_chapters?: number
    progress_percentage: number // 0-100
    last_read_date?: string
  }
  ```

- **Styling Approach**:
  - Use Tailwind CSS utility classes for responsive design
  - Color palette: Brand Orange (#FF7A45), Background Cream (#FFF8F2), Card Peach (#FFEDE3)
  - Spacing: 8px grid system (gap-2, gap-3, gap-4)
  - Typography: Inter font with proper hierarchy

- **Responsive Breakpoints**:
  - Mobile: < 640px (1-2 columns, gap-2)
  - Tablet: 640px - 1024px (2-3 columns, gap-3)
  - Desktop: > 1024px (4-5 columns, gap-4)

- **Image Handling**:
  - Use Next.js Image component for optimization
  - Aspect ratio: 100px × 140px (5:7 ratio)
  - Fallback: Placeholder SVG or icon
  - Lazy load images below fold

### Project Structure Notes

- **New Files**:
  - `src/components/dashboard/SeriesCard.tsx` - Main card component
  - `src/components/dashboard/SeriesGrid.tsx` - Grid container
  - `src/components/dashboard/StatusBadge.tsx` - Status badge
  - `src/components/dashboard/ProgressBar.tsx` - Progress indicator
  - `tests/unit/SeriesCard.test.tsx` - Unit tests
  - `tests/integration/SeriesGrid.integration.test.tsx` - Integration tests

- **Modified Files**:
  - `src/lib/supabase.ts` - Ensure Database type includes series fields
  - `src/types/index.ts` - Add Series interface

- **Design System Integration**:
  - Follows color palette from UX Design Specification
  - Uses Tailwind CSS configured in tailwind.config.ts
  - Respects spacing grid (8px base)
  - Implements WCAG 2.1 AA accessibility standards

### Testing Standards Summary

- **Unit Tests**: Component rendering, prop handling, image fallback, progress calculation
- **Integration Tests**: Grid layout responsiveness, series data flow
- **Accessibility Tests**: Color contrast, ARIA labels, keyboard navigation
- **Coverage Target**: 85%+ for card components
- **Test Patterns**: React Testing Library with `render`, `screen`, `within`

### References

- [Story 3.2 Requirements](../../planning-artifacts/epics.md#story-32-series-card-component-with-magazine-style-layout)
- [Design System: Color Palette](../../planning-artifacts/epics.md#design-system-requirements-from-ux-design)
- [UX Design: Magazine Layout](../../planning-artifacts/ux-design-specification.md)
- [Architecture: Naming Conventions](../../planning-artifacts/architecture.md#naming-patterns)
- [Architecture: Component Structure](../../planning-artifacts/architecture.md#structure-patterns)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Cascade)

### Debug Log References

None yet - story created fresh

### Completion Notes List

- Story file created with comprehensive context
- Component structure and data shapes defined
- Responsive design strategy documented
- Accessibility requirements specified
- Color palette and styling approach detailed

### File List

To be populated during implementation:
- src/components/dashboard/SeriesCard.tsx
- src/components/dashboard/SeriesGrid.tsx
- src/components/dashboard/StatusBadge.tsx
- src/components/dashboard/ProgressBar.tsx
- tests/unit/SeriesCard.test.tsx
- tests/integration/SeriesGrid.integration.test.tsx

# Implementation Tasks Phase 3: Series Card Component - Core Implementation

> **Purpose**: Core component implementation for the series card feature.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 3: Core Implementation

### Business Logic Implementation
- [ ] **Implement progress calculation utility**
  - Create: `src/lib/progress.ts` (if not exists)
  - Include: calculateProgress(current, total) function
  - Include: formatProgressPercentage(percentage) function
  - Verify: Handles edge cases (0%, 100%, undefined)

### React Components Implementation
- [ ] **Create StatusBadge component**
  - Create: `src/components/dashboard/StatusBadge.tsx`
  - Props: status ('reading' | 'completed' | 'onHold' | 'planToRead'), className?
  - Features:
    - Display status label with proper casing
    - Apply color based on status:
      - reading: bg-orange-500 (#FF7A45)
      - completed: bg-green-500
      - onHold: bg-yellow-500
      - planToRead: bg-gray-500
    - Add ARIA label for accessibility
  - Verify: Matches design system colors

- [ ] **Create ProgressBar component**
  - Create: `src/components/dashboard/ProgressBar.tsx`
  - Props: percentage (0-100), className?
  - Features:
    - Display progress bar with percentage fill
    - Show percentage text (e.g., "45%")
    - Use orange accent color (#FF7A45)
    - Smooth transition animation (200ms)
    - Handle edge cases (0%, 100%)
  - Verify: Accessibility with ARIA labels

- [ ] **Create SeriesCard component**
  - Create: `src/components/dashboard/SeriesCard.tsx`
  - Props: series (Series object), onClick?
  - Features:
    - Display 100px × 140px cover image with aspect ratio
    - Show image fallback/placeholder if missing
    - Display series title (truncate if too long)
    - Show genre tags
    - Display platform information
    - Include StatusBadge component
    - Include ProgressBar component
    - Add hover effects for desktop (shadow, scale 1.02x)
    - Semantic HTML (article tag)
    - Proper ARIA labels
  - Verify: Responsive design works
  - Verify: Image lazy loading

- [ ] **Create SeriesGrid component**
  - Create: `src/components/dashboard/SeriesGrid.tsx`
  - Props: series (Series[]), isLoading?, className?
  - Features:
    - Render multiple SeriesCard components
    - Responsive grid layout:
      - Mobile (< 640px): 1-2 columns (grid-cols-1 sm:grid-cols-2)
      - Tablet (640px - 1024px): 2-3 columns (md:grid-cols-3)
      - Desktop (> 1024px): 4-5 columns (lg:grid-cols-4 xl:grid-cols-5)
    - Proper gap/spacing (gap-4)
    - Handle empty state (show message)
    - Show loading skeleton if isLoading
  - Verify: Responsive on all breakpoints

### State Management
- [ ] **Verify Zustand store integration**
  - Reference: `src/store/seriesStore.ts` (from Story 3-1)
  - Verify: Series data available in store
  - Verify: Can subscribe to series updates

### Error Handling
- [ ] **Implement error boundaries**
  - Verify: SeriesCard handles missing data gracefully
  - Verify: SeriesGrid handles empty series list
  - Verify: Image loading errors show placeholder

---

## Verification Commands (Copy-Paste Ready)

```bash
# Run component tests
npm test -- --testPathPattern="SeriesCard|SeriesGrid|StatusBadge|ProgressBar"

# Check TypeScript compilation
npx tsc --noEmit

# Run linter
npm run lint -- src/components/dashboard/

# Build project
npm run build
```

---

## Notes Section

**Implementation Notes**:
- Use React.memo for SeriesCard to prevent unnecessary re-renders
- Use Next.js Image component for cover images
- Implement lazy loading with IntersectionObserver
- Follow existing component patterns from Story 3-1
- Use TailwindCSS for all styling

**Time Estimates**:
- Phase 3 (Implementation): ~6-8 hours

---

## References

- **Design System**: `docs/THEME_SYSTEM.md`
- **Story 3-1**: Dashboard Tabbed Interface (reference components)
- **TailwindCSS**: `tailwind.config.ts`

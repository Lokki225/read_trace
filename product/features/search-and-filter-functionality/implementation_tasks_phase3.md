# Implementation Tasks Phase 3: Search and Filter - Core Implementation

> **Purpose**: Implement search and filter components and logic
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 3: Core Implementation

### SearchBar Component
- [ ] **Create SearchBar.tsx** - Search input component
  - Create: `src/components/dashboard/SearchBar.tsx`
  - Include: Text input with placeholder
  - Include: Debounce logic (300ms)
  - Include: Case-insensitive search
  - Include: Update Zustand store on input
  - Verify: Component renders correctly

### FilterPanel Component
- [ ] **Create FilterPanel.tsx** - Filter controls
  - Create: `src/components/dashboard/FilterPanel.tsx`
  - Include: Platform filter (checkbox group)
  - Include: Status filter (checkbox group)
  - Include: Clear Filters button
  - Include: Update Zustand store on filter change
  - Verify: All filter options display

### Search Utilities
- [ ] **Create search.ts** - Search logic
  - Create: `src/lib/search.ts`
  - Include: `searchSeries()` function
  - Include: `applyFilters()` function
  - Include: Multi-field matching (title, genres, platform)
  - Include: AND logic for combining filters
  - Verify: Pure functions, well-tested

### Dashboard Integration
- [ ] **Update dashboard page** - Add search/filter UI
  - Update: `src/app/dashboard/page.tsx`
  - Add: SearchBar component
  - Add: FilterPanel component
  - Add: Use filtered series from Zustand selector
  - Verify: Components render on dashboard

---

## Verification Commands

```bash
npx tsc --noEmit
npm run lint -- src/components/dashboard/
npm test -- --testPathPattern="search|filter"
```

---

## Notes Section

**Implementation Notes**:
- Use TailwindCSS for styling
- Follow existing component patterns from Story 3-1
- Implement proper error handling
- Add loading states if needed

---

## References

- **Story 3-1**: Dashboard Tabbed Interface (reference implementation)
- **Zustand Docs**: State management pattern

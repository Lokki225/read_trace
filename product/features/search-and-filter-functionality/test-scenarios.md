# Test Scenarios: Search and Filter Functionality

## Overview

**Feature**: Search and Filter Functionality  
**Feature ID**: 3-3  
**Story**: 3-3  
**Last Updated**: 2026-02-18  

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - Search logic, filter logic
- **Integration Tests**: 30% - Search + filter interaction
- **E2E Tests**: 10% - Full user journey

### Test Coverage Goals

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: 70%+ feature coverage

## Unit Tests

### Test Suite 1: SearchBar Component

**File**: `tests/unit/SearchBar.test.tsx`

#### Test Case 1.1: Renders search input

```typescript
it('should render search input with placeholder', () => {
  render(<SearchBar />);
  expect(screen.getByPlaceholderText(/search series/i)).toBeInTheDocument();
});
```

#### Test Case 1.2: Debounces search input

```typescript
it('should debounce search by 300ms', async () => {
  render(<SearchBar />);
  const input = screen.getByPlaceholderText(/search series/i);
  
  fireEvent.change(input, { target: { value: 'test' } });
  expect(mockStore.setSearchQuery).not.toHaveBeenCalled();
  
  await waitFor(() => {
    expect(mockStore.setSearchQuery).toHaveBeenCalledWith('test');
  }, { timeout: 400 });
});
```

### Test Suite 2: FilterPanel Component

**File**: `tests/unit/FilterPanel.test.tsx`

#### Test Case 2.1: Renders platform filters

```typescript
it('should render all platform options', () => {
  render(<FilterPanel />);
  expect(screen.getByLabelText(/mangadex/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
});
```

#### Test Case 2.2: Renders status filters

```typescript
it('should render all status options', () => {
  render(<FilterPanel />);
  expect(screen.getByLabelText(/reading/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/completed/i)).toBeInTheDocument();
});
```

### Test Suite 3: Search Logic

**File**: `tests/unit/search.test.ts`

#### Test Case 3.1: Matches title case-insensitive

```typescript
it('should match series title case-insensitively', () => {
  const series = [
    { title: 'Attack on Titan', genres: [], platform: 'mangadex' }
  ];
  const results = searchSeries(series, 'attack');
  expect(results).toHaveLength(1);
});
```

#### Test Case 3.2: Matches genres

```typescript
it('should match series by genre', () => {
  const series = [
    { title: 'Series', genres: ['action', 'adventure'], platform: 'mangadex' }
  ];
  const results = searchSeries(series, 'action');
  expect(results).toHaveLength(1);
});
```

## Integration Tests

### Integration Test Suite 1: Search + Filter Interaction

**File**: `tests/integration/search-filter.integration.test.ts`

#### Test Case 1.1: Search and filter together

```typescript
it('should apply search and filters together', () => {
  const series = [
    { title: 'Series A', genres: ['action'], platform: 'mangadex', status: 'reading' },
    { title: 'Series B', genres: ['action'], platform: 'other', status: 'completed' }
  ];
  
  const results = applyFilters(series, {
    searchQuery: 'series',
    platforms: ['mangadex'],
    statuses: ['reading']
  });
  
  expect(results).toHaveLength(1);
  expect(results[0].title).toBe('Series A');
});
```

#### Test Case 1.2: Clear filters resets results

```typescript
it('should show all series after clearing filters', () => {
  const series = [
    { title: 'Series A', genres: [], platform: 'mangadex', status: 'reading' },
    { title: 'Series B', genres: [], platform: 'other', status: 'completed' }
  ];
  
  const filtered = applyFilters(series, { platforms: ['mangadex'] });
  expect(filtered).toHaveLength(1);
  
  const cleared = applyFilters(series, {});
  expect(cleared).toHaveLength(2);
});
```

## Test Data

### Data Set 1: Valid Series

```json
{
  "title": "Attack on Titan",
  "genres": ["action", "adventure", "supernatural"],
  "platform": "mangadex",
  "status": "reading"
}
```

### Data Set 2: Multiple Series

```json
[
  { "title": "Series A", "genres": ["action"], "platform": "mangadex", "status": "reading" },
  { "title": "Series B", "genres": ["romance"], "platform": "other", "status": "completed" }
]
```

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18

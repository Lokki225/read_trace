# Test Scenarios: Infinite Scroll for Large Libraries

## Overview

**Feature**: Infinite Scroll for Large Libraries  
**Feature ID**: 3-5  
**Story**: 3-5  
**Last Updated**: 2026-02-18  

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - Hook logic, pagination
- **Integration Tests**: 30% - Scroll interaction
- **E2E Tests**: 10% - Full user journey

## Unit Tests

### Test Suite 1: useInfiniteScroll Hook

**File**: `tests/unit/useInfiniteScroll.test.ts`

#### Test Case 1.1: Triggers callback on scroll

```typescript
it('should trigger callback when scrolling near bottom', () => {
  const callback = jest.fn();
  const { result } = renderHook(() => useInfiniteScroll(callback, 200));
  
  // Simulate scroll near bottom
  fireEvent.scroll(window, { y: window.innerHeight - 150 });
  
  expect(callback).toHaveBeenCalled();
});
```

#### Test Case 1.2: Respects threshold

```typescript
it('should use custom threshold', () => {
  const callback = jest.fn();
  renderHook(() => useInfiniteScroll(callback, 500));
  
  // Should not trigger until 500px from bottom
  expect(callback).not.toHaveBeenCalled();
});
```

### Test Suite 2: Pagination Logic

**File**: `tests/unit/pagination.test.ts`

#### Test Case 2.1: Calculates correct offset

```typescript
it('should calculate correct offset for page', () => {
  const offset = calculateOffset(2, 20); // page 2, size 20
  expect(offset).toBe(40);
});
```

#### Test Case 2.2: Detects end of list

```typescript
it('should detect when list is complete', () => {
  const hasMore = checkHasMore(15, 20); // returned 15, requested 20
  expect(hasMore).toBe(false);
});
```

## Integration Tests

### Integration Test Suite 1: Infinite Scroll Flow

**File**: `tests/integration/infiniteScroll.integration.test.ts`

#### Test Case 1.1: Loads more series on scroll

```typescript
it('should load more series when scrolling near bottom', async () => {
  const { getByTestId } = render(<SeriesGrid />);
  
  fireEvent.scroll(window, { y: window.innerHeight - 150 });
  
  await waitFor(() => {
    expect(getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
```

#### Test Case 1.2: Maintains scroll position

```typescript
it('should restore scroll position on tab return', () => {
  sessionStorage.setItem('scroll_tab_reading', '500');
  
  render(<SeriesGrid />);
  
  expect(window.scrollY).toBe(500);
});
```

## Test Data

### Data Set 1: Large Library

```json
{
  "series": [
    { "id": "1", "title": "Series 1" },
    { "id": "2", "title": "Series 2" }
  ],
  "hasMore": true,
  "total": 150
}
```

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18

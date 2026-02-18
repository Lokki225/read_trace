# Test Scenarios: Series Card Component with Magazine-Style Layout

## Overview

**Feature**: Series Card Component with Magazine-Style Layout  
**Feature ID**: 3-2  
**Story**: 3-2  
**Last Updated**: 2026-02-18  

This document outlines comprehensive test scenarios for validating the series card component functionality.

## Test Strategy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \
    /        \ Integration Tests (30%)
   /          \
  /____________\
 /              \
/                \ Unit Tests (60%)
/__________________\
```

### Test Coverage Goals

- **Unit Tests**: 85%+ code coverage
- **Integration Tests**: 70%+ feature coverage
- **End-to-End Tests**: Critical user flows only

## Unit Tests

### Test Suite 1: SeriesCard Component

**File**: `tests/unit/SeriesCard.test.tsx`

#### Test Case 1.1: Renders with required props

```typescript
it('should render SeriesCard with title and cover image', () => {
  const series = {
    id: '1',
    title: 'Attack on Titan',
    cover_image_url: 'https://example.com/image.jpg',
    status: 'reading',
    progress_percentage: 45,
    genres: ['action', 'adventure'],
    platform: 'mangadex'
  };
  
  render(<SeriesCard series={series} />);
  
  expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
  expect(screen.getByAltText('Attack on Titan cover')).toBeInTheDocument();
});
```

**Purpose**: Verify basic rendering with all required data  
**Preconditions**: Valid series object with all fields  
**Expected Result**: Card renders with title and image  

#### Test Case 1.2: Displays fallback placeholder when image missing

```typescript
it('should show placeholder when cover_image_url is missing', () => {
  const series = {
    id: '1',
    title: 'Series Title',
    cover_image_url: undefined,
    status: 'reading',
    progress_percentage: 0,
    genres: [],
    platform: 'mangadex'
  };
  
  render(<SeriesCard series={series} />);
  
  expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
});
```

**Purpose**: Verify graceful handling of missing images  
**Preconditions**: Series without cover_image_url  
**Expected Result**: Placeholder displays instead of broken image  

#### Test Case 1.3: Shows genres and platform information

```typescript
it('should display genres and platform', () => {
  const series = {
    id: '1',
    title: 'Series',
    cover_image_url: 'https://example.com/image.jpg',
    status: 'reading',
    progress_percentage: 50,
    genres: ['action', 'adventure', 'supernatural'],
    platform: 'mangadex'
  };
  
  render(<SeriesCard series={series} />);
  
  expect(screen.getByText('action')).toBeInTheDocument();
  expect(screen.getByText('adventure')).toBeInTheDocument();
  expect(screen.getByText('mangadex')).toBeInTheDocument();
});
```

**Purpose**: Verify metadata display  
**Preconditions**: Series with genres and platform  
**Expected Result**: All metadata displays correctly  

#### Test Case 1.4: Renders correct status badge with color

```typescript
it('should render status badge with correct color', () => {
  const series = {
    id: '1',
    title: 'Series',
    cover_image_url: 'https://example.com/image.jpg',
    status: 'completed',
    progress_percentage: 100,
    genres: [],
    platform: 'mangadex'
  };
  
  render(<SeriesCard series={series} />);
  
  const badge = screen.getByTestId('status-badge');
  expect(badge).toHaveTextContent('Completed');
  expect(badge).toHaveClass('bg-green-500');
});
```

**Purpose**: Verify status badge rendering and styling  
**Preconditions**: Series with different status values  
**Expected Result**: Badge displays with correct label and color  

### Test Suite 2: ProgressBar Component

**File**: `tests/unit/ProgressBar.test.tsx`

#### Test Case 2.1: Displays progress percentage correctly

```typescript
it('should display progress bar at correct percentage', () => {
  render(<ProgressBar percentage={65} />);
  
  const bar = screen.getByTestId('progress-fill');
  expect(bar).toHaveStyle({ width: '65%' });
  expect(screen.getByText('65%')).toBeInTheDocument();
});
```

**Purpose**: Verify progress calculation and display  
**Preconditions**: Progress percentage 0-100  
**Expected Result**: Bar fills proportionally, percentage displays  

#### Test Case 2.2: Handles edge cases (0% and 100%)

```typescript
it('should handle 0% and 100% progress', () => {
  const { rerender } = render(<ProgressBar percentage={0} />);
  expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '0%' });
  
  rerender(<ProgressBar percentage={100} />);
  expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '100%' });
});
```

**Purpose**: Verify edge case handling  
**Preconditions**: Progress at boundaries (0%, 100%)  
**Expected Result**: Bar displays correctly at extremes  

### Test Suite 3: StatusBadge Component

**File**: `tests/unit/StatusBadge.test.tsx`

#### Test Case 3.1: Renders all status types with correct colors

```typescript
it('should render all status types with correct colors', () => {
  const statuses = [
    { status: 'reading', color: 'bg-orange-500' },
    { status: 'completed', color: 'bg-green-500' },
    { status: 'onHold', color: 'bg-yellow-500' },
    { status: 'planToRead', color: 'bg-gray-500' }
  ];
  
  statuses.forEach(({ status, color }) => {
    const { unmount } = render(<StatusBadge status={status} />);
    expect(screen.getByTestId('status-badge')).toHaveClass(color);
    unmount();
  });
});
```

**Purpose**: Verify all status types render with correct styling  
**Preconditions**: Each status type  
**Expected Result**: Badge displays with appropriate color  

## Integration Tests

### Integration Test Suite 1: SeriesGrid Layout

**File**: `tests/integration/SeriesGrid.integration.test.ts`

#### Test Case 1.1: Grid adapts to screen size

```typescript
it('should render correct number of columns on different screen sizes', () => {
  const series = Array.from({ length: 20 }, (_, i) => ({
    id: `${i}`,
    title: `Series ${i}`,
    cover_image_url: 'https://example.com/image.jpg',
    status: 'reading',
    progress_percentage: 50,
    genres: [],
    platform: 'mangadex'
  }));
  
  // Mobile: 1-2 columns
  window.innerWidth = 375;
  render(<SeriesGrid series={series} />);
  const grid = screen.getByTestId('series-grid');
  expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
  
  // Desktop: 4-5 columns
  window.innerWidth = 1440;
  expect(grid).toHaveClass('lg:grid-cols-4', 'xl:grid-cols-5');
});
```

**Purpose**: Verify responsive grid layout  
**Components Involved**: SeriesGrid, SeriesCard  
**Preconditions**: Multiple series, different viewport sizes  
**Expected Result**: Grid columns adjust per breakpoint  

#### Test Case 1.2: Cards render with proper spacing

```typescript
it('should apply correct gap between cards', () => {
  const series = Array.from({ length: 10 }, (_, i) => ({
    id: `${i}`,
    title: `Series ${i}`,
    cover_image_url: 'https://example.com/image.jpg',
    status: 'reading',
    progress_percentage: 50,
    genres: [],
    platform: 'mangadex'
  }));
  
  render(<SeriesGrid series={series} />);
  
  const grid = screen.getByTestId('series-grid');
  expect(grid).toHaveClass('gap-4');
});
```

**Purpose**: Verify spacing consistency  
**Components Involved**: SeriesGrid  
**Preconditions**: Multiple series  
**Expected Result**: Proper gap applied between cards  

## Error Handling Tests

### Error Test Suite 1: Missing Data

#### Test Case 1.1: Handles missing optional fields

```typescript
it('should handle series with missing optional fields', () => {
  const series = {
    id: '1',
    title: 'Series',
    cover_image_url: undefined,
    status: 'reading',
    progress_percentage: 0,
    genres: [],
    platform: 'unknown'
  };
  
  expect(() => render(<SeriesCard series={series} />)).not.toThrow();
  expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
});
```

**Error Type**: Missing optional data  
**Trigger Condition**: Series without cover_image_url or genres  
**Expected Behavior**: Component renders with fallbacks  
**Error Message**: No error, graceful degradation  

## Accessibility Tests

### Accessibility Test Suite 1: WCAG Compliance

#### Test Case 1.1: Keyboard navigation works

```typescript
it('should be navigable via keyboard', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  
  // Tab to first card
  await page.keyboard.press('Tab');
  const firstCard = page.locator('[data-testid="series-card-0"]');
  await expect(firstCard).toBeFocused();
  
  // Tab to next card
  await page.keyboard.press('Tab');
  const secondCard = page.locator('[data-testid="series-card-1"]');
  await expect(secondCard).toBeFocused();
});
```

**Purpose**: Verify keyboard accessibility  
**Standard**: WCAG 2.1 Level AA  

#### Test Case 1.2: Color contrast meets WCAG AA

```typescript
it('should have sufficient color contrast', async () => {
  render(<SeriesCard series={mockSeries} />);
  
  const title = screen.getByText('Series Title');
  const styles = window.getComputedStyle(title);
  
  // Verify contrast ratio >= 4.5:1
  const contrastRatio = calculateContrastRatio(styles.color, styles.backgroundColor);
  expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
});
```

**Purpose**: Verify color contrast compliance  
**Standard**: WCAG 2.1 Level AA  

## Test Data

### Data Set 1: Valid Series

```json
{
  "id": "1",
  "title": "Attack on Titan",
  "cover_image_url": "https://example.com/aot.jpg",
  "status": "reading",
  "progress_percentage": 65,
  "genres": ["action", "adventure", "supernatural"],
  "platform": "mangadex",
  "current_chapter": 130,
  "total_chapters": 139
}
```

**Usage**: All positive test cases  
**Validity**: Valid, expected to pass  

### Data Set 2: Minimal Series

```json
{
  "id": "2",
  "title": "Minimal Series",
  "cover_image_url": null,
  "status": "planToRead",
  "progress_percentage": 0,
  "genres": [],
  "platform": "unknown"
}
```

**Usage**: Edge case and error handling tests  
**Validity**: Valid but minimal, tests fallbacks  

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern="unit"

# Run integration tests
npm test -- --testPathPattern="integration"

# Run tests with coverage
npm test -- --coverage
```

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | |
| Tech Lead | | | |

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18  
**Next Review**: 2026-02-25

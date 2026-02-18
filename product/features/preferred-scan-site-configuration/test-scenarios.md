# Test Scenarios: Preferred Scan Site Configuration

## Overview

**Feature**: Preferred Scan Site Configuration  
**Feature ID**: 3-6  
**Story**: 3-6  
**Last Updated**: 2026-02-18  

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - Form logic, reordering
- **Integration Tests**: 30% - Save and extension integration
- **E2E Tests**: 10% - Full user journey

## Unit Tests

### Test Suite 1: PreferredSitesForm Component

**File**: `tests/unit/PreferredSitesForm.test.tsx`

#### Test Case 1.1: Renders all platforms

```typescript
it('should render all supported platforms', () => {
  render(<PreferredSitesForm />);
  expect(screen.getByLabelText(/mangadex/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
});
```

#### Test Case 1.2: Handles drag-and-drop

```typescript
it('should reorder platforms on drag', () => {
  render(<PreferredSitesForm />);
  
  const mangadex = screen.getByTestId('platform-mangadex');
  const other = screen.getByTestId('platform-other');
  
  // Simulate drag
  fireEvent.dragStart(mangadex);
  fireEvent.drop(other);
  
  // Verify order changed
  expect(mockStore.setPreferences).toHaveBeenCalled();
});
```

### Test Suite 2: Preference Logic

**File**: `tests/unit/preferences.test.ts`

#### Test Case 2.1: Validates preferences

```typescript
it('should validate preference order', () => {
  const prefs = ['mangadex', 'other'];
  expect(validatePreferences(prefs)).toBe(true);
});
```

## Integration Tests

### Integration Test Suite 1: Save and Sync

**File**: `tests/integration/sitePreferences.integration.test.ts`

#### Test Case 1.1: Saves preferences to Supabase

```typescript
it('should save preferences to Supabase', async () => {
  render(<PreferredSitesForm />);
  
  fireEvent.click(screen.getByText(/save/i));
  
  await waitFor(() => {
    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
  });
});
```

#### Test Case 1.2: Extension uses preferences

```typescript
it('should sync preferences to extension', async () => {
  render(<PreferredSitesForm />);
  
  fireEvent.click(screen.getByText(/save/i));
  
  await waitFor(() => {
    expect(mockExtension.setPreferences).toHaveBeenCalled();
  });
});
```

## Test Data

### Data Set 1: Valid Preferences

```json
{
  "preferred_sites": ["mangadex", "other"],
  "updated_at": "2026-02-18T10:30:00Z"
}
```

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18

# Test Scenarios: Optional Bookmark & Spreadsheet Import

## Overview

**Feature**: Optional Bookmark & Spreadsheet Import  
**Feature ID**: data-import  
**Story**: 2-5  
**Last Updated**: 2026-02-10  

This document outlines comprehensive test scenarios for data import functionality.

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - CSV parsing, validation, deduplication
- **Integration Tests**: 30% - Import API, database operations
- **End-to-End Tests**: 10% - Complete import flow

### Test Coverage Goals

- Unit Tests: 85%+ code coverage
- Integration Tests: 80%+ feature coverage
- End-to-End Tests: Critical user flows only

## Unit Tests

### Test Suite 1: CSV Parsing

**File**: `src/__tests__/import/csv-parser.test.ts`

#### Test Case 1.1: Parse Valid CSV

```typescript
describe('CSV Parser', () => {
  it('should parse valid CSV file', () => {
    const csv = `title,chapter,date\nManga1,10,2026-01-01\nManga2,5,2026-01-02`;
    const result = parseCSV(csv);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ title: 'Manga1', chapter: '10', date: '2026-01-01' });
  });

  it('should handle CSV with headers', () => {
    const csv = `Series Title,Current Chapter,Last Read\nManga1,10,2026-01-01`;
    const result = parseCSV(csv);
    
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Manga1');
  });
});
```

**Purpose**: Verify CSV parsing accuracy  
**Preconditions**: CSV parser available  
**Expected Result**: CSV correctly parsed into objects  

### Test Suite 2: Data Validation

**File**: `src/__tests__/import/validation.test.ts`

#### Test Case 2.1: Validate Import Data

```typescript
describe('Import Data Validation', () => {
  it('should validate required fields', () => {
    const data = { title: 'Manga1', chapter: 10 };
    expect(validateImportData(data)).toBe(true);
  });

  it('should reject invalid chapter numbers', () => {
    const data = { title: 'Manga1', chapter: 'invalid' };
    expect(validateImportData(data)).toBe(false);
  });

  it('should reject missing title', () => {
    const data = { chapter: 10 };
    expect(validateImportData(data)).toBe(false);
  });
});
```

**Purpose**: Verify data validation rules  
**Preconditions**: Validation logic available  
**Expected Result**: Valid/invalid data correctly identified  

### Test Suite 3: Deduplication

**File**: `src/__tests__/import/deduplication.test.ts`

#### Test Case 3.1: Remove Duplicates

```typescript
describe('Deduplication', () => {
  it('should remove duplicate series', () => {
    const data = [
      { title: 'Manga1', chapter: 10 },
      { title: 'Manga1', chapter: 10 },
      { title: 'Manga2', chapter: 5 }
    ];
    
    const result = deduplicateImport(data);
    expect(result).toHaveLength(2);
  });

  it('should keep latest chapter for duplicates', () => {
    const data = [
      { title: 'Manga1', chapter: 5 },
      { title: 'Manga1', chapter: 10 }
    ];
    
    const result = deduplicateImport(data);
    expect(result[0].chapter).toBe(10);
  });
});
```

**Purpose**: Verify deduplication logic  
**Preconditions**: Deduplication function available  
**Expected Result**: Duplicates removed correctly  

## Integration Tests

### Test Suite 1: CSV Import API

**File**: `tests/integration/csv-import.integration.test.ts`

#### Test Case 1.1: Upload and Parse CSV

```typescript
describe('CSV Import API', () => {
  it('should upload and parse CSV file', async () => {
    const csvFile = new File(['title,chapter\nManga1,10'], 'test.csv');
    const formData = new FormData();
    formData.append('file', csvFile);
    
    const response = await fetch('/api/import/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.importId).toBeDefined();
    expect(result.items).toHaveLength(1);
  });

  it('should reject invalid CSV', async () => {
    const invalidFile = new File(['invalid data'], 'test.csv');
    const formData = new FormData();
    formData.append('file', invalidFile);
    
    const response = await fetch('/api/import/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    expect(response.status).toBe(400);
  });
});
```

**Purpose**: Verify CSV import API  
**Preconditions**: API available, authenticated user  
**Expected Result**: CSV uploaded and parsed correctly  

### Test Suite 2: Import Confirmation

**File**: `tests/integration/import-confirm.integration.test.ts`

#### Test Case 2.1: Confirm and Save Import

```typescript
describe('Import Confirmation', () => {
  it('should save confirmed import', async () => {
    const importId = 'import_123';
    
    const response = await fetch(`/api/import/${importId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.imported).toBeGreaterThan(0);
  });

  it('should handle import errors gracefully', async () => {
    const importId = 'invalid_id';
    
    const response = await fetch(`/api/import/${importId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(response.status).toBe(404);
  });
});
```

**Purpose**: Verify import confirmation and saving  
**Preconditions**: Import job exists, database available  
**Expected Result**: Import saved correctly  

## End-to-End Tests

### Test Suite 1: Complete Import Flow

**File**: `tests/e2e/import-flow.e2e.test.ts`

#### Test Case 1.1: CSV Import Flow

```typescript
describe('CSV Import Flow', () => {
  it('should complete full CSV import', async () => {
    // Navigate to import page
    await page.goto('http://localhost:3000/import');
    
    // Upload CSV file
    await page.setInputFiles('[data-testid="csv-upload"]', 'test-data.csv');
    
    // Wait for preview
    await page.waitForSelector('[data-testid="import-preview"]');
    
    // Verify preview shows data
    const preview = await page.textContent('[data-testid="import-preview"]');
    expect(preview).toContain('Manga1');
    
    // Confirm import
    await page.click('[data-testid="confirm-import"]');
    
    // Verify success
    const success = await page.$('[data-testid="success-message"]');
    expect(success).toBeTruthy();
  });
});
```

**Purpose**: Verify complete CSV import flow  
**Preconditions**: App running, user authenticated  
**Expected Result**: CSV imported successfully  

#### Test Case 1.2: Browser History Import Flow

```typescript
describe('Browser History Import Flow', () => {
  it('should import from browser history', async () => {
    await page.goto('http://localhost:3000/import');
    
    // Select browser history option
    await page.click('[data-testid="browser-history-option"]');
    
    // Authorize access
    await page.click('[data-testid="authorize-history"]');
    
    // Wait for processing
    await page.waitForSelector('[data-testid="import-preview"]', { timeout: 5000 });
    
    // Confirm import
    await page.click('[data-testid="confirm-import"]');
    
    // Verify success
    const success = await page.$('[data-testid="success-message"]');
    expect(success).toBeTruthy();
  });
});
```

**Purpose**: Verify browser history import flow  
**Preconditions**: App running, user authenticated  
**Expected Result**: History imported successfully  

## Manual Testing Scenarios

### Scenario 1: CSV Import

**Steps**:
1. Navigate to import page
2. Select "Import from CSV"
3. Upload valid CSV file
4. Review preview
5. Confirm import
6. Verify success message
7. Check dashboard for imported series

**Expected Result**: Series imported and visible in dashboard

### Scenario 2: Invalid CSV Handling

**Steps**:
1. Navigate to import page
2. Upload invalid CSV file
3. Observe error message
4. Verify error is clear and actionable

**Expected Result**: Clear error message, user can retry

### Scenario 3: Duplicate Handling

**Steps**:
1. Import CSV with duplicate series
2. Review preview showing deduplication
3. Confirm import
4. Verify only unique series imported

**Expected Result**: Duplicates removed, only unique series saved

### Scenario 4: Large File Import

**Steps**:
1. Upload CSV with 1000+ series
2. Monitor import progress
3. Verify completion
4. Check all series imported

**Expected Result**: Large imports handled efficiently

## Test Data

### Sample CSV Format

```csv
title,chapter,date,platform
Manga Title 1,10,2026-01-01,MangaDex
Manga Title 2,5,2025-12-15,MangaDex
Manga Title 3,25,2025-11-20,Other
```

### Test Files

```typescript
export const validCSV = `title,chapter,date\nManga1,10,2026-01-01\nManga2,5,2026-01-02`;

export const invalidCSV = `invalid,data,format\nno,chapter,field`;

export const largeCSV = generateCSVWithNRows(1000);
```

## Performance Testing

### Import Performance

- **CSV parsing**: <30 seconds for 1000 items
- **Data validation**: <10 seconds
- **Deduplication**: <5 seconds
- **Bulk insert**: <30 seconds
- **Total flow**: <3 minutes

### File Size Limits

- **Maximum file size**: 5MB
- **Maximum rows**: 10,000
- **Timeout**: 5 minutes

---

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-10  
**Next Review**: 2026-03-10

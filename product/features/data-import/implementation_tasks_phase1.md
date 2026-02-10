# Implementation Tasks - Phase 1: Domain Layer

**Feature**: Optional Bookmark & Spreadsheet Import  
**Phase**: Domain Layer (Business Logic & Validation)  
**Dependencies**: None  
**Estimated Duration**: 1 day

## Phase Overview

Phase 1 establishes the foundational business logic for data import. This phase focuses on CSV parsing, data validation, and deduplication logic.

## Phase Completion Criteria

- [ ] CSV parsing logic implemented
- [ ] Data validation logic implemented
- [ ] Deduplication logic implemented
- [ ] Unit tests passing (>85% coverage)
- [ ] No dependencies on UI or database

---

## Task 1.1: Implement CSV Parsing Logic

**File**: `backend/services/import/csvParser.ts`

**Description**: Create functions for parsing CSV files.

**Acceptance Criteria**:
- Parse CSV with configurable delimiters
- Handle different encodings
- Extract headers and data rows
- Clear error messages for invalid CSV

**Implementation Details**:
```typescript
// backend/services/import/csvParser.ts

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export function parseCSV(
  csvContent: string,
  delimiter: string = ','
): ParseResult {
  const errors: string[] = [];
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    errors.push('CSV must contain header and at least one data row');
    return { headers: [], rows: [], errors };
  }
  
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      continue;
    }
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }
  
  return { headers, rows, errors };
}
```

**Verification**:
```bash
npm run test -- csvParser.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.2: Implement Data Validation Logic

**File**: `backend/services/import/dataValidator.ts`

**Description**: Create functions for validating imported data.

**Acceptance Criteria**:
- Validate required fields
- Validate data types
- Validate field formats
- Clear error messages

**Implementation Details**:
```typescript
// backend/services/import/dataValidator.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateImportData(
  row: Record<string, string>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate title
  if (!row.title || row.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  // Validate chapter
  if (row.chapter) {
    if (isNaN(Number(row.chapter))) {
      errors.push('Chapter must be a number');
    }
  } else {
    warnings.push('Chapter not provided');
  }
  
  // Validate date format
  if (row.date) {
    if (isNaN(Date.parse(row.date))) {
      errors.push('Invalid date format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

**Verification**:
```bash
npm run test -- dataValidator.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.3: Implement Deduplication Logic

**File**: `backend/services/import/deduplicator.ts`

**Description**: Create functions for removing duplicate entries.

**Acceptance Criteria**:
- Detect duplicate series by title
- Keep latest chapter for duplicates
- Merge metadata from duplicates
- Clear error messages

**Implementation Details**:
```typescript
// backend/services/import/deduplicator.ts

export interface ImportRow {
  title: string;
  chapter?: number;
  date?: Date;
  [key: string]: any;
}

export function deduplicateImport(rows: ImportRow[]): ImportRow[] {
  const seen = new Map<string, ImportRow>();
  
  for (const row of rows) {
    const key = row.title.toLowerCase().trim();
    
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      
      // Keep the row with the higher chapter number
      if (row.chapter && existing.chapter) {
        if (row.chapter > existing.chapter) {
          seen.set(key, row);
        }
      } else if (row.chapter) {
        seen.set(key, row);
      }
    } else {
      seen.set(key, row);
    }
  }
  
  return Array.from(seen.values());
}
```

**Verification**:
```bash
npm run test -- deduplicator.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Phase 1 Completion Checklist

- [ ] CSV parsing logic implemented
- [ ] Data validation logic implemented
- [ ] Deduplication logic implemented
- [ ] All unit tests passing (>85% coverage)
- [ ] No external dependencies in this phase
- [ ] Code review approved
- [ ] Ready for Phase 2

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]

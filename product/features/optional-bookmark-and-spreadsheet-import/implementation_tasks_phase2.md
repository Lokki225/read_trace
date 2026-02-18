# Implementation Tasks - Phase 2: API Layer

**Feature**: Optional Bookmark & Spreadsheet Import  
**Phase**: API Layer (Endpoints & Integration)  
**Dependencies**: Phase 1 (Domain Layer)  
**Estimated Duration**: 1-2 days

## Phase Overview

Phase 2 implements the API endpoints for file upload, import processing, and status tracking. This phase integrates the domain logic from Phase 1 with the backend API.

## Phase Completion Criteria

- [ ] File upload endpoint implemented
- [ ] Import processing endpoint implemented
- [ ] Import status endpoint implemented
- [ ] Import preview endpoint implemented
- [ ] Import confirmation endpoint implemented
- [ ] Integration tests passing (>80% coverage)
- [ ] API documentation complete

---

## Task 2.1: Implement File Upload Endpoint

**File**: `src/app/api/import/upload/route.ts`

**Description**: Create API endpoint for CSV file uploads.

**Acceptance Criteria**:
- Accept multipart/form-data requests
- Validate file type (CSV only)
- Enforce file size limit (5MB)
- Return import job ID
- Handle errors gracefully

**Implementation Details**:
```typescript
// src/app/api/import/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/backend/services/import/csvParser';
import { validateImportData } from '@/backend/services/import/dataValidator';
import { deduplicateImport } from '@/backend/services/import/deduplicator';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 413 }
      );
    }
    
    // Read file content
    const csvContent = await file.text();
    
    // Parse CSV
    const parseResult = parseCSV(csvContent);
    
    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      );
    }
    
    // Validate data
    const validatedRows = [];
    const validationErrors = [];
    
    for (const row of parseResult.rows) {
      const validation = validateImportData(row);
      if (validation.isValid) {
        validatedRows.push(row);
      } else {
        validationErrors.push({
          row,
          errors: validation.errors
        });
      }
    }
    
    // Deduplicate
    const deduplicatedRows = deduplicateImport(validatedRows);
    
    // Create import job
    const importId = crypto.randomUUID();
    
    // TODO: Save to database in Phase 3
    
    return NextResponse.json({
      import_id: importId,
      status: 'pending',
      total_items: parseResult.rows.length,
      valid_items: validatedRows.length,
      invalid_items: validationErrors.length,
      duplicate_items: validatedRows.length - deduplicatedRows.length
    });
  } catch (error) {
    console.error('Import upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl -X POST http://localhost:3000/api/import/upload \
  -F "file=@test.csv"
```

**Dependencies**: Phase 1 (csvParser, dataValidator, deduplicator)

**Estimated Time**: 2 hours

---

## Task 2.2: Implement Import Status Endpoint

**File**: `src/app/api/import/[import_id]/route.ts`

**Description**: Create API endpoint to retrieve import job status.

**Acceptance Criteria**:
- Return import job details
- Return processing status
- Return item counts
- Handle not found errors

**Implementation Details**:
```typescript
// src/app/api/import/[import_id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { import_id: string } }
) {
  try {
    const { import_id } = params;
    
    // TODO: Fetch from database in Phase 3
    // Mock response for now
    
    return NextResponse.json({
      import_id,
      status: 'pending',
      total_items: 100,
      imported_items: 0,
      skipped_items: 5,
      error_items: 2,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Import status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl http://localhost:3000/api/import/[import_id]
```

**Dependencies**: Phase 1

**Estimated Time**: 1 hour

---

## Task 2.3: Implement Import Preview Endpoint

**File**: `src/app/api/import/[import_id]/preview/route.ts`

**Description**: Create API endpoint to preview import data before confirmation.

**Acceptance Criteria**:
- Return validated import data
- Return error details for invalid items
- Return duplicate information
- Paginate results

**Implementation Details**:
```typescript
// src/app/api/import/[import_id]/preview/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { import_id: string } }
) {
  try {
    const { import_id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // TODO: Fetch from database in Phase 3
    // Mock response for now
    
    return NextResponse.json({
      import_id,
      page,
      limit,
      total: 100,
      items: [
        {
          title: 'One Piece',
          chapter: 1087,
          status: 'valid',
          platform: 'MangaPlus'
        },
        {
          title: 'My Hero Academia',
          chapter: 410,
          status: 'valid',
          platform: 'MangaDex'
        }
      ]
    });
  } catch (error) {
    console.error('Import preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl http://localhost:3000/api/import/[import_id]/preview?page=1&limit=50
```

**Dependencies**: Phase 1

**Estimated Time**: 2 hours

---

## Task 2.4: Implement Import Confirmation Endpoint

**File**: `src/app/api/import/[import_id]/confirm/route.ts`

**Description**: Create API endpoint to confirm and execute import.

**Acceptance Criteria**:
- Validate import_id exists
- Prevent duplicate confirmations
- Trigger bulk insert process
- Return success summary

**Implementation Details**:
```typescript
// src/app/api/import/[import_id]/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { import_id: string } }
) {
  try {
    const { import_id } = params;
    
    // TODO: Fetch import data from database in Phase 3
    // TODO: Execute bulk insert in Phase 3
    
    return NextResponse.json({
      import_id,
      status: 'completed',
      imported_items: 95,
      skipped_items: 5,
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Import confirm error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl -X POST http://localhost:3000/api/import/[import_id]/confirm
```

**Dependencies**: Phase 1

**Estimated Time**: 1 hour

---

## Task 2.5: Implement Browser History Import Endpoint

**File**: `src/app/api/import/browser-history/route.ts`

**Description**: Create API endpoint for browser history import.

**Acceptance Criteria**:
- Accept browser history JSON
- Extract series URLs
- Match URLs to platforms
- Return matched series

**Implementation Details**:
```typescript
// src/app/api/import/browser-history/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { history } = await request.json();
    
    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: 'Invalid history format' },
        { status: 400 }
      );
    }
    
    // TODO: Implement URL matching in Phase 3
    
    return NextResponse.json({
      matched_urls: 0,
      unmatched_urls: 0,
      series: []
    });
  } catch (error) {
    console.error('Browser history import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl -X POST http://localhost:3000/api/import/browser-history \
  -H "Content-Type: application/json" \
  -d '{"history": []}'
```

**Dependencies**: Phase 1

**Estimated Time**: 2 hours

---

## Phase 2 Completion Checklist

- [ ] File upload endpoint implemented
- [ ] Import status endpoint implemented
- [ ] Import preview endpoint implemented
- [ ] Import confirmation endpoint implemented
- [ ] Browser history endpoint implemented
- [ ] All integration tests passing (>80% coverage)
- [ ] API documentation complete
- [ ] Error handling tested
- [ ] Code review approved
- [ ] Ready for Phase 3

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]

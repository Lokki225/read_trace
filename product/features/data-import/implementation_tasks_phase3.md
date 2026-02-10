# Implementation Tasks - Phase 3: Database Integration

**Feature**: Optional Bookmark & Spreadsheet Import  
**Phase**: Database Integration (Persistence Layer)  
**Dependencies**: Phase 1 (Domain Layer), Phase 2 (API Layer)  
**Estimated Duration**: 2 days

## Phase Overview

Phase 3 implements database schema, migrations, and persistence logic for import jobs and imported series. This phase connects the API endpoints from Phase 2 to the database.

## Phase Completion Criteria

- [ ] Database schema created
- [ ] Migration files created and applied
- [ ] Import job CRUD operations implemented
- [ ] Bulk insert logic implemented
- [ ] RLS policies configured
- [ ] Database tests passing (>85% coverage)

---

## Task 3.1: Create Database Schema

**File**: `database/migrations/004_import_jobs.sql`

**Description**: Create database tables for import functionality.

**Acceptance Criteria**:
- import_jobs table created
- imported_series table created
- Indexes created for performance
- Foreign keys configured

**Implementation Details**:
```sql
-- database/migrations/004_import_jobs.sql

-- Import Jobs Table
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('csv', 'browser_history')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_items INTEGER NOT NULL DEFAULT 0,
  imported_items INTEGER NOT NULL DEFAULT 0,
  skipped_items INTEGER NOT NULL DEFAULT 0,
  error_items INTEGER NOT NULL DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Imported Series Table
CREATE TABLE imported_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  original_title VARCHAR(255) NOT NULL,
  matched_title VARCHAR(255),
  chapter_number DECIMAL,
  platform VARCHAR(100),
  source_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'imported', 'skipped', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_import_jobs_user_id ON import_jobs(user_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_created_at ON import_jobs(created_at DESC);
CREATE INDEX idx_imported_series_import_id ON imported_series(import_id);
CREATE INDEX idx_imported_series_status ON imported_series(status);

-- Row Level Security (RLS)
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_series ENABLE ROW LEVEL SECURITY;

-- RLS Policies for import_jobs
CREATE POLICY "Users can view own import jobs"
  ON import_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own import jobs"
  ON import_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import jobs"
  ON import_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for imported_series
CREATE POLICY "Users can view own imported series"
  ON imported_series FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM import_jobs
      WHERE import_jobs.id = imported_series.import_id
      AND import_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create imported series for own jobs"
  ON imported_series FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM import_jobs
      WHERE import_jobs.id = imported_series.import_id
      AND import_jobs.user_id = auth.uid()
    )
  );
```

**Verification**:
```bash
supabase db push
```

**Dependencies**: Supabase configured

**Estimated Time**: 1 hour

---

## Task 3.2: Implement Import Job Repository

**File**: `backend/repositories/importJobRepository.ts`

**Description**: Create repository for import job database operations.

**Acceptance Criteria**:
- Create import job
- Get import job by ID
- Update import job status
- List user import jobs

**Implementation Details**:
```typescript
// backend/repositories/importJobRepository.ts

import { createClient } from '@/lib/supabase/server';

export interface ImportJob {
  id: string;
  user_id: string;
  source_type: 'csv' | 'browser_history';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_items: number;
  imported_items: number;
  skipped_items: number;
  error_items: number;
  error_details?: any;
  created_at: string;
  completed_at?: string;
}

export async function createImportJob(
  userId: string,
  sourceType: 'csv' | 'browser_history',
  totalItems: number
): Promise<ImportJob> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('import_jobs')
    .insert({
      user_id: userId,
      source_type: sourceType,
      total_items: totalItems,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getImportJob(importId: string): Promise<ImportJob | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('id', importId)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateImportJobStatus(
  importId: string,
  status: ImportJob['status'],
  counts?: {
    imported_items?: number;
    skipped_items?: number;
    error_items?: number;
  }
): Promise<void> {
  const supabase = createClient();
  
  const updates: any = { status };
  
  if (counts) {
    Object.assign(updates, counts);
  }
  
  if (status === 'completed' || status === 'failed') {
    updates.completed_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('import_jobs')
    .update(updates)
    .eq('id', importId);
  
  if (error) throw error;
}

export async function listUserImportJobs(userId: string): Promise<ImportJob[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

**Verification**:
```bash
npm run test -- importJobRepository.test.ts
```

**Dependencies**: Supabase client, Phase 3.1

**Estimated Time**: 2 hours

---

## Task 3.3: Implement Imported Series Repository

**File**: `backend/repositories/importedSeriesRepository.ts`

**Description**: Create repository for imported series database operations.

**Acceptance Criteria**:
- Bulk insert imported series
- Get series by import ID
- Update series status
- Delete series by import ID

**Implementation Details**:
```typescript
// backend/repositories/importedSeriesRepository.ts

import { createClient } from '@/lib/supabase/server';

export interface ImportedSeries {
  id: string;
  import_id: string;
  original_title: string;
  matched_title?: string;
  chapter_number?: number;
  platform?: string;
  source_url?: string;
  status: 'pending' | 'imported' | 'skipped' | 'error';
  error_message?: string;
  created_at: string;
}

export async function bulkInsertImportedSeries(
  importId: string,
  series: Array<Omit<ImportedSeries, 'id' | 'import_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient();
  
  const rows = series.map(s => ({
    import_id: importId,
    ...s
  }));
  
  const { error } = await supabase
    .from('imported_series')
    .insert(rows);
  
  if (error) throw error;
}

export async function getImportedSeriesByImportId(
  importId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ data: ImportedSeries[]; total: number }> {
  const supabase = createClient();
  
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('imported_series')
    .select('*', { count: 'exact' })
    .eq('import_id', importId)
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  
  return {
    data: data || [],
    total: count || 0
  };
}
```

**Verification**:
```bash
npm run test -- importedSeriesRepository.test.ts
```

**Dependencies**: Supabase client, Phase 3.1

**Estimated Time**: 2 hours

---

## Task 3.4: Update API Endpoints with Database Integration

**File**: Multiple API route files

**Description**: Connect Phase 2 API endpoints to database repositories.

**Acceptance Criteria**:
- Upload endpoint saves to database
- Status endpoint reads from database
- Preview endpoint reads from database
- Confirm endpoint updates database

**Implementation Details**:
Update `src/app/api/import/upload/route.ts`:
```typescript
// Add database integration
import { createImportJob, bulkInsertImportedSeries } from '@/backend/repositories';

// In POST handler, after deduplication:
const importJob = await createImportJob(
  userId,
  'csv',
  parseResult.rows.length
);

const seriesData = deduplicatedRows.map(row => ({
  original_title: row.title,
  chapter_number: row.chapter ? Number(row.chapter) : undefined,
  status: 'pending' as const
}));

await bulkInsertImportedSeries(importJob.id, seriesData);

return NextResponse.json({
  import_id: importJob.id,
  status: importJob.status,
  total_items: importJob.total_items
});
```

**Verification**:
```bash
npm run test -- integration/import-api.test.ts
```

**Dependencies**: Phase 3.1, Phase 3.2, Phase 3.3

**Estimated Time**: 3 hours

---

## Phase 3 Completion Checklist

- [ ] Database schema created and migrated
- [ ] Import job repository implemented
- [ ] Imported series repository implemented
- [ ] API endpoints integrated with database
- [ ] RLS policies tested
- [ ] All database tests passing (>85% coverage)
- [ ] Performance tested with 1000+ entries
- [ ] Code review approved
- [ ] Ready for Phase 4

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]

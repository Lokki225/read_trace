# Story 2.5: Optional Bookmark & Spreadsheet Import

Status: ready-for-dev

## Story

As a returning user with existing reading data,
I want to import my reading history from bookmarks or spreadsheets,
So that I don't lose my reading progress when switching to ReadTrace.

## Acceptance Criteria

1. **Given** I am in the onboarding flow
   **When** I select the import option
   **Then** I can upload a CSV file or authorize browser history access
   **And** ReadTrace parses the data to extract series and chapter information
   **And** imported data is validated and deduplicated
   **And** I can review and confirm the imported series before saving
   **And** imported data is saved to my Supabase account with proper associations

## Tasks / Subtasks

- [ ] Create import UI component (AC: 1)
  - [ ] Design import option in onboarding flow
  - [ ] Add file upload interface for CSV
  - [ ] Add browser history authorization option
  - [ ] Create import type selection (CSV vs browser history)
- [ ] Implement CSV file parsing (AC: 1)
  - [ ] Define expected CSV format and schema
  - [ ] Implement CSV parser with validation
  - [ ] Extract series title, chapter, URL from CSV
  - [ ] Handle malformed CSV data gracefully
- [ ] Implement browser history import (AC: 1)
  - [ ] Request browser history permission
  - [ ] Filter history for scanlation site URLs
  - [ ] Extract series and chapter from URLs
  - [ ] Support MangaDex and other platform URL formats
- [ ] Add data validation and deduplication (AC: 1)
  - [ ] Validate series titles against known databases (optional)
  - [ ] Detect duplicate series entries
  - [ ] Normalize series titles (case, spacing)
  - [ ] Identify incomplete or invalid entries
- [ ] Create import preview and confirmation (AC: 1)
  - [ ] Display parsed series in preview table
  - [ ] Allow users to edit/remove entries before import
  - [ ] Show import summary (X series found, Y duplicates)
  - [ ] Provide confirm and cancel actions
- [ ] Implement data persistence (AC: 1)
  - [ ] Save imported series to user_series table
  - [ ] Create reading_progress records for each series
  - [ ] Associate imports with user account
  - [ ] Handle import errors with rollback

## Dev Notes

### Technical Requirements

**Import Sources:** CSV files + Browser History
- CSV format: `title,chapter,url,platform,last_read_date`
- Browser history: Chrome History API (requires permissions)
- Supported platforms: MangaDex, other scanlation sites
- File size limit: 5MB for CSV uploads

**CSV Format Specification:**
```csv
Series Title,Chapter Number,URL,Platform,Last Read Date
"One Piece",1087,https://mangadex.org/chapter/...,MangaDex,2026-01-15
"Attack on Titan",139,https://example.com/aot/139,Other,2026-02-01
```

**Browser History Permissions:** Manifest V3
- `history` permission required in extension manifest
- Filter for scanlation site domains
- Extract series/chapter from URL patterns
- Respect user privacy (only import with consent)

**Frontend Framework:** Next.js 14+ App Router
- Import page: `src/app/onboarding/import/page.tsx`
- File upload with drag-and-drop support
- Client-side CSV parsing (Papa Parse library)
- Preview table with edit/delete functionality

**UI Components:** shadcn/ui + Tailwind CSS
- File upload component with drag-and-drop
- Table component for import preview
- Checkbox components for selection
- Button components for confirm/cancel actions

### Architecture Compliance

**BMAD Layer Boundaries:**
- **Frontend**: `src/app/onboarding/import/page.tsx` + `src/components/import/`
- **Backend**: `backend/services/import/importService.ts` (business logic)
- **API**: Supabase Client SDK for data persistence
- **Model**: `model/schemas/import.ts` (import data interfaces)
- **Database**: `user_series` + `reading_progress` tables

**Communication Flow:**
```
Import Page (src/app/)
  → File Upload / Browser History Request
  → CSV Parser / URL Extractor (client-side)
  → importService.validate (backend/services/import/)
  → Preview and Confirmation (client)
  → importService.persist (backend/services/import/)
  → Supabase (user_series + reading_progress tables)
```

**Forbidden Patterns:**
- Do NOT import without user review and confirmation
- Do NOT access browser history without explicit permission
- Do NOT save invalid or unverified data
- Do NOT expose user's full browsing history

### Library/Framework Requirements

**Required Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14",
  "zod": "^3.22.0"
}
```

**CSV Parsing Library:** Papa Parse
- Client-side CSV parsing
- Error handling for malformed files
- Streaming support for large files
- Type definitions for TypeScript

**Import Validation Schema (Zod):**
```typescript
const importEntrySchema = z.object({
  title: z.string().min(1).max(200),
  chapter: z.number().int().positive().optional(),
  url: z.string().url().optional(),
  platform: z.enum(['MangaDex', 'Other']).default('Other'),
  lastReadDate: z.string().datetime().optional()
});

const importDataSchema = z.array(importEntrySchema);
```

**URL Pattern Matching:**
```typescript
const platformPatterns = {
  mangadex: /mangadex\.org\/title\/([^\/]+)\/([^\/]+)/,
  // Add more platform patterns
};

function extractSeriesFromUrl(url: string): { title: string; chapter?: number } | null {
  // Extract series title and chapter from URL
}
```

### File Structure Requirements

**New Files to Create:**
```
src/
├── app/
│   └── onboarding/
│       └── import/
│           ├── page.tsx              # Import page
│           └── layout.tsx            # Import-specific layout
├── components/
│   └── import/
│       ├── ImportUpload.tsx          # File upload component
│       ├── BrowserHistoryImport.tsx  # Browser history import
│       ├── ImportPreview.tsx         # Preview table
│       ├── ImportSummary.tsx         # Import summary stats
│       └── ImportConfirmation.tsx    # Confirmation dialog
├── hooks/
│   ├── useCSVParser.ts               # CSV parsing hook
│   └── useBrowserHistory.ts          # Browser history access hook
backend/
├── services/
│   └── import/
│       ├── importService.ts          # Import business logic
│       ├── csvValidator.ts           # CSV validation
│       ├── urlExtractor.ts           # URL parsing and extraction
│       └── deduplication.ts          # Duplicate detection
model/
├── schemas/
│   └── import.ts                     # Import data interfaces
└── validation/
    └── importValidation.ts           # Zod validation schemas
database/
└── migrations/
    ├── 004_create_user_series.sql    # User series table
    └── 005_create_reading_progress.sql # Reading progress table
tests/
├── unit/
│   ├── csvParser.test.ts
│   ├── urlExtractor.test.ts
│   └── deduplication.test.ts
├── integration/
│   └── import-flow.integration.test.ts
└── __mocks__/
    └── importData.ts                 # Mock CSV and history data
```

**File Naming Conventions:**
- Components: PascalCase (`ImportUpload.tsx`)
- Services: camelCase (`importService.ts`)
- Hooks: camelCase with 'use' prefix (`useCSVParser.ts`)
- Types: PascalCase (`ImportEntry`, `ImportResult`)

### Testing Requirements

**Unit Tests Required:**
- CSV parsing with various formats
- URL extraction from different platforms
- Duplicate detection algorithm
- Data validation logic
- Error handling for malformed data

**Integration Tests Required:**
- Complete CSV import flow
- Browser history import flow
- Import preview and editing
- Data persistence to database
- Rollback on import failure

**Test Files:**
```
tests/
├── unit/
│   ├── csvParser.test.ts
│   ├── urlExtractor.test.ts
│   ├── deduplication.test.ts
│   └── importValidation.test.ts
├── integration/
│   ├── csv-import.integration.test.ts
│   └── history-import.integration.test.ts
└── __mocks__/
    ├── sampleImportCSV.ts
    └── mockBrowserHistory.ts
```

**Test Coverage Target:** 85% for import services

**Critical Test Scenarios:**
- Valid CSV file imports successfully
- Malformed CSV displays user-friendly errors
- Duplicate series are detected and flagged
- User can edit entries before import
- Import can be cancelled before saving
- Browser history permission handling
- URL extraction works for supported platforms
- Invalid entries are filtered out
- Database rollback on import error

### Previous Story Intelligence

**Story 2.1-2.4 Learnings:**
- User authentication and profiles established
- Supabase client SDK integration working
- File upload patterns can be reused
- Form validation with Zod established
- Toast notifications for user feedback
- Onboarding flow structure in place

**Key Patterns Established:**
- Multi-step onboarding wizard
- Form validation and error handling
- Data persistence with Supabase
- Optimistic UI updates
- Loading states and progress indicators

**Files to Reference:**
- `src/components/onboarding/OnboardingWizard.tsx` - Multi-step pattern
- `backend/services/auth/profileService.ts` - Data persistence patterns
- `database/migrations/` - Database schema patterns
- `src/store/authStore.ts` - User data management

**Database Schema to Extend:**
- `user_series` table for tracking series
- `reading_progress` table for chapter/page tracking
- Foreign keys to link series and progress
- RLS policies for user data isolation

### Latest Technical Information

**CSV Import Best Practices (2026):**
- Client-side parsing for better UX (no server upload delay)
- Streaming for large files (>1MB)
- Preview before import (always show user what will be imported)
- Validation with clear error messages
- Progress indicators for large imports
- Allow partial imports (import valid entries, skip invalid)

**Papa Parse Configuration:**
```typescript
import Papa from 'papaparse';

const parseCSV = (file: File) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};
```

**Browser History API (Chrome Extension):**
```typescript
// In extension background script
chrome.history.search({
  text: 'mangadex.org',
  maxResults: 1000,
  startTime: Date.now() - (90 * 24 * 60 * 60 * 1000) // Last 90 days
}, (results) => {
  const seriesUrls = results.filter(item => 
    item.url && /mangadex\.org\/title/.test(item.url)
  );
  // Process URLs
});
```

**URL Pattern Extraction Examples:**
```typescript
// MangaDex URL: https://mangadex.org/title/abc123/one-piece/chapter/def456
const mangadexPattern = /mangadex\.org\/title\/[^\/]+\/([^\/]+)(?:\/chapter\/[^\/]+)?/;

// Extract: { title: "one-piece", chapter: "def456" }
```

**Deduplication Strategy:**
- Normalize titles: lowercase, trim whitespace, remove special chars
- Compare normalized titles for exact matches
- Use Levenshtein distance for fuzzy matching (optional)
- Flag potential duplicates for user review
- Allow user to merge or keep separate

**Import Performance Optimization:**
- Batch inserts for database operations (100 records at a time)
- Use Supabase `upsert` to handle duplicates
- Client-side validation before server submission
- Debounce preview updates during editing
- Cancel ongoing imports if user navigates away

**Privacy and Security:**
- Never store full browser history
- Only import URLs user explicitly confirms
- Clear temporary import data after completion
- Encrypt sensitive data in transit
- Respect user's right to delete imported data

### Project Context Reference

**Product Layer:** `product/features/quick-onboarding/spec.md`
**Architecture:** `docs/contracts.md` - BMAD data flow
**User Personas:**
- Alex (college student): May have spreadsheet tracking
- Sam (working professional): Likely uses bookmarks for organization
- Jordan (return reader): Needs to import old reading lists

**Related Stories:**
- Story 2.4: Browser Extension Installation Guide (import can include extension data)
- Story 3.1: Dashboard Layout (displays imported series)
- Story 3.4: Series Progress Indicators (shows imported reading progress)

**Import Use Cases:**
- Migrating from manual spreadsheet tracking
- Importing bookmarks from browser
- Transferring data from other tracking apps
- Recovering reading history after device change

**Success Metrics:**
- 30%+ users utilize import feature during onboarding
- <2 minutes average import time (per PRD requirement)
- 95%+ successful import rate
- <1% data loss during import process

## Dev Agent Record

### Agent Model Used

<!-- Dev agent to fill in model name and version -->

### Debug Log References

<!-- Dev agent to add links to debug logs if needed -->

### Completion Notes List

<!-- Dev agent to document implementation notes and decisions -->

### File List

<!-- Dev agent to list all files created or modified -->

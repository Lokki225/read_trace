export type Platform = 'MangaDex' | 'Other';

export type ImportSource = 'csv' | 'browser_history';

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type EntryStatus = 'pending' | 'imported' | 'skipped' | 'error';

export interface RawImportEntry {
  title?: string;
  chapter?: number | string;
  url?: string;
  platform?: string;
  lastReadDate?: string;
}

export interface ValidatedImportEntry {
  id: string;
  title: string;
  normalizedTitle: string;
  chapter?: number;
  url?: string;
  platform: Platform;
  lastReadDate?: string;
}

export interface InvalidImportEntry {
  raw: RawImportEntry;
  errors: string[];
}

export interface ValidationResult {
  valid: ValidatedImportEntry[];
  invalid: InvalidImportEntry[];
}

export interface DuplicateGroup {
  entries: ValidatedImportEntry[];
}

export interface DeduplicationResult {
  unique: ValidatedImportEntry[];
  duplicates: ValidatedImportEntry[];
}

export interface FindDuplicatesResult {
  duplicateGroups: ValidatedImportEntry[][];
}

export interface ImportPreviewEntry extends ValidatedImportEntry {
  status: EntryStatus;
  isDuplicate: boolean;
  selected: boolean;
  errorMessage?: string;
}

export interface ImportJob {
  importId: string;
  userId: string;
  sourceType: ImportSource;
  status: ImportStatus;
  totalItems: number;
  importedItems: number;
  skippedItems: number;
  errorItems: number;
  createdAt: string;
  completedAt?: string;
  entries: ImportPreviewEntry[];
}

export interface ImportResult {
  success: boolean;
  importId: string;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}

export interface BrowserHistoryItem {
  url: string;
  title?: string;
  visitTime?: number;
}

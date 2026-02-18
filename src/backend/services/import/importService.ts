import Papa from 'papaparse';
import { validateImportData } from './csvValidator';
import { deduplicateEntries } from './deduplication';
import { extractSeriesFromUrl } from './urlExtractor';
import { normalizeTitle } from './deduplication';
import type {
  RawImportEntry,
  ValidatedImportEntry,
  ImportPreviewEntry,
  ImportJob,
  ImportResult,
  BrowserHistoryItem,
} from '../../../model/schemas/import';

export function parseCSVText(csvText: string): RawImportEntry[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  return result.data.map((row) => {
    const rawChapter = row['chapter_number'] || row['chapter'] || row['ch'] || '';
    const rawUrl = row['url'] || row['link'] || '';
    return {
      title: row['series_title'] || row['title'] || row['name'] || '',
      chapter: rawChapter ? Number(rawChapter) : undefined,
      url: rawUrl || undefined,
      platform: row['platform'] || undefined,
      lastReadDate: row['last_read_date'] || row['date'] || undefined,
    };
  });
}

export async function parseCSVFile(file: File): Promise<RawImportEntry[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const entries: RawImportEntry[] = results.data.map((row) => {
          const rawChapter = row['chapter_number'] || row['chapter'] || row['ch'] || '';
          const rawUrl = row['url'] || row['link'] || '';
          return {
            title: row['series_title'] || row['title'] || row['name'] || '',
            chapter: rawChapter ? Number(rawChapter) : undefined,
            url: rawUrl || undefined,
            platform: row['platform'] || undefined,
            lastReadDate: row['last_read_date'] || row['date'] || undefined,
          };
        });
        resolve(entries);
      },
      error: (error) => reject(new Error(error.message)),
    });
  });
}

export function extractFromBrowserHistory(
  historyItems: BrowserHistoryItem[]
): RawImportEntry[] {
  const entries: RawImportEntry[] = [];

  for (const item of historyItems) {
    const extracted = extractSeriesFromUrl(item.url);
    if (extracted) {
      entries.push({
        title: extracted.title,
        url: item.url,
        platform: extracted.platform,
        lastReadDate: item.visitTime
          ? new Date(item.visitTime).toISOString()
          : undefined,
      });
    }
  }

  return entries;
}

export function buildImportJob(
  userId: string,
  sourceType: 'csv' | 'browser_history',
  rawEntries: RawImportEntry[]
): ImportJob {
  const { valid, invalid } = validateImportData(rawEntries);
  const { unique, duplicates } = deduplicateEntries(valid);

  const duplicateIds = new Set(duplicates.map((d) => d.id));

  const entries: ImportPreviewEntry[] = [
    ...unique.map((e) => ({
      ...e,
      status: 'pending' as const,
      isDuplicate: false,
      selected: true,
    })),
    ...duplicates.map((e) => ({
      ...e,
      status: 'pending' as const,
      isDuplicate: true,
      selected: false,
    })),
    ...invalid.map((inv) => ({
      id: Math.random().toString(36).slice(2),
      title: String(inv.raw.title ?? ''),
      normalizedTitle: normalizeTitle(String(inv.raw.title ?? '')),
      platform: 'Other' as const,
      status: 'error' as const,
      isDuplicate: false,
      selected: false,
      errorMessage: inv.errors.join('; '),
    })),
  ];

  return {
    importId: Math.random().toString(36).slice(2) + Date.now().toString(36),
    userId,
    sourceType,
    status: 'pending',
    totalItems: rawEntries.length,
    importedItems: 0,
    skippedItems: duplicates.length + invalid.length,
    errorItems: invalid.length,
    createdAt: new Date().toISOString(),
    entries,
  };
}

export function getSelectedEntries(job: ImportJob): ValidatedImportEntry[] {
  return job.entries
    .filter((e) => e.selected && e.status !== 'error')
    .map(({ status, isDuplicate, selected, errorMessage, ...entry }) => entry);
}

export function updateEntrySelection(
  job: ImportJob,
  entryId: string,
  selected: boolean
): ImportJob {
  return {
    ...job,
    entries: job.entries.map((e) =>
      e.id === entryId ? { ...e, selected } : e
    ),
  };
}

export function removeEntry(job: ImportJob, entryId: string): ImportJob {
  return {
    ...job,
    entries: job.entries.filter((e) => e.id !== entryId),
    totalItems: job.totalItems - 1,
  };
}

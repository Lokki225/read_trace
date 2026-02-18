import type { ValidatedImportEntry, DeduplicationResult, FindDuplicatesResult } from '../../../model/schemas/import';

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findDuplicates(entries: ValidatedImportEntry[]): FindDuplicatesResult {
  const groups = new Map<string, ValidatedImportEntry[]>();

  for (const entry of entries) {
    const key = entry.normalizedTitle;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  }

  const duplicateGroups: ValidatedImportEntry[][] = [];
  for (const group of groups.values()) {
    if (group.length > 1) {
      duplicateGroups.push(group);
    }
  }

  return { duplicateGroups };
}

export function deduplicateEntries(entries: ValidatedImportEntry[]): DeduplicationResult {
  const groups = new Map<string, ValidatedImportEntry[]>();

  for (const entry of entries) {
    const key = entry.normalizedTitle;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  }

  const unique: ValidatedImportEntry[] = [];
  const duplicates: ValidatedImportEntry[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      unique.push(group[0]);
    } else {
      const sorted = [...group].sort((a, b) => {
        const chA = a.chapter ?? 0;
        const chB = b.chapter ?? 0;
        return chB - chA;
      });
      unique.push(sorted[0]);
      duplicates.push(...sorted.slice(1));
    }
  }

  return { unique, duplicates };
}

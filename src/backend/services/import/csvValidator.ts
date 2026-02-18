import { z } from 'zod';
import type { RawImportEntry, ValidatedImportEntry, InvalidImportEntry, ValidationResult } from '../../../model/schemas/import';
import { normalizeTitle } from './deduplication';

const platformEnum = z.enum(['MangaDex', 'Other']);

const importEntrySchema = z.object({
  title: z.string().min(1).max(200),
  chapter: z
    .number()
    .int()
    .positive()
    .optional(),
  url: z.string().url().optional(),
  platform: platformEnum.default('Other'),
  lastReadDate: z.string().optional(),
});

type ImportEntryInput = {
  title?: unknown;
  chapter?: unknown;
  url?: unknown;
  platform?: unknown;
  lastReadDate?: unknown;
};

type ValidateSuccess = { success: true; data: z.infer<typeof importEntrySchema> };
type ValidateFailure = { success: false; errors: string[] };

export function validateImportEntry(raw: ImportEntryInput): ValidateSuccess | ValidateFailure {
  const result = importEntrySchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((i) => i.message);
  return { success: false, errors };
}

export function normalizeImportEntry(
  entry: z.infer<typeof importEntrySchema>
): ValidatedImportEntry {
  const trimmedTitle = entry.title.trim();
  return {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    title: trimmedTitle,
    normalizedTitle: normalizeTitle(trimmedTitle),
    chapter: entry.chapter,
    url: entry.url,
    platform: entry.platform,
    lastReadDate: entry.lastReadDate,
  };
}

export function validateImportData(rawEntries: RawImportEntry[]): ValidationResult {
  const valid: ValidatedImportEntry[] = [];
  const invalid: InvalidImportEntry[] = [];

  for (const raw of rawEntries) {
    const coerced = {
      ...raw,
      chapter:
        raw.chapter !== undefined && raw.chapter !== null && raw.chapter !== ''
          ? Number(raw.chapter)
          : undefined,
    };

    const result = validateImportEntry(coerced);
    if (result.success) {
      valid.push(normalizeImportEntry(result.data));
    } else {
      invalid.push({ raw, errors: result.errors });
    }
  }

  return { valid, invalid };
}

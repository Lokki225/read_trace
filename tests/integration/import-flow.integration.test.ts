import {
  parseCSVText,
  buildImportJob,
  extractFromBrowserHistory,
  getSelectedEntries,
  updateEntrySelection,
  removeEntry,
} from '../../src/backend/services/import/importService';
import { validateImportData } from '../../src/backend/services/import/csvValidator';
import { deduplicateEntries } from '../../src/backend/services/import/deduplication';
import type { BrowserHistoryItem } from '../../src/model/schemas/import';

const VALID_CSV = `Series Title,Chapter Number,URL,Platform,Last Read Date
"One Piece",1087,https://mangadex.org/title/abc/one-piece,MangaDex,2026-01-15
"Naruto",700,,Other,2026-02-01
"Bleach",686,,Other,`;

const DUPLICATE_CSV = `Series Title,Chapter Number,URL,Platform,Last Read Date
"One Piece",1087,,Other,
"One Piece",1088,,Other,
"Naruto",700,,Other,`;

const MALFORMED_CSV = `Series Title,Chapter Number
"",1
"Valid Series",
"Another Valid",500`;

describe('CSV Import Flow', () => {
  describe('parseCSVText', () => {
    it('should parse a valid CSV into raw entries', () => {
      const entries = parseCSVText(VALID_CSV);
      expect(entries).toHaveLength(3);
      expect(entries[0].title).toBe('One Piece');
      expect(entries[0].chapter).toBe(1087);
      expect(entries[0].platform).toBe('MangaDex');
    });

    it('should handle entries with missing optional fields', () => {
      const entries = parseCSVText(VALID_CSV);
      expect(entries[1].url).toBeUndefined();
    });

    it('should return empty array for empty CSV', () => {
      const entries = parseCSVText('Series Title,Chapter Number\n');
      expect(entries).toHaveLength(0);
    });

    it('should handle CSV with only headers', () => {
      const entries = parseCSVText('Series Title,Chapter Number,URL,Platform,Last Read Date');
      expect(entries).toHaveLength(0);
    });
  });

  describe('validateImportData', () => {
    it('should validate all entries from a well-formed CSV', () => {
      const raw = parseCSVText(VALID_CSV);
      const { valid, invalid } = validateImportData(raw);
      expect(valid.length).toBeGreaterThan(0);
    });

    it('should reject entries with empty titles', () => {
      const raw = parseCSVText(MALFORMED_CSV);
      const { invalid } = validateImportData(raw);
      expect(invalid.some((e) => e.raw.title === '')).toBe(true);
    });

    it('should accept entries with missing optional chapter', () => {
      const raw = parseCSVText(MALFORMED_CSV);
      const { valid } = validateImportData(raw);
      expect(valid.some((e) => e.title === 'Valid Series')).toBe(true);
    });
  });

  describe('buildImportJob', () => {
    it('should build a complete import job from CSV text', () => {
      const raw = parseCSVText(VALID_CSV);
      const job = buildImportJob('user-123', 'csv', raw);

      expect(job.userId).toBe('user-123');
      expect(job.sourceType).toBe('csv');
      expect(job.status).toBe('pending');
      expect(job.totalItems).toBe(3);
      expect(job.entries.length).toBeGreaterThan(0);
    });

    it('should mark duplicate entries correctly', () => {
      const raw = parseCSVText(DUPLICATE_CSV);
      const job = buildImportJob('user-123', 'csv', raw);

      const duplicates = job.entries.filter((e) => e.isDuplicate);
      expect(duplicates.length).toBeGreaterThan(0);
    });

    it('should pre-select non-duplicate entries', () => {
      const raw = parseCSVText(VALID_CSV);
      const job = buildImportJob('user-123', 'csv', raw);

      const selected = job.entries.filter((e) => e.selected && !e.isDuplicate && e.status !== 'error');
      expect(selected.length).toBeGreaterThan(0);
    });

    it('should not pre-select duplicate entries', () => {
      const raw = parseCSVText(DUPLICATE_CSV);
      const job = buildImportJob('user-123', 'csv', raw);

      const selectedDuplicates = job.entries.filter((e) => e.isDuplicate && e.selected);
      expect(selectedDuplicates).toHaveLength(0);
    });

    it('should mark invalid entries with error status', () => {
      const raw = parseCSVText(MALFORMED_CSV);
      const job = buildImportJob('user-123', 'csv', raw);

      const errors = job.entries.filter((e) => e.status === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('deduplicateEntries', () => {
    it('should keep highest chapter when deduplicating', () => {
      const raw = parseCSVText(DUPLICATE_CSV);
      const { valid } = validateImportData(raw);
      const { unique } = deduplicateEntries(valid);

      const onePiece = unique.find((e) => e.normalizedTitle === 'one piece');
      expect(onePiece?.chapter).toBe(1088);
    });
  });

  describe('updateEntrySelection', () => {
    it('should toggle entry selection', () => {
      const raw = parseCSVText(VALID_CSV);
      const job = buildImportJob('user-123', 'csv', raw);
      const firstEntry = job.entries[0];

      const updated = updateEntrySelection(job, firstEntry.id, false);
      const entry = updated.entries.find((e) => e.id === firstEntry.id);
      expect(entry?.selected).toBe(false);
    });
  });

  describe('removeEntry', () => {
    it('should remove an entry from the job', () => {
      const raw = parseCSVText(VALID_CSV);
      const job = buildImportJob('user-123', 'csv', raw);
      const firstEntry = job.entries[0];
      const initialCount = job.entries.length;

      const updated = removeEntry(job, firstEntry.id);
      expect(updated.entries).toHaveLength(initialCount - 1);
      expect(updated.entries.find((e) => e.id === firstEntry.id)).toBeUndefined();
    });
  });

  describe('getSelectedEntries', () => {
    it('should return only selected non-error entries', () => {
      const raw = parseCSVText(VALID_CSV);
      const job = buildImportJob('user-123', 'csv', raw);

      const selected = getSelectedEntries(job);
      expect(selected.every((e) => !('status' in e && (e as any).status === 'error'))).toBe(true);
    });
  });
});

describe('Browser History Import Flow', () => {
  const historyItems: BrowserHistoryItem[] = [
    { url: 'https://mangadex.org/title/abc123/one-piece', visitTime: Date.now() },
    { url: 'https://mangadex.org/title/def456/naruto', visitTime: Date.now() - 86400000 },
    { url: 'https://google.com', visitTime: Date.now() },
    { url: 'https://mangadex.org/chapter/xyz789', visitTime: Date.now() },
  ];

  describe('extractFromBrowserHistory', () => {
    it('should extract series from supported platform URLs', () => {
      const entries = extractFromBrowserHistory(historyItems);
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.every((e) => e.platform === 'MangaDex')).toBe(true);
    });

    it('should ignore non-manga URLs', () => {
      const entries = extractFromBrowserHistory(historyItems);
      expect(entries.every((e) => !e.url?.includes('google.com'))).toBe(true);
    });

    it('should ignore chapter-only URLs (no title)', () => {
      const entries = extractFromBrowserHistory(historyItems);
      expect(entries.every((e) => !e.url?.includes('/chapter/'))).toBe(true);
    });

    it('should return empty array for empty history', () => {
      const entries = extractFromBrowserHistory([]);
      expect(entries).toHaveLength(0);
    });

    it('should build a valid import job from history', () => {
      const raw = extractFromBrowserHistory(historyItems);
      const job = buildImportJob('user-123', 'browser_history', raw);
      expect(job.sourceType).toBe('browser_history');
      expect(job.entries.length).toBeGreaterThan(0);
    });
  });
});

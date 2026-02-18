import { deduplicateEntries, findDuplicates, normalizeTitle } from '../../src/backend/services/import/deduplication';
import type { ValidatedImportEntry } from '../../src/model/schemas/import';

const makeEntry = (title: string, chapter?: number): ValidatedImportEntry => ({
  title,
  normalizedTitle: normalizeTitle(title),
  platform: 'Other',
  chapter,
  id: Math.random().toString(36).slice(2),
});

describe('normalizeTitle', () => {
  it('should lowercase the title', () => {
    expect(normalizeTitle('One Piece')).toBe('one piece');
  });

  it('should trim whitespace', () => {
    expect(normalizeTitle('  Naruto  ')).toBe('naruto');
  });

  it('should remove special characters', () => {
    expect(normalizeTitle('One-Piece!')).toBe('one piece');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeTitle('One  Piece')).toBe('one piece');
  });

  it('should handle empty string', () => {
    expect(normalizeTitle('')).toBe('');
  });

  it('should handle string with only special chars', () => {
    expect(normalizeTitle('---!!!')).toBe('');
  });
});

describe('findDuplicates', () => {
  it('should find exact duplicate titles', () => {
    const entries = [
      makeEntry('One Piece', 1087),
      makeEntry('One Piece', 1088),
      makeEntry('Naruto', 700),
    ];
    const result = findDuplicates(entries);
    expect(result.duplicateGroups).toHaveLength(1);
    expect(result.duplicateGroups[0]).toHaveLength(2);
  });

  it('should find case-insensitive duplicates', () => {
    const entries = [
      makeEntry('one piece', 1087),
      makeEntry('One Piece', 1088),
    ];
    const result = findDuplicates(entries);
    expect(result.duplicateGroups).toHaveLength(1);
  });

  it('should find duplicates ignoring special characters', () => {
    const entries = [
      makeEntry('One-Piece', 1087),
      makeEntry('One Piece', 1088),
    ];
    const result = findDuplicates(entries);
    expect(result.duplicateGroups).toHaveLength(1);
  });

  it('should return empty array when no duplicates', () => {
    const entries = [
      makeEntry('One Piece', 1087),
      makeEntry('Naruto', 700),
      makeEntry('Bleach', 686),
    ];
    const result = findDuplicates(entries);
    expect(result.duplicateGroups).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = findDuplicates([]);
    expect(result.duplicateGroups).toHaveLength(0);
  });
});

describe('deduplicateEntries', () => {
  it('should keep unique entries unchanged', () => {
    const entries = [
      makeEntry('One Piece', 1087),
      makeEntry('Naruto', 700),
    ];
    const result = deduplicateEntries(entries);
    expect(result.unique).toHaveLength(2);
    expect(result.duplicates).toHaveLength(0);
  });

  it('should keep highest chapter when deduplicating', () => {
    const entries = [
      makeEntry('One Piece', 1087),
      makeEntry('One Piece', 1088),
      makeEntry('One Piece', 500),
    ];
    const result = deduplicateEntries(entries);
    expect(result.unique).toHaveLength(1);
    expect(result.unique[0].chapter).toBe(1088);
    expect(result.duplicates).toHaveLength(2);
  });

  it('should handle entries without chapter numbers', () => {
    const entries = [
      makeEntry('One Piece'),
      makeEntry('One Piece'),
    ];
    const result = deduplicateEntries(entries);
    expect(result.unique).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });

  it('should return empty arrays for empty input', () => {
    const result = deduplicateEntries([]);
    expect(result.unique).toHaveLength(0);
    expect(result.duplicates).toHaveLength(0);
  });
});

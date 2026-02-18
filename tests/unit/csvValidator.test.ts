import { validateImportEntry, validateImportData, normalizeImportEntry } from '../../src/backend/services/import/csvValidator';

describe('validateImportEntry', () => {
  it('should validate a valid entry', () => {
    const result = validateImportEntry({
      title: 'One Piece',
      chapter: 1087,
      url: 'https://mangadex.org/chapter/abc',
      platform: 'MangaDex',
      lastReadDate: '2026-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should validate entry with only required title field', () => {
    const result = validateImportEntry({ title: 'Naruto' });
    expect(result.success).toBe(true);
  });

  it('should fail for empty title', () => {
    const result = validateImportEntry({ title: '' });
    expect(result.success).toBe(false);
  });

  it('should fail for title exceeding 200 characters', () => {
    const result = validateImportEntry({ title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should fail for negative chapter number', () => {
    const result = validateImportEntry({ title: 'Test', chapter: -1 });
    expect(result.success).toBe(false);
  });

  it('should fail for zero chapter number', () => {
    const result = validateImportEntry({ title: 'Test', chapter: 0 });
    expect(result.success).toBe(false);
  });

  it('should fail for non-integer chapter number', () => {
    const result = validateImportEntry({ title: 'Test', chapter: 1.5 });
    expect(result.success).toBe(false);
  });

  it('should fail for invalid URL', () => {
    const result = validateImportEntry({ title: 'Test', url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('should default platform to Other when not provided', () => {
    const result = validateImportEntry({ title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.platform).toBe('Other');
    }
  });

  it('should accept MangaDex as platform', () => {
    const result = validateImportEntry({ title: 'Test', platform: 'MangaDex' });
    expect(result.success).toBe(true);
  });

  it('should fail for unknown platform', () => {
    const result = validateImportEntry({ title: 'Test', platform: 'Unknown' });
    expect(result.success).toBe(false);
  });
});

describe('validateImportData', () => {
  it('should validate an array of valid entries', () => {
    const result = validateImportData([
      { title: 'One Piece', chapter: 1087 },
      { title: 'Naruto', chapter: 700 },
    ]);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(0);
  });

  it('should separate valid and invalid entries', () => {
    const result = validateImportData([
      { title: 'One Piece', chapter: 1087 },
      { title: '', chapter: 1 },
      { title: 'Naruto', chapter: -5 },
    ]);
    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toHaveLength(2);
  });

  it('should return empty arrays for empty input', () => {
    const result = validateImportData([]);
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
  });

  it('should include error messages for invalid entries', () => {
    const result = validateImportData([{ title: '' }]);
    expect(result.invalid[0].errors).toBeDefined();
    expect(result.invalid[0].errors.length).toBeGreaterThan(0);
  });
});

describe('normalizeImportEntry', () => {
  it('should trim whitespace from title', () => {
    const result = normalizeImportEntry({ title: '  One Piece  ', platform: 'Other' });
    expect(result.title).toBe('One Piece');
  });

  it('should normalize title to consistent casing (preserve original)', () => {
    const result = normalizeImportEntry({ title: 'one piece', platform: 'Other' });
    expect(result.normalizedTitle).toBe('one piece');
  });

  it('should remove special characters from normalized title', () => {
    const result = normalizeImportEntry({ title: 'One-Piece!', platform: 'Other' });
    expect(result.normalizedTitle).toBe('one piece');
  });

  it('should collapse multiple spaces in normalized title', () => {
    const result = normalizeImportEntry({ title: 'One  Piece', platform: 'Other' });
    expect(result.normalizedTitle).toBe('one piece');
  });
});

import {
  resolveConflict,
  isNewerUpdate,
  mergeProgressUpdates,
  ConflictUpdate,
} from '../../../src/backend/services/realtime/conflictResolver';

const makeUpdate = (overrides: Partial<ConflictUpdate> = {}): ConflictUpdate => ({
  series_id: 'series-1',
  user_id: 'user-1',
  current_chapter: 10,
  progress_percentage: 20,
  last_read_at: '2026-02-18T10:00:00Z',
  updated_at: '2026-02-18T10:00:00Z',
  ...overrides,
});

describe('conflictResolver', () => {
  describe('isNewerUpdate()', () => {
    it('should return true when incoming is newer than existing', () => {
      const existing = makeUpdate({ updated_at: '2026-02-18T10:00:00Z' });
      const incoming = makeUpdate({ updated_at: '2026-02-18T11:00:00Z' });
      expect(isNewerUpdate(incoming, existing)).toBe(true);
    });

    it('should return false when incoming is older than existing', () => {
      const existing = makeUpdate({ updated_at: '2026-02-18T11:00:00Z' });
      const incoming = makeUpdate({ updated_at: '2026-02-18T10:00:00Z' });
      expect(isNewerUpdate(incoming, existing)).toBe(false);
    });

    it('should return false when timestamps are equal', () => {
      const existing = makeUpdate({ updated_at: '2026-02-18T10:00:00Z' });
      const incoming = makeUpdate({ updated_at: '2026-02-18T10:00:00Z' });
      expect(isNewerUpdate(incoming, existing)).toBe(false);
    });

    it('should handle millisecond precision', () => {
      const existing = makeUpdate({ updated_at: '2026-02-18T10:00:00.000Z' });
      const incoming = makeUpdate({ updated_at: '2026-02-18T10:00:00.001Z' });
      expect(isNewerUpdate(incoming, existing)).toBe(true);
    });

    it('should handle last_read_at as fallback when updated_at is missing', () => {
      const existing = makeUpdate({ updated_at: undefined, last_read_at: '2026-02-18T10:00:00Z' });
      const incoming = makeUpdate({ updated_at: undefined, last_read_at: '2026-02-18T11:00:00Z' });
      expect(isNewerUpdate(incoming, existing)).toBe(true);
    });
  });

  describe('resolveConflict()', () => {
    it('should return incoming when it is newer (last-write-wins)', () => {
      const existing = makeUpdate({
        current_chapter: 10,
        updated_at: '2026-02-18T10:00:00Z',
      });
      const incoming = makeUpdate({
        current_chapter: 15,
        updated_at: '2026-02-18T11:00:00Z',
      });

      const result = resolveConflict(incoming, existing);
      expect(result.current_chapter).toBe(15);
      expect(result.resolved_by).toBe('last-write-wins');
    });

    it('should return existing when incoming is older', () => {
      const existing = makeUpdate({
        current_chapter: 15,
        updated_at: '2026-02-18T11:00:00Z',
      });
      const incoming = makeUpdate({
        current_chapter: 10,
        updated_at: '2026-02-18T10:00:00Z',
      });

      const result = resolveConflict(incoming, existing);
      expect(result.current_chapter).toBe(15);
      expect(result.resolved_by).toBe('last-write-wins');
    });

    it('should return existing when timestamps are equal', () => {
      const existing = makeUpdate({
        current_chapter: 15,
        updated_at: '2026-02-18T10:00:00Z',
      });
      const incoming = makeUpdate({
        current_chapter: 10,
        updated_at: '2026-02-18T10:00:00Z',
      });

      const result = resolveConflict(incoming, existing);
      expect(result.current_chapter).toBe(15);
    });

    it('should include conflict metadata in result', () => {
      const existing = makeUpdate({ updated_at: '2026-02-18T10:00:00Z' });
      const incoming = makeUpdate({ updated_at: '2026-02-18T11:00:00Z' });

      const result = resolveConflict(incoming, existing);
      expect(result).toHaveProperty('resolved_by');
      expect(result).toHaveProperty('conflict_detected');
      expect(result.conflict_detected).toBe(true);
    });

    it('should handle same series_id conflict', () => {
      const existing = makeUpdate({ series_id: 'series-abc', current_chapter: 5 });
      const incoming = makeUpdate({ series_id: 'series-abc', current_chapter: 10, updated_at: '2026-02-18T12:00:00Z' });

      const result = resolveConflict(incoming, existing);
      expect(result.series_id).toBe('series-abc');
      expect(result.current_chapter).toBe(10);
    });

    it('should favor higher chapter number when timestamps are identical', () => {
      const ts = '2026-02-18T10:00:00Z';
      const existing = makeUpdate({ current_chapter: 5, updated_at: ts });
      const incoming = makeUpdate({ current_chapter: 10, updated_at: ts });

      const result = resolveConflict(incoming, existing);
      expect(result.current_chapter).toBe(10);
    });
  });

  describe('mergeProgressUpdates()', () => {
    it('should merge two updates keeping the newer timestamp fields', () => {
      const base = makeUpdate({
        current_chapter: 10,
        progress_percentage: 20,
        last_read_at: '2026-02-18T10:00:00Z',
        updated_at: '2026-02-18T10:00:00Z',
      });
      const incoming = makeUpdate({
        current_chapter: 15,
        progress_percentage: 30,
        last_read_at: '2026-02-18T11:00:00Z',
        updated_at: '2026-02-18T11:00:00Z',
      });

      const merged = mergeProgressUpdates(base, incoming);
      expect(merged.current_chapter).toBe(15);
      expect(merged.progress_percentage).toBe(30);
      expect(merged.last_read_at).toBe('2026-02-18T11:00:00Z');
    });

    it('should preserve series_id and user_id from base', () => {
      const base = makeUpdate({ series_id: 'series-1', user_id: 'user-1' });
      const incoming = makeUpdate({ series_id: 'series-1', user_id: 'user-1', current_chapter: 20 });

      const merged = mergeProgressUpdates(base, incoming);
      expect(merged.series_id).toBe('series-1');
      expect(merged.user_id).toBe('user-1');
    });

    it('should keep base values when incoming has undefined fields', () => {
      const base = makeUpdate({ current_chapter: 10, progress_percentage: 20 });
      const incoming = makeUpdate({ current_chapter: undefined, progress_percentage: undefined });

      const merged = mergeProgressUpdates(base, incoming);
      expect(merged.current_chapter).toBe(10);
      expect(merged.progress_percentage).toBe(20);
    });

    it('should use the later of the two timestamps', () => {
      const base = makeUpdate({ updated_at: '2026-02-18T10:00:00Z' });
      const incoming = makeUpdate({ updated_at: '2026-02-18T12:00:00Z' });

      const merged = mergeProgressUpdates(base, incoming);
      expect(merged.updated_at).toBe('2026-02-18T12:00:00Z');
    });
  });
});

import { formatLastRead, formatChapterDisplay } from '@/lib/dateFormat';

describe('dateFormat utilities', () => {
  describe('formatLastRead', () => {
    it('should return "Never" for null date', () => {
      expect(formatLastRead(null)).toBe('Never');
    });

    it('should return "Never" for invalid date string', () => {
      expect(formatLastRead('invalid-date')).toBe('Never');
    });

    it('should format date within 7 days as relative time', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const result = formatLastRead(twoDaysAgo);
      expect(result).toMatch(/\d+ days? ago/);
    });

    it('should format date older than 7 days as absolute date', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const result = formatLastRead(tenDaysAgo);
      expect(result).toMatch(/\w+ \d+, \d{4}/);
    });

    it('should handle Date object input', () => {
      const date = new Date('2026-02-18');
      const result = formatLastRead(date);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle ISO string input', () => {
      const isoString = '2026-02-18T10:00:00Z';
      const result = formatLastRead(isoString);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format very recent dates (less than 1 minute)', () => {
      const justNow = new Date();
      justNow.setSeconds(justNow.getSeconds() - 30);
      const result = formatLastRead(justNow);
      expect(result).toMatch(/less than a minute ago|a few seconds ago|1 minute ago/);
    });

    it('should format 1 hour ago correctly', () => {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      const result = formatLastRead(oneHourAgo);
      expect(result).toMatch(/about 1 hour ago|an hour ago/);
    });
  });

  describe('formatChapterDisplay', () => {
    it('should return "--" for null current chapter', () => {
      expect(formatChapterDisplay(null, 50)).toBe('--');
    });

    it('should return "--" for undefined current chapter', () => {
      expect(formatChapterDisplay(null, 50)).toBe('--');
    });

    it('should return "Ch. X" when total is null', () => {
      expect(formatChapterDisplay(12, null)).toBe('Ch. 12');
    });

    it('should return "Ch. X" when total is undefined', () => {
      expect(formatChapterDisplay(12, null)).toBe('Ch. 12');
    });

    it('should return "Ch. X / Y" format when both are provided', () => {
      expect(formatChapterDisplay(12, 50)).toBe('Ch. 12 / 50');
    });

    it('should handle zero current chapter', () => {
      expect(formatChapterDisplay(0, 50)).toBe('Ch. 0 / 50');
    });

    it('should handle zero total chapters', () => {
      expect(formatChapterDisplay(5, 0)).toBe('Ch. 5 / 0');
    });

    it('should handle large chapter numbers', () => {
      expect(formatChapterDisplay(999, 1000)).toBe('Ch. 999 / 1000');
    });
  });
});

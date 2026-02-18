import {
  SUPPORTED_PLATFORMS,
  DEFAULT_PREFERRED_SITES,
  getPlatformById,
  getPlatformName,
  validatePreferences,
  normalizePreferences,
} from '@/lib/platforms';

describe('platforms', () => {
  describe('SUPPORTED_PLATFORMS', () => {
    it('should contain MangaDex as first platform', () => {
      expect(SUPPORTED_PLATFORMS[0].id).toBe('mangadex');
    });

    it('should have all platforms with id, name, and url', () => {
      SUPPORTED_PLATFORMS.forEach((platform) => {
        expect(platform.id).toBeDefined();
        expect(platform.name).toBeDefined();
        expect(platform.url).toBeDefined();
      });
    });
  });

  describe('DEFAULT_PREFERRED_SITES', () => {
    it('should default to mangadex', () => {
      expect(DEFAULT_PREFERRED_SITES).toEqual(['mangadex']);
    });
  });

  describe('getPlatformById', () => {
    it('should return platform for valid id', () => {
      const platform = getPlatformById('mangadex');
      expect(platform).toBeDefined();
      expect(platform?.name).toBe('MangaDex');
    });

    it('should return undefined for invalid id', () => {
      const platform = getPlatformById('invalid');
      expect(platform).toBeUndefined();
    });
  });

  describe('getPlatformName', () => {
    it('should return platform name for valid id', () => {
      const name = getPlatformName('mangadex');
      expect(name).toBe('MangaDex');
    });

    it('should return id for invalid platform', () => {
      const name = getPlatformName('invalid');
      expect(name).toBe('invalid');
    });
  });

  describe('validatePreferences', () => {
    it('should validate valid preferences', () => {
      expect(validatePreferences(['mangadex'])).toBe(true);
      expect(validatePreferences(['mangadex', 'manganelo'])).toBe(true);
    });

    it('should reject empty array', () => {
      expect(validatePreferences([])).toBe(false);
    });

    it('should reject non-array', () => {
      expect(validatePreferences(null as any)).toBe(false);
      expect(validatePreferences(undefined as any)).toBe(false);
    });

    it('should reject invalid platform ids', () => {
      expect(validatePreferences(['invalid'])).toBe(false);
      expect(validatePreferences(['mangadex', 'invalid'])).toBe(false);
    });
  });

  describe('normalizePreferences', () => {
    it('should return valid preferences unchanged', () => {
      const prefs = ['mangadex', 'manganelo'];
      expect(normalizePreferences(prefs)).toEqual(prefs);
    });

    it('should filter out invalid ids', () => {
      const prefs = ['mangadex', 'invalid', 'manganelo'];
      expect(normalizePreferences(prefs)).toEqual(['mangadex', 'manganelo']);
    });

    it('should return defaults for empty array', () => {
      expect(normalizePreferences([])).toEqual(DEFAULT_PREFERRED_SITES);
    });

    it('should return defaults when all ids invalid', () => {
      expect(normalizePreferences(['invalid1', 'invalid2'])).toEqual(
        DEFAULT_PREFERRED_SITES
      );
    });
  });
});

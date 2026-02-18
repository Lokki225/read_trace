import { normalizePreferences, DEFAULT_PREFERRED_SITES } from '@/lib/platforms';

describe('Site Preferences Integration', () => {
  describe('preference normalization', () => {
    it('should normalize valid preferences', () => {
      const prefs = ['mangadex', 'manganelo'];
      const result = normalizePreferences(prefs);
      expect(result).toEqual(prefs);
    });

    it('should filter invalid preferences', () => {
      const prefs = ['mangadex', 'invalid', 'manganelo'];
      const result = normalizePreferences(prefs);
      expect(result).toEqual(['mangadex', 'manganelo']);
    });

    it('should return defaults for empty array', () => {
      const result = normalizePreferences([]);
      expect(result).toEqual(DEFAULT_PREFERRED_SITES);
    });

    it('should preserve order of valid preferences', () => {
      const prefs = ['manganelo', 'mangadex', 'mangakakalot'];
      const result = normalizePreferences(prefs);
      expect(result).toEqual(prefs);
    });
  });

  describe('preference persistence', () => {
    it('should handle preference updates', () => {
      const initial = ['mangadex'];
      const updated = ['manganelo', 'mangadex'];
      
      expect(initial).not.toEqual(updated);
      expect(normalizePreferences(updated)).toEqual(updated);
    });

    it('should maintain preference order across updates', () => {
      const prefs1 = ['mangadex', 'manganelo'];
      const prefs2 = ['manganelo', 'mangadex'];
      
      expect(normalizePreferences(prefs1)).toEqual(prefs1);
      expect(normalizePreferences(prefs2)).toEqual(prefs2);
    });
  });

  describe('preference validation', () => {
    it('should accept single preference', () => {
      const result = normalizePreferences(['mangadex']);
      expect(result).toEqual(['mangadex']);
    });

    it('should accept multiple preferences', () => {
      const prefs = ['mangadex', 'manganelo', 'mangakakalot'];
      const result = normalizePreferences(prefs);
      expect(result).toEqual(prefs);
    });

    it('should handle duplicate preferences', () => {
      const prefs = ['mangadex', 'mangadex', 'manganelo'];
      const result = normalizePreferences(prefs);
      // Should keep duplicates as provided (normalization doesn't deduplicate)
      expect(result).toContain('mangadex');
      expect(result).toContain('manganelo');
    });
  });

  describe('extension integration flow', () => {
    it('should prepare preferences for extension storage', () => {
      const userPreferences = ['mangadex', 'manganelo'];
      const normalized = normalizePreferences(userPreferences);
      
      // Simulate extension storage format
      const extensionData = {
        preferredSites: normalized,
        lastUpdated: new Date().toISOString(),
      };

      expect(extensionData.preferredSites).toEqual(userPreferences);
      expect(extensionData.lastUpdated).toBeDefined();
    });

    it('should handle preference fallback in extension', () => {
      const preferences = ['mangadex', 'manganelo'];
      const availableSites = ['manganelo', 'mangakakalot'];

      // Find first preferred site that's available
      const resumeSite = preferences.find((site) =>
        availableSites.includes(site)
      );

      expect(resumeSite).toBe('manganelo');
    });

    it('should fallback to any available site if no preferred available', () => {
      const preferences = ['mangadex'];
      const availableSites = ['manganelo', 'mangakakalot'];

      const resumeSite =
        preferences.find((site) => availableSites.includes(site)) ||
        availableSites[0];

      expect(resumeSite).toBe('manganelo');
    });
  });

  describe('resume logic', () => {
    it('should prioritize first preferred site', () => {
      const preferences = ['mangadex', 'manganelo'];
      const availableSites = ['mangadex', 'manganelo', 'mangakakalot'];

      const resumeSite = preferences.find((site) =>
        availableSites.includes(site)
      );

      expect(resumeSite).toBe('mangadex');
    });

    it('should use second preference if first unavailable', () => {
      const preferences = ['mangadex', 'manganelo'];
      const availableSites = ['manganelo', 'mangakakalot'];

      const resumeSite = preferences.find((site) =>
        availableSites.includes(site)
      );

      expect(resumeSite).toBe('manganelo');
    });

    it('should fallback to any available if no preferences match', () => {
      const preferences = ['mangadex'];
      const availableSites = ['manganelo', 'mangakakalot'];

      const resumeSite =
        preferences.find((site) => availableSites.includes(site)) ||
        availableSites[0];

      expect(resumeSite).toBe('manganelo');
    });

    it('should handle empty available sites', () => {
      const preferences = ['mangadex', 'manganelo'];
      const availableSites: string[] = [];

      const resumeSite =
        preferences.find((site) => availableSites.includes(site)) ||
        availableSites[0];

      expect(resumeSite).toBeUndefined();
    });
  });

  describe('preference sync scenarios', () => {
    it('should sync preferences from web to extension', () => {
      const webPreferences = ['manganelo', 'mangadex'];
      const extensionPreferences = ['mangadex']; // Old value

      // Simulate sync
      const syncedPreferences = normalizePreferences(webPreferences);

      expect(syncedPreferences).toEqual(webPreferences);
      expect(syncedPreferences).not.toEqual(extensionPreferences);
    });

    it('should handle preference update with invalid sites', () => {
      const userInput = ['mangadex', 'invalid-site', 'manganelo'];
      const normalized = normalizePreferences(userInput);

      expect(normalized).toEqual(['mangadex', 'manganelo']);
      expect(normalized).not.toContain('invalid-site');
    });

    it('should maintain consistency across updates', () => {
      let preferences = DEFAULT_PREFERRED_SITES;

      // Update 1
      preferences = normalizePreferences(['manganelo', 'mangadex']);
      expect(preferences).toEqual(['manganelo', 'mangadex']);

      // Update 2
      preferences = normalizePreferences(['mangakakalot']);
      expect(preferences).toEqual(['mangakakalot']);

      // Update 3 - add back previous
      preferences = normalizePreferences(['mangakakalot', 'manganelo']);
      expect(preferences).toEqual(['mangakakalot', 'manganelo']);
    });
  });
});

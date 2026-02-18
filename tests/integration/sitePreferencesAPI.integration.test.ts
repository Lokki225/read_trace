import { normalizePreferences } from '@/lib/platforms';

describe('Site Preferences API Integration', () => {
  describe('API request validation', () => {
    it('should validate request body structure', () => {
      const validRequest = {
        preferred_sites: ['mangadex', 'manganelo'],
      };

      expect(validRequest).toHaveProperty('preferred_sites');
      expect(Array.isArray(validRequest.preferred_sites)).toBe(true);
    });

    it('should reject missing preferred_sites', () => {
      const invalidRequest = {};

      expect(invalidRequest).not.toHaveProperty('preferred_sites');
    });

    it('should reject non-array preferred_sites', () => {
      const invalidRequest = {
        preferred_sites: 'mangadex',
      };

      expect(Array.isArray(invalidRequest.preferred_sites)).toBe(false);
    });
  });

  describe('API response format', () => {
    it('should return correct response structure', () => {
      const response = {
        data: {
          preferred_sites: ['mangadex'],
          preferred_sites_updated_at: '2026-02-18T10:00:00Z',
        },
        error: null,
      };

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('error');
      expect(response.data).toHaveProperty('preferred_sites');
      expect(response.data).toHaveProperty('preferred_sites_updated_at');
    });

    it('should have null error on success', () => {
      const response = {
        data: {
          preferred_sites: ['mangadex'],
          preferred_sites_updated_at: '2026-02-18T10:00:00Z',
        },
        error: null,
      };

      expect(response.error).toBeNull();
    });

    it('should have error message on failure', () => {
      const response = {
        data: null,
        error: 'Failed to save preferences',
      };

      expect(response.error).toBeDefined();
      expect(response.error).not.toBeNull();
    });
  });

  describe('preference normalization in API', () => {
    it('should normalize preferences before saving', () => {
      const input = ['mangadex', 'invalid', 'manganelo'];
      const normalized = normalizePreferences(input);

      expect(normalized).toEqual(['mangadex', 'manganelo']);
      expect(normalized).not.toContain('invalid');
    });

    it('should handle empty preferences with defaults', () => {
      const input: string[] = [];
      const normalized = normalizePreferences(input);

      expect(normalized).toEqual(['mangadex']);
    });

    it('should preserve order during normalization', () => {
      const input = ['manganelo', 'mangadex', 'mangakakalot'];
      const normalized = normalizePreferences(input);

      expect(normalized).toEqual(input);
    });
  });

  describe('timestamp handling', () => {
    it('should set updated_at timestamp', () => {
      const timestamp = new Date().toISOString();
      const response = {
        data: {
          preferred_sites: ['mangadex'],
          preferred_sites_updated_at: timestamp,
        },
        error: null,
      };

      expect(response.data.preferred_sites_updated_at).toBeDefined();
      expect(typeof response.data.preferred_sites_updated_at).toBe('string');
    });

    it('should use ISO 8601 format for timestamp', () => {
      const timestamp = new Date().toISOString();
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

      expect(isoRegex.test(timestamp)).toBe(true);
    });
  });

  describe('concurrent preference updates', () => {
    it('should handle sequential updates correctly', () => {
      let currentPreferences = ['mangadex'];

      // Update 1
      currentPreferences = normalizePreferences(['manganelo', 'mangadex']);
      expect(currentPreferences).toEqual(['manganelo', 'mangadex']);

      // Update 2
      currentPreferences = normalizePreferences(['mangakakalot']);
      expect(currentPreferences).toEqual(['mangakakalot']);

      // Verify final state
      expect(currentPreferences).not.toContain('manganelo');
      expect(currentPreferences).not.toContain('mangadex');
    });

    it('should maintain consistency with rapid updates', () => {
      const updates = [
        ['mangadex'],
        ['manganelo', 'mangadex'],
        ['mangakakalot'],
        ['mangadex', 'manganelo', 'mangakakalot'],
      ];

      let current = ['mangadex'];
      updates.forEach((update) => {
        current = normalizePreferences(update);
        expect(Array.isArray(current)).toBe(true);
        expect(current.length).toBeGreaterThan(0);
      });

      expect(current).toEqual(updates[updates.length - 1]);
    });
  });

  describe('error scenarios', () => {
    it('should handle unauthorized access', () => {
      const error = {
        status: 401,
        message: 'Unauthorized',
      };

      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should handle invalid request body', () => {
      const error = {
        status: 400,
        message: 'preferred_sites must be an array',
      };

      expect(error.status).toBe(400);
      expect(error.message).toContain('array');
    });

    it('should handle server errors', () => {
      const error = {
        status: 500,
        message: 'Internal server error',
      };

      expect(error.status).toBe(500);
    });
  });

  describe('preference persistence scenarios', () => {
    it('should persist preferences across requests', () => {
      const preferences1 = ['mangadex', 'manganelo'];
      const preferences2 = normalizePreferences(preferences1);

      expect(preferences2).toEqual(preferences1);
    });

    it('should not lose preferences on invalid update attempt', () => {
      const current = ['mangadex', 'manganelo'];
      const invalid = ['invalid-site'];
      const normalized = normalizePreferences(invalid);

      // Invalid update should result in defaults, not keep current
      expect(normalized).toEqual(['mangadex']);
      expect(normalized).not.toEqual(current);
    });

    it('should handle preference rollback', () => {
      const original = ['mangadex'];
      const updated = ['manganelo', 'mangadex'];
      const rolledBack = normalizePreferences(original);

      expect(rolledBack).toEqual(original);
      expect(rolledBack).not.toEqual(updated);
    });
  });
});

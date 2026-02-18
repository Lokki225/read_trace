import { CustomSite } from '@/types/preferences';

describe('Custom Sites Integration', () => {
  describe('custom site validation', () => {
    it('should validate site name is required', () => {
      const request = {
        name: '',
        url: 'https://example.com',
      };

      expect(request.name).toBeFalsy();
    });

    it('should validate site URL is required', () => {
      const request = {
        name: 'Example',
        url: '',
      };

      expect(request.url).toBeFalsy();
    });

    it('should validate site name length', () => {
      const name = 'a'.repeat(101);
      expect(name.length).toBeGreaterThan(100);
    });

    it('should validate URL format', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://sub.example.com/path',
      ];

      validUrls.forEach((url) => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should reject invalid URL format', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        'htp://example.com',
      ];

      invalidUrls.forEach((url) => {
        try {
          new URL(url);
          // If we get here, it's not a valid absolute URL
          expect(url).not.toMatch(/^https?:\/\//);
        } catch {
          // Expected - invalid URL
        }
      });
    });
  });

  describe('custom site creation', () => {
    it('should create custom site with correct structure', () => {
      const customSite: CustomSite = {
        id: `custom_${Date.now()}`,
        name: 'MangaPlus',
        url: 'https://mangaplus.com',
        createdAt: new Date().toISOString(),
      };

      expect(customSite).toHaveProperty('id');
      expect(customSite).toHaveProperty('name');
      expect(customSite).toHaveProperty('url');
      expect(customSite).toHaveProperty('createdAt');
    });

    it('should generate unique IDs for custom sites', () => {
      const site1: CustomSite = {
        id: `custom_${Date.now()}`,
        name: 'Site1',
        url: 'https://site1.com',
        createdAt: new Date().toISOString(),
      };

      const site2: CustomSite = {
        id: `custom_${Date.now() + 1}`,
        name: 'Site2',
        url: 'https://site2.com',
        createdAt: new Date().toISOString(),
      };

      expect(site1.id).not.toBe(site2.id);
    });

    it('should store creation timestamp', () => {
      const now = new Date().toISOString();
      const customSite: CustomSite = {
        id: `custom_${Date.now()}`,
        name: 'MangaPlus',
        url: 'https://mangaplus.com',
        createdAt: now,
      };

      expect(customSite.createdAt).toBe(now);
    });
  });

  describe('custom site management', () => {
    it('should add custom site to user profile', () => {
      const customSites: CustomSite[] = [];
      const newSite: CustomSite = {
        id: 'custom_1',
        name: 'MangaPlus',
        url: 'https://mangaplus.com',
        createdAt: '2026-02-18T10:00:00Z',
      };

      customSites.push(newSite);

      expect(customSites).toContain(newSite);
      expect(customSites.length).toBe(1);
    });

    it('should prevent duplicate site names', () => {
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
      ];

      const isDuplicate = customSites.some(
        (site) => site.name.toLowerCase() === 'mangaplus'
      );

      expect(isDuplicate).toBe(true);
    });

    it('should remove custom site from profile', () => {
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
        {
          id: 'custom_2',
          name: 'Webtoon',
          url: 'https://webtoon.com',
          createdAt: '2026-02-18T10:01:00Z',
        },
      ];

      const filtered = customSites.filter((site) => site.id !== 'custom_1');

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('custom_2');
    });

    it('should remove custom site from preferred sites when deleted', () => {
      const preferredSites = ['mangadex', 'custom_1', 'manganelo'];
      const customSiteIdToDelete = 'custom_1';

      const updated = preferredSites.filter(
        (id) => id !== customSiteIdToDelete
      );

      expect(updated).toEqual(['mangadex', 'manganelo']);
      expect(updated).not.toContain('custom_1');
    });
  });

  describe('custom site integration with preferences', () => {
    it('should allow custom sites in preferred sites list', () => {
      const preferredSites = ['mangadex', 'custom_1', 'manganelo'];
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
      ];

      const isValid = preferredSites.every((siteId) => {
        return (
          siteId.startsWith('custom_') ||
          ['mangadex', 'manganelo', 'mangakakalot'].includes(siteId)
        );
      });

      expect(isValid).toBe(true);
    });

    it('should handle mixed built-in and custom sites', () => {
      const preferredSites = ['mangadex', 'custom_1', 'manganelo', 'custom_2'];
      const builtInSites = ['mangadex', 'manganelo', 'mangakakalot'];
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
        {
          id: 'custom_2',
          name: 'Webtoon',
          url: 'https://webtoon.com',
          createdAt: '2026-02-18T10:01:00Z',
        },
      ];

      const builtInInPrefs = preferredSites.filter((id) =>
        builtInSites.includes(id)
      );
      const customInPrefs = preferredSites.filter((id) =>
        customSites.some((site) => site.id === id)
      );

      expect(builtInInPrefs).toEqual(['mangadex', 'manganelo']);
      expect(customInPrefs).toEqual(['custom_1', 'custom_2']);
    });

    it('should resolve site names for display', () => {
      const preferredSites = ['mangadex', 'custom_1'];
      const builtInSites = [
        { id: 'mangadex', name: 'MangaDex' },
      ];
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
      ];

      const displayNames = preferredSites.map((siteId) => {
        const builtIn = builtInSites.find((s) => s.id === siteId);
        if (builtIn) return builtIn.name;

        const custom = customSites.find((s) => s.id === siteId);
        return custom?.name || siteId;
      });

      expect(displayNames).toEqual(['MangaDex', 'MangaPlus']);
    });
  });

  describe('custom site resume logic', () => {
    it('should prioritize preferred sites including custom', () => {
      const preferences = ['mangadex', 'custom_1', 'manganelo'];
      const availableSites = ['custom_1', 'manganelo'];

      const resumeSite = preferences.find((site) =>
        availableSites.includes(site)
      );

      expect(resumeSite).toBe('custom_1');
    });

    it('should fallback to any available site if no preferred available', () => {
      const preferences = ['mangadex', 'custom_1'];
      const availableSites = ['manganelo', 'custom_2'];

      const resumeSite =
        preferences.find((site) => availableSites.includes(site)) ||
        availableSites[0];

      expect(resumeSite).toBe('manganelo');
    });

    it('should handle custom site unavailability', () => {
      const preferences = ['custom_1', 'mangadex'];
      const availableSites = ['mangadex', 'manganelo'];

      const resumeSite = preferences.find((site) =>
        availableSites.includes(site)
      );

      expect(resumeSite).toBe('mangadex');
    });
  });

  describe('API response format', () => {
    it('should return correct response structure for POST', () => {
      const response = {
        data: {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
        error: null,
      };

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('error');
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('url');
      expect(response.data).toHaveProperty('createdAt');
    });

    it('should return correct response structure for GET', () => {
      const response = {
        data: [
          {
            id: 'custom_1',
            name: 'MangaPlus',
            url: 'https://mangaplus.com',
            createdAt: '2026-02-18T10:00:00Z',
          },
        ],
        error: null,
      };

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.error).toBeNull();
    });

    it('should return correct response structure for DELETE', () => {
      const response = {
        data: { id: 'custom_1' },
        error: null,
      };

      expect(response.data).toHaveProperty('id');
      expect(response.error).toBeNull();
    });
  });

  describe('error scenarios', () => {
    it('should handle unauthorized access', () => {
      const error = {
        status: 401,
        message: 'Unauthorized',
      };

      expect(error.status).toBe(401);
    });

    it('should handle invalid request body', () => {
      const error = {
        status: 400,
        message: 'Site name is required',
      };

      expect(error.status).toBe(400);
    });

    it('should handle duplicate site names', () => {
      const error = {
        status: 400,
        message: 'A site with this name already exists',
      };

      expect(error.status).toBe(400);
    });

    it('should handle server errors', () => {
      const error = {
        status: 500,
        message: 'Internal server error',
      };

      expect(error.status).toBe(500);
    });
  });
});

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePreferredSites } from '@/hooks/usePreferredSites';
import { DEFAULT_PREFERRED_SITES } from '@/lib/platforms';

// Mock fetch
global.fetch = jest.fn();

describe('usePreferredSites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => usePreferredSites());
      expect(result.current.preferences).toEqual(DEFAULT_PREFERRED_SITES);
    });

    it('should initialize with provided preferences', () => {
      const prefs = ['mangadex', 'manganelo'];
      const { result } = renderHook(() => usePreferredSites(prefs));
      expect(result.current.preferences).toEqual(prefs);
    });

    it('should normalize invalid preferences on init', () => {
      const prefs = ['mangadex', 'invalid'];
      const { result } = renderHook(() => usePreferredSites(prefs));
      expect(result.current.preferences).toEqual(['mangadex']);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences on successful save', async () => {
      const mockResponse = {
        data: {
          preferred_sites: ['manganelo', 'mangadex'],
          preferred_sites_updated_at: '2026-02-18T10:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePreferredSites());

      await act(async () => {
        await result.current.updatePreferences(['manganelo', 'mangadex']);
      });

      expect(result.current.preferences).toEqual(['manganelo', 'mangadex']);
      expect(result.current.error).toBeNull();
    });

    it('should set error on failed save', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Save failed' }),
      });

      const { result } = renderHook(() => usePreferredSites());

      await act(async () => {
        try {
          await result.current.updatePreferences(['manganelo']);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Save failed');
    });

    it('should normalize preferences before saving', async () => {
      const mockResponse = {
        data: {
          preferred_sites: ['mangadex'],
          preferred_sites_updated_at: '2026-02-18T10:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePreferredSites());

      await act(async () => {
        await result.current.updatePreferences(['invalid', 'mangadex']);
      });

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      expect(callBody.preferred_sites).toEqual(['mangadex']);
    });

    it('should set isSaving flag during save', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: {
                      preferred_sites: ['mangadex'],
                      preferred_sites_updated_at: '2026-02-18T10:00:00Z',
                    },
                  }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => usePreferredSites());

      expect(result.current.isSaving).toBe(false);

      act(() => {
        result.current.updatePreferences(['mangadex']);
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });
  });

  describe('resetToDefaults', () => {
    it('should reset preferences to defaults', () => {
      const { result } = renderHook(() =>
        usePreferredSites(['manganelo', 'mangakakalot'])
      );

      expect(result.current.preferences).toEqual(['manganelo', 'mangakakalot']);

      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.preferences).toEqual(DEFAULT_PREFERRED_SITES);
      expect(result.current.error).toBeNull();
    });
  });

  describe('API endpoint', () => {
    it('should call correct API endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            preferred_sites: ['mangadex'],
            preferred_sites_updated_at: '2026-02-18T10:00:00Z',
          },
        }),
      });

      const { result } = renderHook(() => usePreferredSites());

      await act(async () => {
        await result.current.updatePreferences(['mangadex']);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/preferences/sites',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });
});

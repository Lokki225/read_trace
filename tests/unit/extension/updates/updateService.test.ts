import {
  parseVersion,
  compareVersions,
  getCurrentVersion,
  checkForUpdates,
  clearUpdateCache,
  getUpdateInfo
} from '../../../../src/extension/updates/updateService';

// Mock chrome API
const mockChrome = {
  runtime: {
    getManifest: jest.fn(() => ({ version: '1.0.0' }))
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

(global as any).chrome = mockChrome;

describe('updateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChrome.storage.local.get.mockResolvedValue({});
    mockChrome.storage.local.set.mockResolvedValue(undefined);
    mockChrome.storage.local.remove.mockResolvedValue(undefined);
  });

  describe('parseVersion', () => {
    it('should parse semantic version correctly', () => {
      expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
    });

    it('should handle version with missing patch', () => {
      expect(parseVersion('1.2')).toEqual([1, 2, 0]);
    });

    it('should handle version with missing minor and patch', () => {
      expect(parseVersion('1')).toEqual([1, 0, 0]);
    });

    it('should handle empty version string', () => {
      expect(parseVersion('')).toEqual([0, 0, 0]);
    });

    it('should handle non-numeric parts', () => {
      expect(parseVersion('1.a.3')).toEqual([1, 0, 3]);
    });
  });

  describe('compareVersions', () => {
    it('should return -1 when v1 < v2 (major)', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
    });

    it('should return -1 when v1 < v2 (minor)', () => {
      expect(compareVersions('1.1.0', '1.2.0')).toBe(-1);
    });

    it('should return -1 when v1 < v2 (patch)', () => {
      expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
    });

    it('should return 0 when versions are equal', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    });

    it('should return 1 when v1 > v2 (major)', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
    });

    it('should return 1 when v1 > v2 (minor)', () => {
      expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
    });

    it('should return 1 when v1 > v2 (patch)', () => {
      expect(compareVersions('1.0.2', '1.0.1')).toBe(1);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return version from manifest', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: '1.5.0' });
      const version = await getCurrentVersion();
      expect(version).toBe('1.5.0');
    });

    it('should return 0.0.0 if manifest has no version', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: undefined });
      const version = await getCurrentVersion();
      expect(version).toBe('0.0.0');
    });

    it('should return 0.0.0 on error', async () => {
      mockChrome.runtime.getManifest.mockImplementation(() => {
        throw new Error('Failed');
      });
      const version = await getCurrentVersion();
      expect(version).toBe('0.0.0');
    });
  });

  describe('checkForUpdates', () => {
    it('should return update available when latest > current', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.1.0' })
        })
      ) as jest.Mock;

      const result = await checkForUpdates();

      expect(result.isUpdateAvailable).toBe(true);
      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('1.1.0');
      expect(result.lastCheckTime).toBeGreaterThan(0);
    });

    it('should return no update when versions are equal', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.0.0' })
        })
      ) as jest.Mock;

      const result = await checkForUpdates();

      expect(result.isUpdateAvailable).toBe(false);
      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('1.0.0');
    });

    it('should cache result for 24 hours', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.1.0' })
        })
      ) as jest.Mock;

      const result1 = await checkForUpdates();
      expect(mockChrome.storage.local.set).toHaveBeenCalled();

      // Simulate cache hit
      const cachedResult = {
        isUpdateAvailable: true,
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        lastCheckTime: Date.now()
      };
      mockChrome.storage.local.get.mockResolvedValue({
        readtrace_update_check_cache: cachedResult
      });

      const result2 = await checkForUpdates();
      expect(result2.isUpdateAvailable).toBe(true);
    });

    it('should handle network error gracefully', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

      const result = await checkForUpdates();

      expect(result.isUpdateAvailable).toBe(false);
      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('1.0.0');
      expect(result.error).toBeDefined();
    });

    it('should handle HTTP error gracefully', async () => {
      mockChrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500
        })
      ) as jest.Mock;

      const result = await checkForUpdates();

      expect(result.isUpdateAvailable).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('clearUpdateCache', () => {
    it('should remove cache from storage', async () => {
      await clearUpdateCache();
      expect(mockChrome.storage.local.remove).toHaveBeenCalledWith('readtrace_update_check_cache');
    });

    it('should handle errors silently', async () => {
      mockChrome.storage.local.remove.mockRejectedValue(new Error('Storage error'));
      await expect(clearUpdateCache()).resolves.toBeUndefined();
    });
  });

  describe('getUpdateInfo', () => {
    it('should fetch update info for version', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              version: '1.1.0',
              releaseDate: '2026-02-19',
              features: ['Feature 1', 'Feature 2'],
              bugFixes: ['Fix 1'],
              downloadUrl: 'https://example.com/update'
            })
        })
      ) as jest.Mock;

      const info = await getUpdateInfo('1.1.0');

      expect(info).toBeDefined();
      expect(info?.version).toBe('1.1.0');
      expect(info?.features).toContain('Feature 1');
    });

    it('should return null on HTTP error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      ) as jest.Mock;

      const info = await getUpdateInfo('1.1.0');
      expect(info).toBeNull();
    });

    it('should return null on network error', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

      const info = await getUpdateInfo('1.1.0');
      expect(info).toBeNull();
    });
  });
});

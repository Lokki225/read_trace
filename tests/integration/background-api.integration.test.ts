import { BackgroundProgressUpdate } from '../../src/extension/types';

jest.mock('../../src/extension/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  setDebugMode: jest.fn(),
  isDebugMode: jest.fn(() => false),
}));

const makeUpdate = (overrides: Partial<BackgroundProgressUpdate> = {}): BackgroundProgressUpdate => ({
  series_id: 'series-123',
  chapter: 10,
  scroll_position: 50,
  timestamp: Date.now(),
  url: 'https://mangadex.org/chapter/abc/1',
  ...overrides,
});

describe('API Client Integration', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('syncProgress()', () => {
    it('should return success response on 200', async () => {
      const mockResponse = {
        success: true,
        synced_at: '2026-01-01T00:00:00Z',
        next_sync_in: 5,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const { syncProgress } = require('../../src/extension/api');
      const result = await syncProgress(makeUpdate());

      expect(result.success).toBe(true);
      expect(result.synced_at).toBe('2026-01-01T00:00:00Z');
    });

    it('should send correct request body', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, synced_at: new Date().toISOString() }),
      });

      const { syncProgress } = require('../../src/extension/api');
      const update = makeUpdate({ series_id: 'test-series', chapter: 42, scroll_position: 75 });
      await syncProgress(update);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/progress/sync'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: expect.stringContaining('"series_id":"test-series"'),
        })
      );
    });

    it('should return failure on 5xx server error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const { syncProgress } = require('../../src/extension/api');
      const result = await syncProgress(makeUpdate());

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should return failure on 4xx client error (no retry)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      const { syncProgress } = require('../../src/extension/api');
      const result = await syncProgress(makeUpdate());

      expect(result.success).toBe(false);
      expect(result.error).toContain('400');
    });

    it('should return timeout error when request exceeds 5 seconds', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          setTimeout(() => reject(err), 10);
        });
      });

      const { syncProgress } = require('../../src/extension/api');
      const result = await syncProgress(makeUpdate());

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should return failure on network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const { syncProgress } = require('../../src/extension/api');
      const result = await syncProgress(makeUpdate());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should include auth token in headers when set', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, synced_at: new Date().toISOString() }),
      });

      const { syncProgress, setAuthToken } = require('../../src/extension/api');
      setAuthToken('test-token-abc');
      await syncProgress(makeUpdate());

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token-abc' }),
        })
      );
    });
  });
});

import {
  handleIncomingUpdate,
  onRealtimeUpdate,
  getRealtimeState,
  notifyExtensionOfUpdate,
  setConnected,
  resetState,
  RealtimeProgressUpdate,
} from '../../../src/extension/realtime';

jest.mock('../../../src/extension/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  setDebugMode: jest.fn(),
  isDebugMode: jest.fn(() => false),
}));

const makeUpdate = (overrides: Partial<RealtimeProgressUpdate> = {}): RealtimeProgressUpdate => ({
  series_id: 'series-1',
  user_id: 'user-1',
  current_chapter: 15,
  progress_percentage: 30,
  last_read_at: '2026-02-18T15:00:00Z',
  updated_at: '2026-02-18T15:00:00Z',
  ...overrides,
});

describe('extension/realtime', () => {
  beforeEach(() => {
    resetState();
    jest.clearAllMocks();
  });

  describe('getRealtimeState()', () => {
    it('should return initial disconnected state', () => {
      const state = getRealtimeState();
      expect(state.isConnected).toBe(false);
      expect(state.lastUpdate).toBeNull();
      expect(state.lastUpdateTime).toBeNull();
    });

    it('should return a shallow copy (not reference)', () => {
      const state1 = getRealtimeState();
      const state2 = getRealtimeState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('handleIncomingUpdate()', () => {
    it('should update state on valid update', () => {
      const update = makeUpdate();
      handleIncomingUpdate(update);

      const state = getRealtimeState();
      expect(state.isConnected).toBe(true);
      expect(state.lastUpdate).toEqual(update);
      expect(state.lastUpdateTime).not.toBeNull();
    });

    it('should call registered handlers with the update', () => {
      const handler = jest.fn();
      onRealtimeUpdate(handler);

      const update = makeUpdate();
      handleIncomingUpdate(update);

      expect(handler).toHaveBeenCalledWith(update);
    });

    it('should call multiple handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      onRealtimeUpdate(handler1);
      onRealtimeUpdate(handler2);

      handleIncomingUpdate(makeUpdate());

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should skip update with missing series_id', () => {
      const handler = jest.fn();
      onRealtimeUpdate(handler);

      handleIncomingUpdate(makeUpdate({ series_id: '' }));

      expect(handler).not.toHaveBeenCalled();
      expect(getRealtimeState().lastUpdate).toBeNull();
    });

    it('should skip update with missing user_id', () => {
      const handler = jest.fn();
      onRealtimeUpdate(handler);

      handleIncomingUpdate(makeUpdate({ user_id: '' }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should continue calling remaining handlers if one throws', () => {
      const badHandler = jest.fn().mockImplementation(() => {
        throw new Error('handler error');
      });
      const goodHandler = jest.fn();
      onRealtimeUpdate(badHandler);
      onRealtimeUpdate(goodHandler);

      handleIncomingUpdate(makeUpdate());

      expect(goodHandler).toHaveBeenCalledTimes(1);
    });

    it('should record lastUpdateTime as a number', () => {
      handleIncomingUpdate(makeUpdate());
      const state = getRealtimeState();
      expect(typeof state.lastUpdateTime).toBe('number');
    });
  });

  describe('onRealtimeUpdate()', () => {
    it('should return an unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = onRealtimeUpdate(handler);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should stop calling handler after unsubscribe', () => {
      const handler = jest.fn();
      const unsubscribe = onRealtimeUpdate(handler);

      unsubscribe();
      handleIncomingUpdate(makeUpdate());

      expect(handler).not.toHaveBeenCalled();
    });

    it('should only remove the specific handler when multiple registered', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const unsubscribe1 = onRealtimeUpdate(handler1);
      onRealtimeUpdate(handler2);

      unsubscribe1();
      handleIncomingUpdate(makeUpdate());

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('setConnected()', () => {
    it('should set isConnected to true', () => {
      setConnected(true);
      expect(getRealtimeState().isConnected).toBe(true);
    });

    it('should set isConnected to false', () => {
      setConnected(true);
      setConnected(false);
      expect(getRealtimeState().isConnected).toBe(false);
    });
  });

  describe('notifyExtensionOfUpdate()', () => {
    it('should not throw when chrome is undefined', () => {
      expect(() => notifyExtensionOfUpdate(makeUpdate())).not.toThrow();
    });

    it('should call chrome.runtime.sendMessage when chrome is available', () => {
      const mockSendMessage = jest.fn();
      const originalChrome = (global as any).chrome;

      (global as any).chrome = {
        runtime: {
          sendMessage: mockSendMessage,
          lastError: null,
        },
      };

      const update = makeUpdate();
      notifyExtensionOfUpdate(update);

      expect(mockSendMessage).toHaveBeenCalledWith(
        { type: 'REALTIME_PROGRESS_UPDATE', payload: update },
        expect.any(Function)
      );

      (global as any).chrome = originalChrome;
    });
  });

  describe('resetState()', () => {
    it('should reset state to initial values', () => {
      handleIncomingUpdate(makeUpdate());
      resetState();

      const state = getRealtimeState();
      expect(state.isConnected).toBe(false);
      expect(state.lastUpdate).toBeNull();
      expect(state.lastUpdateTime).toBeNull();
    });

    it('should clear all registered handlers', () => {
      const handler = jest.fn();
      onRealtimeUpdate(handler);
      resetState();

      handleIncomingUpdate(makeUpdate());
      expect(handler).not.toHaveBeenCalled();
    });
  });
});

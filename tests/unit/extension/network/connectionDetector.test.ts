jest.mock('../../../../src/extension/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  setDebugMode: jest.fn(),
  isDebugMode: jest.fn(() => false),
}));

import {
  getConnectionState,
  isOnline,
  onConnectionChange,
  forceStatus,
  resetState,
  getDebounceMs,
  ConnectionStatus,
} from '../../../../src/extension/network/connectionDetector';

describe('connectionDetector', () => {
  beforeEach(() => {
    resetState();
    jest.clearAllMocks();
  });

  describe('getConnectionState()', () => {
    it('should return initial state with online status', () => {
      const state = getConnectionState();
      expect(state.status).toBe('online');
      expect(state.changeCount).toBe(0);
    });

    it('should return a copy (not reference) of state', () => {
      const state1 = getConnectionState();
      const state2 = getConnectionState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('isOnline()', () => {
    it('should return true when status is online', () => {
      forceStatus('online');
      expect(isOnline()).toBe(true);
    });

    it('should return false when status is offline', () => {
      forceStatus('offline');
      expect(isOnline()).toBe(false);
    });
  });

  describe('forceStatus()', () => {
    it('should change status to offline', () => {
      forceStatus('offline');
      expect(getConnectionState().status).toBe('offline');
    });

    it('should change status back to online', () => {
      forceStatus('offline');
      forceStatus('online');
      expect(getConnectionState().status).toBe('online');
    });

    it('should increment changeCount on each status change', () => {
      forceStatus('offline');
      expect(getConnectionState().changeCount).toBe(1);
      forceStatus('online');
      expect(getConnectionState().changeCount).toBe(2);
    });

    it('should not increment changeCount when status is unchanged', () => {
      forceStatus('online');
      expect(getConnectionState().changeCount).toBe(0);
    });

    it('should update lastChanged timestamp on status change', () => {
      const before = Date.now();
      forceStatus('offline');
      const after = Date.now();
      const state = getConnectionState();
      expect(state.lastChanged).toBeGreaterThanOrEqual(before);
      expect(state.lastChanged).toBeLessThanOrEqual(after);
    });
  });

  describe('onConnectionChange()', () => {
    it('should call handler when status changes', () => {
      const handler = jest.fn();
      onConnectionChange(handler);

      forceStatus('offline');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('offline');
    });

    it('should call handler when status changes back to online', () => {
      const handler = jest.fn();
      onConnectionChange(handler);

      forceStatus('offline');
      forceStatus('online');

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, 'offline');
      expect(handler).toHaveBeenNthCalledWith(2, 'online');
    });

    it('should not call handler when status does not change', () => {
      const handler = jest.fn();
      onConnectionChange(handler);

      forceStatus('online');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      onConnectionChange(handler1);
      onConnectionChange(handler2);

      forceStatus('offline');

      expect(handler1).toHaveBeenCalledWith('offline');
      expect(handler2).toHaveBeenCalledWith('offline');
    });

    it('should return unsubscribe function that removes handler', () => {
      const handler = jest.fn();
      const unsubscribe = onConnectionChange(handler);

      unsubscribe();
      forceStatus('offline');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not throw if unsubscribe called twice', () => {
      const handler = jest.fn();
      const unsubscribe = onConnectionChange(handler);
      expect(() => {
        unsubscribe();
        unsubscribe();
      }).not.toThrow();
    });

    it('should continue calling remaining handlers after one is unsubscribed', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const unsubscribe1 = onConnectionChange(handler1);
      onConnectionChange(handler2);

      unsubscribe1();
      forceStatus('offline');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('offline');
    });

    it('should handle handler errors gracefully without stopping other handlers', () => {
      const badHandler = jest.fn(() => { throw new Error('handler error'); });
      const goodHandler = jest.fn();
      onConnectionChange(badHandler);
      onConnectionChange(goodHandler);

      expect(() => forceStatus('offline')).not.toThrow();
      expect(goodHandler).toHaveBeenCalledWith('offline');
    });
  });

  describe('resetState()', () => {
    it('should reset status to online', () => {
      forceStatus('offline');
      resetState();
      expect(getConnectionState().status).toBe('online');
    });

    it('should reset changeCount to 0', () => {
      forceStatus('offline');
      forceStatus('online');
      resetState();
      expect(getConnectionState().changeCount).toBe(0);
    });

    it('should clear all handlers', () => {
      const handler = jest.fn();
      onConnectionChange(handler);
      resetState();

      forceStatus('offline');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('getDebounceMs()', () => {
    it('should return 500ms debounce value', () => {
      expect(getDebounceMs()).toBe(500);
    });
  });
});

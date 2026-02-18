import { renderHook } from '@testing-library/react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

describe('useInfiniteScroll hook', () => {
  let mockIntersectionObserver: jest.Mock;
  let observeInstance: { observe: jest.Mock; unobserve: jest.Mock; disconnect: jest.Mock };

  beforeEach(() => {
    observeInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };

    mockIntersectionObserver = jest.fn((callback) => {
      return observeInstance;
    });

    global.IntersectionObserver = mockIntersectionObserver as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create IntersectionObserver with default threshold', () => {
    const callback = jest.fn();
    renderHook(() => useInfiniteScroll(callback));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '200px',
        threshold: 0,
      })
    );
  });

  it('should create IntersectionObserver with custom threshold', () => {
    const callback = jest.fn();
    renderHook(() => useInfiniteScroll(callback, { threshold: 500 }));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '500px',
      })
    );
  });

  it('should disconnect observer on unmount', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useInfiniteScroll(callback));

    unmount();

    expect(observeInstance.disconnect).toHaveBeenCalled();
  });

  it('should return ref object', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useInfiniteScroll(callback));

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
  });

  it('should trigger callback when entry is intersecting', () => {
    const callback = jest.fn();
    let capturedCallback: ((entries: any[]) => void) | null = null;

    mockIntersectionObserver.mockImplementation((cb: (entries: any[]) => void) => {
      capturedCallback = cb;
      return observeInstance;
    });

    renderHook(() => useInfiniteScroll(callback));

    if (capturedCallback) {
      (capturedCallback as (entries: any[]) => void)([{ isIntersecting: true }]);
    }

    expect(callback).toHaveBeenCalled();
  });

  it('should not trigger callback when entry is not intersecting', () => {
    const callback = jest.fn();
    let capturedCallback: ((entries: any[]) => void) | null = null;

    mockIntersectionObserver.mockImplementation((cb: (entries: any[]) => void) => {
      capturedCallback = cb;
      return observeInstance;
    });

    renderHook(() => useInfiniteScroll(callback));

    if (capturedCallback) {
      (capturedCallback as (entries: any[]) => void)([{ isIntersecting: false }]);
    }

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle missing IntersectionObserver gracefully', () => {
    const callback = jest.fn();
    const originalIO = global.IntersectionObserver;
    delete (global as any).IntersectionObserver;

    expect(() => {
      renderHook(() => useInfiniteScroll(callback));
    }).not.toThrow();

    global.IntersectionObserver = originalIO;
  });

  it('should update callback reference without re-observing', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { rerender } = renderHook(
      ({ cb }) => useInfiniteScroll(cb),
      { initialProps: { cb: callback1 } }
    );

    mockIntersectionObserver.mockClear();

    rerender({ cb: callback2 });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('should handle null ref gracefully', () => {
    const callback = jest.fn();
    renderHook(() => useInfiniteScroll(callback));

    expect(() => {
      observeInstance.observe(null);
    }).not.toThrow();
  });
});

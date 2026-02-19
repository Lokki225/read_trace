import {
  isValidScrollPosition,
  clampScrollPosition,
  percentageToPixels,
  pixelsToPercentage,
  isPositionStillValid,
  SCROLL_MIN,
  SCROLL_MAX,
} from '../../src/lib/scrollValidation';

describe('isValidScrollPosition', () => {
  it('returns true for 0 (minimum boundary)', () => {
    expect(isValidScrollPosition(0)).toBe(true);
  });

  it('returns true for 100 (maximum boundary)', () => {
    expect(isValidScrollPosition(100)).toBe(true);
  });

  it('returns true for midpoint value 50', () => {
    expect(isValidScrollPosition(50)).toBe(true);
  });

  it('returns true for fractional value within range', () => {
    expect(isValidScrollPosition(33.5)).toBe(true);
  });

  it('returns false for negative value', () => {
    expect(isValidScrollPosition(-1)).toBe(false);
  });

  it('returns false for value above 100', () => {
    expect(isValidScrollPosition(101)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidScrollPosition(NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidScrollPosition(Infinity)).toBe(false);
  });

  it('returns false for -Infinity', () => {
    expect(isValidScrollPosition(-Infinity)).toBe(false);
  });

  it('SCROLL_MIN is 0 and SCROLL_MAX is 100', () => {
    expect(SCROLL_MIN).toBe(0);
    expect(SCROLL_MAX).toBe(100);
  });
});

describe('clampScrollPosition', () => {
  it('returns 0 for negative values', () => {
    expect(clampScrollPosition(-10)).toBe(0);
  });

  it('returns 100 for values above 100', () => {
    expect(clampScrollPosition(150)).toBe(100);
  });

  it('returns value unchanged when within range', () => {
    expect(clampScrollPosition(50)).toBe(50);
  });

  it('returns 0 for NaN', () => {
    expect(clampScrollPosition(NaN)).toBe(0);
  });

  it('returns 0 for Infinity', () => {
    expect(clampScrollPosition(Infinity)).toBe(0);
  });

  it('rounds fractional values', () => {
    expect(clampScrollPosition(33.7)).toBe(34);
    expect(clampScrollPosition(33.2)).toBe(33);
  });

  it('returns 0 for exact minimum', () => {
    expect(clampScrollPosition(0)).toBe(0);
  });

  it('returns 100 for exact maximum', () => {
    expect(clampScrollPosition(100)).toBe(100);
  });
});

describe('percentageToPixels', () => {
  it('converts 50% to half the scrollable height', () => {
    expect(percentageToPixels(50, 1000)).toBe(500);
  });

  it('converts 0% to 0 pixels', () => {
    expect(percentageToPixels(0, 1000)).toBe(0);
  });

  it('converts 100% to full scrollable height', () => {
    expect(percentageToPixels(100, 1000)).toBe(1000);
  });

  it('returns 0 when scrollable height is 0', () => {
    expect(percentageToPixels(50, 0)).toBe(0);
  });

  it('returns 0 when scrollable height is negative', () => {
    expect(percentageToPixels(50, -100)).toBe(0);
  });

  it('clamps percentage before converting', () => {
    expect(percentageToPixels(150, 1000)).toBe(1000);
    expect(percentageToPixels(-10, 1000)).toBe(0);
  });

  it('rounds result to integer pixels', () => {
    const result = percentageToPixels(33, 1000);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('pixelsToPercentage', () => {
  it('converts half scrollable height to 50%', () => {
    expect(pixelsToPercentage(500, 1000)).toBe(50);
  });

  it('converts 0 pixels to 0%', () => {
    expect(pixelsToPercentage(0, 1000)).toBe(0);
  });

  it('converts full scrollable height to 100%', () => {
    expect(pixelsToPercentage(1000, 1000)).toBe(100);
  });

  it('returns 0 when scrollable height is 0', () => {
    expect(pixelsToPercentage(500, 0)).toBe(0);
  });

  it('clamps result to 0-100 range', () => {
    expect(pixelsToPercentage(2000, 1000)).toBe(100);
  });
});

describe('isPositionStillValid', () => {
  it('returns true for valid position with positive scrollable height', () => {
    expect(isPositionStillValid(50, 1000)).toBe(true);
  });

  it('returns true for position 0 with any scrollable height', () => {
    expect(isPositionStillValid(0, 1000)).toBe(true);
    expect(isPositionStillValid(0, 0)).toBe(true);
  });

  it('returns false for invalid position (NaN)', () => {
    expect(isPositionStillValid(NaN, 1000)).toBe(false);
  });

  it('returns false for position out of range', () => {
    expect(isPositionStillValid(-1, 1000)).toBe(false);
    expect(isPositionStillValid(101, 1000)).toBe(false);
  });

  it('returns false for non-zero position when scrollable height is 0', () => {
    expect(isPositionStillValid(50, 0)).toBe(false);
  });

  it('returns true for 100% position with positive scrollable height', () => {
    expect(isPositionStillValid(100, 500)).toBe(true);
  });
});

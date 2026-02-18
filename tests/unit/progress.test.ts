import { calculateProgress, formatProgressPercentage } from '../../src/lib/progress';

describe('calculateProgress', () => {
  it('calculates percentage from current and total chapters', () => {
    expect(calculateProgress(65, 100)).toBe(65);
  });

  it('rounds to nearest integer', () => {
    expect(calculateProgress(1, 3)).toBe(33);
  });

  it('returns 0 when total is null', () => {
    expect(calculateProgress(5, null)).toBe(0);
  });

  it('returns 0 when total is 0', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('returns 0 when current is 0', () => {
    expect(calculateProgress(0, 100)).toBe(0);
  });

  it('returns 100 when current equals total', () => {
    expect(calculateProgress(139, 139)).toBe(100);
  });

  it('clamps to 100 when current exceeds total', () => {
    expect(calculateProgress(150, 100)).toBe(100);
  });

  it('clamps to 0 when result is negative', () => {
    expect(calculateProgress(-5, 100)).toBe(0);
  });
});

describe('formatProgressPercentage', () => {
  it('formats 65 as "65%"', () => {
    expect(formatProgressPercentage(65)).toBe('65%');
  });

  it('formats 0 as "0%"', () => {
    expect(formatProgressPercentage(0)).toBe('0%');
  });

  it('formats 100 as "100%"', () => {
    expect(formatProgressPercentage(100)).toBe('100%');
  });

  it('clamps values above 100 to "100%"', () => {
    expect(formatProgressPercentage(150)).toBe('100%');
  });

  it('clamps negative values to "0%"', () => {
    expect(formatProgressPercentage(-10)).toBe('0%');
  });

  it('rounds decimal values', () => {
    expect(formatProgressPercentage(33.7)).toBe('34%');
  });
});

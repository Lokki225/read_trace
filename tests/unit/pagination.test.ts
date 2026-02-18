export const calculateOffset = (page: number, pageSize: number): number => {
  return page * pageSize;
};

export const checkHasMore = (returnedCount: number, requestedLimit: number): boolean => {
  return returnedCount >= requestedLimit;
};

describe('Pagination utilities', () => {
  describe('calculateOffset', () => {
    it('should calculate correct offset for page 0', () => {
      const offset = calculateOffset(0, 20);
      expect(offset).toBe(0);
    });

    it('should calculate correct offset for page 1', () => {
      const offset = calculateOffset(1, 20);
      expect(offset).toBe(20);
    });

    it('should calculate correct offset for page 2', () => {
      const offset = calculateOffset(2, 20);
      expect(offset).toBe(40);
    });

    it('should handle custom page size', () => {
      const offset = calculateOffset(3, 50);
      expect(offset).toBe(150);
    });

    it('should handle zero page', () => {
      const offset = calculateOffset(0, 100);
      expect(offset).toBe(0);
    });

    it('should handle large page numbers', () => {
      const offset = calculateOffset(100, 20);
      expect(offset).toBe(2000);
    });
  });

  describe('checkHasMore', () => {
    it('should return true when returned count equals requested limit', () => {
      const hasMore = checkHasMore(20, 20);
      expect(hasMore).toBe(true);
    });

    it('should return true when returned count exceeds requested limit', () => {
      const hasMore = checkHasMore(25, 20);
      expect(hasMore).toBe(true);
    });

    it('should return false when returned count is less than requested limit', () => {
      const hasMore = checkHasMore(15, 20);
      expect(hasMore).toBe(false);
    });

    it('should return false when returned count is zero', () => {
      const hasMore = checkHasMore(0, 20);
      expect(hasMore).toBe(false);
    });

    it('should return false when returned count is one less than limit', () => {
      const hasMore = checkHasMore(19, 20);
      expect(hasMore).toBe(false);
    });

    it('should handle large numbers', () => {
      const hasMore = checkHasMore(100, 100);
      expect(hasMore).toBe(true);
    });
  });
});

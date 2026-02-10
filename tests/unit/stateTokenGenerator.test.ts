import {
  generateStateToken,
  createStateTokenData,
  validateStateToken
} from '@/backend/services/oauth/stateTokenGenerator';

describe('State Token Generator', () => {
  describe('generateStateToken', () => {
    it('should generate a random token', () => {
      const token1 = generateStateToken();
      const token2 = generateStateToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it('should generate a 64-character hex string', () => {
      const token = generateStateToken();
      
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('createStateTokenData', () => {
    it('should create state token data with correct structure', () => {
      const token = generateStateToken();
      const data = createStateTokenData(token);
      
      expect(data.token).toBe(token);
      expect(data.createdAt).toBeDefined();
      expect(data.expiresAt).toBeDefined();
    });

    it('should set expiration to 5 minutes from creation', () => {
      const token = generateStateToken();
      const data = createStateTokenData(token);
      
      const expiryDiff = data.expiresAt - data.createdAt;
      expect(expiryDiff).toBe(5 * 60 * 1000);
    });
  });

  describe('validateStateToken', () => {
    it('should validate a correct token', () => {
      const token = generateStateToken();
      const data = createStateTokenData(token);
      
      const result = validateStateToken(data, token);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject an incorrect token', () => {
      const token = generateStateToken();
      const data = createStateTokenData(token);
      
      const result = validateStateToken(data, 'wrong-token');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid state token');
    });

    it('should reject an expired token', () => {
      const token = generateStateToken();
      const data = createStateTokenData(token);
      
      // Manually set expiration to past
      data.expiresAt = Date.now() - 1000;
      
      const result = validateStateToken(data, token);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('State token expired');
    });
  });
});

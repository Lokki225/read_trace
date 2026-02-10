import crypto from 'crypto';
import {
  encryptToken,
  decryptToken,
  EncryptedToken
} from '@/backend/services/oauth/tokenEncryption';

describe('Token Encryption', () => {
  let encryptionKey: Buffer;

  beforeEach(() => {
    encryptionKey = crypto.randomBytes(32);
  });

  describe('encryptToken', () => {
    it('should encrypt a token', () => {
      const token = 'test-oauth-token-12345';
      const encrypted = encryptToken(token, encryptionKey);

      expect(encrypted.iv).toBeDefined();
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
    });

    it('should produce different ciphertexts for same token', () => {
      const token = 'test-oauth-token-12345';
      const encrypted1 = encryptToken(token, encryptionKey);
      const encrypted2 = encryptToken(token, encryptionKey);

      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should produce valid hex strings', () => {
      const token = 'test-oauth-token-12345';
      const encrypted = encryptToken(token, encryptionKey);

      expect(encrypted.iv).toMatch(/^[a-f0-9]+$/);
      expect(encrypted.encryptedData).toMatch(/^[a-f0-9]+$/);
      expect(encrypted.authTag).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('decryptToken', () => {
    it('should decrypt an encrypted token', () => {
      const originalToken = 'test-oauth-token-12345';
      const encrypted = encryptToken(originalToken, encryptionKey);
      const decrypted = decryptToken(encrypted, encryptionKey);

      expect(decrypted).toBe(originalToken);
    });

    it('should handle long tokens', () => {
      const originalToken = 'x'.repeat(1000);
      const encrypted = encryptToken(originalToken, encryptionKey);
      const decrypted = decryptToken(encrypted, encryptionKey);

      expect(decrypted).toBe(originalToken);
    });

    it('should handle special characters', () => {
      const originalToken = 'token!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encryptToken(originalToken, encryptionKey);
      const decrypted = decryptToken(encrypted, encryptionKey);

      expect(decrypted).toBe(originalToken);
    });

    it('should fail with wrong encryption key', () => {
      const token = 'test-oauth-token-12345';
      const encrypted = encryptToken(token, encryptionKey);
      const wrongKey = crypto.randomBytes(32);

      expect(() => {
        decryptToken(encrypted, wrongKey);
      }).toThrow();
    });

    it('should fail with tampered ciphertext', () => {
      const token = 'test-oauth-token-12345';
      const encrypted = encryptToken(token, encryptionKey);
      
      const tampered: EncryptedToken = {
        ...encrypted,
        encryptedData: encrypted.encryptedData.slice(0, -2) + 'XX'
      };

      expect(() => {
        decryptToken(tampered, encryptionKey);
      }).toThrow();
    });
  });

  describe('Round-trip encryption/decryption', () => {
    it('should maintain token integrity through multiple cycles', () => {
      const originalToken = 'complex-token-with-special-chars-!@#$%';
      
      let encrypted = encryptToken(originalToken, encryptionKey);
      let decrypted = decryptToken(encrypted, encryptionKey);
      
      expect(decrypted).toBe(originalToken);

      encrypted = encryptToken(decrypted, encryptionKey);
      decrypted = decryptToken(encrypted, encryptionKey);
      
      expect(decrypted).toBe(originalToken);
    });
  });
});

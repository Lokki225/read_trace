import { validateProfileUpdate } from '@/backend/services/auth/profileValidator';

describe('ProfileForm Validation', () => {
  describe('Profile Update Validation', () => {
    it('should accept valid profile updates', () => {
      const validUpdate = {
        username: 'newusername',
        display_name: 'New Display Name',
        bio: 'Updated bio'
      };

      const result = validateProfileUpdate(validUpdate as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject username that is too short', () => {
      const invalidUpdate = {
        username: 'ab'
      };

      const result = validateProfileUpdate(invalidUpdate as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters');
    });

    it('should reject username with invalid characters', () => {
      const invalidUpdate = {
        username: 'user@name'
      };

      const result = validateProfileUpdate(invalidUpdate as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
    });

    it('should reject reserved usernames', () => {
      const invalidUpdate = {
        username: 'admin'
      };

      const result = validateProfileUpdate(invalidUpdate as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username is reserved and cannot be used');
    });

    it('should reject display name that is too long', () => {
      const invalidUpdate = {
        display_name: 'a'.repeat(101)
      };

      const result = validateProfileUpdate(invalidUpdate as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Display name must be at most 100 characters');
    });

    it('should reject bio that is too long', () => {
      const invalidUpdate = {
        bio: 'a'.repeat(501)
      };

      const result = validateProfileUpdate(invalidUpdate as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bio must be at most 500 characters');
    });

    it('should accept optional fields', () => {
      const validUpdate = {
        username: 'validuser'
      };

      const result = validateProfileUpdate(validUpdate as any);
      expect(result.isValid).toBe(true);
    });

    it('should accept undefined optional fields', () => {
      const validUpdate = {
        username: 'validuser'
      };

      const result = validateProfileUpdate(validUpdate as any);
      expect(result.isValid).toBe(true);
    });
  });
});

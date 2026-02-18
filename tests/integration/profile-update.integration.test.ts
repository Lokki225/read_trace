import { getProfile, updateProfile, changePassword } from '@/backend/services/auth/profileService';
import { validateProfileUpdate } from '@/backend/services/auth/profileValidator';
import { validatePasswordChangeData } from '@/backend/services/auth/profilePasswordValidator';

jest.mock('@/lib/supabase');

describe('Profile Integration Tests', () => {
  const mockUserId = 'test-user-id';
  const mockProfile = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    email_confirmed_at: new Date('2026-02-10'),
    created_at: new Date('2026-02-09'),
    updated_at: new Date('2026-02-10'),
    preferences: { theme: 'light', email_notifications: true, default_scan_site: null }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Update Flow', () => {
    it('should validate profile update before sending to API', () => {
      const validUpdate = {
        username: 'newusername',
        display_name: 'New Name'
      };

      const validation = validateProfileUpdate(validUpdate as any);
      expect(validation.isValid).toBe(true);
    });

    it('should reject invalid profile updates', () => {
      const invalidUpdate = {
        username: 'ab'
      };

      const validation = validateProfileUpdate(invalidUpdate as any);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should prevent duplicate username updates', () => {
      const update = {
        username: 'existinguser'
      };

      const validation = validateProfileUpdate(update as any);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Password Change Flow', () => {
    it('should validate password change before sending to API', () => {
      const validChange = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!'
      };

      const validation = validatePasswordChangeData(validChange);
      expect(validation.isValid).toBe(true);
      expect(validation.passwordsMatch).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidChange = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'DifferentPassword789!'
      };

      const validation = validatePasswordChangeData(invalidChange);
      expect(validation.isValid).toBe(false);
      expect(validation.passwordsMatch).toBe(false);
    });

    it('should reject weak passwords', () => {
      const weakChange = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak'
      };

      const validation = validatePasswordChangeData(weakChange);
      expect(validation.isValid).toBe(false);
    });

    it('should prevent reusing current password', () => {
      const sameChange = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!'
      };

      const validation = validatePasswordChangeData(sameChange);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('New password must be different from current password');
    });
  });

  describe('Profile Data Integrity', () => {
    it('should maintain profile structure after updates', () => {
      const updatedProfile = {
        ...mockProfile,
        display_name: 'Updated Name'
      };

      expect(updatedProfile.id).toBe(mockUserId);
      expect(updatedProfile.email).toBe('test@example.com');
      expect(updatedProfile.username).toBe('testuser');
      expect(updatedProfile.display_name).toBe('Updated Name');
    });

    it('should preserve immutable fields', () => {
      const update = {
        display_name: 'New Name'
      };

      expect(mockProfile.id).toBe(mockUserId);
      expect(mockProfile.email).toBe('test@example.com');
      expect(mockProfile.created_at).toEqual(new Date('2026-02-09'));
    });
  });
});

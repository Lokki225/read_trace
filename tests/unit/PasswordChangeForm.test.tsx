import { validatePasswordChange, validatePasswordChangeData } from '@/backend/services/auth/profilePasswordValidator';
import { PasswordChange } from '@/model/schemas/profile';

describe('PasswordChangeForm Validation', () => {
  describe('Email/password account — Change Password flow', () => {
    it('should accept valid password change', () => {
      const result = validatePasswordChange(
        'CurrentPassword123!',
        'NewPassword456!',
        'NewPassword456!'
      );

      expect(result.isValid).toBe(true);
      expect(result.passwordsMatch).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const result = validatePasswordChange(
        'CurrentPassword123!',
        'NewPassword456!',
        'DifferentPassword789!'
      );

      expect(result.isValid).toBe(false);
      expect(result.passwordsMatch).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });

    it('should reject when new password is same as current', () => {
      const result = validatePasswordChange(
        'SamePassword123!',
        'SamePassword123!',
        'SamePassword123!'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('New password must be different from current password');
    });

    it('should reject weak password', () => {
      const result = validatePasswordChange(
        'CurrentPassword123!',
        'weak',
        'weak'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject when current password is missing', () => {
      const result = validatePasswordChange(
        '',
        'NewPassword456!',
        'NewPassword456!'
      );

      expect(result.isValid).toBe(false);
      expect(result.currentPasswordValid).toBe(false);
      expect(result.errors).toContain('Current password is required');
    });

    it('should reject when new password is missing', () => {
      const result = validatePasswordChange(
        'CurrentPassword123!',
        '',
        ''
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('New password is required');
    });

    it('should validate password change data object', () => {
      const data: PasswordChange = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!'
      };

      const result = validatePasswordChangeData(data);

      expect(result.isValid).toBe(true);
      expect(result.passwordsMatch).toBe(true);
    });

    it('should provide password strength feedback', () => {
      const result = validatePasswordChange(
        'CurrentPassword123!',
        'VeryStrongPassword123!@#',
        'VeryStrongPassword123!@#'
      );

      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Provider-only account — Set Password flow', () => {
    it('should accept valid set-password request without currentPassword', () => {
      const result = validatePasswordChangeData(
        { newPassword: 'NewPassword456!', confirmPassword: 'NewPassword456!' },
        { requireCurrentPassword: false }
      );

      expect(result.isValid).toBe(true);
      expect(result.currentPasswordValid).toBe(true);
      expect(result.passwordsMatch).toBe(true);
    });

    it('should reject mismatched passwords even without currentPassword', () => {
      const result = validatePasswordChangeData(
        { newPassword: 'NewPassword456!', confirmPassword: 'Different789!' },
        { requireCurrentPassword: false }
      );

      expect(result.isValid).toBe(false);
      expect(result.passwordsMatch).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });

    it('should reject weak password in set-password mode', () => {
      const result = validatePasswordChangeData(
        { newPassword: 'weak', confirmPassword: 'weak' },
        { requireCurrentPassword: false }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should not require currentPassword for provider-only accounts', () => {
      const result = validatePasswordChangeData(
        { newPassword: 'StrongPass123!', confirmPassword: 'StrongPass123!' },
        { requireCurrentPassword: false }
      );

      expect(result.errors).not.toContain('Current password is required');
    });
  });
});

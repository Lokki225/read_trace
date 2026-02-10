import {
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  type PasswordRequirements
} from '@/backend/services/auth/passwordValidator';

describe('Password Validator', () => {
  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = validatePassword('SecurePass123!');

      expect(result.isValid).toBe(true);
      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Short1!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('lowercase123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('UPPERCASE123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('NoNumbers!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('NoSpecial123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject common passwords', () => {
      const commonPasswords = ['password', '123456', 'qwerty', 'letmein'];

      commonPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).toContain('This password is too common. Please choose a different one');
      });
    });

    it('should handle empty password', () => {
      const result = validatePassword('');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should calculate score for valid passwords', () => {
      const result = validatePassword('Pass123!');

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should award bonus points for longer passwords', () => {
      const short = validatePassword('Pass123!');
      const medium = validatePassword('Pass1234!');
      const long = validatePassword('Pass12345678!');

      expect(long.score).toBeGreaterThanOrEqual(medium.score);
      expect(medium.score).toBeGreaterThanOrEqual(short.score);
    });

    it('should award bonus for character diversity', () => {
      const repetitive = validatePassword('Aaaaaaa1!');
      const diverse = validatePassword('Abcd1234!@#$');

      expect(diverse.score).toBeGreaterThan(repetitive.score);
    });

    it('should cap score at 100', () => {
      const result = validatePassword('VeryStrongP@ssw0rd123WithManyChars!@#$%');

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should respect custom requirements', () => {
      const customRequirements: PasswordRequirements = {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: false,
        blockCommon: false
      };

      const result = validatePassword('Password1234', customRequirements);

      expect(result.isValid).toBe(true);
    });

    it('should allow disabling special character requirement', () => {
      const customRequirements: PasswordRequirements = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: false,
        blockCommon: false
      };

      const result = validatePassword('Password123', customRequirements);

      expect(result.isValid).toBe(true);
      expect(result.errors).not.toContain('Password must contain at least one special character');
    });

    it('should handle all requirements failing', () => {
      const result = validatePassword('abc');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should return multiple errors when multiple requirements fail', () => {
      const result = validatePassword('short');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return "weak" for score < 40', () => {
      expect(getPasswordStrengthLabel(0)).toBe('weak');
      expect(getPasswordStrengthLabel(20)).toBe('weak');
      expect(getPasswordStrengthLabel(39)).toBe('weak');
    });

    it('should return "medium" for score 40-69', () => {
      expect(getPasswordStrengthLabel(40)).toBe('medium');
      expect(getPasswordStrengthLabel(55)).toBe('medium');
      expect(getPasswordStrengthLabel(69)).toBe('medium');
    });

    it('should return "strong" for score >= 70', () => {
      expect(getPasswordStrengthLabel(70)).toBe('strong');
      expect(getPasswordStrengthLabel(85)).toBe('strong');
      expect(getPasswordStrengthLabel(100)).toBe('strong');
    });
  });

  describe('getPasswordStrengthColor', () => {
    it('should return "red" for score < 40', () => {
      expect(getPasswordStrengthColor(0)).toBe('red');
      expect(getPasswordStrengthColor(20)).toBe('red');
      expect(getPasswordStrengthColor(39)).toBe('red');
    });

    it('should return "yellow" for score 40-69', () => {
      expect(getPasswordStrengthColor(40)).toBe('yellow');
      expect(getPasswordStrengthColor(55)).toBe('yellow');
      expect(getPasswordStrengthColor(69)).toBe('yellow');
    });

    it('should return "green" for score >= 70', () => {
      expect(getPasswordStrengthColor(70)).toBe('green');
      expect(getPasswordStrengthColor(85)).toBe('green');
      expect(getPasswordStrengthColor(100)).toBe('green');
    });
  });
});

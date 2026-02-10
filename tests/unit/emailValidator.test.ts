import { validateEmail } from '@/backend/services/auth/emailValidator';

describe('Email Validator', () => {
  describe('validateEmail', () => {
    it('should validate a correct email address', () => {
      const result = validateEmail('user@example.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user@example.com');
      expect(result.error).toBeNull();
    });

    it('should normalize email to lowercase', () => {
      const result = validateEmail('User@Example.COM');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const result = validateEmail('  user@example.com  ');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user@example.com');
    });

    it('should reject empty email', () => {
      const result = validateEmail('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
      expect(result.normalizedEmail).toBeNull();
    });

    it('should reject email without @ symbol', () => {
      const result = validateEmail('userexample.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should reject email without domain', () => {
      const result = validateEmail('user@');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should reject email without username', () => {
      const result = validateEmail('@example.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should reject email with consecutive dots', () => {
      const result = validateEmail('user..name@example.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email contains invalid consecutive dots');
    });

    it('should reject email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is too long (maximum 255 characters)');
    });

    it('should reject disposable email domains', () => {
      const disposableDomains = [
        'user@tempmail.com',
        'user@10minutemail.com',
        'user@guerrillamail.com',
        'user@mailinator.com'
      ];

      disposableDomains.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Disposable email addresses are not allowed');
      });
    });

    it('should accept valid email with numbers', () => {
      const result = validateEmail('user123@example.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user123@example.com');
    });

    it('should accept valid email with dots in username', () => {
      const result = validateEmail('first.last@example.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('first.last@example.com');
    });

    it('should accept valid email with hyphens in domain', () => {
      const result = validateEmail('user@my-domain.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user@my-domain.com');
    });

    it('should accept valid email with subdomain', () => {
      const result = validateEmail('user@mail.example.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user@mail.example.com');
    });

    it('should accept valid email with plus sign', () => {
      const result = validateEmail('user+tag@example.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user+tag@example.com');
    });

    it('should reject email with spaces', () => {
      const result = validateEmail('user name@example.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should reject email with invalid characters', () => {
      const result = validateEmail('user@exam ple.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should handle multiple validation failures', () => {
      const result = validateEmail('invalid..email@');

      expect(result.isValid).toBe(false);
      expect(result.normalizedEmail).toBeNull();
    });

    it('should accept email with underscore', () => {
      const result = validateEmail('user_name@example.com');

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('user_name@example.com');
    });
  });
});

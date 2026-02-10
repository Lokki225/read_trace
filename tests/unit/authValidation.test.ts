import { registrationSchema, loginSchema, passwordResetSchema } from '@/model/validation/authValidation';
import { z } from 'zod';

describe('Auth Validation Schemas', () => {
  describe('registrationSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('SecurePass123!');
      }
    });

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'User@Example.COM',
        password: 'SecurePass123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should reject empty email', () => {
      const data = {
        email: '',
        password: 'SecurePass123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required');
      }
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'not-an-email',
        password: 'SecurePass123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject email that is too long', () => {
      const data = {
        email: 'a'.repeat(250) + '@example.com',
        password: 'SecurePass123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is too long');
      }
    });

    it('should reject empty password', () => {
      const data = {
        email: 'user@example.com',
        password: ''
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });

    it('should reject password that is too short', () => {
      const data = {
        email: 'user@example.com',
        password: 'Short1!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid password');
      }
    });

    it('should reject password without uppercase', () => {
      const data = {
        email: 'user@example.com',
        password: 'lowercase123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const data = {
        email: 'user@example.com',
        password: 'UPPERCASE123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const data = {
        email: 'user@example.com',
        password: 'NoNumbers!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const data = {
        email: 'user@example.com',
        password: 'NoSpecial123'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject both invalid email and password', () => {
      const data = {
        email: 'invalid-email',
        password: 'weak'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should handle missing fields', () => {
      const data = {};

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should trim whitespace from email', () => {
      const data = {
        email: '  user@example.com  ',
        password: 'SecurePass123!'
      };

      const result = registrationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'user@example.com',
        password: 'anypassword'
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('anypassword');
      }
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'anypassword'
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const data = {
        email: 'user@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetSchema', () => {
    it('should validate correct email', () => {
      const data = {
        email: 'user@example.com'
      };

      const result = passwordResetSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email'
      };

      const result = passwordResetSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const data = {
        email: ''
      };

      const result = passwordResetSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});

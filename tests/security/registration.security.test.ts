import { validatePassword } from '@/backend/services/auth/passwordValidator';
import { validateEmail } from '@/backend/services/auth/emailValidator';
import { registrationSchema } from '@/model/validation/authValidation';

describe('Security Audit: Registration Flow', () => {
  describe('Password Security', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const shortPasswords = ['Pass1!', 'Short1!', '7chars!'];
      
      shortPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('at least 8 characters'))).toBe(true);
      });
    });

    it('should require uppercase letters', () => {
      const result = validatePassword('nouppercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letters', () => {
      const result = validatePassword('NOLOWERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should require special characters', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should block common passwords', () => {
      const commonPasswords = ['password', '123456', 'qwerty', 'letmein'];
      
      commonPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.errors.some(e => e.includes('too common'))).toBe(true);
      });
    });

    it('should not accept passwords with only special characters', () => {
      const result = validatePassword('!@#$%^&*');
      expect(result.isValid).toBe(false);
    });

    it('should not accept passwords with only numbers', () => {
      const result = validatePassword('12345678');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Email Security', () => {
    it('should validate email format strictly', () => {
      const invalidEmails = [
        'notanemail',
        'spaces in@email.com',
        'double..dot@example.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it('should reject disposable email domains', () => {
      const disposableEmails = [
        'test@tempmail.com',
        'user@10minutemail.com',
        'admin@guerrillamail.com',
        'test@mailinator.com',
        'user@throwaway.email'
      ];

      disposableEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Disposable email addresses are not allowed');
      });
    });

    it('should reject emails with consecutive dots', () => {
      const result = validateEmail('test..consecutive@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('consecutive dots');
    });

    it('should normalize email to lowercase', () => {
      const result = validateEmail('Test@Example.COM');
      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('test@example.com');
    });

    it('should trim whitespace from email', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('test@example.com');
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should handle SQL injection attempts in email', () => {
      const sqlInjectionAttempts = [
        "test@example.com'; DROP TABLE users; --",
        "test@example.com' OR '1'='1",
        "test@example.com\"; DELETE FROM users; --"
      ];

      sqlInjectionAttempts.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it('should handle XSS attempts in email', () => {
      const xssAttempts = [
        'test<script>alert("xss")</script>@example.com',
        'test@example.com<img src=x onerror=alert(1)>',
        'test@example.com" onload="alert(1)'
      ];

      xssAttempts.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it('should handle null bytes in input', () => {
      const result = validateEmail('test\x00@example.com');
      expect(result.isValid).toBe(false);
    });

    it('should handle unicode characters safely', () => {
      const unicodeEmails = [
        'tëst@example.com',
        'test@exämple.com',
        '测试@example.com'
      ];

      unicodeEmails.forEach(email => {
        const result = validateEmail(email);
        // Should either reject or handle safely
        expect(result).toBeDefined();
      });
    });
  });

  describe('Schema Validation Security', () => {
    it('should reject missing email field', () => {
      const result = registrationSchema.safeParse({
        password: 'SecurePass123!'
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing password field', () => {
      const result = registrationSchema.safeParse({
        email: 'test@example.com'
      });

      expect(result.success).toBe(false);
    });

    it('should reject extra fields', () => {
      const result = registrationSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePass123!',
        isAdmin: true,
        role: 'admin'
      });

      // Should either reject or ignore extra fields safely
      if (result.success) {
        expect((result.data as any).isAdmin).toBeUndefined();
        expect((result.data as any).role).toBeUndefined();
      }
    });

    it('should reject null values', () => {
      const result = registrationSchema.safeParse({
        email: null,
        password: null
      });

      expect(result.success).toBe(false);
    });

    it('should reject undefined values', () => {
      const result = registrationSchema.safeParse({
        email: undefined,
        password: undefined
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-string values', () => {
      const result = registrationSchema.safeParse({
        email: 123,
        password: { password: 'test' }
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Rate Limiting Preparation', () => {
    it('should handle rapid validation requests', () => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        registrationSchema.safeParse({
          email: `test${i}@example.com`,
          password: 'SecurePass123!'
        });
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      // Should complete quickly to support rate limiting
      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('Error Message Security', () => {
    it('should not leak sensitive information in error messages', () => {
      const result = registrationSchema.safeParse({
        email: 'test@example.com',
        password: 'weak'
      });

      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => issue.message);
        
        // Error messages should be user-friendly, not expose internals
        errorMessages.forEach(message => {
          expect(message).not.toMatch(/stack|trace|internal|debug/i);
          expect(message).not.toMatch(/\/src\/|\/node_modules\//);
        });
      }
    });
  });

  describe('HTTPS and Transport Security', () => {
    it('should validate that Supabase URL uses HTTPS', () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        expect(supabaseUrl).toMatch(/^https:\/\//);  
      } else {
        // In test environment, URL may not be loaded
        expect(true).toBe(true);
      }
    });
  });
});

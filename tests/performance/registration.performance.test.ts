import { validatePassword } from '@/backend/services/auth/passwordValidator';
import { validateEmail } from '@/backend/services/auth/emailValidator';
import { registrationSchema } from '@/model/validation/authValidation';

describe('Performance Benchmarks: Registration Flow', () => {
  describe('Password Validation Performance', () => {
    it('should validate password in < 5ms', () => {
      const password = 'SecurePass123!';
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        validatePassword(password);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;
      console.log(`Password validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(5);
    });

    it('should handle weak passwords efficiently', () => {
      const weakPassword = 'weak';
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        validatePassword(weakPassword);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;
      console.log(`Weak password validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(5);
    });
  });

  describe('Email Validation Performance', () => {
    it('should validate email in < 3ms', () => {
      const email = 'test@example.com';
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        validateEmail(email);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;
      console.log(`Email validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(3);
    });

    it('should handle invalid emails efficiently', () => {
      const invalidEmail = 'invalid-email';
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        validateEmail(invalidEmail);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;
      console.log(`Invalid email validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(3);
    });
  });

  describe('Zod Schema Validation Performance', () => {
    it('should validate registration schema in < 10ms', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      const iterations = 500;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        registrationSchema.safeParse(validData);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;
      console.log(`Schema validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(10);
    });

    it('should reject invalid data quickly', () => {
      const invalidData = {
        email: 'invalid',
        password: 'weak'
      };
      const iterations = 500;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        registrationSchema.safeParse(invalidData);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;
      console.log(`Invalid schema validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('Combined Validation Performance', () => {
    it('should complete full validation in < 20ms', () => {
      const testCases = [
        { email: 'test1@example.com', password: 'SecurePass123!' },
        { email: 'test2@example.com', password: 'AnotherPass456!' },
        { email: 'test3@example.com', password: 'ThirdPass789!' },
      ];
      const iterations = 100;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        testCases.forEach(testCase => {
          registrationSchema.safeParse(testCase);
        });
      }
      const end = performance.now();

      const avgTime = (end - start) / (iterations * testCases.length);
      console.log(`Combined validation avg time: ${avgTime.toFixed(3)}ms`);
      
      expect(avgTime).toBeLessThan(20);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated validations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        validatePassword(`Password${i}!`);
        validateEmail(`test${i}@example.com`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

      console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB for ${iterations} iterations`);
      
      // Memory increase should be reasonable (less than 50MB for 10k iterations)
      expect(memoryIncrease).toBeLessThan(50);
    });
  });
});

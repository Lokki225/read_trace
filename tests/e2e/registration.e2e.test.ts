import { createClient } from '@/lib/supabase';
import { authService, AuthServiceError } from '@/backend/services/auth/authService';

// Mock the Supabase client
jest.mock('@/lib/supabase');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('E2E: User Registration Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Registration Flow', () => {
    it('should complete full registration flow with valid credentials', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: testEmail,
            email_confirmed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          session: null
        },
        error: null
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      const result = await authService.signUp(testEmail, testPassword);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testEmail);
      expect(result.user.id).toBeDefined();
      expect(result.requiresEmailConfirmation).toBe(true);
      expect(mockSignUp).toHaveBeenCalled();
    });

    it('should handle successful email confirmation', async () => {
      const mockResend = jest.fn().mockResolvedValue({
        data: {},
        error: null
      });

      mockCreateClient.mockReturnValue({
        auth: { resend: mockResend }
      } as any);

      await expect(
        authService.resendConfirmationEmail(testEmail)
      ).resolves.not.toThrow();

      expect(mockResend).toHaveBeenCalledWith({
        type: 'signup',
        email: testEmail
      });
    });
  });

  describe('Registration Error Handling', () => {
    it('should handle duplicate email with appropriate error', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await expect(
        authService.signUp(testEmail, testPassword)
      ).rejects.toThrow('already exists');
    });

    it('should handle rate limiting errors', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email rate limit exceeded' }
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await expect(
        authService.signUp(testEmail, testPassword)
      ).rejects.toThrow('Too many registration attempts');
    });

    it('should handle Supabase service errors', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Service temporarily unavailable' }
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await expect(
        authService.signUp(testEmail, testPassword)
      ).rejects.toThrow('Registration failed');
    });

    it('should handle missing user data in response', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await expect(
        authService.signUp(testEmail, testPassword)
      ).rejects.toThrow('Registration failed');
    });
  });

  describe('Validation Before API Call', () => {
    it('should validate email format before calling Supabase', async () => {
      const mockSignUp = jest.fn();

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await expect(
        authService.signUp('invalid-email', testPassword)
      ).rejects.toThrow(AuthServiceError);

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should validate password before calling Supabase', async () => {
      const mockSignUp = jest.fn();

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await expect(
        authService.signUp(testEmail, 'weak')
      ).rejects.toThrow(AuthServiceError);

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should normalize email before sending to Supabase', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            email_confirmed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          session: null
        },
        error: null
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      await authService.signUp('Test@Example.COM', testPassword);

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com'
        })
      );
    });
  });

  describe('Email Confirmation Flow', () => {
    it('should set correct confirmation status', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: testEmail,
            email_confirmed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          session: null
        },
        error: null
      });

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp }
      } as any);

      const result = await authService.signUp(testEmail, testPassword);

      expect(result.requiresEmailConfirmation).toBe(true);
      expect(result.user.email_confirmed_at).toBeNull();
    });

    it('should handle resend confirmation email errors', async () => {
      const mockResend = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded' }
      });

      mockCreateClient.mockReturnValue({
        auth: { resend: mockResend }
      } as any);

      await expect(
        authService.resendConfirmationEmail(testEmail)
      ).rejects.toThrow('Failed to resend confirmation email');
    });
  });
});

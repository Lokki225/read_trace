import { authService, AuthServiceError } from '@/backend/services/auth/authService';
import { createServerClient } from '@/lib/supabase';

jest.mock('@/lib/supabase');

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;

describe('Registration Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('should successfully register a new user', async () => {
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

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    const result = await authService.signUp('test@example.com', 'SecurePass123!');

    expect(result.user.email).toBe('test@example.com');
    expect(result.requiresEmailConfirmation).toBe(true);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123!',
      options: expect.objectContaining({
        emailRedirectTo: expect.stringContaining('/auth/confirm-email'),
        data: {
          email: 'test@example.com'
        }
      })
    });
  });

  it('should handle duplicate email error', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' }
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await expect(
      authService.signUp('existing@example.com', 'SecurePass123!')
    ).rejects.toThrow('An account with this email already exists');
  });

  it('should handle rate limit error', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email rate limit exceeded' }
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await expect(
      authService.signUp('ratelimit@example.com', 'SecurePass123!')
    ).rejects.toThrow('Too many registration attempts');
  });

  it('should validate email format before calling Supabase', async () => {
    const mockSignUp = jest.fn();

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await expect(
      authService.signUp('invalid-email', 'SecurePass123!')
    ).rejects.toThrow(AuthServiceError);

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should validate password requirements before calling Supabase', async () => {
    const mockSignUp = jest.fn();

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await expect(
      authService.signUp('test@example.com', 'weak')
    ).rejects.toThrow(AuthServiceError);

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should normalize email to lowercase', async () => {
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

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await authService.signUp('Test@Example.COM', 'SecurePass123!');

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com'
      })
    );
  });

  it('should handle generic Supabase errors', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Unknown database error' }
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await expect(
      authService.signUp('test@example.com', 'SecurePass123!')
    ).rejects.toThrow('Registration failed');
  });

  it('should handle missing user data in response', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    await expect(
      authService.signUp('test@example.com', 'SecurePass123!')
    ).rejects.toThrow('Registration failed');
  });

  it('should set requiresEmailConfirmation to false when email is confirmed', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        session: null
      },
      error: null
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    const result = await authService.signUp('test@example.com', 'SecurePass123!');

    expect(result.requiresEmailConfirmation).toBe(false);
  });
});

describe('Resend Confirmation Email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully resend confirmation email', async () => {
    const mockResend = jest.fn().mockResolvedValue({
      data: {},
      error: null
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { resend: mockResend }
    });

    await expect(
      authService.resendConfirmationEmail('test@example.com')
    ).resolves.not.toThrow();

    expect(mockResend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'test@example.com'
    });
  });

  it('should handle resend errors', async () => {
    const mockResend = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' }
    });

    (mockCreateServerClient as jest.Mock).mockReturnValue({
      auth: { resend: mockResend }
    });

    await expect(
      authService.resendConfirmationEmail('test@example.com')
    ).rejects.toThrow('Failed to resend confirmation email');
  });
});

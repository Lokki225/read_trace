import { createServerClient } from '@/lib/supabase';
import { registrationSchema, type RegistrationFormData } from '@/model/validation/authValidation';
import type { RegistrationResult } from '@/model/schemas/user';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export class AuthService {
  async signUp(email: string, password: string): Promise<RegistrationResult> {
    try {
      const validationResult = registrationSchema.safeParse({ email, password });
      
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        throw new AuthServiceError(
          firstError.message,
          'VALIDATION_ERROR',
          400
        );
      }

      const { email: normalizedEmail, password: validatedPassword } = validationResult.data;

      const supabase = await createServerClient();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: validatedPassword,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm-email`,
          data: {
            email: normalizedEmail
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new AuthServiceError(
            'An account with this email already exists. Please log in instead.',
            'USER_ALREADY_EXISTS',
            409
          );
        }

        if (error.message.includes('Email rate limit')) {
          throw new AuthServiceError(
            'Too many registration attempts. Please try again later.',
            'RATE_LIMIT_EXCEEDED',
            429
          );
        }

        throw new AuthServiceError(
          'Registration failed. Please try again.',
          'REGISTRATION_FAILED',
          500
        );
      }

      if (!data.user) {
        throw new AuthServiceError(
          'Registration failed. Please try again.',
          'NO_USER_DATA',
          500
        );
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          email_confirmed_at: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
          created_at: new Date(data.user.created_at!),
          updated_at: new Date(data.user.updated_at!)
        },
        requiresEmailConfirmation: !data.user.email_confirmed_at
      };

    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }

      console.error('Unexpected error during registration:', error);
      throw new AuthServiceError(
        'An unexpected error occurred. Please try again.',
        'UNEXPECTED_ERROR',
        500
      );
    }
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      throw new AuthServiceError(
        'Failed to resend confirmation email. Please try again.',
        'RESEND_FAILED',
        500
      );
    }
  }
}

export const authService = new AuthService();

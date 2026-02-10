import { z } from 'zod';
import { validateEmail } from '@/backend/services/auth/emailValidator';
import { validatePassword } from '@/backend/services/auth/passwordValidator';

export const registrationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .refine(
      (email: string) => validateEmail(email).isValid,
      {
        message: 'Invalid email address'
      }
    )
    .transform((email: string) => validateEmail(email).normalizedEmail!),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .refine(
      (password: string) => validatePassword(password).isValid,
      {
        message: 'Invalid password'
      }
    )
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
});

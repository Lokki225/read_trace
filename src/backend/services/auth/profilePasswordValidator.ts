import { validatePassword, PasswordValidationResult } from './passwordValidator';
import { PasswordChange } from '../../../model/schemas/profile';

export interface PasswordChangeValidationResult extends PasswordValidationResult {
  currentPasswordValid: boolean;
  passwordsMatch: boolean;
}

export interface PasswordChangeValidationOptions {
  requireCurrentPassword?: boolean;
}

/**
 * Validates password change request according to security requirements:
 * - Current password must be provided (for verification)
 * - New password must meet strength requirements
 * - Confirmation password must match new password
 * - New password must be different from current password
 */
export function validatePasswordChange(
  currentPassword: string | undefined,
  newPassword: string,
  confirmPassword: string,
  options: PasswordChangeValidationOptions = {}
): PasswordChangeValidationResult {
  const { requireCurrentPassword = true } = options;
  const errors: string[] = [];
  const feedback: string[] = [];
  
  // Validate current password is provided when required
  if (requireCurrentPassword) {
    if (!currentPassword || currentPassword.trim().length === 0) {
      errors.push('Current password is required');
    }
  }
  
  // Validate new password is provided
  if (!newPassword || newPassword.trim().length === 0) {
    errors.push('New password is required');
  }
  
  // Validate confirmation password is provided
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    errors.push('Password confirmation is required');
  }
  
  // Check if passwords match
  const passwordsMatch = newPassword === confirmPassword;
  if (!passwordsMatch && newPassword && confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  // Check if new password is different from current password
  const passwordsDifferent = newPassword !== currentPassword;
  if (!passwordsDifferent && newPassword && currentPassword) {
    errors.push('New password must be different from current password');
  }
  
  // Validate new password strength (only if other validations pass)
  let passwordValidation: PasswordValidationResult = {
    isValid: false,
    isStrong: false,
    score: 0,
    errors: [],
    feedback: []
  };
  
  if (newPassword && passwordsMatch && passwordsDifferent) {
    passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    feedback.push(...passwordValidation.feedback);
  }
  
  const isValid = errors.length === 0;
  const isStrong = passwordValidation.isStrong;
  const score = passwordValidation.score;
  
  const currentPasswordValid = requireCurrentPassword
    ? Boolean(currentPassword && currentPassword.trim().length > 0)
    : true;

  return {
    isValid,
    isStrong,
    score,
    errors,
    feedback,
    currentPasswordValid,
    passwordsMatch
  };
}

/**
 * Validates password change data object
 */
export function validatePasswordChangeData(
  data: PasswordChange,
  options: PasswordChangeValidationOptions = {}
): PasswordChangeValidationResult {
  return validatePasswordChange(
    data.currentPassword,
    data.newPassword,
    data.confirmPassword,
    options
  );
}

/**
 * Checks if a password change request should be allowed based on validation results
 */
export function isPasswordChangeAllowed(result: PasswordChangeValidationResult): boolean {
  return result.isValid && result.currentPasswordValid && result.passwordsMatch;
}

/**
 * Gets user-friendly error messages for password change validation
 */
export function getPasswordChangeErrorMessages(result: PasswordChangeValidationResult): string[] {
  const messages: string[] = [];
  
  if (!result.currentPasswordValid) {
    messages.push('Please enter your current password');
  }
  
  if (!result.passwordsMatch && result.errors.some(e => e.includes('do not match'))) {
    messages.push('New password and confirmation must match');
  }
  
  // Add strength-related errors
  const strengthErrors = result.errors.filter(e => 
    e.includes('at least') || 
    e.includes('contain') || 
    e.includes('too common')
  );
  
  if (strengthErrors.length > 0) {
    messages.push('Password requirements not met:');
    strengthErrors.forEach(error => {
      messages.push(`• ${error}`);
    });
  }
  
  return messages;
}

/**
 * Gets password strength feedback for UI display
 */
export function getPasswordStrengthFeedback(result: PasswordChangeValidationResult): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  const label = result.score < 40 ? 'weak' : result.score < 70 ? 'medium' : 'strong';
  const color = result.score < 40 ? 'red' : result.score < 70 ? 'yellow' : 'green';
  
  return {
    score: result.score,
    label,
    color,
    feedback: result.feedback
  };
}

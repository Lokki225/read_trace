export interface PasswordValidationResult {
  isValid: boolean;
  isStrong: boolean;
  score: number;
  errors: string[];
  feedback: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  blockCommon: boolean;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  blockCommon: true
};

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'welcome',
  'jesus', 'ninja', 'mustang', 'password1', 'password123',
  '123456789', '12345678910', '1234567890', 'admin', 'root',
  'test', 'guest', 'user', 'demo', 'sample'
]);

export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  const feedback: string[] = [];
  let score = 0;

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters`);
  } else {
    score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 5;
  }

  const hasUppercase = /[A-Z]/.test(password);
  if (requirements.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
    feedback.push('Add an uppercase letter (A-Z)');
  } else if (hasUppercase) {
    score += 15;
  }

  const hasLowercase = /[a-z]/.test(password);
  if (requirements.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
    feedback.push('Add a lowercase letter (a-z)');
  } else if (hasLowercase) {
    score += 15;
  }

  const hasNumber = /[0-9]/.test(password);
  if (requirements.requireNumber && !hasNumber) {
    errors.push('Password must contain at least one number');
    feedback.push('Add a number (0-9)');
  } else if (hasNumber) {
    score += 15;
  }

  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (requirements.requireSpecial && !hasSpecial) {
    errors.push('Password must contain at least one special character');
    feedback.push('Add a special character (!@#$%^&*)');
  } else if (hasSpecial) {
    score += 15;
  }

  if (requirements.blockCommon && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a different one');
    feedback.push('Avoid common passwords');
    score = Math.min(score, 30);
  } else {
    score += 10;
  }

  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.8) {
    score += 5;
  }

  const isValid = errors.length === 0;
  const isStrong = score >= 70;

  return {
    isValid,
    isStrong,
    score: Math.min(score, 100),
    errors,
    feedback: isValid && !isStrong ? feedback : []
  };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score < 40) return 'weak';
  if (score < 70) return 'medium';
  return 'strong';
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 40) return 'red';
  if (score < 70) return 'yellow';
  return 'green';
}

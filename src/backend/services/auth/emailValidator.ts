export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail: string | null;
  error: string | null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'trashmail.com', 'throwaway.email',
  'maildrop.cc', 'getnada.com', 'temp-mail.org',
  'sharklasers.com', 'guerrillamail.info', 'grr.la',
  'guerrillamail.biz', 'guerrillamail.de', 'spam4.me'
]);

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email is required'
    };
  }

  if (trimmed.length > 255) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email is too long (maximum 255 characters)'
    };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Please enter a valid email address'
    };
  }

  const normalized = trimmed.toLowerCase();

  const domain = normalized.split('@')[1];

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Disposable email addresses are not allowed'
    };
  }

  if (normalized.includes('..')) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email contains invalid consecutive dots'
    };
  }

  return {
    isValid: true,
    normalizedEmail: normalized,
    error: null
  };
}

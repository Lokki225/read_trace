import { ValidationResult } from '../../../model/schemas/profile';

/**
 * Validates username according to business rules:
 * - 3-30 characters
 * - Alphanumeric and underscores only
 * - No reserved words
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else {
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (trimmedUsername.length > 30) {
      errors.push('Username must be at most 30 characters');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    // Check for reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'system', 'api', 'www',
      'mail', 'email', 'support', 'help', 'info', 'contact',
      'user', 'users', 'profile', 'profiles', 'account', 'accounts',
      'login', 'logout', 'register', 'signup', 'signin', 'auth',
      'dashboard', 'settings', 'config', 'configuration', 'test',
      'demo', 'sample', 'example', 'null', 'undefined', 'anonymous'
    ];
    
    if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
      errors.push('Username is reserved and cannot be used');
    }
    
    // Check for consecutive underscores or starting/ending with underscore
    if (/__/.test(trimmedUsername)) {
      errors.push('Username cannot contain consecutive underscores');
    }
    
    if (trimmedUsername.startsWith('_') || trimmedUsername.endsWith('_')) {
      errors.push('Username cannot start or end with an underscore');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates display name according to business rules:
 * - 1-100 characters
 * - Can contain any characters except control characters
 */
export function validateDisplayName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Display name is required');
  } else {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 1) {
      errors.push('Display name is required');
    }
    
    if (trimmedName.length > 100) {
      errors.push('Display name must be at most 100 characters');
    }
    
    // Check for control characters
    if (/[\x00-\x1F\x7F]/.test(trimmedName)) {
      errors.push('Display name contains invalid characters');
    }
    
    // Prevent excessive whitespace
    if (/\s{3,}/.test(trimmedName)) {
      errors.push('Display name cannot contain excessive whitespace');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates bio according to business rules:
 * - Maximum 500 characters
 * - Can contain any characters except control characters
 */
export function validateBio(bio: string): ValidationResult {
  const errors: string[] = [];
  
  if (bio && bio.length > 500) {
    errors.push('Bio must be at most 500 characters');
  }
  
  if (bio && /[\x00-\x1F\x7F]/.test(bio)) {
    errors.push('Bio contains invalid characters');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates avatar URL according to business rules:
 * - Must be a valid URL
 * - Must use HTTP/HTTPS protocol
 * - Must have valid image file extension
 */
export function validateAvatarUrl(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url) {
    // Avatar URL is optional
    return { isValid: true, errors };
  }
  
  try {
    const urlObj = new URL(url);
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('Avatar URL must use HTTP or HTTPS protocol');
    }
    
    // Check for valid image file extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      errors.push('Avatar URL must point to an image file (jpg, png, gif, webp, or svg)');
    }
    
  } catch (error) {
    errors.push('Avatar URL must be a valid URL');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates user preferences according to business rules
 */
export function validateUserPreferences(preferences: {
  theme?: string;
  email_notifications?: boolean;
  default_scan_site?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
    errors.push('Theme must be one of: light, dark, system');
  }
  
  if (preferences.email_notifications !== undefined && 
      typeof preferences.email_notifications !== 'boolean') {
    errors.push('Email notifications preference must be a boolean');
  }
  
  if (preferences.default_scan_site !== undefined && 
      preferences.default_scan_site !== null && 
      typeof preferences.default_scan_site !== 'string') {
    errors.push('Default scan site must be a string or null');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates complete profile update data
 */
export function validateProfileUpdate(data: {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: {
    theme?: string;
    email_notifications?: boolean;
    default_scan_site?: string;
  };
}): ValidationResult {
  const allErrors: string[] = [];
  
  if (data.username !== undefined) {
    const usernameResult = validateUsername(data.username);
    if (!usernameResult.isValid) {
      allErrors.push(...usernameResult.errors);
    }
  }
  
  if (data.display_name !== undefined) {
    const displayNameResult = validateDisplayName(data.display_name);
    if (!displayNameResult.isValid) {
      allErrors.push(...displayNameResult.errors);
    }
  }
  
  if (data.bio !== undefined) {
    const bioResult = validateBio(data.bio);
    if (!bioResult.isValid) {
      allErrors.push(...bioResult.errors);
    }
  }
  
  if (data.avatar_url !== undefined) {
    const avatarResult = validateAvatarUrl(data.avatar_url);
    if (!avatarResult.isValid) {
      allErrors.push(...avatarResult.errors);
    }
  }
  
  if (data.preferences !== undefined) {
    const preferencesResult = validateUserPreferences(data.preferences);
    if (!preferencesResult.isValid) {
      allErrors.push(...preferencesResult.errors);
    }
  }
  
  return { isValid: allErrors.length === 0, errors: allErrors };
}

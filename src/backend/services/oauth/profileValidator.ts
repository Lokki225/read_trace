import { OAuthProvider, OAuthProfile } from '@/model/schemas/oauth';

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedProfile?: OAuthProfile;
}

export function validateOAuthProfile(
  profile: any,
  provider: OAuthProvider
): ProfileValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  if (!profile.id) {
    errors.push('Provider ID is required');
  }
  
  if (!profile.email) {
    errors.push('Email is required');
  }
  
  // Provider-specific validation
  if (provider === OAuthProvider.GOOGLE) {
    if (!profile.email_verified) {
      errors.push('Email must be verified by Google');
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Sanitize and return profile
  const sanitizedProfile: OAuthProfile = {
    provider_id: String(profile.id),
    provider_name: provider,
    email: String(profile.email).toLowerCase(),
    display_name: profile.name ? String(profile.name) : undefined,
    avatar_url: profile.picture ? String(profile.picture) : undefined,
    raw_data: profile
  };
  
  return { isValid: true, errors: [], sanitizedProfile };
}

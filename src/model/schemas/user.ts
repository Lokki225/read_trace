export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  DISCORD = 'discord'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface User {
  id: string;
  email: string;
  email_confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  email_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  default_scan_site: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  auth_provider: AuthProvider;
  status: UserStatus;
  preferences: UserPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface RegistrationData {
  email: string;
  password: string;
}

export interface RegistrationResult {
  user: User;
  requiresEmailConfirmation: boolean;
}

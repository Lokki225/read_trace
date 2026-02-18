import { User, UserPreferences } from './user';

export interface UserProfile extends User {
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface ProfileUpdate {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: Partial<UserPreferences>;
}

export interface PasswordChange {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OAuthProvider {
  provider_name: string;
  provider_id: string;
  linked_at: Date;
}

export interface ProfileSecurityInfo {
  last_login: Date | null;
  password_changed_at: Date | null;
  failed_login_attempts: number;
  account_locked: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  isStrong: boolean;
  score: number;
  errors: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export enum ProfileStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

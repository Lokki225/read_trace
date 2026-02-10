import {
  validateOAuthProfile
} from '@/backend/services/oauth/profileValidator';
import { OAuthProvider } from '@/model/schemas/oauth';

describe('OAuth Profile Validator', () => {
  describe('validateOAuthProfile - Google', () => {
    it('should validate a correct Google profile', () => {
      const profile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: true,
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedProfile).toBeDefined();
    });

    it('should reject profile without provider ID', () => {
      const profile = {
        email: 'user@gmail.com',
        email_verified: true,
        name: 'John Doe'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Provider ID is required');
    });

    it('should reject profile without email', () => {
      const profile = {
        id: '123456789',
        email_verified: true,
        name: 'John Doe'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should reject profile with unverified email', () => {
      const profile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: false,
        name: 'John Doe'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be verified by Google');
    });

    it('should sanitize email to lowercase', () => {
      const profile = {
        id: '123456789',
        email: 'User@Gmail.COM',
        email_verified: true,
        name: 'John Doe'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.sanitizedProfile?.email).toBe('user@gmail.com');
    });

    it('should handle optional fields', () => {
      const profile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: true
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedProfile?.display_name).toBeUndefined();
      expect(result.sanitizedProfile?.avatar_url).toBeUndefined();
    });
  });

  describe('validateOAuthProfile - Discord', () => {
    it('should validate a correct Discord profile', () => {
      const profile = {
        id: '987654321',
        email: 'user@discord.com',
        username: 'johndoe',
        avatar: 'avatar_hash'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.DISCORD);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedProfile).toBeDefined();
    });

    it('should not require email_verified for Discord', () => {
      const profile = {
        id: '987654321',
        email: 'user@discord.com',
        username: 'johndoe'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.DISCORD);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject Discord profile without email', () => {
      const profile = {
        id: '987654321',
        username: 'johndoe'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.DISCORD);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });
  });

  describe('Profile sanitization', () => {
    it('should convert provider_id to string', () => {
      const profile = {
        id: 123456789,
        email: 'user@gmail.com',
        email_verified: true
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.sanitizedProfile?.provider_id).toBe('123456789');
      expect(typeof result.sanitizedProfile?.provider_id).toBe('string');
    });

    it('should preserve raw_data', () => {
      const profile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: true,
        custom_field: 'custom_value'
      };

      const result = validateOAuthProfile(profile, OAuthProvider.GOOGLE);

      expect(result.sanitizedProfile?.raw_data).toEqual(profile);
    });

    it('should set correct provider_name', () => {
      const googleProfile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: true
      };

      const googleResult = validateOAuthProfile(googleProfile, OAuthProvider.GOOGLE);
      expect(googleResult.sanitizedProfile?.provider_name).toBe(OAuthProvider.GOOGLE);

      const discordProfile = {
        id: '987654321',
        email: 'user@discord.com'
      };

      const discordResult = validateOAuthProfile(discordProfile, OAuthProvider.DISCORD);
      expect(discordResult.sanitizedProfile?.provider_name).toBe(OAuthProvider.DISCORD);
    });
  });
});

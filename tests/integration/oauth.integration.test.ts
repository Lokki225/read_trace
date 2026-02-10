import { OAuthProvider, OAuthProfile, OAuthToken } from '@/model/schemas/oauth';
import { oauthService } from '@/backend/services/oauth/oauthHandlers';
import { validateOAuthProfile } from '@/backend/services/oauth/profileValidator';

describe('OAuth Integration Tests', () => {
  describe('OAuth Profile Validation and Service Integration', () => {
    it('should validate Google profile and prepare for service', () => {
      const googleProfile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: true,
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg'
      };

      const validation = validateOAuthProfile(googleProfile, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(true);
      expect(validation.sanitizedProfile).toBeDefined();
      expect(validation.sanitizedProfile?.provider_name).toBe(OAuthProvider.GOOGLE);
      expect(validation.sanitizedProfile?.email).toBe('user@gmail.com');
    });

    it('should validate Discord profile and prepare for service', () => {
      const discordProfile = {
        id: '987654321',
        email: 'user@discord.com',
        username: 'johndoe',
        avatar: 'avatar_hash'
      };

      const validation = validateOAuthProfile(discordProfile, OAuthProvider.DISCORD);

      expect(validation.isValid).toBe(true);
      expect(validation.sanitizedProfile).toBeDefined();
      expect(validation.sanitizedProfile?.provider_name).toBe(OAuthProvider.DISCORD);
    });

    it('should handle profile with optional fields', () => {
      const minimalProfile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: true
      };

      const validation = validateOAuthProfile(minimalProfile, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(true);
      expect(validation.sanitizedProfile?.display_name).toBeUndefined();
      expect(validation.sanitizedProfile?.avatar_url).toBeUndefined();
    });

    it('should reject profile with missing required fields', () => {
      const invalidProfile = {
        id: '123456789'
        // missing email
      };

      const validation = validateOAuthProfile(invalidProfile, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('OAuth Token Handling', () => {
    it('should create valid OAuth token structure', () => {
      const token: OAuthToken = {
        access_token: 'ya29.a0AfH6SMBx...',
        refresh_token: '1//0gF...',
        expires_at: Date.now() + 3600000,
        token_type: 'Bearer',
        scope: 'openid profile email'
      };

      expect(token.access_token).toBeDefined();
      expect(token.token_type).toBe('Bearer');
      expect(token.expires_at).toBeGreaterThan(Date.now());
    });

    it('should handle optional refresh token', () => {
      const tokenWithoutRefresh: OAuthToken = {
        access_token: 'token123',
        expires_at: Date.now() + 3600000,
        token_type: 'Bearer',
        scope: 'openid profile email'
      };

      expect(tokenWithoutRefresh.refresh_token).toBeUndefined();
      expect(tokenWithoutRefresh.access_token).toBeDefined();
    });
  });

  describe('OAuth Provider Enum', () => {
    it('should have Google provider', () => {
      expect(OAuthProvider.GOOGLE).toBe('google');
    });

    it('should have Discord provider', () => {
      expect(OAuthProvider.DISCORD).toBe('discord');
    });

    it('should support provider comparison', () => {
      const googleProvider = OAuthProvider.GOOGLE;
      const discordProvider = OAuthProvider.DISCORD;
      expect(googleProvider).toBe(OAuthProvider.GOOGLE);
      expect(discordProvider).toBe(OAuthProvider.DISCORD);
      expect(googleProvider).not.toBe(discordProvider);
    });
  });

  describe('OAuth Profile Data Flow', () => {
    it('should transform raw OAuth data to sanitized profile', () => {
      const rawData = {
        id: 'google_123456',
        email: 'User@Gmail.COM',
        email_verified: true,
        name: 'John Doe',
        picture: 'https://lh3.googleusercontent.com/...',
        locale: 'en',
        hd: 'example.com'
      };

      const validation = validateOAuthProfile(rawData, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(true);
      const profile = validation.sanitizedProfile!;
      
      expect(profile.email).toBe('user@gmail.com'); // lowercase
      expect(profile.display_name).toBe('John Doe');
      expect(profile.avatar_url).toBe('https://lh3.googleusercontent.com/...');
      expect(profile.raw_data).toEqual(rawData);
    });

    it('should handle Discord avatar URL construction', () => {
      const discordData = {
        id: '123456789',
        email: 'user@discord.com',
        username: 'johndoe',
        avatar: 'a_1234567890abcdef'
      };

      const validation = validateOAuthProfile(discordData, OAuthProvider.DISCORD);

      expect(validation.isValid).toBe(true);
      const profile = validation.sanitizedProfile!;
      
      expect(profile.provider_id).toBe('123456789');
      expect(profile.display_name).toBeUndefined(); // Discord doesn't have 'name' field
    });
  });

  describe('OAuth Error Scenarios', () => {
    it('should handle unverified Google email', () => {
      const unverifiedProfile = {
        id: '123456789',
        email: 'user@gmail.com',
        email_verified: false,
        name: 'John Doe'
      };

      const validation = validateOAuthProfile(unverifiedProfile, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email must be verified by Google');
    });

    it('should handle missing provider ID', () => {
      const noIdProfile = {
        email: 'user@gmail.com',
        email_verified: true,
        name: 'John Doe'
      };

      const validation = validateOAuthProfile(noIdProfile, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Provider ID is required');
    });

    it('should handle multiple validation errors', () => {
      const invalidProfile = {
        // missing id and email
        name: 'John Doe'
      };

      const validation = validateOAuthProfile(invalidProfile, OAuthProvider.GOOGLE);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});

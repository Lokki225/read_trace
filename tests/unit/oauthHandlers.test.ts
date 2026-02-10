import { OAuthServiceError } from '@/backend/services/oauth/oauthHandlers';
import { OAuthProvider, OAuthProfile, OAuthToken } from '@/model/schemas/oauth';

describe('OAuth Service', () => {
  describe('OAuthServiceError', () => {
    it('should create error with correct properties', () => {
      const error = new OAuthServiceError('Test error', 'TEST_CODE', 400);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('OAuthServiceError');
    });

    it('should have default statusCode of 400', () => {
      const error = new OAuthServiceError('Test error', 'TEST_CODE');

      expect(error.statusCode).toBe(400);
    });

    it('should be an instance of Error', () => {
      const error = new OAuthServiceError('Test error', 'TEST_CODE');

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('OAuth types and interfaces', () => {
    it('should support OAuthProvider enum', () => {
      expect(OAuthProvider.GOOGLE).toBe('google');
      expect(OAuthProvider.DISCORD).toBe('discord');
    });

    it('should support OAuthProfile interface', () => {
      const profile: OAuthProfile = {
        provider_id: '123456',
        provider_name: OAuthProvider.GOOGLE,
        email: 'user@gmail.com',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        raw_data: { id: '123456', email: 'user@gmail.com' }
      };

      expect(profile.provider_id).toBe('123456');
      expect(profile.provider_name).toBe(OAuthProvider.GOOGLE);
      expect(profile.email).toBe('user@gmail.com');
    });

    it('should support OAuthToken interface', () => {
      const token: OAuthToken = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_at: Date.now() + 3600000,
        token_type: 'Bearer',
        scope: 'openid profile email'
      };

      expect(token.access_token).toBe('token123');
      expect(token.refresh_token).toBe('refresh123');
      expect(token.token_type).toBe('Bearer');
    });
  });
});

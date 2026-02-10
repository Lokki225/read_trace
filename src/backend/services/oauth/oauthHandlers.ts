import { createServerClient } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import {
  OAuthProvider,
  OAuthProfile,
  OAuthToken
} from '@/model/schemas/oauth';
import { validateOAuthProfile } from './profileValidator';

export class OAuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'OAuthServiceError';
  }
}

export class OAuthService {
  async createOrLinkOAuthAccount(
    profile: OAuthProfile,
    token: OAuthToken
  ): Promise<{ userId: string; isNewUser: boolean }> {
    try {
      const supabase = await createServerClient();

      // Check if user exists with this OAuth provider
      const { data: existingProvider } = await supabase
        .from('oauth_providers')
        .select('user_id')
        .eq('provider_name', profile.provider_name)
        .eq('provider_id', profile.provider_id)
        .single() as any;

      if (existingProvider) {
        // User already linked with this provider
        return {
          userId: existingProvider.user_id,
          isNewUser: false
        };
      }

      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', profile.email)
        .single() as any;

      let userId: string;
      let isNewUser = false;

      if (existingUser) {
        // Link OAuth provider to existing user
        userId = existingUser.id;
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: profile.email,
          password: this.generateSecurePassword(),
          options: {
            data: {
              email: profile.email,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              auth_provider: profile.provider_name
            }
          }
        });

        if (authError || !authData.user) {
          throw new OAuthServiceError(
            'Failed to create user account',
            'USER_CREATION_FAILED',
            500
          );
        }

        userId = authData.user.id;
        isNewUser = true;

        // Create user profile
        const profileData: any = {
          id: userId,
          email: profile.email,
          display_name: profile.display_name || null,
          avatar_url: profile.avatar_url || null,
          auth_provider: profile.provider_name,
          status: 'active',
          preferences: {
            email_notifications: true,
            theme: 'system' as const,
            default_scan_site: null
          }
        };
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData);

        if (profileError) {
          throw new OAuthServiceError(
            'Failed to create user profile',
            'PROFILE_CREATION_FAILED',
            500
          );
        }
      }

      // Store OAuth provider link
      const linkData: any = {
        user_id: userId,
        provider_name: profile.provider_name,
        provider_id: profile.provider_id,
        email: profile.email,
        avatar_url: profile.avatar_url || null
      };
      
      const { error: linkError } = await supabase
        .from('oauth_providers')
        .upsert(linkData);

      if (linkError) {
        throw new OAuthServiceError(
          'Failed to link OAuth provider',
          'PROVIDER_LINK_FAILED',
          500
        );
      }

      return { userId, isNewUser };
    } catch (error) {
      if (error instanceof OAuthServiceError) {
        throw error;
      }

      console.error('OAuth account creation error:', error);
      throw new OAuthServiceError(
        'An unexpected error occurred during OAuth authentication',
        'UNEXPECTED_ERROR',
        500
      );
    }
  }

  async unlinkOAuthProvider(
    userId: string,
    provider: OAuthProvider
  ): Promise<void> {
    try {
      const supabase = await createServerClient();

      const { error } = await supabase
        .from('oauth_providers')
        .delete()
        .eq('user_id', userId)
        .eq('provider_name', provider);

      if (error) {
        throw new OAuthServiceError(
          'Failed to unlink OAuth provider',
          'UNLINK_FAILED',
          500
        );
      }
    } catch (error) {
      if (error instanceof OAuthServiceError) {
        throw error;
      }

      console.error('OAuth provider unlink error:', error);
      throw new OAuthServiceError(
        'An unexpected error occurred while unlinking provider',
        'UNEXPECTED_ERROR',
        500
      );
    }
  }

  async getLinkedProviders(userId: string): Promise<OAuthProvider[]> {
    try {
      const supabase = await createServerClient();

      const { data, error } = await supabase
        .from('oauth_providers')
        .select('provider_name')
        .eq('user_id', userId) as any;

      if (error) {
        throw new OAuthServiceError(
          'Failed to fetch linked providers',
          'FETCH_PROVIDERS_FAILED',
          500
        );
      }

      return (data || []).map((row: any) => row.provider_name as OAuthProvider);
    } catch (error) {
      if (error instanceof OAuthServiceError) {
        throw error;
      }

      console.error('Error fetching linked providers:', error);
      throw new OAuthServiceError(
        'An unexpected error occurred while fetching providers',
        'UNEXPECTED_ERROR',
        500
      );
    }
  }

  private generateSecurePassword(): string {
    const length = 32;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

export const oauthService = new OAuthService();

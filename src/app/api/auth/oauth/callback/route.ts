import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { validateStateToken, StateTokenData } from '@/backend/services/oauth/stateTokenGenerator';
import { getStoredStateToken, deleteStoredStateToken } from '../route';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  try {
    // Handle OAuth provider errors
    if (error) {
      const errorMessage = error_description || 'OAuth authentication failed';
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorMessage)}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=invalid_request&error_description=Missing authorization code or state token',
          request.url
        )
      );
    }

    // Validate state token for CSRF protection
    const storedStateData = getStoredStateToken(state);
    if (!storedStateData) {
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=invalid_state&error_description=Invalid or expired state token',
          request.url
        )
      );
    }

    const stateValidation = validateStateToken(storedStateData, state);
    if (!stateValidation.isValid) {
      deleteStoredStateToken(state);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=invalid_state&error_description=${encodeURIComponent(stateValidation.error || 'State validation failed')}`,
          request.url
        )
      );
    }

    // Delete state token after validation
    deleteStoredStateToken(state);

    const supabase = await createServerClient() as SupabaseClientType<Database>;

    // Exchange authorization code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.user) {
      console.error('OAuth code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=invalid_grant&error_description=Failed to exchange authorization code',
          request.url
        )
      );
    }

    // Create or update user profile with OAuth information
    const user = data.user;
    const identity = user.identities?.find(id => id.provider === 'discord' || id.provider === 'google');
    const provider = identity?.provider || 'discord'; // Default to discord for this case
    
    // Get provider-specific data
    const providerData = identity?.identity_data || {};
    const displayName = providerData.name || providerData.preferred_username || providerData.username || user.email?.split('@')[0];
    const avatarUrl = providerData.avatar_url || providerData.picture;

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create new user profile for OAuth user
      const profileData: any = {
        id: user.id,
        email: user.email!,
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        auth_provider: provider,
        status: 'active',
        preferences: {
          email_notifications: true,
          theme: 'system',
          default_scan_site: null
        }
      };
      
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Failed to create user profile:', profileError);
      }
    } else {
      // Update existing profile with OAuth information
      const updateData: any = {
        auth_provider: provider,
        status: 'active',
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await (supabase as any)
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user profile:', updateError);
      }
    }

    // OAuth successful - redirect to dashboard
    const redirectUrl = new URL('/dashboard', request.url);
    
    // Check if this is a new user (no existing profile)
    if (!existingProfile) {
      redirectUrl.searchParams.set('welcome', 'true');
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        '/auth/login?error=server_error&error_description=An unexpected error occurred during authentication',
        request.url
      )
    );
  }
}

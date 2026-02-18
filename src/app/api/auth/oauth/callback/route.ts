import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

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
    if (!code) {
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=invalid_request&error_description=Missing%20authorization%20code',
          request.url
        )
      );
    }

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

    // The DB trigger (create_profile_for_new_user) auto-creates the profile
    // the moment auth.users is inserted, so existingProfile is always non-null.
    // We must check onboarding_completed to distinguish new vs returning users.
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('id, onboarding_completed')
      .eq('id', user.id)
      .single();

    // Update OAuth-specific fields on the profile
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

    // New users (onboarding_completed = false/null) → /onboarding
    // Returning users (onboarding_completed = true) → /dashboard
    const onboardingCompleted = profile?.onboarding_completed ?? false;
    const destination = onboardingCompleted ? '/dashboard' : '/onboarding';
    return NextResponse.redirect(new URL(destination, request.url));
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

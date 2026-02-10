import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { oauthService } from '@/backend/services/oauth/oauthHandlers';
import { OAuthProvider, OAuthProfile, OAuthToken } from '@/model/schemas/oauth';
import { validateOAuthProfile } from '@/backend/services/oauth/profileValidator';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { provider, profile: rawProfile, token } = await request.json();

    // Validate provider
    if (!provider || !Object.values(OAuthProvider).includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    // Validate profile data
    const profileValidation = validateOAuthProfile(rawProfile, provider);
    if (!profileValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: profileValidation.errors },
        { status: 400 }
      );
    }

    const profile: OAuthProfile = profileValidation.sanitizedProfile!;

    // Validate token data
    if (!token || !token.access_token) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 400 }
      );
    }

    const oauthToken: OAuthToken = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at || Date.now() + 3600000,
      token_type: token.token_type || 'Bearer',
      scope: token.scope || 'openid profile email'
    };

    // Link OAuth provider to existing user
    const result = await oauthService.createOrLinkOAuthAccount(profile, oauthToken);

    return NextResponse.json({
      success: true,
      isNewUser: result.isNewUser,
      userId: result.userId
    });

  } catch (error) {
    console.error('OAuth linking error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during OAuth linking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { provider } = await request.json();

    // Validate provider
    if (!provider || !Object.values(OAuthProvider).includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    // Unlink OAuth provider
    await oauthService.unlinkOAuthProvider(user.id, provider as OAuthProvider);

    return NextResponse.json({
      success: true,
      message: 'OAuth provider unlinked successfully'
    });

  } catch (error) {
    console.error('OAuth unlinking error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during OAuth unlinking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get linked providers
    const linkedProviders = await oauthService.getLinkedProviders(user.id);

    return NextResponse.json({
      success: true,
      providers: linkedProviders
    });

  } catch (error) {
    console.error('Error fetching linked providers:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

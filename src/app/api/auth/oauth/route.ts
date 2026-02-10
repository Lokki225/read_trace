import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateStateToken, createStateTokenData, validateStateToken, StateTokenData } from '@/backend/services/oauth/stateTokenGenerator';
import { OAuthProvider } from '@/model/schemas/oauth';

// In-memory state token storage (in production, use Redis or database)
const stateTokens = new Map<string, StateTokenData>();

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    // Validate provider
    if (!provider || !Object.values(OAuthProvider).includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Generate state token for CSRF protection
    const stateToken = generateStateToken();
    const stateData = createStateTokenData(stateToken);
    
    // Store state token (in production, use Redis or database)
    stateTokens.set(stateToken, stateData);
    
    // Clean up expired tokens
    cleanupExpiredTokens();

    // Get OAuth authorization URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'discord',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback?state=${stateToken}`,
        scopes: provider === OAuthProvider.GOOGLE 
          ? 'openid profile email'
          : 'identify email'
      }
    });

    if (error || !data.url) {
      console.error('OAuth URL generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate OAuth URL' },
        { status: 500 }
      );
    }

    // Return the authorization URL
    return NextResponse.json({
      authUrl: data.url,
      state: stateToken
    });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Clean up expired tokens
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of stateTokens.entries()) {
    if (now > data.expiresAt) {
      stateTokens.delete(token);
    }
  }
}

// Get stored state token
export function getStoredStateToken(token: string): StateTokenData | undefined {
  return stateTokens.get(token);
}

// Delete stored state token
export function deleteStoredStateToken(token: string): boolean {
  return stateTokens.delete(token);
}

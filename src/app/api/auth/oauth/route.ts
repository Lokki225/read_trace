import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { OAuthProvider } from '@/model/schemas/oauth';

export const STATE_COOKIE = 'oauth_state';

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!provider || !Object.values(OAuthProvider).includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'discord',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback`,
        scopes: provider === OAuthProvider.GOOGLE
          ? 'openid profile email'
          : 'identify email',
        skipBrowserRedirect: true,
      }
    });

    if (error || !data.url) {
      console.error('OAuth URL generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate OAuth URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ authUrl: data.url });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export function getStoredStateToken(_token: string): undefined { return undefined; }
export function deleteStoredStateToken(_token: string): boolean { return false; }

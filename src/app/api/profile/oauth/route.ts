import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getConnectedProviders, unlinkProvider } from '@/backend/services/auth/profileService';

/**
 * GET /api/profile/oauth
 * Retrieves connected OAuth providers for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const providers = await getConnectedProviders(user.id);

    return NextResponse.json({ providers });
  } catch (error: any) {
    console.error('OAuth providers GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OAuth providers' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/oauth
 * Unlinks an OAuth provider from the current user's account
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider name is required' },
        { status: 400 }
      );
    }

    await unlinkProvider(user.id, provider);

    return NextResponse.json({ 
      success: true,
      message: `${provider} provider unlinked successfully`
    });
  } catch (error: any) {
    console.error('OAuth provider DELETE error:', error);

    // Handle specific errors
    if (error.message.includes('Cannot unlink the only authentication method')) {
      return NextResponse.json(
        { error: 'Cannot unlink your only authentication method' },
        { status: 400 }
      );
    }

    if (error.message.includes('not yet implemented')) {
      return NextResponse.json(
        { error: 'OAuth unlinking is not yet implemented' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to unlink OAuth provider' },
      { status: 500 }
    );
  }
}

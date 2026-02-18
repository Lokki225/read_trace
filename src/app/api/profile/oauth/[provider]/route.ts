import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * DELETE /api/profile/oauth/:provider
 * Unlinks an OAuth provider from the current user's account.
 * Requires the user to have at least one other login method.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = params;
    const identities = user.identities ?? [];

    if (identities.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot unlink your only login method' },
        { status: 400 }
      );
    }

    const identity = identities.find((id: any) => id.provider === provider);
    if (!identity) {
      return NextResponse.json(
        { error: `Provider "${provider}" is not linked to this account` },
        { status: 404 }
      );
    }

    const { error } = await (supabase.auth as any).unlinkIdentity(identity);

    if (error) {
      console.error('Unlink identity error:', error);
      return NextResponse.json(
        { error: 'Failed to unlink provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${provider} unlinked successfully`
    });
  } catch (error: any) {
    console.error('OAuth unlink error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink provider' },
      { status: 500 }
    );
  }
}

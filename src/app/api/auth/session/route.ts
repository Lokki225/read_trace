import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/auth/session
 * Returns the current authenticated user including their identities.
 * Used by the profile page to detect whether the user has an email/password credential.
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        identities: user.identities ?? []
      }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

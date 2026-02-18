import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select(
        'extension_installed, extension_installed_at, browser_type, extension_version, installation_skipped, installation_skipped_at'
      )
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      installed: profile.extension_installed ?? false,
      installed_at: profile.extension_installed_at ?? null,
      browser_type: profile.browser_type ?? null,
      extension_version: profile.extension_version ?? null,
      installation_skipped: profile.installation_skipped ?? false,
      installation_skipped_at: profile.installation_skipped_at ?? null,
    });
  } catch (error) {
    console.error('Extension status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

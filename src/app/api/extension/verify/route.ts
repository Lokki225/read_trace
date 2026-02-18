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
      return NextResponse.json({ installed: false, authenticated: false });
    }

    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('extension_installed, extension_version, browser_type')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      installed: profile?.extension_installed ?? false,
      version: profile?.extension_version ?? null,
      browser: profile?.browser_type ?? null,
      authenticated: true,
    });
  } catch (error) {
    console.error('Extension verify API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

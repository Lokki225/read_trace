import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { browser_type, extension_version } = body;

    if (!browser_type || !extension_version) {
      return NextResponse.json({ error: 'Missing required fields: browser_type and extension_version' }, { status: 400 });
    }

    const { error: updateError } = await (supabase as any)
      .from('user_profiles')
      .update({
        extension_installed: true,
        extension_installed_at: new Date().toISOString(),
        browser_type,
        extension_version,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Extension installed update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      browser_type,
      extension_version,
    });
  } catch (error) {
    console.error('Extension installed API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

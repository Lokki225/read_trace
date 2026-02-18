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

    const { error: updateError } = await (supabase as any)
      .from('user_profiles')
      .update({
        installation_skipped: true,
        installation_skipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Skip installation update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      skipped: true,
    });
  } catch (error) {
    console.error('Skip installation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

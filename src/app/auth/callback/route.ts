import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await (supabase as any)
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();

      const onboardingCompleted = profile?.onboarding_completed ?? false;
      const destination = onboardingCompleted ? next : '/onboarding';
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=callback_failed', requestUrl.origin));
}

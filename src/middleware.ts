import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRoutingDecision } from '@/lib/routing';

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEV_PREVIEW === 'true') {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  let onboardingCompleted = false;
  if (user) {
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();
    onboardingCompleted = profile?.onboarding_completed ?? false;
  }

  const decision = getRoutingDecision(pathname, user?.id ?? null, onboardingCompleted);

  if (decision.redirect) {
    return NextResponse.redirect(new URL(decision.redirect, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

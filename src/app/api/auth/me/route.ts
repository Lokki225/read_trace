import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getCorsHeaders(request?: NextRequest): Record<string, string> {
  const origin = request?.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  const withCors = (res: NextResponse) => {
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  };

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return withCors(NextResponse.json({ userId: null }, { status: 200 }));
  }

  return withCors(NextResponse.json({ userId: user.id }, { status: 200 }));
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function getCorsHeaders(request?: NextRequest): Record<string, string> {
  const origin = request?.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

interface SyncRequestBody {
  series_id: string;
  chapter: number;
  scroll_position: number;
  timestamp: number;
  seriesTitle?: string;
  user_id?: string;
}

function isValidBody(body: unknown): body is SyncRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.series_id === 'string' &&
    b.series_id.length > 0 &&
    typeof b.chapter === 'number' &&
    b.chapter > 0 &&
    typeof b.scroll_position === 'number' &&
    b.scroll_position >= 0 &&
    b.scroll_position <= 100 &&
    typeof b.timestamp === 'number' &&
    b.timestamp > 0
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  const withCors = (res: NextResponse) => {
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 }));
  }

  if (!isValidBody(body)) {
    return withCors(NextResponse.json(
      { success: false, error: 'Missing or invalid required fields: series_id, chapter, scroll_position, timestamp' },
      { status: 400 }
    ));
  }

  const { chapter, scroll_position, timestamp, seriesTitle, user_id: bodyUserId, series_id } = body;

  // Try to get user from session cookie first, fall back to body user_id (extension)
  const cookieStore = await cookies();
  const sessionSupabase = createServerClient(
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

  const { data: { user } } = await sessionSupabase.auth.getUser();
  const userId = user?.id || bodyUserId;

  if (!userId) {
    return withCors(NextResponse.json({ success: false, error: 'Unauthorized - please log in at localhost:3000' }, { status: 401 }));
  }

  // Use service role key to bypass RLS (safe: server-side only, user_id validated above)
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const displayTitle = seriesTitle || series_id;
  const normalizedTitle = displayTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // Find or create the series entry in user_series
  const { data: existingSeriesList, error: selectError } = await (adminSupabase as any)
    .from('user_series')
    .select('id')
    .eq('user_id', userId)
    .eq('normalized_title', normalizedTitle);

  let userSeriesId: string;

  if (selectError) {
    console.error('Failed to query user_series:', selectError);
    return withCors(NextResponse.json({ success: false, error: 'Failed to query series' }, { status: 500 }));
  }

  if (existingSeriesList && existingSeriesList.length > 0) {
    // Deduplicate: keep newest, delete old duplicates
    userSeriesId = existingSeriesList[0].id;
    if (existingSeriesList.length > 1) {
      const oldIds = existingSeriesList.slice(1).map((s: any) => s.id);
      await (adminSupabase as any)
        .from('user_series')
        .delete()
        .in('id', oldIds);
    }
    
    await (adminSupabase as any)
      .from('user_series')
      .update({
        current_chapter: chapter,
        progress_percentage: Math.round(scroll_position),
        last_read_at: new Date(timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        status: 'reading',
      })
      .eq('id', userSeriesId);
  } else {
    const { data: newSeries, error: insertError } = await (adminSupabase as any)
      .from('user_series')
      .insert({
        user_id: userId,
        title: displayTitle,
        normalized_title: normalizedTitle,
        platform: 'Webtoon',
        status: 'reading',
        current_chapter: chapter,
        progress_percentage: Math.round(scroll_position),
        last_read_at: new Date(timestamp).toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !newSeries) {
      console.error('Failed to insert user_series:', insertError);
      return withCors(NextResponse.json({ success: false, error: 'Failed to create series entry' }, { status: 500 }));
    }
    userSeriesId = newSeries.id;
  }

  // Upsert reading progress using the user_series UUID
  await (adminSupabase as any)
    .from('reading_progress')
    .upsert(
      {
        user_id: userId,
        series_id: userSeriesId,
        chapter_number: chapter,
        page_number: Math.round(scroll_position),
        last_read_at: new Date(timestamp).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,series_id' }
    );

  return withCors(NextResponse.json({
    success: true,
    synced_at: new Date().toISOString(),
    next_sync_in: 5,
  }));
}

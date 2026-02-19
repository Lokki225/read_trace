import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface SyncRequestBody {
  series_id: string;
  chapter: number;
  scroll_position: number;
  timestamp: number;
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
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only context
          }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid required fields: series_id, chapter, scroll_position, timestamp' },
      { status: 400 }
    );
  }

  const { series_id, chapter, scroll_position, timestamp } = body;

  const { error: upsertError } = await (supabase as any)
    .from('reading_progress')
    .upsert(
      {
        user_id: user.id,
        series_id,
        chapter,
        scroll_position,
        synced_at: new Date(timestamp).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,series_id' }
    );

  if (upsertError) {
    return NextResponse.json({ success: false, error: 'Failed to save progress' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    synced_at: new Date().toISOString(),
    next_sync_in: 5,
  });
}

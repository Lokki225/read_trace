import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { SeriesStatus } from '@/model/schemas/dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') as SeriesStatus | null;

    if (offset < 0 || limit <= 0 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    let query = (supabase as any)
      .from('user_series')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('last_read_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Series fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch series' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      data: data || [],
      hasMore,
      total,
    });
  } catch (error) {
    console.error('Series API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

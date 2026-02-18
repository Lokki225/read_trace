import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { normalizeTitle } from '@/backend/services/import/deduplication';
import type { ValidatedImportEntry } from '@/model/schemas/import';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entries, importId } = body as {
      entries?: ValidatedImportEntry[];
      importId?: string;
    };

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'entries array is required and must not be empty' },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        const { data: inserted, error: seriesError } = await (supabase as any)
          .from('user_series')
          .insert({
            user_id: user.id,
            title: entry.title,
            normalized_title: normalizeTitle(entry.title),
            platform: entry.platform,
            source_url: entry.url ?? null,
            import_id: importId ?? null,
          })
          .select('id')
          .single();

        if (seriesError) {
          if (seriesError.code === '23505') {
            skippedCount++;
            continue;
          }
          throw seriesError;
        }

        if (inserted && entry.chapter) {
          await (supabase as any)
            .from('reading_progress')
            .insert({
              user_id: user.id,
              series_id: inserted.id,
              chapter_number: entry.chapter,
              last_read_at: entry.lastReadDate ?? new Date().toISOString(),
            });
        }

        importedCount++;
      } catch (err: any) {
        errors.push(`Failed to import "${entry.title}": ${err.message ?? 'Unknown error'}`);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      importId: importId ?? null,
      importedCount,
      skippedCount,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Import confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

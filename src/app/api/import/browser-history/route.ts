import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { extractFromBrowserHistory, buildImportJob } from '@/backend/services/import/importService';
import type { BrowserHistoryItem } from '@/model/schemas/import';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { historyItems } = body as { historyItems?: BrowserHistoryItem[] };

    if (!historyItems || !Array.isArray(historyItems)) {
      return NextResponse.json(
        { error: 'historyItems array is required' },
        { status: 400 }
      );
    }

    if (historyItems.length === 0) {
      return NextResponse.json(
        { error: 'No history items provided' },
        { status: 400 }
      );
    }

    const rawEntries = extractFromBrowserHistory(historyItems);

    if (rawEntries.length === 0) {
      return NextResponse.json({
        success: true,
        importId: null,
        message: 'No supported series URLs found in browser history',
        totalItems: 0,
        validItems: 0,
        errorItems: 0,
        skippedItems: 0,
        entries: [],
      });
    }

    const job = buildImportJob(user.id, 'browser_history', rawEntries);

    return NextResponse.json({
      success: true,
      importId: job.importId,
      totalItems: job.totalItems,
      validItems: job.entries.filter((e) => e.status !== 'error').length,
      errorItems: job.errorItems,
      skippedItems: job.skippedItems,
      entries: job.entries,
    });
  } catch (error) {
    console.error('Browser history import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

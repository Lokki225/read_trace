import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { parseCSVText, buildImportJob } from '@/backend/services/import/importService';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 413 }
      );
    }

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV files are accepted.' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const rawEntries = parseCSVText(csvText);

    if (rawEntries.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV file. Please check the file format.' },
        { status: 400 }
      );
    }

    const job = buildImportJob(user.id, 'csv', rawEntries);

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
    console.error('Import upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

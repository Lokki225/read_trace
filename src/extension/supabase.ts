import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kzernfbdptfyegfkjivw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6ZXJuZmJkcHRmeWVnZmtqaXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2ODE5NjQsImV4cCI6MjA4NjI1Nzk2NH0.EXdsg0Y2AqGysR12td3eIpcYoGGaAnaaj2w0XQmskuI';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    return user?.id || null;
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
}

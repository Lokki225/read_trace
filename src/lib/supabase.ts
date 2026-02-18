import { createBrowserClient } from '@supabase/ssr';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          auth_provider: string;
          status: string;
          preferences: {
            email_notifications: boolean;
            theme: 'light' | 'dark' | 'system';
            default_scan_site: string | null;
          };
          extension_installed: boolean | null;
          extension_installed_at: string | null;
          browser_type: string | null;
          extension_version: string | null;
          installation_skipped: boolean | null;
          installation_skipped_at: string | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          auth_provider?: string;
          status?: string;
          preferences?: {
            email_notifications: boolean;
            theme: 'light' | 'dark' | 'system';
            default_scan_site: string | null;
          };
          extension_installed?: boolean | null;
          extension_installed_at?: string | null;
          browser_type?: string | null;
          extension_version?: string | null;
          installation_skipped?: boolean | null;
          installation_skipped_at?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          auth_provider?: string;
          status?: string;
          preferences?: {
            email_notifications: boolean;
            theme: 'light' | 'dark' | 'system';
            default_scan_site: string | null;
          };
          extension_installed?: boolean | null;
          extension_installed_at?: string | null;
          browser_type?: string | null;
          extension_version?: string | null;
          installation_skipped?: boolean | null;
          installation_skipped_at?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      oauth_providers: {
        Row: {
          id: string;
          user_id: string;
          provider_name: string;
          provider_id: string;
          email: string | null;
          avatar_url: string | null;
          linked_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_name: string;
          provider_id: string;
          email?: string | null;
          avatar_url?: string | null;
          linked_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider_name?: string;
          provider_id?: string;
          email?: string | null;
          avatar_url?: string | null;
          linked_at?: string;
          updated_at?: string;
        };
      };
      user_series: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          normalized_title: string;
          platform: string;
          source_url: string | null;
          import_id: string | null;
          status: 'reading' | 'completed' | 'on_hold' | 'plan_to_read';
          current_chapter: number;
          total_chapters: number | null;
          cover_url: string | null;
          last_read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          normalized_title: string;
          platform?: string;
          source_url?: string | null;
          import_id?: string | null;
          status?: 'reading' | 'completed' | 'on_hold' | 'plan_to_read';
          current_chapter?: number;
          total_chapters?: number | null;
          cover_url?: string | null;
          last_read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          normalized_title?: string;
          platform?: string;
          source_url?: string | null;
          import_id?: string | null;
          status?: 'reading' | 'completed' | 'on_hold' | 'plan_to_read';
          current_chapter?: number;
          total_chapters?: number | null;
          cover_url?: string | null;
          last_read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const createServerClient = async (): Promise<ReturnType<typeof createSupabaseServerClient<Database>>> => {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
};

export type SupabaseClient = ReturnType<typeof createClient>;

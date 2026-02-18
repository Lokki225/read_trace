import { createServerClient } from '@/lib/supabase';
import { normalizePreferences } from '@/lib/platforms';
import { SavePreferencesRequest, SavePreferencesResponse } from '@/types/preferences';

export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SavePreferencesRequest = await request.json();
    const { preferred_sites } = body;

    if (!Array.isArray(preferred_sites)) {
      return Response.json(
        { error: 'preferred_sites must be an array' },
        { status: 400 }
      );
    }

    const normalized = normalizePreferences(preferred_sites);

    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update({
        preferred_sites: normalized,
        preferred_sites_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      );
    }

    const response: SavePreferencesResponse = {
      data: {
        preferred_sites: data.preferred_sites,
        preferred_sites_updated_at: data.preferred_sites_updated_at,
      },
      error: null,
    };

    return Response.json(response);
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

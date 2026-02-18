import { createServerClient } from '@/lib/supabase';
import { AddCustomSiteRequest, AddCustomSiteResponse, CustomSite } from '@/types/preferences';

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

    const body: AddCustomSiteRequest = await request.json();
    const { name, url } = body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json(
        { error: 'Site name is required' },
        { status: 400 }
      );
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return Response.json(
        { error: 'Site URL is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        { error: 'Site name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return Response.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Get user's profile to check existing custom sites
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('custom_sites')
      .eq('id', user.id)
      .single();

    const customSites = profile?.custom_sites || [];

    // Check for duplicate names
    const isDuplicate = customSites.some(
      (site: CustomSite) => site.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      return Response.json(
        { error: 'A site with this name already exists' },
        { status: 400 }
      );
    }

    // Create new custom site
    const newSite: CustomSite = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add to custom sites array
    const updatedCustomSites = [...customSites, newSite];

    // Update user profile
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update({
        custom_sites: updatedCustomSites,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to add custom site' },
        { status: 500 }
      );
    }

    const response: AddCustomSiteResponse = {
      data: newSite,
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

export async function GET(request: Request): Promise<Response> {
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

    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('custom_sites')
      .eq('id', user.id)
      .single();

    const customSites = profile?.custom_sites || [];

    return Response.json({
      data: customSites,
      error: null,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
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

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('id');

    if (!siteId) {
      return Response.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('custom_sites, preferred_sites')
      .eq('id', user.id)
      .single();

    const customSites = profile?.custom_sites || [];
    const preferredSites = profile?.preferred_sites || [];

    // Remove from custom sites
    const updatedCustomSites = customSites.filter(
      (site: CustomSite) => site.id !== siteId
    );

    // Remove from preferred sites if present
    const updatedPreferredSites = preferredSites.filter(
      (id: string) => id !== siteId
    );

    const { error } = await (supabase as any)
      .from('user_profiles')
      .update({
        custom_sites: updatedCustomSites,
        preferred_sites: updatedPreferredSites,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to delete custom site' },
        { status: 500 }
      );
    }

    return Response.json({
      data: { id: siteId },
      error: null,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getProfile, updateProfile } from '@/backend/services/auth/profileService';

/**
 * GET /api/profile
 * Retrieves the current user's profile
 */
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

    const profile = await getProfile(user.id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Updates the current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    const updatedProfile = await updateProfile(user.id, updates);

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    
    // Handle specific errors
    if (error.message.includes('Username already taken')) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    if (error.message.includes('Validation failed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validatePasswordChangeData } from '@/backend/services/auth/profilePasswordValidator';
import { changePassword } from '@/backend/services/auth/profileService';

/**
 * POST /api/profile/password
 * Changes or sets the current user's password.
 * For OAuth-only accounts (no email/password identity), currentPassword is not required.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Determine if this user has a local email/password credential
    const identities = user.identities ?? [];
    const hasPasswordIdentity = identities.some(
      (id: any) => id.provider === 'email'
    );

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate — only require currentPassword for email/password accounts
    const validation = validatePasswordChangeData(
      { currentPassword, newPassword, confirmPassword },
      { requireCurrentPassword: hasPasswordIdentity }
    );

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    await changePassword(user.id, newPassword);

    return NextResponse.json({
      success: true,
      message: hasPasswordIdentity
        ? 'Password changed successfully'
        : 'Password set successfully'
    });
  } catch (error: any) {
    console.error('Password change error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

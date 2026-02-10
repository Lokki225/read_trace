import { NextRequest, NextResponse } from 'next/server';
import { authService, AuthServiceError } from '@/backend/services/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await authService.signUp(email, password);

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        requiresEmailConfirmation: result.requiresEmailConfirmation
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

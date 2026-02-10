import { NextRequest, NextResponse } from 'next/server';
import { authService, AuthServiceError } from '@/backend/services/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await authService.resendConfirmationEmail(email);

    return NextResponse.json(
      {
        success: true,
        message: 'Confirmation email sent successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof AuthServiceError) {
      console.error('AuthServiceError:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack
      });
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Unexpected resend error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

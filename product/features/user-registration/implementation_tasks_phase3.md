# Implementation Tasks - Phase 3: Presentation Layer

**Feature**: User Registration with Email & Password  
**Phase**: Presentation Layer (UI Components, Forms, Pages)  
**Dependencies**: Phase 1 (Domain), Phase 2 (Data)  
**Estimated Duration**: 2 days

## Phase Overview

Phase 3 builds the user-facing components including registration form, password strength indicator, email confirmation UI, and page layouts using Next.js, shadcn/ui, and React Hook Form.

## Phase Completion Criteria

- [ ] Registration page fully functional
- [ ] Form validation working with real-time feedback
- [ ] Password strength indicator displaying correctly
- [ ] Loading states and error handling implemented
- [ ] Responsive design working on all screen sizes
- [ ] Component tests passing
- [ ] Accessibility requirements met

---

## Task 3.1: Create Registration Page

**File**: `src/app/auth/register/page.tsx`

**Description**: Create Next.js page for user registration with Server Component wrapper.

**Acceptance Criteria**:
- Server Component for layout
- Client Component for interactive form
- Proper meta tags for SEO
- Redirects if already authenticated
- Responsive layout

**Implementation Details**:
```typescript
// src/app/auth/register/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | ReadTrace',
  description: 'Create your ReadTrace account to start tracking your reading progress',
};

export default async function RegisterPage() {
  // Check if user is already authenticated
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start tracking your reading progress today
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run dev
# Navigate to http://localhost:3000/auth/register
```

**Dependencies**: 
- Phase 2 (Supabase client)

**Estimated Time**: 1 hour

---

## Task 3.2: Create RegisterForm Component

**File**: `src/components/auth/RegisterForm.tsx`

**Description**: Interactive registration form with React Hook Form and Zod validation.

**Acceptance Criteria**:
- Client Component for interactivity
- React Hook Form integration
- Zod schema validation
- Real-time validation feedback
- Loading states during submission
- Error message display
- Success message with redirect

**Implementation Details**:
```typescript
// src/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormData } from '@/model/validation/authValidation';
import { authService } from '@/backend/services/auth/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur'
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.signUp(data.email, data.password);

      setSuccess(true);
      
      // Redirect to confirmation pending page
      setTimeout(() => {
        router.push('/auth/confirm?email=' + encodeURIComponent(data.email));
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          Registration successful! Please check your email to confirm your account.
          Redirecting...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        {passwordValue && !errors.password && (
          <PasswordStrengthIndicator password={passwordValue} />
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-xs text-gray-600 text-center">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="underline">Terms of Service</a> and{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>
      </p>
    </form>
  );
}
```

**Verification**:
```bash
npm run test tests/integration/RegisterForm.test.tsx
```

**Dependencies**: 
- Task 3.1 (Registration page)
- Phase 1 (Validation schemas)
- Phase 2 (Auth service)

**Estimated Time**: 3 hours

---

## Task 3.3: Create Password Strength Indicator Component

**File**: `src/components/auth/PasswordStrengthIndicator.tsx`

**Description**: Visual component showing password strength in real-time.

**Acceptance Criteria**:
- Real-time strength calculation
- Color-coded indicator (red/yellow/green)
- Descriptive label (weak/medium/strong)
- Helpful feedback messages
- Smooth transitions

**Implementation Details**:
```typescript
// src/components/auth/PasswordStrengthIndicator.tsx
'use client';

import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/backend/services/auth/passwordValidator';
import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => validatePassword(password), [password]);

  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  const textColorClasses = {
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700'
  };

  const color = getPasswordStrengthColor(strength.score);
  const label = getPasswordStrengthLabel(strength.score);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              segment <= strength.score / 25
                ? colorClasses[color]
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${textColorClasses[color]} capitalize`}>
          Password strength: {label}
        </span>
        <span className="text-xs text-gray-500">
          {strength.score}/100
        </span>
      </div>

      {/* Feedback messages */}
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.feedback.map((message, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-1">•</span>
              <span>{message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Verification**:
```bash
npm run test tests/unit/PasswordStrengthIndicator.test.tsx
```

**Dependencies**: 
- Phase 1 (Password validator)

**Estimated Time**: 1.5 hours

---

## Task 3.4: Create Email Confirmation Page

**File**: `src/app/auth/confirm/page.tsx`

**Description**: Page shown after registration prompting user to check email.

**Acceptance Criteria**:
- Clear instructions for email confirmation
- Resend confirmation email button
- Rate limiting on resend (1 per minute)
- Visual feedback on resend action

**Implementation Details**:
```typescript
// src/app/auth/confirm/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/backend/services/auth/authService';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [lastResendTime, setLastResendTime] = useState<number>(0);

  const handleResendEmail = async () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;

    // Rate limiting: 1 per minute
    if (timeSinceLastResend < 60000) {
      const secondsRemaining = Math.ceil((60000 - timeSinceLastResend) / 1000);
      setResendError(`Please wait ${secondsRemaining} seconds before resending`);
      return;
    }

    if (!email) {
      setResendError('Email address not found');
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await authService.resendConfirmationEmail(email);
      setResendSuccess(true);
      setLastResendTime(now);
      
      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setResendError(error.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a confirmation email to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-900">Next steps:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Check your inbox for our confirmation email</li>
              <li>Click the confirmation link in the email</li>
              <li>You'll be redirected back to log in</li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-3">
              Didn't receive the email? Check your spam folder or request a new one.
            </p>
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend confirmation email'
              )}
            </Button>
          </div>

          {resendSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Confirmation email sent successfully!
              </AlertDescription>
            </Alert>
          )}

          {resendError && (
            <Alert variant="destructive">
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-center">
          <a href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run dev
# Navigate to /auth/confirm?email=test@example.com
```

**Dependencies**: 
- Phase 2 (Auth service)

**Estimated Time**: 2 hours

---

## Task 3.5: Create Email Confirmation Callback Handler

**File**: `src/app/auth/callback/route.ts`

**Description**: API route to handle email confirmation callback from Supabase.

**Acceptance Criteria**:
- Validates confirmation token
- Updates user status
- Redirects to login page
- Shows success message

**Implementation Details**:
```typescript
// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerClient();
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Redirect to error page
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?message=${encodeURIComponent('Email confirmation failed')}`
      );
    }

    // Redirect to login with success message
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?confirmed=true`
    );
  }

  // No code provided, redirect to home
  return NextResponse.redirect(requestUrl.origin);
}
```

**Verification**:
```bash
# Test by clicking confirmation link in email
```

**Dependencies**: 
- Phase 2 (Supabase client)

**Estimated Time**: 1 hour

---

## Task 3.6: Add Responsive Design and Accessibility

**Description**: Ensure all components are responsive and accessible.

**Acceptance Criteria**:
- Works on mobile (375px), tablet (768px), desktop (1440px)
- Keyboard navigation functional
- Screen reader compatible
- ARIA labels where needed
- Focus states visible
- Touch targets minimum 44px

**Implementation**: Update existing components with:
- Responsive Tailwind classes
- ARIA labels on form inputs
- Focus visible styles
- Proper semantic HTML

**Verification**:
```bash
# Manual testing on different screen sizes
# Keyboard navigation test (Tab, Enter, Escape)
# Screen reader test (VoiceOver, NVDA)
```

**Dependencies**: 
- All previous tasks in Phase 3

**Estimated Time**: 2 hours

---

## Task 3.7: Write Component Tests

**Files**:
- `tests/unit/RegisterForm.test.tsx`
- `tests/unit/PasswordStrengthIndicator.test.tsx`
- `tests/integration/registration-flow.test.tsx`

**Description**: Comprehensive tests for all UI components.

**Test Coverage**:
- RegisterForm renders correctly
- Form validation triggers appropriately
- Submit button disabled when invalid
- Loading states display correctly
- Error messages show for failed registration
- Success state and redirect work

**Implementation**: See test-scenarios.md TS-013, TS-014

**Verification**:
```bash
npm run test:unit
npm run test:coverage
```

**Dependencies**: 
- All previous tasks in Phase 3

**Estimated Time**: 3 hours

---

## Phase 3 Verification Checklist

Before proceeding to Phase 4, verify:

- [ ] Registration page accessible at /auth/register
- [ ] Form validation works (client-side)
- [ ] Password strength indicator updates in real-time
- [ ] Form submits and calls auth service
- [ ] Loading states display during submission
- [ ] Error messages show for failures
- [ ] Success message shows after registration
- [ ] Redirects to confirmation page
- [ ] Confirmation page shows email and resend button
- [ ] Email callback handler processes confirmations
- [ ] Responsive design works on all screen sizes
- [ ] Keyboard navigation functional
- [ ] Component tests passing (>90% coverage)

## Phase 3 Deliverables

1. ✅ Registration page (`src/app/auth/register/page.tsx`)
2. ✅ RegisterForm component (`src/components/auth/RegisterForm.tsx`)
3. ✅ PasswordStrengthIndicator (`src/components/auth/PasswordStrengthIndicator.tsx`)
4. ✅ Email confirmation page (`src/app/auth/confirm/page.tsx`)
5. ✅ Callback handler (`src/app/auth/callback/route.ts`)
6. ✅ Responsive design and accessibility
7. ✅ Component tests (90%+ coverage)

## Dependencies for Next Phase

Phase 4 (Integration & Testing) depends on:
- All components from Phase 3
- Auth service from Phase 2
- Validation from Phase 1

---

**Phase 3 Status**: Ready for implementation  
**Estimated Total Time**: 13.5 hours  
**Priority**: HIGH (required for user-facing functionality)

# Implementation Tasks - Phase 1: Domain Layer

**Feature**: User Registration with Email & Password  
**Phase**: Domain Layer (Business Logic & Validation)  
**Dependencies**: None  
**Estimated Duration**: 1 day

## Phase Overview

Phase 1 establishes the foundational business logic, validation rules, and domain models for user registration. This phase focuses on pure business logic with no UI or database dependencies.

## Phase Completion Criteria

- [ ] All domain models and interfaces defined
- [ ] All validation logic implemented and tested
- [ ] All business rules documented
- [ ] Unit tests passing (>95% coverage)
- [ ] No dependencies on UI or database

---

## Task 1.1: Define Domain Models and TypeScript Interfaces

**File**: `model/schemas/user.ts`

**Description**: Create TypeScript interfaces for User, UserProfile, and related domain entities.

**Acceptance Criteria**:
- User interface matches Supabase Auth user structure
- UserProfile interface includes all required fields
- Preferences interface with proper types
- Enums for user status, auth providers

**Implementation Details**:
```typescript
// model/schemas/user.ts

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  DISCORD = 'discord'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface User {
  id: string; // UUID
  email: string;
  email_confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  email_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  default_scan_site: string | null;
}

export interface UserProfile {
  id: string; // UUID, matches auth.users.id
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  auth_provider: AuthProvider;
  status: UserStatus;
  preferences: UserPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface RegistrationData {
  email: string;
  password: string;
}

export interface RegistrationResult {
  user: User;
  requiresEmailConfirmation: boolean;
}
```

**Verification**:
```bash
# Type check
npm run type-check

# Verify no compilation errors
tsc --noEmit
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.2: Implement Password Validation Business Logic

**File**: `backend/services/auth/passwordValidator.ts`

**Description**: Create pure functions for password strength validation following NIST 2026 guidelines.

**Acceptance Criteria**:
- Minimum 8 characters validation
- Character composition validation (uppercase, lowercase, number, special)
- Password strength scoring (0-100)
- Common password detection
- Clear, specific error messages

**Implementation Details**:
```typescript
// backend/services/auth/passwordValidator.ts

export interface PasswordValidationResult {
  isValid: boolean;
  isStrong: boolean; // score >= 70
  score: number; // 0-100
  errors: string[];
  feedback: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  blockCommon: boolean;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  blockCommon: true
};

// Top 100 most common passwords
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  // ... add more
]);

export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters`);
  } else {
    score += 20;
    if (password.length >= 12) score += 10; // Bonus for longer passwords
  }

  // Check uppercase
  const hasUppercase = /[A-Z]/.test(password);
  if (requirements.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
    feedback.push('Add an uppercase letter (A-Z)');
  } else if (hasUppercase) {
    score += 15;
  }

  // Check lowercase
  const hasLowercase = /[a-z]/.test(password);
  if (requirements.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
    feedback.push('Add a lowercase letter (a-z)');
  } else if (hasLowercase) {
    score += 15;
  }

  // Check number
  const hasNumber = /[0-9]/.test(password);
  if (requirements.requireNumber && !hasNumber) {
    errors.push('Password must contain at least one number');
    feedback.push('Add a number (0-9)');
  } else if (hasNumber) {
    score += 15;
  }

  // Check special character
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (requirements.requireSpecial && !hasSpecial) {
    errors.push('Password must contain at least one special character');
    feedback.push('Add a special character (!@#$%^&*)');
  } else if (hasSpecial) {
    score += 15;
  }

  // Check for common passwords
  if (requirements.blockCommon && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a different one');
    feedback.push('Avoid common passwords');
    score = Math.min(score, 30); // Cap score for common passwords
  } else {
    score += 10;
  }

  // Bonus for character variety
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.8) {
    score += 5; // High character diversity
  }

  const isValid = errors.length === 0;
  const isStrong = score >= 70;

  return {
    isValid,
    isStrong,
    score: Math.min(score, 100),
    errors,
    feedback: isValid && !isStrong ? feedback : []
  };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score < 40) return 'weak';
  if (score < 70) return 'medium';
  return 'strong';
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 40) return 'red';
  if (score < 70) return 'yellow';
  return 'green';
}
```

**Verification**:
```bash
npm run test tests/unit/passwordValidator.test.ts
```

**Dependencies**: None (pure function)

**Estimated Time**: 2 hours

---

## Task 1.3: Implement Email Validation Business Logic

**File**: `backend/services/auth/emailValidator.ts`

**Description**: Create email format validation with proper regex and business rules.

**Acceptance Criteria**:
- RFC 5322 compliant email validation
- Case normalization (lowercase)
- Trim whitespace
- Domain validation
- Clear error messages

**Implementation Details**:
```typescript
// backend/services/auth/emailValidator.ts

export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail: string | null;
  error: string | null;
}

// RFC 5322 compliant email regex (simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  // Add more disposable email domains
]);

export function validateEmail(email: string): EmailValidationResult {
  // Trim whitespace
  const trimmed = email.trim();

  // Check if empty
  if (!trimmed) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email is required'
    };
  }

  // Check length
  if (trimmed.length > 255) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email is too long (maximum 255 characters)'
    };
  }

  // Check format
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Please enter a valid email address'
    };
  }

  // Normalize: lowercase
  const normalized = trimmed.toLowerCase();

  // Extract domain
  const domain = normalized.split('@')[1];

  // Check for disposable email (optional - can be disabled)
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Disposable email addresses are not allowed'
    };
  }

  // Check for consecutive dots
  if (normalized.includes('..')) {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email contains invalid consecutive dots'
    };
  }

  return {
    isValid: true,
    normalizedEmail: normalized,
    error: null
  };
}
```

**Verification**:
```bash
npm run test tests/unit/emailValidator.test.ts
```

**Dependencies**: None (pure function)

**Estimated Time**: 1 hour

---

## Task 1.4: Create Zod Validation Schemas

**File**: `model/validation/authValidation.ts`

**Description**: Define Zod schemas for type-safe runtime validation of registration data.

**Acceptance Criteria**:
- Registration schema with email and password validation
- Integrates with custom validators
- Proper error messages
- TypeScript type inference

**Implementation Details**:
```typescript
// model/validation/authValidation.ts
import { z } from 'zod';
import { validateEmail } from '@/backend/services/auth/emailValidator';
import { validatePassword } from '@/backend/services/auth/passwordValidator';

export const registrationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .refine(
      (email) => validateEmail(email).isValid,
      (email) => ({
        message: validateEmail(email).error || 'Invalid email address'
      })
    )
    .transform((email) => validateEmail(email).normalizedEmail!),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .refine(
      (password) => validatePassword(password).isValid,
      (password) => {
        const result = validatePassword(password);
        return {
          message: result.errors[0] || 'Invalid password'
        };
      }
    )
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Additional schemas for other auth operations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
});
```

**Verification**:
```bash
npm run test tests/unit/authValidation.test.ts
```

**Dependencies**: 
- Task 1.2 (passwordValidator)
- Task 1.3 (emailValidator)

**Estimated Time**: 1.5 hours

---

## Task 1.5: Write Unit Tests for Domain Layer

**Files**:
- `tests/unit/passwordValidator.test.ts`
- `tests/unit/emailValidator.test.ts`
- `tests/unit/authValidation.test.ts`

**Description**: Comprehensive unit tests for all validation logic.

**Test Coverage Requirements**:
- Password validation: All requirements, edge cases, common passwords
- Email validation: Valid formats, invalid formats, normalization
- Zod schemas: Valid data, invalid data, error messages

**Implementation**: See test-scenarios.md TS-001, TS-002, TS-003

**Verification**:
```bash
npm run test:unit
npm run test:coverage
```

**Dependencies**:
- Task 1.2, 1.3, 1.4

**Estimated Time**: 3 hours

---

## Phase 1 Verification Checklist

Before proceeding to Phase 2, verify:

- [ ] All TypeScript interfaces compile without errors
- [ ] Password validation passes all test scenarios
- [ ] Email validation passes all test scenarios
- [ ] Zod schemas validate correctly
- [ ] Unit test coverage >= 95%
- [ ] No circular dependencies
- [ ] All functions are pure (no side effects)
- [ ] Documentation strings added to all public functions

## Phase 1 Deliverables

1. ✅ Domain models defined (`model/schemas/user.ts`)
2. ✅ Password validator (`backend/services/auth/passwordValidator.ts`)
3. ✅ Email validator (`backend/services/auth/emailValidator.ts`)
4. ✅ Zod validation schemas (`model/validation/authValidation.ts`)
5. ✅ Unit tests (95%+ coverage)

## Dependencies for Next Phase

Phase 2 (Data Layer) depends on:
- User and UserProfile interfaces from Task 1.1
- Validation schemas from Task 1.4

---

**Phase 1 Status**: Ready for implementation  
**Estimated Total Time**: 8.5 hours  
**Priority**: CRITICAL (blocks all other phases)

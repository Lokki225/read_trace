# Implementation Tasks - Phase 1: Domain Layer

**Feature**: User Profile Management  
**Phase**: Domain Layer (Business Logic & Validation)  
**Dependencies**: None  
**Estimated Duration**: 1 day

## Phase Overview

Phase 1 establishes the foundational business logic, validation rules, and domain models for user profile management. This phase focuses on pure business logic with no UI or database dependencies.

## Phase Completion Criteria

- [ ] All profile domain models and interfaces defined
- [ ] All validation logic implemented and tested
- [ ] All business rules documented
- [ ] Unit tests passing (>85% coverage)
- [ ] No dependencies on UI or database

---

## Task 1.1: Define Profile Domain Models and TypeScript Interfaces

**File**: `model/schemas/profile.ts`

**Description**: Create TypeScript interfaces for UserProfile, ProfileUpdate, and related domain entities.

**Acceptance Criteria**:
- UserProfile interface with all required fields
- ProfileUpdate interface for updates
- PasswordChange interface for password operations
- Enums for profile status and preferences

**Implementation Details**:
```typescript
// model/schemas/profile.ts

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProfileUpdate {
  username?: string;
  display_name?: string;
  bio?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OAuthProvider {
  provider_name: string;
  provider_id: string;
  linked_at: Date;
}
```

**Verification**:
```bash
npm run type-check
tsc --noEmit
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.2: Implement Profile Validation Logic

**File**: `backend/services/profile/profileValidator.ts`

**Description**: Create functions for validating profile data.

**Acceptance Criteria**:
- Username validation (3-30 chars, alphanumeric)
- Display name validation (1-100 chars)
- Bio validation (max 500 chars)
- Clear error messages

**Implementation Details**:
```typescript
// backend/services/profile/profileValidator.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (username.length > 30) {
    errors.push('Username must be at most 30 characters');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateDisplayName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (name.length < 1) {
    errors.push('Display name is required');
  }
  if (name.length > 100) {
    errors.push('Display name must be at most 100 characters');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

**Verification**:
```bash
npm run test -- profileValidator.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.3: Implement Password Validation for Profile Changes

**File**: `backend/services/profile/passwordValidator.ts`

**Description**: Create functions for validating password changes.

**Acceptance Criteria**:
- Minimum 8 characters
- Character composition validation
- Password strength scoring
- Confirmation password matching

**Implementation Details**:
```typescript
// backend/services/profile/passwordValidator.ts

export interface PasswordValidationResult {
  isValid: boolean;
  isStrong: boolean;
  score: number;
  errors: string[];
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordValidationResult {
  const errors: string[] = [];
  
  if (newPassword !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  if (newPassword.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(newPassword)) {
    errors.push('Password must contain uppercase letter');
  }
  
  if (!/[a-z]/.test(newPassword)) {
    errors.push('Password must contain lowercase letter');
  }
  
  if (!/[0-9]/.test(newPassword)) {
    errors.push('Password must contain number');
  }
  
  const score = calculatePasswordStrength(newPassword);
  
  return {
    isValid: errors.length === 0,
    isStrong: score >= 70,
    score,
    errors
  };
}

function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;
  return Math.min(score, 100);
}
```

**Verification**:
```bash
npm run test -- passwordValidator.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Phase 1 Completion Checklist

- [ ] All profile domain models defined
- [ ] Profile validation implemented
- [ ] Password validation implemented
- [ ] All unit tests passing (>85% coverage)
- [ ] No external dependencies in this phase
- [ ] Code review approved
- [ ] Ready for Phase 2

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]

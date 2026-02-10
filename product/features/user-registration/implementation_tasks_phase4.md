# Implementation Tasks - Phase 4: Integration & Testing

**Feature**: User Registration with Email & Password  
**Phase**: Integration & Testing (End-to-End Testing, Quality Assurance)  
**Dependencies**: Phase 1, 2, 3 complete  
**Estimated Duration**: 2 days

## Phase Overview

Phase 4 validates the complete registration feature through comprehensive testing, performance benchmarking, security auditing, and final quality assurance before marking the story as complete.

## Phase Completion Criteria

- [ ] All end-to-end tests passing
- [ ] Performance benchmarks met (<2min registration, <500ms API)
- [ ] Security audit passed (RLS, password hashing, rate limiting)
- [ ] All acceptance criteria validated
- [ ] Test coverage >= 90%
- [ ] No regressions in existing tests
- [ ] Documentation complete
- [ ] Story marked as DONE

---

## Task 4.1: End-to-End Testing with Playwright

**File**: `tests/e2e/registration.spec.ts`

**Description**: Complete user journey testing from registration page to email confirmation.

**Acceptance Criteria**:
- Test happy path: register → confirm email → login
- Test validation errors display correctly
- Test duplicate email prevention
- Test rate limiting
- Test responsive design on multiple viewports
- Test keyboard navigation

**Implementation Details**:
```typescript
// tests/e2e/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('should complete full registration flow', async ({ page }) => {
    // Fill registration form
    await page.getByLabel('Email address').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');

    // Verify password strength indicator appears
    await expect(page.getByText('Password strength:')).toBeVisible();

    // Submit form
    await page.getByRole('button', { name: 'Create account' }).click();

    // Verify loading state
    await expect(page.getByText('Creating account...')).toBeVisible();

    // Verify success message
    await expect(page.getByText('Registration successful!')).toBeVisible();

    // Verify redirect to confirmation page
    await expect(page).toHaveURL(/\/auth\/confirm/);
    await expect(page.getByText('Check your email')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.getByLabel('Email address').fill('invalid-email');
    await page.getByLabel('Email address').blur();

    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should show validation errors for weak password', async ({ page }) => {
    await page.getByLabel('Password').fill('weak');
    await page.getByLabel('Password').blur();

    await expect(page.getByText(/Password must be at least 8 characters/)).toBeVisible();
  });

  test('should disable submit button when form is invalid', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Create account' });
    
    // Empty form
    await expect(submitButton).toBeDisabled();

    // Fill email only
    await page.getByLabel('Email address').fill('test@example.com');
    await expect(submitButton).toBeDisabled();

    // Fill valid password
    await page.getByLabel('Password').fill('SecurePass123!');
    await expect(submitButton).toBeEnabled();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' });

    await passwordInput.fill('SecurePass123!');

    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle duplicate email error', async ({ page }) => {
    // Mock existing user
    await page.route('**/auth/v1/signup', async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ error: { message: 'User already registered' } })
      });
    });

    await page.getByLabel('Email address').fill('existing@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('An account with this email already exists')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab'); // Focus email
    await page.keyboard.type('test@example.com');
    
    await page.keyboard.press('Tab'); // Focus password
    await page.keyboard.type('SecurePass123!');
    
    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Submit

    await expect(page.getByText('Registration successful!')).toBeVisible();
  });
});

test.describe('Email Confirmation Page', () => {
  test('should display confirmation instructions', async ({ page }) => {
    await page.goto('/auth/confirm?email=test@example.com');

    await expect(page.getByText('Check your email')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resend confirmation email' })).toBeVisible();
  });

  test('should handle email resend', async ({ page }) => {
    await page.goto('/auth/confirm?email=test@example.com');

    await page.getByRole('button', { name: 'Resend confirmation email' }).click();

    await expect(page.getByText('Confirmation email sent successfully!')).toBeVisible();
  });

  test('should enforce rate limiting on resend', async ({ page }) => {
    await page.goto('/auth/confirm?email=test@example.com');

    // First resend
    await page.getByRole('button', { name: 'Resend confirmation email' }).click();
    await expect(page.getByText('Confirmation email sent successfully!')).toBeVisible();

    // Immediate second resend should be blocked
    await page.getByRole('button', { name: 'Resend confirmation email' }).click();
    await expect(page.getByText(/Please wait.*seconds before resending/)).toBeVisible();
  });
});
```

**Verification**:
```bash
npm run test:e2e
```

**Dependencies**: 
- All phases 1-3 complete
- Playwright configured

**Estimated Time**: 4 hours

---

## Task 4.2: Performance Benchmarking

**File**: `tests/performance/registration-performance.test.ts`

**Description**: Measure and validate performance metrics for registration flow.

**Acceptance Criteria**:
- Registration API < 500ms (P95)
- Page load time < 1s (FCP)
- Form interactivity < 100ms
- Email delivery < 5s
- All metrics documented

**Implementation Details**:
```typescript
// tests/performance/registration-performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Registration Performance', () => {
  test('registration page should load within 1 second', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(1000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('form input should respond within 100ms', async ({ page }) => {
    await page.goto('/auth/register');
    
    const emailInput = page.getByLabel('Email address');
    const startTime = Date.now();
    
    await emailInput.fill('test@example.com');
    await page.waitForTimeout(50); // Small buffer
    
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(150);
    console.log(`Input response time: ${responseTime}ms`);
  });

  test('password strength calculation should be fast', async ({ page }) => {
    await page.goto('/auth/register');
    
    const passwordInput = page.getByLabel('Password');
    const startTime = Date.now();
    
    await passwordInput.fill('SecurePass123!');
    await page.waitForSelector('[class*="strength"]', { timeout: 200 });
    
    const calculationTime = Date.now() - startTime;
    
    expect(calculationTime).toBeLessThan(150);
    console.log(`Password strength calculation: ${calculationTime}ms`);
  });

  test('registration API should respond within 500ms', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.getByLabel('Email address').fill('perf-test@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    
    const startTime = Date.now();
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForSelector('[class*="success"]', { timeout: 1000 });
    
    const apiTime = Date.now() - startTime;
    
    expect(apiTime).toBeLessThan(500);
    console.log(`Registration API time: ${apiTime}ms`);
  });
});
```

**Verification**:
```bash
npm run test:performance
```

**Performance Targets**:
- Page Load (FCP): < 1s ✓
- Form Interactivity: < 100ms ✓
- Password Strength: < 100ms ✓
- Registration API: < 500ms ✓

**Dependencies**: 
- Phase 3 complete

**Estimated Time**: 2 hours

---

## Task 4.3: Security Audit

**File**: `tests/security/registration-security.test.ts`

**Description**: Validate security measures including RLS, password hashing, input sanitization, and rate limiting.

**Acceptance Criteria**:
- Row Level Security enforced
- Passwords never exposed
- SQL injection prevented
- XSS prevention validated
- Rate limiting functional
- HTTPS enforced

**Security Checklist**:
```markdown
## Security Audit Checklist

### Authentication Security
- [ ] Passwords hashed with bcrypt (Supabase default)
- [ ] Passwords never logged or exposed in API responses
- [ ] Password requirements enforced (8+ chars, complexity)
- [ ] Email verification required before account activation

### Database Security
- [ ] Row Level Security (RLS) enabled on user_profiles
- [ ] Users can only access their own profile data
- [ ] Foreign key constraints prevent orphaned records
- [ ] Database triggers properly secured (SECURITY DEFINER)

### Input Validation
- [ ] Email format validated (client and server)
- [ ] Password strength validated (client and server)
- [ ] SQL injection prevention (parameterized queries via Supabase)
- [ ] XSS prevention (React auto-escaping, no dangerouslySetInnerHTML)

### Rate Limiting
- [ ] Registration attempts limited (5 per hour per IP)
- [ ] Email resend limited (1 per minute per email)
- [ ] Failed login attempts limited (covered in separate story)

### Network Security
- [ ] HTTPS enforced in production (Vercel default)
- [ ] Secure cookies for session management (Supabase Auth Helpers)
- [ ] CORS properly configured (Supabase dashboard)
- [ ] No sensitive data in client-side code

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL safe for client exposure
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY safe for client exposure
- [ ] SUPABASE_SERVICE_ROLE_KEY never exposed to client
- [ ] No hardcoded secrets in codebase

### Compliance
- [ ] GDPR: Privacy policy link present
- [ ] GDPR: Terms of service link present
- [ ] GDPR: User can delete account (separate story)
- [ ] GDPR: User data portable (separate story)
```

**Implementation Details**:
```typescript
// tests/security/registration-security.test.ts
import { createServerClient } from '@/lib/supabase';

describe('Registration Security', () => {
  it('should enforce Row Level Security', async () => {
    const supabase = createServerClient();

    // Create test user
    const { data: { user } } = await supabase.auth.signUp({
      email: 'rls-test@example.com',
      password: 'SecurePass123!'
    });

    // Attempt to query all profiles (should only return own)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*');

    expect(profiles).toHaveLength(1);
    expect(profiles![0].id).toBe(user!.id);
  });

  it('should prevent SQL injection', async () => {
    const maliciousEmail = "'; DROP TABLE users; --";
    
    const result = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: maliciousEmail,
        password: 'SecurePass123!'
      })
    });

    // Should be rejected by validation, not execute SQL
    expect(result.status).toBe(400);
  });

  it('should sanitize XSS attempts', async () => {
    const xssEmail = '<script>alert("xss")</script>@example.com';
    
    const result = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: xssEmail,
        password: 'SecurePass123!'
      })
    });

    expect(result.status).toBe(400);
  });

  it('should never expose passwords', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
    });

    const data = await response.json();
    
    // Verify password not in response
    expect(JSON.stringify(data)).not.toContain('SecurePass123!');
  });
});
```

**Verification**:
```bash
npm run test:security
```

**Dependencies**: 
- Phase 2 complete (RLS policies)

**Estimated Time**: 3 hours

---

## Task 4.4: Acceptance Criteria Validation

**File**: `tests/acceptance/registration-ac.test.ts`

**Description**: Systematically validate each acceptance criterion from acceptance-criteria.md.

**Acceptance Criteria**: All 12 AC from AC-001 to AC-012 must pass

**Implementation Details**:
```typescript
// tests/acceptance/registration-ac.test.ts
import { test, expect } from '@playwright/test';

test.describe('Acceptance Criteria Validation', () => {
  test('AC-001: Valid email and password registration', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.getByLabel('Email address').fill('ac001@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Verify success message
    await expect(page.getByText('Registration successful!')).toBeVisible();
    
    // Verify redirect to confirmation page
    await expect(page).toHaveURL(/\/auth\/confirm/);
  });

  test('AC-002: Password security requirements', async ({ page }) => {
    await page.goto('/auth/register');
    
    const tests = [
      { password: 'short', error: 'at least 8 characters' },
      { password: 'password123!', error: 'uppercase' },
      { password: 'PASSWORD123!', error: 'lowercase' },
      { password: 'Password!', error: 'number' },
      { password: 'Password123', error: 'special character' },
    ];

    for (const { password, error } of tests) {
      await page.getByLabel('Password').fill(password);
      await page.getByLabel('Password').blur();
      await expect(page.getByText(new RegExp(error, 'i'))).toBeVisible();
    }

    // Valid password
    await page.getByLabel('Password').fill('SecurePass123!');
    await expect(page.getByText('strong', { exact: false })).toBeVisible();
  });

  test('AC-003: Email format validation', async ({ page }) => {
    await page.goto('/auth/register');
    
    const invalidEmails = ['notanemail', 'test@', '@example.com'];
    
    for (const email of invalidEmails) {
      await page.getByLabel('Email address').fill(email);
      await page.getByLabel('Email address').blur();
      await expect(page.getByText(/valid email/i)).toBeVisible();
    }
  });

  test('AC-004: Duplicate email prevention', async ({ page }) => {
    // Mock duplicate email error
    await page.route('**/auth/v1/signup', async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ error: { message: 'User already registered' } })
      });
    });

    await page.goto('/auth/register');
    await page.getByLabel('Email address').fill('duplicate@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test('AC-008: Loading states', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.getByLabel('Email address').fill('loading@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    
    const submitButton = page.getByRole('button', { name: 'Create account' });
    await submitButton.click();

    // Verify loading state
    await expect(page.getByText('Creating account...')).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('AC-011: Password visibility toggle', async ({ page }) => {
    await page.goto('/auth/register');
    
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('SecurePass123!');

    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle to show
    await page.locator('button[type="button"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle to hide
    await page.locator('button[type="button"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('AC-012: Responsive design', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1440, height: 900, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/auth/register');

      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      
      console.log(`${viewport.name} (${viewport.width}x${viewport.height}): ✓`);
    }
  });
});
```

**Verification**:
```bash
npm run test:acceptance
```

**Pass Criteria**: All 12 acceptance criteria tests must pass

**Dependencies**: 
- Phase 3 complete

**Estimated Time**: 3 hours

---

## Task 4.5: Test Coverage Analysis

**Description**: Verify test coverage meets 90%+ threshold for all code.

**Acceptance Criteria**:
- Unit test coverage >= 95%
- Integration test coverage >= 90%
- Overall coverage >= 90%
- All critical paths covered
- Coverage report generated

**Commands**:
```bash
# Run all tests with coverage
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage -- --coverage --coverageReporters=html

# View coverage report
open coverage/index.html
```

**Coverage Targets**:
```
File                          | Statements | Branches | Functions | Lines
------------------------------|------------|----------|-----------|-------
All files                     |      92.5% |    90.2% |     94.1% | 92.8%
model/schemas/user.ts         |     100.0% |   100.0% |    100.0% |100.0%
model/validation/auth.ts      |     100.0% |   100.0% |    100.0% |100.0%
backend/.../passwordValidator |      98.5% |    95.0% |    100.0% | 98.5%
backend/.../emailValidator    |      96.0% |    92.0% |    100.0% | 96.0%
backend/.../authService       |      94.0% |    88.0% |     95.0% | 94.0%
components/auth/RegisterForm  |      90.0% |    85.0% |     90.0% | 90.0%
components/auth/PasswordStr   |      92.0% |    88.0% |     92.0% | 92.0%
```

**Verification**:
- Green checkmarks for all files >= 90%
- No critical paths below 90%
- Uncovered lines documented and justified

**Dependencies**: 
- All tests complete

**Estimated Time**: 1 hour

---

## Task 4.6: Documentation and Cleanup

**Description**: Finalize documentation, update story file, and prepare for code review.

**Acceptance Criteria**:
- README updated with registration feature
- API documentation complete
- Component documentation complete
- Story file updated with all changes
- Change log complete
- File list complete

**Updates Required**:

1. **Update Story File** (`_bmad-output/implementation-artifacts/2-1-user-registration-with-email-and-password.md`):
   - Mark all tasks [x] complete
   - Fill Dev Agent Record
   - Complete File List
   - Update Change Log
   - Set Status to "review"

2. **Update IMPLEMENTATION_STATUS.json**:
   - Update story status to "review"
   - Update confidence scores
   - Add completion timestamp

3. **Update sprint-status.yaml**:
   - Change story status from "ready-for-dev" to "review"

4. **Create Pull Request**:
   - Title: "feat: user registration with email & password (Story 2-1)"
   - Description with all changes
   - Link to story file
   - Screenshots of registration flow

**Verification**:
```bash
# Verify all files tracked
git status

# Verify tests pass
npm run test

# Verify build succeeds
npm run build

# Verify linting passes
npm run lint
```

**Dependencies**: 
- All previous tasks complete

**Estimated Time**: 2 hours

---

## Task 4.7: Final Quality Gates

**Description**: Run complete quality gate checks before marking story as done.

**Quality Gates**:
```markdown
## Pre-Review Quality Gates

### Functional Requirements
- [ ] All 12 acceptance criteria validated
- [ ] All 5 story tasks complete
- [ ] All subtasks marked complete
- [ ] Manual testing completed

### Test Requirements
- [ ] Unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] E2E tests passing (100%)
- [ ] Performance tests passing (100%)
- [ ] Security tests passing (100%)
- [ ] Test coverage >= 90%

### Code Quality
- [ ] TypeScript strict mode passing
- [ ] ESLint passing (0 errors)
- [ ] Prettier formatting applied
- [ ] No console.log statements (except intended)
- [ ] No TODO comments (resolved or ticketed)

### Performance
- [ ] Page load < 1s (FCP)
- [ ] Form interactivity < 100ms
- [ ] Registration API < 500ms
- [ ] No memory leaks detected

### Security
- [ ] RLS policies enforced and tested
- [ ] Password requirements enforced
- [ ] Input validation on client and server
- [ ] No sensitive data exposed
- [ ] Rate limiting functional

### Documentation
- [ ] Component JSDoc comments complete
- [ ] API functions documented
- [ ] README updated
- [ ] Story file complete

### Deployment Readiness
- [ ] Production build succeeds
- [ ] Environment variables documented
- [ ] Database migrations applied
- [ ] No hardcoded configuration
```

**Verification**:
```bash
# Run complete quality check
npm run quality:check

# This should run:
# - npm run type-check
# - npm run lint
# - npm run test
# - npm run build
```

**Dependencies**: 
- All previous tasks complete

**Estimated Time**: 1 hour

---

## Phase 4 Verification Checklist

Final verification before marking story DONE:

- [ ] All E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] All 12 acceptance criteria validated
- [ ] Test coverage >= 90%
- [ ] No regressions in existing tests
- [ ] Documentation complete
- [ ] Story file updated
- [ ] Quality gates passed
- [ ] Ready for code review

## Phase 4 Deliverables

1. ✅ E2E tests (`tests/e2e/registration.spec.ts`)
2. ✅ Performance tests (`tests/performance/registration-performance.test.ts`)
3. ✅ Security tests (`tests/security/registration-security.test.ts`)
4. ✅ Acceptance tests (`tests/acceptance/registration-ac.test.ts`)
5. ✅ Coverage report (>90%)
6. ✅ Updated documentation
7. ✅ Story file marked "review"

## Story Completion

Once Phase 4 is complete:
1. Update story status to "review"
2. Run `/bmad-bmm-code-review` workflow
3. Address code review findings
4. Update story status to "done"
5. Celebrate! 🎉

---

**Phase 4 Status**: Ready for implementation  
**Estimated Total Time**: 16 hours  
**Priority**: CRITICAL (final validation before release)

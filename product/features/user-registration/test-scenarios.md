# Test Scenarios: User Registration with Email & Password

## Overview

This document defines comprehensive test scenarios for the User Registration feature, organized by test type (unit, integration, performance, security).

## Test Coverage Summary

| Test Type | Scenario Count | Coverage Target | Priority |
|-----------|----------------|-----------------|----------|
| Unit Tests | 15 | 95% | HIGH |
| Integration Tests | 8 | 90% | HIGH |
| Performance Tests | 4 | 100% | MEDIUM |
| Security Tests | 6 | 100% | CRITICAL |
| **Total** | **33** | **90%+** | - |

---

## Unit Tests

### TS-001: Password Validation Logic

**Test File**: `tests/unit/passwordValidator.test.ts`

**Scenarios**:
1. **Minimum length validation**
   - Input: "short" → Expected: false, error: "Password must be at least 8 characters"
   - Input: "longenough" → Expected: passes length check

2. **Uppercase requirement**
   - Input: "password123!" → Expected: false, error: "Must contain at least one uppercase letter"
   - Input: "Password123!" → Expected: passes uppercase check

3. **Lowercase requirement**
   - Input: "PASSWORD123!" → Expected: false, error: "Must contain at least one lowercase letter"
   - Input: "Password123!" → Expected: passes lowercase check

4. **Number requirement**
   - Input: "Password!" → Expected: false, error: "Must contain at least one number"
   - Input: "Password1!" → Expected: passes number check

5. **Special character requirement**
   - Input: "Password123" → Expected: false, error: "Must contain at least one special character"
   - Input: "Password123!" → Expected: passes special char check

6. **Complete validation**
   - Input: "SecurePass123!" → Expected: true, strength: "strong"
   - Input: "WeakPass1!" → Expected: true, strength: "medium"

**Implementation**:
```typescript
describe('passwordValidator', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });
  
  // ... more tests
});
```

---

### TS-002: Email Format Validation

**Test File**: `tests/unit/emailValidator.test.ts`

**Scenarios**:
1. **Valid email formats**
   - Input: "user@example.com" → Expected: true
   - Input: "user.name@domain.co.uk" → Expected: true
   - Input: "user+tag@example.com" → Expected: true

2. **Invalid email formats**
   - Input: "notanemail" → Expected: false
   - Input: "test@" → Expected: false
   - Input: "@example.com" → Expected: false
   - Input: "test..user@example.com" → Expected: false

3. **Edge cases**
   - Input: "" → Expected: false, error: "Email is required"
   - Input: "a@b.c" → Expected: true (minimum valid email)
   - Input: "very.long.email.address@subdomain.example.com" → Expected: true

**Implementation**:
```typescript
describe('emailValidator', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  
  it('should reject invalid email formats', () => {
    expect(validateEmail('notanemail')).toBe(false);
  });
});
```

---

### TS-003: Zod Registration Schema

**Test File**: `tests/unit/authValidation.test.ts`

**Scenarios**:
1. **Valid registration data**
   - Input: { email: "test@example.com", password: "SecurePass123!" } → Expected: passes validation

2. **Missing fields**
   - Input: { email: "test@example.com" } → Expected: fails, error: "Password is required"
   - Input: { password: "SecurePass123!" } → Expected: fails, error: "Email is required"

3. **Invalid field types**
   - Input: { email: 123, password: "SecurePass123!" } → Expected: fails, error: "Expected string"

4. **Schema refinement**
   - Input: { email: "invalid", password: "weak" } → Expected: fails with multiple errors

**Implementation**:
```typescript
describe('registrationSchema', () => {
  it('should validate correct registration data', () => {
    const result = registrationSchema.safeParse({
      email: 'test@example.com',
      password: 'SecurePass123!'
    });
    expect(result.success).toBe(true);
  });
});
```

---

### TS-004: Password Strength Indicator

**Test File**: `tests/unit/passwordStrength.test.ts`

**Scenarios**:
1. **Weak passwords** → Expected: strength score < 40, color: red
2. **Medium passwords** → Expected: strength score 40-70, color: yellow
3. **Strong passwords** → Expected: strength score > 70, color: green

**Test Data**:
- Weak: "password", "12345678"
- Medium: "Password1", "Welcome123"
- Strong: "SecurePass123!", "MyP@ssw0rd2024!"

---

### TS-005: Auth Service - signUp Function

**Test File**: `tests/unit/authService.test.ts`

**Scenarios**:
1. **Successful signup**
   - Mock Supabase response: success
   - Expected: returns { user, session }

2. **Duplicate email**
   - Mock Supabase response: error "User already registered"
   - Expected: throws error with message

3. **Network error**
   - Mock Supabase response: network failure
   - Expected: throws error, allows retry

4. **Invalid credentials**
   - Input: weak password
   - Expected: validation fails before API call

**Implementation**:
```typescript
describe('authService.signUp', () => {
  it('should create user account successfully', async () => {
    const mockSupabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      }
    };
    
    const result = await authService.signUp('test@example.com', 'SecurePass123!');
    expect(result.user).toBeDefined();
  });
});
```

---

### TS-006: React Hook Form Integration

**Test File**: `tests/unit/RegisterForm.test.ts`

**Scenarios**:
1. **Form renders correctly**
2. **Field validation triggers on blur**
3. **Submit button disabled when form invalid**
4. **Form submission calls onSubmit handler**
5. **Error messages display correctly**

---

### TS-007: User Profile Creation

**Test File**: `tests/unit/profileService.test.ts`

**Scenarios**:
1. **Profile created with correct data**
2. **Default preferences applied**
3. **Foreign key constraint satisfied**
4. **Timestamps populated automatically**

---

## Integration Tests

### TS-008: Complete Registration Flow (Happy Path)

**Test File**: `tests/integration/registration.integration.test.ts`

**Scenario**: End-to-end successful registration

**Steps**:
1. Render registration page
2. Fill email field: "integration@example.com"
3. Fill password field: "SecurePass123!"
4. Click submit button
5. Wait for loading state
6. Verify success message displayed
7. Verify Supabase auth.users record created
8. Verify user_profiles record created
9. Verify confirmation email sent (mocked)

**Expected Result**: Complete flow succeeds, user data in database, confirmation email triggered

**Implementation**:
```typescript
describe('Registration Flow Integration', () => {
  it('should complete full registration successfully', async () => {
    render(<RegistrationPage />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
    
    // Verify database state
    const user = await getUser('test@example.com');
    expect(user).toBeDefined();
  });
});
```

---

### TS-009: Duplicate Email Prevention

**Test File**: `tests/integration/registration.integration.test.ts`

**Scenario**: Attempt to register with existing email

**Steps**:
1. Create existing user with "existing@example.com"
2. Render registration page
3. Fill form with same email
4. Submit form
5. Verify error message: "An account with this email already exists"
6. Verify no duplicate created in database

**Expected Result**: Registration fails with clear error, database integrity maintained

---

### TS-010: Email Confirmation Flow

**Test File**: `tests/integration/emailConfirmation.integration.test.ts`

**Scenario**: User confirms email via link

**Steps**:
1. Register new user
2. Extract confirmation token from email (mocked)
3. Navigate to /auth/callback?token=<token>
4. Verify account activated (email_confirmed_at set)
5. Verify redirect to login page
6. Verify success message displayed

**Expected Result**: Account activated, user can now log in

---

### TS-011: Registration Form Validation Integration

**Test File**: `tests/integration/formValidation.integration.test.ts`

**Scenarios**:
1. **Invalid email**: Shows error, blocks submission
2. **Weak password**: Shows error, blocks submission
3. **Empty fields**: Shows multiple errors
4. **Valid data**: Allows submission

---

### TS-012: Error Handling Integration

**Test File**: `tests/integration/errorHandling.integration.test.ts`

**Scenarios**:
1. **Network timeout**: Shows error, allows retry
2. **Server 500 error**: Shows error, form data preserved
3. **Rate limit exceeded**: Shows specific error message

---

### TS-013: Loading States Integration

**Test File**: `tests/integration/loadingStates.integration.test.ts`

**Scenario**: Verify UI updates during async operations

**Steps**:
1. Submit form
2. Verify button shows loading spinner
3. Verify form fields disabled
4. Wait for response
5. Verify loading state clears

---

### TS-014: Profile Creation with Registration

**Test File**: `tests/integration/profileCreation.integration.test.ts`

**Scenario**: User profile automatically created on registration

**Steps**:
1. Register new user
2. Query user_profiles table
3. Verify record exists with correct data
4. Verify default preferences applied

---

### TS-015: Responsive Design Integration

**Test File**: `tests/integration/responsive.integration.test.ts`

**Scenarios**:
1. **Mobile viewport**: Form usable, all features work
2. **Tablet viewport**: Layout adapts correctly
3. **Desktop viewport**: Optimal layout displayed

---

## Performance Tests

### TS-016: Form Interactivity Performance

**Test File**: `tests/performance/formInteractivity.test.ts`

**Metric**: Time from user input to visual feedback

**Scenarios**:
1. **Typing in email field** → Expected: <50ms per keystroke
2. **Typing in password field** → Expected: <50ms per keystroke
3. **Password strength calculation** → Expected: <100ms
4. **Validation on blur** → Expected: <100ms

**Measurement**:
```typescript
const startTime = performance.now();
await userEvent.type(emailInput, 'test@example.com');
const endTime = performance.now();
expect(endTime - startTime).toBeLessThan(500); // Total for full email
```

---

### TS-017: Registration API Performance

**Test File**: `tests/performance/registrationApi.test.ts`

**Metric**: Time to create account

**Scenarios**:
1. **Successful registration** → Expected: <500ms
2. **Duplicate email check** → Expected: <200ms
3. **Profile creation** → Expected: <300ms

---

### TS-018: Page Load Performance

**Test File**: `tests/performance/pageLoad.test.ts`

**Metrics**:
- **First Contentful Paint (FCP)**: <1s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Time to Interactive (TTI)**: <3s

---

### TS-019: Email Delivery Performance

**Test File**: `tests/performance/emailDelivery.test.ts`

**Metric**: Time from registration to email sent

**Expected**: <5 seconds (95th percentile)

---

## Security Tests

### TS-020: SQL Injection Prevention

**Test File**: `tests/security/sqlInjection.test.ts`

**Scenarios**:
1. **Email field**: Input: "'; DROP TABLE users; --" → Expected: Safely escaped
2. **Password field**: Input: "OR 1=1--" → Expected: Safely handled

**Expected Result**: No SQL injection possible, Supabase parameterized queries

---

### TS-021: XSS Prevention

**Test File**: `tests/security/xss.test.ts`

**Scenarios**:
1. **Email field**: Input: "<script>alert('xss')</script>" → Expected: Escaped/sanitized
2. **Display name**: Input: "<img src=x onerror=alert(1)>" → Expected: Escaped/sanitized

**Expected Result**: No script execution, proper escaping

---

### TS-022: Password Hashing

**Test File**: `tests/security/passwordHashing.test.ts`

**Scenarios**:
1. **Password never logged**: Verify no password in logs
2. **Password never in API response**: Verify Supabase doesn't return password
3. **Password hashed in database**: Verify bcrypt hash stored, not plain text

---

### TS-023: Rate Limiting

**Test File**: `tests/security/rateLimiting.test.ts`

**Scenarios**:
1. **5 registration attempts in 1 hour** → Expected: 5th succeeds
2. **6th registration attempt** → Expected: Rate limit error
3. **Different IP addresses** → Expected: Independent rate limits

---

### TS-024: HTTPS Enforcement

**Test File**: `tests/security/https.test.ts`

**Scenario**: Verify all auth requests use HTTPS

**Expected Result**: No plaintext credential transmission

---

### TS-025: Row Level Security

**Test File**: `tests/security/rls.test.ts`

**Scenarios**:
1. **User can view own profile** → Expected: Success
2. **User cannot view other profiles** → Expected: Access denied
3. **Anonymous cannot view any profiles** → Expected: Access denied

---

## Test Data Management

### Test User Factory

```typescript
// tests/factories/user.factory.ts
export const createTestUser = (overrides = {}) => ({
  email: faker.internet.email(),
  password: 'SecurePass123!',
  ...overrides
});
```

### Database Cleanup

```typescript
// tests/setup.ts
afterEach(async () => {
  await cleanupTestUsers();
});
```

---

## Continuous Integration

### Test Execution Order
1. Unit tests (fastest, run first)
2. Integration tests (medium speed)
3. Performance tests (slower)
4. Security tests (run in parallel with integration)

### Coverage Requirements
- **Unit tests**: 95% coverage minimum
- **Integration tests**: 90% critical path coverage
- **Overall**: 90%+ code coverage

### CI Pipeline
```yaml
test:
  unit: npm run test:unit
  integration: npm run test:integration
  performance: npm run test:performance
  security: npm run test:security
  coverage: npm run test:coverage
```

---

## Summary

**Total Test Scenarios**: 33  
**Estimated Test Execution Time**: 
- Unit: ~2 minutes
- Integration: ~5 minutes
- Performance: ~3 minutes
- Security: ~4 minutes
- **Total**: ~14 minutes

**Automation**: 100% automated via Jest + React Testing Library

**Test Maintenance**: Update tests whenever acceptance criteria change

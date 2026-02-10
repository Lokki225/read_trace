# Acceptance Criteria: User Registration with Email & Password

## Feature Overview
- **Feature**: User Registration with Email & Password
- **Epic**: 2 - User Authentication & Profiles
- **Story**: 2-1
- **Status**: IN_DEVELOPMENT
- **Total Criteria**: 12

## Acceptance Criteria Format

Each acceptance criterion follows BDD (Behavior-Driven Development) format:
```
Given [initial context]
When [user performs action]
Then [expected outcome]
And [additional outcomes]
```

---

## AC-001: Valid Email and Password Registration

**Given** I am on the registration page  
**When** I enter a valid email (user@example.com) and a strong password (SecurePass123!)  
**And** I submit the form  
**Then** my account is created in Supabase Auth  
**And** a user profile record is created in the database  
**And** a confirmation email is sent to my email address  
**And** I see a success message: "Registration successful! Please check your email to confirm your account"

**Verification Steps**:
1. Navigate to /auth/register
2. Enter email: newuser@example.com
3. Enter password: SecurePass123!
4. Click "Register" button
5. Verify success message displayed
6. Check database for new auth.users record
7. Check database for new user_profiles record
8. Verify confirmation email sent

**Test Data**:
- Valid email: newuser@example.com, test.user@domain.co.uk
- Valid password: SecurePass123!, MyP@ssw0rd2024

**Expected Results**:
- Form submits successfully
- Loading state shown during submission
- Success message displayed
- User redirected to confirmation pending page

---

## AC-002: Password Security Requirements

**Given** I am on the registration page  
**When** I enter a password  
**Then** the password must meet all security requirements:
- Minimum 8 characters (12+ recommended)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**And** real-time feedback shows password strength (weak/medium/strong)  
**And** submit button is disabled until password is at least "medium" strength

**Verification Steps**:
1. Enter password: "weak" → Verify error: "Password too short"
2. Enter password: "password" → Verify error: "Must contain uppercase, number, and special character"
3. Enter password: "Password1" → Verify error: "Must contain special character"
4. Enter password: "Password1!" → Verify strength indicator shows "strong"
5. Verify submit button enabled only when valid

**Test Data**:
- Weak passwords: password, 12345678, abcdefgh
- Medium passwords: Password1, Welcome123
- Strong passwords: SecurePass123!, MyP@ssw0rd2024!

**Expected Results**:
- Real-time validation as user types
- Color-coded strength indicator (red/yellow/green)
- Clear, specific error messages
- Submit button state reflects password validity

---

## AC-003: Email Format Validation

**Given** I am on the registration page  
**When** I enter an invalid email format  
**Then** the system displays an error: "Please enter a valid email address"  
**And** the submit button is disabled  
**And** the email field is highlighted in red

**Verification Steps**:
1. Enter: "notanemail" → Verify error shown
2. Enter: "test@" → Verify error shown
3. Enter: "@example.com" → Verify error shown
4. Enter: "test@example" → Verify error shown
5. Enter: "test@example.com" → Verify error cleared

**Test Data**:
- Invalid: notanemail, test@, @example.com, test@.com, test..user@example.com
- Valid: test@example.com, user.name@domain.co.uk, user+tag@example.com

**Expected Results**:
- Immediate validation on blur
- Clear error message
- Submit button disabled
- Field styling indicates error

---

## AC-004: Duplicate Email Prevention

**Given** an account already exists with email existing@example.com  
**When** I attempt to register with the same email  
**Then** the system displays an error: "An account with this email already exists"  
**And** I see a link to the login page  
**And** no duplicate account is created in the database

**Verification Steps**:
1. Create account with existing@example.com
2. Attempt to register again with same email
3. Verify error message displayed
4. Verify link to login page shown
5. Check database - only one account exists

**Test Data**:
- Existing email: existing@example.com

**Expected Results**:
- Error message shown after form submission
- Helpful link to login page
- Database integrity maintained
- No confirmation email sent

---

## AC-005: Email Confirmation Flow

**Given** I have successfully registered  
**When** I click the confirmation link in the email  
**Then** my account is activated  
**And** I am redirected to the login page  
**And** I see a success message: "Email confirmed! You can now log in"  
**And** I can successfully log in with my credentials

**Verification Steps**:
1. Register new account
2. Check email for confirmation link
3. Click confirmation link
4. Verify redirect to /auth/login
5. Verify success message displayed
6. Attempt login with credentials
7. Verify login successful

**Test Data**:
- Email: confirmation-test@example.com
- Password: TestPass123!

**Expected Results**:
- Email received within 5 seconds
- Confirmation link works
- Account activated in database (email_confirmed_at set)
- Can log in successfully

---

## AC-006: Confirmation Email Resend

**Given** I registered but didn't receive the confirmation email  
**When** I click "Resend confirmation email"  
**Then** a new confirmation email is sent  
**And** I see a message: "Confirmation email sent. Please check your inbox"  
**And** I can only resend once per minute (rate limiting)

**Verification Steps**:
1. Register account but don't confirm
2. Click "Resend confirmation email"
3. Verify new email sent
4. Immediately click "Resend" again
5. Verify rate limit message: "Please wait before resending"

**Test Data**:
- Email: resend-test@example.com

**Expected Results**:
- Resend button available on confirmation pending page
- Email sent within 5 seconds
- Rate limiting enforced (1/minute)
- Clear feedback messages

---

## AC-007: Registration Form Validation

**Given** I am on the registration page  
**When** I submit the form with missing or invalid fields  
**Then** I see specific error messages for each field  
**And** the form does not submit  
**And** the first invalid field is focused

**Verification Steps**:
1. Click submit with empty form → Verify errors on both fields
2. Enter valid email, empty password → Verify password error
3. Enter invalid email, valid password → Verify email error
4. Enter valid inputs → Verify form submits

**Test Data**:
- Empty email: "" → Error: "Email is required"
- Empty password: "" → Error: "Password is required"
- Invalid email: "test" → Error: "Please enter a valid email address"

**Expected Results**:
- Field-specific error messages
- No submission with invalid data
- Focus management for accessibility
- Clear visual indicators

---

## AC-008: Loading States

**Given** I submit the registration form  
**When** the request is processing  
**Then** I see a loading spinner on the submit button  
**And** the form fields are disabled  
**And** I cannot submit the form again  
**And** the loading state clears after completion

**Verification Steps**:
1. Fill form with valid data
2. Click submit
3. Verify button shows loading spinner
4. Verify button text changes to "Creating account..."
5. Verify form fields disabled
6. Verify loading clears after response

**Expected Results**:
- Immediate visual feedback
- Button disabled during submission
- Form inputs disabled during submission
- Loading state clears on success or error

---

## AC-009: Error Handling

**Given** I submit the registration form  
**When** a network error or server error occurs  
**Then** I see an error message: "Registration failed. Please try again"  
**And** the form remains filled with my data  
**And** I can retry the submission

**Verification Steps**:
1. Mock network error during registration
2. Submit form
3. Verify error message displayed
4. Verify form data preserved
5. Retry submission
6. Verify successful on retry

**Test Data**:
- Network timeout scenario
- Server 500 error scenario
- Database connection error scenario

**Expected Results**:
- Clear error messages
- Form data preserved
- Retry functionality available
- No page refresh required

---

## AC-010: User Profile Creation

**Given** I successfully register  
**When** my account is created  
**Then** a user_profiles record is created automatically  
**And** the profile includes:
- id (matches auth.users.id)
- email (matches registration email)
- display_name (initially null or email prefix)
- avatar_url (initially null)
- preferences (default values: email_notifications=true, theme=system)
- created_at and updated_at timestamps

**Verification Steps**:
1. Register new account
2. Query user_profiles table
3. Verify record exists with correct id
4. Verify email matches
5. Verify default preferences set
6. Verify timestamps populated

**Test Data**:
- Email: profile-test@example.com

**Expected Results**:
- Profile created automatically
- All fields populated correctly
- Preferences have defaults
- Foreign key constraint satisfied

---

## AC-011: Password Visibility Toggle

**Given** I am entering a password  
**When** I click the "show password" icon  
**Then** the password field changes from type="password" to type="text"  
**And** I can see my password in plain text  
**And** clicking again toggles back to hidden

**Verification Steps**:
1. Enter password in field
2. Verify password is masked (dots/asterisks)
3. Click eye icon
4. Verify password is visible
5. Click eye icon again
6. Verify password is masked again

**Expected Results**:
- Toggle icon visible next to password field
- Password visibility changes on click
- Icon changes to indicate state (eye vs eye-slash)
- Works for both password fields if confirm password exists

---

## AC-012: Responsive Design

**Given** I access the registration page  
**When** I view it on different screen sizes (mobile, tablet, desktop)  
**Then** the form is fully functional and properly styled  
**And** all fields are accessible and usable  
**And** error messages display correctly  
**And** the layout adapts to screen size

**Verification Steps**:
1. Test on mobile (375px width)
2. Test on tablet (768px width)
3. Test on desktop (1440px width)
4. Verify form usability on each
5. Verify all features work on touch devices

**Test Viewports**:
- Mobile: 375px × 667px
- Tablet: 768px × 1024px
- Desktop: 1440px × 900px

**Expected Results**:
- Form fits screen width
- Touch targets minimum 44px
- Text readable without zooming
- All features accessible
- No horizontal scroll

---

## Summary

**Total Acceptance Criteria**: 12  
**Status**: All criteria defined and ready for implementation  
**Coverage**: 
- Registration flow (AC-001, AC-005, AC-006)
- Security (AC-002, AC-004)
- Validation (AC-003, AC-007)
- UX (AC-008, AC-009, AC-011, AC-012)
- Data integrity (AC-010)

## Traceability Matrix

| AC ID | Story Task | Test Scenario | Risk ID |
|-------|------------|---------------|---------|
| AC-001 | Task 1, 2, 3 | TS-001, TS-002 | RISK-001 |
| AC-002 | Task 4 | TS-003, TS-004 | RISK-002, RISK-003 |
| AC-003 | Task 4 | TS-005 | RISK-001 |
| AC-004 | Task 2 | TS-006 | RISK-001 |
| AC-005 | Task 2, 5 | TS-007 | RISK-004 |
| AC-006 | Task 5 | TS-008 | RISK-004 |
| AC-007 | Task 1, 4 | TS-009 | RISK-001 |
| AC-008 | Task 1 | TS-010 | RISK-005 |
| AC-009 | Task 2 | TS-011 | RISK-005 |
| AC-010 | Task 3 | TS-012 | RISK-006 |
| AC-011 | Task 1 | TS-013 | - |
| AC-012 | Task 1 | TS-014 | - |

## Definition of Done

- [ ] All 12 acceptance criteria implemented
- [ ] All verification steps passing
- [ ] All test scenarios from test-scenarios.md passing
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] No regressions in existing tests

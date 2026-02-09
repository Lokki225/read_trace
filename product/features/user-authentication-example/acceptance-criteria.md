# Acceptance Criteria: User Authentication System

This document demonstrates how to use the acceptance-criteria.md template with the User Authentication System feature.

## Feature Overview
- **Feature**: User Authentication System
- **Epic**: 2 - User Authentication & Profiles
- **Story**: 2-1
- **Status**: SPECIFIED

## Acceptance Criteria Format

Each acceptance criterion is written in BDD (Behavior-Driven Development) format:

```
Given [initial context]
When [user performs action]
Then [expected outcome]
```

## AC-001: Email Registration

**Given** the user is on the registration page
**When** the user enters a valid email and password (8+ characters)
**Then** the system creates an account and sends a confirmation email

**Verification Steps**:
1. Navigate to registration page
2. Enter email: test@example.com
3. Enter password: SecurePass123
4. Click "Register"
5. Verify confirmation email received
6. Verify account created in database

**Test Data**:
- Valid email: test@example.com
- Valid password: SecurePass123
- Invalid email: notanemail
- Invalid password: short

---

## AC-002: Email Validation

**Given** the user attempts to register
**When** the user enters an invalid email format
**Then** the system displays an error message

**Verification Steps**:
1. Enter invalid email: "notanemail"
2. Verify error message: "Please enter a valid email"
3. Submit button remains disabled

**Test Data**:
- Invalid emails: notanemail, test@, @example.com, test@.com

---

## AC-003: Password Strength

**Given** the user is registering
**When** the user enters a password less than 8 characters
**Then** the system shows a password strength warning

**Verification Steps**:
1. Enter password: "short"
2. Verify warning: "Password must be at least 8 characters"
3. Submit button disabled

**Test Data**:
- Weak: password, 123456, abc
- Strong: SecurePass123, MyP@ssw0rd!

---

## AC-004: Duplicate Email Prevention

**Given** an account already exists with email test@example.com
**When** the user attempts to register with the same email
**Then** the system displays an error: "Email already registered"

**Verification Steps**:
1. Create account with test@example.com
2. Attempt to register again with same email
3. Verify error message displayed
4. Verify only one account exists in database

---

## AC-005: Email Confirmation

**Given** the user has registered with an email
**When** the user clicks the confirmation link in the email
**Then** the account is activated and user can log in

**Verification Steps**:
1. Register new account
2. Check email for confirmation link
3. Click confirmation link
4. Verify redirect to login page
5. Verify can log in with credentials

---

## AC-006: Login with Valid Credentials

**Given** the user has a registered account
**When** the user enters correct email and password
**Then** the user is logged in and redirected to dashboard

**Verification Steps**:
1. Navigate to login page
2. Enter email: test@example.com
3. Enter password: SecurePass123
4. Click "Login"
5. Verify redirect to dashboard
6. Verify session token created

---

## AC-007: Login with Invalid Credentials

**Given** the user is on the login page
**When** the user enters incorrect password
**Then** the system displays "Invalid email or password" error

**Verification Steps**:
1. Enter correct email
2. Enter wrong password
3. Click "Login"
4. Verify error message displayed
5. Verify user not logged in

---

## AC-008: Account Lockout

**Given** the user has failed to log in 5 times
**When** the user attempts to log in again
**Then** the account is locked for 15 minutes

**Verification Steps**:
1. Attempt login 5 times with wrong password
2. Verify error: "Account locked. Try again in 15 minutes"
3. Wait 15 minutes (or mock time)
4. Verify can log in again

---

## AC-009: Password Reset

**Given** the user has forgotten their password
**When** the user clicks "Forgot Password" and enters their email
**Then** a password reset link is sent to their email

**Verification Steps**:
1. Click "Forgot Password"
2. Enter email: test@example.com
3. Verify message: "Reset link sent to your email"
4. Check email for reset link
5. Click reset link
6. Enter new password
7. Verify can log in with new password

---

## AC-010: Google OAuth Login

**Given** the user is on the login page
**When** the user clicks "Login with Google"
**Then** the user is redirected to Google login and authenticated

**Verification Steps**:
1. Click "Login with Google"
2. Verify redirect to Google login
3. Enter Google credentials
4. Verify redirect back to Read Trace
5. Verify user logged in
6. Verify user account created if first time

---

## AC-011: Discord OAuth Login

**Given** the user is on the login page
**When** the user clicks "Login with Discord"
**Then** the user is redirected to Discord login and authenticated

**Verification Steps**:
1. Click "Login with Discord"
2. Verify redirect to Discord login
3. Enter Discord credentials
4. Verify redirect back to Read Trace
5. Verify user logged in
6. Verify user account created if first time

---

## AC-012: Session Persistence

**Given** the user is logged in
**When** the user closes the browser and returns to the site
**Then** the user is still logged in (session persists)

**Verification Steps**:
1. Log in to account
2. Close browser
3. Reopen browser and navigate to site
4. Verify user still logged in
5. Verify dashboard accessible

---

## AC-013: Logout

**Given** the user is logged in
**When** the user clicks "Logout"
**Then** the user is logged out and redirected to login page

**Verification Steps**:
1. Log in to account
2. Click "Logout"
3. Verify redirect to login page
4. Verify cannot access protected pages
5. Verify session token cleared

---

## AC-014: Profile View

**Given** the user is logged in
**When** the user navigates to their profile
**Then** the user sees their account information

**Verification Steps**:
1. Log in
2. Click "Profile"
3. Verify display name shown
4. Verify email shown
5. Verify profile picture shown (if set)

---

## AC-015: Profile Update

**Given** the user is on their profile page
**When** the user updates their display name and saves
**Then** the profile is updated and changes are persisted

**Verification Steps**:
1. Navigate to profile
2. Change display name to "New Name"
3. Click "Save"
4. Verify success message
5. Refresh page
6. Verify display name updated

---

## Summary

**Total Acceptance Criteria**: 15
**Status**: All criteria defined and ready for implementation
**Coverage**: Registration, Login, OAuth, Password Reset, Profile Management, Security

## Notes

- All criteria follow BDD format for clarity
- Test data provided for each criterion
- Security considerations included (lockout, password strength)
- OAuth integration tested separately
- Session management verified

# Test Scenarios: User Profile Management

## Overview

**Feature**: User Profile Management  
**Feature ID**: user-profile-management  
**Story**: 2-3  
**Last Updated**: 2026-02-10  

This document outlines comprehensive test scenarios for user profile management functionality.

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - Profile logic, validation, RLS policies
- **Integration Tests**: 30% - Profile API, database operations
- **End-to-End Tests**: 10% - Complete profile update flow

### Test Coverage Goals

- Unit Tests: 85%+ code coverage
- Integration Tests: 80%+ feature coverage
- End-to-End Tests: Critical user flows only

## Unit Tests

### Test Suite 1: Profile Validation

**File**: `src/__tests__/profile/validation.test.ts`

#### Test Case 1.1: Username Validation

```typescript
describe('Username Validation', () => {
  it('should accept valid usernames', () => {
    expect(validateUsername('john_doe')).toBe(true);
    expect(validateUsername('user123')).toBe(true);
    expect(validateUsername('a')).toBe(false); // too short
    expect(validateUsername('a'.repeat(31))).toBe(false); // too long
  });

  it('should reject invalid characters', () => {
    expect(validateUsername('user@name')).toBe(false);
    expect(validateUsername('user name')).toBe(false);
    expect(validateUsername('user-name')).toBe(false);
  });
});
```

**Purpose**: Verify username validation rules  
**Preconditions**: Validation function available  
**Expected Result**: Valid/invalid usernames correctly identified  

### Test Suite 2: Password Validation

**File**: `src/__tests__/profile/password.test.ts`

#### Test Case 2.1: Password Strength

```typescript
describe('Password Validation', () => {
  it('should accept strong passwords', () => {
    expect(validatePassword('SecurePass123')).toBe(true);
    expect(validatePassword('MyP@ssw0rd')).toBe(true);
  });

  it('should reject weak passwords', () => {
    expect(validatePassword('short')).toBe(false); // too short
    expect(validatePassword('nouppercase123')).toBe(false); // no uppercase
    expect(validatePassword('NOLOWERCASE123')).toBe(false); // no lowercase
    expect(validatePassword('NoNumbers')).toBe(false); // no numbers
  });
});
```

**Purpose**: Verify password strength requirements  
**Preconditions**: Validation function available  
**Expected Result**: Strong/weak passwords correctly identified  

## Integration Tests

### Test Suite 1: Profile API

**File**: `tests/integration/profile-api.integration.test.ts`

#### Test Case 1.1: Get Profile

```typescript
describe('GET /api/profile', () => {
  it('should return user profile', async () => {
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(response.status).toBe(200);
    const profile = await response.json();
    expect(profile.email).toBeDefined();
    expect(profile.username).toBeDefined();
    expect(profile.created_at).toBeDefined();
  });

  it('should return 401 for unauthenticated requests', async () => {
    const response = await fetch('/api/profile');
    expect(response.status).toBe(401);
  });
});
```

**Purpose**: Verify profile retrieval API  
**Preconditions**: Authenticated user, database available  
**Expected Result**: Profile data returned correctly  

#### Test Case 1.2: Update Profile

```typescript
describe('PUT /api/profile', () => {
  it('should update username', async () => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username: 'newusername' })
    });
    
    expect(response.status).toBe(200);
    const updated = await response.json();
    expect(updated.username).toBe('newusername');
  });

  it('should reject duplicate username', async () => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username: 'existinguser' })
    });
    
    expect(response.status).toBe(400);
    expect(response.body).toContain('already taken');
  });
});
```

**Purpose**: Verify profile update API  
**Preconditions**: Authenticated user, database available  
**Expected Result**: Profile updated correctly with validation  

### Test Suite 2: Password Change

**File**: `tests/integration/password-change.integration.test.ts`

#### Test Case 2.1: Change Password

```typescript
describe('POST /api/profile/password', () => {
  it('should change password with correct current password', async () => {
    const response = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456'
      })
    });
    
    expect(response.status).toBe(200);
  });

  it('should reject incorrect current password', async () => {
    const response = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword: 'WrongPass',
        newPassword: 'NewPass456'
      })
    });
    
    expect(response.status).toBe(401);
  });
});
```

**Purpose**: Verify password change functionality  
**Preconditions**: Authenticated user, Supabase Auth available  
**Expected Result**: Password changed securely  

## End-to-End Tests

### Test Suite 1: Profile Update Flow

**File**: `tests/e2e/profile-update.e2e.test.ts`

#### Test Case 1.1: Update Profile Information

```typescript
describe('Profile Update Flow', () => {
  it('should update profile from UI', async () => {
    await page.goto('http://localhost:3000/profile');
    
    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');
    
    // Update username
    await page.fill('[data-testid="username-input"]', 'newusername');
    
    // Submit form
    await page.click('[data-testid="save-button"]');
    
    // Verify success message
    const success = await page.$('[data-testid="success-message"]');
    expect(success).toBeTruthy();
    
    // Verify username updated
    const username = await page.textContent('[data-testid="username-display"]');
    expect(username).toBe('newusername');
  });
});
```

**Purpose**: Verify complete profile update flow  
**Preconditions**: App running, user logged in  
**Expected Result**: Profile updated successfully from UI  

#### Test Case 1.2: Change Password Flow

```typescript
describe('Password Change Flow', () => {
  it('should change password from UI', async () => {
    await page.goto('http://localhost:3000/profile');
    
    // Click change password
    await page.click('[data-testid="change-password-button"]');
    
    // Fill form
    await page.fill('[data-testid="current-password"]', 'OldPass123');
    await page.fill('[data-testid="new-password"]', 'NewPass456');
    await page.fill('[data-testid="confirm-password"]', 'NewPass456');
    
    // Submit
    await page.click('[data-testid="change-password-submit"]');
    
    // Verify success
    const success = await page.$('[data-testid="success-message"]');
    expect(success).toBeTruthy();
  });
});
```

**Purpose**: Verify password change from UI  
**Preconditions**: App running, user logged in  
**Expected Result**: Password changed successfully  

## Manual Testing Scenarios

### Scenario 1: View Profile

**Steps**:
1. Log in to application
2. Navigate to profile page
3. Verify all profile information displays
4. Verify profile is read-only without edit mode

**Expected Result**: Profile information displays correctly

### Scenario 2: Update Profile

**Steps**:
1. Navigate to profile page
2. Click edit button
3. Change username
4. Submit form
5. Verify success message
6. Refresh page
7. Verify change persisted

**Expected Result**: Profile updated and persisted

### Scenario 3: Change Password

**Steps**:
1. Navigate to profile page
2. Click "Change Password"
3. Enter current password
4. Enter new password (8+ chars, uppercase, lowercase, numbers)
5. Confirm new password
6. Submit
7. Log out
8. Log in with new password

**Expected Result**: Password changed successfully

### Scenario 4: RLS Protection

**Steps**:
1. Get user A's profile ID
2. Log in as user B
3. Attempt to access user A's profile via API
4. Verify access denied

**Expected Result**: RLS prevents unauthorized access

## Test Data

### Test User Profiles

```typescript
export const testUser1 = {
  id: 'user_123',
  email: 'test1@example.com',
  username: 'testuser1',
  created_at: '2026-01-01T00:00:00Z'
};

export const testUser2 = {
  id: 'user_456',
  email: 'test2@example.com',
  username: 'testuser2',
  created_at: '2026-01-02T00:00:00Z'
};
```

## Performance Testing

### Profile Operations Performance

- **Load profile**: <500ms
- **Update profile**: <1 second
- **Change password**: <2 seconds
- **List OAuth providers**: <500ms

### Database Performance

- **Profile queries**: Indexed on user_id
- **Username uniqueness check**: <100ms
- **Concurrent updates**: Handle 100+ concurrent users

---

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-10  
**Next Review**: 2026-03-10

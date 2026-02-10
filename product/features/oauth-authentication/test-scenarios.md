# Test Scenarios: OAuth Authentication (Google & Discord)

## Overview

**Feature**: OAuth Authentication with Google & Discord  
**Feature ID**: oauth-authentication  
**Story**: 2-2  
**Last Updated**: 2026-02-10  

This document outlines comprehensive test scenarios for OAuth authentication functionality.

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - OAuth logic, token handling, profile creation
- **Integration Tests**: 30% - OAuth flow with Supabase, callback handling
- **End-to-End Tests**: 10% - Complete OAuth flow with real providers

### Test Coverage Goals

- Unit Tests: 85%+ code coverage
- Integration Tests: 80%+ feature coverage
- End-to-End Tests: Critical user flows only

## Unit Tests

### Test Suite 1: OAuth Provider Configuration

**File**: `src/__tests__/oauth/providers.test.ts`

#### Test Case 1.1: Google OAuth Configuration

```typescript
describe('Google OAuth Provider', () => {
  it('should have correct client ID configured', () => {
    const config = getGoogleOAuthConfig();
    expect(config.clientId).toBeDefined();
    expect(config.clientId).toMatch(/^[a-zA-Z0-9-_.]+$/);
  });

  it('should have correct redirect URI', () => {
    const config = getGoogleOAuthConfig();
    expect(config.redirectUri).toBe(process.env.GOOGLE_OAUTH_REDIRECT_URI);
  });

  it('should request correct scopes', () => {
    const config = getGoogleOAuthConfig();
    expect(config.scopes).toContain('email');
    expect(config.scopes).toContain('profile');
  });
});
```

**Purpose**: Verify OAuth provider configuration is correct  
**Preconditions**: Environment variables set  
**Expected Result**: Configuration matches expected values  

### Test Suite 2: Token Handling

**File**: `src/__tests__/oauth/tokens.test.ts`

#### Test Case 2.1: Token Storage

```typescript
describe('OAuth Token Storage', () => {
  it('should encrypt token before storage', async () => {
    const token = 'test_access_token_12345';
    const encrypted = await encryptToken(token);
    expect(encrypted).not.toBe(token);
    expect(encrypted).toMatch(/^[a-zA-Z0-9+/=]+$/);
  });

  it('should decrypt token correctly', async () => {
    const original = 'test_access_token_12345';
    const encrypted = await encryptToken(original);
    const decrypted = await decryptToken(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should handle token expiration', async () => {
    const expiredToken = { access_token: 'token', expires_at: Date.now() - 1000 };
    const isExpired = isTokenExpired(expiredToken);
    expect(isExpired).toBe(true);
  });
});
```

**Purpose**: Verify token encryption and expiration handling  
**Preconditions**: Encryption service available  
**Expected Result**: Tokens encrypted/decrypted correctly  

### Test Suite 3: Profile Creation

**File**: `src/__tests__/oauth/profile.test.ts`

#### Test Case 3.1: Profile Creation from OAuth Data

```typescript
describe('OAuth Profile Creation', () => {
  it('should create profile from Google OAuth data', async () => {
    const oauthData = {
      id: 'google_123',
      email: 'user@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg'
    };
    
    const profile = createProfileFromOAuth('google', oauthData);
    expect(profile.provider_id).toBe('google_123');
    expect(profile.provider_name).toBe('google');
    expect(profile.provider_avatar_url).toBe('https://example.com/pic.jpg');
  });

  it('should handle missing optional fields', async () => {
    const oauthData = {
      id: 'discord_456',
      email: 'user@example.com'
    };
    
    const profile = createProfileFromOAuth('discord', oauthData);
    expect(profile.provider_id).toBe('discord_456');
    expect(profile.provider_avatar_url).toBeNull();
  });
});
```

**Purpose**: Verify profile creation from OAuth provider data  
**Preconditions**: OAuth data available  
**Expected Result**: Profile created with correct data  

## Integration Tests

### Test Suite 1: OAuth Callback Handler

**File**: `tests/integration/oauth-callback.integration.test.ts`

#### Test Case 1.1: Complete OAuth Flow

```typescript
describe('OAuth Callback Handler', () => {
  it('should handle Google OAuth callback successfully', async () => {
    const code = 'auth_code_12345';
    const state = 'state_token_xyz';
    
    const response = await handleOAuthCallback('google', code, state);
    
    expect(response.status).toBe(200);
    expect(response.user).toBeDefined();
    expect(response.session).toBeDefined();
    expect(response.redirectUrl).toBe('/dashboard');
  });

  it('should prevent CSRF attacks with state validation', async () => {
    const code = 'auth_code_12345';
    const invalidState = 'wrong_state_token';
    
    const response = await handleOAuthCallback('google', code, invalidState);
    
    expect(response.status).toBe(400);
    expect(response.error).toContain('Invalid state');
  });

  it('should handle invalid authorization codes', async () => {
    const invalidCode = 'invalid_code_xyz';
    const state = 'state_token_xyz';
    
    const response = await handleOAuthCallback('google', invalidCode, state);
    
    expect(response.status).toBe(401);
    expect(response.error).toContain('Invalid authorization code');
  });
});
```

**Purpose**: Verify OAuth callback handling and security  
**Preconditions**: OAuth provider mocked, database available  
**Expected Result**: Callback processed correctly with proper validation  

### Test Suite 2: Account Linking

**File**: `tests/integration/oauth-linking.integration.test.ts`

#### Test Case 2.1: Link OAuth to Existing Account

```typescript
describe('OAuth Account Linking', () => {
  it('should link OAuth provider to existing account', async () => {
    const userId = 'user_123';
    const oauthData = {
      provider: 'google',
      provider_id: 'google_456',
      email: 'user@example.com'
    };
    
    const result = await linkOAuthProvider(userId, oauthData);
    
    expect(result.success).toBe(true);
    expect(result.linkedProviders).toContain('google');
  });

  it('should prevent duplicate provider linking', async () => {
    const userId = 'user_123';
    const oauthData = {
      provider: 'google',
      provider_id: 'google_456'
    };
    
    await linkOAuthProvider(userId, oauthData);
    const result = await linkOAuthProvider(userId, oauthData);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('already linked');
  });
});
```

**Purpose**: Verify OAuth account linking functionality  
**Preconditions**: User account exists, database available  
**Expected Result**: OAuth provider linked correctly  

## End-to-End Tests

### Test Suite 1: Complete OAuth User Journey

**File**: `tests/e2e/oauth-flow.e2e.test.ts`

#### Test Case 1.1: Google OAuth Signup Flow

```typescript
describe('Google OAuth Signup Flow', () => {
  it('should complete full Google OAuth signup', async () => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Click Google OAuth button
    await page.click('[data-testid="google-oauth-button"]');
    
    // Verify redirect to Google
    await page.waitForNavigation();
    expect(page.url()).toContain('accounts.google.com');
    
    // Simulate Google login (in test environment)
    // In real tests, use test Google account
    
    // Verify redirect back to app
    await page.waitForNavigation();
    expect(page.url()).toContain('/dashboard');
    
    // Verify user is logged in
    const userMenu = await page.$('[data-testid="user-menu"]');
    expect(userMenu).toBeTruthy();
  });
});
```

**Purpose**: Verify complete OAuth flow from user perspective  
**Preconditions**: App running, test environment configured  
**Expected Result**: User successfully authenticates and reaches dashboard  

#### Test Case 1.2: Discord OAuth Signup Flow

```typescript
describe('Discord OAuth Signup Flow', () => {
  it('should complete full Discord OAuth signup', async () => {
    await page.goto('http://localhost:3000/login');
    await page.click('[data-testid="discord-oauth-button"]');
    
    await page.waitForNavigation();
    expect(page.url()).toContain('discord.com');
    
    // Simulate Discord authorization
    
    await page.waitForNavigation();
    expect(page.url()).toContain('/dashboard');
    
    const userMenu = await page.$('[data-testid="user-menu"]');
    expect(userMenu).toBeTruthy();
  });
});
```

**Purpose**: Verify Discord OAuth flow  
**Preconditions**: App running, test environment configured  
**Expected Result**: User successfully authenticates via Discord  

## Manual Testing Scenarios

### Scenario 1: Google OAuth Signup

**Steps**:
1. Navigate to login page
2. Click "Sign in with Google"
3. Log in with test Google account
4. Authorize ReadTrace
5. Verify redirect to dashboard
6. Verify user profile created

**Expected Result**: User account created, logged in, profile visible

### Scenario 2: Discord OAuth Signup

**Steps**:
1. Navigate to login page
2. Click "Sign in with Discord"
3. Log in with test Discord account
4. Authorize ReadTrace
5. Verify redirect to dashboard
6. Verify user profile created

**Expected Result**: User account created, logged in, profile visible

### Scenario 3: OAuth Provider Downtime

**Steps**:
1. Simulate provider downtime
2. Attempt OAuth login
3. Observe error handling
4. Verify fallback to email/password

**Expected Result**: Clear error message, alternative auth available

## Test Data

### Test Accounts

- **Google**: test.user.readtrace@gmail.com
- **Discord**: ReadTraceTestBot#1234

### Test Fixtures

```typescript
export const mockGoogleOAuthData = {
  id: 'google_test_123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/pic.jpg'
};

export const mockDiscordOAuthData = {
  id: 'discord_test_456',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'avatar_hash_xyz'
};
```

## Performance Testing

### OAuth Flow Performance

- **Redirect to provider**: <500ms
- **Token exchange**: <1 second
- **Profile creation**: <500ms
- **Session establishment**: <1 second
- **Total flow**: <3 seconds

### Load Testing

- Test with 100 concurrent OAuth requests
- Verify token refresh under load
- Monitor database performance

## Security Testing

### CSRF Protection

- Verify state parameter prevents CSRF
- Test with invalid state tokens
- Verify state token expiration

### Token Security

- Verify tokens encrypted at rest
- Verify tokens not logged
- Verify token refresh works correctly

### XSS Prevention

- Test for XSS vulnerabilities in OAuth flow
- Verify user data sanitized

---

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-10  
**Next Review**: 2026-03-10

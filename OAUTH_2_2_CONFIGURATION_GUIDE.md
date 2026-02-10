# OAuth Authentication (Google & Discord) - Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring OAuth authentication for Google and Discord providers in the ReadTrace application.

## Prerequisites

- Supabase project created and accessible
- Google Cloud Console account
- Discord Developer Portal account
- Admin access to Supabase dashboard

---

## Step 1: Google OAuth Configuration

### 1.1 Create Google OAuth 2.0 Client

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project or create a new one

2. **Enable Required APIs**
   - Navigate to "APIs & Services" → "Library"
   - Search and enable "Google+ API" (or "People API" for newer projects)
   - Enable "OAuth2 API"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
   - Select "Web application" as application type
   - Fill in the form:
     - **Name**: ReadTrace Web App
     - **Authorized JavaScript origins**: `http://localhost:3000` (development)
     - **Authorized redirect URIs**: 
       ```
       https://[your-project-ref].supabase.co/auth/v1/callback
       http://localhost:3000/api/auth/oauth/callback (development)
       ```

4. **Copy Credentials**
   - Note down the **Client ID** and **Client Secret**
   - Keep the Client Secret secure - you'll need this for Supabase

### 1.2 Configure Google OAuth in Supabase

1. **Open Supabase Dashboard**
   - Navigate to your project
   - Go to "Authentication" → "Providers"

2. **Enable Google Provider**
   - Find "Google" in the list
   - Click "Enable"
   - Fill in the credentials:
     - **Google Client ID**: Paste from Google Cloud Console
     - **Google Client Secret**: Paste from Google Cloud Console
     - **Authorized Redirect URI**: `https://[your-project-ref].supabase.co/auth/v1/callback`

3. **Save Configuration**
   - Click "Save" to apply the configuration

---

## Step 2: Discord OAuth Configuration

### 2.1 Create Discord Application

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click "New Application"

2. **Configure Application**
   - **Name**: ReadTrace
   - **Description**: Reading progress tracking app
   - Click "Create"

3. **Create OAuth2 Application**
   - Navigate to "OAuth2" in the left sidebar
   - Click "Add Redirect"
   - Add redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Click "Save Changes"

4. **Get Credentials**
   - Note the **Application ID** (this is your Client ID)
   - Click "Reset Secret" to reveal the Client Secret
   - Copy both values for Supabase configuration

### 2.2 Configure Discord OAuth in Supabase

1. **Open Supabase Dashboard**
   - Go to "Authentication" → "Providers"

2. **Enable Discord Provider**
   - Find "Discord" in the list
   - Click "Enable"
   - Fill in the credentials:
     - **Discord Client ID**: Application ID from Discord Developer Portal
     - **Discord Client Secret**: Client Secret from Discord Developer Portal
     - **Authorized Redirect URI**: `https://[your-project-ref].supabase.co/auth/v1/callback`

3. **Configure Scopes**
   - Ensure the following scopes are selected:
     - `identify` - Get user's Discord profile
     - `email` - Get user's email address

4. **Save Configuration**
   - Click "Save" to apply the configuration

---

## Step 3: Environment Variables

### 3.1 Required Environment Variables

Create or update your `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_APP_URL=https://your-domain.com  # Production
```

### 3.2 Environment Variables for Different Environments

**Development (.env.local)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev-anon-key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (.env.production)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-anon-key]
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Step 4: Database Migration

### 4.1 Apply OAuth Providers Migration

Run the database migration to create the oauth_providers table:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL manually in Supabase Dashboard:
# 1. Go to Database → SQL Editor
# 2. Copy and paste the contents of:
#    database/migrations/003_create_oauth_providers.sql
# 3. Execute the SQL
```

### 4.2 Verify Migration

Check that the oauth_providers table was created:

```sql
-- Verify table exists
SELECT * FROM oauth_providers LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'oauth_providers';
```

---

## Step 5: Test Configuration

### 5.1 Test OAuth Flow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Login Page**
   - Open: http://localhost:3000/auth/login
   - You should see "Sign in with Google" and "Sign in with Discord" buttons

3. **Test Google OAuth**
   - Click "Sign in with Google"
   - You should be redirected to Google's OAuth consent screen
   - After authorization, you should be redirected back to your app
   - Check that a user profile is created in the database

4. **Test Discord OAuth**
   - Click "Sign in with Discord"
   - You should be redirected to Discord's OAuth consent screen
   - After authorization, you should be redirected back to your app
   - Check that a user profile is created in the database

### 5.2 Verify Database Records

Check that OAuth provider links are created:

```sql
-- Check oauth_providers table
SELECT * FROM oauth_providers;

-- Check user_profiles table
SELECT * FROM user_profiles WHERE auth_provider IN ('google', 'discord');
```

---

## Step 6: Production Deployment

### 6.1 Update Production Environment

1. **Update Environment Variables**
   - Set production values in your hosting platform
   - Ensure `NEXT_PUBLIC_APP_URL` points to your production domain

2. **Update Redirect URIs**
   - In Google Cloud Console, add production redirect URI
   - In Discord Developer Portal, add production redirect URI
   - In Supabase, ensure production redirect URI is configured

3. **Test Production Flow**
   - Deploy the application
   - Test OAuth flows in production environment
   - Monitor for any OAuth-related errors

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Invalid redirect URI" Error
**Cause**: Redirect URI doesn't match what's configured in OAuth provider
**Solution**: 
- Verify redirect URI matches exactly in Google/Discord console and Supabase
- Check for trailing slashes and HTTP vs HTTPS

#### 2. "OAuth provider not enabled" Error
**Cause**: Provider not enabled in Supabase
**Solution**: 
- Go to Supabase Authentication → Providers
- Enable the provider and save configuration

#### 3. "User creation failed" Error
**Cause**: Database migration not applied or RLS policies issue
**Solution**: 
- Run database migration
- Check RLS policies on oauth_providers table

#### 4. "Email verification required" Error
**Cause**: Google email not verified
**Solution**: 
- Ensure user's Google account email is verified
- Check that email_verified field is true in OAuth response

#### 5. "State token expired" Error
**Cause**: OAuth flow took too long (>5 minutes)
**Solution**: 
- Complete OAuth flow faster
- Check system time synchronization

### Debugging Tips

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API calls
3. **Check Supabase Logs** in the dashboard
4. **Check Database** for oauth_providers and user_profiles records
5. **Test with incognito window** to rule out caching issues

---

## Security Considerations

### Important Security Practices

1. **Never expose Client Secrets** in frontend code
2. **Use HTTPS** in production for all OAuth redirects
3. **Validate redirect URIs** to prevent open redirects
4. **Monitor OAuth error rates** for potential abuse
5. **Implement rate limiting** on OAuth endpoints
6. **Regularly rotate** OAuth client secrets

### Environment Variable Security

```bash
# Use secure storage for secrets
# Never commit .env files to version control
# Use different secrets for development and production
```

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] Google OAuth flow works end-to-end
- [ ] Discord OAuth flow works end-to-end
- [ ] User profiles created correctly
- [ ] OAuth provider links stored in database
- [ ] Error handling works for denied access
- [ ] Loading states display correctly
- [ ] Accessibility features work (screen readers, keyboard)
- [ ] Mobile responsive design works

### Post-Deployment Monitoring

- [ ] Monitor OAuth success rates
- [ ] Monitor error rates and types
- [ ] Check database record creation
- [ ] Monitor performance of OAuth flows
- [ ] Set up alerts for OAuth failures

---

## Support

If you encounter issues during configuration:

1. **Check the logs** in Supabase dashboard
2. **Verify environment variables** are correctly set
3. **Test with the provided troubleshooting steps**
4. **Review the implementation** in the codebase
5. **Consult the OAuth provider documentation** for latest requirements

---

**Last Updated**: 2026-02-10  
**Story**: 2-2 OAuth Authentication (Google & Discord)  
**Status**: Ready for Configuration

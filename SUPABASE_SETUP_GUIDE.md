# Supabase Setup Guide for E2E Testing

## Overview
This guide walks through setting up your Supabase project to enable manual E2E testing of the user registration feature.

---

## Step 1: Install Supabase CLI

### Option A: Using Homebrew (macOS/Linux)
```bash
brew install supabase/tap/supabase
```

### Option B: Using Scoop (Windows)
```bash
scoop install supabase
```

### Option C: Using npm (All platforms)
```bash
npm install -g @supabase/cli
```

### Verify Installation
```bash
supabase --version
```

---

## Step 2: Authenticate with Supabase

### Login to Supabase
```bash
supabase login
```

This will open a browser window to authenticate. Follow the prompts to:
1. Sign in to your Supabase account
2. Generate an access token
3. Paste the token back into the terminal

### Verify Authentication
```bash
supabase projects list
```

---

## Step 3: Link Your Project

### Get Your Project Reference ID
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Copy the **Project Reference ID** from the URL or settings

### Link the Project
```bash
supabase link --project-ref [YOUR_PROJECT_REF]
```

Replace `[YOUR_PROJECT_REF]` with your actual project reference ID.

---

## Step 4: Run Database Migrations

### Apply Migrations to Production
```bash
supabase db push
```

This will:
1. Read migrations from `database/migrations/`
2. Apply them to your Supabase project
3. Show migration status

### Expected Output
```
Applying migration 001_create_user_profiles.sql...
✓ Migration 001_create_user_profiles.sql applied successfully

Applying migration 002_create_rls_policies.sql...
✓ Migration 002_create_rls_policies.sql applied successfully

All migrations applied successfully!
```

### Verify Migrations
```bash
supabase db pull
```

This will pull the current schema from your Supabase project and verify it matches your migrations.

---

## Step 5: Configure Supabase Auth Settings

### 1. Email Configuration

**Go to Supabase Dashboard → Authentication → Email Templates**

#### Verify Email Template
- Template: **Confirm signup**
- Should contain a link with `{{ .ConfirmationURL }}`
- Default template is usually sufficient

#### Test Email Delivery
1. Go to **Authentication → Email Templates**
2. Click "Test" on the Confirm signup template
3. Enter your test email address
4. Check your inbox for the verification email

### 2. Redirect URLs

**Go to Supabase Dashboard → Authentication → URL Configuration**

#### Add Redirect URLs
Add the following URLs:
- `http://localhost:3000/auth/callback` (development)
- `http://localhost:3000/register/confirm` (development)
- `https://yourdomain.com/auth/callback` (production)
- `https://yourdomain.com/register/confirm` (production)

### 3. Site URL

**Go to Supabase Dashboard → Authentication → URL Configuration**

Set:
- **Site URL**: `http://localhost:3000` (development)
- **Site URL**: `https://yourdomain.com` (production)

### 4. SMTP Configuration (Optional but Recommended)

For production, configure SMTP for reliable email delivery:

1. Go to **Authentication → Email Templates → SMTP Settings**
2. Enter your SMTP credentials
3. Test the connection

---

## Step 6: Verify Database Schema

### Check Tables
```bash
supabase db list
```

You should see:
- `user_profiles` table
- Indexes on `email`, `status`, `created_at`

### Check Policies
```bash
supabase db policies list
```

You should see:
- "Users can view own profile"
- "Users can update own profile"

### View Full Schema
```bash
supabase db pull --schema public
```

---

## Step 7: Create Test User (Optional)

### Via Supabase Dashboard
1. Go to **Authentication → Users**
2. Click **Add user**
3. Enter test email and password
4. Click **Create user**

### Via SQL (Advanced)
```sql
-- Create test user via Supabase Auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

---

## Checklist: Ready for E2E Testing

### Database Setup ✅
- [ ] Supabase CLI installed and authenticated
- [ ] Project linked via `supabase link`
- [ ] Migrations applied via `supabase db push`
- [ ] `user_profiles` table created
- [ ] RLS policies enabled
- [ ] Indexes created

### Authentication Setup ✅
- [ ] Email provider configured
- [ ] Email templates verified
- [ ] Redirect URLs added
- [ ] Site URL configured
- [ ] SMTP configured (production)

### Environment Variables ✅
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000`

### Application Ready ✅
- [ ] Dev server running: `npm run dev`
- [ ] Application accessible at `http://localhost:3000`
- [ ] Registration page loads at `http://localhost:3000/register`

---

## Manual E2E Testing Flow

### Test 1: Successful Registration

1. **Navigate to Registration Page**
   - Open `http://localhost:3000/register`
   - Verify page loads with form

2. **Enter Valid Credentials**
   - Email: `test-user-1@example.com`
   - Password: `SecurePass123!`

3. **Submit Form**
   - Click "Create account"
   - Verify loading state appears
   - Wait for redirect to confirmation page

4. **Verify Confirmation Page**
   - Should see "Check your email" message
   - Should see link to resend email
   - Should see link to sign in

5. **Check Email**
   - Check inbox for confirmation email
   - Click verification link in email
   - Should redirect to dashboard

6. **Verify User Created**
   - Go to Supabase Dashboard → Authentication → Users
   - Find your test user
   - Verify `email_confirmed_at` is set

### Test 2: Password Validation

1. **Try Weak Password**
   - Email: `test-user-2@example.com`
   - Password: `weak`
   - Should show validation errors

2. **Try Missing Uppercase**
   - Email: `test-user-3@example.com`
   - Password: `nouppercase123!`
   - Should show error

3. **Try Missing Special Character**
   - Email: `test-user-4@example.com`
   - Password: `NoSpecial123`
   - Should show error

### Test 3: Email Validation

1. **Try Invalid Email**
   - Email: `not-an-email`
   - Password: `SecurePass123!`
   - Should show validation error

2. **Try Disposable Email**
   - Email: `test@tempmail.com`
   - Password: `SecurePass123!`
   - Should show error

3. **Try Duplicate Email**
   - Email: `test-user-1@example.com` (from Test 1)
   - Password: `SecurePass123!`
   - Should show "already exists" error

### Test 4: Password Strength Indicator

1. **Enter Weak Password**
   - Email field: any valid email
   - Password: `Pass123!`
   - Should show weak strength indicator

2. **Enter Strong Password**
   - Password: `VerySecurePassword123!@#`
   - Should show strong strength indicator

### Test 5: Password Visibility Toggle

1. **Click Eye Icon**
   - Password should change from dots to visible text
   - Click again to hide

### Test 6: Resend Confirmation Email

1. **Go to Confirmation Page**
   - After registration, on confirmation page

2. **Click Resend Email Link**
   - Should send new confirmation email
   - Check inbox for new email

---

## Troubleshooting

### Issue: "Migrations failed to apply"
**Solution:**
1. Check migration syntax: `supabase db validate`
2. Check database logs in Supabase Dashboard
3. Manually run SQL in Supabase SQL Editor if needed

### Issue: "Email not received"
**Solution:**
1. Check Supabase email logs: Dashboard → Logs → Auth
2. Verify email templates are configured
3. Check spam/junk folder
4. For production, verify SMTP settings

### Issue: "Redirect URL not working"
**Solution:**
1. Verify redirect URL is added in Auth settings
2. Check that Site URL matches your app URL
3. Clear browser cache and cookies
4. Check browser console for errors

### Issue: "RLS policy preventing access"
**Solution:**
1. Verify policies are enabled: `supabase db policies list`
2. Check policy conditions in Dashboard
3. Verify user is authenticated
4. Check database logs for policy violations

### Issue: "Can't login to Supabase CLI"
**Solution:**
1. Clear cached credentials: `supabase logout`
2. Login again: `supabase login`
3. Generate new access token in Supabase Dashboard
4. Use `supabase link --project-ref [REF]` to relink

---

## Database Schema Reference

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'pending_verification',
  preferences JSONB NOT NULL DEFAULT '{"email_notifications": true, "theme": "system", "default_scan_site": null}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes
- `user_profiles_email_unique` - Unique index on lowercase email
- `user_profiles_status_idx` - Index on status
- `user_profiles_created_at_idx` - Index on created_at DESC

### RLS Policies
- `Users can view own profile` - SELECT policy
- `Users can update own profile` - UPDATE policy

---

## Next Steps

1. **Complete Setup**: Follow steps 1-7 above
2. **Run Dev Server**: `npm run dev`
3. **Test Registration**: Follow manual E2E testing flow
4. **Monitor Logs**: Check Supabase Dashboard → Logs during testing
5. **Report Issues**: Document any errors and check troubleshooting section

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase CLI Docs**: https://supabase.com/docs/reference/cli/introduction
- **Auth Configuration**: https://supabase.com/docs/guides/auth/overview
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates

---

**Last Updated**: February 10, 2026

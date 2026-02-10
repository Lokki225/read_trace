# Supabase Quick Start for E2E Testing

## TL;DR - What You Need to Do

### 1. Install Supabase CLI
```bash
# Windows (Scoop)
scoop install supabase

# macOS (Homebrew)
brew install supabase/tap/supabase

# All platforms (npm)
npm install -g @supabase/cli
```

### 2. Authenticate & Link Project
```bash
supabase login
supabase link --project-ref [YOUR_PROJECT_REF]
```

Get your project ref from: https://app.supabase.com → Select project → URL contains it

### 3. Run Migrations
```bash
supabase db push
```

This applies:
- `001_create_user_profiles.sql` - Creates user_profiles table
- `002_create_rls_policies.sql` - Enables Row Level Security

### 4. Configure Supabase Dashboard

**Go to: https://app.supabase.com → Your Project**

#### A. Email Configuration
- **Authentication → Email Templates**
  - Verify "Confirm signup" template exists
  - Should contain `{{ .ConfirmationURL }}`
  - Click "Test" to send test email

#### B. Redirect URLs
- **Authentication → URL Configuration**
  - Add: `http://localhost:3000/auth/callback`
  - Add: `http://localhost:3000/register/confirm`

#### C. Site URL
- **Authentication → URL Configuration**
  - Set: `http://localhost:3000`

#### D. SMTP (Optional for Production)
- **Authentication → Email Templates → SMTP Settings**
  - Configure your email provider credentials

### 5. Verify Setup
```bash
# Check migrations applied
supabase db pull

# Check tables exist
supabase db list

# Check RLS policies
supabase db policies list
```

### 6. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000/register

---

## What Gets Created

### Database Table: `user_profiles`
```
id (UUID) → links to auth.users
email (TEXT) → unique, lowercase
display_name (TEXT)
avatar_url (TEXT)
auth_provider (TEXT) → 'email', 'google', etc.
status (TEXT) → 'pending_verification', 'active', etc.
preferences (JSONB) → user settings
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### Indexes
- `user_profiles_email_unique` - Unique email
- `user_profiles_status_idx` - For filtering
- `user_profiles_created_at_idx` - For sorting

### RLS Policies
- Users can only SELECT their own profile
- Users can only UPDATE their own profile
- Profiles auto-created via trigger on signup

---

## Manual E2E Test Flow

### Test 1: Register New User
1. Go to http://localhost:3000/register
2. Enter: `test@example.com` / `SecurePass123!`
3. Click "Create account"
4. Should redirect to confirmation page
5. Check email for verification link
6. Click link → should redirect to dashboard

### Test 2: Validation Errors
- Try email: `invalid` → should show error
- Try password: `weak` → should show error
- Try duplicate email → should show "already exists"

### Test 3: Password Strength
- Type `Pass123!` → should show weak indicator
- Type `VerySecurePassword123!@#` → should show strong

### Test 4: Resend Email
- On confirmation page, click "request a new confirmation email"
- Should send new verification email

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Migrations failed" | Run `supabase db validate` to check syntax |
| "Email not received" | Check Supabase Dashboard → Logs → Auth |
| "Redirect not working" | Verify URL added in Auth → URL Configuration |
| "Can't login to CLI" | Run `supabase logout` then `supabase login` again |
| "RLS policy error" | Check Dashboard → SQL Editor → Run: `SELECT * FROM user_profiles;` |

---

## Environment Variables (Already Set)

Your `.env.local` should have:
```
NEXT_PUBLIC_SUPABASE_URL=https://kzernfbdptfyegfkjivw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Migrations Files

Located in `database/migrations/`:

**001_create_user_profiles.sql**
- Creates user_profiles table
- Sets up indexes
- Creates auto-update trigger for updated_at
- Creates auto-profile trigger on auth.users insert

**002_create_rls_policies.sql**
- Enables RLS on user_profiles
- Adds SELECT policy (users see own profile)
- Adds UPDATE policy (users update own profile)
- Grants permissions

---

## Next Steps After Setup

1. ✅ Run migrations: `supabase db push`
2. ✅ Configure email in Supabase Dashboard
3. ✅ Add redirect URLs
4. ✅ Start dev server: `npm run dev`
5. ✅ Test registration at http://localhost:3000/register
6. ✅ Check email for verification link
7. ✅ Verify user created in Dashboard → Authentication → Users

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **CLI Reference**: https://supabase.com/docs/reference/cli/introduction
- **Auth Setup**: https://supabase.com/docs/guides/auth/overview
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates

---

**Status**: Ready to test! Follow steps 1-6 above, then start E2E testing.

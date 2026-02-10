-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'discord')),
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'suspended', 'deleted')),
  preferences JSONB NOT NULL DEFAULT '{"email_notifications": true, "theme": "system", "default_scan_site": null}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on lowercase email
CREATE UNIQUE INDEX user_profiles_email_unique ON user_profiles (LOWER(email));

-- Create index on status for filtering
CREATE INDEX user_profiles_status_idx ON user_profiles (status);

-- Create index on created_at for sorting
CREATE INDEX user_profiles_created_at_idx ON user_profiles (created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, auth_provider, status, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    'email',
    'pending_verification',
    '{"email_notifications": true, "theme": "system", "default_scan_site": null}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- Comment on table and columns
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond Supabase Auth';
COMMENT ON COLUMN user_profiles.id IS 'UUID matching auth.users.id';
COMMENT ON COLUMN user_profiles.email IS 'User email address (denormalized from auth.users)';
COMMENT ON COLUMN user_profiles.display_name IS 'User display name for UI';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences as JSONB';

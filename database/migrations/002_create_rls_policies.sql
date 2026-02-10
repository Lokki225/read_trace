-- Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: No direct INSERT (handled by trigger)
-- Profiles are created automatically via trigger when auth.users record is inserted

-- Policy: No direct DELETE (cascade delete via foreign key)
-- When auth.users record is deleted, profile is automatically deleted

-- Grant necessary permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Comment on policies
COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Allows users to read their own profile data';
COMMENT ON POLICY "Users can update own profile" ON user_profiles IS 'Allows users to update their own profile data';

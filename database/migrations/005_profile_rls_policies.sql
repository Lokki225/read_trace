-- Enable Row Level Security on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for manual profile creation)
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create index on user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT INSERT ON user_profiles TO authenticated;

-- Comment on RLS policies
COMMENT ON POLICY "Users can view their own profile" ON user_profiles IS 'RLS policy: Users can only view their own profile data';
COMMENT ON POLICY "Users can update their own profile" ON user_profiles IS 'RLS policy: Users can only update their own profile data';
COMMENT ON POLICY "Users can insert their own profile" ON user_profiles IS 'RLS policy: Users can only insert their own profile data';

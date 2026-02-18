-- Add custom_sites column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS custom_sites JSONB DEFAULT '[]'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_custom_sites 
ON user_profiles USING GIN (custom_sites);

-- Add preferred_sites columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_sites TEXT[] DEFAULT ARRAY['mangadex'],
ADD COLUMN IF NOT EXISTS preferred_sites_updated_at TIMESTAMP DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_sites_updated_at 
ON user_profiles(preferred_sites_updated_at);

-- Update RLS policy to allow users to update their own preferences
-- (Existing RLS policies should already cover this, but ensure it's in place)

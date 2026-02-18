-- Add username column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Add bio column for user bios
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create unique index on lowercase username
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_unique ON user_profiles (LOWER(username));

-- Add check constraint for username format (3-30 chars, alphanumeric and underscore)
ALTER TABLE user_profiles ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    LENGTH(username) >= 3 AND 
    LENGTH(username) <= 30 AND 
    username ~ '^[a-zA-Z0-9_]+$'
  )
);

-- Add check constraint for bio length
ALTER TABLE user_profiles ADD CONSTRAINT bio_length CHECK (
  bio IS NULL OR LENGTH(bio) <= 500
);

-- Comment on new columns
COMMENT ON COLUMN user_profiles.username IS 'Unique username for the user (3-30 chars, alphanumeric and underscore)';
COMMENT ON COLUMN user_profiles.bio IS 'User bio/description (max 500 chars)';

-- Add extension tracking columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS extension_installed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS extension_installed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS browser_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS extension_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS installation_skipped BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installation_skipped_at TIMESTAMP WITH TIME ZONE;

-- Create index for extension status queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_extension_installed
ON user_profiles(extension_installed);

CREATE INDEX IF NOT EXISTS idx_user_profiles_browser_type
ON user_profiles(browser_type);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.extension_installed IS 'Whether browser extension is installed';
COMMENT ON COLUMN user_profiles.extension_installed_at IS 'When extension was first installed';
COMMENT ON COLUMN user_profiles.browser_type IS 'Browser type: chrome, firefox, safari';
COMMENT ON COLUMN user_profiles.extension_version IS 'Extension version string e.g. 1.0.0';
COMMENT ON COLUMN user_profiles.installation_skipped IS 'Whether user skipped extension installation';
COMMENT ON COLUMN user_profiles.installation_skipped_at IS 'When user skipped installation';

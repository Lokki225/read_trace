-- Migration 009: Add onboarding tracking fields to user_profiles

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed the onboarding wizard';
COMMENT ON COLUMN user_profiles.onboarding_completed_at IS 'When onboarding was completed';

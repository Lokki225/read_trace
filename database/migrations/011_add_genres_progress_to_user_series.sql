-- Migration 011: Add genres and progress_percentage to user_series
-- Story 3-2: Series Card Component with Magazine-Style Layout

ALTER TABLE user_series
  ADD COLUMN IF NOT EXISTS genres TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS progress_percentage INTEGER NOT NULL DEFAULT 0
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

COMMENT ON COLUMN user_series.genres IS 'Array of genre tags for the series';
COMMENT ON COLUMN user_series.progress_percentage IS 'Reading progress as integer percentage (0-100)';

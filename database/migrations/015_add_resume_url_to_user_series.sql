-- Migration 015: Add resume_url column to user_series table
-- Story 5-1: Resume Button on Series Cards

ALTER TABLE user_series
  ADD COLUMN IF NOT EXISTS resume_url VARCHAR(2048) NULL;

-- Index for query performance (partial index on non-null values)
CREATE INDEX IF NOT EXISTS idx_user_series_resume_url
  ON user_series (id)
  WHERE resume_url IS NOT NULL;

-- Down migration (rollback):
-- ALTER TABLE user_series DROP COLUMN IF EXISTS resume_url;
-- DROP INDEX IF EXISTS idx_user_series_resume_url;

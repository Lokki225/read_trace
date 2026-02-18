-- Migration 010: Add status column to user_series table
-- Required for Story 3-1: Dashboard tabbed interface (Reading/Completed/On Hold/Plan to Read)

ALTER TABLE user_series
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'reading'
    CHECK (status IN ('reading', 'completed', 'on_hold', 'plan_to_read')),
  ADD COLUMN IF NOT EXISTS current_chapter INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_chapters INTEGER,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE;

-- Index for fast status filtering per user (supports dashboard tab queries)
CREATE INDEX IF NOT EXISTS idx_user_series_user_status ON user_series(user_id, status);

-- Index for last_read_at ordering
CREATE INDEX IF NOT EXISTS idx_user_series_last_read ON user_series(user_id, last_read_at DESC NULLS LAST);

COMMENT ON COLUMN user_series.status IS 'Reading status: reading | completed | on_hold | plan_to_read';
COMMENT ON COLUMN user_series.current_chapter IS 'Last read chapter number';
COMMENT ON COLUMN user_series.total_chapters IS 'Total chapters if known';
COMMENT ON COLUMN user_series.cover_url IS 'URL to series cover image';
COMMENT ON COLUMN user_series.last_read_at IS 'Timestamp of last reading activity';

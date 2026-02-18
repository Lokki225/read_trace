-- Migration 008: Create reading_progress table
-- Stores per-series reading progress for each user

CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES user_series(id) ON DELETE CASCADE,
  chapter_number INTEGER,
  page_number INTEGER,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, series_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);

-- Index for series lookups
CREATE INDEX IF NOT EXISTS idx_reading_progress_series_id ON reading_progress(series_id);

-- RLS: users can only access their own progress
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON reading_progress FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE reading_progress IS 'Reading progress per series per user';
COMMENT ON COLUMN reading_progress.chapter_number IS 'Last chapter read';
COMMENT ON COLUMN reading_progress.page_number IS 'Last page read within chapter';

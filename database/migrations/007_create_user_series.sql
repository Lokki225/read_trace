-- Migration 007: Create user_series table
-- Stores series tracked by each user (imported or manually added)

CREATE TABLE IF NOT EXISTS user_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'Other',
  source_url TEXT,
  import_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_series_user_id ON user_series(user_id);

-- Index for deduplication checks
CREATE INDEX IF NOT EXISTS idx_user_series_normalized ON user_series(user_id, normalized_title);

-- RLS: users can only access their own series
ALTER TABLE user_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own series"
  ON user_series FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own series"
  ON user_series FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own series"
  ON user_series FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own series"
  ON user_series FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_series IS 'Series tracked by each user';
COMMENT ON COLUMN user_series.normalized_title IS 'Lowercase, special-char-stripped title for deduplication';
COMMENT ON COLUMN user_series.import_id IS 'Links to import job that created this record';

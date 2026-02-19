-- Migration 013: Enable Supabase Realtime for reading_progress table
-- Sets up Realtime publication and updated_at trigger for conflict resolution

-- Enable Realtime for reading_progress table
-- (Supabase Realtime uses PostgreSQL logical replication via supabase_realtime publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'reading_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reading_progress;
  END IF;
END $$;

-- Function: auto-update updated_at on row change (used for conflict resolution)
CREATE OR REPLACE FUNCTION update_reading_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fire before each UPDATE on reading_progress
DROP TRIGGER IF EXISTS trg_reading_progress_updated_at ON reading_progress;

CREATE TRIGGER trg_reading_progress_updated_at
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_progress_updated_at();

-- Add updated_at column to reading_progress if not already present
-- (migration 008 only has created_at / updated_at via DEFAULT NOW() but no trigger)
ALTER TABLE reading_progress
  ALTER COLUMN updated_at SET DEFAULT NOW();

COMMENT ON TRIGGER trg_reading_progress_updated_at ON reading_progress
  IS 'Auto-updates updated_at timestamp for last-write-wins conflict resolution';

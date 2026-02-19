-- Migration 016: Add scroll_position to reading_progress table
-- Stores the user's last scroll position (0-100 percentage) for scroll restoration

ALTER TABLE reading_progress
  ADD COLUMN IF NOT EXISTS scroll_position INTEGER DEFAULT 0;

COMMENT ON COLUMN reading_progress.scroll_position IS 'Last scroll position as percentage (0-100) for automatic scroll restoration';

-- Migration 017: Add platform tracking to reading_progress
-- Purpose: Enable unified reading state across multiple scanlation platforms
-- Date: 2026-02-19

-- Add platform column to reading_progress table
ALTER TABLE reading_progress
ADD COLUMN IF NOT EXISTS platform VARCHAR(50) NOT NULL DEFAULT 'unknown';

-- Create index for efficient unified state queries
CREATE INDEX IF NOT EXISTS idx_reading_progress_series_updated
ON reading_progress(series_id, updated_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN reading_progress.platform IS 'Platform identifier (e.g., mangadex, webtoon) - identifies which scanlation site this progress came from';

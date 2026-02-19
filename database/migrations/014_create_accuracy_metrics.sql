-- Migration 014: Create accuracy_metrics table for extension detection analytics
-- Tracks detection success rates per platform for continuous improvement

CREATE TABLE IF NOT EXISTS accuracy_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  detected_title TEXT,
  detected_chapter NUMERIC,
  detected_scroll INTEGER,
  confidence INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  edge_case_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for platform-based queries
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_platform
  ON accuracy_metrics (platform);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_created_at
  ON accuracy_metrics (created_at DESC);

-- Index for failure analysis
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_success
  ON accuracy_metrics (success, platform);

-- RLS: only service role can insert/read (extension sends via API)
ALTER TABLE accuracy_metrics ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for API routes)
CREATE POLICY "service_role_accuracy_metrics"
  ON accuracy_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- View for aggregated accuracy per platform
CREATE OR REPLACE VIEW platform_accuracy_summary AS
SELECT
  platform,
  COUNT(*) AS total_detections,
  COUNT(*) FILTER (WHERE success = true) AS successful_detections,
  ROUND(
    COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    1
  ) AS accuracy_percentage,
  ARRAY_AGG(DISTINCT failure_reason) FILTER (WHERE failure_reason IS NOT NULL) AS common_failures,
  MAX(created_at) AS last_updated
FROM accuracy_metrics
GROUP BY platform;

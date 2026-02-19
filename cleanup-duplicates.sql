-- Cleanup: Delete duplicate user_series entries, keeping only the most recent one per (user_id, normalized_title)
DELETE FROM user_series
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, normalized_title) id
  FROM user_series
  ORDER BY user_id, normalized_title, created_at DESC
);

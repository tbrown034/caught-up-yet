-- Fix duplicate share codes and ensure uniqueness

-- First, identify and keep only the most recent room for each duplicate share_code
-- Delete older duplicates
WITH ranked_rooms AS (
  SELECT
    id,
    share_code,
    ROW_NUMBER() OVER (PARTITION BY share_code ORDER BY created_at DESC) as rn
  FROM rooms
)
DELETE FROM rooms
WHERE id IN (
  SELECT id FROM ranked_rooms WHERE rn > 1
);

-- Ensure the unique constraint exists
-- (This will fail if constraint already exists, which is fine)
DO $$
BEGIN
  ALTER TABLE rooms ADD CONSTRAINT rooms_share_code_unique UNIQUE (share_code);
EXCEPTION
  WHEN duplicate_table THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Add index if it doesn't exist (improves lookup performance)
CREATE INDEX IF NOT EXISTS idx_rooms_share_code ON rooms(share_code);

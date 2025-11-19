-- ============================================
-- Migration: Add Encoded Position Columns
--
-- This migration adds integer position columns alongside existing JSONB.
-- The integer encoding enables:
-- 1. Fast spoiler filtering (simple integer comparison)
-- 2. Database-level indexing for position queries
-- 3. Efficient slider/percentage calculations
--
-- Encoding scheme:
-- - NFL: (quarter-1)*900 + seconds_elapsed (0-3599)
-- - NBA: (quarter-1)*720 + seconds_elapsed (0-2879)
-- - NHL: (period-1)*1200 + seconds_elapsed (0-3599)
-- - MLB: (inning-1)*8 + half_offset + outs (0-71 for 9 innings)
-- ============================================

-- Add encoded position columns to messages
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS position_encoded INTEGER;

-- Add encoded position column to room_members
ALTER TABLE room_members
ADD COLUMN IF NOT EXISTS current_position_encoded INTEGER;

-- Create index for efficient message filtering by position
CREATE INDEX IF NOT EXISTS idx_messages_position_encoded
ON messages(room_id, position_encoded);

-- Create index for member positions
CREATE INDEX IF NOT EXISTS idx_room_members_position_encoded
ON room_members(room_id, current_position_encoded);

-- ============================================
-- Helper function to encode NFL position from JSONB
-- ============================================
CREATE OR REPLACE FUNCTION encode_nfl_position(pos JSONB) RETURNS INTEGER AS $$
DECLARE
  quarter INTEGER;
  minutes INTEGER;
  seconds INTEGER;
  time_in_seconds INTEGER;
  seconds_elapsed INTEGER;
BEGIN
  quarter := (pos->>'quarter')::INTEGER;
  minutes := (pos->>'minutes')::INTEGER;
  seconds := (pos->>'seconds')::INTEGER;

  time_in_seconds := minutes * 60 + seconds;
  seconds_elapsed := 900 - time_in_seconds;

  RETURN (quarter - 1) * 900 + seconds_elapsed;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Helper function to encode MLB position from JSONB
-- ============================================
CREATE OR REPLACE FUNCTION encode_mlb_position(pos JSONB) RETURNS INTEGER AS $$
DECLARE
  inning INTEGER;
  half TEXT;
  outs INTEGER;
  inning_base INTEGER;
  half_offset INTEGER;
BEGIN
  inning := (pos->>'inning')::INTEGER;
  half := pos->>'half';
  outs := COALESCE((pos->>'outs')::INTEGER, 3); -- 3 represents END of half

  inning_base := (inning - 1) * 8;
  half_offset := CASE WHEN half = 'TOP' THEN 0 ELSE 4 END;

  RETURN inning_base + half_offset + outs;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Helper function to encode NBA position from JSONB
-- ============================================
CREATE OR REPLACE FUNCTION encode_nba_position(pos JSONB) RETURNS INTEGER AS $$
DECLARE
  quarter INTEGER;
  minutes INTEGER;
  seconds INTEGER;
  time_in_seconds INTEGER;
  seconds_elapsed INTEGER;
BEGIN
  quarter := (pos->>'quarter')::INTEGER;
  minutes := (pos->>'minutes')::INTEGER;
  seconds := (pos->>'seconds')::INTEGER;

  time_in_seconds := minutes * 60 + seconds;
  seconds_elapsed := 720 - time_in_seconds;

  RETURN (quarter - 1) * 720 + seconds_elapsed;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Helper function to encode NHL position from JSONB
-- ============================================
CREATE OR REPLACE FUNCTION encode_nhl_position(pos JSONB) RETURNS INTEGER AS $$
DECLARE
  period INTEGER;
  minutes INTEGER;
  seconds INTEGER;
  time_in_seconds INTEGER;
  seconds_elapsed INTEGER;
BEGIN
  period := (pos->>'period')::INTEGER;
  minutes := (pos->>'minutes')::INTEGER;
  seconds := (pos->>'seconds')::INTEGER;

  time_in_seconds := minutes * 60 + seconds;
  seconds_elapsed := 1200 - time_in_seconds;

  RETURN (period - 1) * 1200 + seconds_elapsed;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Unified encoder that routes based on sport
-- ============================================
CREATE OR REPLACE FUNCTION encode_game_position(pos JSONB, sport TEXT) RETURNS INTEGER AS $$
BEGIN
  CASE sport
    WHEN 'nfl' THEN RETURN encode_nfl_position(pos);
    WHEN 'nba' THEN RETURN encode_nba_position(pos);
    WHEN 'nhl' THEN RETURN encode_nhl_position(pos);
    WHEN 'mlb' THEN RETURN encode_mlb_position(pos);
    ELSE RAISE EXCEPTION 'Unsupported sport: %', sport;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Backfill existing messages with encoded positions
-- ============================================
UPDATE messages m
SET position_encoded = encode_game_position(
  m.position,
  (SELECT r.sport FROM rooms r WHERE r.id = m.room_id)
)
WHERE m.position_encoded IS NULL
AND m.position IS NOT NULL
AND m.position != '{}'::JSONB;

-- ============================================
-- Backfill existing room_members with encoded positions
-- ============================================
UPDATE room_members rm
SET current_position_encoded = encode_game_position(
  rm.current_position,
  (SELECT r.sport FROM rooms r WHERE r.id = rm.room_id)
)
WHERE rm.current_position_encoded IS NULL
AND rm.current_position IS NOT NULL
AND rm.current_position != '{}'::JSONB;

-- ============================================
-- Comment the columns for documentation
-- ============================================
COMMENT ON COLUMN messages.position_encoded IS 'Monotonic integer encoding of game position for fast spoiler filtering';
COMMENT ON COLUMN room_members.current_position_encoded IS 'Monotonic integer encoding of user current game position';

-- ============================================
-- Note: We keep both JSONB and INTEGER columns for now
-- The JSONB provides human-readable debugging
-- The INTEGER provides performance for filtering
-- In the future, we may drop JSONB once INTEGER is proven stable
-- ============================================

-- ============================================
-- Migration: Change Default Spoiler Protection to OFF
--
-- Changes show_spoilers default from FALSE to TRUE
-- This means by default users will see all messages (spoiler protection OFF)
-- ============================================

-- Change the default value for new members
ALTER TABLE room_members
ALTER COLUMN show_spoilers SET DEFAULT TRUE;

-- Update existing members to have spoiler protection OFF
-- (Only update those still at default FALSE value)
UPDATE room_members
SET show_spoilers = TRUE
WHERE show_spoilers = FALSE;

-- Comment for clarity
COMMENT ON COLUMN room_members.show_spoilers IS
'When TRUE: show all messages (spoiler protection OFF). When FALSE: hide messages ahead of position (spoiler protection ON). Default: TRUE (protection OFF)';

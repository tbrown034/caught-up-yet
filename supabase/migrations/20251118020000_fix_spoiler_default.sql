-- ============================================
-- Fix Spoiler Protection Default
--
-- User feedback: Default should HIDE future markers (protection ON)
-- Current: show_spoilers = TRUE (protection OFF, shows all)
-- Desired: show_spoilers = FALSE (protection ON, hides future)
-- ============================================

-- Change the default value for new members to FALSE (protection ON)
ALTER TABLE room_members
ALTER COLUMN show_spoilers SET DEFAULT FALSE;

-- Update ALL existing members to have spoiler protection ON by default
-- This ensures everyone starts with protection enabled
UPDATE room_members
SET show_spoilers = FALSE;

-- Update comment for clarity
COMMENT ON COLUMN room_members.show_spoilers IS
'When FALSE: hide future messages/markers (spoiler protection ON) - DEFAULT. When TRUE: show all messages/markers (spoiler protection OFF).';

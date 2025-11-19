-- ============================================
-- Extra Spoiler Protection OFF by Default
--
-- User feedback: Extra spoiler protection should be OFF by default
-- Current: show_spoilers = FALSE (protection ON, hides markers)
-- Desired: show_spoilers = TRUE (protection OFF, shows markers)
-- ============================================

-- Change the default value for new members to TRUE (protection OFF)
ALTER TABLE room_members
ALTER COLUMN show_spoilers SET DEFAULT TRUE;

-- Update ALL existing members to have extra spoiler protection OFF by default
UPDATE room_members
SET show_spoilers = TRUE;

-- Update comment for clarity
COMMENT ON COLUMN room_members.show_spoilers IS
'When TRUE: show all markers (extra spoiler protection OFF) - DEFAULT. When FALSE: hide future markers (extra spoiler protection ON).';

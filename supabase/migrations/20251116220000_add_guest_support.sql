-- ============================================
-- Add Guest Support
-- ============================================

-- Add guest name column to room_members
-- For authenticated users, we use their email
-- For guests, we store their chosen display name
ALTER TABLE room_members
ADD COLUMN display_name TEXT;

-- Update existing members to use email from their user record
-- (We'll populate this via the application layer going forward)

-- ============================================
-- Backfill display names for room members
-- ============================================

-- Update room_members where display_name is null
-- For authenticated (non-anonymous) users, use their email username
UPDATE room_members rm
SET display_name = (
  SELECT SPLIT_PART(u.email, '@', 1)
  FROM auth.users u
  WHERE u.id = rm.user_id
  AND u.is_anonymous = false
)
WHERE rm.display_name IS NULL
AND EXISTS (
  SELECT 1 FROM auth.users u
  WHERE u.id = rm.user_id
  AND u.is_anonymous = false
  AND u.email IS NOT NULL
);

-- For any remaining nulls (anonymous users without names), set to 'Guest'
UPDATE room_members
SET display_name = 'Guest'
WHERE display_name IS NULL;

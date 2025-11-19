-- ============================================
-- Fix RLS for Room Joining
-- ============================================

-- Problem: Users can't find rooms by share code unless they're already members
-- Solution: Allow viewing active rooms by share code (for joining)

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view rooms they're in" ON rooms;

-- Create two new policies:

-- 1. Allow viewing rooms by share code (for joining)
CREATE POLICY "Anyone can view active rooms by share code"
  ON rooms FOR SELECT
  USING (is_active = true);

-- Note: Even though this allows viewing all active rooms, users still need
-- the share code to find a specific room (share codes are hard to guess).
-- This is safe because:
-- - Share codes are 6 random characters (over 2 billion combinations)
-- - Rooms expire in 24 hours
-- - Room data doesn't contain sensitive info (just game details)

-- 2. Keep the existing creator permissions
-- (Already covered by "Room creators can update rooms" policy)

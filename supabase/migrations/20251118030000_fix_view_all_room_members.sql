-- ============================================
-- Fix: Allow users to see ALL members in their rooms
-- ============================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view their own memberships" ON room_members;

-- Create policy that allows viewing all members in rooms you're part of
-- Uses the security definer function to avoid RLS recursion
CREATE POLICY "Users can view all members in their rooms"
  ON room_members FOR SELECT
  USING (
    -- Can view if you're a member of the same room
    is_room_member(room_id)
  );

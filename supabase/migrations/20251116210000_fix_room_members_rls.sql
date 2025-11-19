-- ============================================
-- FIX: Infinite recursion in room_members RLS policy
-- ============================================

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view members in their rooms" ON room_members;

-- Create a simpler policy that doesn't self-reference
-- Users can view their own membership records
CREATE POLICY "Users can view their own memberships"
  ON room_members FOR SELECT
  USING (auth.uid() = user_id);

-- Also fix the rooms SELECT policy which has the same issue
-- (it checks room_members to see if user can view rooms)
DROP POLICY IF EXISTS "Users can view rooms they're in" ON rooms;

-- Use a security definer function to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION is_room_member(room_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM room_members
    WHERE room_id = room_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow users to view rooms they created OR are members of
CREATE POLICY "Users can view accessible rooms"
  ON rooms FOR SELECT
  USING (
    auth.uid() = created_by
    OR is_room_member(id)
  );

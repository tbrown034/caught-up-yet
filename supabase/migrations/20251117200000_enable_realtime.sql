-- ============================================
-- Migration: Enable Realtime for Messages, Rooms, and Room Members
-- ============================================

-- Enable Realtime for watch party tables
-- This allows instant updates without polling
-- Note: This command is idempotent - safe to run multiple times

DO $$
BEGIN
  -- Add messages table to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  -- Add rooms table to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;

  -- Add room_members table to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'room_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
  END IF;
END $$;

-- Verify the tables are in the publication
SELECT 'Realtime enabled for: ' || tablename as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'rooms', 'room_members')
ORDER BY tablename;

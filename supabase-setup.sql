-- ============================================
-- CAUGHT UP YET - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Rooms table: stores watch party rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id TEXT NOT NULL,              -- ESPN game ID (e.g., "401671747")
  sport TEXT NOT NULL,                -- 'nfl', 'mlb', 'nba', 'nhl'
  share_code TEXT UNIQUE NOT NULL,    -- 6-char code (e.g., "BEARS7")
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,    -- End of game day
  game_data JSONB,                    -- Store team names, game info for display
  is_active BOOLEAN DEFAULT TRUE,

  CONSTRAINT valid_sport CHECK (sport IN ('nfl', 'mlb', 'nba', 'nhl'))
);

-- Room members: tracks who's in each room and their progress
CREATE TABLE room_members (
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current position in game (JSONB for flexibility across sports)
  -- NFL: {"quarter": 3, "minutes": 8, "seconds": 2}
  -- MLB: {"inning": 5, "half": "TOP", "outs": 2}
  current_position JSONB NOT NULL DEFAULT '{}',

  -- Spoiler toggle
  show_spoilers BOOLEAN DEFAULT FALSE,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (room_id, user_id)
);

-- Messages: chat messages tied to game position
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL,

  -- Position when message was sent (same format as room_members.current_position)
  position JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT content_length CHECK (char_length(content) <= 500)
);

-- Profiles: user display names and preferences
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_rooms_share_code ON rooms(share_code);
CREATE INDEX idx_rooms_game_id ON rooms(game_id);
CREATE INDEX idx_rooms_created_by ON rooms(created_by);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(room_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ROOMS POLICIES
-- Anyone can view rooms they're a member of
CREATE POLICY "Users can view rooms they're in"
  ON rooms FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM room_members WHERE room_id = rooms.id
    )
  );

-- Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Room creators can update their rooms
CREATE POLICY "Room creators can update rooms"
  ON rooms FOR UPDATE
  USING (auth.uid() = created_by);

-- Room creators can delete their rooms
CREATE POLICY "Room creators can delete rooms"
  ON rooms FOR DELETE
  USING (auth.uid() = created_by);

-- ROOM_MEMBERS POLICIES
-- Users can view members of rooms they're in
CREATE POLICY "Users can view members in their rooms"
  ON room_members FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM room_members WHERE room_id = room_members.room_id
    )
  );

-- Users can insert themselves into rooms
CREATE POLICY "Users can join rooms"
  ON room_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own member record
CREATE POLICY "Users can update their own membership"
  ON room_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can leave rooms
CREATE POLICY "Users can leave rooms"
  ON room_members FOR DELETE
  USING (auth.uid() = user_id);

-- MESSAGES POLICIES
-- Users can view messages in rooms they're members of
CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM room_members WHERE room_id = messages.room_id
    )
  );

-- Users can create messages in rooms they're members of
CREATE POLICY "Users can send messages in their rooms"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM room_members WHERE room_id = messages.room_id
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (auth.uid() = user_id);

-- PROFILES POLICIES
-- Anyone can view profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed confusing chars (I, O, 0, 1)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_updated on room_members
CREATE TRIGGER update_room_member_timestamp
  BEFORE UPDATE ON room_members
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();

-- Function to create profile from new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- INITIAL DATA (optional)
-- ============================================

-- You can add test data here if needed
-- Example:
-- INSERT INTO rooms (game_id, sport, share_code, created_by, expires_at, game_data)
-- VALUES ('401671747', 'nfl', 'TEST01', auth.uid(), NOW() + INTERVAL '1 day', '{"homeTeam": "Bears", "awayTeam": "Packers"}');

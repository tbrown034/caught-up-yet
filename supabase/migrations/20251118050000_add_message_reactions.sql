-- ============================================
-- Add Message Reactions Feature
-- ============================================

-- Create reactions table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (
    reaction_type IN ('thumbs_up', 'thumbs_down', 'question', 'exclamation')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One user can only have one of each reaction type per message
  UNIQUE(message_id, user_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX idx_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_reactions_user ON message_reactions(user_id);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions in rooms they're members of
CREATE POLICY "Users can view reactions in their rooms"
  ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN room_members rm ON rm.room_id = m.room_id
      WHERE m.id = message_reactions.message_id
      AND rm.user_id = auth.uid()
    )
  );

-- Users can add reactions in rooms they're members of
CREATE POLICY "Users can add reactions in their rooms"
  ON message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN room_members rm ON rm.room_id = m.room_id
      WHERE m.id = message_reactions.message_id
      AND rm.user_id = auth.uid()
    )
  );

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
  ON message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE message_reactions IS 'User reactions to messages (thumbs up/down, question, exclamation)';
COMMENT ON COLUMN message_reactions.reaction_type IS 'Type of reaction: thumbs_up, thumbs_down, question, exclamation';

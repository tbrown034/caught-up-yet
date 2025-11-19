-- Add name column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS name TEXT;

-- Create an index on name for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);

-- Add a comment to document the column
COMMENT ON COLUMN rooms.name IS 'Optional custom name for the watch party room';

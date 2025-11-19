# Position System Architecture

## Overview

The position system is the core of spoiler-safe sports viewing. It uses **monotonic integer encoding** to represent game moments, enabling:

- O(1) spoiler filtering (simple `<=` comparison)
- Efficient slider/percentage calculations
- Database-level indexing
- Sport-agnostic message visibility

## Core Philosophy

**Every game moment is a unique monotonic integer. Earlier moments = smaller numbers.**

```
Message visible to user if: message.position <= user.position
```

## Encoding Schemes

### NFL (15-minute quarters)
- 900 positions per quarter (one per second)
- Range: 0 to 3599
- Formula: `(quarter - 1) * 900 + (900 - time_in_seconds)`
- Example: Q2 8:32 = 900 + (900 - 512) = 1288

### NBA (12-minute quarters)
- 720 positions per quarter
- Range: 0 to 2879
- Formula: `(quarter - 1) * 720 + (720 - time_in_seconds)`
- Example: Q3 6:00 = 1440 + 360 = 1800

### NHL (20-minute periods)
- 1200 positions per period
- Range: 0 to 3599
- Formula: `(period - 1) * 1200 + (1200 - time_in_seconds)`
- Example: P2 10:00 = 1200 + 600 = 1800

### MLB (innings with outs)
- 8 positions per inning (Top: 0,1,2,END + Bottom: 0,1,2,END)
- Range: 0 to 71 (9 innings)
- Formula: `(inning - 1) * 8 + half_offset + outs`
- Example: Top 5th, 2 outs = 32 + 0 + 2 = 34

## Key Files

### `lib/position-encoding.ts`
Core encoding/decoding logic:
- `encodePosition(meta, sport)` - Convert game state to integer
- `decodePosition(encoded, sport)` - Convert integer back to game state
- `isPositionVisible(msgPos, userPos)` - Check if message should be shown
- `positionToPercentage(encoded, sport)` - Convert to 0-100% for UI
- `getSegmentFromPosition(encoded, sport)` - Get current quarter/period/inning

### `lib/game-position.ts`
Legacy utilities (kept for compatibility):
- `formatNflPosition()` - Human-readable display (e.g., "Q3 8:02")
- `formatMlbPosition()` - Display like "Top 5th • 2 outs"
- `isValidPosition()` - Validate position structure
- `getInitialPosition()` - Get game start position

### UI Components

#### `components/rooms/BoxScorePosition.tsx`
Main container that:
- Displays current position with percentage
- Routes to sport-specific box score UI
- Shows message markers and legend
- Explains spoiler protection

#### Sport-specific Box Scores
- `NflBoxScore.tsx` - Quarter selector + time slider
- `NbaBoxScore.tsx` - Quarter selector + time slider (12 min)
- `NhlBoxScore.tsx` - Period selector + time slider (20 min)
- `MlbBoxScore.tsx` - Inning grid + half/outs selectors

## Database Schema

New columns added to support integer encoding:

```sql
-- messages table
position_encoded INTEGER  -- Fast filtering index

-- room_members table
current_position_encoded INTEGER  -- User's current position
```

Both JSONB and INTEGER columns are maintained during transition. The JSONB provides human-readable debugging, while INTEGER provides performance.

## API Endpoints

All endpoints support **both** formats:
- `position` (JSONB) - Original format
- `position_encoded` (INTEGER) - New optimized format

### POST /api/messages
```json
{
  "room_id": "uuid",
  "content": "Great catch!",
  "position_encoded": 1288  // OR position: { quarter: 2, minutes: 8, seconds: 32 }
}
```

### PATCH /api/members/position
```json
{
  "room_id": "uuid",
  "position_encoded": 1288  // OR position: { quarter: 2, ... }
}
```

## Migration Strategy

1. **Phase 1 (Current)**: Both columns maintained, API accepts either format
2. **Phase 2**: Client uses only encoded integers
3. **Phase 3**: Drop JSONB columns once stable

Run migration:
```bash
supabase db execute < supabase/migrations/20251117000000_add_encoded_positions.sql
```

The migration includes PostgreSQL functions to automatically backfill existing data.

## Usage Example

```typescript
import {
  encodePosition,
  decodePosition,
  isPositionVisible,
  positionToPercentage
} from '@/lib/position-encoding';

// Encoding
const nflPos = { quarter: 2, minutes: 8, seconds: 32 };
const encoded = encodePosition(nflPos, 'nfl'); // 1288

// Decoding
const decoded = decodePosition(1288, 'nfl');
// { quarter: 2, minutes: 8, seconds: 32 }

// Spoiler Check
const msgPos = 1500; // Q2 3:20
const userPos = 1288; // Q2 8:32
isPositionVisible(msgPos, userPos); // false - message is in future

// Progress
const percentage = positionToPercentage(1288, 'nfl'); // ~35.8%
```

## Testing

Comprehensive test suite in `test/position-encoding.test.ts`:
- 48 tests covering all sports
- Round-trip encoding verification
- Monotonic ordering guarantees
- Spoiler filtering logic
- Edge cases (boundaries, sentinels)

Run tests:
```bash
pnpm test:run
```

## Benefits Over Previous JSONB System

1. **Performance**: Integer comparison vs field-by-field object comparison
2. **Simplicity**: Single number represents entire game state
3. **Indexability**: Database can index on integer for fast queries
4. **Slider Math**: Direct mapping to UI slider percentage
5. **Message Markers**: Trivial to calculate visual positions

## Important Edge Cases

- **Quarter Boundaries**: Q1 0:00 and Q2 15:00 encode to same position (900) - this is correct for spoiler logic
- **Pregame**: Encoded as -1 (PREGAME sentinel)
- **Postgame**: Encoded as 1,000,000 (POSTGAME sentinel)
- **Overtime**: NFL quarter 5, NHL period 4+ supported in encoding

## Future Enhancements

- Real-time position syncing via Supabase subscriptions
- Position history tracking
- Group position synchronization
- Position-based notifications

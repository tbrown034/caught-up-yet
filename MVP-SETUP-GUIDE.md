# MVP Setup Guide - Ready for Tomorrow's Bears Game! 🏈

## What's Been Built

I've created a complete watch party MVP with:
- ✅ Room creation with share codes
- ✅ NFL position tracking (quarter + time slider)
- ✅ Spoiler protection (hide/show messages based on position)
- ✅ Real-time-ish messaging (10-second polling)
- ✅ Private rooms that expire end-of-day
- ✅ Dashboard to see your active rooms
- ✅ Join room flow (enter share code)

## Setup Steps (Do This Before Tomorrow!)

### Step 1: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click "Project Settings" (gear icon in sidebar)
3. Go to "API" section
4. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Run Database Setup

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open the file `/home/user/caught-up-yet/supabase-setup.sql`
5. Copy ALL the SQL and paste it into the Supabase SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)

This will create:
- 3 tables: `rooms`, `room_members`, `messages`
- All the security policies (RLS)
- Helper functions for share codes
- Indexes for performance

### Step 3: Install Dependencies & Run

```bash
# Install packages (if you haven't already)
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Flow (Before Tomorrow)

### Test 1: Create a Room
1. Go to `/games` (or click "Games" in header)
2. Find any game (doesn't have to be live)
3. Click "Create Watch Party" button
4. You'll see a share code (e.g., "BEA-RS7")
5. Click "Enter Watch Party"

### Test 2: Join a Room
1. Open a new incognito/private window
2. Sign in with a different Google account
3. Go to `/rooms/join`
4. Enter the share code from Test 1
5. You should join the room!

### Test 3: Send Messages
1. In the room, use the position slider to set your game position (e.g., Q1 15:00)
2. Type a message in the composer
3. Click "Send"
4. Message should appear in the feed

### Test 4: Spoiler Protection
**User 1 (you):**
1. Set position to Q1 10:00
2. Send message: "Great pass!"

**User 2 (other window):**
1. Set position to Q1 5:00 (earlier in the game)
2. You should see "1 message hidden (ahead of your position)"
3. Move slider to Q1 10:00 or later
4. Message now appears!

**Test spoiler toggle:**
1. Click the spoiler protection toggle (top of room)
2. All messages should now be visible regardless of position

## Tomorrow's Game Day Flow

### For You (Room Creator):
1. Go to `/games`
2. Find the Bears game
3. Click "Create Watch Party"
4. Copy the share code
5. Text/email share code to your family:
   ```
   Watch the Bears game with me!
   Join code: BEA-RS7
   Go to: caught-up-yet.com/rooms/join
   ```
6. As you watch, move the slider to match your position
7. Chat away!

### For Your Family (Room Joiners):
1. Go to the website
2. Sign in with Google
3. Click "Join Watch Party" or go to `/rooms/join`
4. Enter the share code you sent them
5. Move their slider to where THEY are in the game
6. Chat with you (spoiler-free!)

## Important Notes

### Position Tracking
- **If watching live:** Set slider to current game time as it progresses
- **If delayed:** Set slider to where YOU are (e.g., if you're 10 minutes behind, set accordingly)
- **Messages are anchored to position:** Your message gets tagged with your current position when you send it

### Spoiler Protection
- **Default:** Messages from "future" positions are hidden
- **Toggle ON:** See all messages (useful if you're caught up or don't care about spoilers)
- **The rule:** You only see messages where `message_position <= your_position`

### Room Lifecycle
- Rooms expire at 11:59 PM the day they're created
- After expiration, rooms are still viewable but read-only (this can be enhanced)

## Troubleshooting

### "Unauthorized" errors
- Check that `.env.local` has correct Supabase credentials
- Restart dev server after adding env vars

### "Failed to create room"
- Check browser console for errors
- Make sure database setup SQL ran successfully
- Check Supabase dashboard → "Table Editor" to see if tables exist

### "Share code not found"
- Make sure the code was copied correctly (6 characters, no spaces)
- Codes are case-insensitive
- Check that room hasn't expired

### Messages not showing
- Check spoiler toggle (might be hiding messages)
- Try refreshing the page (10-second poll might be delayed)
- Check browser console for errors

## What's NOT Built Yet (Future Enhancements)

These are nice-to-haves but not needed for tomorrow:

- ❌ MLB position slider (only NFL works now)
- ❌ Real-time updates (currently 10-second polling)
- ❌ User display names (shows "You" or user ID prefix)
- ❌ Message reactions/likes
- ❌ Delete messages
- ❌ Room settings (rename, make public/private)
- ❌ Push notifications
- ❌ Mobile app

## File Structure Reference

```
caught-up-yet/
├── app/
│   ├── api/
│   │   ├── rooms/
│   │   │   ├── route.ts         # Create & list rooms
│   │   │   ├── join/route.ts    # Join by share code
│   │   │   └── [id]/route.ts    # Get room details
│   │   ├── members/
│   │   │   └── position/route.ts # Update user position
│   │   └── messages/
│   │       └── route.ts          # Send messages
│   ├── rooms/
│   │   ├── [id]/page.tsx        # Room page (main UI)
│   │   └── join/page.tsx        # Join room page
│   ├── dashboard/page.tsx       # User dashboard
│   └── games/page.tsx           # Games listing
├── components/
│   ├── rooms/
│   │   ├── CreateRoomModal.tsx  # Modal for creating rooms
│   │   ├── NflPositionSlider.tsx # Position slider
│   │   ├── MessageFeed.tsx      # Message list
│   │   └── MessageComposer.tsx  # Send message
│   └── games/
│       └── GameCard.tsx         # Game card with "Create" button
├── lib/
│   ├── database.types.ts        # TypeScript types
│   ├── game-position.ts         # Position comparison logic
│   ├── share-code.ts            # Share code utilities
│   └── espn-api.ts              # Game data from ESPN
└── supabase-setup.sql           # Database schema (RUN THIS!)
```

## Questions?

If something doesn't work:
1. Check browser console for errors
2. Check Supabase dashboard logs
3. Make sure you're signed in
4. Try a hard refresh (Cmd/Ctrl + Shift + R)

## Ready to Test!

Go ahead and run through the testing steps above. If everything works, you're ready for tomorrow's game! 🏈

Let me know if you hit any issues and I'll help debug.

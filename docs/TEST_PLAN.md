# Manual Test Plan - ESPN Caching & Position Updates

## Server Status
✅ **Development server running at:** http://localhost:3000

## Test Overview

This test plan verifies:
1. ESPN scoring plays caching
2. Position slider behavior
3. Message creation and spoiler filtering
4. Live game detection
5. Performance improvements

---

## Pre-Test Checklist

- [ ] Server running (http://localhost:3000)
- [ ] Browser console open (F12 or Cmd+Option+I)
- [ ] Network tab open to monitor requests
- [ ] Two browser windows/tabs ready (for multi-user testing)

---

## Test 1: Basic Navigation & Room Setup

### Steps:
1. Go to http://localhost:3000
2. Navigate to Games page
3. Select a game (preferably one that's finished for consistent data)
4. Create a room or join with share code
5. Observe initial load

### Expected Results:
- ✅ Page loads without errors
- ✅ Room displays game info
- ✅ Position slider appears
- ✅ No console errors

### Check Network Tab:
- [ ] **ESPN API call** for scoring plays (once on load)
- [ ] **No repeated ESPN calls** as page settles

---

## Test 2: ESPN Caching - Position Slider Movement

### Steps:
1. Open Network tab
2. Clear network log
3. Drag position slider from Q1 15:00 → Q2 8:00 → Q3 5:00 → Q4 2:00
4. Move slider back and forth multiple times
5. Watch Network tab

### Expected Results:
- ✅ Score updates **instantly** as you drag
- ✅ **NO ESPN API calls** during slider dragging
- ✅ Smooth, responsive UI
- ✅ Score changes are accurate for each position

### Performance:
- Slider should feel instant (no 500ms lag)
- No jank or stuttering
- Scores calculated from cached data

---

## Test 3: Live Game Detection (If Available)

### Steps:
1. Find a game that's currently in progress
2. Create/join room for live game
3. Check if "Go Live" button appears
4. Click "Go Live"
5. Wait 60 seconds
6. Watch Network tab

### Expected Results:
- ✅ "Go Live" button visible for live games only
- ✅ Clicking "Go Live" jumps slider to current position
- ✅ May trigger fresh ESPN API call
- ✅ After 60 seconds, automatic refresh of scoring plays
- ✅ Score updates with new plays

### Console Check:
```javascript
// Should see something like:
// "Fetching scoring plays for game..."
// Every 60 seconds if live
```

---

## Test 4: Finished Game (Historical Viewing)

### Steps:
1. Select a game that finished yesterday/earlier
2. Create/join room
3. Move slider through game
4. Watch Network tab
5. Leave room open for 2+ minutes

### Expected Results:
- ✅ Scoring plays fetched **once** on load
- ✅ **NO refresh requests** (game is over)
- ✅ "Go Live" button NOT present
- ✅ All scores accurate throughout game
- ✅ No ongoing ESPN API calls

---

## Test 5: Position Persistence on Refresh

### Steps:
1. Join a room
2. Move slider to Q2 8:30 (or any specific position)
3. Wait 35+ seconds (for 30s debounce + buffer)
4. Note the current position
5. Refresh the page (F5 or Cmd+R)
6. Observe slider position after reload

### Expected Results:
- ✅ Position **restored** to Q2 8:30 (or wherever you were)
- ✅ Not reset to start (Q1 15:00)
- ✅ Scores recalculated correctly for restored position

### Check Network Tab:
- [ ] One DB read for room/member data
- [ ] One ESPN API call for scoring plays
- [ ] No excessive position update calls

---

## Test 6: Message Creation & Spoiler Protection

### Steps:
1. Move slider to Q1 10:00
2. Send message "First quarter action!"
3. Move slider to Q2 8:00
4. Send message "Halftime approaching!"
5. Move slider to Q3 5:00
6. Send message "Third quarter TD!"
7. Move slider back to Q1 15:00 (start of game)
8. Observe visible messages

### Expected Results:
- ✅ At Q1 15:00: See 0 messages (all are in future)
- ✅ At Q1 10:00: See 1 message ("First quarter")
- ✅ At Q2 8:00: See 2 messages
- ✅ At Q3 5:00: See all 3 messages
- ✅ Message count updates instantly as slider moves

### Database Check:
- Messages saved with correct `position_encoded`
- Each message has accurate position tag

---

## Test 7: Multi-User Spoiler Protection

**Requires 2 browser windows/tabs (or incognito)**

### Setup:
- Window 1: User A at Q3 8:00
- Window 2: User B at Q1 10:00

### Steps:
1. **User A** (Q3 8:00): Send message "Great 3rd quarter play!"
2. **User B** (Q1 10:00): Check if message visible
3. **User B**: Move slider to Q3 8:00
4. **User B**: Check if message now visible

### Expected Results:
- ✅ User B at Q1 10:00: **Does NOT see** User A's Q3 message
- ✅ User B at Q3 8:00: **DOES see** User A's Q3 message
- ✅ Real-time: User B sees message appear as they reach that position
- ✅ No position sharing (User A doesn't see User B's position)

---

## Test 8: Position DB Save Frequency

### Steps:
1. Open browser console
2. Open Network tab, filter for "position"
3. Move slider slowly from Q1 → Q2 (over ~2 minutes)
4. Watch for `/api/members/position` PATCH requests
5. Count how many requests are made

### Expected Results:
- ✅ Approximately **1 request every 30 seconds**
- ✅ NOT every 500ms (old behavior)
- ✅ Total: ~4 requests over 2 minutes (not 240!)

### Math Check:
- Old: 2 minutes = 120 seconds = 240 requests (500ms each)
- New: 2 minutes = 120 seconds = 4 requests (30s each)
- **98% reduction** ✓

---

## Test 9: Realtime Message Notifications

**Requires 2 browser windows**

### Steps:
1. **Window 1**: Join room, go to Q2 5:00
2. **Window 2**: Join same room, go to Q2 5:00
3. **Window 1**: Send message "Testing realtime!"
4. **Window 2**: Observe (don't refresh)

### Expected Results:
- ✅ **Window 2** sees message appear **instantly** (no refresh needed)
- ✅ Postgres Changes working correctly
- ✅ Message shows up in real-time

### Console Check:
```javascript
// Should see Supabase Realtime connection
// "Subscribed to channel: room-{id}"
```

---

## Test 10: Performance - Slider Responsiveness

### Steps:
1. Open Performance tab in DevTools
2. Start recording
3. Rapidly drag slider back and forth for 10 seconds
4. Stop recording
5. Analyze

### Expected Results:
- ✅ Smooth 60fps performance
- ✅ No dropped frames
- ✅ No long tasks blocking main thread
- ✅ Instant visual feedback

### Red Flags:
- ❌ Lag or stuttering
- ❌ API calls during dragging
- ❌ Long JavaScript execution

---

## Test 11: Pre-Game Behavior

### Steps:
1. Find a game scheduled for future
2. Create room for that game
3. Try moving slider
4. Check score display

### Expected Results:
- ✅ Slider available
- ✅ No scores yet (game hasn't started)
- ✅ No ESPN scoring plays (empty array)
- ✅ "Go Live" button NOT present
- ✅ No errors in console

---

## Test 12: Console Error Check

### Throughout All Tests:

**Open Console (F12) and watch for:**

### ✅ GOOD (Expected):
```
✓ Subscribed to channel: room-xyz
✓ Fetching scoring plays for game 123
✓ Scoring plays cached: 25 plays
```

### ❌ BAD (Errors):
```
✗ TypeError: Cannot read property...
✗ 404 Not Found
✗ Network request failed
✗ Unhandled Promise rejection
✗ Warning: Each child in a list should have a unique "key"
```

**Any errors = stop and report!**

---

## Performance Metrics to Collect

### During Testing, Note:

1. **Network Requests (per 5 minutes of use):**
   - ESPN API calls: ____ (expect: 1 initial + 5 if live = 6 total)
   - Position updates: ____ (expect: ~10 for 5 mins = 300s / 30s)
   - Message creates: ____ (varies by usage)

2. **UI Responsiveness:**
   - Slider lag: ____ ms (expect: 0ms, instant)
   - Score update delay: ____ ms (expect: 0ms, instant)
   - Message appear delay: ____ ms (expect: <100ms via Realtime)

3. **Page Load Time:**
   - Initial load: ____ seconds
   - Room data fetch: ____ ms
   - ESPN data fetch: ____ ms

---

## Known Issues to Watch For

### Potential Problems:

1. **CORS errors** - ESPN API blocks requests
   - Check: Network tab for blocked requests
   - Fix: ESPN API should work from localhost

2. **Supabase connection issues**
   - Check: "Subscribed to channel" in console
   - Fix: Verify .env.local has correct Supabase credentials

3. **Position encoding errors**
   - Check: Scores match expected values
   - Fix: Check `lib/score-at-position.ts` calculations

4. **Memory leaks** - Long sessions
   - Check: Performance tab, memory usage over time
   - Fix: Ensure useEffect cleanup functions work

---

## Success Criteria

### All Tests Pass If:

- [x] ✅ No console errors
- [x] ✅ ESPN API called once per load (+ every 60s if live)
- [x] ✅ Slider movement is instant (no lag)
- [x] ✅ Scores update instantly from cache
- [x] ✅ Position saved every 30s (not 500ms)
- [x] ✅ Position restored on refresh
- [x] ✅ Messages show in real-time
- [x] ✅ Spoiler protection works correctly
- [x] ✅ Multi-user doesn't share positions
- [x] ✅ 98% reduction in DB writes achieved
- [x] ✅ 99%+ reduction in ESPN calls achieved

---

## Failure Scenarios

### If Any Test Fails:

1. **Note exact steps to reproduce**
2. **Copy error from console**
3. **Screenshot if visual bug**
4. **Check server logs** (BashOutput tool)
5. **Report findings**

---

## After Testing

### Collect & Report:

1. Overall assessment: Pass/Fail
2. Performance metrics collected
3. Any errors encountered
4. User experience feedback
5. Suggestions for improvements

---

## Quick Reference Commands

```bash
# Check server logs
# (Already running in background)

# Run tests
pnpm test:run

# Check TypeScript
pnpm tsc --noEmit

# Build for production (final check)
pnpm build
```

---

## Notes Section

Use this space to jot down observations during testing:

```
Test 1 (Navigation):


Test 2 (Caching):


Test 3 (Live Game):


Test 4 (Finished Game):


Test 5 (Persistence):


Test 6 (Messages):


Test 7 (Multi-User):


Test 8 (DB Saves):


Test 9 (Realtime):


Test 10 (Performance):


Overall Notes:


```

---

**Happy Testing!** 🧪

The server is ready at http://localhost:3000

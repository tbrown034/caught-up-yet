# Game Room Redesign - Chat-First Architecture

## The Core Insight

**Current mental model (broken):**
> "I'm in a game room that happens to have messages."

**Target mental model:**
> "I'm in a group chat that happens to know where I am in the game."

This single shift removes 70% of the clutter pressure and aligns us with successful messaging apps.

---

## Design Principles

1. **Chat is the spine** - Everything else is contextual overlay
2. **Progressive disclosure** - Show only what's needed, when it's needed
3. **Mobile-first** - 80%+ of users will be on phones
4. **Trust through simplicity** - Less UI = more confidence in spoiler protection
5. **Messaging app conventions** - Borrow hierarchy rules, not aesthetics

---

## Current State Analysis

### What's wrong now:
- Dashboard-first layout creates cognitive overload
- Too many competing visual elements (scoreboard, slider, buttons, legends, members)
- Message list feels secondary, almost like an afterthought
- Users don't know where to look
- Doesn't feel like a chat app, feels like a sports app with chat bolted on

### What we have that works:
- Timeline slider concept (killer feature)
- Spoiler protection mechanics
- Share code system
- Reaction bar concept

---

## New Architecture

### Always Visible (Chat Screen)

```
┌─────────────────────────────────┐
│ ← Back     Q1 · 12:45  🔒  ☰   │  <- Status pill + hamburger
├─────────────────────────────────┤
│                                 │
│  [Message bubbles]              │
│                                 │
│  tbrown034: Let's go!           │
│                          11:02a │
│                                 │
│        sarah: Great start! 🔥   │
│        11:05a                   │
│                                 │
│  ┈┈┈┈┈ 3 messages ahead ┈┈┈┈┈  │  <- Locked indicator
│                                 │
├─────────────────────────────────┤
│ [Timeline scrubber - compact]   │  <- Mini progress bar
├─────────────────────────────────┤
│ Share your reaction...  Send │
│ 👍 👎 😮 ❓ ❗                   │
└─────────────────────────────────┘
```

### Components Breakdown

#### 1. Header (Minimal)
- Back button → returns to /games
- **Status pill**: `Q1 · 12:45 🔒` (current position + spoiler indicator)
- Hamburger menu → opens drawer

#### 2. Message List (Primary Surface)
- Takes 70-80% of screen
- Messages show sender, text, timestamp
- Messages AHEAD of user's position: collapsed/locked state
- Locked indicator: "3 messages ahead" or similar
- Auto-scroll to newest VISIBLE message

#### 3. Timeline Scrubber (Compact, In-Chat)
- Thin horizontal bar above composer
- Shows: your position marker, live position marker (if live)
- Tap to expand for fine control
- Drag to scrub through game time

#### 4. Composer (Safe & Casual)
- Placeholder: "Share your reaction..."
- Inline context: "Visible at Q1 12:45+"
- Quick reactions bar always visible
- Send button

---

## The Drawer (Progressive Disclosure)

Triggered by hamburger menu. Slides from right.

```
┌─────────────────────────────────┐
│                           ✕     │
├─────────────────────────────────┤
│ GAME                            │
│ ┌─────────────────────────────┐ │
│ │ 🏈 Rams        0            │ │
│ │ 🏈 Bears       0            │ │
│ │ Q1 · 🔴 LIVE                │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ YOUR PROGRESS              ▼    │
│ ┌─────────────────────────────┐ │
│ │ [=======|--------] Q1 12:45 │ │
│ │ Q1  Q2  HT  Q3  Q4  END     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ SAFETY                     ▼    │
│ Spoiler Protection      [ON]    │
├─────────────────────────────────┤
│ PARTY                      ▼    │
│ 3 members                       │
│ tbrown034 (You) ⭐              │
│ sarah                           │
│ mike                            │
│                                 │
│ [+ Share Party]                 │
├─────────────────────────────────┤
│ 🗑️ Delete Party                 │
└─────────────────────────────────┘
```

### Drawer Sections (Collapsible)

1. **Game** - Score, teams, live status (read-only context)
2. **Your Progress** - Full timeline slider, quarter selector, quick jumps
3. **Safety** - Spoiler protection toggle
4. **Party** - Members list, share button
5. **Danger Zone** - Delete party (creator only)

---

## Key Interactions

### Scrubbing the Timeline
1. User drags compact scrubber OR opens drawer for full control
2. Chat messages animate - locked messages unlock as position advances
3. Position updates optimistically, syncs to server
4. Other users see your position update in real-time

### Locked Messages
- Messages ahead of user's position show as:
  - Collapsed: "🔒 Message from sarah" (no content)
  - Or grouped: "┈┈ 5 messages ahead ┈┈"
- When user advances past, messages animate in

### Live Game Indicator
- If game is live, show "LIVE" badge in drawer
- Show live position marker on timeline
- "Catch up to live" quick action

### Sending Messages
1. User types or taps reaction
2. Message tagged with their CURRENT position
3. Shows inline: "This will be visible at Q1 12:45+"
4. Appears immediately in their chat
5. Other users see it when they reach that position

---

## Visual Design Notes

### What to keep
- Blue primary color
- Clean typography
- Rounded corners
- Light/dark mode support

### What changes
- Much more whitespace
- Chat bubbles (not cards)
- Minimal chrome
- Focus on message content

### Message Bubble Styles
```
Outgoing (You):
┌──────────────────────┐
│ Let's go Rams!       │ <- Blue background
│               11:02a │
└──────────────────────┘

Incoming:
        ┌──────────────────────┐
        │ Great start! 🔥      │ <- Gray/white background
sarah   │               11:05a │
        └──────────────────────┘

Locked:
┌──────────────────────────────┐
│ 🔒 sarah · Q2 5:30           │ <- Muted, no content
└──────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Chat-First Layout
- [x] Replace current room page with chat-first design
- [x] Message list as primary surface
- [x] Compact header with status pill
- [x] Basic composer with reactions

### Phase 2: Drawer System
- [x] Implement slide-out drawer
- [x] Move game info to drawer
- [x] Move full timeline controls to drawer
- [x] Move members/share to drawer

### Phase 3: Timeline Integration
- [x] Compact scrubber above composer
- [x] Locked message states (shows "X messages ahead" indicator)
- [ ] Smooth animations for unlocking
- [ ] Position sync refinements

### Phase 4: Polish
- [ ] Message animations
- [x] Dark mode refinements
- [ ] Haptic feedback (mobile)
- [ ] Performance optimization

---

## Success Metrics

1. **Time to first message** - Should decrease
2. **Messages sent per session** - Should increase
3. **User confusion** - Should disappear (no "what do I do here?")
4. **Share rate** - Should increase (easier to invite friends)

---

## Questions to Resolve

1. **Compact scrubber design** - How minimal can we go while maintaining usability?
2. **Locked message grouping** - Show count or show individual locked items?
3. **Live position handling** - How prominent should "catch up to live" be?
4. **Reaction-only mode** - Should there be a "reactions only" composer mode?

---

## Iteration Log

### Iteration 1 - 2026-01-18
**Goal**: Initial chat-first implementation

**Changes Made**:
- Created `ChatHeader.tsx` - Minimal header with back button, status pill (showing position + lock icon), and hamburger menu
- Created `RoomDrawer.tsx` - Slide-out drawer from right containing: game info, full timeline controls, spoiler protection toggle, party members, share button, delete option
- Created `CompactTimeline.tsx` - Thin horizontal scrubber bar above composer with drag support and "Go Live" / "Jump to End" button
- Refactored `app/rooms/[id]/page.tsx` - Full-height flex layout with:
  - Sticky header at top
  - Scrollable message list (takes 70-80% of screen)
  - Compact timeline above composer
  - Sticky composer at bottom
  - Chat-bubble style messages (blue for own, white for others)
  - "X messages ahead" locked indicator

**Outcome**: Chat-first layout implemented. Messages are now the primary focus. All secondary controls moved to drawer.

**What's Working**:
- Clean iMessage-like chat interface
- Minimal header with essential info only
- Drawer provides access to full controls without cluttering main view
- Compact timeline allows quick position adjustment
- Dark mode fully supported

**To Test**:
- Real-time message updates
- Position scrubbing responsiveness
- Mobile touch interactions
- Drawer open/close animations

### Iteration 2 - 2026-01-18
**Goal**: Show key info (score, position) without drawer

**Changes Made**:
- Updated `ChatHeader.tsx` to show compact scoreboard: "LAR 0 - 0 CHI | Q2 06:25"
- Added team abbreviation lookup for common teams
- Score updates based on current position (uses scoring plays data)
- Made room page full-screen with `fixed inset-0` to hide main layout header/footer
- Added max-width container (max-w-3xl) for desktop centering

**Tested User Stories**:
1. Send message - Works, appears as blue bubble on right
2. Open drawer - Works, shows full timeline controls
3. Move position forward - Messages remain visible
4. Move position backward - Future messages hidden (spoiler protection working)
5. Mobile layout - Full width, composer visible at bottom
6. Desktop layout - Centered content, score/position in header

**What's Working Well**:
- Score and position always visible in header
- Spoiler protection hides messages posted after current position
- Clean mobile-first layout
- Chat feels like iMessage/WhatsApp

---

## References

- iMessage: Status bar minimal, chat dominant, details in drawer
- WhatsApp: Group info hidden, chat primary, media in overlay
- Discord: Channels sidebar, but chat is 90% of focus
- Slack: Threads collapse, main channel is chat

---

## The Test

For every element, ask:

> "If this were iMessage, would this be visible without tapping anything?"

If NO → it goes in a drawer, modal, or secondary screen.

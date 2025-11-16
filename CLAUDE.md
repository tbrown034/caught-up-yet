# CLAUDE.md - AI Assistant Guide for Caught Up Yet?

## Project Overview

**Caught Up Yet?** is a spoiler-free sports watch party platform that enables friends and family to share real-time reactions to sports games while watching at different times. Messages are revealed only when viewers reach that moment in the game, preventing spoilers.

### Core Problem Solved
- Families can't text about games when watching live vs. DVR delay
- Traditional chat spoils big moments for those behind
- This app provides "magic group chat" that knows where everyone is in the game

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15.5.6 with App Router
- **React**: 19.1.0
- **TypeScript**: ^5 (relaxed strict mode - see tsconfig.json)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React (NO emojis in production)
- **Build Tool**: Turbopack (next dev --turbopack)

### Key Dependencies
```json
{
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.76.1",
  "lucide-react": "^0.547.0",
  "next": "15.5.6",
  "react": "19.1.0"
}
```

---

## Project Structure

```
caught-up-yet/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (REST endpoints)
│   │   ├── rooms/                # Room CRUD operations
│   │   ├── members/              # Member position updates
│   │   └── messages/             # Message sending
│   ├── auth/                     # Auth callbacks
│   │   ├── callback/route.ts     # OAuth callback handler
│   │   └── signout/route.ts      # Sign out handler
│   ├── rooms/[id]/page.tsx       # Room view (main UI)
│   ├── dashboard/page.tsx        # User dashboard
│   ├── games/page.tsx            # Games listing (ESPN data)
│   ├── login/page.tsx            # Auth page
│   ├── layout.tsx                # Root layout (Header/Footer)
│   ├── page.tsx                  # Homepage (hero page)
│   └── globals.css               # Tailwind imports + fonts
├── components/
│   ├── layout/                   # Structural components
│   │   ├── Header.tsx            # Main header
│   │   ├── HeaderAuth.tsx        # Auth state display
│   │   ├── HeaderNav.tsx         # Navigation links
│   │   ├── HeaderLogo.tsx        # Logo component
│   │   └── Footer.tsx            # Site footer
│   ├── ui/                       # Reusable design system
│   │   ├── Button.tsx            # Button with variants
│   │   └── BrandIcon.tsx         # Brand icon component
│   ├── rooms/                    # Room-specific components
│   │   ├── CreateRoomModal.tsx   # Room creation
│   │   ├── NflPositionSlider.tsx # Position tracking slider
│   │   ├── MessageFeed.tsx       # Message display
│   │   └── MessageComposer.tsx   # Message input
│   └── games/                    # Game display components
│       ├── GameCard.tsx          # Individual game card
│       ├── SportTabs.tsx         # Sport filter tabs
│       ├── DateNavigation.tsx    # Date picker
│       └── GamesContainer.tsx    # Games list container
├── lib/                          # Utilities and services
│   ├── supabase/
│   │   ├── server.ts             # Server-side Supabase client
│   │   ├── client.ts             # Browser Supabase client
│   │   └── middleware.ts         # Auth middleware helper
│   ├── database.types.ts         # TypeScript types for DB
│   ├── espn-api.ts               # ESPN API integration
│   ├── game-position.ts          # Position comparison logic
│   ├── share-code.ts             # Share code generation
│   ├── fonts.ts                  # Font configuration
│   └── utils.ts                  # General utilities
├── constants/
│   └── site.ts                   # Site configuration
├── docs/                         # Project documentation
├── middleware.ts                 # Next.js middleware (auth)
├── supabase-setup.sql            # Database schema
└── MVP-SETUP-GUIDE.md            # Setup instructions
```

---

## Database Schema

### Tables (Supabase/PostgreSQL)

#### `rooms`
```sql
- id: UUID (PK)
- game_id: TEXT (ESPN game ID)
- sport: TEXT ('nfl', 'mlb', 'nba', 'nhl')
- share_code: TEXT (unique 6-char code)
- created_by: UUID (FK to auth.users)
- expires_at: TIMESTAMPTZ
- game_data: JSONB (team names, scores)
- is_active: BOOLEAN
```

#### `room_members`
```sql
- room_id: UUID (FK, PK)
- user_id: UUID (FK, PK)
- current_position: JSONB (sport-specific position)
- show_spoilers: BOOLEAN
- last_updated: TIMESTAMPTZ
```

#### `messages`
```sql
- id: UUID (PK)
- room_id: UUID (FK)
- user_id: UUID (FK)
- content: TEXT (max 500 chars)
- position: JSONB (game position when sent)
- created_at: TIMESTAMPTZ
```

### Position Types (JSONB)
```typescript
// NFL Position
{ quarter: 1-4, minutes: 0-15, seconds: 0-59 }

// MLB Position
{ inning: number, half: "TOP" | "BOTTOM", outs?: 0-2 }

// NBA/NHL similar to NFL
```

---

## Code Conventions

### Naming Conventions
- **Components**: PascalCase (`GameCard.tsx`, `MessageFeed.tsx`)
- **Utilities/Functions**: camelCase (`generateShareCode`, `fetchSportGames`)
- **Constants**: SCREAMING_SNAKE_CASE in objects (`SITE_CONFIG`)
- **Folders**: lowercase or kebab-case (`ui/`, `layout/`, `rooms/`)
- **Files**: Match export name (`Button.tsx` exports `Button`)

### Component Patterns

1. **Server Components by Default** (App Router)
   ```typescript
   export default async function Page() {
     const data = await fetchData();
     return <div>{data}</div>;
   }
   ```

2. **Client Components When Needed**
   ```typescript
   "use client";
   import { useState } from "react";
   ```

3. **Button Component Usage**
   ```typescript
   import Button from "@/components/ui/Button";

   // Variants: primary, secondary, ghost
   // Sizes: sm, md, lg
   <Button variant="primary" size="lg" href="/login" asLink>
     Get Started
   </Button>
   ```

4. **Lucide Icons (NEVER use emojis)**
   ```typescript
   import { Clock, Shield, Users } from "lucide-react";
   <Clock className="w-6 h-6 text-blue-600" />
   ```

### API Route Patterns

```typescript
// Standard API route structure
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse/validate body
    const body = await request.json();
    if (!body.required_field) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }

    // 3. Database operation
    const { data, error } = await supabase.from("table").insert({...});
    if (error) {
      console.error("Error:", error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    // 4. Success response
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Supabase Client Usage

```typescript
// Server-side (API routes, Server Components)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // Note: async

// Client-side (Client Components)
import { createClient } from "@/lib/supabase/client";
const supabase = createClient(); // Note: sync
```

### Styling Patterns

1. **Tailwind CSS v4** - Uses `@import "tailwindcss"` in globals.css
2. **Font System**:
   - Body text: Inter (--font-inter)
   - Headings: Outfit (--font-outfit)
   - Code: JetBrains Mono (--font-mono)
3. **Color Palette**:
   - Primary: Blue (#2563eb / blue-600)
   - Secondary: Gray/Slate (#1f2937 / gray-800)
   - Focus rings on all interactive elements
4. **Responsive**: Mobile-first approach

---

## Authentication Flow

1. **OAuth with Supabase** (Google provider configured)
2. **Middleware** protects routes via `/middleware.ts`
3. **Auth Callback**: `/app/auth/callback/route.ts` handles OAuth redirects
4. **Sign Out**: `/app/auth/signout/route.ts`
5. **Protected Data**: Row Level Security (RLS) on all tables

---

## Development Workflow

### Commands
```bash
pnpm dev           # Start dev server with Turbopack
pnpm dev:clean     # Kill port 3000, start dev, open browser
pnpm build         # Production build (Turbopack)
pnpm start         # Start production server
pnpm lint          # Run ESLint
```

### Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup
Run `supabase-setup.sql` in Supabase SQL Editor to create:
- All tables with proper constraints
- Row Level Security policies
- Helper functions (share code generation)
- Indexes for performance

---

## External Integrations

### ESPN API
- **Base URL**: `https://site.api.espn.com/apis/site/v2/sports`
- **Usage**: Fetches live/upcoming games for NFL, MLB, NBA, NHL
- **Caching**: 60-second revalidation via Next.js fetch
- **File**: `/lib/espn-api.ts`

---

## Important Patterns to Follow

### 1. Error Handling
- Always wrap async operations in try/catch
- Log errors with `console.error`
- Return appropriate HTTP status codes
- Provide user-friendly error messages

### 2. Type Safety
- Use types from `/lib/database.types.ts`
- TypeScript is set to relaxed mode (strict: false)
- Define interfaces for component props
- Use `as const` for constant objects

### 3. Component Organization
- One component per file
- Co-locate related files
- Keep components focused (single responsibility)
- Extract reusable logic to `/lib`

### 4. Security
- All database operations go through Supabase RLS
- Always check authentication in API routes
- Never expose sensitive keys (use env vars)
- Validate user input on server

---

## AI Assistant Rules

### Critical Rules

1. **NEVER use emojis in production code** - Use Lucide React icons exclusively
2. **Ask before creating new files** - Prefer editing existing files
3. **Don't guess critical data** - Ask for API keys, IDs, URLs directly
4. **Own mistakes immediately** - Be direct about errors and causes
5. **High confidence before proceeding** - If uncertain, ask or link to docs
6. **Follow existing patterns** - Check similar files before implementing

### When Working on This Codebase

1. **API Routes**: Follow the standard pattern (auth check → validate → operation → response)
2. **Components**: Use existing Button, follow Tailwind conventions
3. **Database**: Use types from `/lib/database.types.ts`
4. **Icons**: Import from `lucide-react`, check https://lucide.dev/icons
5. **Styling**: Use Tailwind utilities, maintain mobile-first design

### Code Quality Checklist
- [ ] Uses Lucide icons (no emojis)
- [ ] Proper error handling with try/catch
- [ ] Authentication checked in protected routes
- [ ] TypeScript types properly defined
- [ ] Follows existing naming conventions
- [ ] Accessible (focus rings, semantic HTML)
- [ ] Mobile-responsive

---

## Project-Specific Information

- **Developer**: Trevor Brown
- **Email**: trevorbrown.web@gmail.com
- **Philosophy**: KISS (Keep It Simple, Stupid) - No unnecessary abstractions
- **Focus**: MVP functionality for small private groups (family/friends)

---

## Current Feature Status

### Implemented (MVP)
- Room creation with share codes
- NFL position tracking (quarter + time slider)
- Spoiler protection (hide/show messages by position)
- Message polling (10-second interval)
- Private rooms that expire end-of-day
- User dashboard with active rooms
- Join room via share code
- Google OAuth authentication
- ESPN API integration for live game data

### Not Yet Implemented
- MLB/NBA/NHL position sliders (only NFL works)
- Real-time updates (WebSocket/Supabase Realtime)
- User display names (shows user ID prefix)
- Message reactions/likes
- Message deletion
- Room settings (rename, privacy)
- Push notifications
- Mobile app

---

## Documentation References

- **Project Docs**: `/docs/` (getting-started, components, folder-structure)
- **Library Guides**: `/docs/references/` (lucide, supabase, fonts)
- **MVP Setup**: `/MVP-SETUP-GUIDE.md`
- **Database Schema**: `/supabase-setup.sql`

---

## Quick Reference

### Common Imports
```typescript
// Supabase
import { createClient } from "@/lib/supabase/server"; // Server
import { createClient } from "@/lib/supabase/client"; // Client

// Types
import type { Room, Message, GamePosition } from "@/lib/database.types";

// Icons
import { IconName } from "lucide-react";

// Components
import Button from "@/components/ui/Button";

// Utils
import { generateShareCode } from "@/lib/share-code";
import { fetchAllSportsGames } from "@/lib/espn-api";
```

### Path Aliases
```typescript
// Use @/ for absolute imports from project root
import { something } from "@/lib/utils";
import Component from "@/components/ui/Component";
```

---

*Last updated: November 2024*

# Supabase Auth

**Package:** `@supabase/supabase-js` (+ framework-specific packages)
**Official Docs:** https://supabase.com/docs/guides/auth

## Overview

### What is Authentication vs Authorization?

- **Authentication** - Checking that a user is who they say they are (login/signup)
- **Authorization** - Checking what resources a user is allowed to access (permissions)

### How Supabase Auth Works

- Uses **JSON Web Tokens (JWTs)** for authentication
- Integrates directly with your project's **Postgres database**
- Supports **Row Level Security (RLS)** for fine-grained authorization
- Provides a complete auth solution: user management, sessions, tokens, and security

## Supported Authentication Methods

| Method | Supported | Notes |
|--------|-----------|-------|
| **Password** | ✅ | Email + password (classic) |
| **Magic Link / OTP** | ✅ | Passwordless email/SMS codes |
| **Social Login (OAuth)** | ✅ | Google, GitHub, Discord, etc. |
| **Enterprise SSO** | ✅ | SAML-based single sign-on |
| **Phone Login** | ✅ | SMS-based authentication |
| **Anonymous Sign-ins** | ✅ | Guest users (useful for demos/carts) |
| **Web3** | ✅ | Ethereum, Solana wallet auth |

## Pricing

Charges apply to:
- **Monthly Active Users (MAU)** - Regular authenticated users
- **Third-Party MAU** - OAuth provider users (Google, GitHub, etc.)
- **SSO MAU** - Enterprise SSO users
- **Add-ons** - Advanced MFA, phone authentication

See [Supabase Pricing](https://supabase.com/pricing) for details.

## Setup & Installation

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Enable auth methods you need (Dashboard → Authentication → Providers)

### 2. Install Packages

```bash
# Core JavaScript client
pnpm add @supabase/supabase-js

# Next.js specific (App Router + SSR support)
pnpm add @supabase/ssr
```

### 3. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these:**
- Dashboard → Settings → API
- URL and `anon` public key are safe to expose

### 4. Create Supabase Client

#### Server Components (App Router)

```tsx
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

#### Client Components

```tsx
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## Basic Usage Examples

### Sign Up (Email/Password)

```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
    },
  },
})
```

### Sign In (Email/Password)

```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})
```

### Sign In with OAuth (Google, GitHub, etc.)

```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
})
```

### Magic Link (Passwordless)

```tsx
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
  },
})
```

### Get Current User (Server)

```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}
```

### Sign Out

```tsx
const { error } = await supabase.auth.signOut()
```

## Best Practices

### ✅ DO

- **Use `getUser()` on the server** - Validates token freshness
- **Protect routes with middleware** - Check auth before rendering
- **Use Row Level Security (RLS)** - Secure database at the Postgres level
- **Store sensitive data in `user_metadata`** - But don't trust it for security
- **Use server-side auth for SSR/App Router** - Import from `@supabase/ssr`

```tsx
// ✅ Good - Server validation
import { createClient } from '@/lib/supabase/server'
const { data: { user } } = await supabase.auth.getUser() // Revalidates token
```

### ❌ DON'T

- **Don't use `getSession()` on server** - Doesn't revalidate, can be stale
- **Don't trust `user_metadata` for security** - User-editable, not verified
- **Don't expose service role key** - Keep it server-side only
- **Don't skip RLS policies** - Always secure your database

```tsx
// ❌ Bad - Server code using getSession
const { data: { session } } = await supabase.auth.getSession() // Can be stale!
```

## Managing Users

### View Users in Dashboard

Dashboard → Authentication → Users

### Query Users via SQL

```sql
SELECT * FROM auth.users;
```

### User Metadata Types

| Field | Description | Editable by User? | Use Case |
|-------|-------------|-------------------|----------|
| `user_metadata` | Custom user data | ✅ Yes | Display name, avatar, preferences |
| `app_metadata` | Admin-controlled data | ❌ No | Roles, permissions, admin flags |
| `raw_user_meta_data` | Provider data (OAuth) | ❌ No | Google profile, GitHub username |

## Row Level Security (RLS)

Enable RLS on tables to secure data:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

## Anonymous Users

Useful for:
- Demo experiences
- Shopping carts before checkout
- Trials before signup

```tsx
const { data, error } = await supabase.auth.signInAnonymously()
```

Convert to permanent user later:

```tsx
const { data, error } = await supabase.auth.updateUser({
  email: 'user@example.com',
  password: 'new-password',
})
```

## Common Patterns

### Protected Route (Server Component)

```tsx
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

### Auth State Listener (Client Component)

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export function AuthListener() {
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user)
        }
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return null
}
```

## Security Checklist

- [ ] Enable RLS on all tables
- [ ] Use `getUser()` (not `getSession()`) on server
- [ ] Never expose service role key to client
- [ ] Validate user input before updating metadata
- [ ] Set up email confirmation for new signups
- [ ] Configure redirect URLs in dashboard (prevent open redirects)
- [ ] Use HTTPS in production
- [ ] Implement CSRF protection for forms

## Why We Chose Supabase

1. **Full-stack platform** - Auth + Database + Storage + Realtime in one place
2. **Open source** - Not locked into proprietary system, can self-host
3. **Postgres-native** - Full control of user data and schemas
4. **Multiple auth methods** - Password, OAuth, magic links, phone, Web3
5. **Row Level Security** - Database-level authorization built-in
6. **Great DX** - Excellent docs, TypeScript support, active community
7. **Next.js integration** - First-class SSR/App Router support

## Troubleshooting

### "Invalid JWT" errors
- Token expired → Call `refreshSession()` or re-authenticate
- Check that URL and keys match between env and dashboard

### RLS blocks all queries
- Verify policies are created correctly
- Check `auth.uid()` matches your user_id column
- Test with service role key to bypass RLS (dev only)

### OAuth redirect not working
- Add redirect URL to dashboard: Authentication → URL Configuration
- Ensure callback route exists (`/auth/callback`)
- Check provider credentials are correct

### Session not persisting
- Using server client in client component (wrong import)
- Cookies not being set (check domain/secure flags)
- Using `getSession()` instead of `getUser()`

## Project-Specific Notes

- We will use **OAuth (Google/GitHub)** for primary auth
- **Email/Password** as fallback option
- **Anonymous users** for demo/trial experience
- Store user preferences in `user_metadata`
- Use RLS to protect watch party data

---

**Last Updated:** 2025-01-22
**Supabase Version:** Latest (check package.json)

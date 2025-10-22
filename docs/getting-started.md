# Getting Started

## Project Overview

**Caught Up Yet** is a spoiler-free watch party app that helps friends and family watch games together at their own pace without ruining the excitement.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: React Icons (Lucide)
- **Package Manager**: pnpm

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Run Production Build
```bash
pnpm start
```

### Lint Code
```bash
pnpm lint
```

## Key Files

- `claude.md` - AI development rules and guidelines
- `constants/site.ts` - Site configuration (name, email, tagline, developer info)
- `components/ui/Button.tsx` - Centralized button component
- `app/layout.tsx` - Root layout with Header/Footer

## Environment Setup

No environment variables required yet. When OAuth is added, create a `.env.local` file:

```bash
# Future OAuth variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Design System

### Colors
- Primary: Blue (#2563eb)
- Secondary: Gray (#1f2937)
- Background: White (#ffffff)
- Text: Gray-900 (#111827)

### Typography
- Headings: Geist Sans (font-bold)
- Body: Geist Sans (font-normal)
- Code: Geist Mono

## Adding New Features

1. Create components in appropriate folders (`ui/` or `layout/`)
2. Add constants to `/constants` if needed
3. Update documentation in `/docs`
4. Follow the rules in `claude.md`
5. Test on mobile and desktop

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)

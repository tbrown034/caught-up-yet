# Claude AI Development Rules

## Code Style & Standards

### Icons
- **NEVER use emojis in production code**
- Use [Heroicons](https://heroicons.com/) for all UI elements
- Import from `@heroicons/react/24/outline` for outline style or `@heroicons/react/24/solid` for filled
- Keep icon sizes consistent (typically `w-4 h-4`, `w-5 h-5`, or `w-6 h-6`)

```tsx
// Correct usage
import { UserGroupIcon, CheckIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

<UserGroupIcon className="w-5 h-5" />
```

### Component Organization
```
components/
  layout/     # Structural components (Header, Footer, HeaderNav, etc.)
  ui/         # Reusable design system (Button, Input, Card, Badge, Modal, etc.)
  home/       # Homepage-specific components (AnimatedHero, HeroCTA)
  games/      # Games page components (GameCard, DateNavigation, SportTabs)
  rooms/      # Watch party room components (BoxScorePosition, ShareMenu)
  dashboard/  # Dashboard components (RoomCard)
  providers/  # Context providers (ThemeProvider)
```

### UI Primitives (`components/ui/`)
The app has a standardized UI component library:
- `Button` - Primary, secondary, ghost variants with sizes
- `Badge` - Status tags (default, live, success, warning, error, sport)
- `Card` - Container with CardHeader, CardBody, CardFooter
- `Input` - Form inputs with label, error, hint states
- `Modal` - Dialog with ModalFooter
- `NavLink` - Navigation links with active state
- `ThemeToggle` - Light/dark mode toggle

Import via barrel: `import { Button, Badge, Card } from "@/components/ui";`

### Naming Conventions
- Components: PascalCase (e.g., `BrandIcon.tsx`)
- Utilities: camelCase (e.g., `getCurrentYear`)
- Constants: SCREAMING_SNAKE_CASE in objects (e.g., `SITE_CONFIG`)
- Folders: kebab-case or lowercase (e.g., `ui/`, `layout/`)

### File Structure
- One component per file
- Co-locate related files when possible
- Keep constants centralized in `/constants`
- Keep utilities centralized in `/lib`

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Icons**: Heroicons (`@heroicons/react`)
- **Animation**: Motion (`motion/react`)
- **Auth/DB**: Supabase
- **Sports Data**: ESPN API

## Dark Mode
The app supports light/dark mode via `ThemeProvider`:
- Uses Tailwind's `dark:` variant
- Persists to localStorage
- Respects system preference with "system" option
- Toggle in header via `ThemeToggle` component

```tsx
// Add dark mode variants to components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

## Constants Management
- Use separate files by domain in `/constants`:
  - `site.ts` - Site metadata, contact info
  - `api.ts` - API endpoints (when added)
  - `routes.ts` - Route paths (when needed)
- Use `as const` for type safety on constant objects

## UI/UX Guidelines
- Use the centralized Button component with variants (primary, secondary, ghost)
- Maintain consistent spacing and color schemes
- Follow mobile-first responsive design
- All interactive elements must have hover and focus states
- Support dark mode for all new components

## Accessibility
- All buttons must have focus rings
- Use semantic HTML
- Maintain proper heading hierarchy
- Include aria-labels when necessary

## Git & Version Control
- Write clear, concise commit messages
- Follow conventional commits when possible

## Design System
- Primary color: Blue (#2563eb / `blue-600`)
- Secondary: Gray/Slate (#1f2937 / `gray-800`)
- Dark mode background: `gray-950`
- All design tokens should eventually be centralized

## Project-Specific Rules
- Email: `trevorbrown.web@gmail.com`
- Developer: Trevor Brown
- Keep It Simple, Stupid (KISS principle)
- No unnecessary abstractions
- No corporate fluff or AI-sounding copy

## AI Assistant Rules
1. **Make fewer assumptions, especially with critical data** - Don't construct URLs, keys, or IDs. Ask for them directly from the user.
2. **Ask for clarification when not sure** - If missing information, stop and ask rather than deriving or guessing.
3. **Own up to mistakes** - Be direct about errors and their real causes. No vague explanations.
4. **High confidence threshold before moving forward** - Only recommend solutions with high confidence they will work. If uncertain, say so explicitly.
5. **Connect to documentation when unsure** - Link to official docs rather than guessing implementation details.
6. **NEVER push to git or create commits** - Only provide advice. Let the user handle all git operations.

---

## Documentation

All documentation is in `/docs`:
- Project docs: `/docs/*.md` (getting-started, components, folder-structure)
- External library references: `/docs/references/`

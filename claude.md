# Claude AI Development Rules

## Code Style & Standards

### Icons
- **NEVER use emojis in production code**
- Use [Lucide React](https://lucide.dev/) icons for all UI elements
- Only deviate from Lucide when absolutely necessary (e.g., brand-specific icons)
- Keep icon sizes consistent across the app
- **See `/docs/references/lucide.md` for complete usage guide**

### Component Organization
```
components/
  layout/     # Structural components (Header, Footer, Sidebar)
  ui/         # Reusable design system (Button, Input, Card, etc.)
```

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

## Accessibility
- All buttons must have focus rings
- Use semantic HTML
- Maintain proper heading hierarchy
- Include aria-labels when necessary

## Git & Version Control
- Write clear, concise commit messages
- Follow conventional commits when possible

## Design System
- Primary color: Blue (#2563eb)
- Secondary: Gray/Slate (#1f2937)
- All design tokens should eventually be centralized

## Project-Specific Rules
- Email: `trevorbrown.web@gmail.com`
- Developer: Trevor Brown
- Keep It Simple, Stupid (KISS principle)
- No unnecessary abstractions

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
- External library references: `/docs/references/` (lucide, etc.)

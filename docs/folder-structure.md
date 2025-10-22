# Folder Structure

```
caught-up-yet/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   └── icon.svg           # Favicon
│
├── components/
│   ├── layout/            # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       └── BrandIcon.tsx
│
├── constants/             # App-wide constants
│   └── site.ts           # Site config, metadata, contact info
│
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions
│
├── docs/                  # Documentation
│   ├── README.md
│   ├── components.md
│   ├── folder-structure.md
│   ├── getting-started.md
│   └── references/       # External library quick-refs
│       ├── README.md
│       └── lucide.md
│
├── claude.md              # AI development rules
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Directory Purposes

### `/app`
Next.js 15 App Router pages and layouts. Each folder represents a route.

### `/components`
All React components, organized by type:
- `layout/` - Structural components (Header, Footer, Sidebar)
- `ui/` - Design system primitives (Button, Input, Card, etc.)

### `/constants`
Centralized configuration and constants, organized by domain.

### `/lib`
Utility functions and helper modules.

### `/docs`
Project documentation for developers.

## Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `BrandIcon.tsx`)
- **Utilities**: camelCase (e.g., `getCurrentYear.ts`)
- **Pages**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Folders**: lowercase or kebab-case (e.g., `ui/`, `layout/`)
- **Constants files**: lowercase (e.g., `site.ts`, `api.ts`)

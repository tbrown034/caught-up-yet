# Component Documentation

## UI Components

### Button
Location: `components/ui/Button.tsx`

Reusable button component with multiple variants and sizes.

**Variants:**
- `primary` - Blue background, white text (main CTAs)
- `secondary` - Dark gray background, white text (secondary actions)
- `ghost` - White background with border (tertiary actions)

**Sizes:**
- `sm` - Small (navigation, inline actions)
- `md` - Medium (default)
- `lg` - Large (hero sections, primary CTAs)

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  href?: string        // Use with asLink
  asLink?: boolean     // Renders as <a> tag instead of <button>
  className?: string   // Additional classes
  ...HTMLButtonAttributes
}
```

**Usage:**
```tsx
import Button from '@/components/ui/Button'

// As button
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// As link
<Button variant="secondary" href="/about" asLink>
  Learn More
</Button>
```

### BrandIcon
Location: `components/ui/BrandIcon.tsx`

The checkmark circle icon used for branding across the app.

**Props:**
```typescript
interface BrandIconProps {
  size?: number        // Default: 32
  className?: string
}
```

**Usage:**
```tsx
import BrandIcon from '@/components/ui/BrandIcon'

<BrandIcon size={40} className="text-blue-600" />
```

## Layout Components

### Header
Location: `components/layout/Header.tsx`

Global navigation header with logo, nav links, and sign-in button.

### Footer
Location: `components/layout/Footer.tsx`

Global footer with site info and navigation links.

## Future Components
- Input
- Card
- Modal
- Badge
- Dropdown

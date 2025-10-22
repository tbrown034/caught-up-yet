# Lucide React

**Package:** `lucide-react`
**Official Docs:** https://lucide.dev/guide/packages/lucide-react

## Installation

```bash
# pnpm (preferred)
pnpm add lucide-react

# npm
npm install lucide-react

# yarn
yarn add lucide-react
```

## Basic Usage

```tsx
import { Camera } from "lucide-react";

const Example = () => (
  <Camera color="red" size={48} />
);

export default Example;
```

### Key Points
- Each icon is a React component rendering an inline SVG
- **Fully tree-shakable**: only imported icons are included in the bundle
- Always import specific icons, never use barrel imports

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `24` | Icon size in pixels |
| `color` | `string` | `"currentColor"` | Stroke/fill color, defaults to the current text color |
| `strokeWidth` | `number` | `2` | Line/stroke thickness |
| `absoluteStrokeWidth` | `boolean` | `false` | If true, stroke width stays the same regardless of size scaling |

## Examples

### With Tailwind CSS

```tsx
import { Home, User, Settings } from "lucide-react";

export default function Nav() {
  return (
    <nav className="flex gap-4">
      {/* Icons inherit text color from Tailwind */}
      <Home className="text-blue-600" size={24} />
      <User className="text-gray-700 hover:text-gray-900" size={24} />
      <Settings className="text-red-500" size={20} />
    </nav>
  );
}
```

### Custom Sizing

```tsx
import { Heart } from "lucide-react";

<Heart size={16} />   {/* Small */}
<Heart size={24} />   {/* Default */}
<Heart size={48} />   {/* Large */}
```

### Custom Stroke Width

```tsx
import { Star } from "lucide-react";

<Star strokeWidth={1} />   {/* Thin */}
<Star strokeWidth={2} />   {/* Default */}
<Star strokeWidth={3} />   {/* Bold */}
```

## Best Practices

### ✅ DO
- Import only the icons you need
- Use Tailwind utilities for styling (`className="text-blue-600"`)
- Use arrow-function components
- Let icons inherit `currentColor` when possible

```tsx
import { Check, X } from "lucide-react";

const StatusIcon = ({ isSuccess }: { isSuccess: boolean }) => (
  <div className={isSuccess ? "text-green-600" : "text-red-600"}>
    {isSuccess ? <Check size={20} /> : <X size={20} />}
  </div>
);
```

### ❌ DON'T
- Don't use `DynamicIcon` (imports all icons, kills bundle size)
- Don't use inline styles when Tailwind works
- Don't hardcode colors when you can use design tokens

```tsx
// ❌ Bad
import { icons } from "lucide-react";
const DynamicIcon = icons["Home"]; // Imports EVERYTHING

// ✅ Good
import { Home } from "lucide-react";
```

## Common Icons

### Navigation
```tsx
import { Home, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
```

### Actions
```tsx
import { Plus, Edit, Trash2, Save, Download, Upload } from "lucide-react";
```

### Social
```tsx
import { Mail, Phone, Github, Linkedin, Twitter } from "lucide-react";
```

### UI Elements
```tsx
import { Check, X, AlertCircle, Info, Search, Bell } from "lucide-react";
```

## Advanced: Custom Icons

If you need icons outside the main set, use `@lucide/lab` + the `Icon` component:

```bash
pnpm add @lucide/lab
```

```tsx
import { Icon } from "lucide-react";
import { myCustomIcon } from "@lucide/lab";

<Icon iconNode={myCustomIcon} />
```

## Why We Chose Lucide

1. **Modern & Performant** - Strong tree-shaking support reduces bundle size
2. **Tailwind Integration** - Icons inherit `currentColor`, perfect for utility-first CSS
3. **Simple API** - Just `size` and `color` props for consistent UI
4. **Active Maintenance** - Open-source with strong community support
5. **Comprehensive** - 1000+ icons covering most use cases

## Project Conventions

- Always use arrow-function components
- Import only needed icons (never barrel imports)
- Style icons via Tailwind utility classes
- Default size: `24px` (or `size={24}`)
- Use semantic icon names (e.g., `Trash2` instead of `Trash`)

## Troubleshooting

### Icons not showing?
- Check that you imported the icon correctly
- Ensure parent has proper dimensions
- Verify no CSS is hiding SVGs

### Bundle size too large?
- Verify you're not using `DynamicIcon`
- Check that you're importing specific icons, not the whole package
- Use tree-shaking compatible bundlers (Next.js does this by default)

---

**Last Updated:** 2025-01-22
**Lucide Version:** Latest (check package.json)

# Font Configuration

**Location:** `lib/fonts.ts`

All fonts are configured in a centralized file and imported into the root layout.

## Active Fonts

### Plus Jakarta Sans
**Purpose:** Primary body font
**Used for:** Body text, paragraphs, navigation, buttons, all UI text
**Why:** Warm, friendly, highly readable geometric sans-serif - perfect for a social/family app
**Variable:** `--font-sans`
**Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Usage in code:**
```tsx
// Automatically applied to all body text
<p>This uses Plus Jakarta Sans</p>

// Or manually via Tailwind
<span className="font-sans">Explicit body font</span>

// With specific weights
<p className="font-medium">Medium weight (500)</p>
<p className="font-semibold">Semibold (600)</p>
```

### Urbanist
**Purpose:** Headings font
**Used for:** All headings (h1-h6), hero text, section titles, CTAs
**Why:** Contemporary, bold, geometric sans-serif with strong personality for sports/action
**Variable:** `--font-heading`
**Weights:** 600 (semibold), 700 (bold), 800 (extrabold)

**Usage in code:**
```tsx
// Automatically applied to all headings (defaults to 700)
<h1>This uses Urbanist Bold</h1>

// Or manually via CSS variable
<div style={{ fontFamily: 'var(--font-heading)' }}>Custom heading</div>

// With specific weights
<h1 className="font-extrabold">Extrabold heading (800)</h1>
```

### JetBrains Mono
**Purpose:** Monospace font
**Used for:** Code snippets, technical text, game IDs
**Why:** Designed for developers, excellent readability
**Variable:** `--font-mono`
**Weights:** 400 (regular only - optimized for minimal usage)

**Usage in code:**
```tsx
// Automatically applied to code elements
<code>const foo = 'bar';</code>
<pre>Code block here</pre>

// Or manually via Tailwind
<span className="font-mono">Monospace text</span>
```

## Font Loading Strategy

All fonts use `display: "swap"`:
- Shows fallback font immediately
- Swaps to web font when loaded
- Prevents flash of invisible text (FOIT)
- Better perceived performance

## How Fonts Are Applied

**Automatic (via globals.css):**
```css
body → Plus Jakarta Sans
h1, h2, h3, h4, h5, h6 → Urbanist (bold by default)
code, pre, kbd, samp → JetBrains Mono
```

**Manual (via Tailwind):**
```tsx
<p className="font-sans">Plus Jakarta Sans</p>
<p className="font-mono">JetBrains Mono</p>
<p style={{ fontFamily: 'var(--font-heading)' }}>Urbanist</p>
```

## Adding New Fonts

1. Import font in `lib/fonts.ts`:
```tsx
import { YourFont } from "next/font/google";

export const yourFont = YourFont({
  subsets: ["latin"],
  variable: "--font-your-font",
  display: "swap",
});
```

2. Add to layout.tsx:
```tsx
import { plusJakartaSans, urbanist, jetbrainsMono, yourFont } from "@/lib/fonts";

<body className={`${plusJakartaSans.variable} ${urbanist.variable} ${jetbrainsMono.variable} ${yourFont.variable}`}>
```

3. (Optional) Add to globals.css for automatic application

## Font Optimization

Next.js automatically:
- Self-hosts fonts (no external requests)
- Optimizes font files
- Preloads critical fonts
- Generates font-face CSS

## Performance Notes

- ✅ All fonts are actively used (no dead weight)
- ✅ Specific font weights loaded (optimized file sizes)
- ✅ `display: "swap"` improves perceived performance
- Total font payload: ~120KB (optimized from previous ~200KB with unused Poppins)

## Current Status Summary

| Font | Status | Weights Loaded | Usage | Performance |
|------|--------|----------------|-------|-------------|
| Plus Jakarta Sans | ✅ Active | 400, 500, 600, 700 | Body text, UI | Optimized |
| Urbanist | ✅ Active | 600, 700, 800 | Headings, CTAs | Optimized |
| JetBrains Mono | ✅ Active | 400 only | Code blocks | Minimal |

## Why These Fonts?

**Plus Jakarta Sans** - Warmer and more inviting than Inter, perfect for a social/family app. Great readability with a friendly personality.

**Urbanist** - Contemporary and bold, ideal for sports content. Has more impact than Outfit while maintaining excellent readability.

**JetBrains Mono** - Industry standard for code, excellent letter distinction.

**Removed:** Inter, Outfit (replaced with better fits), Poppins (unused dead weight)

---

**Last Updated:** 2025-01-16

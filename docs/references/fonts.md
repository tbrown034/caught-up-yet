# Font Configuration

**Location:** `lib/fonts.ts`

All fonts are configured in a centralized file and imported into the root layout.

## Active Fonts (Currently Used)

### Inter
**Purpose:** Primary body font
**Used for:** Body text, paragraphs, navigation, buttons, all UI text
**Why:** Clean, highly readable, industry standard for modern web apps
**Variable:** `--font-inter`

**Usage in code:**
```tsx
// Automatically applied to all body text
<p>This uses Inter</p>

// Or manually via Tailwind
<span className="font-sans">Explicit Inter</span>
```

### Outfit
**Purpose:** Headings font
**Used for:** All headings (h1-h6), hero text, section titles
**Why:** Friendly, modern, geometric sans-serif with personality
**Variable:** `--font-outfit`

**Usage in code:**
```tsx
// Automatically applied to all headings
<h1>This uses Outfit</h1>

// Or manually via CSS variable
<div style={{ fontFamily: 'var(--font-outfit)' }}>Custom heading</div>
```

### JetBrains Mono
**Purpose:** Monospace font
**Used for:** Code snippets, technical text, terminal-style content
**Why:** Designed for developers, excellent readability
**Variable:** `--font-mono`

**Usage in code:**
```tsx
// Automatically applied to code elements
<code>const foo = 'bar';</code>
<pre>Code block here</pre>

// Or manually via Tailwind
<span className="font-mono">Monospace text</span>
```

## Available Fonts (Loaded but Not Active)

### Poppins
**Purpose:** Alternative display font
**Used for:** Special sections, marketing CTAs, playful content
**Why:** Rounded, playful, great for emphasis
**Variable:** `--font-poppins`
**Status:** ⚠️ Loaded but not currently used in CSS

**To use:**
```tsx
// Manual usage via CSS variable
<h2 style={{ fontFamily: 'var(--font-poppins)' }}>
  Special Heading
</h2>
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
body → Inter
h1, h2, h3, h4, h5, h6 → Outfit
code, pre, kbd, samp → JetBrains Mono
```

**Manual (via Tailwind):**
```tsx
<p className="font-sans">Inter</p>
<p className="font-mono">JetBrains Mono</p>
<p style={{ fontFamily: 'var(--font-outfit)' }}>Outfit</p>
<p style={{ fontFamily: 'var(--font-poppins)' }}>Poppins</p>
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
import { inter, outfit, jetbrainsMono, yourFont } from "@/lib/fonts";

<body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} ${yourFont.variable}`}>
```

3. (Optional) Add to globals.css for automatic application

## Font Optimization

Next.js automatically:
- Self-hosts fonts (no external requests)
- Optimizes font files
- Preloads critical fonts
- Generates font-face CSS

## Performance Notes

- Only load fonts you actively use
- Remove Poppins if not needed (currently loaded but unused)
- Each font adds ~50-100KB to initial page load
- `display: "swap"` improves perceived performance

## Current Status Summary

| Font | Status | Usage | Should Remove? |
|------|--------|-------|----------------|
| Inter | ✅ Active | Body text | No |
| Outfit | ✅ Active | Headings | No |
| JetBrains Mono | ✅ Active | Code blocks | No |
| Poppins | ⚠️ Loaded but unused | None | Consider removing if not needed |

---

**Last Updated:** 2025-01-22

import { Inter, Outfit, JetBrains_Mono, Poppins } from "next/font/google";

/**
 * Inter - Primary body font
 * Clean, highly readable, excellent for UI text
 * Used for: Body text, paragraphs, navigation, buttons
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Outfit - Headings font
 * Friendly, modern, geometric sans-serif
 * Used for: All headings (h1-h6), hero text, section titles
 */
export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

/**
 * JetBrains Mono - Monospace font
 * Used for: Code snippets, technical text (if needed)
 * Currently not actively used, but available
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Poppins - Alternative display font
 * Rounded, playful, great for marketing/CTAs
 * Currently not actively used, but available for special sections
 */
export const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

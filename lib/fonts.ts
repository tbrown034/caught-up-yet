import { Plus_Jakarta_Sans, Urbanist, JetBrains_Mono } from "next/font/google";

/**
 * Plus Jakarta Sans - Primary body font
 * Warm, friendly, highly readable geometric sans-serif
 * Used for: Body text, paragraphs, navigation, buttons, UI elements
 * Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Urbanist - Headings font
 * Contemporary, bold, geometric sans-serif with personality
 * Used for: All headings (h1-h6), hero text, section titles, CTAs
 * Weights: 600 (semibold), 700 (bold), 800 (extrabold)
 */
export const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

/**
 * JetBrains Mono - Monospace font
 * Used for: Code snippets, technical text, game IDs
 * Weight: 400 (regular) - minimal usage, keep it light
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

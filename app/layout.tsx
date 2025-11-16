import type { Metadata, Viewport } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { inter, outfit, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Caught Up Yet? - Watch Sports Together, No Spoilers",
    template: "%s | Caught Up Yet?"
  },
  description: "Share real-time reactions with friends and family while watching sports at different times. Messages reveal only when you reach that moment—just like watching together on the couch. Spoiler-free watch parties for NFL, NBA, MLB, and NHL.",
  keywords: [
    "sports watch party",
    "spoiler-free sports",
    "watch sports together",
    "NFL watch party",
    "NBA watch party",
    "MLB watch party",
    "NHL watch party",
    "sports chat",
    "delayed sports viewing",
    "DVR sports",
    "sports streaming",
    "no spoilers",
    "family sports watching",
    "ESPN live scores"
  ],
  authors: [{ name: "Caught Up Yet Team" }],
  creator: "Caught Up Yet",
  publisher: "Caught Up Yet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Caught Up Yet?",
    title: "Caught Up Yet? - Watch Sports Together, No Spoilers",
    description: "Share real-time reactions with friends and family while watching sports at different times. Messages reveal only when you reach that moment—no spoilers!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Caught Up Yet? - Spoiler-Free Sports Watch Parties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Caught Up Yet? - Watch Sports Together, No Spoilers",
    description: "Share real-time reactions with friends and family while watching sports at different times. No spoilers!",
    images: ["/twitter-image.png"],
    creator: "@caughtupyet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

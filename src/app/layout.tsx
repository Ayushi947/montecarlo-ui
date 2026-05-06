import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

/**
 * Inter font - Primary font for Simulix
 * Used for all text content (headers, body, data)
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * JetBrains Mono - Monospace font for code/numbers
 * Used for financial data, code snippets, and technical content
 */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Outfit - Geometric sans-serif for headings
 * Used for auth page titles, hero headings, and brand text
 * Matches Stitch UI: font-header theme
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Site Metadata
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://simulix.app"
  ),
  title: {
    default: "Simulix | Institutional-Grade Monte Carlo Projections",
    template: "%s | Simulix",
  },
  description:
    "GPU-accelerated Monte Carlo simulations for personal wealth management. Institutional-grade financial projections made accessible.",
  keywords: [
    "monte carlo simulation",
    "financial planning",
    "portfolio analysis",
    "wealth management",
    "investment projections",
    "retirement planning",
  ],
  authors: [{ name: "Simulix" }],
  creator: "Simulix",
  publisher: "Simulix Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Simulix",
    title: "Simulix | Institutional-Grade Monte Carlo Projections",
    description:
      "GPU-accelerated Monte Carlo simulations for personal wealth management.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulix | Monte Carlo Projections",
    description:
      "Institutional-grade financial simulations for everyone.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
};

/**
 * Viewport Configuration
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Root Layout
 *
 * Wraps all pages with:
 * - Font variables
 * - Theme provider (dark/light/system)
 * - React Query provider
 * - Toast notifications
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

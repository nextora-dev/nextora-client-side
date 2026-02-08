import type { Metadata, Viewport } from "next"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeContextProvider } from '@/contexts/ThemeContext';
import "./globals.css";

/**
 * PWA Metadata Configuration
 * - Enables installability on Android, iOS, and Desktop
 * - Configures app appearance when launched from home screen
 * - Provides social sharing metadata
 */
export const metadata: Metadata = {
  title: {
    default: "Nextora LMS",
    template: "%s | Nextora LMS",
  },
  description: "Comprehensive Learning Management System for academic institutions",
  applicationName: "Nextora LMS",
  keywords: ["LMS", "Learning Management System", "Education", "E-Learning", "Academic", "Nextora"],
  authors: [{ name: "Nextora Team" }],
  creator: "Nextora",
  publisher: "Nextora",
  // PWA manifest link
  manifest: "/manifest.json",
  // Apple-specific PWA configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nextora LMS",
  },
  // Format detection for mobile devices
  formatDetection: {
    telephone: false,
  },
  // Open Graph for social sharing
  openGraph: {
    type: "website",
    siteName: "Nextora LMS",
    title: "Nextora LMS",
    description: "Comprehensive Learning Management System",
    images: ["/icons/icon-512x512.png"],
  },
  // Twitter Card
  twitter: {
    card: "summary",
    title: "Nextora LMS",
    description: "Comprehensive Learning Management System",
    images: ["/icons/icon-512x512.png"],
  },
  // Icons configuration for various platforms
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  // Other metadata
  category: "education",
};

/**
 * Viewport Configuration
 * - Separated from metadata as per Next.js 14+ best practices
 * - themeColor controls browser chrome color on mobile (NextOra blue)
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6B9FFF" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Additional PWA meta tags for iOS Safari */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nextora LMS" />

        {/* Apple touch icons for iOS home screen */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />

        {/* Mask icon for Safari pinned tab */}
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#6B9FFF" />

        {/* MS Tile configuration */}
        <meta name="msapplication-TileColor" content="#6B9FFF" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeContextProvider>
            {children}
          </ThemeContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

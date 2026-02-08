import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

/**
 * PWA Configuration
 * - Disabled in development to prevent service worker interference with HMR
 * - Uses Workbox under the hood for production-grade caching
 * - skipWaiting ensures immediate activation of new service workers
 */
const withPWA = withPWAInit({
  dest: "public",
  // Disable PWA in development mode to avoid caching issues during development
  disable: process.env.NODE_ENV === "development",
  // Register service worker immediately
  register: true,
  // Skip waiting for active clients to close before activating new SW
  skipWaiting: true,
  // Disable workbox logs in production for cleaner console
  disableDevLogs: true,
  // Scope of the service worker
  scope: "/",
  // Service worker file name
  sw: "sw.js",
  // Fallback pages for offline support
  fallbacks: {
    document: "/offline",
  },
  // Build exclusions - prevent caching of sensitive routes and dynamic content
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
  ],
  // Runtime caching configuration - CRITICAL for proper cache management
  runtimeCaching: [
    // Cache First - Static assets (images, fonts, etc.)
    // These rarely change and should be served from cache immediately
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-font-assets",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-image-assets",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Stale While Revalidate - JS/CSS bundles
    // Serve cached version immediately, update cache in background
    {
      urlPattern: /\/_next\/static.+\.js$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static-js-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-style-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    // Network First - API GET requests (except auth endpoints)
    // Always try network first to get fresh data, fall back to cache
    {
      urlPattern: ({ url, request }: { url: URL; request: Request }) => {
        // Only cache GET requests
        if (request.method !== "GET") return false;
        // Exclude authentication endpoints
        if (url.pathname.includes("/api/auth")) return false;
        if (url.pathname.includes("/api/login")) return false;
        if (url.pathname.includes("/api/logout")) return false;
        if (url.pathname.includes("/api/refresh")) return false;
        if (url.pathname.includes("/api/token")) return false;
        // Cache other API GET requests
        return url.pathname.startsWith("/api/");
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10, // Fallback to cache after 10s timeout
        cacheableResponse: {
          statuses: [0, 200], // Cache successful responses only
        },
      },
    },
    // Network Only - Authentication endpoints
    // NEVER cache sensitive auth data
    {
      urlPattern: /\/api\/(auth|login|logout|refresh|token).*/i,
      handler: "NetworkOnly",
      options: {
        backgroundSync: {
          name: "auth-queue",
          options: {
            maxRetentionTime: 60, // Retry for max 1 minute
          },
        },
      },
    },
    // Network First - HTML pages
    // Ensures users always get fresh content with offline fallback
    {
      urlPattern: ({ request }: { request: Request }) =>
        request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Stale While Revalidate - Other requests
    {
      urlPattern: /.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "others-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  // Enable React Strict Mode for development
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Headers for PWA and security
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);

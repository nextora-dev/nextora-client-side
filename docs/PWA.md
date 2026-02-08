# PWA Configuration Guide - Nextora LMS

## Overview

This document outlines the Progressive Web App (PWA) implementation for Nextora LMS, following enterprise-level best practices.

## Architecture

```
public/
├── manifest.json          # Web App Manifest
├── sw.js                  # Generated Service Worker (auto-generated on build)
├── workbox-*.js          # Workbox runtime (auto-generated on build)
├── fallback-*.js         # Offline fallback handler (auto-generated on build)
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png   # Required for Android
    ├── icon-384x384.png
    ├── icon-512x512.png   # Required for Android & iOS
    ├── screenshot-wide.png
    └── screenshot-narrow.png

app/
├── layout.tsx            # PWA metadata & viewport config
└── offline/
    └── page.tsx          # Offline fallback page

hooks/
└── usePWA.ts            # PWA hook for install prompts & online status

components/pwa/
├── index.ts
└── PWAComponents.tsx     # Install banner, update notification, offline indicator

types/
└── next-pwa.d.ts        # TypeScript declarations for next-pwa
```

## Caching Strategies

### 1. Cache First (Static Assets)
- **Use Case**: Images, fonts, static files
- **Why**: These rarely change; serve instantly from cache
- **TTL**: 30 days for images, 1 year for fonts

### 2. Stale While Revalidate (JS/CSS)
- **Use Case**: JavaScript bundles, stylesheets
- **Why**: Serve cached version immediately, update in background
- **TTL**: 7 days

### 3. Network First (API & Pages)
- **Use Case**: API GET requests, HTML pages
- **Why**: Always try to get fresh data, fallback to cache if offline
- **TTL**: 1 hour for API, 24 hours for pages
- **Timeout**: 10 seconds before falling back to cache

### 4. Network Only (Authentication)
- **Use Case**: `/api/auth/*`, `/api/login`, `/api/logout`, `/api/token`
- **Why**: NEVER cache sensitive authentication data

## Security Considerations

1. **Auth Endpoints Excluded**: All authentication-related API endpoints are explicitly excluded from caching
2. **POST Requests Not Cached**: Only GET requests are cached
3. **HTTPS Required**: Service workers only work on HTTPS (and localhost for development)
4. **Token Storage**: JWTs stored in httpOnly cookies, not cached by service worker

## Scripts

```bash
# Development (PWA disabled)
npm run dev

# Production build (generates service worker)
npm run build

# Generate PWA icons
npm run generate:icons

# Start production server
npm run start
```

## Manifest Configuration

The manifest is configured for:
- **Standalone display mode**: App runs like native app
- **Portrait orientation**: Optimized for mobile
- **Theme color**: Matches your brand (#1976d2)
- **App shortcuts**: Quick access to Dashboard and Login

## iOS Support

iOS Safari has limited PWA support. We handle this with:
- `apple-mobile-web-app-capable` meta tag
- `apple-mobile-web-app-status-bar-style` meta tag
- Apple touch icons for home screen
- Mask icon for Safari pinned tab

## Using PWA Components

### Install Banner
```tsx
import { PWAInstallBanner, PWAUpdateNotification, OfflineIndicator } from '@/components/pwa';

function App() {
  return (
    <>
      <OfflineIndicator />
      <PWAUpdateNotification />
      {/* Your app content */}
      <PWAInstallBanner />
    </>
  );
}
```

### usePWA Hook
```tsx
import { usePWA } from '@/hooks';

function MyComponent() {
  const {
    isInstallable,    // Can show install prompt
    isInstalled,      // App is installed
    isStandalone,     // Running as standalone app
    isOnline,         // Online status
    hasUpdate,        // New version available
    promptInstall,    // Trigger install prompt
    updateServiceWorker, // Update to new version
    checkForUpdates,  // Manually check for updates
  } = usePWA();

  return (
    <button 
      onClick={promptInstall}
      disabled={!isInstallable}
    >
      Install App
    </button>
  );
}
```

## Cache Invalidation on Deploy

The service worker automatically handles cache invalidation:
1. New deployments generate new JS chunk hashes
2. Service worker detects changes and pre-caches new assets
3. `skipWaiting: true` ensures immediate activation
4. Old caches are automatically cleaned up

## Lighthouse PWA Score

To achieve 100% PWA score:
1. ✅ Installable (manifest + service worker)
2. ✅ HTTPS required
3. ✅ Offline fallback page
4. ✅ Responsive design (viewport meta)
5. ✅ Theme color defined
6. ✅ Apple touch icon
7. ✅ Maskable icons

## Adding Firebase Cloud Messaging (FCM)

For push notifications, add FCM integration:

1. Install Firebase:
```bash
npm install firebase
```

2. Create `lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
```

3. Create `public/firebase-messaging-sw.js` for background notifications

4. Request notification permission and get FCM token

## Troubleshooting

### Service Worker Not Updating
1. Clear browser cache and service worker
2. Force refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Check DevTools > Application > Service Workers

### PWA Not Installable
1. Ensure HTTPS (required for production)
2. Check manifest.json is valid
3. Verify icons exist and are correct sizes
4. Check browser console for errors

### Caching Issues
1. Check Network tab for cached responses
2. Review Application > Cache Storage
3. Temporarily set `disable: true` in next.config.ts for debugging

## Vercel Deployment

The PWA is fully compatible with Vercel:
1. Service worker is generated during build
2. Headers are configured for proper caching
3. HTTPS is provided by Vercel automatically

No additional Vercel configuration needed.


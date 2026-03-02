/**
 * Firebase Messaging Service Worker
 *
 * This service worker handles background push notifications.
 * It must be placed in the public folder at the root level.
 */

// Import Firebase scripts - using latest stable version
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

/**
 * Firebase configuration - Nextora LMS
 */
const firebaseConfig = {
  apiKey: "AIzaSyDh1hKetSX_6JYMCp6B3R__W06_NnlYbyA",
  authDomain: "nextora-e4338.firebaseapp.com",
  projectId: "nextora-e4338",
  storageBucket: "nextora-e4338.firebasestorage.app",
  messagingSenderId: "1085514613403",
  appId: "1:1085514613403:web:c4ab0cbc04a4d7f74a3c3e"
};

// Track if Firebase is initialized
let firebaseInitialized = false;
let messaging = null;

// Only initialize if we have config
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    firebaseInitialized = true;
    console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Failed to initialize Firebase:', error);
  }
}

// Handle background messages from Firebase
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', JSON.stringify(payload, null, 2));

    // Extract notification data - prefer notification object, fallback to data
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Nextora LMS';
    const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new notification';

    const notificationOptions = {
      body: notificationBody,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      image: payload.notification?.image || payload.data?.imageUrl || undefined,
      tag: `nextora-${payload.data?.type || 'general'}-${Date.now()}`,
      renotify: true,
      data: {
        clickAction: payload.data?.click_action || payload.data?.clickAction || payload.fcmOptions?.link || '/',
        type: payload.data?.type || 'GENERAL',
        messageId: payload.messageId || Date.now().toString(),
        ...payload.data,
      },
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      requireInteraction: payload.data?.type === 'ALERT' || payload.data?.type === 'VOTING_ALERT' || payload.data?.type === 'KUPPI_SESSION' || payload.data?.type === 'KUPPI_REMINDER',
      vibrate: [200, 100, 200],
      silent: false,
    };

    console.log('[firebase-messaging-sw.js] Showing notification:', notificationTitle, notificationOptions);
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  console.log('[firebase-messaging-sw.js] Notification data:', event.notification.data);

  event.notification.close();

  // Handle action buttons
  if (event.action === 'dismiss') {
    console.log('[firebase-messaging-sw.js] User dismissed notification');
    return;
  }

  const clickAction = event.notification.data?.clickAction || '/';
  console.log('[firebase-messaging-sw.js] Click action URL:', clickAction);

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('[firebase-messaging-sw.js] Found clients:', clientList.length);

      // Check if app is already open
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && 'focus' in client) {
          console.log('[firebase-messaging-sw.js] Focusing existing client');
          return client.focus().then((focusedClient) => {
            // Navigate to the click action URL if different from current
            if (clickAction && clickAction !== '/' && clickAction !== client.url) {
              return focusedClient.navigate(clickAction);
            }
          });
        }
      }
      // Open new window if app is not open
      if (clients.openWindow) {
        console.log('[firebase-messaging-sw.js] Opening new window:', clickAction);
        return clients.openWindow(clickAction);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification?.data);
});

// Handle push event (fallback for when Firebase messaging doesn't handle it)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received');

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[firebase-messaging-sw.js] Push data:', JSON.stringify(data, null, 2));

      // Check if this is a data-only message (no notification payload from server)
      // Firebase onBackgroundMessage handles messages with notification payload
      // This handles data-only messages that Firebase might not process
      if (!data.notification && data.data) {
        const notificationTitle = data.data.title || 'Nextora LMS';
        const notificationOptions = {
          body: data.data.body || 'You have a new notification',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: `nextora-push-${Date.now()}`,
          renotify: true,
          data: {
            clickAction: data.data.click_action || data.data.clickAction || '/',
            type: data.data.type || 'GENERAL',
            ...data.data,
          },
          vibrate: [200, 100, 200],
        };

        console.log('[firebase-messaging-sw.js] Showing data-only notification:', notificationTitle);
        event.waitUntil(
          self.registration.showNotification(notificationTitle, notificationOptions)
        );
      }
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);

      // Fallback: try to show notification with raw text
      try {
        const text = event.data.text();
        if (text) {
          event.waitUntil(
            self.registration.showNotification('Nextora LMS', {
              body: text,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              tag: `nextora-fallback-${Date.now()}`,
            })
          );
        }
      } catch (e) {
        console.error('[firebase-messaging-sw.js] Fallback notification failed:', e);
      }
    }
  }
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  event.waitUntil(clients.claim());
});

console.log('[firebase-messaging-sw.js] Service worker loaded and ready');


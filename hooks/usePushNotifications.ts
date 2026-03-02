"use client";

/**
 * Push Notifications Hook
 *
 * Custom hook for managing push notification state and actions.
 * Handles permission requests, token management, and backend registration.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  getDeviceInfo,
  onForegroundMessage,
  initializeFirebase,
  type MessagePayload,
} from '@/lib/firebase';
import { pushNotificationApi } from '@/features/push-notifications/services';
import type {
  PushPermissionState,
  PushNotificationState,
  DisplayedNotification,
  NotificationType,
} from '@/types/push-notification.d';

// LocalStorage keys
const FCM_TOKEN_KEY = 'fcm_token';
const PUSH_REGISTERED_KEY = 'push_registered';

interface UsePushNotificationsOptions {
  onNotification?: (notification: DisplayedNotification) => void;
  autoRegister?: boolean;
}

interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;
  unregisterAllTokens: () => Promise<boolean>;
  checkStatus: () => Promise<boolean>;
  clearError: () => void;
  notifications: DisplayedNotification[];
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
}

export function usePushNotifications(
  options: UsePushNotificationsOptions = {}
): UsePushNotificationsReturn {
  const { onNotification, autoRegister = false } = options;

  // State
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<DisplayedNotification[]>([]);

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitialized = useRef(false);
  const registerTokenRef = useRef<(() => Promise<boolean>) | null>(null);

  /**
   * Initialize push notifications
   */
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initialize = async () => {
      // Check browser support
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (!supported) {
        setPermission('unsupported');
        return;
      }

      // Initialize Firebase
      initializeFirebase();

      // Check current permission
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission as PushPermissionState);

      // Check if token was previously registered
      const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
      const wasRegistered = localStorage.getItem(PUSH_REGISTERED_KEY) === 'true';

      if (storedToken) {
        setToken(storedToken);
      }

      // Validate stored registration with backend
      // If the backend no longer has our token, we need to re-register
      if (wasRegistered && currentPermission === 'granted') {
        try {
          const statusResponse = await pushNotificationApi.getStatus();
          if (statusResponse?.success && statusResponse.data?.enabled) {
            setIsRegistered(true);
            console.log('[Push Hook] Token validated with backend - still registered');
          } else {
            // Backend doesn't have our token anymore, need to re-register
            console.log('[Push Hook] Backend reports not registered - clearing stale state');
            setIsRegistered(false);
            localStorage.removeItem(PUSH_REGISTERED_KEY);
          }
        } catch {
          // Can't validate - assume stale and need re-registration
          console.log('[Push Hook] Could not validate token with backend - marking for re-registration');
          setIsRegistered(false);
          localStorage.removeItem(PUSH_REGISTERED_KEY);
        }
      } else if (wasRegistered) {
        // Permission lost but we thought we were registered
        setIsRegistered(false);
        localStorage.removeItem(PUSH_REGISTERED_KEY);
        localStorage.removeItem(FCM_TOKEN_KEY);
      }

      // Auto-register if enabled and permission granted
      if (autoRegister && currentPermission === 'granted') {
        // Defer to after component is mounted so state is settled
        setTimeout(() => {
          registerTokenRef.current?.();
        }, 500);
      }
    };

    initialize();
  }, [autoRegister]);

  /**
   * Set up foreground message listener
   */
  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    console.log('[Push Hook] Setting up foreground message listener');

    const unsubscribe = onForegroundMessage((payload: MessagePayload) => {
      console.log('[Push Hook] Foreground message received:', payload);

      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      const notificationType = (payload.data?.type as NotificationType) || 'GENERAL';

      const notification: DisplayedNotification = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        body,
        type: notificationType,
        timestamp: new Date(),
        read: false,
        clickAction: payload.data?.click_action || payload.data?.clickAction || payload.fcmOptions?.link,
        image: payload.notification?.image || payload.data?.imageUrl,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Show browser notification for foreground messages
      // This ensures users see the notification even when the app is in focus
      if (Notification.permission === 'granted') {
        try {
          const browserNotification = new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: `nextora-fg-${Date.now()}`,
            data: notification,
            requireInteraction: notificationType === 'ALERT' || notificationType === 'VOTING_ALERT' || notificationType === 'KUPPI_SESSION' || notificationType === 'KUPPI_REMINDER',
          });

          // Handle notification click
          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
            if (notification.clickAction) {
              window.location.href = notification.clickAction;
            }
          };
        } catch (e) {
          console.warn('[Push Hook] Could not show browser notification:', e);
        }
      }

      if (onNotification) {
        onNotification(notification);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      console.log('[Push Hook] Cleaning up foreground message listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isSupported, permission, onNotification]);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestNotificationPermission();
      setPermission(result as PushPermissionState);

      if (result === 'granted') {
        return true;
      } else if (result === 'denied') {
        setError('Notification permission was denied. Please enable it in browser settings.');
        return false;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  /**
   * Register FCM token with backend
   */
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get FCM token
      console.log('[Push Hook] Getting FCM token...');
      const fcmToken = await getFCMToken();

      if (!fcmToken) {
        setError('Failed to get notification token. Check Firebase configuration.');
        setIsLoading(false);
        return false;
      }

      console.log('[Push Hook] FCM token obtained:', fcmToken.substring(0, 20) + '...');


      // Get device info
      const { deviceInfo, deviceType } = getDeviceInfo();
      console.log('[Push Hook] Registering with backend...', { deviceInfo, deviceType });

      // Register with backend
      const response = await pushNotificationApi.registerToken({
        token: fcmToken,
        deviceInfo,
        deviceType,
      });

      console.log('[Push Hook] Backend response:', response);

      if (response && response.success) {
        setToken(fcmToken);
        setIsRegistered(true);
        localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
        localStorage.setItem(PUSH_REGISTERED_KEY, 'true');
        console.log('[Push Hook] Push token registered successfully');
        return true;
      } else {
        const errorMsg = response?.message || 'Failed to register token with backend';
        setError(errorMsg);
        console.error('[Push Hook] Registration failed:', errorMsg);
        return false;
      }
    } catch (err: unknown) {
      console.error('[Push Hook] Error during registration:', err);
      let errorMessage = 'Failed to register token';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle Axios error structure
        const axiosErr = err as { response?: { data?: { message?: string }, status?: number } };
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        } else if (axiosErr.response?.status) {
          errorMessage = `Server error: ${axiosErr.response.status}`;
        }
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, isRegistered, requestPermission]);

  // Keep ref in sync so deferred/auto-register always uses latest callback
  useEffect(() => {
    registerTokenRef.current = registerToken;
  }, [registerToken]);

  /**
   * Unregister current token (logout)
   */
  const unregisterToken = useCallback(async (): Promise<boolean> => {
    if (!token) {
      console.log('No token to unregister');
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await pushNotificationApi.removeToken(token);

      if (response.success) {
        setToken(null);
        setIsRegistered(false);
        localStorage.removeItem(FCM_TOKEN_KEY);
        localStorage.removeItem(PUSH_REGISTERED_KEY);
        console.log('Push token unregistered successfully');
        return true;
      } else {
        setError(response.message || 'Failed to unregister token');
        return false;
      }
    } catch (err) {
      // Even if API fails, clean up local state
      setToken(null);
      setIsRegistered(false);
      localStorage.removeItem(FCM_TOKEN_KEY);
      localStorage.removeItem(PUSH_REGISTERED_KEY);

      const errorMessage = err instanceof Error ? err.message : 'Failed to unregister token';
      console.warn('Error unregistering token:', errorMessage);
      return true; // Return true to allow logout to proceed
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Unregister all tokens (logout from all devices)
   */
  const unregisterAllTokens = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pushNotificationApi.removeAllTokens();

      if (response.success) {
        setToken(null);
        setIsRegistered(false);
        localStorage.removeItem(FCM_TOKEN_KEY);
        localStorage.removeItem(PUSH_REGISTERED_KEY);
        console.log('All push tokens unregistered successfully');
        return true;
      } else {
        setError(response.message || 'Failed to unregister all tokens');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unregister all tokens';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check push notification status
   */
  const checkStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pushNotificationApi.getStatus();

      if (response.success && response.data) {
        return response.data.enabled;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check status';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return {
    // State
    isSupported,
    permission,
    token,
    isRegistered,
    isLoading,
    error,
    notifications,
    // Actions
    requestPermission,
    registerToken,
    unregisterToken,
    unregisterAllTokens,
    checkStatus,
    clearError,
    clearNotifications,
    markAsRead,
  };
}

export default usePushNotifications;


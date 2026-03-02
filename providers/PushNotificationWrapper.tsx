"use client";

/**
 * Push Notification Provider Wrapper
 *
 * Integrates push notifications with authentication.
 * Automatically registers token on login and unregisters on logout.
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PushNotificationProvider, usePushNotificationContext } from '@/contexts/PushNotificationContext';
import { NotificationToast, EnableNotificationsBanner } from '@/components/notifications';
import type { DisplayedNotification } from '@/types/push-notification.d';

interface PushNotificationWrapperProps {
  children: React.ReactNode;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Show enable banner for unauthenticated users */
  showBannerForGuests?: boolean;
  /** Auto-register on authentication */
  autoRegisterOnAuth?: boolean;
}

/**
 * Inner component that uses the push notification context
 */
function PushNotificationHandler({
  children,
  isAuthenticated = false,
  showBannerForGuests = false,
  autoRegisterOnAuth = true,
}: PushNotificationWrapperProps) {
  const router = useRouter();
  const {
    isSupported,
    permission,
    isRegistered,
    registerToken,
    notifications,
    markAsRead,
  } = usePushNotificationContext();

  const [currentNotification, setCurrentNotification] = useState<DisplayedNotification | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const isRegistering = useRef(false);
  const hasAutoRegistered = useRef(false);

  // Auto-register when authenticated and permission granted
  useEffect(() => {
    if (
      autoRegisterOnAuth &&
      isAuthenticated &&
      isSupported &&
      permission === 'granted' &&
      !isRegistering.current &&
      !hasAutoRegistered.current
    ) {
      console.log('[PushNotificationHandler] Auto-registering FCM token...');
      isRegistering.current = true;
      registerToken()
        .then((success) => {
          if (success) {
            hasAutoRegistered.current = true;
            console.log('[PushNotificationHandler] Auto-registration successful');
          } else {
            console.warn('[PushNotificationHandler] Auto-registration returned false');
          }
        })
        .catch((err) => {
          console.error('[PushNotificationHandler] Auto-registration error:', err);
        })
        .finally(() => {
          isRegistering.current = false;
        });
    }
  }, [autoRegisterOnAuth, isAuthenticated, isSupported, permission, isRegistered, registerToken]);

  // Show toast for new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length > 0) {
      const latest = unreadNotifications[0];
      setCurrentNotification(latest);
      setToastOpen(true);
    }
  }, [notifications]);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
  }, [currentNotification, markAsRead]);

  const handleToastClick = useCallback(() => {
    if (currentNotification?.clickAction) {
      router.push(currentNotification.clickAction);
    }
    handleToastClose();
  }, [currentNotification, router, handleToastClose]);

  const showBanner = isAuthenticated || showBannerForGuests;

  return (
    <>
      {children}

      {/* Notification Toast */}
      <NotificationToast
        notification={currentNotification}
        open={toastOpen}
        onClose={handleToastClose}
        onClick={currentNotification?.clickAction ? handleToastClick : undefined}
      />

      {/* Enable Notifications Banner */}
      {showBanner && <EnableNotificationsBanner />}
    </>
  );
}

/**
 * Push Notification Wrapper Component
 *
 * Wraps children with PushNotificationProvider and handles
 * notification display and auto-registration.
 */
export function PushNotificationWrapper({
  children,
  isAuthenticated = false,
  showBannerForGuests = false,
  autoRegisterOnAuth = true,
}: PushNotificationWrapperProps) {
  return (
    <PushNotificationProvider>
      <PushNotificationHandler
        isAuthenticated={isAuthenticated}
        showBannerForGuests={showBannerForGuests}
        autoRegisterOnAuth={autoRegisterOnAuth}
      >
        {children}
      </PushNotificationHandler>
    </PushNotificationProvider>
  );
}

export default PushNotificationWrapper;


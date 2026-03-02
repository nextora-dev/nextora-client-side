"use client";

/**
 * Notification History Hook
 *
 * Fetches notification history from the backend API and provides
 * real-time unread counts. Merges with foreground notifications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  notificationHistoryApi,
  type NotificationHistoryItem,
} from '@/features/push-notifications/notification-history-service';

interface UseNotificationHistoryOptions {
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Polling interval in ms for unread count (default: 30000 = 30s, 0 = disabled) */
  pollInterval?: number;
  /** Page size for history (default: 20) */
  pageSize?: number;
}

interface UseNotificationHistoryReturn {
  /** Notification history list */
  notifications: NotificationHistoryItem[];
  /** Unread badge count from backend */
  unreadCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Fetch notification history (paginated) */
  fetchHistory: (page?: number) => Promise<void>;
  /** Refresh unread count from backend */
  refreshUnreadCount: () => Promise<void>;
  /** Mark a single notification as read (calls backend) */
  markAsRead: (notificationId: number) => Promise<void>;
  /** Mark all notifications as read (calls backend) */
  markAllAsRead: () => Promise<void>;
  /** Whether there are more pages to load */
  hasMore: boolean;
  /** Current page number */
  currentPage: number;
  /** Total number of notifications */
  totalElements: number;
}

export function useNotificationHistory(
  options: UseNotificationHistoryOptions = {}
): UseNotificationHistoryReturn {
  const { autoFetch = true, pollInterval = 30000, pageSize = 20 } = options;

  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Fetch notification history from backend
   */
  const fetchHistory = useCallback(
    async (page = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await notificationHistoryApi.getHistory(page, pageSize);
        if (response.success && response.data) {
          const pageData = response.data;
          if (page === 0) {
            setNotifications(pageData.content);
          } else {
            setNotifications((prev) => [...prev, ...pageData.content]);
          }
          setCurrentPage(pageData.number);
          setHasMore(!pageData.last);
          setTotalElements(pageData.totalElements);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
        if (mountedRef.current) setError(msg);
        console.error('[NotificationHistory Hook]', msg);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [pageSize]
  );

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationHistoryApi.getUnreadCount();
      if (response.success && response.data && mountedRef.current) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('[NotificationHistory Hook] Failed to refresh unread count:', err);
    }
  }, []);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await notificationHistoryApi.markAsRead(notificationId);
        // Optimistically update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, read: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('[NotificationHistory Hook] Failed to mark as read:', err);
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationHistoryApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationHistory Hook] Failed to mark all as read:', err);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchHistory(0);
      refreshUnreadCount();
    }
  }, [autoFetch, fetchHistory, refreshUnreadCount]);

  // Poll for unread count
  useEffect(() => {
    if (pollInterval > 0) {
      pollRef.current = setInterval(() => {
        refreshUnreadCount();
      }, pollInterval);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [pollInterval, refreshUnreadCount]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchHistory,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    hasMore,
    currentPage,
    totalElements,
  };
}

export default useNotificationHistory;


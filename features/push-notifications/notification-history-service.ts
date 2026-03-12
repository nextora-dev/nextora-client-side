/**
 * Notification History API Service
 *
 * Fetches notification history from the backend so students can
 * see past notifications they may have missed (background/offline).
 *
 * Backend endpoints: /api/v1/notifications
 */

import { api } from '@/lib/api-client';
import type { NotificationType } from '@/types/push-notification.d';

// ============================================================================
// Types
// ============================================================================

export interface NotificationHistoryItem {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  clickAction: string | null;
  imageUrl: string | null;
  data: Record<string, string> | null;
  sentAt: string;
  readAt: string | null;
  createdAt: string;
}

export interface PagedNotificationResponse {
  content: NotificationHistoryItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp?: string;
}

// ============================================================================
// API Path
// ============================================================================

const NOTIFICATIONS_API = '/notifications';

// ============================================================================
// Helper
// ============================================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const apiError = error as {
      error?: { message?: string; code?: string };
      message?: string;
      response?: { data?: { message?: string }; status?: number; statusText?: string };
    };
    if (apiError.error?.message) return apiError.error.message;
    if (apiError.message) return apiError.message;
    if (apiError.response?.data?.message) return apiError.response.data.message;
    if (apiError.response?.statusText)
      return `${apiError.response.status}: ${apiError.response.statusText}`;
  }
  return 'Unknown error occurred';
}

/**
 * Check if an error is a network/connectivity issue (backend unreachable).
 * These are expected during development or when the server is down,
 * and should be logged at a lower severity.
 */
function isNetworkError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes('network error') ||
    msg.includes('econnrefused') ||
    msg.includes('econnreset') ||
    msg.includes('enotfound') ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('failed to fetch')
  );
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get paginated notification history for the current user.
 */
export async function getNotificationHistory(
  page = 0,
  size = 20
): Promise<ApiResponse<PagedNotificationResponse>> {
  try {
    const response = await api.get<ApiResponse<PagedNotificationResponse>>(
      `${NOTIFICATIONS_API}?page=${page}&size=${size}`
    );
    return response;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (!isNetworkError(error)) {
      console.error('[NotificationHistory] Failed to fetch history:', msg);
    }
    throw new Error(`Failed to fetch notification history: ${msg}`);
  }
}

/**
 * Get unread notifications for the current user.
 */
export async function getUnreadNotifications(): Promise<
  ApiResponse<NotificationHistoryItem[]>
> {
  try {
    const response = await api.get<ApiResponse<NotificationHistoryItem[]>>(
      `${NOTIFICATIONS_API}/unread`
    );
    return response;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (!isNetworkError(error)) {
      console.error('[NotificationHistory] Failed to fetch unread:', msg);
    }
    throw new Error(`Failed to fetch unread notifications: ${msg}`);
  }
}

/**
 * Get unread notification count (for badge display).
 */
export async function getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
  try {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>(
      `${NOTIFICATIONS_API}/unread/count`
    );
    return response;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (!isNetworkError(error)) {
      console.error('[NotificationHistory] Failed to fetch unread count:', msg);
    }
    throw new Error(`Failed to fetch unread count: ${msg}`);
  }
}

/**
 * Mark a specific notification as read.
 */
export async function markNotificationAsRead(
  notificationId: number
): Promise<ApiResponse<void>> {
  try {
    const response = await api.patch<ApiResponse<void>>(
      `${NOTIFICATIONS_API}/${notificationId}/read`
    );
    return response;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (!isNetworkError(error)) {
      console.error('[NotificationHistory] Failed to mark as read:', msg);
    }
    throw new Error(`Failed to mark notification as read: ${msg}`);
  }
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllNotificationsAsRead(): Promise<
  ApiResponse<{ markedAsRead: number }>
> {
  try {
    const response = await api.patch<ApiResponse<{ markedAsRead: number }>>(
      `${NOTIFICATIONS_API}/read-all`
    );
    return response;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (!isNetworkError(error)) {
      console.error('[NotificationHistory] Failed to mark all as read:', msg);
    }
    throw new Error(`Failed to mark all notifications as read: ${msg}`);
  }
}

// ============================================================================
// Service Object Export
// ============================================================================

export const notificationHistoryApi = {
  getHistory: getNotificationHistory,
  getUnread: getUnreadNotifications,
  getUnreadCount,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
};

export default notificationHistoryApi;


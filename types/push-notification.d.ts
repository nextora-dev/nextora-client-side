/**
 * Push Notification Types
 *
 * Type definitions for push notification system
 */

// Notification types matching backend
export type NotificationType =
  | 'GENERAL'
  | 'ANNOUNCEMENT'
  | 'EVENT'
  | 'VOTING_ALERT'
  | 'SYSTEM'
  | 'SYSTEM_MESSAGE'
  | 'REMINDER'
  | 'ALERT'
  | 'ASSIGNMENT'
  | 'GRADE'
  | 'ATTENDANCE'
  | 'MESSAGE'
  | 'KUPPI_SESSION'
  | 'KUPPI_REMINDER';

// User roles matching backend
export type UserRole =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_ADMIN'
  | 'ROLE_STUDENT'
  | 'ROLE_NON_ACADEMIC_STAFF'
  | 'ROLE_ACADEMIC_STAFF';

// Permission state
export type PushPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

// Token registration request
export interface RegisterTokenRequest {
  token: string;
  deviceInfo?: string;
  deviceType?: string;
}

// Token registration response
export interface RegisterTokenResponse {
  tokenId: number;
  message: string;
  isNew: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// Push status response
export interface PushStatusResponse {
  enabled: boolean;
}

// Send notification request (admin)
export interface SendNotificationRequest {
  title: string;
  body: string;
  imageUrl?: string;
  clickAction?: string;
  type?: NotificationType;
  userIds?: number[];
  targetRole?: UserRole;
  data?: Record<string, string>;
  ttlSeconds?: number;
}

// Send notification response
export interface SendNotificationResponse {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  message: string;
  invalidTokens: string[];
  messageIds: string[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp?: string;
}

// Push notification context state
export interface PushNotificationState {
  isSupported: boolean;
  permission: PushPermissionState;
  token: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}

// Push notification actions
export interface PushNotificationActions {
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;
  unregisterAllTokens: () => Promise<boolean>;
  checkStatus: () => Promise<boolean>;
  clearError: () => void;
}

// Combined context type
export type PushNotificationContextType = PushNotificationState & PushNotificationActions;

// Notification payload (from Firebase)
export interface NotificationPayload {
  title?: string;
  body?: string;
  image?: string;
  icon?: string;
  clickAction?: string;
  type?: NotificationType;
  data?: Record<string, string>;
}

// Displayed notification (for UI)
export interface DisplayedNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  clickAction?: string;
  image?: string;
}


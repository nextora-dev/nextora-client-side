/**
 * Push Notification API Service
 *
 * Handles all API calls to the backend push notification endpoints.
 * Backend Base URL: http://localhost:8081/api/v1
 */

import { api } from '@/lib/api-client';
import type {
  RegisterTokenRequest,
  RegisterTokenResponse,
  PushStatusResponse,
  SendNotificationRequest,
  SendNotificationResponse,
  ApiResponse,
} from '@/types/push-notification.d';

// API path relative to base URL (NEXT_PUBLIC_API_URL already includes /api/v1)
const PUSH_API_BASE = '/push';

/**
 * Helper to extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Handle ApiError shape from Axios response interceptor: { success, error: { code, message }, timestamp }
    if (err.error && typeof err.error === 'object') {
      const nested = err.error as Record<string, unknown>;
      if (typeof nested.message === 'string') {
        return nested.message;
      }
    }

    // Handle raw Axios error shape: { response: { data: { message } } }
    const axiosError = error as {
      response?: { data?: { message?: string; error?: { message?: string } }, status?: number, statusText?: string },
      message?: string,
      code?: string
    };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error?.message) {
      return axiosError.response.data.error.message;
    }
    if (axiosError.response?.statusText) {
      return `${axiosError.response.status}: ${axiosError.response.statusText}`;
    }

    // Handle plain { message } shape
    if (typeof err.message === 'string') {
      return err.message;
    }
    if (typeof err.code === 'string') {
      return `Error code: ${err.code}`;
    }
  }
  return 'Unknown error occurred';
}

/**
 * Register FCM token with backend
 */
export async function registerPushToken(
  request: RegisterTokenRequest
): Promise<ApiResponse<RegisterTokenResponse>> {
  try {
    console.log('[Push] Registering token with backend...', {
      tokenPrefix: request.token?.substring(0, 20) + '...',
      deviceInfo: request.deviceInfo,
      deviceType: request.deviceType,
    });

    const response = await api.post<ApiResponse<RegisterTokenResponse>>(
      `${PUSH_API_BASE}/token`,
      request
    );

    console.log('[Push] Token registered successfully:', response);
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    const isNetworkError = errorMessage.toLowerCase().includes('network')
      || (typeof error === 'object' && error !== null && (error as Record<string, unknown>).error
          && typeof (error as Record<string, unknown>).error === 'object'
          && ((error as Record<string, unknown>).error as Record<string, unknown>).code === 'NETWORK_ERROR');

    // Use warn for network errors (backend probably not running) to reduce console noise
    const logFn = isNetworkError ? console.warn : console.error;
    logFn('[Push] Failed to register push token:', errorMessage, {
      // Spread the error's own enumerable props so they actually print, unlike JSON.stringify on certain objects
      errorDetail: typeof error === 'object' && error !== null ? { ...error as object } : error,
      request: { ...request, token: request.token?.substring(0, 20) + '...' },
    });
    throw new Error(`Failed to register push token: ${errorMessage}`);
  }
}

/**
 * Remove FCM token from backend (single device logout)
 */
export async function removePushToken(token: string): Promise<ApiResponse<null>> {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `${PUSH_API_BASE}/token?token=${encodeURIComponent(token)}`
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Failed to remove push token:', errorMessage);
    throw new Error(`Failed to remove push token: ${errorMessage}`);
  }
}

/**
 * Remove all FCM tokens for user (logout from all devices)
 */
export async function removeAllPushTokens(): Promise<ApiResponse<null>> {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `${PUSH_API_BASE}/token/all`
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Failed to remove all push tokens:', errorMessage);
    throw new Error(`Failed to remove all push tokens: ${errorMessage}`);
  }
}

/**
 * Check push notification status for current user
 */
export async function getPushStatus(): Promise<ApiResponse<PushStatusResponse>> {
  try {
    const response = await api.get<ApiResponse<PushStatusResponse>>(
      `${PUSH_API_BASE}/status`
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    // Use warn — this commonly fires when backend is not running
    console.warn('[Push] Failed to get push status:', errorMessage);
    throw new Error(`Failed to get push status: ${errorMessage}`);
  }
}

/**
 * Send push notification (Admin only)
 */
export async function sendPushNotification(
  request: SendNotificationRequest
): Promise<ApiResponse<SendNotificationResponse>> {
  try {
    const response = await api.post<ApiResponse<SendNotificationResponse>>(
      `${PUSH_API_BASE}/send`,
      request
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Failed to send push notification:', errorMessage);
    throw new Error(`Failed to send push notification: ${errorMessage}`);
  }
}

// ============== TEST ENDPOINTS (Dev Only) ==============

/**
 * Get push diagnostics (Dev only)
 */
export async function getPushDiagnostics(): Promise<ApiResponse<{
  firebaseEnabled: boolean;
  currentUserId: number;
  currentUserRole: string;
  timestamp: number;
  hint: string;
}>> {
  try {
    const response = await api.get<ApiResponse<{
      firebaseEnabled: boolean;
      currentUserId: number;
      currentUserRole: string;
      timestamp: number;
      hint: string;
    }>>(`${PUSH_API_BASE}/test/diagnostics`);
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Failed to get diagnostics:', errorMessage);
    throw new Error(`Failed to get diagnostics: ${errorMessage}`);
  }
}

/**
 * Ping test endpoint (Dev only)
 */
export async function pingPushTest(): Promise<ApiResponse<string>> {
  try {
    const response = await api.get<ApiResponse<string>>(`${PUSH_API_BASE}/test/ping`);
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Ping failed:', errorMessage);
    throw new Error(`Ping failed: ${errorMessage}`);
  }
}

/**
 * Send test notification to self (Dev only)
 */
export async function sendTestNotificationToSelf(): Promise<ApiResponse<SendNotificationResponse>> {
  try {
    const response = await api.post<ApiResponse<SendNotificationResponse>>(
      `${PUSH_API_BASE}/test/self`
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Failed to send test notification:', errorMessage);
    throw new Error(`Failed to send test notification: ${errorMessage}`);
  }
}

/**
 * Send custom test notification to self (Dev only)
 */
export async function sendCustomTestNotification(
  title: string,
  body: string
): Promise<ApiResponse<SendNotificationResponse>> {
  try {
    const params = new URLSearchParams({ title, body });
    const response = await api.post<ApiResponse<SendNotificationResponse>>(
      `${PUSH_API_BASE}/test/self/custom?${params.toString()}`
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('[Push] Failed to send custom test notification:', errorMessage);
    throw new Error(`Failed to send custom test notification: ${errorMessage}`);
  }
}

/**
 * Push Notification Service Object
 */
export const pushNotificationApi = {
  // Production endpoints
  registerToken: registerPushToken,
  removeToken: removePushToken,
  removeAllTokens: removeAllPushTokens,
  getStatus: getPushStatus,
  send: sendPushNotification,
  // Test endpoints (Dev only)
  getDiagnostics: getPushDiagnostics,
  ping: pingPushTest,
  testSelf: sendTestNotificationToSelf,
  testCustom: sendCustomTestNotification,
};

export default pushNotificationApi;

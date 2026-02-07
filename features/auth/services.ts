/**
 * @fileoverview Authentication Services
 * @description Centralized API service layer for all authentication operations.
 * Follows clean architecture principles with separation of concerns.
 *
 * @module features/auth/services
 * @version 2.0.0
 */

import { api, tokenStorage, authEvents, getUserFromToken } from '@/lib';
import { mapLegacyRole, PermissionType } from '@/constants';
import type {
    AuthUser,
    LoginCredentials,
    ForgotPasswordData,
    ResetPasswordData,
    VerifyEmailData,
    SendOtpData,
    VerifyOtpData,
    VerifyOtpResponse,
    ResendOtpData,
} from '@/features';

// ============================================================================
// Constants
// ============================================================================

/** API endpoint paths for authentication operations */
const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME: '/auth/me',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
} as const;

/** Security messages (prevents account enumeration) */
const SECURITY_MESSAGES = {
    PASSWORD_RESET_SENT: 'If an account exists, you will receive a reset email.',
    OTP_SENT: 'If an account exists, you will receive an OTP.',
    PASSWORD_RESET_SUCCESS: 'Password has been reset successfully.',
    OTP_VERIFIED: 'OTP verified successfully.',
    OTP_INVALID: 'Invalid OTP.',
    OTP_RESENT: 'OTP has been resent to your email.',
    TOKEN_VALID: 'Token is valid.',
    TOKEN_INVALID: 'Token is invalid or expired.',
} as const;

// ============================================================================
// Utilities
// ============================================================================

const isDev = process.env.NODE_ENV === 'development';

/** Safe debug logging (only in development) */
const debugLog = (message: string, data?: unknown): void => {
    if (isDev) {
        // eslint-disable-next-line no-console
        console.debug(`[Auth] ${message}`, data);
    }
};

/** Normalizes various API response shapes into a consistent format */
const normalizeResponse = <T>(response: unknown): T => {
    const level1 = (response && typeof response === 'object') ? response as Record<string, unknown> : {};
    const level2 = (level1.data && typeof level1.data === 'object') ? level1.data as Record<string, unknown> : level1;
    return ((level2.data && typeof level2.data === 'object') ? level2.data : level2) as T;
};

/** Maps API response to AuthUser object */
const mapToAuthUser = (data: Record<string, unknown>): AuthUser => ({
    id: String(data?.userId ?? data?.id ?? ''),
    email: String(data?.email || (data?.user as Record<string, unknown>)?.email || ''),
    firstName: String(data?.firstName || (data?.user as Record<string, unknown>)?.firstName || ''),
    lastName: String(data?.lastName || (data?.user as Record<string, unknown>)?.lastName || ''),
    role: mapLegacyRole(String(data?.role || (data?.user as Record<string, unknown>)?.role || '')),
    authorities: (data?.authorities || (data?.user as Record<string, unknown>)?.authorities || []) as PermissionType[],
    verified: true,
});

// ============================================================================
// Authentication Services
// ============================================================================
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
    const payload = { ...credentials, role: credentials.role ?? 'ROLE_STUDENT' };
    debugLog('Login attempt', { email: payload.email, role: payload.role });

    try {
        const response = await api.post<Record<string, unknown>>(AUTH_ENDPOINTS.LOGIN, payload);
        const data = normalizeResponse<Record<string, unknown>>(response);
        debugLog('Login response', data);

        const accessToken = String(data?.accessToken || data?.access_token || '');
        const refreshToken = String(data?.refreshToken || data?.refresh_token || '');
        if (accessToken) tokenStorage.setTokens(accessToken, refreshToken);

        const user = mapToAuthUser(data);
        authEvents.emit(user);
        return user;
    } catch (error) {
        console.error('[Auth] Login failed:', error);
        throw error;
    }
}

/** Logs out the current user and clears session */
export async function logout(): Promise<void> {
    try {
        await api.post(AUTH_ENDPOINTS.LOGOUT);
    } finally {
        tokenStorage.clearTokens();
        authEvents.emit(null);
    }
}

/** Refreshes the access token using refresh token */
export async function refreshToken(): Promise<string> {
    const currentRefreshToken = tokenStorage.getRefreshToken();
    if (!currentRefreshToken) throw new Error('No refresh token available');

    const response = await api.post<{ accessToken: string; refreshToken: string }>(
        AUTH_ENDPOINTS.REFRESH,
        { refreshToken: currentRefreshToken }
    );
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    return response.accessToken;
}

/** Fetches current user profile from API */
export async function getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>(AUTH_ENDPOINTS.ME);
    return { ...response, role: mapLegacyRole(response.role as unknown as string) };
}

/** Retrieves user information from stored JWT token */
export function getUserFromStoredToken(): AuthUser | null {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;

    const tokenUser = getUserFromToken(token);
    if (!tokenUser) return null;

    return {
        id: tokenUser.id,
        email: tokenUser.email,
        firstName: tokenUser.firstName,
        lastName: tokenUser.lastName,
        role: mapLegacyRole(tokenUser.role),
        authorities: tokenUser.authorities as PermissionType[],
        verified: true,
    };
}

// ============================================================================
// Password Recovery Services
// ============================================================================

/**
 * Initiates password reset flow
 * @security Always returns success to prevent email enumeration attacks
 */
export async function forgotPassword(data: ForgotPasswordData): Promise<{ message: string; success: boolean }> {
    try {
        const response = await api.post<{ message: string; success?: boolean }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
        return {
            message: response.message || SECURITY_MESSAGES.PASSWORD_RESET_SENT,
            success: response.success ?? true,
        };
    } catch {
        return { message: SECURITY_MESSAGES.PASSWORD_RESET_SENT, success: true };
    }
}

/** Resets user password with valid reset token */
export async function resetPassword(data: ResetPasswordData): Promise<{ message: string; success: boolean }> {
    const response = await api.post<{ message: string; success?: boolean }>(AUTH_ENDPOINTS.RESET_PASSWORD, {
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
    });
    return {
        message: response.message || SECURITY_MESSAGES.PASSWORD_RESET_SUCCESS,
        success: response.success ?? true,
    };
}

/** Validates a password reset token */
export async function validateResetToken(token: string): Promise<{ valid: boolean; message: string }> {
    try {
        const response = await api.post<{ valid?: boolean; message?: string }>(
            `${AUTH_ENDPOINTS.RESET_PASSWORD}/validate`,
            { token }
        );
        return {
            valid: response.valid ?? false,
            message: response.message || (response.valid ? SECURITY_MESSAGES.TOKEN_VALID : SECURITY_MESSAGES.TOKEN_INVALID),
        };
    } catch {
        return { valid: false, message: SECURITY_MESSAGES.TOKEN_INVALID };
    }
}

// ============================================================================
// Email Verification Services
// ============================================================================

/** Verifies user's email with token */
export async function verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, data);
}

/** Resends email verification link */
export async function resendVerification(email: string): Promise<{ message: string }> {
    return api.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, { email });
}

// ============================================================================
// OTP Services
// ============================================================================

/**
 * Sends OTP to user's email for password reset
 * @security Always returns success to prevent account enumeration
 */
export async function sendOtp(data: SendOtpData): Promise<{ message: string; success: boolean }> {
    try {
        const response = await api.post<{ message: string; success?: boolean }>(AUTH_ENDPOINTS.SEND_OTP, data);
        return {
            message: response.message || SECURITY_MESSAGES.OTP_SENT,
            success: response.success ?? true,
        };
    } catch {
        return { message: SECURITY_MESSAGES.OTP_SENT, success: true };
    }
}

/** Verifies OTP code entered by user */
export async function verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse> {
    const response = await api.post<VerifyOtpResponse>(AUTH_ENDPOINTS.VERIFY_OTP, data);
    return {
        verified: response.verified ?? false,
        token: response.token || '',
        message: response.message || (response.verified ? SECURITY_MESSAGES.OTP_VERIFIED : SECURITY_MESSAGES.OTP_INVALID),
    };
}

/** Resends OTP to user's email */
export async function resendOtp(data: ResendOtpData): Promise<{ message: string; success: boolean }> {
    try {
        const response = await api.post<{ message: string; success?: boolean }>(AUTH_ENDPOINTS.RESEND_OTP, data);
        return {
            message: response.message || SECURITY_MESSAGES.OTP_RESENT,
            success: response.success ?? true,
        };
    } catch {
        return { message: 'Failed to resend OTP. Please try again.', success: false };
    }
}

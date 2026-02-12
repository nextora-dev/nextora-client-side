// Auth Session Helper
import { AuthUser } from '@/features/auth/auth.types';
import { isTokenExpired, getUserFromToken } from './jwt';
import { mapLegacyRole, RoleType, ROLES } from '@/constants';
import { PermissionType } from '@/constants';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Storage utilities for tokens
 */
export const tokenStorage = {
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens: (accessToken: string, refreshToken: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        try {
            // Also write cookies so the Next.js middleware (edge runtime) can read tokens
            // Cookies set from client-side can't be httpOnly, but middleware only needs the token value
            document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(accessToken)}; path=/`;
            document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(refreshToken)}; path=/`;
        } catch (e) {
            // ignore cookie write errors in restricted environments
        }
    },

    setAccessToken: (accessToken: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        try {
            document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(accessToken)}; path=/`;
        } catch (e) {}
    },

    clearTokens: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        try {
            // Expire cookies
            document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        } catch (e) {}
    },
};

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    const token = tokenStorage.getAccessToken();
    if (!token) return false;
    return !isTokenExpired(token);
}

/**
 * Get current user from stored token
 */
export function getCurrentUser(): AuthUser | null {
    const token = tokenStorage.getAccessToken();
    if (!token || isTokenExpired(token)) return null;

    const tokenUser = getUserFromToken(token);
    if (!tokenUser) return null;

    return {
        id: tokenUser.id,
        email: tokenUser.email,
        firstName: tokenUser.firstName,
        lastName: tokenUser.lastName,
        role: mapLegacyRole(tokenUser.role),
        authorities: tokenUser.authorities as PermissionType[]
    };
}

/**
 * Get current user's role
 */
export function getCurrentRole(): RoleType | null {
    const user = getCurrentUser();
    return user?.role || null;
}

/**
 * Check if current user has specific role
 */
export function hasRole(role: RoleType): boolean {
    const currentRole = getCurrentRole();
    return currentRole === role;
}

/**
 * Check if current user has any of the specified roles
 */
export function hasAnyRole(roles: RoleType[]): boolean {
    const currentRole = getCurrentRole();
    return currentRole ? roles.includes(currentRole) : false;
}

/**
 * Check if current user is admin or higher
 */
export function isAdmin(): boolean {
    return hasAnyRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
}

/**
 * Check if current user is super admin
 */
export function isSuperAdmin(): boolean {
    return hasRole(ROLES.SUPER_ADMIN);
}

/**
 * Session event emitter for auth state changes
 */
type AuthEventCallback = (user: AuthUser | null) => void;
const authEventListeners: AuthEventCallback[] = [];

export const authEvents = {
    subscribe: (callback: AuthEventCallback) => {
        authEventListeners.push(callback);
        return () => {
            const index = authEventListeners.indexOf(callback);
            if (index > -1) authEventListeners.splice(index, 1);
        };
    },

    emit: (user: AuthUser | null) => {
        authEventListeners.forEach(callback => callback(user));
    },
};

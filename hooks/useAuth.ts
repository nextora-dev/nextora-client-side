// useAuth Hook - Authentication utilities
'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/constants';
import { LoginCredentials } from '@/features';

export function useAuth() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, error, login, logout, clearError, getDefaultRedirect } = useAuthStore();

    const loginWithRedirect = useCallback(async (credentials: LoginCredentials) => {
        try {
            const loggedInUser = await login(credentials);
            const redirectPath = getDefaultRedirect(loggedInUser);

            // Small delay to ensure cookies are fully written before navigation
            // This ensures middleware can read the auth token
            await new Promise(resolve => setTimeout(resolve, 100));

            // Use window.location.href for a full page navigation to ensure
            // cookies are sent with the request and middleware can verify auth
            if (typeof window !== 'undefined') {
                window.location.href = redirectPath;
            }

            return loggedInUser;
        } catch (err) {
            console.error('[Auth] Login redirect error:', err);
            throw err;
        }
    }, [login, getDefaultRedirect]);

    const logoutWithRedirect = useCallback(async () => {
        await logout();
        // Use full page navigation to ensure middleware properly handles unauthenticated state
        if (typeof window !== 'undefined') {
            window.location.href = ROUTES.LOGIN;
        }
    }, [logout]);

    const redirectIfAuthenticated = useCallback(() => {
        if (isAuthenticated && user) {
            router.push(getDefaultRedirect(user));
        }
    }, [isAuthenticated, user, getDefaultRedirect, router]);

    const redirectIfNotAuthenticated = useCallback(() => {
        if (!isAuthenticated && !isLoading) {
            router.push(ROUTES.LOGIN);
        }
    }, [isAuthenticated, isLoading, router]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login: loginWithRedirect,
        logout: logoutWithRedirect,
        clearError,
        redirectIfAuthenticated,
        redirectIfNotAuthenticated,
        getDefaultRedirect,
    };
}

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
        // Perform login and redirect based on role. Add debug logs to help trace issues.
        try {
            const loggedInUser = await login(credentials);
            // eslint-disable-next-line no-console
            console.debug('useAuth.loginWithRedirect: loggedInUser', loggedInUser);

            const redirectPath = getDefaultRedirect(loggedInUser);
            // eslint-disable-next-line no-console
            console.debug('useAuth.loginWithRedirect: redirectPath', redirectPath);

            try {
                // Wait for router.push to complete when possible
                // router.push may return a promise in some Next versions
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - router.push return type varies
                const pushResult: unknown = router.push(redirectPath);
                if (pushResult && typeof (pushResult as any).then === 'function') {
                    // eslint-disable-next-line no-await-in-loop
                    await (pushResult as Promise<unknown>);
                }
            } catch (pushErr) {
                // Rare: router.push may throw in some environments; fallback to full navigation
                // eslint-disable-next-line no-console
                console.error('router.push failed, falling back to window.location:', pushErr);
                if (typeof window !== 'undefined') window.location.href = redirectPath;
            }
            return loggedInUser;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('useAuth.loginWithRedirect error', err);
            throw err;
        }
    }, [login, getDefaultRedirect, router]);

    const logoutWithRedirect = useCallback(async () => {
        await logout();
        router.push(ROUTES.LOGIN);
    }, [logout, router]);

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

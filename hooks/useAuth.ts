/**
 * useAuth Hook - Authentication utilities with Redux
 * @description Provides authentication state and actions using Redux store
 * @module hooks/useAuth
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/constants';
import { LoginRequest } from '@/features';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    loginAsync,
    logoutAsync,
    clearError,
    selectUser,
    selectIsAuthenticated,
    selectIsLoading,
    selectError,
    getDefaultRedirect,
} from '@/features/auth/authSlice';

export function useAuth() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Redux selectors
    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    const loginWithRedirect = useCallback(async (credentials: LoginRequest) => {
        try {
            const result = await dispatch(loginAsync(credentials)).unwrap();
            const redirectPath = getDefaultRedirect(result);

            // Small delay to ensure cookies are fully written before navigation
            await new Promise(resolve => setTimeout(resolve, 100));

            // Use window.location.href for full page navigation
            if (typeof window !== 'undefined') {
                window.location.href = redirectPath;
            }

            return result;
        } catch (err) {
            console.error('[Auth] Login redirect error:', err);
            throw err;
        }
    }, [dispatch]);

    const logoutWithRedirect = useCallback(async () => {
        await dispatch(logoutAsync()).unwrap();
        // Use full page navigation
        if (typeof window !== 'undefined') {
            window.location.href = ROUTES.LOGIN;
        }
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const redirectIfAuthenticated = useCallback(() => {
        if (isAuthenticated && user) {
            router.push(getDefaultRedirect(user));
        }
    }, [isAuthenticated, user, router]);

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
        clearError: handleClearError,
        redirectIfAuthenticated,
        redirectIfNotAuthenticated,
        getDefaultRedirect: () => getDefaultRedirect(user),
    };
}

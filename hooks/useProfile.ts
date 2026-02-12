'use client'

import { useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
    fetchUserProfile,
    selectUserProfile,
    selectUserIsLoading,
    selectUserError,
    selectUserLastUpdated,
    clearError
} from '@/features/users/userSlice';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface UseProfileOptions {
    /** Force refresh data from API */
    forceRefresh?: boolean;
    /** Skip fetching (useful for conditional fetching) */
    skip?: boolean;
}

export function useProfile(options?: UseProfileOptions) {
    const dispatch = useAppDispatch();
    const fetchedRef = useRef(false);

    // Redux selectors
    const profile = useAppSelector(selectUserProfile);
    const isLoading = useAppSelector(selectUserIsLoading);
    const error = useAppSelector(selectUserError);
    const lastUpdated = useAppSelector(selectUserLastUpdated);

    // Check if cache is stale
    const isCacheStale = useCallback(() => {
        if (!lastUpdated) return true;
        const lastUpdatedTime = new Date(lastUpdated).getTime();
        return Date.now() - lastUpdatedTime > CACHE_DURATION;
    }, [lastUpdated]);

    // Refetch profile function
    const refetch = useCallback(() => {
        console.log('[useProfile] Manual refetch triggered');
        fetchedRef.current = false;
        return dispatch(fetchUserProfile());
    }, [dispatch]);

    // Clear error function
    const clearProfileError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Fetch profile on mount
    useEffect(() => {
        // Skip if requested
        if (options?.skip) {
            return;
        }

        // Skip if already loading
        if (isLoading) {
            return;
        }

        // Determine if we need to fetch
        const shouldFetch = options?.forceRefresh || !profile || !profile.roleSpecificData || isCacheStale();

        if (shouldFetch && !fetchedRef.current) {
            console.log('[useProfile] Fetching profile:', {
                forceRefresh: options?.forceRefresh,
                hasProfile: !!profile,
                hasRoleData: !!profile?.roleSpecificData,
                isCacheStale: isCacheStale(),
            });
            fetchedRef.current = true;
            dispatch(fetchUserProfile());
        }
    }, [dispatch, profile, isLoading, isCacheStale, options?.forceRefresh, options?.skip]);

    // Reset fetch flag when forceRefresh changes
    useEffect(() => {
        if (options?.forceRefresh) {
            fetchedRef.current = false;
        }
    }, [options?.forceRefresh]);

    return {
        profile,
        isLoading,
        error,
        lastUpdated,
        refetch,
        clearError: clearProfileError,
        isCacheStale: isCacheStale(),
        hasRoleData: !!profile?.roleSpecificData,
    };
}


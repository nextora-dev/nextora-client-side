'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { initializeFromTokenAsync, selectIsHydrated } from '@/features/auth/authSlice';

// Re-export types from the centralized location
export type { AuthUser as User } from '@/features/auth/auth.types';

export function AuthProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const isHydrated = useAppSelector(selectIsHydrated);
    const initialized = useRef(false);

    useEffect(() => {
        if (isHydrated && !initialized.current) {
            initialized.current = true;
            dispatch(initializeFromTokenAsync());
        }
    }, [isHydrated, dispatch]);

    return <>{children}</>;
}

export { useAuth } from '@/hooks/useAuth';

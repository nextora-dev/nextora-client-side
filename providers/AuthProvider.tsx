'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

// Re-export types from the centralized location
export type { AuthUser as User } from '@/features/auth/auth.types';

export function AuthProvider({ children }: { children: ReactNode }) {
    const initializeFromToken = useAuthStore((state) => state.initializeFromToken);
    const isHydrated = useAuthStore((state) => state.isHydrated);

    useEffect(() => {
        if (isHydrated) {
            initializeFromToken();
        }
    }, [isHydrated, initializeFromToken]);

    return <>{children}</>;
}

export { useAuth } from '@/hooks/useAuth';

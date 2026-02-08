// Auth Store - Centralized authentication state management
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, LoginCredentials, RegisterData } from '@/features/auth/auth.types';
import { login as loginService, logout as logoutService, getUserFromStoredToken } from '@/features/auth/services';
import { ROLES, RoleType } from '@/constants/roles';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean;
}

interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<AuthUser>;
    logout: () => Promise<void>;
    clearError: () => void;
    setUser: (user: AuthUser | null) => void;
    initializeFromToken: () => void;
    getDefaultRedirect: (user: AuthUser | null) => string;
    setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

const DEFAULT_DASHBOARDS: Record<RoleType, string> = {
    [ROLES.SUPER_ADMIN]: '/super-admin',
    [ROLES.ADMIN]: '/admin',
    [ROLES.STUDENT]: '/student',
    [ROLES.ACADEMIC_STAFF]: '/academic',
    [ROLES.NON_ACADEMIC_STAFF]: '/non-academic',
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // State
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isHydrated: false,

            // Actions
            setHydrated: () => {
                set({ isHydrated: true });
            },

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });
                try {
                    const user = await loginService(credentials);
                    set({ user, isAuthenticated: true, isLoading: false });
                    return user;
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Login failed';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await logoutService();
                } finally {
                    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
                }
            },

            clearError: () => set({ error: null }),

            setUser: (user: AuthUser | null) => {
                set({ user, isAuthenticated: !!user });
            },

            initializeFromToken: () => {
                const user = getUserFromStoredToken();
                if (user) {
                    set({ user, isAuthenticated: true });
                }
            },

            getDefaultRedirect: (user: AuthUser | null) => {
                if (!user?.role) return '/login';
                return DEFAULT_DASHBOARDS[user.role] || '/';
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => {
                // Return a safe storage for SSR
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                return sessionStorage;
            }),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);

// Initialize from token on module load (client-side only)
if (typeof window !== 'undefined') {
    useAuthStore.getState().initializeFromToken();
}


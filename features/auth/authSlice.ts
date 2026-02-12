import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AUTH_ENDPOINTS, AuthUser, LoginRequest } from '@/features';
import { login as loginService, logout as logoutService, getUserFromStoredToken } from './services';
import { ROLES, RoleType } from '@/constants/roles';

// ============================================================================
// Types
// ============================================================================

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean;
}

// Default dashboards by role
const DEFAULT_DASHBOARDS: Record<RoleType, string> = {
    [ROLES.SUPER_ADMIN]: '/super-admin',
    [ROLES.ADMIN]: '/admin',
    [ROLES.STUDENT]: '/student',
    [ROLES.ACADEMIC_STAFF]: '/academic',
    [ROLES.NON_ACADEMIC_STAFF]: '/non-academic',
};

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isHydrated: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

// Login thunk
export const loginAsync = createAsyncThunk<AuthUser, LoginRequest>(
    AUTH_ENDPOINTS.LOGIN,
    async (credentials, { rejectWithValue }) => {
        try {
            return await loginService(credentials);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            return rejectWithValue(errorMessage);
        }
    }
);

// Logout thunk
export const logoutAsync = createAsyncThunk(
    AUTH_ENDPOINTS.LOGOUT,
    async (_, { rejectWithValue }) => {
        try {
            await logoutService();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            return rejectWithValue(errorMessage);
        }
    }
);

// Initialize from stored token thunk
export const initializeFromTokenAsync = createAsyncThunk<AuthUser | null>(
    'auth/initializeFromToken',
    async () => {
        return getUserFromStoredToken();
    }
);

// ============================================================================
// Auth Slice
// ============================================================================

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user directly
        setUser: (state, action: PayloadAction<AuthUser | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        // Set hydrated state
        setHydrated: (state, action: PayloadAction<boolean>) => {
            state.isHydrated = action.payload;
        },
        // Reset auth state
        resetAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action: PayloadAction<AuthUser>) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
                state.isAuthenticated = false;
            });

        // Logout
        builder
            .addCase(logoutAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutAsync.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutAsync.rejected, (state) => {
                // Even on error, clear auth state
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            });

        // Initialize from token
        builder
            .addCase(initializeFromTokenAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initializeFromTokenAsync.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.isLoading = false;
                state.isHydrated = true;
            })
            .addCase(initializeFromTokenAsync.rejected, (state) => {
                state.isLoading = false;
                state.isHydrated = true;
            });
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsHydrated = (state: { auth: AuthState }) => state.auth.isHydrated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;

// Get default redirect based on user role
export const getDefaultRedirect = (user: AuthUser | null): string => {
    if (!user?.role) return '/login';
    return DEFAULT_DASHBOARDS[user.role] || '/';
};

// ============================================================================
// Exports
// ============================================================================

export const { setUser, clearError, setLoading, setHydrated, resetAuth } = authSlice.actions;
export default authSlice.reducer;

/**
 * Super Admin User Management Slice
 * Handles state management for super admin user operations
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RoleType, StatusType } from '@/constants';
import { User, UserDetail, AllUsersResponse, UserDetailResponse, ActionResponse } from '../admin/types';
import {
    CreateAdminRequest,
    CreateAdminResponse,
    ResetPasswordResponse,
    PermanentDeleteResponse,
    SuperAdminUserStats,
    SuperAdminUserStatsResponse,
} from './super-admin.types';
import {
    getAllUsersSuperAdmin,
    getUserByIdSuperAdmin,
    createAdminUser,
    resetUserPassword,
    softDeleteUserSuperAdmin,
    restoreUserSuperAdmin,
    permanentDeleteUserSuperAdmin,
    getSuperAdminUserStats,
} from './services';

// ============================================================================
// Types
// ============================================================================

interface SuperAdminUsersState {
    // Users list
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;

    // Filters
    searchQuery: string;
    roleFilter: RoleType | '';
    statusFilter: StatusType | '';

    // User detail
    selectedUserDetail: UserDetail | null;
    isUserDetailLoading: boolean;
    userDetailError: string | null;

    // Statistics
    stats: SuperAdminUserStats | null;
    isStatsLoading: boolean;
    statsError: string | null;

    // Loading states
    isLoading: boolean;
    isCreatingAdmin: boolean;
    isResettingPassword: boolean;
    isPermanentDeleting: boolean;
    isStatusChanging: boolean;

    // Error states
    error: string | null;
    createAdminError: string | null;
    resetPasswordError: string | null;
    permanentDeleteError: string | null;
    statusChangeError: string | null;

    // Success message
    successMessage: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: SuperAdminUsersState = {
    users: [],
    totalUsers: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,

    searchQuery: '',
    roleFilter: '',
    statusFilter: '',

    selectedUserDetail: null,
    isUserDetailLoading: false,
    userDetailError: null,

    stats: null,
    isStatsLoading: false,
    statsError: null,

    isLoading: false,
    isCreatingAdmin: false,
    isResettingPassword: false,
    isPermanentDeleting: false,
    isStatusChanging: false,

    error: null,
    createAdminError: null,
    resetPasswordError: null,
    permanentDeleteError: null,
    statusChangeError: null,

    successMessage: null,
};

// ============================================================================
// Helper Functions
// ============================================================================

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
};

// ============================================================================
// Async Thunks
// ============================================================================

// Fetch users
export const fetchUsersSuperAdmin = createAsyncThunk<
    AllUsersResponse,
    {
        page?: number;
        size?: number;
        searchQuery?: string;
        roleFilter?: RoleType | '';
        statusFilter?: StatusType | '';
    }
>(
    'superAdmin/fetchUsers',
    async (params, { rejectWithValue }) => {
        try {
            return await getAllUsersSuperAdmin({
                page: params.page,
                size: params.size,
            });
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch users'));
        }
    }
);

// Fetch user stats
export const fetchUserStatsSuperAdmin = createAsyncThunk<SuperAdminUserStatsResponse>(
    'superAdmin/fetchUserStats',
    async (_, { rejectWithValue }) => {
        try {
            return await getSuperAdminUserStats();
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user statistics'));
        }
    }
);

// Fetch user by ID
export const fetchUserByIdSuperAdmin = createAsyncThunk<UserDetailResponse, number>(
    'superAdmin/fetchUserById',
    async (userId, { rejectWithValue }) => {
        try {
            return await getUserByIdSuperAdmin(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user details'));
        }
    }
);

// Create admin user
export const createAdminUserAsync = createAsyncThunk<CreateAdminResponse, CreateAdminRequest>(
    'superAdmin/createAdminUser',
    async (data, { rejectWithValue }) => {
        try {
            return await createAdminUser(data);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to create admin user'));
        }
    }
);

// Reset user password
export const resetUserPasswordAsync = createAsyncThunk<ResetPasswordResponse, number>(
    'superAdmin/resetUserPassword',
    async (userId, { rejectWithValue }) => {
        try {
            return await resetUserPassword(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to reset user password'));
        }
    }
);

// Soft delete user
export const softDeleteUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/softDeleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await softDeleteUserSuperAdmin(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to delete user'));
        }
    }
);

// Restore soft-deleted user
export const restoreUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/restoreUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await restoreUserSuperAdmin(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to restore user'));
        }
    }
);

// Permanent delete user
export const permanentDeleteUserSuperAdminAsync = createAsyncThunk<PermanentDeleteResponse, number>(
    'superAdmin/permanentDeleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await permanentDeleteUserSuperAdmin(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to permanently delete user'));
        }
    }
);

// ============================================================================
// Slice
// ============================================================================

const superAdminSlice = createSlice({
    name: 'superAdmin',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.currentPage = 0;
        },
        setRoleFilter: (state, action: PayloadAction<RoleType | ''>) => {
            state.roleFilter = action.payload;
            state.currentPage = 0;
        },
        setStatusFilter: (state, action: PayloadAction<StatusType | ''>) => {
            state.statusFilter = action.payload;
            state.currentPage = 0;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.currentPage = 0;
        },
        clearFilters: (state) => {
            state.searchQuery = '';
            state.roleFilter = '';
            state.statusFilter = '';
            state.currentPage = 0;
        },
        clearSelectedUserDetail: (state) => {
            state.selectedUserDetail = null;
            state.userDetailError = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearAllErrors: (state) => {
            state.error = null;
            state.createAdminError = null;
            state.resetPasswordError = null;
            state.permanentDeleteError = null;
            state.statusChangeError = null;
            state.userDetailError = null;
            state.statsError = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        resetSuperAdminState: () => initialState,
    },
    extraReducers: (builder) => {
        // ================================================================
        // Fetch users
        // ================================================================
        builder
            .addCase(fetchUsersSuperAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsersSuperAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success && action.payload.data) {
                    state.users = action.payload.data.content;
                    state.totalUsers = action.payload.data.totalElements;
                    state.totalPages = action.payload.data.totalPages;
                }
            })
            .addCase(fetchUsersSuperAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ================================================================
        // Fetch user stats
        // ================================================================
        builder
            .addCase(fetchUserStatsSuperAdmin.pending, (state) => {
                state.isStatsLoading = true;
                state.statsError = null;
            })
            .addCase(fetchUserStatsSuperAdmin.fulfilled, (state, action) => {
                state.isStatsLoading = false;
                if (action.payload.success && action.payload.data) {
                    state.stats = action.payload.data;
                }
            })
            .addCase(fetchUserStatsSuperAdmin.rejected, (state, action) => {
                state.isStatsLoading = false;
                state.statsError = action.payload as string;
            });

        // ================================================================
        // Fetch user by ID
        // ================================================================
        builder
            .addCase(fetchUserByIdSuperAdmin.pending, (state) => {
                state.isUserDetailLoading = true;
                state.userDetailError = null;
            })
            .addCase(fetchUserByIdSuperAdmin.fulfilled, (state, action) => {
                state.isUserDetailLoading = false;
                if (action.payload.success && action.payload.data) {
                    state.selectedUserDetail = action.payload.data;
                }
            })
            .addCase(fetchUserByIdSuperAdmin.rejected, (state, action) => {
                state.isUserDetailLoading = false;
                state.userDetailError = action.payload as string;
            });

        // ================================================================
        // Create admin user
        // ================================================================
        builder
            .addCase(createAdminUserAsync.pending, (state) => {
                state.isCreatingAdmin = true;
                state.createAdminError = null;
                state.successMessage = null;
            })
            .addCase(createAdminUserAsync.fulfilled, (state, action) => {
                state.isCreatingAdmin = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'Admin user created successfully';
                }
            })
            .addCase(createAdminUserAsync.rejected, (state, action) => {
                state.isCreatingAdmin = false;
                state.createAdminError = action.payload as string;
            });

        // ================================================================
        // Reset user password
        // ================================================================
        builder
            .addCase(resetUserPasswordAsync.pending, (state) => {
                state.isResettingPassword = true;
                state.resetPasswordError = null;
                state.successMessage = null;
            })
            .addCase(resetUserPasswordAsync.fulfilled, (state, action) => {
                state.isResettingPassword = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'Password reset email sent successfully';
                }
            })
            .addCase(resetUserPasswordAsync.rejected, (state, action) => {
                state.isResettingPassword = false;
                state.resetPasswordError = action.payload as string;
            });

        // ================================================================
        // Soft delete user
        // ================================================================
        builder
            .addCase(softDeleteUserSuperAdminAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(softDeleteUserSuperAdminAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User soft deleted successfully';
                }
            })
            .addCase(softDeleteUserSuperAdminAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Restore user
        // ================================================================
        builder
            .addCase(restoreUserSuperAdminAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(restoreUserSuperAdminAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User restored successfully';
                }
            })
            .addCase(restoreUserSuperAdminAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Permanent delete user
        // ================================================================
        builder
            .addCase(permanentDeleteUserSuperAdminAsync.pending, (state) => {
                state.isPermanentDeleting = true;
                state.permanentDeleteError = null;
                state.successMessage = null;
            })
            .addCase(permanentDeleteUserSuperAdminAsync.fulfilled, (state, action) => {
                state.isPermanentDeleting = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User permanently deleted';
                }
            })
            .addCase(permanentDeleteUserSuperAdminAsync.rejected, (state, action) => {
                state.isPermanentDeleting = false;
                state.permanentDeleteError = action.payload as string;
            });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    clearFilters,
    clearSelectedUserDetail,
    clearError,
    clearAllErrors,
    clearSuccessMessage,
    resetSuperAdminState,
} = superAdminSlice.actions;

export default superAdminSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================

export const selectSuperAdminUsers = (state: any) => state.superAdmin.users as User[];
export const selectSuperAdminTotalUsers = (state: any) => state.superAdmin.totalUsers as number;
export const selectSuperAdminCurrentPage = (state: any) => state.superAdmin.currentPage as number;
export const selectSuperAdminPageSize = (state: any) => state.superAdmin.pageSize as number;
export const selectSuperAdminTotalPages = (state: any) => state.superAdmin.totalPages as number;

export const selectSuperAdminSearchQuery = (state: any) => state.superAdmin.searchQuery as string;
export const selectSuperAdminRoleFilter = (state: any) => state.superAdmin.roleFilter as RoleType | '';
export const selectSuperAdminStatusFilter = (state: any) => state.superAdmin.statusFilter as StatusType | '';

export const selectSuperAdminStats = (state: any) => state.superAdmin.stats as SuperAdminUserStats | null;
export const selectSuperAdminIsStatsLoading = (state: any) => state.superAdmin.isStatsLoading as boolean;

export const selectSuperAdminSelectedUserDetail = (state: any) => state.superAdmin.selectedUserDetail as UserDetail | null;
export const selectSuperAdminIsUserDetailLoading = (state: any) => state.superAdmin.isUserDetailLoading as boolean;
export const selectSuperAdminUserDetailError = (state: any) => state.superAdmin.userDetailError as string | null;

export const selectSuperAdminIsLoading = (state: any) => state.superAdmin.isLoading as boolean;
export const selectSuperAdminIsCreatingAdmin = (state: any) => state.superAdmin.isCreatingAdmin as boolean;
export const selectSuperAdminIsResettingPassword = (state: any) => state.superAdmin.isResettingPassword as boolean;
export const selectSuperAdminIsPermanentDeleting = (state: any) => state.superAdmin.isPermanentDeleting as boolean;
export const selectSuperAdminIsStatusChanging = (state: any) => state.superAdmin.isStatusChanging as boolean;

export const selectSuperAdminError = (state: any) => state.superAdmin.error as string | null;
export const selectSuperAdminCreateAdminError = (state: any) => state.superAdmin.createAdminError as string | null;
export const selectSuperAdminResetPasswordError = (state: any) => state.superAdmin.resetPasswordError as string | null;
export const selectSuperAdminPermanentDeleteError = (state: any) => state.superAdmin.permanentDeleteError as string | null;
export const selectSuperAdminStatusChangeError = (state: any) => state.superAdmin.statusChangeError as string | null;

export const selectSuperAdminSuccessMessage = (state: any) => state.superAdmin.successMessage as string | null;

export type { SuperAdminUsersState };


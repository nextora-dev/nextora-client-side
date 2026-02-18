/**
 * Admin User Management Slice (Super Admin Exclusive)
 * Manages admin users - CRUD operations, soft delete, permanent delete, restore
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    AdminUser,
    AdminUserDetail,
    AdminUsersResponse,
    AdminUserDetailResponse,
    UpdateAdminRequest,
    UpdateAdminResponse,
    AdminUserActionResponse,
    CreateAdminRequest,
    CreateAdminResponse,
} from './super-admin.types';
import {
    getAllAdminUsers,
    getAdminUserById,
    updateAdminUser,
    softDeleteAdminUser,
    permanentDeleteAdminUser,
    restoreAdminUser,
    createAdminUser,
} from './services';
import { UserFilterParams } from '../admin/types';

// Types
interface AdminUserManagementState {
    adminUsers: AdminUser[];
    totalAdminUsers: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    searchQuery: string;
    statusFilter: string;
    selectedAdminDetail: AdminUserDetail | null;
    isAdminDetailLoading: boolean;
    adminDetailError: string | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isSoftDeleting: boolean;
    isPermanentDeleting: boolean;
    isRestoring: boolean;
    error: string | null;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    restoreError: string | null;
    successMessage: string | null;
}

const initialState: AdminUserManagementState = {
    adminUsers: [],
    totalAdminUsers: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    searchQuery: '',
    statusFilter: '',
    selectedAdminDetail: null,
    isAdminDetailLoading: false,
    adminDetailError: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isSoftDeleting: false,
    isPermanentDeleting: false,
    isRestoring: false,
    error: null,
    createError: null,
    updateError: null,
    deleteError: null,
    restoreError: null,
    successMessage: null,
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
};

// ============================================================================
// Async Thunks
// ============================================================================

// Fetch all admin users
export const fetchAdminUsers = createAsyncThunk<AdminUsersResponse, UserFilterParams>(
    'adminUserManagement/fetchAdminUsers',
    async (params, { rejectWithValue }) => {
        try {
            return await getAllAdminUsers(params);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch admin users'));
        }
    }
);

// Fetch admin user by ID
export const fetchAdminUserById = createAsyncThunk<AdminUserDetailResponse, number>(
    'adminUserManagement/fetchAdminUserById',
    async (adminId, { rejectWithValue }) => {
        try {
            return await getAdminUserById(adminId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch admin user details'));
        }
    }
);

// Create admin user
export const createAdminUserAsync = createAsyncThunk<CreateAdminResponse, CreateAdminRequest>(
    'adminUserManagement/createAdminUser',
    async (data, { rejectWithValue }) => {
        try {
            return await createAdminUser(data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to create admin user'));
        }
    }
);

// Update admin user
export const updateAdminUserAsync = createAsyncThunk<UpdateAdminResponse, { adminId: number; data: UpdateAdminRequest }>(
    'adminUserManagement/updateAdminUser',
    async ({ adminId, data }, { rejectWithValue }) => {
        try {
            return await updateAdminUser(adminId, data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to update admin user'));
        }
    }
);

// Soft delete admin user
export const softDeleteAdminUserAsync = createAsyncThunk<AdminUserActionResponse, number>(
    'adminUserManagement/softDeleteAdminUser',
    async (adminId, { rejectWithValue }) => {
        try {
            return await softDeleteAdminUser(adminId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to soft delete admin user'));
        }
    }
);

// Permanently delete admin user
export const permanentDeleteAdminUserAsync = createAsyncThunk<AdminUserActionResponse, number>(
    'adminUserManagement/permanentDeleteAdminUser',
    async (adminId, { rejectWithValue }) => {
        try {
            return await permanentDeleteAdminUser(adminId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to permanently delete admin user'));
        }
    }
);

// Restore soft-deleted admin user
export const restoreAdminUserAsync = createAsyncThunk<AdminUserActionResponse, number>(
    'adminUserManagement/restoreAdminUser',
    async (adminId, { rejectWithValue }) => {
        try {
            return await restoreAdminUser(adminId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to restore admin user'));
        }
    }
);

// ============================================================================
// Slice
// ============================================================================

const adminUserManagementSlice = createSlice({
    name: 'adminUserManagement',
    initialState,
    reducers: {
        setAdminSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.currentPage = 0;
        },
        setAdminStatusFilter: (state, action: PayloadAction<string>) => {
            state.statusFilter = action.payload;
            state.currentPage = 0;
        },
        setAdminCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setAdminPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.currentPage = 0;
        },
        clearAdminFilters: (state) => {
            state.searchQuery = '';
            state.statusFilter = '';
            state.currentPage = 0;
        },
        clearSelectedAdminDetail: (state) => {
            state.selectedAdminDetail = null;
            state.adminDetailError = null;
        },
        clearAdminError: (state) => {
            state.error = null;
        },
        clearAllAdminErrors: (state) => {
            state.error = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
            state.restoreError = null;
            state.adminDetailError = null;
        },
        clearAdminSuccessMessage: (state) => {
            state.successMessage = null;
        },
        resetAdminUserManagementState: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch admin users
        builder.addCase(fetchAdminUsers.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAdminUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload.success && action.payload.data) {
                state.adminUsers = action.payload.data.content;
                state.totalAdminUsers = action.payload.data.totalElements;
                state.totalPages = action.payload.data.totalPages;
            }
        });
        builder.addCase(fetchAdminUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch admin user by ID
        builder.addCase(fetchAdminUserById.pending, (state) => {
            state.isAdminDetailLoading = true;
            state.adminDetailError = null;
        });
        builder.addCase(fetchAdminUserById.fulfilled, (state, action) => {
            state.isAdminDetailLoading = false;
            if (action.payload.success && action.payload.data) {
                state.selectedAdminDetail = action.payload.data;
            }
        });
        builder.addCase(fetchAdminUserById.rejected, (state, action) => {
            state.isAdminDetailLoading = false;
            state.adminDetailError = action.payload as string;
        });

        // Create admin user
        builder.addCase(createAdminUserAsync.pending, (state) => {
            state.isCreating = true;
            state.createError = null;
            state.successMessage = null;
        });
        builder.addCase(createAdminUserAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            if (action.payload.success) {
                state.successMessage = action.payload.message || 'Admin user created successfully';
            }
        });
        builder.addCase(createAdminUserAsync.rejected, (state, action) => {
            state.isCreating = false;
            state.createError = action.payload as string;
        });

        // Update admin user
        builder.addCase(updateAdminUserAsync.pending, (state) => {
            state.isUpdating = true;
            state.updateError = null;
            state.successMessage = null;
        });
        builder.addCase(updateAdminUserAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            if (action.payload.success) {
                state.successMessage = action.payload.message || 'Admin user updated successfully';
            }
        });
        builder.addCase(updateAdminUserAsync.rejected, (state, action) => {
            state.isUpdating = false;
            state.updateError = action.payload as string;
        });

        // Soft delete admin user
        builder.addCase(softDeleteAdminUserAsync.pending, (state) => {
            state.isSoftDeleting = true;
            state.deleteError = null;
            state.successMessage = null;
        });
        builder.addCase(softDeleteAdminUserAsync.fulfilled, (state, action) => {
            state.isSoftDeleting = false;
            if (action.payload.success) {
                state.successMessage = action.payload.message || 'Admin user soft deleted successfully';
            }
        });
        builder.addCase(softDeleteAdminUserAsync.rejected, (state, action) => {
            state.isSoftDeleting = false;
            state.deleteError = action.payload as string;
        });

        // Permanent delete admin user
        builder.addCase(permanentDeleteAdminUserAsync.pending, (state) => {
            state.isPermanentDeleting = true;
            state.deleteError = null;
            state.successMessage = null;
        });
        builder.addCase(permanentDeleteAdminUserAsync.fulfilled, (state, action) => {
            state.isPermanentDeleting = false;
            if (action.payload.success) {
                state.successMessage = action.payload.message || 'Admin user permanently deleted';
            }
        });
        builder.addCase(permanentDeleteAdminUserAsync.rejected, (state, action) => {
            state.isPermanentDeleting = false;
            state.deleteError = action.payload as string;
        });

        // Restore admin user
        builder.addCase(restoreAdminUserAsync.pending, (state) => {
            state.isRestoring = true;
            state.restoreError = null;
            state.successMessage = null;
        });
        builder.addCase(restoreAdminUserAsync.fulfilled, (state, action) => {
            state.isRestoring = false;
            if (action.payload.success) {
                state.successMessage = action.payload.message || 'Admin user restored successfully';
            }
        });
        builder.addCase(restoreAdminUserAsync.rejected, (state, action) => {
            state.isRestoring = false;
            state.restoreError = action.payload as string;
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setAdminSearchQuery,
    setAdminStatusFilter,
    setAdminCurrentPage,
    setAdminPageSize,
    clearAdminFilters,
    clearSelectedAdminDetail,
    clearAdminError,
    clearAllAdminErrors,
    clearAdminSuccessMessage,
    resetAdminUserManagementState,
} = adminUserManagementSlice.actions;

export default adminUserManagementSlice.reducer;

// Selectors
export const selectAdminUsers = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.adminUsers;
export const selectTotalAdminUsers = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.totalAdminUsers;
export const selectAdminCurrentPage = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.currentPage;
export const selectAdminPageSize = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.pageSize;
export const selectAdminTotalPages = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.totalPages;
export const selectAdminSearchQuery = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.searchQuery;
export const selectAdminStatusFilter = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.statusFilter;
export const selectSelectedAdminDetail = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.selectedAdminDetail;
export const selectIsAdminDetailLoading = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isAdminDetailLoading;
export const selectAdminDetailError = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.adminDetailError;
export const selectIsAdminUsersLoading = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isLoading;
export const selectIsCreatingAdmin = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isCreating;
export const selectIsUpdatingAdmin = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isUpdating;
export const selectIsSoftDeletingAdmin = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isSoftDeleting;
export const selectIsPermanentDeletingAdmin = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isPermanentDeleting;
export const selectIsRestoringAdmin = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.isRestoring;
export const selectAdminUsersError = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.error;
export const selectAdminCreateError = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.createError;
export const selectAdminUpdateError = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.updateError;
export const selectAdminDeleteError = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.deleteError;
export const selectAdminRestoreError = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.restoreError;
export const selectAdminSuccessMessage = (state: { adminUserManagement: AdminUserManagementState }) => state.adminUserManagement.successMessage;

export type { AdminUserManagementState };


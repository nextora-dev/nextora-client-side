/**
 * Super Admin User Management Slice
 * Includes all admin features plus permanent delete and restore (Super Admin only)
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RoleType, StatusType } from '@/constants';
import {
    User, UserDetail, AllUsersResponse, UserDetailResponse, ActionResponse,
    CreateUserRequest, CreateUserResponse, UpdateUserRequest, UpdateUserResponse,
} from '../admin/types';
import {
    CreateAdminRequest, CreateAdminResponse, PermanentDeleteResponse,
    SuperAdminUserStats, SuperAdminUserStatsResponse,
} from './super-admin.types';
import {
    getAllUsersSuperAdmin, getUserByIdSuperAdmin, createUserSuperAdmin, createAdminUser,
    updateUserByIdSuperAdmin, activateUserSuperAdmin, deactivateUserSuperAdmin,
    suspendUserSuperAdmin, unlockUserSuperAdmin, softDeleteUserSuperAdmin,
    restoreUserSuperAdmin, permanentDeleteUserSuperAdmin, getSuperAdminUserStats,
} from './services';

// Types
interface SuperAdminUsersState {
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    searchQuery: string;
    roleFilter: RoleType | '';
    statusFilter: StatusType | '';
    selectedUserDetail: UserDetail | null;
    isUserDetailLoading: boolean;
    userDetailError: string | null;
    stats: SuperAdminUserStats | null;
    isStatsLoading: boolean;
    statsError: string | null;
    isLoading: boolean;
    isCreating: boolean;
    isCreatingAdmin: boolean;
    isUpdating: boolean;
    isPermanentDeleting: boolean;
    isStatusChanging: boolean;
    error: string | null;
    createError: string | null;
    createAdminError: string | null;
    updateError: string | null;
    permanentDeleteError: string | null;
    statusChangeError: string | null;
    successMessage: string | null;
}

const initialState: SuperAdminUsersState = {
    users: [], totalUsers: 0, totalPages: 0, currentPage: 0, pageSize: 10,
    searchQuery: '', roleFilter: '', statusFilter: '',
    selectedUserDetail: null, isUserDetailLoading: false, userDetailError: null,
    stats: null, isStatsLoading: false, statsError: null,
    isLoading: false, isCreating: false, isCreatingAdmin: false, isUpdating: false,
    isPermanentDeleting: false, isStatusChanging: false,
    error: null, createError: null, createAdminError: null, updateError: null,
    permanentDeleteError: null, statusChangeError: null, successMessage: null,
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
};

// Async Thunks
export const fetchUsersSuperAdmin = createAsyncThunk<AllUsersResponse, { page?: number; size?: number; }>(
    'superAdmin/fetchUsers', async (params, { rejectWithValue }) => {
        try { return await getAllUsersSuperAdmin({ page: params.page, size: params.size }); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to fetch users')); }
    }
);

export const fetchUserStatsSuperAdmin = createAsyncThunk<SuperAdminUserStatsResponse>(
    'superAdmin/fetchUserStats', async (_, { rejectWithValue }) => {
        try { return await getSuperAdminUserStats(); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user statistics')); }
    }
);

export const fetchUserByIdSuperAdmin = createAsyncThunk<UserDetailResponse, number>(
    'superAdmin/fetchUserById', async (userId, { rejectWithValue }) => {
        try { return await getUserByIdSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user details')); }
    }
);

export const createUserSuperAdminAsync = createAsyncThunk<CreateUserResponse, CreateUserRequest>(
    'superAdmin/createUser', async (data, { rejectWithValue }) => {
        try { return await createUserSuperAdmin(data); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to create user')); }
    }
);

export const createAdminUserAsync = createAsyncThunk<CreateAdminResponse, CreateAdminRequest>(
    'superAdmin/createAdminUser', async (data, { rejectWithValue }) => {
        try { return await createAdminUser(data); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to create admin user')); }
    }
);

export const updateUserSuperAdminAsync = createAsyncThunk<UpdateUserResponse, { id: number; data: UpdateUserRequest }>(
    'superAdmin/updateUser', async ({ id, data }, { rejectWithValue }) => {
        try { return await updateUserByIdSuperAdmin(id, data); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to update user')); }
    }
);

export const activateUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/activateUser', async (userId, { rejectWithValue }) => {
        try { return await activateUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to activate user')); }
    }
);

export const deactivateUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/deactivateUser', async (userId, { rejectWithValue }) => {
        try { return await deactivateUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to deactivate user')); }
    }
);

export const suspendUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/suspendUser', async (userId, { rejectWithValue }) => {
        try { return await suspendUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to suspend user')); }
    }
);

export const unlockUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/unlockUser', async (userId, { rejectWithValue }) => {
        try { return await unlockUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to unlock user')); }
    }
);

export const softDeleteUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/softDeleteUser', async (userId, { rejectWithValue }) => {
        try { return await softDeleteUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to delete user')); }
    }
);

export const restoreUserSuperAdminAsync = createAsyncThunk<ActionResponse, number>(
    'superAdmin/restoreUser', async (userId, { rejectWithValue }) => {
        try { return await restoreUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to restore user')); }
    }
);

export const permanentDeleteUserSuperAdminAsync = createAsyncThunk<PermanentDeleteResponse, number>(
    'superAdmin/permanentDeleteUser', async (userId, { rejectWithValue }) => {
        try { return await permanentDeleteUserSuperAdmin(userId); }
        catch (error) { return rejectWithValue(extractErrorMessage(error, 'Failed to permanently delete user')); }
    }
);

// Slice
const superAdminSlice = createSlice({
    name: 'superAdmin',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload; state.currentPage = 0; },
        setRoleFilter: (state, action: PayloadAction<RoleType | ''>) => { state.roleFilter = action.payload; state.currentPage = 0; },
        setStatusFilter: (state, action: PayloadAction<StatusType | ''>) => { state.statusFilter = action.payload; state.currentPage = 0; },
        setCurrentPage: (state, action: PayloadAction<number>) => { state.currentPage = action.payload; },
        setPageSize: (state, action: PayloadAction<number>) => { state.pageSize = action.payload; state.currentPage = 0; },
        clearFilters: (state) => { state.searchQuery = ''; state.roleFilter = ''; state.statusFilter = ''; state.currentPage = 0; },
        clearSelectedUserDetail: (state) => { state.selectedUserDetail = null; state.userDetailError = null; },
        clearError: (state) => { state.error = null; },
        clearAllErrors: (state) => { state.error = null; state.createError = null; state.createAdminError = null; state.updateError = null; state.permanentDeleteError = null; state.statusChangeError = null; state.userDetailError = null; state.statsError = null; },
        clearSuccessMessage: (state) => { state.successMessage = null; },
        resetSuperAdminState: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch users
        builder.addCase(fetchUsersSuperAdmin.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchUsersSuperAdmin.fulfilled, (state, action) => { state.isLoading = false; if (action.payload.success && action.payload.data) { state.users = action.payload.data.content; state.totalUsers = action.payload.data.totalElements; state.totalPages = action.payload.data.totalPages; } });
        builder.addCase(fetchUsersSuperAdmin.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Fetch stats
        builder.addCase(fetchUserStatsSuperAdmin.pending, (state) => { state.isStatsLoading = true; state.statsError = null; });
        builder.addCase(fetchUserStatsSuperAdmin.fulfilled, (state, action) => { state.isStatsLoading = false; if (action.payload.success && action.payload.data) { state.stats = action.payload.data; } });
        builder.addCase(fetchUserStatsSuperAdmin.rejected, (state, action) => { state.isStatsLoading = false; state.statsError = action.payload as string; });

        // Fetch user by ID
        builder.addCase(fetchUserByIdSuperAdmin.pending, (state) => { state.isUserDetailLoading = true; state.userDetailError = null; });
        builder.addCase(fetchUserByIdSuperAdmin.fulfilled, (state, action) => { state.isUserDetailLoading = false; if (action.payload.success && action.payload.data) { state.selectedUserDetail = action.payload.data; } });
        builder.addCase(fetchUserByIdSuperAdmin.rejected, (state, action) => { state.isUserDetailLoading = false; state.userDetailError = action.payload as string; });

        // Create user
        builder.addCase(createUserSuperAdminAsync.pending, (state) => { state.isCreating = true; state.createError = null; state.successMessage = null; });
        builder.addCase(createUserSuperAdminAsync.fulfilled, (state, action) => { state.isCreating = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User created successfully'; } });
        builder.addCase(createUserSuperAdminAsync.rejected, (state, action) => { state.isCreating = false; state.createError = action.payload as string; });

        // Create admin user
        builder.addCase(createAdminUserAsync.pending, (state) => { state.isCreatingAdmin = true; state.createAdminError = null; state.successMessage = null; });
        builder.addCase(createAdminUserAsync.fulfilled, (state, action) => { state.isCreatingAdmin = false; if (action.payload.success) { state.successMessage = action.payload.message || 'Admin user created successfully'; } });
        builder.addCase(createAdminUserAsync.rejected, (state, action) => { state.isCreatingAdmin = false; state.createAdminError = action.payload as string; });

        // Update user
        builder.addCase(updateUserSuperAdminAsync.pending, (state) => { state.isUpdating = true; state.updateError = null; state.successMessage = null; });
        builder.addCase(updateUserSuperAdminAsync.fulfilled, (state, action) => { state.isUpdating = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User updated successfully'; } });
        builder.addCase(updateUserSuperAdminAsync.rejected, (state, action) => { state.isUpdating = false; state.updateError = action.payload as string; });

        // Activate user
        builder.addCase(activateUserSuperAdminAsync.pending, (state) => { state.isStatusChanging = true; state.statusChangeError = null; state.successMessage = null; });
        builder.addCase(activateUserSuperAdminAsync.fulfilled, (state, action) => { state.isStatusChanging = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User activated successfully'; } });
        builder.addCase(activateUserSuperAdminAsync.rejected, (state, action) => { state.isStatusChanging = false; state.statusChangeError = action.payload as string; });

        // Deactivate user
        builder.addCase(deactivateUserSuperAdminAsync.pending, (state) => { state.isStatusChanging = true; state.statusChangeError = null; state.successMessage = null; });
        builder.addCase(deactivateUserSuperAdminAsync.fulfilled, (state, action) => { state.isStatusChanging = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User deactivated successfully'; } });
        builder.addCase(deactivateUserSuperAdminAsync.rejected, (state, action) => { state.isStatusChanging = false; state.statusChangeError = action.payload as string; });

        // Suspend user
        builder.addCase(suspendUserSuperAdminAsync.pending, (state) => { state.isStatusChanging = true; state.statusChangeError = null; state.successMessage = null; });
        builder.addCase(suspendUserSuperAdminAsync.fulfilled, (state, action) => { state.isStatusChanging = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User suspended successfully'; } });
        builder.addCase(suspendUserSuperAdminAsync.rejected, (state, action) => { state.isStatusChanging = false; state.statusChangeError = action.payload as string; });

        // Unlock user
        builder.addCase(unlockUserSuperAdminAsync.pending, (state) => { state.isStatusChanging = true; state.statusChangeError = null; state.successMessage = null; });
        builder.addCase(unlockUserSuperAdminAsync.fulfilled, (state, action) => { state.isStatusChanging = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User unlocked successfully'; } });
        builder.addCase(unlockUserSuperAdminAsync.rejected, (state, action) => { state.isStatusChanging = false; state.statusChangeError = action.payload as string; });

        // Soft delete user
        builder.addCase(softDeleteUserSuperAdminAsync.pending, (state) => { state.isStatusChanging = true; state.statusChangeError = null; state.successMessage = null; });
        builder.addCase(softDeleteUserSuperAdminAsync.fulfilled, (state, action) => { state.isStatusChanging = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User deleted successfully'; } });
        builder.addCase(softDeleteUserSuperAdminAsync.rejected, (state, action) => { state.isStatusChanging = false; state.statusChangeError = action.payload as string; });

        // Restore user (Super Admin only)
        builder.addCase(restoreUserSuperAdminAsync.pending, (state) => { state.isStatusChanging = true; state.statusChangeError = null; state.successMessage = null; });
        builder.addCase(restoreUserSuperAdminAsync.fulfilled, (state, action) => { state.isStatusChanging = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User restored successfully'; } });
        builder.addCase(restoreUserSuperAdminAsync.rejected, (state, action) => { state.isStatusChanging = false; state.statusChangeError = action.payload as string; });

        // Permanent delete user (Super Admin only)
        builder.addCase(permanentDeleteUserSuperAdminAsync.pending, (state) => { state.isPermanentDeleting = true; state.permanentDeleteError = null; state.successMessage = null; });
        builder.addCase(permanentDeleteUserSuperAdminAsync.fulfilled, (state, action) => { state.isPermanentDeleting = false; if (action.payload.success) { state.successMessage = action.payload.message || 'User permanently deleted'; } });
        builder.addCase(permanentDeleteUserSuperAdminAsync.rejected, (state, action) => { state.isPermanentDeleting = false; state.permanentDeleteError = action.payload as string; });
    },
});

export const { setSearchQuery, setRoleFilter, setStatusFilter, setCurrentPage, setPageSize, clearFilters, clearSelectedUserDetail, clearError, clearAllErrors, clearSuccessMessage, resetSuperAdminState } = superAdminSlice.actions;
export default superAdminSlice.reducer;

// Selectors
export const selectSuperAdminUsers = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.users;
export const selectSuperAdminTotalUsers = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.totalUsers;
export const selectSuperAdminCurrentPage = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.currentPage;
export const selectSuperAdminPageSize = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.pageSize;
export const selectSuperAdminTotalPages = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.totalPages;
export const selectSuperAdminSearchQuery = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.searchQuery;
export const selectSuperAdminRoleFilter = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.roleFilter;
export const selectSuperAdminStatusFilter = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.statusFilter;
export const selectSuperAdminStats = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.stats;
export const selectSuperAdminIsStatsLoading = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isStatsLoading;
export const selectSuperAdminSelectedUserDetail = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.selectedUserDetail;
export const selectSuperAdminIsUserDetailLoading = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isUserDetailLoading;
export const selectSuperAdminUserDetailError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.userDetailError;
export const selectSuperAdminIsLoading = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isLoading;
export const selectSuperAdminIsCreating = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isCreating;
export const selectSuperAdminIsCreatingAdmin = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isCreatingAdmin;
export const selectSuperAdminIsUpdating = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isUpdating;
export const selectSuperAdminIsPermanentDeleting = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isPermanentDeleting;
export const selectSuperAdminIsStatusChanging = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.isStatusChanging;
export const selectSuperAdminError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.error;
export const selectSuperAdminCreateError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.createError;
export const selectSuperAdminCreateAdminError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.createAdminError;
export const selectSuperAdminUpdateError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.updateError;
export const selectSuperAdminPermanentDeleteError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.permanentDeleteError;
export const selectSuperAdminStatusChangeError = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.statusChangeError;
export const selectSuperAdminSuccessMessage = (state: { superAdmin: SuperAdminUsersState }) => state.superAdmin.successMessage;
export type { SuperAdminUsersState };


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RoleType, StatusType } from '@/constants';
import {
    User,
    UserStats,
    UserDetail,
    AllUsersResponse,
    UserStatsResponse,
    UserDetailResponse,
    SearchUsersParams,
    FilterUsersParams,
    UserFilterParams,
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    ActionResponse,
} from './types';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    activateUser,
    deactivateUser,
    suspendUser,
    unlockUser,
    softDeleteUser,
    restoreUser,
    permanentDeleteUser,
    searchUsers,
    filterUsers,
    getUserStats,
} from './services';

// ============================================================================
// Types
// ============================================================================

interface AdminUsersState {
    // User list
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;

    // Selected user detail
    selectedUserDetail: UserDetail | null;

    // Filters & Search
    searchQuery: string;
    roleFilter: RoleType | '';
    statusFilter: StatusType | '';

    // Stats
    stats: UserStats | null;

    // Loading states
    isLoading: boolean;
    isStatsLoading: boolean;
    isUserDetailLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isStatusChanging: boolean;

    // Error states
    error: string | null;
    statsError: string | null;
    userDetailError: string | null;
    createError: string | null;
    updateError: string | null;
    statusChangeError: string | null;

    // Success messages
    successMessage: string | null;

    // Timestamps
    lastFetched: string | null;
    lastStatsFetched: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AdminUsersState = {
    users: [],
    totalUsers: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,

    selectedUserDetail: null,

    searchQuery: '',
    roleFilter: '',
    statusFilter: '',

    stats: null,

    isLoading: false,
    isStatsLoading: false,
    isUserDetailLoading: false,
    isCreating: false,
    isUpdating: false,
    isStatusChanging: false,

    error: null,
    statsError: null,
    userDetailError: null,
    createError: null,
    updateError: null,
    statusChangeError: null,

    successMessage: null,

    lastFetched: null,
    lastStatsFetched: null,
};

// ============================================================================
// Helper Functions
// ============================================================================

// Extract error message from various error types (axios, standard, etc.)
const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error && typeof error === 'object') {
        // Axios error with response
        if ('response' in error && error.response && typeof error.response === 'object') {
            const response = error.response as { data?: { message?: string } };
            if (response.data?.message) {
                return response.data.message;
            }
        }
        // Standard Error object
        if ('message' in error && (error as Error).message) {
            return (error as Error).message;
        }
    }
    return defaultMessage;
};

// ============================================================================
// Async Thunks
// ============================================================================

// Thunk params interface
interface FetchUsersParams {
    page?: number;
    size?: number;
    searchQuery?: string;
    roleFilter?: RoleType | '';
    statusFilter?: StatusType | '';
}

// Fetch users thunk - handles search, filter, and default pagination
export const fetchUsers = createAsyncThunk<AllUsersResponse, FetchUsersParams | void>(
    'admin/fetchUsers',
    async (params, { rejectWithValue }) => {
        try {
            const page = params?.page ?? 0;
            const size = params?.size ?? 10;
            const searchQuery = params?.searchQuery ?? '';
            const roleFilter = params?.roleFilter ?? '';
            const statusFilter = params?.statusFilter ?? '';

            let response: AllUsersResponse;

            // Use search endpoint if there's a search query
            if (searchQuery.trim()) {
                const searchParams: SearchUsersParams = {
                    keyword: searchQuery.trim(),
                    page,
                    size,
                };
                response = await searchUsers(searchParams);
            }
            // Use filter endpoint if there are filters applied
            else if (roleFilter || statusFilter) {
                const filterParams: FilterUsersParams = {
                    roles: roleFilter ? [roleFilter] : undefined,
                    statuses: statusFilter ? [statusFilter] : undefined,
                    page,
                    size,
                };
                response = await filterUsers(filterParams);
            }
            // Default: get all users
            else {
                const defaultParams: UserFilterParams = {
                    page,
                    size,
                    sortBy: 'id',
                    sortDirection: 'DESC',
                };
                response = await getAllUsers(defaultParams);
            }

            return response;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch users'));
        }
    }
);

// Fetch user stats thunk
export const fetchUserStats = createAsyncThunk<UserStatsResponse, void>(
    'admin/fetchUserStats',
    async (_, { rejectWithValue }) => {
        try {
            return await getUserStats();
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user stats'));
        }
    }
);

// Fetch user by ID thunk
export const fetchUserById = createAsyncThunk<UserDetailResponse, number>(
    'admin/fetchUserById',
    async (userId, { rejectWithValue }) => {
        try {
            return await getUserById(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user details'));
        }
    }
);

// Create user thunk
export const createUserAsync = createAsyncThunk<CreateUserResponse, CreateUserRequest>(
    'admin/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            return await createUser(userData);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to create user'));
        }
    }
);

// Update user thunk
interface UpdateUserParams {
    id: number;
    data: UpdateUserRequest;
}

export const updateUserAsync = createAsyncThunk<UpdateUserResponse, UpdateUserParams>(
    'admin/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await updateUserById(id, data);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to update user'));
        }
    }
);

// Activate user thunk
export const activateUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/activateUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await activateUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to activate user'));
        }
    }
);

// Deactivate user thunk
export const deactivateUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/deactivateUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await deactivateUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to deactivate user'));
        }
    }
);

// Suspend user thunk
export const suspendUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/suspendUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await suspendUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to suspend user'));
        }
    }
);

// Unlock user thunk
export const unlockUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/unlockUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await unlockUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to unlock user'));
        }
    }
);

// Soft delete user thunk
export const softDeleteUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/softDeleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await softDeleteUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to delete user'));
        }
    }
);

// Restore user thunk
export const restoreUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/restoreUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await restoreUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to restore user'));
        }
    }
);

// Permanent delete user thunk
export const permanentDeleteUserAsync = createAsyncThunk<ActionResponse, number>(
    'admin/permanentDeleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await permanentDeleteUser(userId);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to permanently delete user'));
        }
    }
);

// ============================================================================
// Admin Slice
// ============================================================================

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // Set search query
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.currentPage = 0;
        },

        // Set role filter
        setRoleFilter: (state, action: PayloadAction<RoleType | ''>) => {
            state.roleFilter = action.payload;
            state.currentPage = 0;
        },

        // Set status filter
        setStatusFilter: (state, action: PayloadAction<StatusType | ''>) => {
            state.statusFilter = action.payload;
            state.currentPage = 0;
        },

        // Set current page
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },

        // Set page size
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.currentPage = 0;
        },

        // Clear all filters
        clearFilters: (state) => {
            state.searchQuery = '';
            state.roleFilter = '';
            state.statusFilter = '';
            state.currentPage = 0;
        },

        // Clear selected user detail
        clearSelectedUserDetail: (state) => {
            state.selectedUserDetail = null;
            state.userDetailError = null;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Clear stats error
        clearStatsError: (state) => {
            state.statsError = null;
        },

        // Clear all errors
        clearAllErrors: (state) => {
            state.error = null;
            state.statsError = null;
            state.userDetailError = null;
            state.createError = null;
            state.updateError = null;
            state.statusChangeError = null;
        },

        // Clear success message
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },

        // Reset state
        resetAdminState: () => initialState,
    },
    extraReducers: (builder) => {
        // ================================================================
        // Fetch users
        // ================================================================
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success && action.payload.data) {
                    state.users = action.payload.data.content;
                    state.totalUsers = action.payload.data.totalElements;
                    state.totalPages = action.payload.data.totalPages;
                    state.currentPage = action.payload.data.pageNumber;
                } else {
                    state.users = [];
                    state.totalUsers = 0;
                    state.totalPages = 0;
                }
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.users = [];
                state.totalUsers = 0;
            });

        // ================================================================
        // Fetch user stats
        // ================================================================
        builder
            .addCase(fetchUserStats.pending, (state) => {
                state.isStatsLoading = true;
                state.statsError = null;
            })
            .addCase(fetchUserStats.fulfilled, (state, action) => {
                state.isStatsLoading = false;
                if (action.payload.success && action.payload.data) {
                    state.stats = action.payload.data;
                }
                state.lastStatsFetched = new Date().toISOString();
            })
            .addCase(fetchUserStats.rejected, (state, action) => {
                state.isStatsLoading = false;
                state.statsError = action.payload as string;
            });

        // ================================================================
        // Fetch user by ID
        // ================================================================
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.isUserDetailLoading = true;
                state.userDetailError = null;
                state.selectedUserDetail = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isUserDetailLoading = false;
                if (action.payload.success && action.payload.data) {
                    state.selectedUserDetail = action.payload.data;
                }
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isUserDetailLoading = false;
                state.userDetailError = action.payload as string;
            });

        // ================================================================
        // Create user
        // ================================================================
        builder
            .addCase(createUserAsync.pending, (state) => {
                state.isCreating = true;
                state.createError = null;
                state.successMessage = null;
            })
            .addCase(createUserAsync.fulfilled, (state, action) => {
                state.isCreating = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User created successfully';
                }
            })
            .addCase(createUserAsync.rejected, (state, action) => {
                state.isCreating = false;
                state.createError = action.payload as string;
            });

        // ================================================================
        // Update user
        // ================================================================
        builder
            .addCase(updateUserAsync.pending, (state) => {
                state.isUpdating = true;
                state.updateError = null;
                state.successMessage = null;
            })
            .addCase(updateUserAsync.fulfilled, (state, action) => {
                state.isUpdating = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User updated successfully';
                    // Update user in list if exists - map UserDetail to User format
                    const updatedUserDetail = action.payload.data;
                    if (updatedUserDetail) {
                        const index = state.users.findIndex(u => u.id === updatedUserDetail.id);
                        if (index !== -1) {
                            state.users[index] = {
                                id: updatedUserDetail.id,
                                email: updatedUserDetail.email,
                                fullName: updatedUserDetail.fullName,
                                profilePictureUrl: updatedUserDetail.profilePictureUrl,
                                role: updatedUserDetail.role,
                                userType: updatedUserDetail.userType,
                                active: updatedUserDetail.status === 'ACTIVE',
                                status: updatedUserDetail.status,
                            };
                        }
                        // Also update selectedUserDetail if viewing same user
                        if (state.selectedUserDetail?.id === updatedUserDetail.id) {
                            state.selectedUserDetail = updatedUserDetail;
                        }
                    }
                }
            })
            .addCase(updateUserAsync.rejected, (state, action) => {
                state.isUpdating = false;
                state.updateError = action.payload as string;
            });

        // ================================================================
        // Activate user
        // ================================================================
        builder
            .addCase(activateUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(activateUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User activated successfully';
                }
            })
            .addCase(activateUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Deactivate user
        // ================================================================
        builder
            .addCase(deactivateUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(deactivateUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User deactivated successfully';
                }
            })
            .addCase(deactivateUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Suspend user
        // ================================================================
        builder
            .addCase(suspendUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(suspendUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User suspended successfully';
                }
            })
            .addCase(suspendUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Unlock user
        // ================================================================
        builder
            .addCase(unlockUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(unlockUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User unlocked successfully';
                }
            })
            .addCase(unlockUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Soft delete user
        // ================================================================
        builder
            .addCase(softDeleteUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(softDeleteUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User deleted successfully';
                }
            })
            .addCase(softDeleteUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Restore user
        // ================================================================
        builder
            .addCase(restoreUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(restoreUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User restored successfully';
                }
            })
            .addCase(restoreUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
            });

        // ================================================================
        // Permanent delete user
        // ================================================================
        builder
            .addCase(permanentDeleteUserAsync.pending, (state) => {
                state.isStatusChanging = true;
                state.statusChangeError = null;
                state.successMessage = null;
            })
            .addCase(permanentDeleteUserAsync.fulfilled, (state, action) => {
                state.isStatusChanging = false;
                if (action.payload.success) {
                    state.successMessage = action.payload.message || 'User permanently deleted';
                }
            })
            .addCase(permanentDeleteUserAsync.rejected, (state, action) => {
                state.isStatusChanging = false;
                state.statusChangeError = action.payload as string;
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
    clearStatsError,
    clearAllErrors,
    clearSuccessMessage,
    resetAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================

// User list selectors
export const selectAdminUsers = (state: any) => state.admin.users as User[];
export const selectAdminTotalUsers = (state: any) => state.admin.totalUsers as number;
export const selectAdminCurrentPage = (state: any) => state.admin.currentPage as number;
export const selectAdminPageSize = (state: any) => state.admin.pageSize as number;
export const selectAdminTotalPages = (state: any) => state.admin.totalPages as number;

// Filter selectors
export const selectAdminSearchQuery = (state: any) => state.admin.searchQuery as string;
export const selectAdminRoleFilter = (state: any) => state.admin.roleFilter as RoleType | '';
export const selectAdminStatusFilter = (state: any) => state.admin.statusFilter as StatusType | '';

// Stats selectors
export const selectAdminStats = (state: any) => state.admin.stats as UserStats | null;

// Selected user detail selectors
export const selectSelectedUserDetail = (state: any) => state.admin.selectedUserDetail as UserDetail | null;
export const selectIsUserDetailLoading = (state: any) => state.admin.isUserDetailLoading as boolean;
export const selectUserDetailError = (state: any) => state.admin.userDetailError as string | null;

// Loading state selectors
export const selectAdminIsLoading = (state: any) => state.admin.isLoading as boolean;
export const selectAdminIsStatsLoading = (state: any) => state.admin.isStatsLoading as boolean;
export const selectIsCreating = (state: any) => state.admin.isCreating as boolean;
export const selectIsUpdating = (state: any) => state.admin.isUpdating as boolean;
export const selectIsStatusChanging = (state: any) => state.admin.isStatusChanging as boolean;

// Error selectors
export const selectAdminError = (state: any) => state.admin.error as string | null;
export const selectCreateError = (state: any) => state.admin.createError as string | null;
export const selectUpdateError = (state: any) => state.admin.updateError as string | null;
export const selectStatusChangeError = (state: any) => state.admin.statusChangeError as string | null;

// Success message selector
export const selectSuccessMessage = (state: any) => state.admin.successMessage as string | null;

// Export the state type for use in other files
export type { AdminUsersState };


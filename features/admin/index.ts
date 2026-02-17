export * from './services';
export * from './types';

// Export admin slice actions, thunks, and selectors
export {
    // Default reducer
    default as adminReducer,

    // Async Thunks
    fetchUsers,
    fetchUserStats,
    fetchUserById,
    createUserAsync,
    updateUserAsync,
    activateUserAsync,
    deactivateUserAsync,
    suspendUserAsync,
    unlockUserAsync,
    softDeleteUserAsync,
    restoreUserAsync,
    permanentDeleteUserAsync,

    // Actions
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

    // User list selectors
    selectAdminUsers,
    selectAdminTotalUsers,
    selectAdminCurrentPage,
    selectAdminPageSize,
    selectAdminTotalPages,

    // Filter selectors
    selectAdminSearchQuery,
    selectAdminRoleFilter,
    selectAdminStatusFilter,

    // Stats selectors
    selectAdminStats,
    selectAdminIsStatsLoading,

    // User detail selectors
    selectSelectedUserDetail,
    selectIsUserDetailLoading,
    selectUserDetailError,

    // Loading state selectors
    selectAdminIsLoading,
    selectIsCreating,
    selectIsUpdating,
    selectIsStatusChanging,

    // Error selectors
    selectAdminError,
    selectCreateError,
    selectUpdateError,
    selectStatusChangeError,

    // Success message selector
    selectSuccessMessage,

    // Types
    type AdminUsersState,
} from './adminSlice';

// Explicitly export service functions
export {
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
    ADMIN_USER_ENDPOINTS,
} from './services';

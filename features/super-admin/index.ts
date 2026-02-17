export * from './super-admin.types';
export * from './services';

// Explicit exports for super admin user management
export {
    getAllUsersSuperAdmin,
    getUserByIdSuperAdmin,
    createAdminUser,
    resetUserPassword,
    softDeleteUserSuperAdmin,
    restoreUserSuperAdmin,
    permanentDeleteUserSuperAdmin,
    getSuperAdminUserStats,
    SUPER_ADMIN_ENDPOINTS,
} from './services';

// Export super admin slice actions, thunks, and selectors
export {
    // Default reducer
    default as superAdminReducer,

    // Async Thunks
    fetchUsersSuperAdmin,
    fetchUserStatsSuperAdmin,
    fetchUserByIdSuperAdmin,
    createAdminUserAsync,
    resetUserPasswordAsync,
    softDeleteUserSuperAdminAsync,
    restoreUserSuperAdminAsync,
    permanentDeleteUserSuperAdminAsync,

    // Actions
    setSearchQuery as setSuperAdminSearchQuery,
    setRoleFilter as setSuperAdminRoleFilter,
    setStatusFilter as setSuperAdminStatusFilter,
    setCurrentPage as setSuperAdminCurrentPage,
    setPageSize as setSuperAdminPageSize,
    clearFilters as clearSuperAdminFilters,
    clearSelectedUserDetail as clearSuperAdminSelectedUserDetail,
    clearError as clearSuperAdminError,
    clearAllErrors as clearSuperAdminAllErrors,
    clearSuccessMessage as clearSuperAdminSuccessMessage,
    resetSuperAdminState,

    // Selectors
    selectSuperAdminUsers,
    selectSuperAdminTotalUsers,
    selectSuperAdminCurrentPage,
    selectSuperAdminPageSize,
    selectSuperAdminTotalPages,
    selectSuperAdminSearchQuery,
    selectSuperAdminRoleFilter,
    selectSuperAdminStatusFilter,
    selectSuperAdminStats,
    selectSuperAdminIsStatsLoading,
    selectSuperAdminSelectedUserDetail,
    selectSuperAdminIsUserDetailLoading,
    selectSuperAdminUserDetailError,
    selectSuperAdminIsLoading,
    selectSuperAdminIsCreatingAdmin,
    selectSuperAdminIsResettingPassword,
    selectSuperAdminIsPermanentDeleting,
    selectSuperAdminIsStatusChanging,
    selectSuperAdminError,
    selectSuperAdminCreateAdminError,
    selectSuperAdminResetPasswordError,
    selectSuperAdminPermanentDeleteError,
    selectSuperAdminStatusChangeError,
    selectSuperAdminSuccessMessage,

    // Types
    type SuperAdminUsersState,
} from './superAdminSlice';


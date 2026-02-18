export * from './super-admin.types';
export * from './services';

// Explicit exports for super admin user management services
export {
    getAllUsersSuperAdmin,
    getUserByIdSuperAdmin,
    createUserSuperAdmin,
    createAdminUser,
    updateUserByIdSuperAdmin,
    activateUserSuperAdmin,
    deactivateUserSuperAdmin,
    suspendUserSuperAdmin,
    unlockUserSuperAdmin,
    softDeleteUserSuperAdmin,
    restoreUserSuperAdmin,
    permanentDeleteUserSuperAdmin,
    getSuperAdminUserStats,
    // Admin User Management Services (Super Admin Exclusive)
    getAllAdminUsers,
    getAdminUserById,
    updateAdminUser,
    softDeleteAdminUser,
    permanentDeleteAdminUser,
    restoreAdminUser,
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
    createUserSuperAdminAsync,
    createAdminUserAsync,
    updateUserSuperAdminAsync,
    activateUserSuperAdminAsync,
    deactivateUserSuperAdminAsync,
    suspendUserSuperAdminAsync,
    unlockUserSuperAdminAsync,
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
    selectSuperAdminIsCreating,
    selectSuperAdminIsCreatingAdmin,
    selectSuperAdminIsUpdating,
    selectSuperAdminIsPermanentDeleting,
    selectSuperAdminIsStatusChanging,
    selectSuperAdminError,
    selectSuperAdminCreateError,
    selectSuperAdminCreateAdminError,
    selectSuperAdminUpdateError,
    selectSuperAdminPermanentDeleteError,
    selectSuperAdminStatusChangeError,
    selectSuperAdminSuccessMessage,

    // Types
    type SuperAdminUsersState,
} from './superAdminSlice';

// Export admin user management slice (Super Admin Exclusive)
export {
    default as adminUserManagementReducer,
    // Thunks
    fetchAdminUsers,
    fetchAdminUserById,
    createAdminUserAsync as createAdminUserManagementAsync,
    updateAdminUserAsync,
    softDeleteAdminUserAsync,
    permanentDeleteAdminUserAsync,
    restoreAdminUserAsync,
    // Actions
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
    // Selectors
    selectAdminUsers,
    selectTotalAdminUsers,
    selectAdminCurrentPage,
    selectAdminPageSize,
    selectAdminTotalPages,
    selectAdminSearchQuery,
    selectAdminStatusFilter,
    selectSelectedAdminDetail,
    selectIsAdminDetailLoading,
    selectAdminDetailError,
    selectIsAdminUsersLoading,
    selectIsCreatingAdmin,
    selectIsUpdatingAdmin,
    selectIsSoftDeletingAdmin,
    selectIsPermanentDeletingAdmin,
    selectIsRestoringAdmin,
    selectAdminUsersError,
    selectAdminCreateError,
    selectAdminUpdateError,
    selectAdminDeleteError,
    selectAdminRestoreError,
    selectAdminSuccessMessage,
    // Types
    type AdminUserManagementState,
} from './adminUserManagementSlice';


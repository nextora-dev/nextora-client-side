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
    setAdminSearchQuery as setAdminMgmtSearchQuery,
    setAdminStatusFilter as setAdminMgmtStatusFilter,
    setAdminCurrentPage as setAdminMgmtCurrentPage,
    setAdminPageSize as setAdminMgmtPageSize,
    clearAdminFilters as clearAdminMgmtFilters,
    clearSelectedAdminDetail,
    clearAdminError as clearAdminMgmtError,
    clearAllAdminErrors as clearAllAdminMgmtErrors,
    clearAdminSuccessMessage as clearAdminMgmtSuccessMessage,
    resetAdminUserManagementState,
    // Selectors
    selectAdminUsers as selectAdminMgmtUsers,
    selectTotalAdminUsers as selectAdminMgmtTotalUsers,
    selectAdminCurrentPage as selectAdminMgmtCurrentPage,
    selectAdminPageSize as selectAdminMgmtPageSize,
    selectAdminTotalPages as selectAdminMgmtTotalPages,
    selectAdminSearchQuery as selectAdminMgmtSearchQuery,
    selectAdminStatusFilter as selectAdminMgmtStatusFilter,
    selectSelectedAdminDetail,
    selectIsAdminDetailLoading,
    selectAdminDetailError,
    selectIsAdminUsersLoading,
    selectIsCreatingAdmin as selectIsCreatingAdminUser,
    selectIsUpdatingAdmin as selectIsUpdatingAdminUser,
    selectIsSoftDeletingAdmin,
    selectIsPermanentDeletingAdmin,
    selectIsRestoringAdmin,
    selectAdminUsersError as selectAdminMgmtError,
    selectAdminCreateError as selectAdminMgmtCreateError,
    selectAdminUpdateError as selectAdminMgmtUpdateError,
    selectAdminDeleteError as selectAdminMgmtDeleteError,
    selectAdminRestoreError as selectAdminMgmtRestoreError,
    selectAdminSuccessMessage as selectAdminMgmtSuccessMessage,
    // Types
    type AdminUserManagementState,
} from './adminUserManagementSlice';


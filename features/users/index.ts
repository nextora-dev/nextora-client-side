// ============================================================================
// Unified Types (RECOMMENDED - Use these for new code)
// ============================================================================
export {
    // Generic types
    type ApiResponse,
    type PaginatedApiResponse,
    type RoleSpecificDataMap,
    type AnyRoleSpecificData,
    type BaseUserProfile,
    type UserProfile,
    type TypedUserProfile,
    type UpdateProfileRequest,
    type UpdateRoleSpecificDataRequest,
    type ExtractRoleData,
    type PartialBy,
    // Type aliases for convenience
    type StudentProfile,
    type AcademicStaffProfile,
    type NonAcademicStaffProfile,
    type AdminProfile,
    type SuperAdminProfile,
    // Response type aliases
    type UserProfileResponse,
    type StudentProfileResponse,
    type AcademicStaffProfileResponse,
    type NonAcademicStaffProfileResponse,
    type AdminProfileResponse,
    type SuperAdminProfileResponse,
    // Type guards
    isStudentProfile,
    isAcademicStaffProfile,
    isNonAcademicStaffProfile,
    isAdminProfile,
    isSuperAdminProfile,
    // Helper functions
    getStudentData,
    getAcademicStaffData,
    getNonAcademicStaffData,
    getAdminData,
} from './unified-user.types';

// ============================================================================
// Services
// ============================================================================
export * from './services';

// ============================================================================
// Redux Slice Exports
// ============================================================================
export {
    default as userReducer,
    fetchUserProfile,
    updateUserProfile,
    changePasswordAsync,
    setProfile,
    updateProfile,
    clearProfile,
    clearError as clearUserError,
    clearPasswordChangeMessages,
    setLoading,
    selectUserProfile,
    selectUserIsLoading,
    selectUserError,
    selectUserLastUpdated,
    selectIsChangingPassword,
    selectPasswordChangeError,
    selectPasswordChangeSuccess,
} from './userSlice';

// ============================================================================
// Legacy Exports (DEPRECATED - kept for backward compatibility)
// These will be removed in future versions. Use unified types instead.
// ============================================================================
// export * from './student.types';
// export * from './academicStaff.types';
// export * from './non-academicStaff.types';
// export * from './admin.types';

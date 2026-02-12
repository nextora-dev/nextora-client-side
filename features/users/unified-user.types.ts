import { RoleType } from '@/constants';
import { StatusType } from '@/constants/status';
import {
    StudentRoleSpecificData,
    AcademicStaffRoleSpecificData,
    NonAcademicStaffRoleSpecificData,
    AdminRoleSpecificData,
    SuperAdminRoleSpecificData,
} from '@/types/user';

// ============================================================================
// Generic API Response Types
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

// ============================================================================
// Role-Specific Data Type Map
// ============================================================================

export interface RoleSpecificDataMap {
    ROLE_STUDENT: StudentRoleSpecificData;
    ROLE_ACADEMIC_STAFF: AcademicStaffRoleSpecificData;
    ROLE_NON_ACADEMIC_STAFF: NonAcademicStaffRoleSpecificData;
    ROLE_ADMIN: AdminRoleSpecificData;
    ROLE_SUPER_ADMIN: SuperAdminRoleSpecificData;
}

export type AnyRoleSpecificData =
    | StudentRoleSpecificData
    | AcademicStaffRoleSpecificData
    | NonAcademicStaffRoleSpecificData
    | AdminRoleSpecificData
    | SuperAdminRoleSpecificData;

// ============================================================================
// Generic User Profile Types (Eliminates Duplication!)
// ============================================================================

export interface BaseUserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    profilePictureUrl: string | null;
    role: RoleType;
    status: StatusType;
    userType: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile<T extends AnyRoleSpecificData = AnyRoleSpecificData> extends BaseUserProfile {
    roleSpecificData: T;
}

export type TypedUserProfile<R extends keyof RoleSpecificDataMap> = UserProfile<RoleSpecificDataMap[R]>;

// ============================================================================
// Convenience Type Aliases (for backward compatibility & readability)
// ============================================================================

/** Student profile type alias */
export type StudentProfile = UserProfile<StudentRoleSpecificData>;

/** Academic staff profile type alias */
export type AcademicStaffProfile = UserProfile<AcademicStaffRoleSpecificData>;

/** Non-academic staff profile type alias */
export type NonAcademicStaffProfile = UserProfile<NonAcademicStaffRoleSpecificData>;

/** Admin profile type alias */
export type AdminProfile = UserProfile<AdminRoleSpecificData>;

/** Super admin profile type alias */
export type SuperAdminProfile = UserProfile<SuperAdminRoleSpecificData>;

// ============================================================================
// API Response Type Aliases (Replaces duplicate *ProfileResponse types)
// ============================================================================

/** Generic profile response */
export type UserProfileResponse<T extends AnyRoleSpecificData = AnyRoleSpecificData> = ApiResponse<UserProfile<T>>;

/** Student profile response */
export type StudentProfileResponse = ApiResponse<StudentProfile>;

/** Academic staff profile response */
export type AcademicStaffProfileResponse = ApiResponse<AcademicStaffProfile>;

/** Non-academic staff profile response */
export type NonAcademicStaffProfileResponse = ApiResponse<NonAcademicStaffProfile>;

/** Admin profile response */
export type AdminProfileResponse = ApiResponse<AdminProfile>;

/** Super admin profile response */
export type SuperAdminProfileResponse = ApiResponse<SuperAdminProfile>;

// ============================================================================
// Type Guards (Runtime type checking with TypeScript narrowing)
// ============================================================================

/**
 * Type guard to check if profile is a student profile
 */
export function isStudentProfile(profile: UserProfile | null | undefined): profile is StudentProfile {
    if (!profile || !profile.roleSpecificData) return false;
    return profile.role === 'ROLE_STUDENT' && 'studentId' in profile.roleSpecificData;
}

/**
 * Type guard for academic staff profile
 */
export function isAcademicStaffProfile(profile: UserProfile | null | undefined): profile is AcademicStaffProfile {
    if (!profile || !profile.roleSpecificData) return false;
    return profile.role === 'ROLE_ACADEMIC_STAFF' && 'employeeId' in profile.roleSpecificData;
}

/**
 * Type guard for non-academic staff profile
 */
export function isNonAcademicStaffProfile(profile: UserProfile | null | undefined): profile is NonAcademicStaffProfile {
    if (!profile || !profile.roleSpecificData) return false;
    return profile.role === 'ROLE_NON_ACADEMIC_STAFF' && 'employeeId' in profile.roleSpecificData;
}

/**
 * Type guard for admin profile
 */
export function isAdminProfile(profile: UserProfile | null | undefined): profile is AdminProfile {
    if (!profile || !profile.roleSpecificData) return false;
    return profile.role === 'ROLE_ADMIN' && 'adminId' in profile.roleSpecificData;
}

/**
 * Type guard for super admin profile
 */
export function isSuperAdminProfile(profile: UserProfile | null | undefined): profile is SuperAdminProfile {
    if (!profile || !profile.roleSpecificData) return false;
    return profile.role === 'ROLE_SUPER_ADMIN' && 'superAdminId' in profile.roleSpecificData;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract role-specific data type from a profile type
 * @example
 * type StudentData = ExtractRoleData<StudentProfile>; // StudentRoleSpecificData
 */
export type ExtractRoleData<T> = T extends UserProfile<infer R> ? R : never;

/**
 * Make certain fields of a type optional
 * @example
 * type PartialUser = PartialBy<UserProfile, 'phoneNumber' | 'profilePictureUrl'>;
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Profile update request type (excludes read-only fields)
 * Use this for PATCH/PUT requests to update profile
 */
export type UpdateProfileRequest<T extends AnyRoleSpecificData = AnyRoleSpecificData> = Partial<
    Omit<UserProfile<T>, 'id' | 'email' | 'role' | 'createdAt' | 'updatedAt'>
>;

/**
 * Role-specific data update request
 */
export type UpdateRoleSpecificDataRequest<T extends AnyRoleSpecificData> = Partial<T>;

// ============================================================================
// Helper function to get role-specific data safely
// ============================================================================

/**
 * Safely get student-specific data from any profile
 * Returns null if profile is not a student
 */
export function getStudentData(profile: UserProfile | null): StudentRoleSpecificData | null {
    if (profile && isStudentProfile(profile)) {
        return profile.roleSpecificData;
    }
    return null;
}

/**
 * Safely get academic staff data from any profile
 */
export function getAcademicStaffData(profile: UserProfile | null): AcademicStaffRoleSpecificData | null {
    if (profile && isAcademicStaffProfile(profile)) {
        return profile.roleSpecificData;
    }
    return null;
}

/**
 * Safely get non-academic staff data from any profile
 */
export function getNonAcademicStaffData(profile: UserProfile | null): NonAcademicStaffRoleSpecificData | null {
    if (profile && isNonAcademicStaffProfile(profile)) {
        return profile.roleSpecificData;
    }
    return null;
}

/**
 * Safely get admin data from any profile
 */
export function getAdminData(profile: UserProfile | null): AdminRoleSpecificData | null {
    if (profile && isAdminProfile(profile)) {
        return profile.roleSpecificData;
    }
    return null;
}

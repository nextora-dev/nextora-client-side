/**
 * Admin User Management Types
 * @description Types for admin user management operations
 */

import { RoleType, StatusType } from '@/constants';

export interface AllUsersResponse {
    success: boolean;
    message: string;
    data: UsersData;
    timestamp: string;
}
export interface UsersData {
    content: User[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface User {
    id: number;
    email: string;
    fullName: string;
    profilePictureUrl: string | null;
    role: RoleType;
    userType: string;
    active: boolean;
    status: StatusType;
}

// ============================================================================
// User Detail Types (for getUserById)
// ============================================================================

export interface UserDetailResponse {
    success: boolean;
    message: string;
    data: UserDetail;
    timestamp: string;
}

export interface UserDetail {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber: string | null;
    profilePictureUrl: string | null;
    role: RoleType;
    status: StatusType;
    userType: string;
    createdAt: string;
    updatedAt: string;
    roleSpecificData: UserRoleSpecificData;
}

// Union type for all role-specific data
export type UserRoleSpecificData =
    | StudentRoleSpecificData
    | AcademicStaffRoleSpecificData
    | NonAcademicStaffRoleSpecificData
    | AdminRoleSpecificData
    | null;

// Student role-specific data
export interface StudentRoleSpecificData {
    studentId: string;
    address: string | null;
    batch: string | null;
    enrollmentDate: string | null;
    dateOfBirth: string | null;
    program: string | null;
    faculty: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    studentRoleTypes: string[];
    studentRoleDisplayName: string;
    primaryRoleType: string;
    // Club member data (optional)
    clubMemberData?: ClubMemberData;
    // Class rep data (optional)
    classRepData?: ClassRepData;
}

export interface ClubMemberData {
    clubName: string;
    clubPosition: string;
    clubMembershipId: string;
    clubJoinDate: string;
}

export interface ClassRepData {
    representingClass: string;
    representingBatch: string;
    appointmentDate: string;
}

// Academic staff role-specific data
export interface AcademicStaffRoleSpecificData {
    employeeId: string;
    department: string | null;
    faculty: string | null;
    position: string | null;
    designation: string | null;
    specialization: string | null;
    officeLocation: string | null;
    officeHours: string | null;
}

// Non-academic staff role-specific data
export interface NonAcademicStaffRoleSpecificData {
    employeeId: string;
    department: string | null;
    position: string | null;
    workShift: string | null;
    supervisorId: number | null;
}

// Admin role-specific data
export interface AdminRoleSpecificData {
    adminLevel: string | null;
    permissions: string[];
    managedDepartments: string[];
}

// ============================================================================
// Existing Types
// ============================================================================

// Create user request
export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email :string;
    phone: string;
    role: RoleType;

    studentId?: string;
    batch?: string;
    program?: string;
    faculty?: string;
    dateOfBirth?: string;
    address?: string;

    employeeId?: string;
    department?: string;
    position?: string;
    designation?: string;
}

export interface CreateUserResponse {
    success: boolean;
    message: string;
    data: UserData;
    timestamp: string;
}

export interface UserData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleType;
    status: StatusType;
    message: string;
    roleSpecificData: RoleSpecificData;
}

export type RoleSpecificData = AcademicStaffData | StudentData | NonAcademicStaffData;

export interface AcademicStaffData {
    employeeId: string;
    position: string;
    designation: string;
    department: string;
    faculty: string;
}

export interface StudentData {
    studentId: string;
    address: string;
    batch: string;
    dateOfBirth: string;
    program: string;
    faculty: string;
}

export interface NonAcademicStaffData {
    employeeId: string;
    position: string;
    department: string;
}

// Update user request (Admin can update user details - no profile picture)
export interface UpdateUserRequest {
    // Basic user fields
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;

    // Guardian fields (for students)
    guardianName?: string;
    guardianPhone?: string;

    // Club Member fields (if applicable)
    clubName?: string;
    clubPosition?: string;
    clubJoinDate?: string;
    clubMembershipId?: string;

    // Kuppi Student fields (if applicable)
    kuppiSubjects?: string[];
    kuppiExperienceLevel?: string;
    kuppiAvailability?: string;

    // Batch Rep fields (if applicable)
    batchRepYear?: string;
    batchRepSemester?: string;
    batchRepElectedDate?: string;
    batchRepResponsibilities?: string;

    // Academic Staff fields (if applicable)
    designation?: string;
    specialization?: string;
    officeLocation?: string;
    bio?: string;
    availableForMeetings?: boolean;
    responsibilities?: string;

    // Non-Academic Staff fields (if applicable)
    workLocation?: string;
    shift?: string;
}

// Update user response
export interface UpdateUserResponse {
    success: boolean;
    message: string;
    data: UserDetail;
    timestamp: string;
}

// User filter params
export interface UserFilterParams {
    page?: number;
    size?: number;
    sortBy?:  string;
    sortDirection?: 'ASC' | 'DESC';
}

// Action response
export interface ActionResponse {
    success: boolean;
    message: string;
}

// Search users params
export interface SearchUsersParams {
    keyword: string;
    page?: number;
    size?: number;
}

// Filter users params
export interface FilterUsersParams {
    roles?: RoleType[];
    statuses?: StatusType[];
    page?: number;
    size?: number;
}

// User stats response
export interface UserStatsResponse {
    success: boolean;
    message: string;
    data: UserStats;
    timestamp: string;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    deactivatedUsers: number;
    suspendedUsers: number;
    deletedUsers: number;
    pendingVerificationUsers: number;
    passwordChangeRequiredUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalSuperAdmins: number;
    totalAcademicStaff: number;
    totalNonAcademicStaff: number;
}


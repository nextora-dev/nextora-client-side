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
}

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

// Update user request
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: RoleType;
    profilePicture?: File | null;
    deleteProfilePicture?: boolean;
    // Role-specific fields
    faculty?: string;
    department?: string;
    program?: string;
    batch?: string;
    position?: string;
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


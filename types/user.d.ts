// User Types
import { RoleType } from '@/constants';
import { PermissionType } from '@/constants';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleType;
    authorities: PermissionType[];
    verified: boolean;
    createdAt?: string;
    updatedAt?: string;
    profile?: UserProfile;
}

export interface UserProfile {
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
    address?: string;
    bio?: string;

    // Student-specific
    studentId?: string;
    batch?: string;
    program?: string;
    faculty?: string;
    guardianName?: string;
    guardianPhone?: string;
    studentSubRole?: StudentSubRole;

    // Staff/Lecturer-specific
    employeeId?: string;
    department?: string;
    designation?: string;
    specialization?: string;
    qualifications?: string[];
    officeLocation?: string;
    joinDate?: string;

    // Admin-specific
    adminId?: string;
    assignedDate?: string;

    // Super Admin-specific
    superAdminId?: string;
    accessLevel?: string;
}

export type StudentSubRole = 'normal' | 'club-member' | 'kuppi-mentor' | 'batch-rep';

export interface UserListItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleType;
    verified: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: RoleType;
    profile?: Partial<UserProfile>;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    role?: RoleType;
    verified?: boolean;
    profile?: Partial<UserProfile>;
}

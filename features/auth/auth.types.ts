// Auth Types
import { RoleType } from '@/constants';
import { PermissionType } from '@/constants';
// import { TokenType } from '@/types/jwt';
// import {
//     AcademicStaffRoleSpecificData,
//     AdminRoleSpecificData,
//     NonAcademicStaffRoleSpecificData,
//     StudentRoleSpecificData, SuperAdminRoleSpecificData
// } from "@/types/user";

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleType;
    authorities: PermissionType[];
}

export interface LoginRequest {
    email: string;
    password: string;
    role: string;
}

// Alias for backward compatibility
export type LoginCredentials = LoginRequest;

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string | number;
    // These fields can be at root level or nested in user object
    userId?: string | number;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: RoleType;
    userType?: string;
    authorities?: PermissionType[];
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: RoleType;
        authorities: PermissionType[];
        verified?: boolean;
    };
}

// export interface LoginResponse {
//     accessToken: string;
//     refreshToken: string;
//     tokenType: TokenType;
//     expiresIn: string;
//     userId: number;
//     email: string;
//     firstName: string;
//     lastName: string;
//     role: RoleType;
//     userType: string;
//     roleSpecificData : StudentRoleSpecificData | AcademicStaffRoleSpecificData | NonAcademicStaffRoleSpecificData | AdminRoleSpecificData | SuperAdminRoleSpecificData;
// }

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

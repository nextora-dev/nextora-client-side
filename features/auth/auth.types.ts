// Auth Types
import { RoleType } from '@/constants';
import { PermissionType } from '@/constants';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleType;
    authorities: PermissionType[];
    verified: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
    role: string;
}

export interface RegisterData {
    // Basic Information
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    role: RoleType;

    // Student-specific
    studentId?: string;
    batch?: string;
    program?: string;
    faculty?: string;
    dateOfBirth?: string;
    address?: string;
    guardianName?: string;
    guardianPhone?: string;
    studentSubRole?: 'normal' | 'club-member' | 'kuppi-mentor' | 'batch-rep';

    // Club Member fields
    clubName?: string;
    clubPosition?: string;
    clubJoinDate?: string;
    clubMembershipId?: string;

    // Kuppi Mentor fields
    kuppiSubjects?: string[];
    experienceLevel?: string;
    availability?: string;

    // Batch Rep fields
    batchRepYear?: string;
    batchRepSemester?: string;
    electedDate?: string;
    responsibilities?: string;

    // Staff/Lecturer fields
    employeeId?: string;
    department?: string;
    designation?: string;
    specialization?: string;
    qualifications?: string[];
    officeLocation?: string;
    bio?: string;
    position?: string;
    joinDate?: string;

    // Admin fields
    adminId?: string;
    permissions?: PermissionType[];
    assignedDate?: string;

    // Super Admin fields
    superAdminId?: string;
    accessLevel?: string;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: AuthUser;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface VerifyEmailData {
    token: string;
}

// OTP Verification Types
export interface SendOtpData {
    email: string;
}

export interface VerifyOtpData {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    verified: boolean;
    token: string; // Reset token to use for password reset
    message: string;
}

export interface ResendOtpData {
    email: string;
}

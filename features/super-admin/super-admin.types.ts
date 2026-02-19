// Super Admin Types
export interface SystemSettings {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    passwordMinLength: number;
    allowedDomains: string[];
}

export interface AuditLog {
    id: string;
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    details?: Record<string, unknown>;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: { status: string; latency: number };
    cache: { status: string; hitRate: number };
    storage: { status: string; usedSpace: number; totalSpace: number };
    uptime: number;
    version: string;
}

export interface BackupInfo {
    id: string;
    type: 'full' | 'incremental';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    size: number;
    createdAt: string;
    completedAt?: string;
}

// ============================================================================
// Super Admin User Management Types
// ============================================================================

// Create Admin Request - matches backend CreateAdminRequest
export interface CreateAdminRequest {
    email: string;           // Required
    password: string;        // Required, min 8 characters
    firstName: string;       // Required
    lastName: string;        // Required
    adminId: string;         // Required
    department: string;      // Required
    phone?: string;          // Optional
}

// Create Admin Response
export interface CreateAdminResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        temporaryPassword?: string; // Only returned on creation for initial setup
        message: string;
    };
    timestamp: string;
}

// Reset Password Response
export interface ResetPasswordResponse {
    success: boolean;
    message: string;
    data?: {
        email: string;
        passwordResetSent: boolean;
    };
    timestamp: string;
}

// Permanent Delete Response
export interface PermanentDeleteResponse {
    success: boolean;
    message: string;
    data?: {
        deletedUserId: number;
        deletedAt: string;
    };
    timestamp: string;
}

// Super Admin User Stats
export interface SuperAdminUserStats {
    totalUsers: number;
    activeUsers: number;
    deactivatedUsers: number;
    suspendedUsers: number;
    deletedUsers: number;
    passwordChangeRequiredUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalSuperAdmins: number;
    totalAcademicStaff: number;
    totalNonAcademicStaff: number;
}

// Super Admin User Stats Response
export interface SuperAdminUserStatsResponse {
    success: boolean;
    message: string;
    data: SuperAdminUserStats;
    timestamp: string;
}

// ============================================================================
// Admin User Management Types (Super Admin Exclusive)
// ============================================================================

// Admin User interface
export interface AdminUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string | null;
    phoneNumber?: string | null; // Backend might use this field name
    profilePictureUrl: string | null;
    role: 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
    status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'DELETED' | 'PASSWORD_CHANGE_REQUIRED';
    userType: string;
    department?: string;
    permissions?: string[];
    createdAt: string;
    updatedAt: string;
}

// Admin User Detail
export interface AdminUserDetail extends AdminUser {
    roleSpecificData?: {
        employeeId?: string;
        adminId?: string;
        department?: string;
        position?: string;
        phone?: string;
        adminLevel?: 'STANDARD' | 'SENIOR';
        permissions?: string[];
    };
}

// Update Admin Request
export interface UpdateAdminRequest {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    permissions?: string[];
}

// Admin Users Response (paginated)
export interface AdminUsersResponse {
    success: boolean;
    message: string;
    data: {
        content: AdminUser[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
    timestamp: string;
}

// Admin User Detail Response
export interface AdminUserDetailResponse {
    success: boolean;
    message: string;
    data: AdminUserDetail;
    timestamp: string;
}

// Update Admin Response
export interface UpdateAdminResponse {
    success: boolean;
    message: string;
    data?: AdminUser;
    timestamp: string;
}

// Admin User Action Response
export interface AdminUserActionResponse {
    success: boolean;
    message: string;
    data?: {
        adminId: number;
        action: string;
        timestamp: string;
    };
    timestamp: string;
}

// Admin User Stats
export interface AdminUserStats {
    totalAdmins: number;
    activeAdmins: number;
    deactivatedAdmins: number;
    suspendedAdmins: number;
    deletedAdmins: number;
    standardAdmins: number;
    seniorAdmins: number;
}

// Admin User Stats Response
export interface AdminUserStatsResponse {
    success: boolean;
    message: string;
    data: AdminUserStats;
    timestamp: string;
}

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

// Create Admin Request
export interface CreateAdminRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    adminLevel?: 'STANDARD' | 'SENIOR';
    department?: string;
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


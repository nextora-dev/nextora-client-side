// Super Admin Services - API calls for system administration
import apiClient from '../../lib/api-client';
import {
    CreateAdminRequest,
    CreateAdminResponse,
    PermanentDeleteResponse,
    SuperAdminUserStatsResponse,
    AdminUsersResponse,
    AdminUserDetailResponse,
    UpdateAdminRequest,
    UpdateAdminResponse,
    AdminUserActionResponse,
} from '@/features';
import {
    ActionResponse,
    AllUsersResponse,
    UserFilterParams,
    UserDetailResponse,
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    SearchUsersParams,
    FilterUsersParams,
} from '@/features';

const SUPER_ADMIN_ENDPOINTS = {
    // User management endpoints (same as admin)
    USERS: '/admin/user/get-all-users',
    USER_BY_ID: (id: number) => `/admin/user/${id}`,
    ACTIVATE_USER: (id: number) => `/admin/user/${id}/activate`,
    DEACTIVATE_USER: (id: number) => `/admin/user/${id}/deactivate`,
    SUSPEND_USER: (id: number) => `/admin/user/${id}/suspend`,
    UNLOCK_USER: (id: number) => `/admin/user/${id}/unlock`,
    SOFT_DELETE: (id: number) => `/admin/user/${id}`,
    SEARCH_USERS: '/admin/user/search',
    FILTER_USERS: '/admin/user/filter',
    USER_STATS: '/admin/user/stats',
    // Super Admin only endpoints
    CREATE_ADMIN: '/super-admin/user/admin',
    PERMANENT_DELETE: (id: number) => `/super-admin/user/${id}/permanent`,
    RESTORE_USER: (id: number) => `/super-admin/user/${id}/restore`,
    // Admin User Management (Super Admin Exclusive)
    ADMIN_USERS: '/admin/admin-users',
    ADMIN_USER_BY_ID: (adminId: number) => `/admin/admin-users/${adminId}`,
    ADMIN_USER_SOFT_DELETE: (adminId: number) => `/admin/admin-users/${adminId}`,
    ADMIN_USER_PERMANENT_DELETE: (adminId: number) => `/admin/admin-users/${adminId}/permanent`,
    ADMIN_USER_RESTORE: (adminId: number) => `/admin/admin-users/${adminId}/restore`,
};

// ============================================================================
// Super Admin User Management Services
// ============================================================================

// Get all users with pagination
export async function getAllUsersSuperAdmin(params: UserFilterParams = {}): Promise<AllUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    const url = `${SUPER_ADMIN_ENDPOINTS.USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AllUsersResponse>(url);
    return response.data;
}

// Get user by ID with full details
export async function getUserByIdSuperAdmin(id: number): Promise<UserDetailResponse> {
    const response = await apiClient.get<UserDetailResponse>(SUPER_ADMIN_ENDPOINTS.USER_BY_ID(id));
    return response.data;
}

// Create new user (same as admin)
export async function createUserSuperAdmin(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post<CreateUserResponse>(SUPER_ADMIN_ENDPOINTS.USERS, data);
    return response.data;
}

// Create new admin user (Super Admin only)
export async function createAdminUser(data: CreateAdminRequest): Promise<CreateAdminResponse> {
    const response = await apiClient.post<CreateAdminResponse>(SUPER_ADMIN_ENDPOINTS.CREATE_ADMIN, data);
    return response.data;
}

// Update user by ID
export async function updateUserByIdSuperAdmin(id: number, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const cleanedData: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            cleanedData[key] = value;
        }
    });
    const response = await apiClient.put<UpdateUserResponse>(
        SUPER_ADMIN_ENDPOINTS.USER_BY_ID(id),
        cleanedData,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
}

// Activate user account
export async function activateUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(SUPER_ADMIN_ENDPOINTS.ACTIVATE_USER(id));
    return response.data;
}

// Deactivate user account
export async function deactivateUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(SUPER_ADMIN_ENDPOINTS.DEACTIVATE_USER(id));
    return response.data;
}

// Suspend user account
export async function suspendUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(SUPER_ADMIN_ENDPOINTS.SUSPEND_USER(id));
    return response.data;
}

// Unlock suspended user account
export async function unlockUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(SUPER_ADMIN_ENDPOINTS.UNLOCK_USER(id));
    return response.data;
}

// Soft delete user account
export async function softDeleteUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.delete<ActionResponse>(SUPER_ADMIN_ENDPOINTS.SOFT_DELETE(id));
    return response.data;
}

// Restore soft-deleted user (Super Admin only)
export async function restoreUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(SUPER_ADMIN_ENDPOINTS.RESTORE_USER(id));
    return response.data;
}

// Permanently delete user (Super Admin only - irreversible)
export async function permanentDeleteUserSuperAdmin(id: number): Promise<PermanentDeleteResponse> {
    const response = await apiClient.delete<PermanentDeleteResponse>(SUPER_ADMIN_ENDPOINTS.PERMANENT_DELETE(id));
    return response.data;
}

// Search users by keyword
export async function searchUsersSuperAdmin(params: SearchUsersParams): Promise<AllUsersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', params.keyword);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    const url = `${SUPER_ADMIN_ENDPOINTS.SEARCH_USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AllUsersResponse>(url);
    return response.data;
}

// Filter users by roles and statuses
export async function filterUsersSuperAdmin(params: FilterUsersParams): Promise<AllUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params.roles && params.roles.length > 0) {
        params.roles.forEach(role => queryParams.append('roles', role));
    }
    if (params.statuses && params.statuses.length > 0) {
        params.statuses.forEach(status => queryParams.append('statuses', status));
    }
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    const url = `${SUPER_ADMIN_ENDPOINTS.FILTER_USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AllUsersResponse>(url);
    return response.data;
}

// Get user statistics
export async function getSuperAdminUserStats(): Promise<SuperAdminUserStatsResponse> {
    const response = await apiClient.get<SuperAdminUserStatsResponse>(SUPER_ADMIN_ENDPOINTS.USER_STATS);
    return response.data;
}

// ============================================================================
// Admin User Management Services (Super Admin Exclusive)
// ============================================================================

// Get all admin users with pagination
export async function getAllAdminUsers(params: UserFilterParams = {}): Promise<AdminUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    const url = `${SUPER_ADMIN_ENDPOINTS.ADMIN_USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AdminUsersResponse>(url);
    return response.data;
}

// Get admin user by ID
export async function getAdminUserById(adminId: number): Promise<AdminUserDetailResponse> {
    const response = await apiClient.get<AdminUserDetailResponse>(SUPER_ADMIN_ENDPOINTS.ADMIN_USER_BY_ID(adminId));
    return response.data;
}

// Update admin user
export async function updateAdminUser(adminId: number, data: UpdateAdminRequest): Promise<UpdateAdminResponse> {
    const cleanedData: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            cleanedData[key] = value;
        }
    });
    const response = await apiClient.put<UpdateAdminResponse>(
        SUPER_ADMIN_ENDPOINTS.ADMIN_USER_BY_ID(adminId),
        cleanedData,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
}

// Soft delete admin user
export async function softDeleteAdminUser(adminId: number): Promise<AdminUserActionResponse> {
    const response = await apiClient.delete<AdminUserActionResponse>(SUPER_ADMIN_ENDPOINTS.ADMIN_USER_SOFT_DELETE(adminId));
    return response.data;
}

// Permanently delete admin user
export async function permanentDeleteAdminUser(adminId: number): Promise<AdminUserActionResponse> {
    const response = await apiClient.delete<AdminUserActionResponse>(SUPER_ADMIN_ENDPOINTS.ADMIN_USER_PERMANENT_DELETE(adminId));
    return response.data;
}

// Restore soft-deleted admin user
export async function restoreAdminUser(adminId: number): Promise<AdminUserActionResponse> {
    const response = await apiClient.put<AdminUserActionResponse>(SUPER_ADMIN_ENDPOINTS.ADMIN_USER_RESTORE(adminId));
    return response.data;
}

export { SUPER_ADMIN_ENDPOINTS };


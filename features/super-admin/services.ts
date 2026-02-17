// Super Admin Services - API calls for system administration
import apiClient from '../../lib/api-client';
import {
    CreateAdminRequest,
    CreateAdminResponse,
    ResetPasswordResponse,
    PermanentDeleteResponse,
    SuperAdminUserStatsResponse,
} from './super-admin.types';
import { ActionResponse, AllUsersResponse, UserFilterParams, UserDetailResponse } from '@/features';

const SUPER_ADMIN_ENDPOINTS = {
    // User management endpoints
    USERS: '/admin/user',
    USER_BY_ID: (id: number) => `/super-admin/user/${id}`,
    CREATE_ADMIN: '/super-admin/user/admin',
    RESET_PASSWORD: (id: number) => `/super-admin/user/${id}/reset-password`,
    PERMANENT_DELETE: (id: number) => `/super-admin/user/${id}/permanent`,
    SOFT_DELETE: (id: number) => `/super-admin/user/${id}`,
    RESTORE_USER: (id: number) => `/super-admin/user/${id}/restore`,
    USER_STATS: '/super-admin/user/stats',
};

// ============================================================================
// Super Admin User Management Services
// ============================================================================

// Get all users with pagination (for super admin)
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

// Get user by ID (for super admin)
export async function getUserByIdSuperAdmin(id: number): Promise<UserDetailResponse> {
    const response = await apiClient.get<UserDetailResponse>(SUPER_ADMIN_ENDPOINTS.USER_BY_ID(id));
    return response.data;
}

// Create new admin user (Super Admin only)
export async function createAdminUser(data: CreateAdminRequest): Promise<CreateAdminResponse> {
    const response = await apiClient.post<CreateAdminResponse>(SUPER_ADMIN_ENDPOINTS.CREATE_ADMIN, data);
    return response.data;
}

// Reset user password and send credentials via email (Super Admin only)
export async function resetUserPassword(id: number): Promise<ResetPasswordResponse> {
    const response = await apiClient.put<ResetPasswordResponse>(SUPER_ADMIN_ENDPOINTS.RESET_PASSWORD(id));
    return response.data;
}

// Soft delete user (Super Admin)
export async function softDeleteUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.delete<ActionResponse>(SUPER_ADMIN_ENDPOINTS.SOFT_DELETE(id));
    return response.data;
}

// Restore soft-deleted user (Super Admin)
export async function restoreUserSuperAdmin(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(SUPER_ADMIN_ENDPOINTS.RESTORE_USER(id));
    return response.data;
}

// Permanently delete user (Super Admin only - irreversible)
export async function permanentDeleteUserSuperAdmin(id: number): Promise<PermanentDeleteResponse> {
    const response = await apiClient.delete<PermanentDeleteResponse>(SUPER_ADMIN_ENDPOINTS.PERMANENT_DELETE(id));
    return response.data;
}

// Get super admin user statistics
export async function getSuperAdminUserStats(): Promise<SuperAdminUserStatsResponse> {
    const response = await apiClient.get<SuperAdminUserStatsResponse>(SUPER_ADMIN_ENDPOINTS.USER_STATS);
    return response.data;
}

export { SUPER_ADMIN_ENDPOINTS };


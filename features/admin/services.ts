// Admin Services - API calls for admin operations
import { api } from '@/lib';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import { AdminUserListItem, AdminUserFilters, CreateUserByAdminRequest, UpdateUserByAdminRequest, AdminStats } from './admin.types';

const ADMIN_ENDPOINTS = {
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    STATS: '/admin/stats',
    EVENTS: '/admin/events',
    REPORTS: '/admin/reports',
};

export async function getUsers(params?: PaginationParams & AdminUserFilters): Promise<PaginatedResponse<AdminUserListItem>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    const url = `${ADMIN_ENDPOINTS.USERS}?${queryParams.toString()}`;
    return api.get<PaginatedResponse<AdminUserListItem>>(url);
}

export async function getUserById(id: string): Promise<AdminUserListItem> {
    return api.get<AdminUserListItem>(ADMIN_ENDPOINTS.USER_BY_ID(id));
}

export async function createUser(data: CreateUserByAdminRequest): Promise<AdminUserListItem> {
    return api.post<AdminUserListItem>(ADMIN_ENDPOINTS.USERS, data);
}

export async function updateUser(id: string, data: UpdateUserByAdminRequest): Promise<AdminUserListItem> {
    return api.put<AdminUserListItem>(ADMIN_ENDPOINTS.USER_BY_ID(id), data);
}

export async function deleteUser(id: string): Promise<void> {
    await api.delete(ADMIN_ENDPOINTS.USER_BY_ID(id));
}

export async function getStats(): Promise<AdminStats> {
    return api.get<AdminStats>(ADMIN_ENDPOINTS.STATS);
}

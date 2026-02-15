/**
 * Admin User Management Services
 */
import apiClient from '@/lib/api-client';
import {
    AllUsersResponse,
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    UserFilterParams,
    ActionResponse,
    SearchUsersParams,
    FilterUsersParams,
    UserStatsResponse,
    UserDetailResponse,
} from '@/features';

const ADMIN_USER_ENDPOINTS = {
    USERS: '/admin/user',
    USER_BY_ID: (id: number) => `/admin/user/${id}`,
    ACTIVATE_USER: (id: number) => `/admin/user/${id}/activate`,
    DEACTIVATE_USER: (id: number) => `/admin/user/${id}/deactivate`,
    SUSPENDED_USER: (id: number) => `/admin/user/${id}/suspend`,
    UNLOCK_USER: (id: number) => `/admin/user/${id}/unlock`,
    RESTORE_USER: (id: number) => `/admin/user/${id}/restore`,
    SEARCH_USERS: '/admin/user/search',
    FILTER_USERS: '/admin/user/filter',
    USER_STATS: '/admin/user/stats',
};

// Get all users with pagination
export async function getAllUsers(params: UserFilterParams = {}): Promise<AllUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    const url = `${ADMIN_USER_ENDPOINTS.USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AllUsersResponse>(url);
    return response.data;
}

// Get user by ID with full details
export async function getUserById(id: number): Promise<UserDetailResponse> {
    const response = await apiClient.get<UserDetailResponse>(ADMIN_USER_ENDPOINTS.USER_BY_ID(id));
    return response.data;
}

// Create new user
export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post<CreateUserResponse>(ADMIN_USER_ENDPOINTS.USERS, data);
    return response.data;
}

// Update user by ID (Admin can update user details - no profile picture)
// Only fields provided in the request will be updated
export async function updateUserById(id: number, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    // Only remove undefined values - keep null and empty strings to allow clearing fields
    const cleanedData: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            cleanedData[key] = value;
        }
    });

    const response = await apiClient.put<UpdateUserResponse>(
        ADMIN_USER_ENDPOINTS.USER_BY_ID(id),
        cleanedData,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
}

// Activate user account
export async function activateUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(ADMIN_USER_ENDPOINTS.ACTIVATE_USER(id));
    return response.data;
}

// Deactivate user account
export async function deactivateUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(ADMIN_USER_ENDPOINTS.DEACTIVATE_USER(id));
    return response.data;
}

// Suspend user account
export async function suspendUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(ADMIN_USER_ENDPOINTS.SUSPENDED_USER(id));
    return response.data;
}

// Unlock suspended user account
export async function unlockUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(ADMIN_USER_ENDPOINTS.UNLOCK_USER(id));
    return response.data;
}

// Soft delete user account
export async function softDeleteUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.delete<ActionResponse>(ADMIN_USER_ENDPOINTS.USER_BY_ID(id));
    return response.data;
}

// Restore deleted user account
export async function restoreUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.put<ActionResponse>(ADMIN_USER_ENDPOINTS.RESTORE_USER(id));
    return response.data;
}

// Search users by keyword
export async function searchUsers(params: SearchUsersParams): Promise<AllUsersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', params.keyword);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    const url = `${ADMIN_USER_ENDPOINTS.SEARCH_USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AllUsersResponse>(url);
    return response.data;
}

// Filter users by roles and statuses
export async function filterUsers(params: FilterUsersParams): Promise<AllUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params.roles && params.roles.length > 0) {
        params.roles.forEach(role => queryParams.append('roles', role));
    }
    if (params.statuses && params.statuses.length > 0) {
        params.statuses.forEach(status => queryParams.append('statuses', status));
    }
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    const url = `${ADMIN_USER_ENDPOINTS.FILTER_USERS}?${queryParams.toString()}`;
    const response = await apiClient.get<AllUsersResponse>(url);
    return response.data;
}

// Get user statistics
export async function getUserStats(): Promise<UserStatsResponse> {
    const response = await apiClient.get<UserStatsResponse>(ADMIN_USER_ENDPOINTS.USER_STATS);
    return response.data;
}

export { ADMIN_USER_ENDPOINTS };

/**
 * Admin User Management Services
 */
import apiClient from '@/lib/api-client';
import {
    AllUsersResponse,
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UserFilterParams,
    ActionResponse,
    User,
} from '@/features';

const ADMIN_USER_ENDPOINTS = {
    USERS: '/admin/user',
    USER_BY_ID: (id: number) => `/admin/user/${id}`,
    ACTIVATE_USER: (id: number) => `/admin/user/${id}/activate`,
    DEACTIVATE_USER: (id: number) => `/admin/user/${id}/deactivate`,
    UNLOCK_USER: (id: number) => `/admin/user/${id}/unlock`,
};

// Response type for single user operations
interface UserResponse {
    success: boolean;
    message: string;
    data: User;
    timestamp: string;
}

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

// Get user by ID
export async function getUserById(id: number): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(ADMIN_USER_ENDPOINTS.USER_BY_ID(id));
    return response.data;
}

// Create new user
export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post<CreateUserResponse>(ADMIN_USER_ENDPOINTS.USERS, data);
    return response.data;
}

// Update user by ID with optional profile picture
export async function updateUserById(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const formData = new FormData();
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
    if (data.role) formData.append('role', data.role);
    if (data.profilePicture) formData.append('profilePicture', data.profilePicture);
    if (data.deleteProfilePicture) formData.append('deleteProfilePicture', 'true');
    const response = await apiClient.put<UserResponse>(ADMIN_USER_ENDPOINTS.USER_BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

// Activate user account
export async function activateUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.patch<ActionResponse>(ADMIN_USER_ENDPOINTS.ACTIVATE_USER(id));
    return response.data;
}

// Deactivate user account
export async function deactivateUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.patch<ActionResponse>(ADMIN_USER_ENDPOINTS.DEACTIVATE_USER(id));
    return response.data;
}

// Unlock suspended user account
export async function unlockUser(id: number): Promise<ActionResponse> {
    const response = await apiClient.patch<ActionResponse>(ADMIN_USER_ENDPOINTS.UNLOCK_USER(id));
    return response.data;
}

export { ADMIN_USER_ENDPOINTS };

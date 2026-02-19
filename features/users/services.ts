// User Services - API calls for user operations
import apiClient from '@/lib/api-client';
import { UserProfile, UserProfileResponse } from '@/features';

export const USER_ENDPOINTS = {
    PROFILE: '/user/me',
    UPDATE_PROFILE: '/user/me',
    CHANGE_PASSWORD: '/user/me/password'
};

/**
 * Get current user profile
 */
export async function getProfile(): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>(USER_ENDPOINTS.PROFILE);
    return response.data;
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    guardianName?: string;
    guardianPhone?: string;
    dateOfBirth?: string;
    profilePicture?: File | null;
    deleteProfilePicture?: boolean;
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add text fields (only if they have values)
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.guardianName) formData.append('guardianName', data.guardianName);
    if (data.guardianPhone) formData.append('guardianPhone', data.guardianPhone);
    if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);

    // Add profile picture file if provided
    if (data.profilePicture) {
        formData.append('profilePicture', data.profilePicture);
    }

    // Add delete flag if true
    if (data.deleteProfilePicture) {
        formData.append('deleteProfilePicture', 'true');
    }

    formData.forEach((value, key) => {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    });

    // Send PUT request with multipart/form-data
    const response = await apiClient.put<{ success: boolean; data: UserProfile; message: string }>(
        USER_ENDPOINTS.UPDATE_PROFILE,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    // Handle wrapped response
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
    }

    return response.data as unknown as UserProfile;
}

// Change Password Request Interface
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Change Password Response Interface
export interface ChangePasswordResponse {
    success: boolean;
    message: string;
    timestamp: string;
}

/**
 * Change user password
 * @param data - Current password, new password, and confirm password
 * @returns Promise with success response
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiClient.put<ChangePasswordResponse>(
        USER_ENDPOINTS.CHANGE_PASSWORD,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
}



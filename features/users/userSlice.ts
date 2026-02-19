import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile, changePassword, ChangePasswordRequest, ChangePasswordResponse } from './services';
import { UserProfile } from '@/features';

// ============================================================================
// Types
// ============================================================================

interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    isChangingPassword: boolean;
    error: string | null;
    passwordChangeError: string | null;
    passwordChangeSuccess: string | null;
    lastUpdated: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: UserState = {
    profile: null,
    isLoading: false,
    isChangingPassword: false,
    error: null,
    passwordChangeError: null,
    passwordChangeSuccess: null,
    lastUpdated: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

// Fetch user profile thunk
export const fetchUserProfile = createAsyncThunk<UserProfile, void>(
    'user/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {

            // API call to fetch user profile - returns UserProfileResponse with data property
            const response = await getProfile();

            let profileData: UserProfile | null = null;

            // Handle response with data wrapper
            if (response && response.data) {
                profileData = response.data;
            }
            // Handle direct response (no wrapper)
            else if (response && typeof response === 'object' && 'email' in response) {
                profileData = response as unknown as UserProfile;
            }

            if (!profileData) {
                throw new Error('Invalid response structure - no profile data found');
            }

            // Ensure roleSpecificData exists (even if empty object)
            if (!profileData.roleSpecificData) {
                profileData = { ...profileData, roleSpecificData: {} as any };
            }

            return profileData;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
            return rejectWithValue(errorMessage);
        }
    }
);

// Update user profile thunk
export const updateUserProfile = createAsyncThunk<UserProfile, Partial<UserProfile>>(
    'user/updateUserProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/v1/users/${profileData.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) {
                throw new Error('Failed to update user profile');
            }
            const data = await response.json();
            return data as UserProfile;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
            return rejectWithValue(errorMessage);
        }
    }
);

// Change password thunk
export const changePasswordAsync = createAsyncThunk<ChangePasswordResponse, ChangePasswordRequest>(
    'user/changePassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await changePassword(data);
            return response;
        } catch (error: unknown) {
            // Extract error message from API response
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    return rejectWithValue(apiError.response.data.message);
                }
            }
            const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
            return rejectWithValue(errorMessage);
        }
    }
);

// ============================================================================
// User Slice
// ============================================================================

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Set user profile directly
        setProfile: (state, action: PayloadAction<UserProfile | null>) => {
            state.profile = action.payload;
            state.lastUpdated = new Date().toISOString();
        },
        // Update specific profile fields
        updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            }
        },
        // Clear user profile
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
            state.lastUpdated = null;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Clear password change messages
        clearPasswordChangeMessages: (state) => {
            state.passwordChangeError = null;
            state.passwordChangeSuccess = null;
        },
        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch user profile
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
                state.isLoading = false;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            });

        // Update user profile
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
                state.isLoading = false;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            });

        // Change password
        builder
            .addCase(changePasswordAsync.pending, (state) => {
                state.isChangingPassword = true;
                state.passwordChangeError = null;
                state.passwordChangeSuccess = null;
            })
            .addCase(changePasswordAsync.fulfilled, (state, action) => {
                state.isChangingPassword = false;
                state.passwordChangeSuccess = action.payload.message || 'Password changed successfully!';
            })
            .addCase(changePasswordAsync.rejected, (state, action) => {
                state.isChangingPassword = false;
                state.passwordChangeError = action.payload as string;
            });
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectUserIsLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectUserLastUpdated = (state: { user: UserState }) => state.user.lastUpdated;
export const selectIsChangingPassword = (state: { user: UserState }) => state.user.isChangingPassword;
export const selectPasswordChangeError = (state: { user: UserState }) => state.user.passwordChangeError;
export const selectPasswordChangeSuccess = (state: { user: UserState }) => state.user.passwordChangeSuccess;

// ============================================================================
// Exports
// ============================================================================

export const { setProfile, updateProfile, clearProfile, clearError, clearPasswordChangeMessages, setLoading } = userSlice.actions;
export default userSlice.reducer;

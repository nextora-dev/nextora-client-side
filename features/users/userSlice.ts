import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthUser } from '@/features';

// ============================================================================
// Types
// ============================================================================

interface UserProfile extends AuthUser {
    avatarUrl?: string;
    phone?: string;
    department?: string;
    faculty?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: UserState = {
    profile: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

// Fetch user profile thunk
export const fetchUserProfile = createAsyncThunk<UserProfile, string>(
    'user/fetchUserProfile',
    async (userId, { rejectWithValue }) => {
        try {
            // API call to fetch user profile
            const response = await fetch(`/api/v1/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            const data = await response.json();
            return data as UserProfile;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
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
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectUserIsLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectUserLastUpdated = (state: { user: UserState }) => state.user.lastUpdated;

// ============================================================================
// Exports
// ============================================================================

export const { setProfile, updateProfile, clearProfile, clearError, setLoading } = userSlice.actions;
export default userSlice.reducer;

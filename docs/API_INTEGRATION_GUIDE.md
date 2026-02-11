# API Integration Guide

This document provides a comprehensive guide for API integration patterns in the Nextora LMS project.

## Project Structure for API Integration

```
features/
├── [feature-name]/
│   ├── index.ts              # Public exports
│   ├── [feature].types.ts    # Request/Response types
│   ├── [feature].services.ts # API service functions
│   ├── [feature]Slice.ts     # Redux slice (state + actions)
│   └── [feature].endpoints.ts # API endpoints constants
```

---

## 1. Types (Request/Response)

### Location: `features/[feature]/[feature].types.ts`

```typescript
// ============================================================================
// Example: User Feature Types
// ============================================================================

import { RoleType } from '@/constants';

// ----------------------------------------------------------------------------
// Request Types
// ----------------------------------------------------------------------------

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: RoleType;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
}

export interface GetUsersParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    search?: string;
    role?: RoleType;
}

// ----------------------------------------------------------------------------
// Response Types
// ----------------------------------------------------------------------------

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: RoleType;
    avatarUrl?: string;
    phone?: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserResponse {
    user: User;
    message?: string;
}

export interface UsersListResponse {
    content: User[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}
```

---

## 2. API Endpoints Constants

### Location: `features/[feature]/[feature].endpoints.ts`

```typescript
// ============================================================================
// Example: User Endpoints
// ============================================================================

export const USER_ENDPOINTS = {
    // Base
    BASE: '/users',
    
    // CRUD Operations
    LIST: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    
    // Specific Operations
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    CHANGE_PASSWORD: '/users/change-password',
    VERIFY_EMAIL: '/users/verify-email',
    
    // Admin Operations
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
} as const;
```

---

## 3. Services (API Calls)

### Location: `features/[feature]/[feature].services.ts`

```typescript
// ============================================================================
// Example: User Services
// ============================================================================

import { api } from '@/lib';
import { USER_ENDPOINTS } from './user.endpoints';
import {
    User,
    UserResponse,
    UsersListResponse,
    CreateUserRequest,
    UpdateUserRequest,
    GetUsersParams,
} from './user.types';

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

const normalizeResponse = <T>(response: unknown): T => {
    const data = response as Record<string, unknown>;
    return (data.data ?? data) as T;
};

// ----------------------------------------------------------------------------
// User Services
// ----------------------------------------------------------------------------

/**
 * Get all users with pagination and filters
 */
export async function getUsers(params?: GetUsersParams): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.set('page', String(params.page));
    if (params?.size) queryParams.set('size', String(params.size));
    if (params?.sort) queryParams.set('sort', params.sort);
    if (params?.direction) queryParams.set('direction', params.direction);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role) queryParams.set('role', params.role);
    
    const url = `${USER_ENDPOINTS.LIST}?${queryParams.toString()}`;
    const response = await api.get<UsersListResponse>(url);
    return normalizeResponse<UsersListResponse>(response);
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User> {
    const response = await api.get<UserResponse>(USER_ENDPOINTS.GET_BY_ID(id));
    return normalizeResponse<UserResponse>(response).user;
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<UserResponse>(USER_ENDPOINTS.CREATE, data);
    return normalizeResponse<UserResponse>(response).user;
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<UserResponse>(USER_ENDPOINTS.UPDATE(id), data);
    return normalizeResponse<UserResponse>(response).user;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
    await api.delete(USER_ENDPOINTS.DELETE(id));
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
    const response = await api.get<UserResponse>(USER_ENDPOINTS.GET_PROFILE);
    return normalizeResponse<UserResponse>(response).user;
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await api.put<UserResponse>(USER_ENDPOINTS.UPDATE_PROFILE, data);
    return normalizeResponse<UserResponse>(response).user;
}
```

---

## 4. Redux Slice

### Location: `features/[feature]/[feature]Slice.ts`

```typescript
// ============================================================================
// Example: User Slice
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    User,
    UsersListResponse,
    CreateUserRequest,
    UpdateUserRequest,
    GetUsersParams,
} from './user.types';
import * as userServices from './user.services';

// ----------------------------------------------------------------------------
// State Types
// ----------------------------------------------------------------------------

interface UserState {
    // List
    users: User[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
    
    // Single
    selectedUser: User | null;
    
    // UI State
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
}

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialState: UserState = {
    users: [],
    totalUsers: 0,
    currentPage: 0,
    totalPages: 0,
    selectedUser: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
};

// ----------------------------------------------------------------------------
// Async Thunks
// ----------------------------------------------------------------------------

export const fetchUsers = createAsyncThunk<UsersListResponse, GetUsersParams | undefined>(
    'user/fetchUsers',
    async (params, { rejectWithValue }) => {
        try {
            return await userServices.getUsers(params);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users');
        }
    }
);

export const fetchUserById = createAsyncThunk<User, string>(
    'user/fetchUserById',
    async (id, { rejectWithValue }) => {
        try {
            return await userServices.getUserById(id);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user');
        }
    }
);

export const createUser = createAsyncThunk<User, CreateUserRequest>(
    'user/createUser',
    async (data, { rejectWithValue }) => {
        try {
            return await userServices.createUser(data);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to create user');
        }
    }
);

export const updateUser = createAsyncThunk<User, { id: string; data: UpdateUserRequest }>(
    'user/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await userServices.updateUser(id, data);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk<string, string>(
    'user/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            await userServices.deleteUser(id);
            return id;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete user');
        }
    }
);

// ----------------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------------

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Users
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users = action.payload.content;
                state.totalUsers = action.payload.totalElements;
                state.currentPage = action.payload.page;
                state.totalPages = action.payload.totalPages;
                state.isLoading = false;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            });

        // Fetch User By ID
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            });

        // Create User
        builder
            .addCase(createUser.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.unshift(action.payload);
                state.totalUsers += 1;
                state.isCreating = false;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isCreating = false;
            });

        // Update User
        builder
            .addCase(updateUser.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
                state.isUpdating = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isUpdating = false;
            });

        // Delete User
        builder
            .addCase(deleteUser.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
                state.totalUsers -= 1;
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
                state.isDeleting = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isDeleting = false;
            });
    },
});

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------

export const selectUsers = (state: { user: UserState }) => state.user.users;
export const selectSelectedUser = (state: { user: UserState }) => state.user.selectedUser;
export const selectTotalUsers = (state: { user: UserState }) => state.user.totalUsers;
export const selectCurrentPage = (state: { user: UserState }) => state.user.currentPage;
export const selectTotalPages = (state: { user: UserState }) => state.user.totalPages;
export const selectIsLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectIsCreating = (state: { user: UserState }) => state.user.isCreating;
export const selectIsUpdating = (state: { user: UserState }) => state.user.isUpdating;
export const selectIsDeleting = (state: { user: UserState }) => state.user.isDeleting;
export const selectError = (state: { user: UserState }) => state.user.error;

// ----------------------------------------------------------------------------
// Exports
// ----------------------------------------------------------------------------

export const { clearError, clearSelectedUser, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
```

---

## 5. Feature Index (Public Exports)

### Location: `features/[feature]/index.ts`

```typescript
// Types
export * from './user.types';

// Endpoints
export * from './user.endpoints';

// Services
export * from './user.services';

// Slice
export {
    default as userReducer,
    // Thunks
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    // Actions
    clearError,
    clearSelectedUser,
    setSelectedUser,
    // Selectors
    selectUsers,
    selectSelectedUser,
    selectTotalUsers,
    selectCurrentPage,
    selectTotalPages,
    selectIsLoading,
    selectIsCreating,
    selectIsUpdating,
    selectIsDeleting,
    selectError,
} from './userSlice';
```

---

## 6. Register Slice in Store

### Location: `store/index.ts`

```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import userReducer from '@/features/users/userSlice';
// Import new reducer
import { userReducer as newUserReducer } from '@/features/user';

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    // Add new reducer
    users: newUserReducer,
});

// ... rest of store configuration
```

---

## 7. Usage in Components

### Using Redux in Components

```typescript
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchUsers,
    selectUsers,
    selectIsLoading,
    selectError,
    selectTotalPages,
    selectCurrentPage,
} from '@/features/user';

export function UserListComponent() {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectUsers);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);
    const totalPages = useAppSelector(selectTotalPages);
    const currentPage = useAppSelector(selectCurrentPage);

    useEffect(() => {
        dispatch(fetchUsers({ page: 0, size: 10 }));
    }, [dispatch]);

    const handlePageChange = (page: number) => {
        dispatch(fetchUsers({ page, size: 10 }));
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {users.map(user => (
                <div key={user.id}>
                    {user.firstName} {user.lastName}
                </div>
            ))}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
```

### Creating a Custom Hook

```typescript
// hooks/useUsers.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    selectUsers,
    selectIsLoading,
    selectError,
    clearError,
    GetUsersParams,
    CreateUserRequest,
    UpdateUserRequest,
} from '@/features/user';

export function useUsers() {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectUsers);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    const loadUsers = useCallback((params?: GetUsersParams) => {
        return dispatch(fetchUsers(params)).unwrap();
    }, [dispatch]);

    const addUser = useCallback((data: CreateUserRequest) => {
        return dispatch(createUser(data)).unwrap();
    }, [dispatch]);

    const editUser = useCallback((id: string, data: UpdateUserRequest) => {
        return dispatch(updateUser({ id, data })).unwrap();
    }, [dispatch]);

    const removeUser = useCallback((id: string) => {
        return dispatch(deleteUser(id)).unwrap();
    }, [dispatch]);

    const resetError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        users,
        isLoading,
        error,
        loadUsers,
        addUser,
        editUser,
        removeUser,
        resetError,
    };
}
```

---

## 8. Common API Response Types

### Location: `types/api.d.ts`

```typescript
// Generic API Response
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
}

// Generic API Error
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    timestamp: string;
}

// Pagination Response
export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

// Pagination Params
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

// Generic Success Response
export interface SuccessResponse {
    success: true;
    message: string;
}

// Generic Delete Response
export interface DeleteResponse {
    success: true;
    id: string;
    message: string;
}
```

---

## 9. API Client Configuration

### Location: `lib/api-client.ts`

The API client is already configured with:
- Base URL from environment variables
- Automatic token attachment
- Token refresh on 401 errors
- Error handling and transformation

---

## Quick Reference: File Naming Conventions

| File Type | Naming Convention | Example |
|-----------|------------------|---------|
| Types | `[feature].types.ts` | `user.types.ts` |
| Endpoints | `[feature].endpoints.ts` | `user.endpoints.ts` |
| Services | `[feature].services.ts` | `user.services.ts` |
| Redux Slice | `[feature]Slice.ts` | `userSlice.ts` |
| Custom Hook | `use[Feature].ts` | `useUsers.ts` |
| Index | `index.ts` | `index.ts` |

---

## Quick Reference: Type Naming Conventions

| Type | Naming Convention | Example |
|------|------------------|---------|
| Request DTOs | `[Action][Entity]Request` | `CreateUserRequest` |
| Response DTOs | `[Entity]Response` | `UserResponse` |
| List Response | `[Entity]sListResponse` | `UsersListResponse` |
| Query Params | `Get[Entity]sParams` | `GetUsersParams` |
| Entity | `[Entity]` | `User` |
| State | `[Entity]State` | `UserState` |


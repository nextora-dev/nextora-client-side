# UniSphere Authorization System - Industry Standard Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [JWT Token Management](#jwt-token-management)
4. [Roles & Permissions](#roles--permissions)
5. [Token Refresh Flow](#token-refresh-flow)
6. [Permission Checking](#permission-checking)
7. [Route Protection](#route-protection)
8. [Component-Level Access Control](#component-level-access-control)
9. [API Integration](#api-integration)
10. [Security Best Practices](#security-best-practices)
11. [Complete Code Examples](#complete-code-examples)
12. [Error Handling](#error-handling)
13. [Testing Guide](#testing-guide)
14. [Troubleshooting](#troubleshooting)

---

## System Overview

UniSphere implements a **Role-Based Access Control (RBAC)** system with fine-grained permissions. The authorization flow works as follows:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         AUTHORIZATION FLOW                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────┐        ┌──────────────┐        ┌─────────────────┐            │
│   │  User   │───────▶│ Spring Boot  │───────▶│  JWT Token      │            │
│   │  Login  │        │   Backend    │        │  (role + auth)  │            │
│   └─────────┘        └──────────────┘        └────────┬────────┘            │
│                                                        │                     │
│                                                        ▼                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      NEXT.JS FRONTEND                                │   │
│   │  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────────┐  │   │
│   │  │  Middleware  │   │  Auth Store  │   │  Permission Hooks       │  │   │
│   │  │ (Edge Guard) │   │  (Zustand)   │   │  (usePermission/Role)   │  │   │
│   │  └──────────────┘   └──────────────┘   └─────────────────────────┘  │   │
│   │         │                  │                       │                 │   │
│   │         ▼                  ▼                       ▼                 │   │
│   │  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────────┐  │   │
│   │  │Route Access  │   │   UI State   │   │  Component Rendering    │  │   │
│   │  │  Control     │   │  Management  │   │  (ProtectedView, etc)   │  │   │
│   │  └──────────────┘   └──────────────┘   └─────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Backend is Source of Truth** - All critical permissions are validated server-side
2. **Defense in Depth** - Multiple layers of protection (middleware, components, API)
3. **Least Privilege** - Users only get permissions they need
4. **Token-Based Auth** - Stateless authentication using JWT
5. **Automatic Token Refresh** - Seamless session management

---

## Architecture

### File Structure

```
client-side/
├── constants/
│   ├── permissions.ts      # Permission constants & groups
│   └── roles.ts            # Role definitions & hierarchy
│
├── features/authorization/
│   ├── authorization.types.ts    # TypeScript types
│   ├── permission.guard.ts       # Permission check functions
│   └── role.config.ts            # Role-permission mapping
│
├── hooks/
│   ├── useAuth.ts          # Authentication hook
│   ├── usePermission.ts    # Permission checking hook
│   └── useRole.ts          # Role checking hook
│
├── lib/
│   ├── api-client.ts       # Axios with token interceptors
│   ├── auth-session.ts     # Token storage utilities
│   └── jwt.ts              # JWT decode/validation
│
├── components/layout/
│   ├── ProtectedView.tsx   # Conditional rendering component
│   └── RoleGuard.tsx       # Role-based guard component
│
├── store/
│   └── auth.store.ts       # Zustand auth state
│
├── providers/
│   └── AuthProvider.tsx    # Auth context provider
│
└── middleware.ts           # Next.js edge middleware
```

### Data Flow

```
1. LOGIN
   User credentials → Backend validates → Returns JWT tokens
                                              │
                                              ▼
2. TOKEN STORAGE
   accessToken + refreshToken → localStorage + Cookies
                                              │
                                              ▼
3. TOKEN PARSING
   JWT decoded → User object extracted → Stored in Zustand
                                              │
                                              ▼
4. PERMISSION CHECKS
   Hooks/Components read from store → Check authorities array
                                              │
                                              ▼
5. API REQUESTS
   Axios interceptor → Attaches Bearer token → Backend validates
```

---

## JWT Token Management

### Token Structure (from Spring Boot)

```typescript
// types/jwt.d.ts
interface JWTPayload {
    sub: string;           // User ID (subject)
    email: string;         // User email
    firstName: string;     // First name
    lastName: string;      // Last name
    role: string;          // Primary role (e.g., "ROLE_STUDENT")
    authorities: string[]; // Fine-grained permissions array
    iat: number;           // Issued at (Unix timestamp)
    exp: number;           // Expiration (Unix timestamp)
    iss?: string;          // Issuer (optional)
}
```

### Example Token Payload

```json
{
    "sub": "usr_123456789",
    "email": "john.doe@iit.ac.lk",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ROLE_STUDENT",
    "authorities": [
        "profile:read",
        "profile:write",
        "dashboard:view",
        "events:view",
        "kuppi:view",
        "kuppi:create",
        "voting:view",
        "voting:vote",
        "lostfound:view",
        "lostfound:create",
        "academic:view",
        "internships:view",
        "internships:apply",
        "maps:view",
        "meetings:view",
        "meetings:book"
    ],
    "iat": 1707552000,
    "exp": 1707638400,
    "iss": "unisphere-api"
}
```

### Token Storage

```typescript
// lib/auth-session.ts

export const tokenStorage = {
    // Get access token from localStorage
    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('accessToken');
    },

    // Get refresh token
    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('refreshToken');
    },

    // Store both tokens (localStorage + cookies for middleware)
    setTokens(accessToken: string, refreshToken: string): void {
        if (typeof window === 'undefined') return;
        
        // LocalStorage for client-side access
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Cookies for Next.js middleware (edge runtime)
        document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/`;
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/`;
    },

    // Clear all tokens (logout)
    clearTokens(): void {
        if (typeof window === 'undefined') return;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Expire cookies
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },
};
```

### Token Decoding

```typescript
// lib/jwt.ts

/**
 * Decode JWT without verification (verification done by backend)
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = parts[1];
        const decoded = JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );
        return decoded as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
}

/**
 * Get time until expiration (milliseconds)
 */
export function getTokenExpiresIn(token: string): number {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return 0;
    return Math.max(0, decoded.exp * 1000 - Date.now());
}

/**
 * Extract user object from token
 */
export function getUserFromToken(token: string) {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
        authorities: decoded.authorities || [],
    };
}
```

---

## Roles & Permissions

### Role Definitions

```typescript
// constants/roles.ts

export const ROLES = {
    STUDENT: 'ROLE_STUDENT',
    ACADEMIC_STAFF: 'ROLE_ACADEMIC_STAFF',
    NON_ACADEMIC_STAFF: 'ROLE_NON_ACADEMIC_STAFF',
    ADMIN: 'ROLE_ADMIN',
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// Role hierarchy (higher number = more access)
export const ROLE_HIERARCHY: Record<RoleType, number> = {
    [ROLES.STUDENT]: 1,
    [ROLES.ACADEMIC_STAFF]: 2,
    [ROLES.NON_ACADEMIC_STAFF]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.SUPER_ADMIN]: 4,
};

// Human-readable labels
export const ROLE_LABELS: Record<RoleType, string> = {
    [ROLES.STUDENT]: 'Student',
    [ROLES.ACADEMIC_STAFF]: 'Academic Staff',
    [ROLES.NON_ACADEMIC_STAFF]: 'Non-Academic Staff',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.SUPER_ADMIN]: 'Super Administrator',
};
```

### Permission Definitions

```typescript
// constants/permissions.ts

export const PERMISSIONS = {
    // User permissions
    USER_READ: 'user:read',
    USER_WRITE: 'user:write',
    USER_DELETE: 'user:delete',

    // Profile permissions
    PROFILE_READ: 'profile:read',
    PROFILE_WRITE: 'profile:write',

    // Dashboard permissions
    DASHBOARD_VIEW: 'dashboard:view',
    DASHBOARD_ANALYTICS: 'dashboard:analytics',

    // Events permissions
    EVENTS_VIEW: 'events:view',
    EVENTS_CREATE: 'events:create',
    EVENTS_EDIT: 'events:edit',
    EVENTS_DELETE: 'events:delete',
    EVENTS_MANAGE: 'events:manage',

    // Kuppi (Study Groups) permissions
    KUPPI_VIEW: 'kuppi:view',
    KUPPI_CREATE: 'kuppi:create',
    KUPPI_EDIT: 'kuppi:edit',
    KUPPI_DELETE: 'kuppi:delete',

    // Voting permissions
    VOTING_VIEW: 'voting:view',
    VOTING_VOTE: 'voting:vote',
    VOTING_CREATE: 'voting:create',
    VOTING_MANAGE: 'voting:manage',

    // Lost & Found permissions
    LOST_FOUND_VIEW: 'lostfound:view',
    LOST_FOUND_CREATE: 'lostfound:create',
    LOST_FOUND_CLAIM: 'lostfound:claim',
    LOST_FOUND_MANAGE: 'lostfound:manage',

    // Academic permissions
    ACADEMIC_VIEW: 'academic:view',
    ACADEMIC_RESULTS: 'academic:results',
    ACADEMIC_MANAGE: 'academic:manage',

    // Internships permissions
    INTERNSHIPS_VIEW: 'internships:view',
    INTERNSHIPS_APPLY: 'internships:apply',
    INTERNSHIPS_MANAGE: 'internships:manage',

    // Maps permissions
    MAPS_VIEW: 'maps:view',
    MAPS_EDIT: 'maps:edit',

    // Meetings permissions
    MEETINGS_VIEW: 'meetings:view',
    MEETINGS_BOOK: 'meetings:book',
    MEETINGS_MANAGE: 'meetings:manage',

    // Admin permissions
    ADMIN_USERS_VIEW: 'admin:users:view',
    ADMIN_USERS_MANAGE: 'admin:users:manage',
    ADMIN_ROLES_VIEW: 'admin:roles:view',
    ADMIN_ROLES_MANAGE: 'admin:roles:manage',
    ADMIN_SETTINGS: 'admin:settings',

    // Super Admin permissions
    SUPER_ADMIN_SYSTEM: 'superadmin:system',
    SUPER_ADMIN_AUDIT: 'superadmin:audit',
    SUPER_ADMIN_CONFIG: 'superadmin:config',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

### Permission Groups

```typescript
// constants/permissions.ts

export const PERMISSION_GROUPS = {
    // Basic permissions for all authenticated users
    BASIC_USER: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_WRITE,
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.EVENTS_VIEW,
        PERMISSIONS.KUPPI_VIEW,
        PERMISSIONS.VOTING_VIEW,
        PERMISSIONS.VOTING_VOTE,
        PERMISSIONS.LOST_FOUND_VIEW,
        PERMISSIONS.LOST_FOUND_CREATE,
        PERMISSIONS.ACADEMIC_VIEW,
        PERMISSIONS.INTERNSHIPS_VIEW,
        PERMISSIONS.MAPS_VIEW,
        PERMISSIONS.MEETINGS_VIEW,
    ],

    // Student-specific permissions
    STUDENT: [
        PERMISSIONS.KUPPI_CREATE,
        PERMISSIONS.INTERNSHIPS_APPLY,
        PERMISSIONS.MEETINGS_BOOK,
        PERMISSIONS.LOST_FOUND_CLAIM,
    ],

    // Staff-specific permissions
    STAFF: [
        PERMISSIONS.EVENTS_CREATE,
        PERMISSIONS.EVENTS_EDIT,
        PERMISSIONS.ACADEMIC_RESULTS,
        PERMISSIONS.MEETINGS_MANAGE,
    ],

    // Admin permissions
    ADMIN: [
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_WRITE,
        PERMISSIONS.EVENTS_MANAGE,
        PERMISSIONS.EVENTS_DELETE,
        PERMISSIONS.KUPPI_EDIT,
        PERMISSIONS.KUPPI_DELETE,
        PERMISSIONS.VOTING_CREATE,
        PERMISSIONS.VOTING_MANAGE,
        PERMISSIONS.LOST_FOUND_MANAGE,
        PERMISSIONS.ACADEMIC_MANAGE,
        PERMISSIONS.INTERNSHIPS_MANAGE,
        PERMISSIONS.MAPS_EDIT,
        PERMISSIONS.ADMIN_USERS_VIEW,
        PERMISSIONS.ADMIN_USERS_MANAGE,
        PERMISSIONS.ADMIN_ROLES_VIEW,
        PERMISSIONS.DASHBOARD_ANALYTICS,
    ],

    // Super Admin permissions (highest level)
    SUPER_ADMIN: [
        PERMISSIONS.USER_DELETE,
        PERMISSIONS.ADMIN_ROLES_MANAGE,
        PERMISSIONS.ADMIN_SETTINGS,
        PERMISSIONS.SUPER_ADMIN_SYSTEM,
        PERMISSIONS.SUPER_ADMIN_AUDIT,
        PERMISSIONS.SUPER_ADMIN_CONFIG,
    ],
};
```

### Role-Permission Mapping

```typescript
// features/authorization/role.config.ts

import { ROLES, RoleType } from '@/constants/roles';
import { PERMISSION_GROUPS, PermissionType } from '@/constants/permissions';

export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
    [ROLES.STUDENT]: [
        ...PERMISSION_GROUPS.BASIC_USER,
        ...PERMISSION_GROUPS.STUDENT,
    ],

    [ROLES.ACADEMIC_STAFF]: [
        ...PERMISSION_GROUPS.BASIC_USER,
        ...PERMISSION_GROUPS.STAFF,
    ],

    [ROLES.NON_ACADEMIC_STAFF]: [
        ...PERMISSION_GROUPS.BASIC_USER,
    ],

    [ROLES.ADMIN]: [
        ...PERMISSION_GROUPS.BASIC_USER,
        ...PERMISSION_GROUPS.STUDENT,
        ...PERMISSION_GROUPS.STAFF,
        ...PERMISSION_GROUPS.ADMIN,
    ],

    [ROLES.SUPER_ADMIN]: [
        ...PERMISSION_GROUPS.BASIC_USER,
        ...PERMISSION_GROUPS.STUDENT,
        ...PERMISSION_GROUPS.STAFF,
        ...PERMISSION_GROUPS.ADMIN,
        ...PERMISSION_GROUPS.SUPER_ADMIN,
    ],
};

// Get all permissions for a role
export function getPermissionsForRole(role: RoleType): PermissionType[] {
    return ROLE_PERMISSIONS[role] || [];
}

// Check if role has specific permission
export function roleHasPermission(role: RoleType, permission: PermissionType): boolean {
    return getPermissionsForRole(role).includes(permission);
}
```

### Permission Matrix

| Permission | Student | Academic Staff | Non-Academic | Admin | Super Admin |
|------------|---------|----------------|--------------|-------|-------------|
| `profile:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `profile:write` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dashboard:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dashboard:analytics` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `events:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `events:create` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `events:edit` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `events:delete` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `events:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `kuppi:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `kuppi:create` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `kuppi:edit` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `kuppi:delete` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `user:read` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `user:write` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `user:delete` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `admin:users:view` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `admin:users:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `admin:roles:manage` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `superadmin:system` | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Token Refresh Flow

The system implements automatic token refresh to maintain seamless user sessions.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TOKEN REFRESH FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. API Request Made                                                     │
│     │                                                                    │
│     ▼                                                                    │
│  2. Axios Interceptor Attaches Token                                    │
│     │                                                                    │
│     ▼                                                                    │
│  3. Backend Validates Token                                             │
│     │                                                                    │
│     ├──── Token Valid ──────▶ Request Proceeds                          │
│     │                                                                    │
│     └──── Token Expired (401) ──────▶ Interceptor Catches               │
│                                        │                                 │
│                                        ▼                                 │
│                                   4. Check Refresh Token                 │
│                                        │                                 │
│                                        ├── Has Refresh Token             │
│                                        │   │                             │
│                                        │   ▼                             │
│                                        │   5. Call /v1/auth/refresh     │
│                                        │   │                             │
│                                        │   ├── Success                   │
│                                        │   │   Store new tokens         │
│                                        │   │   Retry original request   │
│                                        │   │                             │
│                                        │   └── Failure                   │
│                                        │       Clear tokens             │
│                                        │       Redirect to login        │
│                                        │                                 │
│                                        └── No Refresh Token             │
│                                            Redirect to login            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// lib/api-client.ts

// Queue for requests waiting during token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor for token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = tokenStorage.getRefreshToken();
                
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Call refresh endpoint
                const response = await axios.post(`${API_URL}/v1/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                
                // Store new tokens
                tokenStorage.setTokens(accessToken, newRefreshToken || refreshToken);

                // Process queued requests with new token
                processQueue(null, accessToken);

                // Retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // Refresh failed - logout user
                tokenStorage.clearTokens();
                
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?session=expired';
                }
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
```

---

## Permission Checking

### usePermission Hook

The primary hook for checking permissions in components.

```typescript
// hooks/usePermission.ts
'use client';

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { PermissionType } from '@/constants/permissions';
import { 
    hasPermission as checkHasPermission, 
    hasAnyPermission as checkHasAnyPermission, 
    hasAllPermissions as checkHasAllPermissions 
} from '@/features/authorization/permission.guard';

export function usePermission() {
    const { user } = useAuthStore();

    // Memoize authorities to prevent unnecessary re-renders
    const authorities = useMemo(() => user?.authorities || [], [user]);
    const role = useMemo(() => user?.role || null, [user]);

    /**
     * Check if user has a specific permission
     * @param permission - The permission to check
     * @returns boolean
     */
    const hasPermission = useCallback((permission: PermissionType): boolean => {
        if (!role) return false;
        return checkHasPermission(role, authorities, permission);
    }, [role, authorities]);

    /**
     * Check if user has ANY of the specified permissions
     * @param permissions - Array of permissions to check
     * @returns boolean
     */
    const hasAnyPermission = useCallback((permissions: PermissionType[]): boolean => {
        if (!role) return false;
        return checkHasAnyPermission(role, authorities, permissions);
    }, [role, authorities]);

    /**
     * Check if user has ALL of the specified permissions
     * @param permissions - Array of permissions to check
     * @returns { hasPermission: boolean, missingPermissions: PermissionType[] }
     */
    const hasAllPermissions = useCallback((permissions: PermissionType[]): { 
        hasPermission: boolean; 
        missingPermissions: PermissionType[] 
    } => {
        if (!role) return { hasPermission: false, missingPermissions: permissions };
        return checkHasAllPermissions(role, authorities, permissions);
    }, [role, authorities]);

    return {
        authorities,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
```

### useRole Hook

For role-based checks.

```typescript
// hooks/useRole.ts
'use client';

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { RoleType, ROLES, ROLE_HIERARCHY } from '@/constants/roles';

export function useRole() {
    const { user } = useAuthStore();

    const role = useMemo(() => user?.role || null, [user]);

    // Pre-computed role checks
    const isStudent = useMemo(() => role === ROLES.STUDENT, [role]);
    const isAcademicStaff = useMemo(() => role === ROLES.ACADEMIC_STAFF, [role]);
    const isNonAcademicStaff = useMemo(() => role === ROLES.NON_ACADEMIC_STAFF, [role]);
    const isAdmin = useMemo(() => role === ROLES.ADMIN, [role]);
    const isSuperAdmin = useMemo(() => role === ROLES.SUPER_ADMIN, [role]);
    const isStaff = useMemo(() => isAcademicStaff || isNonAcademicStaff, [isAcademicStaff, isNonAcademicStaff]);
    const isAdminOrHigher = useMemo(() => isAdmin || isSuperAdmin, [isAdmin, isSuperAdmin]);

    /**
     * Check if user has specific role
     */
    const hasRole = useCallback((checkRole: RoleType): boolean => {
        return role === checkRole;
    }, [role]);

    /**
     * Check if user has any of the specified roles
     */
    const hasAnyRole = useCallback((roles: RoleType[]): boolean => {
        if (!role) return false;
        return roles.includes(role);
    }, [role]);

    /**
     * Check if user's role meets minimum requirement
     * Uses role hierarchy for comparison
     */
    const hasMinimumRole = useCallback((minRole: RoleType): boolean => {
        if (!role) return false;
        return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
    }, [role]);

    return {
        role,
        isStudent,
        isAcademicStaff,
        isNonAcademicStaff,
        isAdmin,
        isSuperAdmin,
        isStaff,
        isAdminOrHigher,
        hasRole,
        hasAnyRole,
        hasMinimumRole,
    };
}
```

### Permission Guard Functions

```typescript
// features/authorization/permission.guard.ts

import { RoleType } from '@/constants/roles';
import { PermissionType } from '@/constants/permissions';
import { roleHasPermission } from './role.config';

/**
 * Check if user has specific permission
 * Checks both explicit authorities and role-based permissions
 */
export function hasPermission(
    userRole: RoleType, 
    userAuthorities: PermissionType[], 
    requiredPermission: PermissionType
): boolean {
    // First check explicit authorities from token
    if (userAuthorities.includes(requiredPermission)) return true;
    
    // Fall back to role-based permission check
    return roleHasPermission(userRole, requiredPermission);
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(
    userRole: RoleType, 
    userAuthorities: PermissionType[], 
    requiredPermissions: PermissionType[]
): boolean {
    return requiredPermissions.some(p => 
        hasPermission(userRole, userAuthorities, p)
    );
}

/**
 * Check if user has ALL specified permissions
 * Returns object with result and missing permissions
 */
export function hasAllPermissions(
    userRole: RoleType, 
    userAuthorities: PermissionType[], 
    requiredPermissions: PermissionType[]
): { hasPermission: boolean; missingPermissions: PermissionType[] } {
    const missing = requiredPermissions.filter(p => 
        !hasPermission(userRole, userAuthorities, p)
    );
    return { 
        hasPermission: missing.length === 0, 
        missingPermissions: missing 
    };
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
    userRole: RoleType, 
    userAuthorities: PermissionType[], 
    allowedRoles?: RoleType[], 
    requiredPermissions?: PermissionType[], 
    requireAll = false
): boolean {
    // Check role restriction
    if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
        return false;
    }
    
    // Check permissions
    if (requiredPermissions?.length) {
        return requireAll 
            ? hasAllPermissions(userRole, userAuthorities, requiredPermissions).hasPermission 
            : hasAnyPermission(userRole, userAuthorities, requiredPermissions);
    }
    
    return true;
}

/**
 * Create a reusable permission guard function
 */
export function createPermissionGuard(
    requiredPermissions: PermissionType[], 
    requireAll = true
) {
    return (userRole: RoleType, userAuthorities: PermissionType[]) => 
        requireAll 
            ? hasAllPermissions(userRole, userAuthorities, requiredPermissions).hasPermission 
            : hasAnyPermission(userRole, userAuthorities, requiredPermissions);
}

/**
 * Create a reusable role guard function
 */
export function createRoleGuard(allowedRoles: RoleType[]) {
    return (userRole: RoleType) => allowedRoles.includes(userRole);
}
```

---

## Route Protection

### Next.js Middleware

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/admin/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/offline',
];

// Route to role mapping
const ROUTE_ROLE_MAP: Record<string, string[]> = {
    '/super-admin': ['ROLE_SUPER_ADMIN'],
    '/admin': ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
    '/student': ['ROLE_STUDENT'],
    '/academic': ['ROLE_ACADEMIC_STAFF'],
    '/non-academic': ['ROLE_NON_ACADEMIC_STAFF'],
};

// Default dashboard by role
const DEFAULT_DASHBOARD: Record<string, string> = {
    'ROLE_SUPER_ADMIN': '/super-admin',
    'ROLE_ADMIN': '/admin',
    'ROLE_STUDENT': '/student',
    'ROLE_ACADEMIC_STAFF': '/academic',
    'ROLE_NON_ACADEMIC_STAFF': '/non-academic',
};

interface JWTPayload {
    role?: string;
    exp?: number;
}

/**
 * Decode JWT in Edge runtime (no verification)
 */
function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        return payload;
    } catch {
        return null;
    }
}

function isTokenExpired(exp?: number): boolean {
    if (!exp) return true;
    return exp * 1000 < Date.now();
}

function getTokenFromRequest(request: NextRequest): string | undefined {
    // Try cookie first, then Authorization header
    return request.cookies.get('accessToken')?.value ||
           request.headers.get('authorization')?.replace('Bearer ', '');
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static files and API routes
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api') || 
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get and validate token
    const token = getTokenFromRequest(request);
    const payload = token ? decodeJWT(token) : null;
    const isValidToken = payload && !isTokenExpired(payload.exp);

    // Redirect authenticated users away from auth pages
    if (isValidToken && PUBLIC_ROUTES.includes(pathname)) {
        const dashboard = DEFAULT_DASHBOARD[payload.role!] || '/student';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // Protected routes - require authentication
    if (!token || !isValidToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
        if (pathname.startsWith(routePrefix)) {
            if (!payload?.role || !allowedRoles.includes(payload.role)) {
                // Redirect to user's dashboard if not authorized
                const dashboard = DEFAULT_DASHBOARD[payload?.role!] || '/student';
                return NextResponse.redirect(new URL(dashboard, request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Component-Level Access Control

### ProtectedView Component

```typescript
// components/layout/ProtectedView.tsx
'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { RoleType } from '@/constants/roles';
import { PermissionType } from '@/constants/permissions';

interface ProtectedViewProps {
    children: ReactNode;
    requiredPermissions?: PermissionType[];
    requiredRoles?: RoleType[];
    requireAll?: boolean;  // If true, ALL permissions required; if false, ANY is enough
    fallback?: ReactNode;
}

export function ProtectedView({
    children,
    requiredPermissions,
    requiredRoles,
    requireAll = false,
    fallback = null,
}: ProtectedViewProps) {
    const { hasAnyPermission, hasAllPermissions } = usePermission();
    const { hasAnyRole } = useRole();

    // Check roles first
    if (requiredRoles?.length && !hasAnyRole(requiredRoles)) {
        return <>{fallback}</>;
    }

    // Check permissions
    if (requiredPermissions?.length) {
        if (requireAll) {
            const result = hasAllPermissions(requiredPermissions);
            if (!result.hasPermission) {
                return <>{fallback}</>;
            }
        } else {
            if (!hasAnyPermission(requiredPermissions)) {
                return <>{fallback}</>;
            }
        }
    }

    return <>{children}</>;
}

// Convenience Components

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <ProtectedView requiredRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']} fallback={fallback}>
            {children}
        </ProtectedView>
    );
}

export function SuperAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <ProtectedView requiredRoles={['ROLE_SUPER_ADMIN']} fallback={fallback}>
            {children}
        </ProtectedView>
    );
}

export function WithPermission({
    permission,
    children,
    fallback,
}: {
    permission: PermissionType;
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <ProtectedView requiredPermissions={[permission]} fallback={fallback}>
            {children}
        </ProtectedView>
    );
}
```

### RoleGuard Component

```typescript
// components/layout/RoleGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { RoleType } from '@/constants/roles';
import { AccessDenied } from '@/components/common/AccessDenied';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: RoleType[];
    fallback?: ReactNode;
    accessDeniedMessage?: string;
}

export function RoleGuard({
    children,
    allowedRoles,
    fallback,
    accessDeniedMessage = "You don't have permission to access this area.",
}: RoleGuardProps) {
    const { hasAnyRole } = useRole();

    if (!hasAnyRole(allowedRoles)) {
        return fallback ?? <AccessDenied message={accessDeniedMessage} />;
    }

    return <>{children}</>;
}

// Pre-configured guards
export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <RoleGuard
            allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}
            fallback={fallback}
            accessDeniedMessage="You need admin privileges to access this area."
        >
            {children}
        </RoleGuard>
    );
}

export function SuperAdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <RoleGuard
            allowedRoles={['ROLE_SUPER_ADMIN']}
            fallback={fallback}
            accessDeniedMessage="You need super admin privileges to access this area."
        >
            {children}
        </RoleGuard>
    );
}
```

---

## API Integration

### Auth Store (Zustand)

```typescript
// store/auth.store.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, LoginCredentials } from '@/features/auth/auth.types';
import { 
    login as loginService, 
    logout as logoutService, 
    getUserFromStoredToken 
} from '@/features/auth/services';
import { ROLES, RoleType } from '@/constants/roles';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean;
}

interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<AuthUser>;
    logout: () => Promise<void>;
    clearError: () => void;
    setUser: (user: AuthUser | null) => void;
    initializeFromToken: () => void;
    getDefaultRedirect: (user: AuthUser | null) => string;
    setHydrated: () => void;
}

const DEFAULT_DASHBOARDS: Record<RoleType, string> = {
    [ROLES.SUPER_ADMIN]: '/super-admin',
    [ROLES.ADMIN]: '/admin',
    [ROLES.STUDENT]: '/student',
    [ROLES.ACADEMIC_STAFF]: '/academic',
    [ROLES.NON_ACADEMIC_STAFF]: '/non-academic',
};

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            // Initial State
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isHydrated: false,

            // Actions
            setHydrated: () => set({ isHydrated: true }),

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });
                try {
                    const user = await loginService(credentials);
                    set({ user, isAuthenticated: true, isLoading: false });
                    return user;
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Login failed';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await logoutService();
                } finally {
                    set({ 
                        user: null, 
                        isAuthenticated: false, 
                        isLoading: false, 
                        error: null 
                    });
                }
            },

            clearError: () => set({ error: null }),

            setUser: (user: AuthUser | null) => {
                set({ user, isAuthenticated: !!user });
            },

            initializeFromToken: () => {
                const user = getUserFromStoredToken();
                if (user) {
                    set({ user, isAuthenticated: true });
                }
            },

            getDefaultRedirect: (user: AuthUser | null) => {
                if (!user?.role) return '/login';
                return DEFAULT_DASHBOARDS[user.role] || '/';
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                return sessionStorage;
            }),
            partialize: (state) => ({ 
                user: state.user, 
                isAuthenticated: state.isAuthenticated 
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
```

### useAuth Hook

```typescript
// hooks/useAuth.ts
'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/constants';
import { LoginCredentials } from '@/features';

export function useAuth() {
    const router = useRouter();
    const { 
        user, 
        isAuthenticated, 
        isLoading, 
        error, 
        login, 
        logout, 
        clearError, 
        getDefaultRedirect 
    } = useAuthStore();

    const loginWithRedirect = useCallback(async (credentials: LoginCredentials) => {
        try {
            const loggedInUser = await login(credentials);
            const redirectPath = getDefaultRedirect(loggedInUser);

            // Small delay to ensure cookies are written
            await new Promise(resolve => setTimeout(resolve, 100));

            // Full page navigation for cookie propagation
            if (typeof window !== 'undefined') {
                window.location.href = redirectPath;
            }

            return loggedInUser;
        } catch (err) {
            throw err;
        }
    }, [login, getDefaultRedirect]);

    const logoutWithRedirect = useCallback(async () => {
        await logout();
        if (typeof window !== 'undefined') {
            window.location.href = ROUTES.LOGIN;
        }
    }, [logout]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login: loginWithRedirect,
        logout: logoutWithRedirect,
        clearError,
        getDefaultRedirect,
    };
}
```

---

## Complete Code Examples

### Example 1: Dashboard with Permission-Based Widgets

```typescript
// app/(protected)/student/page.tsx
'use client';

import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { ProtectedView, WithPermission } from '@/components/layout';
import { PERMISSIONS } from '@/constants';

export default function StudentDashboard() {
    const { hasPermission } = usePermission();
    const { isStudent, role } = useRole();

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                Welcome to Student Dashboard
            </h1>

            {/* Always visible to students */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Profile Widget - everyone can see */}
                <ProfileWidget />

                {/* Events Widget - requires events:view */}
                <WithPermission permission={PERMISSIONS.EVENTS_VIEW}>
                    <EventsWidget />
                </WithPermission>

                {/* Kuppi Widget - requires kuppi:view */}
                <WithPermission permission={PERMISSIONS.KUPPI_VIEW}>
                    <KuppiWidget />
                </WithPermission>

                {/* Academic Results - requires academic:view */}
                <ProtectedView 
                    requiredPermissions={[PERMISSIONS.ACADEMIC_VIEW]}
                    fallback={<AcademicWidgetPlaceholder />}
                >
                    <AcademicWidget />
                </ProtectedView>
            </div>

            {/* Action Buttons based on permissions */}
            <div className="flex gap-4">
                {hasPermission(PERMISSIONS.KUPPI_CREATE) && (
                    <button className="btn btn-primary">
                        Create Kuppi Session
                    </button>
                )}

                {hasPermission(PERMISSIONS.INTERNSHIPS_APPLY) && (
                    <button className="btn btn-secondary">
                        Apply for Internship
                    </button>
                )}

                {hasPermission(PERMISSIONS.MEETINGS_BOOK) && (
                    <button className="btn btn-outline">
                        Book Meeting
                    </button>
                )}
            </div>
        </div>
    );
}
```

### Example 2: Admin User Management

```typescript
// app/(protected)/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { PERMISSIONS } from '@/constants';
import { api } from '@/lib/api-client';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    verified: boolean;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { hasPermission } = usePermission();
    const { isSuperAdmin } = useRole();

    // Permission checks
    const canViewUsers = hasPermission(PERMISSIONS.ADMIN_USERS_VIEW);
    const canManageUsers = hasPermission(PERMISSIONS.ADMIN_USERS_MANAGE);
    const canDeleteUsers = hasPermission(PERMISSIONS.USER_DELETE);
    const canManageRoles = hasPermission(PERMISSIONS.ADMIN_ROLES_MANAGE);

    useEffect(() => {
        if (!canViewUsers) {
            setError('You do not have permission to view users');
            setLoading(false);
            return;
        }

        async function fetchUsers() {
            try {
                const data = await api.get<User[]>('/v1/users');
                setUsers(data);
            } catch (err) {
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [canViewUsers]);

    const handleEdit = async (userId: string) => {
        if (!canManageUsers) {
            alert('You do not have permission to edit users');
            return;
        }
        // Navigate to edit page
    };

    const handleDelete = async (userId: string) => {
        if (!canDeleteUsers) {
            alert('You do not have permission to delete users');
            return;
        }

        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/v1/users/${userId}`);
                setUsers(users.filter(u => u.id !== userId));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        if (!canManageRoles) {
            alert('You do not have permission to change roles');
            return;
        }
        // Change role logic
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                
                {canManageUsers && (
                    <button className="btn btn-primary">
                        Add New User
                    </button>
                )}
            </div>

            <table className="w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>
                                {canManageRoles ? (
                                    <select 
                                        value={user.role}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                    >
                                        <option value="ROLE_STUDENT">Student</option>
                                        <option value="ROLE_ACADEMIC_STAFF">Academic Staff</option>
                                        <option value="ROLE_NON_ACADEMIC_STAFF">Non-Academic Staff</option>
                                        <option value="ROLE_ADMIN">Admin</option>
                                        {isSuperAdmin && (
                                            <option value="ROLE_SUPER_ADMIN">Super Admin</option>
                                        )}
                                    </select>
                                ) : (
                                    <span>{user.role}</span>
                                )}
                            </td>
                            <td>
                                <span className={user.verified ? 'text-green-500' : 'text-yellow-500'}>
                                    {user.verified ? 'Verified' : 'Pending'}
                                </span>
                            </td>
                            <td className="space-x-2">
                                {canManageUsers && (
                                    <button 
                                        onClick={() => handleEdit(user.id)}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Edit
                                    </button>
                                )}
                                {canDeleteUsers && (
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="btn btn-sm btn-error"
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

### Example 3: Conditional Navigation

```typescript
// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { PERMISSIONS, PermissionType } from '@/constants/permissions';
import { RoleType } from '@/constants/roles';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    permission?: PermissionType;
    roles?: RoleType[];
}

const NAV_ITEMS: NavItem[] = [
    { 
        label: 'Dashboard', 
        href: '/dashboard', 
        icon: <HomeIcon /> 
    },
    { 
        label: 'Events', 
        href: '/events', 
        icon: <CalendarIcon />,
        permission: PERMISSIONS.EVENTS_VIEW 
    },
    { 
        label: 'Kuppi Sessions', 
        href: '/kuppi', 
        icon: <BookIcon />,
        permission: PERMISSIONS.KUPPI_VIEW 
    },
    { 
        label: 'Lost & Found', 
        href: '/lost-found', 
        icon: <SearchIcon />,
        permission: PERMISSIONS.LOST_FOUND_VIEW 
    },
    { 
        label: 'Internships', 
        href: '/internships', 
        icon: <BriefcaseIcon />,
        permission: PERMISSIONS.INTERNSHIPS_VIEW 
    },
    { 
        label: 'User Management', 
        href: '/admin/users', 
        icon: <UsersIcon />,
        permission: PERMISSIONS.ADMIN_USERS_VIEW,
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']
    },
    { 
        label: 'System Settings', 
        href: '/super-admin/settings', 
        icon: <SettingsIcon />,
        permission: PERMISSIONS.SUPER_ADMIN_SYSTEM,
        roles: ['ROLE_SUPER_ADMIN']
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { hasPermission } = usePermission();
    const { hasAnyRole } = useRole();

    // Filter nav items based on permissions and roles
    const visibleItems = NAV_ITEMS.filter(item => {
        // Check permission if specified
        if (item.permission && !hasPermission(item.permission)) {
            return false;
        }
        
        // Check roles if specified
        if (item.roles && !hasAnyRole(item.roles)) {
            return false;
        }
        
        return true;
    });

    return (
        <nav className="w-64 bg-gray-800 min-h-screen p-4">
            <div className="space-y-2">
                {visibleItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg
                            ${pathname === item.href 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-300 hover:bg-gray-700'
                            }
                        `}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
```

### Example 4: Protected Layout

```typescript
// app/(protected)/admin/layout.tsx
'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard 
            allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}
            accessDeniedMessage="You need administrator privileges to access this area."
        >
            <DashboardLayout title="Admin Dashboard">
                {children}
            </DashboardLayout>
        </RoleGuard>
    );
}
```

### Example 5: Custom Permission Hook for a Feature

```typescript
// hooks/useEventPermissions.ts
'use client';

import { useMemo } from 'react';
import { usePermission } from './usePermission';
import { PERMISSIONS } from '@/constants';

export function useEventPermissions() {
    const { hasPermission, hasAnyPermission } = usePermission();

    return useMemo(() => ({
        // View permissions
        canView: hasPermission(PERMISSIONS.EVENTS_VIEW),
        
        // Create permissions
        canCreate: hasPermission(PERMISSIONS.EVENTS_CREATE),
        
        // Edit permissions
        canEdit: hasPermission(PERMISSIONS.EVENTS_EDIT),
        
        // Delete permissions
        canDelete: hasPermission(PERMISSIONS.EVENTS_DELETE),
        
        // Full management
        canManage: hasPermission(PERMISSIONS.EVENTS_MANAGE),
        
        // Any modification permission
        canModify: hasAnyPermission([
            PERMISSIONS.EVENTS_CREATE,
            PERMISSIONS.EVENTS_EDIT,
            PERMISSIONS.EVENTS_DELETE,
            PERMISSIONS.EVENTS_MANAGE,
        ]),
    }), [hasPermission, hasAnyPermission]);
}

// Usage in component
function EventsPage() {
    const { canView, canCreate, canEdit, canDelete, canManage } = useEventPermissions();

    if (!canView) {
        return <AccessDenied message="You cannot view events" />;
    }

    return (
        <div>
            {canCreate && <button>Create Event</button>}
            {/* ... */}
        </div>
    );
}
```

---

## Error Handling

### API Error Responses

```typescript
// types/api.d.ts

interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    timestamp: string;
}

// Common error codes
type ErrorCode =
    | 'UNAUTHORIZED'           // 401 - Not authenticated
    | 'FORBIDDEN'              // 403 - Not authorized
    | 'TOKEN_EXPIRED'          // Token has expired
    | 'TOKEN_INVALID'          // Token is malformed
    | 'PERMISSION_DENIED'      // Missing required permission
    | 'ROLE_NOT_ALLOWED'       // Role cannot access resource
    | 'RESOURCE_NOT_FOUND'     // 404
    | 'VALIDATION_ERROR'       // 400 - Invalid input
    | 'INTERNAL_ERROR';        // 500
```

### Handling 401/403 Errors

```typescript
// lib/api-client.ts

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        const status = error.response?.status;
        const errorData = error.response?.data;

        switch (status) {
            case 401:
                // Unauthorized - try refresh or logout
                // (handled by refresh logic above)
                break;

            case 403:
                // Forbidden - user doesn't have permission
                console.error('Permission denied:', errorData?.error?.message);
                
                // Optionally dispatch event for global handling
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:forbidden', {
                        detail: errorData
                    }));
                }
                break;

            case 404:
                console.error('Resource not found');
                break;

            default:
                console.error('API Error:', errorData?.error?.message);
        }

        return Promise.reject(errorData);
    }
);
```

### Global Error Handler

```typescript
// providers/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // Handle forbidden events globally
        const handleForbidden = (event: CustomEvent) => {
            toast.error(event.detail?.error?.message || 'Access denied');
        };

        // Handle session expired
        const handleSessionExpired = () => {
            toast.error('Your session has expired. Please log in again.');
            router.push('/login?session=expired');
        };

        window.addEventListener('auth:forbidden', handleForbidden as EventListener);
        window.addEventListener('auth:session-expired', handleSessionExpired);

        return () => {
            window.removeEventListener('auth:forbidden', handleForbidden as EventListener);
            window.removeEventListener('auth:session-expired', handleSessionExpired);
        };
    }, [router]);

    return <>{children}</>;
}
```

---

## Security Best Practices

### 1. Always Validate Server-Side

```typescript
// ❌ WRONG - Only client-side check
function DeleteUserButton({ userId }: { userId: string }) {
    const { hasPermission } = usePermission();
    
    if (!hasPermission(PERMISSIONS.USER_DELETE)) {
        return null; // User can still call API directly!
    }
    
    return <button>Delete</button>;
}

// ✅ CORRECT - Client AND server validation
// Frontend hides button, backend validates permission
async function deleteUser(userId: string) {
    // Backend checks JWT and validates user:delete permission
    await api.delete(`/v1/users/${userId}`);
}
```

### 2. Use Type-Safe Permission Constants

```typescript
// ❌ WRONG - String literals prone to typos
hasPermission('event:create'); // Wrong spelling!

// ✅ CORRECT - Use constants
import { PERMISSIONS } from '@/constants';
hasPermission(PERMISSIONS.EVENTS_CREATE);
```

### 3. Don't Trust Client-Side Token Data for Critical Operations

```typescript
// ❌ WRONG - Using client-side role for critical logic
const { isSuperAdmin } = useRole();
if (isSuperAdmin) {
    await deleteAllUsers(); // Dangerous!
}

// ✅ CORRECT - Let backend validate
try {
    await api.delete('/v1/admin/users/bulk-delete');
    // Backend validates SUPER_ADMIN role and superadmin:system permission
} catch (error) {
    if (error.status === 403) {
        toast.error('Not authorized');
    }
}
```

### 4. Implement Defense in Depth

```
Layer 1: Next.js Middleware (route protection)
   ↓
Layer 2: RoleGuard/ProtectedView (component protection)
   ↓
Layer 3: usePermission checks (UI element visibility)
   ↓
Layer 4: API Interceptor (token attachment)
   ↓
Layer 5: Backend validation (final authority)
```

### 5. Handle Token Expiration Gracefully

```typescript
// Proactive token refresh
useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    const expiresIn = getTokenExpiresIn(token);
    
    // Refresh 5 minutes before expiration
    if (expiresIn > 0 && expiresIn < 5 * 60 * 1000) {
        refreshToken();
    }
    
    // Set up interval for long sessions
    const interval = setInterval(() => {
        const currentToken = tokenStorage.getAccessToken();
        if (currentToken && getTokenExpiresIn(currentToken) < 5 * 60 * 1000) {
            refreshToken();
        }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
}, []);
```

### 6. Secure Token Storage

```typescript
// Current implementation uses localStorage + cookies
// For higher security, consider:

// Option 1: HttpOnly cookies (set by backend)
// - Pros: Not accessible via JavaScript
// - Cons: Requires backend support, CORS configuration

// Option 2: In-memory only (for sensitive apps)
// - Pros: Cleared on tab close
// - Cons: User must re-login on refresh

// Option 3: Session storage (current approach)
// - Pros: Cleared on browser close
// - Cons: Accessible via JavaScript

// Best practice: Use short-lived access tokens (15-30 min)
// with longer refresh tokens (7 days)
```

---

## Testing Guide

### Unit Testing Hooks

```typescript
// __tests__/hooks/usePermission.test.ts
import { renderHook } from '@testing-library/react';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/auth.store';
import { PERMISSIONS } from '@/constants';

// Mock the auth store
jest.mock('@/store/auth.store');

describe('usePermission', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return false when user has no permissions', () => {
        (useAuthStore as jest.Mock).mockReturnValue({
            user: {
                role: 'ROLE_STUDENT',
                authorities: [],
            },
        });

        const { result } = renderHook(() => usePermission());
        
        expect(result.current.hasPermission(PERMISSIONS.ADMIN_USERS_VIEW)).toBe(false);
    });

    it('should return true when user has explicit permission', () => {
        (useAuthStore as jest.Mock).mockReturnValue({
            user: {
                role: 'ROLE_STUDENT',
                authorities: [PERMISSIONS.EVENTS_VIEW, PERMISSIONS.KUPPI_CREATE],
            },
        });

        const { result } = renderHook(() => usePermission());
        
        expect(result.current.hasPermission(PERMISSIONS.EVENTS_VIEW)).toBe(true);
        expect(result.current.hasPermission(PERMISSIONS.KUPPI_CREATE)).toBe(true);
    });

    it('should check all permissions correctly', () => {
        (useAuthStore as jest.Mock).mockReturnValue({
            user: {
                role: 'ROLE_ADMIN',
                authorities: [
                    PERMISSIONS.USER_READ,
                    PERMISSIONS.USER_WRITE,
                ],
            },
        });

        const { result } = renderHook(() => usePermission());
        
        const allResult = result.current.hasAllPermissions([
            PERMISSIONS.USER_READ,
            PERMISSIONS.USER_WRITE,
            PERMISSIONS.USER_DELETE,
        ]);
        
        expect(allResult.hasPermission).toBe(false);
        expect(allResult.missingPermissions).toContain(PERMISSIONS.USER_DELETE);
    });
});
```

### Testing Protected Components

```typescript
// __tests__/components/ProtectedView.test.tsx
import { render, screen } from '@testing-library/react';
import { ProtectedView } from '@/components/layout/ProtectedView';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants';

jest.mock('@/hooks/usePermission');
jest.mock('@/hooks/useRole');

describe('ProtectedView', () => {
    it('renders children when user has permission', () => {
        (usePermission as jest.Mock).mockReturnValue({
            hasAnyPermission: () => true,
            hasAllPermissions: () => ({ hasPermission: true, missingPermissions: [] }),
        });

        render(
            <ProtectedView requiredPermissions={[PERMISSIONS.EVENTS_VIEW]}>
                <div data-testid="protected-content">Protected Content</div>
            </ProtectedView>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('renders fallback when user lacks permission', () => {
        (usePermission as jest.Mock).mockReturnValue({
            hasAnyPermission: () => false,
            hasAllPermissions: () => ({ hasPermission: false, missingPermissions: [PERMISSIONS.ADMIN_USERS_VIEW] }),
        });

        render(
            <ProtectedView 
                requiredPermissions={[PERMISSIONS.ADMIN_USERS_VIEW]}
                fallback={<div data-testid="fallback">Access Denied</div>}
            >
                <div data-testid="protected-content">Protected Content</div>
            </ProtectedView>
        );

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Token Not Being Sent with Requests

```typescript
// Check if token exists
const token = tokenStorage.getAccessToken();
console.log('Access Token:', token);

// Verify axios interceptor is attaching token
// Check Network tab in DevTools for Authorization header
```

#### 2. Permission Check Always Returns False

```typescript
// Debug user authorities
const { authorities } = usePermission();
console.log('User authorities:', authorities);

// Check if permission constant matches
console.log('Checking permission:', PERMISSIONS.EVENTS_VIEW);
console.log('Has permission:', authorities.includes(PERMISSIONS.EVENTS_VIEW));
```

#### 3. Middleware Not Redirecting Properly

```typescript
// Check cookie is being set
console.log('Cookies:', document.cookie);

// Verify token in cookie matches localStorage
const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];
console.log('Cookie token:', decodeURIComponent(cookieToken || ''));
```

#### 4. Role Not Recognized

```typescript
// Check role format
const { role } = useRole();
console.log('User role:', role);
// Should be: "ROLE_STUDENT", "ROLE_ADMIN", etc.

// If using legacy format, ensure mapLegacyRole is called
import { mapLegacyRole } from '@/constants/roles';
const normalizedRole = mapLegacyRole(rawRole);
```

#### 5. Token Refresh Loop

```typescript
// Check if refresh token is valid
const refreshToken = tokenStorage.getRefreshToken();
console.log('Refresh token exists:', !!refreshToken);

// Check refresh endpoint response
// If getting 401 on refresh, token is invalid - logout user
```

---

## Quick Reference

### Hooks Summary

| Hook | Purpose | Returns |
|------|---------|---------|
| `useAuth()` | Auth actions & state | `{ user, login, logout, isAuthenticated, ... }` |
| `usePermission()` | Permission checks | `{ hasPermission, hasAnyPermission, hasAllPermissions, authorities }` |
| `useRole()` | Role checks | `{ role, isStudent, isAdmin, hasRole, hasMinimumRole, ... }` |

### Components Summary

| Component | Purpose | Props |
|-----------|---------|-------|
| `ProtectedView` | Conditional rendering | `requiredPermissions?, requiredRoles?, requireAll?, fallback?` |
| `RoleGuard` | Page/Layout protection | `allowedRoles, fallback?, accessDeniedMessage?` |
| `WithPermission` | Single permission check | `permission, fallback?` |
| `AdminOnly` | Admin content wrapper | `fallback?` |
| `SuperAdminOnly` | Super admin content wrapper | `fallback?` |

### Permission Check Methods

```typescript
// Check single permission
const canCreate = hasPermission(PERMISSIONS.EVENTS_CREATE);

// Check if has ANY permission
const canModify = hasAnyPermission([
    PERMISSIONS.EVENTS_EDIT,
    PERMISSIONS.EVENTS_DELETE,
]);

// Check if has ALL permissions
const { hasPermission, missingPermissions } = hasAllPermissions([
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
]);

// Check role
const isAdmin = hasRole('ROLE_ADMIN');
const isAdminOrHigher = hasMinimumRole('ROLE_ADMIN');
```

---

## Summary

This authorization system provides:

1. **JWT-Based Authentication** - Stateless, scalable authentication
2. **Role-Based Access Control** - 5 distinct roles with hierarchy
3. **Fine-Grained Permissions** - 40+ individual permissions
4. **Multiple Protection Layers** - Middleware, components, hooks
5. **Automatic Token Refresh** - Seamless session management
6. **Type-Safe Implementation** - TypeScript throughout
7. **Industry Best Practices** - Defense in depth, server validation

Always remember: **The backend is the ultimate authority for permission validation.** Frontend checks are for UX optimization only.


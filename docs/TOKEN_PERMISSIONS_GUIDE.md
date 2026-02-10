# Token Permissions & Data Access Guide

> ⚠️ **This document has been superseded.** 
> 
> Please refer to the comprehensive **[AUTHORIZATION_SYSTEM.md](./AUTHORIZATION_SYSTEM.md)** for the complete industry-standard documentation.

---

## Quick Reference (Summary)

This document explains how to handle JWT token permissions and user data access in the UniSphere frontend application. The system uses Role-Based Access Control (RBAC) with fine-grained permissions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [JWT Token Structure](#jwt-token-structure)
3. [Roles and Permissions](#roles-and-permissions)
4. [Using Permissions in Components](#using-permissions-in-components)
5. [Protected Routes & Middleware](#protected-routes--middleware)
6. [API Integration](#api-integration)
7. [Complete Examples](#complete-examples)
8. [Best Practices](#best-practices)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   JWT Token  │───▶│  Auth Store  │───▶│  Hooks/Guards    │  │
│  │  (Backend)   │    │   (Zustand)  │    │  (Permission)    │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                   │                      │            │
│         ▼                   ▼                      ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Middleware  │    │  Components  │    │  Protected Views │  │
│  │ (Route Guard)│    │   (UI/UX)    │    │  (Access Control)│  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## JWT Token Structure

### Token Payload from Spring Boot Backend

```typescript
// types/jwt.d.ts
interface JWTPayload {
    sub: string;           // User ID
    email: string;         // User email
    firstName: string;     // User first name
    lastName: string;      // User last name
    role: string;          // User role (e.g., "ROLE_STUDENT")
    authorities: string[]; // Fine-grained permissions array
    iat: number;           // Issued at timestamp
    exp: number;           // Expiration timestamp
    iss?: string;          // Issuer (optional)
}
```

### Example Token Payload

```json
{
  "sub": "12345",
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
    "voting:vote"
  ],
  "iat": 1707552734,
  "exp": 1707639134
}
```

### Decoding Token (lib/jwt.ts)

```typescript
import { decodeToken, getUserFromToken, isTokenExpired } from '@/lib/jwt';

// Decode token
const payload = decodeToken(accessToken);

// Get user info
const user = getUserFromToken(accessToken);
// Returns: { id, email, firstName, lastName, role, authorities }

// Check expiration
const expired = isTokenExpired(accessToken);
```

---

## Roles and Permissions

### Available Roles (constants/roles.ts)

```typescript
export const ROLES = {
    STUDENT: 'ROLE_STUDENT',
    ACADEMIC_STAFF: 'ROLE_ACADEMIC_STAFF',
    NON_ACADEMIC_STAFF: 'ROLE_NON_ACADEMIC_STAFF',
    ADMIN: 'ROLE_ADMIN',
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
} as const;

// Role Hierarchy (higher = more access)
export const ROLE_HIERARCHY: Record<RoleType, number> = {
    [ROLES.STUDENT]: 1,
    [ROLES.ACADEMIC_STAFF]: 2,
    [ROLES.NON_ACADEMIC_STAFF]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.SUPER_ADMIN]: 4,
};
```

### Available Permissions (constants/permissions.ts)

```typescript
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

    // Kuppi permissions
    KUPPI_VIEW: 'kuppi:view',
    KUPPI_CREATE: 'kuppi:create',
    KUPPI_EDIT: 'kuppi:edit',
    KUPPI_DELETE: 'kuppi:delete',

    // Voting permissions
    VOTING_VIEW: 'voting:view',
    VOTING_VOTE: 'voting:vote',
    VOTING_CREATE: 'voting:create',
    VOTING_MANAGE: 'voting:manage',

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
```

### Permission Groups (Pre-defined Sets)

```typescript
export const PERMISSION_GROUPS = {
    // Basic permissions for all users
    BASIC_USER: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_WRITE,
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.EVENTS_VIEW,
        PERMISSIONS.KUPPI_VIEW,
        PERMISSIONS.VOTING_VIEW,
        PERMISSIONS.VOTING_VOTE,
        // ... more
    ],

    // Student-specific permissions
    STUDENT: [
        PERMISSIONS.KUPPI_CREATE,
        PERMISSIONS.INTERNSHIPS_APPLY,
        PERMISSIONS.MEETINGS_BOOK,
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
        PERMISSIONS.ADMIN_USERS_VIEW,
        // ... more
    ],

    // Super Admin permissions
    SUPER_ADMIN: [
        PERMISSIONS.USER_DELETE,
        PERMISSIONS.ADMIN_ROLES_MANAGE,
        PERMISSIONS.SUPER_ADMIN_SYSTEM,
        // ... more
    ],
};
```

### Role to Permission Mapping

```typescript
// features/authorization/role.config.ts
export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
    [ROLES.STUDENT]: [
        ...PERMISSION_GROUPS.BASIC_USER,
        ...PERMISSION_GROUPS.STUDENT,
    ],
    [ROLES.ACADEMIC_STAFF]: [
        ...PERMISSION_GROUPS.BASIC_USER,
        ...PERMISSION_GROUPS.STAFF,
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
```

---

## Using Permissions in Components

### Method 1: usePermission Hook

The primary hook for checking permissions in components.

```typescript
// hooks/usePermission.ts
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants';

function MyComponent() {
    const { 
        authorities,           // User's permission array
        hasPermission,         // Check single permission
        hasAnyPermission,      // Check if has ANY permission
        hasAllPermissions      // Check if has ALL permissions
    } = usePermission();

    // Check single permission
    const canCreateEvent = hasPermission(PERMISSIONS.EVENTS_CREATE);

    // Check any permission
    const canManageEvents = hasAnyPermission([
        PERMISSIONS.EVENTS_EDIT,
        PERMISSIONS.EVENTS_DELETE,
        PERMISSIONS.EVENTS_MANAGE
    ]);

    // Check all permissions (returns object with missing permissions)
    const result = hasAllPermissions([
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_WRITE
    ]);
    // result = { hasPermission: boolean, missingPermissions: PermissionType[] }

    return (
        <div>
            {canCreateEvent && <button>Create Event</button>}
            {canManageEvents && <button>Manage Events</button>}
            {!result.hasPermission && (
                <p>Missing: {result.missingPermissions.join(', ')}</p>
            )}
        </div>
    );
}
```

### Method 2: useRole Hook

For role-based checks without specific permissions.

```typescript
// hooks/useRole.ts
import { useRole } from '@/hooks/useRole';

function AdminPanel() {
    const { 
        role,                // Current user role
        isStudent,           // Boolean checks
        isAcademicStaff,
        isNonAcademicStaff,
        isAdmin,
        isSuperAdmin,
        isStaff,             // Academic OR Non-academic
        isAdminOrHigher,     // Admin OR Super Admin
        hasRole,             // Check specific role
        hasAnyRole,          // Check multiple roles
        hasMinimumRole       // Check role hierarchy
    } = useRole();

    // Boolean checks
    if (isStudent) {
        return <StudentDashboard />;
    }

    // Role hierarchy check
    const canAccessAdmin = hasMinimumRole('ROLE_ADMIN');

    // Multiple roles check
    const canAccessStaffArea = hasAnyRole(['ROLE_ACADEMIC_STAFF', 'ROLE_NON_ACADEMIC_STAFF']);

    return <AdminDashboard />;
}
```

### Method 3: ProtectedView Component

Wrapper component for conditional rendering.

```typescript
// components/layout/ProtectedView.tsx
import { ProtectedView, WithPermission, AdminOnly, SuperAdminOnly } from '@/components/layout';
import { PERMISSIONS } from '@/constants';

function Dashboard() {
    return (
        <div>
            {/* Show only if user has ANY of these permissions */}
            <ProtectedView 
                requiredPermissions={[PERMISSIONS.EVENTS_CREATE, PERMISSIONS.EVENTS_EDIT]}
                fallback={<p>No access to events management</p>}
            >
                <EventsManager />
            </ProtectedView>

            {/* Show only if user has ALL permissions */}
            <ProtectedView 
                requiredPermissions={[PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE]}
                requireAll={true}
                fallback={null}
            >
                <UserEditor />
            </ProtectedView>

            {/* Role-based protection */}
            <ProtectedView requiredRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                <AdminPanel />
            </ProtectedView>

            {/* Convenience components */}
            <AdminOnly>
                <AdminFeatures />
            </AdminOnly>

            <SuperAdminOnly>
                <SystemSettings />
            </SuperAdminOnly>

            {/* Single permission check */}
            <WithPermission permission={PERMISSIONS.DASHBOARD_ANALYTICS}>
                <AnalyticsDashboard />
            </WithPermission>
        </div>
    );
}
```

### Method 4: RoleGuard Component

For protecting entire layouts or pages.

```typescript
// components/layout/RoleGuard.tsx
import { RoleGuard, AdminGuard, SuperAdminGuard } from '@/components/layout';

// In a layout file
function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard 
            allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}
            accessDeniedMessage="You need admin privileges to access this area."
        >
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </RoleGuard>
    );
}

// Using pre-configured guards
function SettingsPage() {
    return (
        <SuperAdminGuard fallback={<AccessDenied />}>
            <SystemSettings />
        </SuperAdminGuard>
    );
}
```

---

## Protected Routes & Middleware

### Edge Middleware (middleware.ts)

The middleware runs on every request to protect routes.

```typescript
// middleware.ts
const ROUTE_ROLE_MAP: Record<string, string[]> = {
    '/super-admin': ['ROLE_SUPER_ADMIN'],
    '/admin': ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
    '/student': ['ROLE_STUDENT'],
    '/academic': ['ROLE_ACADEMIC_STAFF'],
    '/non-academic': ['ROLE_NON_ACADEMIC_STAFF'],
};

// Checks:
// 1. Is route public? → Allow
// 2. Is token valid? → No → Redirect to login
// 3. Does user have required role? → No → Redirect to their dashboard
// 4. Allow access
```

### Route Configuration

```typescript
// features/authorization/role.config.ts
export const ROUTE_ACCESS_CONFIG: Record<string, { 
    roles: RoleType[]; 
    permissions?: PermissionType[] 
}> = {
    '/': {
        roles: [ROLES.STUDENT, ROLES.ACADEMIC_STAFF, ROLES.NON_ACADEMIC_STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    },
    '/admin': {
        roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        permissions: [PERMISSIONS.ADMIN_USERS_VIEW],
    },
    '/super-admin': {
        roles: [ROLES.SUPER_ADMIN],
        permissions: [PERMISSIONS.SUPER_ADMIN_SYSTEM],
    },
};
```

---

## API Integration

### Auth Store (store/auth.store.ts)

Central state management for authentication.

```typescript
import { useAuthStore } from '@/store/auth.store';

function MyComponent() {
    const { 
        user,              // Current user object
        isAuthenticated,   // Boolean
        isLoading,         // Loading state
        error,             // Error message
        login,             // Login function
        logout,            // Logout function
        getDefaultRedirect // Get dashboard URL based on role
    } = useAuthStore();

    // Access user permissions
    const permissions = user?.authorities || [];
    const userRole = user?.role;

    // Check permission directly
    const canEdit = permissions.includes('events:edit');
}
```

### API Client with Token

```typescript
// lib/api-client.ts
import Cookies from 'js-cookie';

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = Cookies.get('accessToken');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Token expired or invalid
        // Redirect to login
    }

    if (response.status === 403) {
        // No permission for this resource
        throw new Error('Access denied');
    }

    return response.json();
}
```

---

## Complete Examples

### Example 1: User Management Page

```typescript
// app/(protected)/admin/users/page.tsx
'use client';

import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { ProtectedView } from '@/components/layout';
import { PERMISSIONS } from '@/constants';

export default function UserManagementPage() {
    const { hasPermission, hasAllPermissions } = usePermission();
    const { isSuperAdmin } = useRole();

    // Check view permission
    const canViewUsers = hasPermission(PERMISSIONS.ADMIN_USERS_VIEW);
    const canManageUsers = hasPermission(PERMISSIONS.ADMIN_USERS_MANAGE);
    const canDeleteUsers = hasPermission(PERMISSIONS.USER_DELETE);

    if (!canViewUsers) {
        return <AccessDenied message="You cannot view users" />;
    }

    return (
        <div className="p-6">
            <h1>User Management</h1>

            {/* User list visible to all admins */}
            <UserList />

            {/* Edit buttons only for those with manage permission */}
            <ProtectedView requiredPermissions={[PERMISSIONS.ADMIN_USERS_MANAGE]}>
                <button>Edit Users</button>
            </ProtectedView>

            {/* Delete only for super admins */}
            {canDeleteUsers && (
                <button className="bg-red-500">Delete User</button>
            )}

            {/* Role management only for super admins */}
            {isSuperAdmin && (
                <section>
                    <h2>Role Management</h2>
                    <RoleEditor />
                </section>
            )}
        </div>
    );
}
```

### Example 2: Conditional Navigation

```typescript
// components/layout/Sidebar.tsx
'use client';

import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { PERMISSIONS } from '@/constants';

interface NavItem {
    label: string;
    href: string;
    permission?: string;
    roles?: string[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Events', href: '/events', permission: PERMISSIONS.EVENTS_VIEW },
    { label: 'Users', href: '/admin/users', permission: PERMISSIONS.ADMIN_USERS_VIEW },
    { label: 'System', href: '/super-admin/system', roles: ['ROLE_SUPER_ADMIN'] },
];

export function Sidebar() {
    const { hasPermission } = usePermission();
    const { hasAnyRole } = useRole();

    const visibleItems = navItems.filter(item => {
        // Check permission
        if (item.permission && !hasPermission(item.permission as PermissionType)) {
            return false;
        }
        // Check roles
        if (item.roles && !hasAnyRole(item.roles as RoleType[])) {
            return false;
        }
        return true;
    });

    return (
        <nav>
            {visibleItems.map(item => (
                <Link key={item.href} href={item.href}>
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
```

### Example 3: API Route with Permission Check

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/jwt';
import { PERMISSIONS } from '@/constants';

export async function GET(request: NextRequest) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = decodeToken(token);
    
    if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permission
    const hasViewPermission = payload.authorities?.includes(PERMISSIONS.ADMIN_USERS_VIEW);

    if (!hasViewPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Proceed with fetching users
    const users = await fetchUsers();
    return NextResponse.json(users);
}
```

### Example 4: Form with Permission-Based Fields

```typescript
// components/forms/EventForm.tsx
'use client';

import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants';

export function EventForm({ event }: { event?: Event }) {
    const { hasPermission } = usePermission();

    const canEdit = hasPermission(PERMISSIONS.EVENTS_EDIT);
    const canManage = hasPermission(PERMISSIONS.EVENTS_MANAGE);

    return (
        <form>
            <input 
                name="title" 
                defaultValue={event?.title}
                disabled={!canEdit}
            />

            <input 
                name="description" 
                defaultValue={event?.description}
                disabled={!canEdit}
            />

            {/* Only managers can set featured status */}
            {canManage && (
                <label>
                    <input type="checkbox" name="featured" />
                    Featured Event
                </label>
            )}

            {/* Only managers can set visibility */}
            {canManage && (
                <select name="visibility">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="internal">Internal Only</option>
                </select>
            )}

            <button type="submit" disabled={!canEdit}>
                {event ? 'Update' : 'Create'} Event
            </button>
        </form>
    );
}
```

### Example 5: Data Fetching with Permission Context

```typescript
// hooks/useUsers.ts
'use client';

import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants';
import { apiClient } from '@/lib/api-client';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { hasPermission } = usePermission();

    const canView = hasPermission(PERMISSIONS.ADMIN_USERS_VIEW);
    const canManage = hasPermission(PERMISSIONS.ADMIN_USERS_MANAGE);

    useEffect(() => {
        if (!canView) {
            setError('You do not have permission to view users');
            setLoading(false);
            return;
        }

        async function fetchUsers() {
            try {
                const data = await apiClient.get('/api/v1/users');
                setUsers(data);
            } catch (err) {
                if (err.status === 403) {
                    setError('Access denied');
                } else {
                    setError('Failed to load users');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [canView]);

    return {
        users,
        loading,
        error,
        canView,
        canManage,
    };
}
```

---

## Permission Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Authentication Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User Login                                                           │
│     └──▶ POST /api/v1/auth/login                                        │
│          └──▶ Backend validates credentials                              │
│               └──▶ Backend creates JWT with role + authorities          │
│                    └──▶ Frontend stores token in cookie                 │
│                                                                          │
│  2. Token Decoding                                                       │
│     └──▶ decodeToken(accessToken)                                       │
│          └──▶ Extract: sub, email, role, authorities                    │
│               └──▶ Store in Auth Store (Zustand)                        │
│                                                                          │
│  3. Permission Check Flow                                                │
│     └──▶ usePermission() hook                                           │
│          └──▶ Read authorities from store                               │
│               └──▶ hasPermission('events:create')                       │
│                    └──▶ Check authorities.includes('events:create')     │
│                         └──▶ OR roleHasPermission(role, permission)     │
│                                                                          │
│  4. Component Rendering                                                  │
│     └──▶ ProtectedView checks permission                                │
│          └──▶ Has permission? → Render children                         │
│          └──▶ No permission? → Render fallback/null                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Always Check Permissions Client-Side AND Server-Side

```typescript
// Client-side (for UI)
const canDelete = hasPermission(PERMISSIONS.USER_DELETE);
{canDelete && <DeleteButton />}

// Server-side (API must also validate)
// Backend should check JWT authorities before processing request
```

### 2. Use Type-Safe Permission Constants

```typescript
// ❌ Bad - String literals are error-prone
hasPermission('events:create');

// ✅ Good - Use constants
import { PERMISSIONS } from '@/constants';
hasPermission(PERMISSIONS.EVENTS_CREATE);
```

### 3. Prefer Specific Permissions Over Roles

```typescript
// ❌ Less flexible - Role-based
if (isAdmin) {
    showDeleteButton();
}

// ✅ More flexible - Permission-based
if (hasPermission(PERMISSIONS.USER_DELETE)) {
    showDeleteButton();
}
```

### 4. Handle Loading States

```typescript
function AdminPage() {
    const { isLoading, user } = useAuthStore();
    const { hasPermission } = usePermission();

    if (isLoading) {
        return <Loader />;
    }

    if (!user) {
        return <Redirect to="/login" />;
    }

    if (!hasPermission(PERMISSIONS.ADMIN_USERS_VIEW)) {
        return <AccessDenied />;
    }

    return <AdminContent />;
}
```

### 5. Create Custom Permission Hooks for Complex Checks

```typescript
// hooks/useEventPermissions.ts
export function useEventPermissions() {
    const { hasPermission } = usePermission();

    return {
        canView: hasPermission(PERMISSIONS.EVENTS_VIEW),
        canCreate: hasPermission(PERMISSIONS.EVENTS_CREATE),
        canEdit: hasPermission(PERMISSIONS.EVENTS_EDIT),
        canDelete: hasPermission(PERMISSIONS.EVENTS_DELETE),
        canManage: hasPermission(PERMISSIONS.EVENTS_MANAGE),
    };
}

// Usage
function EventsPage() {
    const { canView, canCreate, canManage } = useEventPermissions();
    // ...
}
```

### 6. Graceful Degradation

```typescript
function Dashboard() {
    const { hasPermission } = usePermission();

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Always visible */}
            <ProfileWidget />
            
            {/* Optional based on permissions */}
            {hasPermission(PERMISSIONS.DASHBOARD_ANALYTICS) && (
                <AnalyticsWidget />
            )}
            
            {/* Fallback content */}
            <ProtectedView 
                requiredPermissions={[PERMISSIONS.EVENTS_VIEW]}
                fallback={<BasicEventsWidget />}
            >
                <FullEventsWidget />
            </ProtectedView>
        </div>
    );
}
```

---

## Quick Reference

| Hook/Component | Purpose | Example |
|---------------|---------|---------|
| `usePermission()` | Check specific permissions | `hasPermission(PERMISSIONS.EVENTS_CREATE)` |
| `useRole()` | Check user roles | `isAdmin`, `hasMinimumRole('ROLE_ADMIN')` |
| `ProtectedView` | Conditional rendering | `<ProtectedView requiredPermissions={[...]}>` |
| `RoleGuard` | Protect layouts/pages | `<RoleGuard allowedRoles={['ROLE_ADMIN']}>` |
| `WithPermission` | Single permission check | `<WithPermission permission="events:create">` |
| `AdminOnly` | Admin + Super Admin | `<AdminOnly><Content /></AdminOnly>` |
| `SuperAdminOnly` | Super Admin only | `<SuperAdminOnly><Content /></SuperAdminOnly>` |

---

## File Structure Reference

```
├── constants/
│   ├── permissions.ts    # PERMISSIONS constant + PERMISSION_GROUPS
│   └── roles.ts          # ROLES constant + ROLE_HIERARCHY
│
├── features/authorization/
│   ├── authorization.types.ts  # Types for permission system
│   ├── permission.guard.ts     # hasPermission, hasAnyPermission functions
│   └── role.config.ts          # ROLE_PERMISSIONS mapping
│
├── hooks/
│   ├── usePermission.ts  # Permission checking hook
│   └── useRole.ts        # Role checking hook
│
├── components/layout/
│   ├── ProtectedView.tsx # Conditional render component
│   └── RoleGuard.tsx     # Role-based guard component
│
├── lib/
│   ├── jwt.ts            # Token decoding utilities
│   └── permissions.ts    # Permission helper exports
│
├── store/
│   └── auth.store.ts     # Zustand auth state (user, authorities)
│
└── middleware.ts         # Edge middleware for route protection
```

---

## Troubleshooting

### Token Not Being Read

```typescript
// Check if token exists
import Cookies from 'js-cookie';
const token = Cookies.get('accessToken');
console.log('Token:', token);
```

### Permissions Not Working

```typescript
// Debug permissions
const { authorities } = usePermission();
console.log('User authorities:', authorities);
console.log('Has permission:', authorities.includes('events:create'));
```

### Role Not Recognized

```typescript
// Check role format
const { role } = useRole();
console.log('User role:', role);
// Should be: "ROLE_STUDENT", "ROLE_ADMIN", etc.
```

---

## Summary

1. **JWT tokens** contain `role` and `authorities` from the backend
2. Use **`usePermission()`** hook for permission checks
3. Use **`useRole()`** hook for role-based logic
4. Wrap content with **`ProtectedView`** or **`RoleGuard`** components
5. Always validate permissions **both client-side and server-side**
6. Use **`PERMISSIONS`** and **`ROLES`** constants for type safety


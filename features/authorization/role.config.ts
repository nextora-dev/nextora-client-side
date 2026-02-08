// Role Configuration - Maps roles to their permissions
import { ROLES, RoleType } from '../../constants/roles';
import { PERMISSIONS, PERMISSION_GROUPS, PermissionType } from '../../constants/permissions';

// Role to permissions mapping
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

// Check if a role has a specific permission
export function roleHasPermission(role: RoleType, permission: PermissionType): boolean {
    const permissions = getPermissionsForRole(role);
    return permissions.includes(permission);
}

// Get roles that have a specific permission
export function getRolesWithPermission(permission: PermissionType): RoleType[] {
    return Object.entries(ROLE_PERMISSIONS)
        .filter(([, permissions]) => permissions.includes(permission))
        .map(([role]) => role as RoleType);
}

// Route access configuration
export const ROUTE_ACCESS_CONFIG: Record<string, { roles: RoleType[]; permissions?: PermissionType[] }> = {
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

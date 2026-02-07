// Permission helpers for use in components
import { PermissionType } from '@/constants';
import { hasPermission, hasAnyPermission, hasAllPermissions, canAccessRoute } from '../features/authorization/permission.guard';

export { hasPermission, hasAnyPermission, hasAllPermissions, canAccessRoute };

// Helper to check permissions from token authorities
export function checkPermission(
    authorities: PermissionType[],
    permission: PermissionType
): boolean {
    return authorities.includes(permission);
}

// Helper to check multiple permissions
export function checkPermissions(
    authorities: PermissionType[],
    permissions: PermissionType[],
    requireAll: boolean = false
): boolean {
    if (requireAll) {
        return permissions.every(p => authorities.includes(p));
    }
    return permissions.some(p => authorities.includes(p));
}

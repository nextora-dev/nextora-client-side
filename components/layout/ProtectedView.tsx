// ProtectedView - Permission-based wrapper component
'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks';
import { useRole } from '@/hooks';
import { RoleType } from '@/constants';
import { PermissionType } from '@/constants';

interface ProtectedViewProps {
    children: ReactNode;
    requiredPermissions?: PermissionType[];
    requiredRoles?: RoleType[];
    requireAll?: boolean;
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
    if (requiredRoles && requiredRoles.length > 0) {
        if (!hasAnyRole(requiredRoles)) {
            return <>{fallback}</>;
        }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
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

// Convenience components for common use cases
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
    fallback
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

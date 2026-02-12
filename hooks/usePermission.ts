// usePermission Hook - Permission-based utilities
'use client';

import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/store';
import { selectUser } from '@/features/auth/authSlice';
import { PermissionType } from '@/constants';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/features';

export function usePermission() {
    const user = useAppSelector(selectUser);

    const authorities = useMemo(() => user?.authorities || [], [user]);
    const role = useMemo(() => user?.role || null, [user]);

    const checkPermission = useCallback((permission: PermissionType): boolean => {
        if (!role) return false;
        return hasPermission(role, authorities, permission);
    }, [role, authorities]);

    const checkAnyPermission = useCallback((permissions: PermissionType[]): boolean => {
        if (!role) return false;
        return hasAnyPermission(role, authorities, permissions);
    }, [role, authorities]);

    const checkAllPermissions = useCallback((permissions: PermissionType[]): { hasPermission: boolean; missingPermissions: PermissionType[] } => {
        if (!role) return { hasPermission: false, missingPermissions: permissions };
        return hasAllPermissions(role, authorities, permissions);
    }, [role, authorities]);

    return {
        authorities,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
    };
}

// useRole Hook - Role-based utilities
'use client';

import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/store';
import { selectUser } from '@/features/auth/authSlice';
import { RoleType, ROLES, ROLE_HIERARCHY } from '@/constants';

export function useRole() {
    const user = useAppSelector(selectUser);

    const role = useMemo(() => user?.role || null, [user]);

    const isStudent = useMemo(() => role === ROLES.STUDENT, [role]);
    const isAcademicStaff = useMemo(() => role === ROLES.ACADEMIC_STAFF, [role]);
    const isNonAcademicStaff = useMemo(() => role === ROLES.NON_ACADEMIC_STAFF, [role]);
    const isAdmin = useMemo(() => role === ROLES.ADMIN, [role]);
    const isSuperAdmin = useMemo(() => role === ROLES.SUPER_ADMIN, [role]);

    const isStaff = useMemo(() =>
        isAcademicStaff || isNonAcademicStaff,
        [isAcademicStaff, isNonAcademicStaff]
    );

    const isAdminOrHigher = useMemo(() => isAdmin || isSuperAdmin, [isAdmin, isSuperAdmin]);

    const hasRole = useCallback((checkRole: RoleType): boolean => role === checkRole, [role]);

    const hasAnyRole = useCallback((roles: RoleType[]): boolean => {
        if (!role) return false;
        return roles.includes(role);
    }, [role]);

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

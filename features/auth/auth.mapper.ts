// Auth Mapper - Transform API responses to app types
import { mapLegacyRole, RoleType } from '@/constants';
import { PermissionType } from '@/constants';
import { AuthUser } from '@/features';

export interface ApiUserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    authorities?: string[];
}

export function mapApiUserToAuthUser(apiUser: ApiUserResponse): AuthUser {
    return {
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        role: mapLegacyRole(apiUser.role),
        authorities: (apiUser.authorities || []) as PermissionType[],
    };
}

export function mapRoleToApiRole(role: RoleType): string {
    const roleMap: Record<RoleType, string> = {
        'ROLE_STUDENT': 'student',
        'ROLE_ACADEMIC_STAFF': 'academic-staff',
        'ROLE_NON_ACADEMIC_STAFF': 'non-academic-staff',
        'ROLE_ADMIN': 'admin',
        'ROLE_SUPER_ADMIN': 'super-admin',
    };
    return roleMap[role] || 'student';
}

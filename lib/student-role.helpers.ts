/**
 * @fileoverview Student Role Helper Utilities
 * @description Helper functions to check student sub-roles and permissions
 */

import { STUDENT_SUB_ROLES } from '@/constants/roles';
import type { StudentRoleSpecificData } from '@/types/user';

/**
 * Check if a student is a club member based on their role-specific data
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns true if student has CLUB_MEMBER role
 */
export function isClubMemberByRole(roleSpecificData: StudentRoleSpecificData | null | undefined): boolean {
    if (!roleSpecificData) return false;
    
    const studentRoleTypes = roleSpecificData.studentRoleTypes || [];
    return studentRoleTypes.includes(STUDENT_SUB_ROLES.CLUB_MEMBER);
}

/**
 * Check if a student is a batch rep based on their role-specific data
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns true if student has BATCH_REP role
 */
export function isBatchRepByRole(roleSpecificData: StudentRoleSpecificData | null | undefined): boolean {
    if (!roleSpecificData) return false;
    
    const studentRoleTypes = roleSpecificData.studentRoleTypes || [];
    return studentRoleTypes.includes(STUDENT_SUB_ROLES.BATCH_REP);
}

/**
 * Check if a student is a kuppi tutor/senior based on their role-specific data
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns true if student has KUPPI_STUDENT role
 */
export function isKuppiStudentByRole(roleSpecificData: StudentRoleSpecificData | null | undefined): boolean {
    if (!roleSpecificData) return false;
    
    const studentRoleTypes = roleSpecificData.studentRoleTypes || [];
    return studentRoleTypes.includes(STUDENT_SUB_ROLES.KUPPI_STUDENT);
}

/**
 * Check if a student is a normal student (has no special roles)
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns true if student only has NORMAL role or no special roles
 */
export function isNormalStudentByRole(roleSpecificData: StudentRoleSpecificData | null | undefined): boolean {
    if (!roleSpecificData) return true;
    
    const studentRoleTypes = roleSpecificData.studentRoleTypes || [];
    return studentRoleTypes.length === 0 || (studentRoleTypes.length === 1 && studentRoleTypes.includes(STUDENT_SUB_ROLES.NORMAL));
}

/**
 * Check if a student has access to elections (must be a club member)
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns true if student can access elections
 */
export function canAccessElections(roleSpecificData: StudentRoleSpecificData | null | undefined): boolean {
    return isClubMemberByRole(roleSpecificData);
}

/**
 * Get the primary student role display
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns The display name or primary role type
 */
export function getStudentRoleDisplay(roleSpecificData: StudentRoleSpecificData | null | undefined): string {
    if (!roleSpecificData) return 'Student';
    
    return roleSpecificData.studentRoleDisplayName || 'Student';
}

/**
 * Check if a student has a specific sub-role
 * @param roleSpecificData - Student role-specific data from user profile
 * @param roleToCheck - The sub-role to check
 * @returns true if student has the specified role
 */
export function hasStudentSubRole(
    roleSpecificData: StudentRoleSpecificData | null | undefined,
    roleToCheck: typeof STUDENT_SUB_ROLES[keyof typeof STUDENT_SUB_ROLES]
): boolean {
    if (!roleSpecificData) return false;
    
    const studentRoleTypes = roleSpecificData.studentRoleTypes || [];
    return studentRoleTypes.includes(roleToCheck);
}

/**
 * Get all student sub-roles for a user
 * @param roleSpecificData - Student role-specific data from user profile
 * @returns Array of student sub-roles
 */
export function getStudentSubRoles(roleSpecificData: StudentRoleSpecificData | null | undefined): string[] {
    if (!roleSpecificData) return [];
    
    return roleSpecificData.studentRoleTypes || [];
}


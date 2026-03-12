/**
 * @fileoverview Club Module Permission Helpers
 * @description Feature flags for role-based access in the Club module
 */

import { RoleType, ROLES } from '@/constants/roles';

const MANAGEMENT_ROLES: RoleType[] = [
    ROLES.NON_ACADEMIC_STAFF,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
];

export const CLUB_FEATURES = {
    /** Can view/browse clubs */
    canViewClubs: (role: RoleType): boolean =>
        ([ROLES.STUDENT, ROLES.NON_ACADEMIC_STAFF, ROLES.ACADEMIC_STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN] as RoleType[]).includes(role),

    /** Can join a club (students only) */
    canJoinClub: (role: RoleType): boolean =>
        role === ROLES.STUDENT,

    /** Can create a new club */
    canCreateClub: (role: RoleType): boolean =>
        MANAGEMENT_ROLES.includes(role),

    /** Can update a club (management roles OR club officers) */
    canUpdateClub: (role: RoleType, isOfficer = false): boolean =>
        MANAGEMENT_ROLES.includes(role) || isOfficer,

    /** Can delete a club */
    canDeleteClub: (role: RoleType): boolean =>
        MANAGEMENT_ROLES.includes(role),

    /** Can manage members (approve/reject/suspend) */
    canManageMembers: (role: RoleType, isOfficer = false): boolean =>
        MANAGEMENT_ROLES.includes(role) || isOfficer,

    /** Can create announcements */
    canCreateAnnouncement: (role: RoleType, isClubMember = false): boolean =>
        MANAGEMENT_ROLES.includes(role) || isClubMember,

    /** Can view announcements */
    canViewAnnouncements: (role: RoleType): boolean =>
        ([ROLES.STUDENT, ROLES.NON_ACADEMIC_STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN] as RoleType[]).includes(role),

    /** Can manage elections */
    canManageElections: (role: RoleType): boolean =>
        MANAGEMENT_ROLES.includes(role),

    /** Can vote in elections */
    canVote: (role: RoleType): boolean =>
        role === ROLES.STUDENT,

    /** Can self-nominate (club members who are students) */
    canNominate: (role: RoleType, isClubMember = false): boolean =>
        role === ROLES.STUDENT && isClubMember,

    /** Can view statistics */
    canViewStats: (role: RoleType, isOfficer = false): boolean =>
        MANAGEMENT_ROLES.includes(role) || isOfficer,

    /** Can view activity logs */
    canViewActivityLogs: (role: RoleType, isOfficer = false): boolean =>
        MANAGEMENT_ROLES.includes(role) || isOfficer,

    /** Can bulk approve */
    canBulkApprove: (role: RoleType): boolean =>
        MANAGEMENT_ROLES.includes(role),

    /** Can change member positions */
    canChangePosition: (role: RoleType): boolean =>
        MANAGEMENT_ROLES.includes(role),
};

/** Officer positions that grant elevated permissions */
export const OFFICER_POSITIONS = [
    'PRESIDENT',
    'VICE_PRESIDENT',
    'SECRETARY',
    'TREASURER',
    'TOP_BOARD_MEMBER',
    'COMMITTEE_MEMBER',
] as const;

/** Check if a position is an officer position */
export function isOfficerPosition(position: string): boolean {
    return (OFFICER_POSITIONS as readonly string[]).includes(position);
}




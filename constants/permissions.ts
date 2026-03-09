// Fine-grained Permission Constants for RBAC
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

    // Club permissions
    CLUB_READ: 'club:read',
    CLUB_CREATE: 'club:create',
    CLUB_UPDATE: 'club:update',
    CLUB_DELETE: 'club:delete',
    CLUB_VIEW_STATS: 'club:view_stats',
    CLUB_VIEW_ACTIVITY_LOG: 'club:view_activity_log',
    CLUB_MANAGE_MEMBERS: 'club:manage_members',
    CLUB_MEMBERSHIP_VIEW: 'club_membership:view',
    CLUB_MEMBERSHIP_MANAGE: 'club_membership:manage',
    CLUB_ANNOUNCEMENT_CREATE: 'club_announcement:create',
    CLUB_ANNOUNCEMENT_READ: 'club_announcement:read',
    CLUB_ANNOUNCEMENT_UPDATE: 'club_announcement:update',
    CLUB_ANNOUNCEMENT_DELETE: 'club_announcement:delete',
    CLUB_ELECTION_READ: 'club_election:read',

    // Super Admin permissions
    SUPER_ADMIN_SYSTEM: 'superadmin:system',
    SUPER_ADMIN_AUDIT: 'superadmin:audit',
    SUPER_ADMIN_CONFIG: 'superadmin:config',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Permission groups for easy assignment
export const PERMISSION_GROUPS = {
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
    STUDENT: [
        PERMISSIONS.KUPPI_CREATE,
        PERMISSIONS.INTERNSHIPS_APPLY,
        PERMISSIONS.MEETINGS_BOOK,
        PERMISSIONS.LOST_FOUND_CLAIM,
    ],
    STAFF: [
        PERMISSIONS.EVENTS_CREATE,
        PERMISSIONS.EVENTS_EDIT,
        PERMISSIONS.ACADEMIC_RESULTS,
        PERMISSIONS.MEETINGS_MANAGE,
    ],
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
    SUPER_ADMIN: [
        PERMISSIONS.USER_DELETE,
        PERMISSIONS.ADMIN_ROLES_MANAGE,
        PERMISSIONS.ADMIN_SETTINGS,
        PERMISSIONS.SUPER_ADMIN_SYSTEM,
        PERMISSIONS.SUPER_ADMIN_AUDIT,
        PERMISSIONS.SUPER_ADMIN_CONFIG,
    ],
} as const;

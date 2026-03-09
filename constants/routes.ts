// Route Constants
export const ROUTES = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',

    // Student routes
    STUDENT: {
        DASHBOARD: '/student',
        PROFILE: '/student/profile',
        EVENTS: '/student/events',
        KUPPI: '/student/kuppi',
        CLUBS: '/student/clubs',
        VOTING: '/student/voting',
        LOST_FOUND: '/student/lost-found',
        CALENDAR: '/student/calendar',
        BOARDING: '/student/boarding',
        INTERNSHIPS: '/student/internships',
        MAPS: '/student/maps',
        MEETINGS: '/student/meetings',
        SRU: '/student/sru',
    },

    // Academic Staff routes
    ACADEMIC: {
        DASHBOARD: '/academic',
        PROFILE: '/academic/profile',
        COURSES: '/academic/courses',
        STUDENTS: '/academic/students',
        ATTENDANCE: '/academic/attendance',
        GRADES: '/academic/grades',
        KUPPI: '/academic/kuppi',
        CLUBS: '/academic/clubs',
        MEETINGS: '/academic/meetings',
        CALENDAR: '/academic/calendar',
        RESOURCES: '/academic/resources',
        MAPS: '/academic/maps',
    },

    // Non-Academic Staff routes
    NON_ACADEMIC: {
        DASHBOARD: '/non-academic',
        PROFILE: '/non-academic/profile',
        TASKS: '/non-academic/tasks',
        INVENTORY: '/non-academic/inventory',
        MAINTENANCE: '/non-academic/maintenance',
        REQUESTS: '/non-academic/requests',
        FACILITIES: '/non-academic/facilities',
        EVENTS: '/non-academic/events',
        CLUBS: '/non-academic/clubs',
        CALENDAR: '/non-academic/calendar',
        MAPS: '/non-academic/maps',
    },

    // Admin routes
    ADMIN: {
        DASHBOARD: '/admin',
        USERS: '/admin/users',
        ROLES: '/admin/roles',
        EVENTS: '/admin/events',
        COURSES: '/admin/courses',
        CLUBS: '/admin/clubs',
        REPORTS: '/admin/reports',
        APPROVALS: '/admin/approvals',
        SETTINGS: '/admin/settings',
    },

    // Super Admin routes
    SUPER_ADMIN: {
        DASHBOARD: '/super-admin',
        ADMINS: '/super-admin/admins',
        USERS: '/super-admin/users',
        USER_MANAGEMENT: '/super-admin/user-management',
        CLUBS: '/super-admin/clubs',
        SYSTEM: '/super-admin/system',
        SECURITY: '/super-admin/security',
        AUDIT: '/super-admin/audit',
        SETTINGS: '/super-admin/settings',
    },

    // API routes
    API: {
        AUTH: '/api/auth',
        HEALTH: '/api/health',
    },
} as const;

// Route groups for middleware
export const PUBLIC_ROUTES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
];

export const PROTECTED_ROUTES_PREFIX = [
    '/student',
    '/academic',
    '/non-academic',
    '/admin',
    '/super-admin',
];

// Default redirect after login based on role
export const DEFAULT_REDIRECT_BY_ROLE: Record<string, string> = {
    'ROLE_STUDENT': ROUTES.STUDENT.DASHBOARD,
    'ROLE_ACADEMIC_STAFF': ROUTES.ACADEMIC.DASHBOARD,
    'ROLE_NON_ACADEMIC_STAFF': ROUTES.NON_ACADEMIC.DASHBOARD,
    'ROLE_ADMIN': ROUTES.ADMIN.DASHBOARD,
    'ROLE_SUPER_ADMIN': ROUTES.SUPER_ADMIN.DASHBOARD,
};

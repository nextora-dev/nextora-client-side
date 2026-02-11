// Role Constants for RBAC
export const ROLES = {
    STUDENT: 'ROLE_STUDENT',
    ACADEMIC_STAFF: 'ROLE_ACADEMIC_STAFF',
    NON_ACADEMIC_STAFF: 'ROLE_NON_ACADEMIC_STAFF',
    ADMIN: 'ROLE_ADMIN',
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const STUDENT_SUB_ROLES = {
    NORMAL : 'NORMAL',
    CLUB_MEMBER : 'CLUB_MEMBER',
    BATCH_REP: 'BATCH_REP',
    KUPPI_STUDENT : 'KUPPI_STUDENT'
} as const;

export type STUDENT_SUB_ROLES = typeof STUDENT_SUB_ROLES[keyof typeof STUDENT_SUB_ROLES];

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY: Record<RoleType, number> = {
    [ROLES.STUDENT]: 1,
    [ROLES.ACADEMIC_STAFF]: 2,
    [ROLES.NON_ACADEMIC_STAFF]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.SUPER_ADMIN]: 4,
};

// User-friendly role labels
export const ROLE_LABELS: Record<RoleType, string> = {
    [ROLES.STUDENT]: 'Student',
    [ROLES.ACADEMIC_STAFF]: 'Academic Staff',
    [ROLES.NON_ACADEMIC_STAFF]: 'Non-Academic Staff',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.SUPER_ADMIN]: 'Super Administrator',
};

// Role options for UI components
export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value: value as RoleType,
    label,
}));

// Map legacy role strings to new role constants
export const mapLegacyRole = (role: string): RoleType => {
    if (!role) return ROLES.STUDENT;

    // If already a valid role, return it
    if (Object.values(ROLES).includes(role as RoleType)) {
        return role as RoleType;
    }

    // Normalize common role formats: "ROLE_STUDENT", "student", "academic-staff"
    const normalized = role
        .toString()
        .replace(/^ROLE[_-]?/i, '') // strip ROLE_ or ROLE- prefix
        .replace(/[_-]/g, ' ') // replace separators with spaces
        .trim()
        .toLowerCase();

    const roleMap: Record<string, RoleType> = {
        'student': ROLES.STUDENT,
        'lecturer': ROLES.ACADEMIC_STAFF, // Map lecturer to academic staff
        'academic staff': ROLES.ACADEMIC_STAFF,
        'academicstaff': ROLES.ACADEMIC_STAFF,
        'non academic staff': ROLES.NON_ACADEMIC_STAFF,
        'nonacademicstaff': ROLES.NON_ACADEMIC_STAFF,
        'admin': ROLES.ADMIN,
        'administrator': ROLES.ADMIN,
        'super admin': ROLES.SUPER_ADMIN,
        'superadmin': ROLES.SUPER_ADMIN,
    };

    return roleMap[normalized] || ROLES.STUDENT;
};

// Faculty enum values (matches backend)
export const FACULTY = {
    COMPUTING: 'COMPUTING',
    BUSINESS: 'BUSINESS'
} as const;

// Faculty display labels
export const FACULTY_LABELS: Record<string, string> = {
    COMPUTING: 'Computing',
    BUSINESS: 'Business'
};

export type FacultyType = typeof FACULTY[keyof typeof FACULTY];

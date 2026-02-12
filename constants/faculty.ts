export const FACULTY = {
    COMPUTING : 'Computing',
    BUSINESS : 'Business'
} as const;

export type FacultyType = typeof FACULTY[keyof typeof FACULTY];

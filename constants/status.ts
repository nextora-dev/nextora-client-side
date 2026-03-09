// Status enum values (matches backend)
export const STATUS = {
    ACTIVE: 'ACTIVE',
    DEACTIVATE: 'DEACTIVATE',
    SUSPENDED: 'SUSPENDED',
    DELETED: 'DELETED',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED'
} as const;

// Status display labels
export const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Active',
    DEACTIVATE: 'Deactivated',
    SUSPENDED: 'Suspended',
    DELETED: 'Deleted',
    PENDING_VERIFICATION: 'Pending Verification',
    PASSWORD_CHANGE_REQUIRED: 'Password Change Required'
};

export type StatusType = typeof STATUS[keyof typeof STATUS];
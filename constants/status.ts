export const STATUS = {
    ACTIVE : 'ACTIVE',
    Deactivate : 'Deactivate',
    SUSPENDED :'SUSPENDED',
    DELETED : 'DELETED',
    PENDING_VERIFICATION : 'PENDING_VERIFICATION',
    PASSWORD_CHANGE_REQUIRED : 'PASSWORD_CHANGE_REQUIRED'
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];
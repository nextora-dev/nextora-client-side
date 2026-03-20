/**
 * @fileoverview Meeting Module Types
 * @description Type definitions for meetings, feedback, statistics, and admin operations
 */

// ============================================================================
// Enums / Literals
// ============================================================================

export type MeetingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW';
export type MeetingType = 'PROJECT_DISCUSSION' | 'ACADEMIC_GUIDANCE' | 'CAREER_GUIDANCE' | 'GRADE_REVIEW' | 'RESEARCH' | 'OTHER';

// ============================================================================
// Meeting Types
// ============================================================================

export interface MeetingResponse {
    id: number;
    studentId: number;
    studentName: string;
    studentEmail: string;
    lecturerId: number;
    lecturerName: string;
    lecturerEmail: string;
    lecturerProfileImage: string | null;
    subject: string;
    description: string | null;
    meetingType: MeetingType;
    status: MeetingStatus;
    priority: number;
    preferredDateTime: string;
    preferredDurationMinutes: number;
    scheduledStartTime: string | null;
    scheduledEndTime: string | null;
    actualStartTime: string | null;
    actualEndTime: string | null;
    isOnline: boolean;
    location: string | null;
    meetingLink: string | null;
    meetingPlatform: string | null;
    responseMessage: string | null;
    cancellationReason: string | null;
    rejectionReason: string | null;
    notes: string | null;
    followUpRequired: boolean;
    followUpNotes: string | null;
    rating: number | null;
    feedback: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateMeetingRequest {
    lecturerId: number;
    subject: string;
    meetingType: MeetingType;
    description?: string;
    preferredDateTime: string;
    preferredDurationMinutes: number;
    priority?: number;
}

export interface AcceptMeetingRequest {
    scheduledStartTime: string;
    scheduledEndTime: string;
    isOnline: boolean;
    location?: string;
    meetingLink?: string;
    meetingPlatform?: string;
    responseMessage?: string;
}

export interface RejectMeetingRequest {
    reason: string;
}

export interface RescheduleMeetingRequest {
    scheduledStartTime: string;
    scheduledEndTime: string;
    isOnline: boolean;
    location?: string;
    meetingLink?: string;
    meetingPlatform?: string;
    reason?: string;
}

export interface SubmitFeedbackRequest {
    rating: number;
    feedback: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface MeetingStatistics {
    totalMeetings: number;
    pendingMeetings: number;
    acceptedMeetings: number;
    completedMeetings: number;
    cancelledMeetings: number;
    rejectedMeetings: number;
    inProgressMeetings: number;
    averageRating: number;
    totalFeedbacks: number;
}

export interface LecturerStatistics extends MeetingStatistics {
    lecturerId: number;
    lecturerName: string;
}

// ============================================================================
// Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PagedData<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ============================================================================
// Param Types
// ============================================================================

export interface MeetingPaginationParams {
    page?: number;
    size?: number;
}

export interface MeetingSearchParams extends MeetingPaginationParams {
    keyword?: string;
}

export interface CalendarParams {
    startDate: string;
    endDate: string;
}

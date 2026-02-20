/**
 * @fileoverview Kuppi Module Types
 * @description Type definitions for Kuppi sessions, notes, and applications
 */

// ============================================================================
// Enums
// ============================================================================

export type SessionType = 'LIVE' | 'RECORDED';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// ============================================================================
// Session Types
// ============================================================================

export interface KuppiSessionResponse {
    id: number;
    title: string;
    description: string | null;
    subject: string;
    sessionType: SessionType;
    status: SessionStatus;
    scheduledStartTime: string;
    scheduledEndTime: string;
    liveLink: string;
    meetingPlatform: string | null;
    viewCount: number;
    hostId: number;
    hostName: string;
    hostEmail: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    canJoin: boolean;
    notes: KuppiNoteResponse[];
}

export interface CreateKuppiSessionRequest {
    title: string;
    description?: string;
    subject: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    liveLink: string;
    meetingPlatform?: string;
}

export interface UpdateKuppiSessionRequest {
    title?: string;
    description?: string;
    subject?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    liveLink?: string;
    meetingPlatform?: string;
}

export interface KuppiSessionsResponse {
    success: boolean;
    message: string;
    data: {
        content: KuppiSessionResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
    timestamp: string;
}

export interface KuppiSessionDetailResponse {
    success: boolean;
    message: string;
    data: KuppiSessionResponse;
    timestamp: string;
}

export interface KuppiAnalyticsResponse {
    success: boolean;
    message: string;
    data: {
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
        totalSessionViews: number;
        totalNotes: number;
        totalNoteViews: number;
        mostViewedSessionId: number | null;
        mostViewedSessionTitle: string | null;
        mostViewedSessionViews: number;
        mostDownloadedNoteId: number | null;
        mostDownloadedNoteTitle: string | null;
        mostDownloadedNoteDownloads: number;
    };
    timestamp: string;
}

// ============================================================================
// Notes Types
// ============================================================================

export interface KuppiNoteResponse {
    id: number;
    title: string;
    description: string | null;
    fileType: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    formattedFileSize: string;
    allowDownload: boolean;
    downloadCount: number;
    viewCount: number;
    sessionId: number | null;
    sessionTitle: string | null;
    uploadedById: number;
    uploaderName: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface CreateKuppiNoteRequest {
    title: string;
    description?: string;
    sessionId?: number;
    allowDownload?: boolean;
    file: File;
}

export interface UpdateKuppiNoteRequest {
    title?: string;
    description?: string;
    allowDownload?: boolean;
    file?: File;
}

export interface KuppiNotesResponse {
    success: boolean;
    message: string;
    data: {
        content: KuppiNoteResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
    timestamp: string;
}

export interface KuppiNoteDetailResponse {
    success: boolean;
    message: string;
    data: KuppiNoteResponse;
    timestamp: string;
}

// ============================================================================
// Application Types
// ============================================================================

export interface KuppiApplicationResponse {
    id: number;
    status: ApplicationStatus;
    statusDisplayName: string;
    studentId: number;
    studentUserId: string;
    studentName: string;
    studentEmail: string;
    studentBatch: string | null;
    studentProgram: string | null;
    studentFaculty: string | null;
    studentProfilePictureUrl: string | null;
    motivation: string;
    relevantExperience: string | null;
    subjectsToTeach: string[];
    preferredExperienceLevel: ExperienceLevel;
    availability: string | null;
    currentGpa: number;
    currentSemester: string;
    reviewedById: number | null;
    reviewedByName: string | null;
    reviewedByEmail: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    rejectionReason: string | null;
    submittedAt: string;
    approvedAt: string | null;
    rejectedAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    canBeApproved: boolean;
    canBeRejected: boolean;
    canBeCancelled: boolean;
    isFinalState: boolean;
}

export interface CreateKuppiApplicationRequest {
    motivation: string;
    relevantExperience?: string;
    subjectsToTeach: string[];
    preferredExperienceLevel: ExperienceLevel;
    availability?: string;
    currentGpa: number;
    currentSemester: string;
}

export interface ReviewKuppiApplicationRequest {
    reviewNotes?: string;
    rejectionReason?: string;
}

export interface KuppiApplicationsResponse {
    success: boolean;
    message: string;
    data: {
        content: KuppiApplicationResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
    timestamp: string;
}

export interface KuppiApplicationDetailResponse {
    success: boolean;
    message: string;
    data: KuppiApplicationResponse;
    timestamp: string;
}

export interface CanApplyResponse {
    success: boolean;
    message: string;
    data: {
        canApply: boolean;
    };
    timestamp: string;
}

export interface IsKuppiStudentResponse {
    success: boolean;
    message: string;
    data: {
        isKuppiStudent: boolean;
    };
    timestamp: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface KuppiApplicationStatsResponse {
    success: boolean;
    message: string;
    data: {
        totalApplications: number;
        pendingApplications: number;
        underReviewApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
        cancelledApplications: number;
        applicationsToday: number;
        totalKuppiStudents: number;
    };
    timestamp: string;
}

export interface KuppiPlatformStatsResponse {
    success: boolean;
    message: string;
    data: {
        totalSessions: number;
        totalNotes: number;
        totalParticipants: number;
        totalKuppiStudents: number;
        completedSessions: number;
        cancelledSessions: number;
        totalViews: number;
        totalDownloads: number;
        averagePlatformRating: number;
        sessionsThisWeek: number;
        sessionsThisMonth: number;
        newKuppiStudentsThisMonth: number;
    };
    timestamp: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface KuppiActionResponse {
    success: boolean;
    message: string;
    data?: unknown;
    timestamp: string;
}

export interface KuppiPaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export interface KuppiSearchParams extends KuppiPaginationParams {
    keyword?: string;
}

export interface KuppiDateRangeParams extends KuppiPaginationParams {
    startDate: string;
    endDate: string;
}

// ============================================================================
// Kuppi Student Types
// ============================================================================

export type Faculty = 'COMPUTING' | 'ENGINEERING' | 'BUSINESS' | 'SCIENCE' | 'HUMANITIES';

export interface SessionSummary {
    id: number;
    title: string;
    subject: string;
    status: SessionStatus;
    scheduledStartTime: string;
    scheduledEndTime: string;
    viewCount: number;
}

export interface KuppiStudentResponse {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    profilePictureUrl: string | null;
    batch: string;
    program: string;
    faculty: Faculty;
    kuppiSubjects: string[];
    kuppiExperienceLevel: ExperienceLevel;
    kuppiSessionsCompleted: number;
    kuppiRating: number;
    kuppiAvailability: string;
    totalSessionsHosted: number;
    totalViews: number;
    upcomingSessions: number;
    isActive: boolean;
}

export interface KuppiStudentDetailResponse {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    profilePictureUrl: string | null;
    batch: string;
    program: string;
    faculty: Faculty;
    kuppiSubjects: string[];
    kuppiExperienceLevel: ExperienceLevel;
    kuppiSessionsCompleted: number;
    kuppiRating: number;
    kuppiAvailability: string;
    totalSessionsHosted: number;
    completedSessions: number;
    liveSessions: number;
    scheduledSessions: number;
    cancelledSessions: number;
    totalViews: number;
    totalNotesUploaded: number;
    recentSessions: SessionSummary[];
    upcomingSessions: SessionSummary[];
    kuppiApprovedAt: string;
    memberSince: string;
    isActive: boolean;
}

export interface KuppiStudentsResponse {
    success: boolean;
    message: string;
    data: {
        content: KuppiStudentResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty?: boolean;
    };
    timestamp: string;
}

export interface KuppiStudentDetailApiResponse {
    success: boolean;
    message: string;
    data: KuppiStudentDetailResponse;
    timestamp: string;
}

export interface KuppiStudentSearchByNameParams extends KuppiPaginationParams {
    name: string;
}

export interface KuppiStudentSearchBySubjectParams extends KuppiPaginationParams {
    subject: string;
}

// ============================================================================
// Review Types
// ============================================================================

export interface KuppiReviewResponse {
    id: number;
    sessionId: number;
    sessionTitle: string;
    reviewerId: number;
    reviewerName: string;
    tutorId: number;
    tutorName: string;
    rating: number;
    comment: string;
    tutorResponse: string | null;
    tutorResponseAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateKuppiReviewRequest {
    sessionId: number;
    rating: number;
    comment: string;
}

export interface UpdateKuppiReviewRequest {
    rating?: number;
    comment?: string;
}

export interface TutorResponseRequest {
    responseText: string;
}

export interface KuppiReviewsResponse {
    success: boolean;
    message: string;
    data: {
        content: KuppiReviewResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty?: boolean;
    };
    timestamp: string;
}

export interface KuppiReviewDetailResponse {
    success: boolean;
    message: string;
    data: KuppiReviewResponse;
    timestamp: string;
}

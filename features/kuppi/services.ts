/**
 * @fileoverview Kuppi Module Services
 * @description API services for Kuppi sessions, notes, and applications
 */

import apiClient from '@/lib/api-client';
import {
    // Session Types
    KuppiSessionsResponse,
    KuppiSessionDetailResponse,
    KuppiAnalyticsResponse,
    CreateKuppiSessionRequest,
    UpdateKuppiSessionRequest,
    // Note Types
    KuppiNotesResponse,
    KuppiNoteDetailResponse,
    CreateKuppiNoteRequest,
    UpdateKuppiNoteRequest,
    // Application Types
    KuppiApplicationsResponse,
    KuppiApplicationDetailResponse,
    CreateKuppiApplicationRequest,
    ReviewKuppiApplicationRequest,
    CanApplyResponse,
    IsKuppiStudentResponse,
    // Stats Types
    KuppiApplicationStatsResponse,
    KuppiPlatformStatsResponse,
    // Kuppi Student Types
    KuppiStudentsResponse,
    KuppiStudentDetailApiResponse,
    KuppiStudentSearchByNameParams,
    KuppiStudentSearchBySubjectParams,
    // Review Types
    KuppiReviewsResponse,
    KuppiReviewDetailResponse,
    CreateKuppiReviewRequest,
    UpdateKuppiReviewRequest,
    TutorResponseRequest,
    // Common Types
    KuppiActionResponse,
    KuppiPaginationParams,
    KuppiSearchParams,
    KuppiDateRangeParams,
    ApplicationStatus,
} from './types';
import {AllUsersResponse, SUPER_ADMIN_ENDPOINTS} from "@/features";

// ============================================================================
// Endpoints
// ============================================================================

export const KUPPI_ENDPOINTS = {
    // Session Endpoints
    SESSIONS: '/kuppi/sessions',
    SESSION_BY_ID: (id: number) => `/kuppi/sessions/${id}`,
    SESSIONS_SEARCH: '/kuppi/sessions/search',
    SESSIONS_SEARCH_SUBJECT: '/kuppi/sessions/search/subject',
    SESSIONS_SEARCH_HOST: '/kuppi/sessions/search/host',
    SESSIONS_SEARCH_DATE: '/kuppi/sessions/search/date',
    SESSIONS_UPCOMING: '/kuppi/sessions/upcoming',
    SESSION_CANCEL: (id: number) => `/kuppi/sessions/${id}/cancel`,
    SESSION_RESCHEDULE: (id: number) => `/kuppi/sessions/${id}/reschedule`,
    MY_SESSIONS: '/kuppi/sessions/my',
    MY_ANALYTICS: '/kuppi/sessions/my/analytics',

    // Note Endpoints
    NOTES: '/kuppi/notes',
    NOTE_BY_ID: (id: number) => `/kuppi/notes/${id}`,
    NOTES_BY_SESSION: (sessionId: number) => `/kuppi/notes/session/${sessionId}`,
    NOTE_DOWNLOAD: (id: number) => `/kuppi/notes/${id}/download`,
    NOTE_DOWNLOAD_FILE: (id: number) => `/kuppi/notes/${id}/download/file`,
    NOTES_SEARCH: '/kuppi/notes/search',
    NOTES_UPLOAD: '/kuppi/notes/upload',
    NOTE_UPLOAD_UPDATE: (id: number) => `/kuppi/notes/${id}/upload`,
    MY_NOTES: '/kuppi/notes/my',

    // Application Endpoints (Student)
    APPLICATIONS: '/kuppi/applications',
    MY_APPLICATIONS: '/kuppi/applications/my',
    ACTIVE_APPLICATION: '/kuppi/applications/active',
    CAN_APPLY: '/kuppi/applications/can-apply',
    IS_KUPPI_STUDENT: '/kuppi/applications/is-kuppi-student',

    // Admin Endpoints
    ADMIN_APPLICATIONS: '/admin/kuppi/applications',
    ADMIN_APPLICATION_BY_ID: (id: number) => `/admin/kuppi/applications/${id}`,
    ADMIN_APPLICATIONS_STATUS: (status: ApplicationStatus) => `/admin/kuppi/applications/status/${status}`,
    ADMIN_APPLICATIONS_PENDING: '/admin/kuppi/applications/pending',
    ADMIN_APPLICATIONS_ACTIVE: '/admin/kuppi/applications/active',
    ADMIN_APPLICATIONS_SEARCH: '/admin/kuppi/applications/search',
    ADMIN_APPLICATION_STATS: '/admin/kuppi/applications/stats',
    ADMIN_APPLICATION_APPROVE: (id: number) => `/admin/kuppi/applications/${id}/approve`,
    ADMIN_APPLICATION_REJECT: (id: number) => `/admin/kuppi/applications/${id}/reject`,
    ADMIN_APPLICATION_UNDER_REVIEW: (id: number) => `/admin/kuppi/applications/${id}/under-review`,
    ADMIN_SESSION: (id: number) => `/admin/kuppi/sessions/${id}`,
    ADMIN_NOTE: (id: number) => `/admin/kuppi/notes/${id}`,
    ADMIN_STATS: '/admin/kuppi/stats',

    // Super Admin Endpoints
    SUPER_ADMIN_APPLICATION_PERMANENT: (id: number) => `/super-admin/kuppi/applications/${id}/permanent`,
    SUPER_ADMIN_REVOKE_ROLE: (studentId: number) => `/super-admin/kuppi/applications/revoke/${studentId}`,
    ADMIN_SESSION_PERMANENT: (id: number) => `/admin/kuppi/sessions/${id}/permanent`,
    ADMIN_NOTE_PERMANENT: (id: number) => `/admin/kuppi/notes/${id}/permanent`,

    // Kuppi Students Endpoints
    KUPPI_STUDENTS: '/kuppi/students',
    KUPPI_STUDENT_BY_ID: (studentId: number) => `/kuppi/students/${studentId}`,
    KUPPI_STUDENTS_SEARCH_BY_NAME: '/kuppi/students/search/name',
    KUPPI_STUDENTS_SEARCH_BY_SUBJECT: '/kuppi/students/search/subject',
    KUPPI_STUDENTS_BY_FACULTY: (faculty: string) => `/kuppi/students/faculty/${faculty}`,
    KUPPI_STUDENTS_TOP_RATED: '/kuppi/students/top-rated',

    // Review Endpoints (Student)
    REVIEWS: '/kuppi/reviews',
    REVIEW_BY_ID: (reviewId: number) => `/kuppi/reviews/${reviewId}`,
    MY_REVIEWS: '/kuppi/reviews/my',
    SESSION_REVIEWS: (sessionId: number) => `/kuppi/reviews/session/${sessionId}`,
    TUTOR_REVIEWS: (tutorId: number) => `/kuppi/reviews/tutor/${tutorId}`,

    // Review Endpoints (Tutor)
    TUTOR_RESPONSE: (reviewId: number) => `/kuppi/reviews/${reviewId}/tutor-response`,
    MY_HOSTED_REVIEWS: '/kuppi/reviews/my-hosted',

    // Review Endpoints (Admin)
    ADMIN_REVIEWS: '/admin/kuppi/reviews',
    ADMIN_REVIEW_DELETE: (reviewId: number) => `/admin/kuppi/reviews/${reviewId}`,
};

// ============================================================================
// Helper Functions
// ============================================================================

function buildQueryParams<T extends object>(params: T): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
        }
    });
    return queryParams.toString();
}

// ============================================================================
// Session Services
// ============================================================================

export async function getAllSessions(params: KuppiPaginationParams = {}): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.SESSIONS}?${query}` : KUPPI_ENDPOINTS.SESSIONS;
    const response = await apiClient.get<KuppiSessionsResponse>(url);
    return response.data;
}

export async function getSessionById(id: number): Promise<KuppiSessionDetailResponse> {
    const response = await apiClient.get<KuppiSessionDetailResponse>(KUPPI_ENDPOINTS.SESSION_BY_ID(id));
    return response.data;
}

export async function searchSessions(params: KuppiSearchParams): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<KuppiSessionsResponse>(`${KUPPI_ENDPOINTS.SESSIONS_SEARCH}?${query}`);
    return response.data;
}

export async function searchSessionsBySubject(subject: string, params: KuppiPaginationParams = {}): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams({ ...params, subject });
    const response = await apiClient.get<KuppiSessionsResponse>(`${KUPPI_ENDPOINTS.SESSIONS_SEARCH_SUBJECT}?${query}`);
    return response.data;
}

export async function searchSessionsByHost(hostName: string, params: KuppiPaginationParams = {}): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams({ ...params, hostName });
    const response = await apiClient.get<KuppiSessionsResponse>(`${KUPPI_ENDPOINTS.SESSIONS_SEARCH_HOST}?${query}`);
    return response.data;
}

export async function searchSessionsByDateRange(params: KuppiDateRangeParams): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<KuppiSessionsResponse>(`${KUPPI_ENDPOINTS.SESSIONS_SEARCH_DATE}?${query}`);
    return response.data;
}

export async function getUpcomingSessions(params: KuppiPaginationParams = {}): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.SESSIONS_UPCOMING}?${query}` : KUPPI_ENDPOINTS.SESSIONS_UPCOMING;
    const response = await apiClient.get<KuppiSessionsResponse>(url);
    return response.data;
}

export async function createSession(data: CreateKuppiSessionRequest): Promise<KuppiSessionDetailResponse> {
    const response = await apiClient.post<KuppiSessionDetailResponse>(KUPPI_ENDPOINTS.SESSIONS, data);
    return response.data;
}

export async function updateSession(id: number, data: UpdateKuppiSessionRequest): Promise<KuppiSessionDetailResponse> {
    const response = await apiClient.put<KuppiSessionDetailResponse>(KUPPI_ENDPOINTS.SESSION_BY_ID(id), data);
    return response.data;
}

export async function cancelSession(id: number, reason?: string): Promise<KuppiActionResponse> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const response = await apiClient.post<KuppiActionResponse>(`${KUPPI_ENDPOINTS.SESSION_CANCEL(id)}${query}`);
    return response.data;
}

export async function rescheduleSession(id: number, newStartTime: string, newEndTime: string): Promise<KuppiSessionDetailResponse> {
    const query = `?newStartTime=${encodeURIComponent(newStartTime)}&newEndTime=${encodeURIComponent(newEndTime)}`;
    const response = await apiClient.post<KuppiSessionDetailResponse>(`${KUPPI_ENDPOINTS.SESSION_RESCHEDULE(id)}${query}`);
    return response.data;
}

export async function deleteSession(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.SESSION_BY_ID(id));
    return response.data;
}

export async function getMySessions(params: KuppiPaginationParams = {}): Promise<KuppiSessionsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.MY_SESSIONS}?${query}` : KUPPI_ENDPOINTS.MY_SESSIONS;
    const response = await apiClient.get<KuppiSessionsResponse>(url);
    return response.data;
}

export async function getMyAnalytics(): Promise<KuppiAnalyticsResponse> {
    const response = await apiClient.get<KuppiAnalyticsResponse>(KUPPI_ENDPOINTS.MY_ANALYTICS);
    return response.data;
}

// ============================================================================
// Notes Services
// ============================================================================

export async function getAllNotes(params: KuppiPaginationParams = {}): Promise<KuppiNotesResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.NOTES}?${query}` : KUPPI_ENDPOINTS.NOTES;
    const response = await apiClient.get<KuppiNotesResponse>(url);
    return response.data;
}

export async function getNoteById(id: number): Promise<KuppiNoteDetailResponse> {
    const response = await apiClient.get<KuppiNoteDetailResponse>(KUPPI_ENDPOINTS.NOTE_BY_ID(id));
    return response.data;
}

export async function getNotesBySession(sessionId: number): Promise<KuppiNotesResponse> {
    const response = await apiClient.get<KuppiNotesResponse>(KUPPI_ENDPOINTS.NOTES_BY_SESSION(sessionId));
    return response.data;
}

export async function recordNoteDownload(id: number): Promise<KuppiNoteDetailResponse> {
    const response = await apiClient.get<KuppiNoteDetailResponse>(KUPPI_ENDPOINTS.NOTE_DOWNLOAD(id));
    return response.data;
}

export async function downloadNoteFile(id: number): Promise<Blob> {
    const response = await apiClient.get(KUPPI_ENDPOINTS.NOTE_DOWNLOAD_FILE(id), {
        responseType: 'blob',
    });
    return response.data;
}

export async function searchNotes(params: KuppiSearchParams): Promise<KuppiNotesResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<KuppiNotesResponse>(`${KUPPI_ENDPOINTS.NOTES_SEARCH}?${query}`);
    return response.data;
}

export async function uploadNote(data: CreateKuppiNoteRequest): Promise<KuppiNoteDetailResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.sessionId) formData.append('sessionId', data.sessionId.toString());
    if (data.allowDownload !== undefined) formData.append('allowDownload', data.allowDownload.toString());
    formData.append('file', data.file);

    const response = await apiClient.post<KuppiNoteDetailResponse>(KUPPI_ENDPOINTS.NOTES_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function updateNote(id: number, data: UpdateKuppiNoteRequest): Promise<KuppiNoteDetailResponse> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.allowDownload !== undefined) formData.append('allowDownload', data.allowDownload.toString());
    if (data.file) formData.append('file', data.file);

    const response = await apiClient.put<KuppiNoteDetailResponse>(KUPPI_ENDPOINTS.NOTE_UPLOAD_UPDATE(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function deleteNote(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.NOTE_BY_ID(id));
    return response.data;
}

export async function getMyNotes(params: KuppiPaginationParams = {}): Promise<KuppiNotesResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.MY_NOTES}?${query}` : KUPPI_ENDPOINTS.MY_NOTES;
    const response = await apiClient.get<KuppiNotesResponse>(url);
    return response.data;
}

// ============================================================================
// Application Services (Student)
// ============================================================================

export async function submitApplication(data: CreateKuppiApplicationRequest): Promise<KuppiApplicationDetailResponse> {
    const response = await apiClient.post<KuppiApplicationDetailResponse>(KUPPI_ENDPOINTS.APPLICATIONS, data);
    return response.data;
}

export async function getMyApplications(): Promise<KuppiApplicationsResponse> {
    const response = await apiClient.get<KuppiApplicationsResponse>(KUPPI_ENDPOINTS.MY_APPLICATIONS);
    return response.data;
}

export async function getActiveApplication(): Promise<KuppiApplicationDetailResponse> {
    const response = await apiClient.get<KuppiApplicationDetailResponse>(KUPPI_ENDPOINTS.ACTIVE_APPLICATION);
    return response.data;
}

export async function cancelApplication(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(`${KUPPI_ENDPOINTS.APPLICATIONS}/${id}`);
    return response.data;
}

export async function checkCanApply(): Promise<CanApplyResponse> {
    const response = await apiClient.get<CanApplyResponse>(KUPPI_ENDPOINTS.CAN_APPLY);
    return response.data;
}

export async function checkIsKuppiStudent(): Promise<IsKuppiStudentResponse> {
    const response = await apiClient.get<IsKuppiStudentResponse>(KUPPI_ENDPOINTS.IS_KUPPI_STUDENT);
    return response.data;
}

// ============================================================================
// Admin Services
// ============================================================================

export async function adminGetAllApplications(params: KuppiPaginationParams = {}): Promise<KuppiApplicationsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.ADMIN_APPLICATIONS}?${query}` : KUPPI_ENDPOINTS.ADMIN_APPLICATIONS;
    const response = await apiClient.get<KuppiApplicationsResponse>(url);
    return response.data;
}

export async function adminGetApplicationsByStatus(status: ApplicationStatus, params: KuppiPaginationParams = {}): Promise<KuppiApplicationsResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_STATUS(status)}?${query}`
        : KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_STATUS(status);
    const response = await apiClient.get<KuppiApplicationsResponse>(url);
    return response.data;
}

export async function adminGetPendingApplications(params: KuppiPaginationParams = {}): Promise<KuppiApplicationsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_PENDING}?${query}` : KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_PENDING;
    const response = await apiClient.get<KuppiApplicationsResponse>(url);
    return response.data;
}

export async function adminGetActiveApplications(params: KuppiPaginationParams = {}): Promise<KuppiApplicationsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_ACTIVE}?${query}` : KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_ACTIVE;
    const response = await apiClient.get<KuppiApplicationsResponse>(url);
    return response.data;
}

export async function adminGetApplicationById(id: number): Promise<KuppiApplicationDetailResponse> {
    const response = await apiClient.get<KuppiApplicationDetailResponse>(KUPPI_ENDPOINTS.ADMIN_APPLICATION_BY_ID(id));
    return response.data;
}

export async function adminSearchApplications(params: KuppiSearchParams): Promise<KuppiApplicationsResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<KuppiApplicationsResponse>(`${KUPPI_ENDPOINTS.ADMIN_APPLICATIONS_SEARCH}?${query}`);
    return response.data;
}

export async function adminGetApplicationStats(): Promise<KuppiApplicationStatsResponse> {
    const response = await apiClient.get<KuppiApplicationStatsResponse>(KUPPI_ENDPOINTS.ADMIN_APPLICATION_STATS);
    return response.data;
}

export async function adminApproveApplication(id: number, data: ReviewKuppiApplicationRequest = {}): Promise<KuppiApplicationDetailResponse> {
    const response = await apiClient.put<KuppiApplicationDetailResponse>(KUPPI_ENDPOINTS.ADMIN_APPLICATION_APPROVE(id), data);
    return response.data;
}

export async function adminRejectApplication(id: number, data: ReviewKuppiApplicationRequest): Promise<KuppiApplicationDetailResponse> {
    const response = await apiClient.put<KuppiApplicationDetailResponse>(KUPPI_ENDPOINTS.ADMIN_APPLICATION_REJECT(id), data);
    return response.data;
}

export async function adminMarkUnderReview(id: number): Promise<KuppiApplicationDetailResponse> {
    const response = await apiClient.put<KuppiApplicationDetailResponse>(KUPPI_ENDPOINTS.ADMIN_APPLICATION_UNDER_REVIEW(id));
    return response.data;
}

export async function adminUpdateSession(id: number, data: UpdateKuppiSessionRequest): Promise<KuppiSessionDetailResponse> {
    const response = await apiClient.put<KuppiSessionDetailResponse>(KUPPI_ENDPOINTS.ADMIN_SESSION(id), data);
    return response.data;
}

export async function adminDeleteSession(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.ADMIN_SESSION(id));
    return response.data;
}

export async function adminUpdateNote(id: number, data: UpdateKuppiNoteRequest): Promise<KuppiNoteDetailResponse> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.allowDownload !== undefined) formData.append('allowDownload', data.allowDownload.toString());
    if (data.file) formData.append('file', data.file);

    const response = await apiClient.put<KuppiNoteDetailResponse>(KUPPI_ENDPOINTS.ADMIN_NOTE(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function adminDeleteNote(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.ADMIN_NOTE(id));
    return response.data;
}

export async function adminGetPlatformStats(): Promise<KuppiPlatformStatsResponse> {
    const response = await apiClient.get<KuppiPlatformStatsResponse>(KUPPI_ENDPOINTS.ADMIN_STATS);
    return response.data;
}

// ============================================================================
// Super Admin Services
// ============================================================================

export async function superAdminPermanentDeleteApplication(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.SUPER_ADMIN_APPLICATION_PERMANENT(id));
    return response.data;
}

export async function superAdminRevokeKuppiRole(studentId: number, reason: string): Promise<KuppiActionResponse> {
    const query = `?reason=${encodeURIComponent(reason)}`;
    const response = await apiClient.delete<KuppiActionResponse>(`${KUPPI_ENDPOINTS.SUPER_ADMIN_REVOKE_ROLE(studentId)}${query}`);
    return response.data;
}

export async function superAdminPermanentDeleteSession(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.ADMIN_SESSION_PERMANENT(id));
    return response.data;
}

export async function superAdminPermanentDeleteNote(id: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.ADMIN_NOTE_PERMANENT(id));
    return response.data;
}

// ============================================================================
// Kuppi Students Services
// ============================================================================

/**
 * Get all Kuppi students (paginated)
 */
export async function getAllKuppiStudents(params: KuppiPaginationParams = {}): Promise<KuppiStudentsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.KUPPI_STUDENTS}?${query}` : KUPPI_ENDPOINTS.KUPPI_STUDENTS;
    const response = await apiClient.get<KuppiStudentsResponse>(url);
    return response.data;
}

/**
 * Get Kuppi student details by ID
 */
export async function getKuppiStudentById(studentId: number): Promise<KuppiStudentDetailApiResponse> {
    const response = await apiClient.get<KuppiStudentDetailApiResponse>(KUPPI_ENDPOINTS.KUPPI_STUDENT_BY_ID(studentId));
    return response.data;
}

/**
 * Search Kuppi students by name
 */
export async function searchKuppiStudentsByName(params: KuppiStudentSearchByNameParams): Promise<KuppiStudentsResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<KuppiStudentsResponse>(`${KUPPI_ENDPOINTS.KUPPI_STUDENTS_SEARCH_BY_NAME}?${query}`);
    return response.data;
}

/**
 * Search Kuppi students by subject
 */
export async function searchKuppiStudentsBySubject(params: KuppiStudentSearchBySubjectParams): Promise<KuppiStudentsResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<KuppiStudentsResponse>(`${KUPPI_ENDPOINTS.KUPPI_STUDENTS_SEARCH_BY_SUBJECT}?${query}`);
    return response.data;
}

/**
 * Get Kuppi students by faculty
 */
export async function getKuppiStudentsByFaculty(faculty: string, params: KuppiPaginationParams = {}): Promise<KuppiStudentsResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${KUPPI_ENDPOINTS.KUPPI_STUDENTS_BY_FACULTY(faculty)}?${query}`
        : KUPPI_ENDPOINTS.KUPPI_STUDENTS_BY_FACULTY(faculty);
    const response = await apiClient.get<KuppiStudentsResponse>(url);
    return response.data;
}

/**
 * Get top-rated Kuppi students
 */
export async function getTopRatedKuppiStudents(params: KuppiPaginationParams = {}): Promise<KuppiStudentsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.KUPPI_STUDENTS_TOP_RATED}?${query}` : KUPPI_ENDPOINTS.KUPPI_STUDENTS_TOP_RATED;
    const response = await apiClient.get<KuppiStudentsResponse>(url);
    return response.data;
}

// ============================================================================
// Review Services (Student)
// ============================================================================

/**
 * Create a new review for a session
 */
export async function createReview(data: CreateKuppiReviewRequest): Promise<KuppiReviewDetailResponse> {
    const response = await apiClient.post<KuppiReviewDetailResponse>(KUPPI_ENDPOINTS.REVIEWS, data);
    return response.data;
}

/**
 * Update an existing review
 */
export async function updateReview(reviewId: number, data: UpdateKuppiReviewRequest): Promise<KuppiReviewDetailResponse> {
    const response = await apiClient.put<KuppiReviewDetailResponse>(KUPPI_ENDPOINTS.REVIEW_BY_ID(reviewId), data);
    return response.data;
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.REVIEW_BY_ID(reviewId));
    return response.data;
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId: number): Promise<KuppiReviewDetailResponse> {
    const response = await apiClient.get<KuppiReviewDetailResponse>(KUPPI_ENDPOINTS.REVIEW_BY_ID(reviewId));
    return response.data;
}

/**
 * Get my reviews (reviews I've written)
 */
export async function getMyReviews(params: KuppiPaginationParams = {}): Promise<KuppiReviewsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.MY_REVIEWS}?${query}` : KUPPI_ENDPOINTS.MY_REVIEWS;
    const response = await apiClient.get<KuppiReviewsResponse>(url);
    return response.data;
}

/**
 * Get reviews for a specific session
 */
export async function getSessionReviews(sessionId: number, params: KuppiPaginationParams = {}): Promise<KuppiReviewsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.SESSION_REVIEWS(sessionId)}?${query}` : KUPPI_ENDPOINTS.SESSION_REVIEWS(sessionId);
    const response = await apiClient.get<KuppiReviewsResponse>(url);
    return response.data;
}

/**
 * Get reviews for a specific tutor
 */
export async function getTutorReviews(tutorId: number, params: KuppiPaginationParams = {}): Promise<KuppiReviewsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.TUTOR_REVIEWS(tutorId)}?${query}` : KUPPI_ENDPOINTS.TUTOR_REVIEWS(tutorId);
    const response = await apiClient.get<KuppiReviewsResponse>(url);
    return response.data;
}

// ============================================================================
// Review Services (Tutor)
// ============================================================================

/**
 * Add tutor response to a review
 */
export async function addTutorResponse(reviewId: number, data: TutorResponseRequest): Promise<KuppiReviewDetailResponse> {
    const response = await apiClient.post<KuppiReviewDetailResponse>(KUPPI_ENDPOINTS.TUTOR_RESPONSE(reviewId), data);
    return response.data;
}

/**
 * Get reviews for my hosted sessions
 */
export async function getMyHostedReviews(params: KuppiPaginationParams = {}): Promise<KuppiReviewsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.MY_HOSTED_REVIEWS}?${query}` : KUPPI_ENDPOINTS.MY_HOSTED_REVIEWS;
    const response = await apiClient.get<KuppiReviewsResponse>(url);
    return response.data;
}

// ============================================================================
// Review Services (Admin)
// ============================================================================

/**
 * Get all reviews (admin)
 */
export async function adminGetAllReviews(params: KuppiPaginationParams = {}): Promise<KuppiReviewsResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${KUPPI_ENDPOINTS.ADMIN_REVIEWS}?${query}` : KUPPI_ENDPOINTS.ADMIN_REVIEWS;
    const response = await apiClient.get<KuppiReviewsResponse>(url);
    return response.data;
}

/**
 * Delete a review (admin)
 */
export async function adminDeleteReview(reviewId: number): Promise<KuppiActionResponse> {
    const response = await apiClient.delete<KuppiActionResponse>(KUPPI_ENDPOINTS.ADMIN_REVIEW_DELETE(reviewId));
    return response.data;
}


/**
 * @fileoverview Meeting Module Services
 * @description API services for meetings, feedback, lecturer operations, and admin operations
 */

import apiClient from '@/lib/api-client';
import type {
    ApiResponse, PagedData, MeetingResponse, MeetingStatistics, LecturerStatistics,
    CreateMeetingRequest, AcceptMeetingRequest, RejectMeetingRequest,
    RescheduleMeetingRequest, SubmitFeedbackRequest,
    MeetingPaginationParams, MeetingSearchParams, CalendarParams,
} from './types';

// ============================================================================
// Endpoints
// ============================================================================

const BASE = '/meetings';
const ADMIN_BASE = '/admin/meetings';

function buildQuery<T extends object>(params: T): string {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, String(v)); });
    return q.toString();
}

// ============================================================================
// Common
// ============================================================================

export async function getMeetingById(id: number): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.get<ApiResponse<MeetingResponse>>(`${BASE}/${id}`);
    return r.data;
}

// ============================================================================
// Student Operations
// ============================================================================

export async function createMeeting(data: CreateMeetingRequest): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(BASE, data);
    return r.data;
}

export async function getMyRequests(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/my/requests${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getMyMeetingsByStatus(status: string, params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/my/status/${status}${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getMyUpcomingMeetings(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/my/upcoming${q ? `?${q}` : ''}`);
    return r.data;
}

export async function searchMyMeetings(params: MeetingSearchParams): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/my/search?${q}`);
    return r.data;
}

export async function cancelMeeting(id: number, reason: string): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    return r.data;
}

export async function submitFeedback(id: number, data: SubmitFeedbackRequest): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/feedback`, data);
    return r.data;
}

// ============================================================================
// Lecturer Operations
// ============================================================================

export async function getLecturerPendingRequests(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/pending${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getLecturerPendingCount(): Promise<ApiResponse<number>> {
    const r = await apiClient.get<ApiResponse<number>>(`${BASE}/lecturer/pending/count`);
    return r.data;
}

export async function getLecturerAllRequests(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/all${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getLecturerUpcomingMeetings(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/upcoming${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getLecturerCalendarMeetings(params: CalendarParams): Promise<ApiResponse<MeetingResponse[]>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<MeetingResponse[]>>(`${BASE}/lecturer/calendar?${q}`);
    return r.data;
}

export async function searchLecturerMeetings(params: MeetingSearchParams): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/search?${q}`);
    return r.data;
}

export async function getLecturerStatistics(): Promise<ApiResponse<MeetingStatistics>> {
    const r = await apiClient.get<ApiResponse<MeetingStatistics>>(`${BASE}/lecturer/statistics`);
    return r.data;
}

export async function getLecturerHighPriorityRequests(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/high-priority${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getLecturerFollowUpMeetings(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/follow-up${q ? `?${q}` : ''}`);
    return r.data;
}

export async function getLecturerMeetingsByStatus(status: string, params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${BASE}/lecturer/status/${status}${q ? `?${q}` : ''}`);
    return r.data;
}

export async function acceptMeeting(id: number, data: AcceptMeetingRequest): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/accept`, data);
    return r.data;
}

export async function rejectMeeting(id: number, data: RejectMeetingRequest): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/reject`, data);
    return r.data;
}

export async function rescheduleMeeting(id: number, data: RescheduleMeetingRequest): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/reschedule`, data);
    return r.data;
}

export async function lecturerCancelMeeting(id: number, reason: string): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/lecturer-cancel?reason=${encodeURIComponent(reason)}`);
    return r.data;
}

export async function addMeetingNotes(id: number, notes: string, followUpRequired: boolean, followUpNotes?: string): Promise<ApiResponse<MeetingResponse>> {
    const params = new URLSearchParams();
    params.append('notes', notes);
    params.append('followUpRequired', String(followUpRequired));
    if (followUpNotes) params.append('followUpNotes', followUpNotes);
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/notes?${params.toString()}`);
    return r.data;
}

export async function startMeeting(id: number): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/start`);
    return r.data;
}

export async function completeMeeting(id: number): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${BASE}/${id}/complete`);
    return r.data;
}

// ============================================================================
// Lecturer Profile Image
// ============================================================================

export async function uploadLecturerProfileImage(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    const r = await apiClient.post<ApiResponse<string>>(`${BASE}/lecturer/profile-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
}

// ============================================================================
// Admin Operations
// ============================================================================

export async function adminGetAllMeetings(params: MeetingPaginationParams = {}): Promise<ApiResponse<PagedData<MeetingResponse>>> {
    const q = buildQuery(params);
    const r = await apiClient.get<ApiResponse<PagedData<MeetingResponse>>>(`${ADMIN_BASE}${q ? `?${q}` : ''}`);
    return r.data;
}

export async function adminForceCancelMeeting(id: number, reason: string): Promise<ApiResponse<MeetingResponse>> {
    const r = await apiClient.post<ApiResponse<MeetingResponse>>(`${ADMIN_BASE}/${id}/force-cancel?reason=${encodeURIComponent(reason)}`);
    return r.data;
}

export async function adminPermanentDeleteMeeting(id: number): Promise<void> {
    await apiClient.delete(`${ADMIN_BASE}/${id}/permanent`);
}

export async function adminGetPlatformStatistics(): Promise<ApiResponse<MeetingStatistics>> {
    const r = await apiClient.get<ApiResponse<MeetingStatistics>>(`${ADMIN_BASE}/statistics`);
    return r.data;
}

export async function adminGetLecturerStatistics(lecturerId: number): Promise<ApiResponse<LecturerStatistics>> {
    const r = await apiClient.get<ApiResponse<LecturerStatistics>>(`${ADMIN_BASE}/statistics/lecturer/${lecturerId}`);
    return r.data;
}

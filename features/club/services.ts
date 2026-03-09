/**
 * @fileoverview Club Module Services
 * @description API services for Clubs, Memberships, Announcements, Elections, Admin operations
 */

import apiClient from '@/lib/api-client';
import {
    // Club
    ClubListResponse,
    ClubDetailResponse,
    ClubActionResponse,
    CreateClubRequest,
    UpdateClubRequest,
    // Membership
    MembershipListResponse,
    MembershipDetailResponse,
    JoinClubRequest,
    ChangePositionRequest,
    // Announcements
    AnnouncementListResponse,
    AnnouncementDetailResponse,
    // Elections
    ElectionListResponse,
    ElectionDetailResponse,
    // Stats & Activity
    ClubStatisticsResponse,
    ActivityLogResponse,
    ActivityLogType,
    // Params
    ClubPaginationParams,
    ClubSearchParams,
} from './types';

// ============================================================================
// Endpoints
// ============================================================================

const CLUB_BASE = '/club';
const CLUB_ANNOUNCEMENTS_BASE = '/club/announcements';
const CLUB_ADMIN_BASE = '/admin/club';
const ELECTION_BASE = '/club/election';

export const CLUB_ENDPOINTS = {
    // Club CRUD
    LIST: CLUB_BASE,
    BY_ID: (id: number) => `${CLUB_BASE}/${id}`,
    BY_CODE: (code: string) => `${CLUB_BASE}/code/${code}`,
    SEARCH: `${CLUB_BASE}/search`,
    BY_FACULTY: (faculty: string) => `${CLUB_BASE}/faculty/${faculty}`,
    OPEN_REGISTRATION: `${CLUB_BASE}/open-registration`,
    STATISTICS: (id: number) => `${CLUB_BASE}/${id}/statistics`,
    TOGGLE_REG: (id: number) => `${CLUB_BASE}/${id}/toggle-registration`,

    // Membership
    JOIN: `${CLUB_BASE}/join`,
    MY_MEMBERSHIPS: `${CLUB_BASE}/my-memberships`,
    MEMBERSHIP_BY_ID: (id: number) => `${CLUB_BASE}/memberships/${id}`,
    LEAVE: (clubId: number) => `${CLUB_BASE}/${clubId}/leave`,
    MEMBERS: (clubId: number) => `${CLUB_BASE}/${clubId}/members`,
    ACTIVE_MEMBERS: (clubId: number) => `${CLUB_BASE}/${clubId}/members/active`,
    PENDING_MEMBERS: (clubId: number) => `${CLUB_BASE}/${clubId}/members/pending`,
    APPROVE: (id: number) => `${CLUB_BASE}/memberships/${id}/approve`,
    REJECT: (id: number) => `${CLUB_BASE}/memberships/${id}/reject`,
    SUSPEND: (id: number) => `${CLUB_BASE}/memberships/${id}/suspend`,

    // Announcements
    ANNOUNCEMENTS_CREATE: CLUB_ANNOUNCEMENTS_BASE,
    ANNOUNCEMENTS_BY_ID: (id: number) => `${CLUB_ANNOUNCEMENTS_BASE}/${id}`,
    ANNOUNCEMENTS_BY_CLUB: (clubId: number) => `${CLUB_ANNOUNCEMENTS_BASE}/club/${clubId}`,
    ANNOUNCEMENTS_PUBLIC: (clubId: number) => `${CLUB_ANNOUNCEMENTS_BASE}/club/${clubId}/public`,
    ANNOUNCEMENTS_PINNED: (clubId: number) => `${CLUB_ANNOUNCEMENTS_BASE}/club/${clubId}/pinned`,
    ANNOUNCEMENTS_SEARCH: `${CLUB_ANNOUNCEMENTS_BASE}/search`,
    ANNOUNCEMENTS_PIN: (id: number) => `${CLUB_ANNOUNCEMENTS_BASE}/${id}/pin`,
    ANNOUNCEMENTS_UNPIN: (id: number) => `${CLUB_ANNOUNCEMENTS_BASE}/${id}/unpin`,

    // Club-scoped Elections
    ELECTIONS: (clubId: number) => `${CLUB_BASE}/${clubId}/elections`,
    ELECTIONS_ACTIVE: (clubId: number) => `${CLUB_BASE}/${clubId}/elections/active`,
    ELECTIONS_UPCOMING: (clubId: number) => `${CLUB_BASE}/${clubId}/elections/upcoming`,
    ELECTION_BY_ID: (electionId: number) => `${ELECTION_BASE}/${electionId}`,
    ELECTION_DETAILS: (electionId: number) => `${ELECTION_BASE}/${electionId}/details`,

    // Admin
    ADMIN_STATS: (clubId: number) => `${CLUB_ADMIN_BASE}/stats/${clubId}`,
    ADMIN_STATS_OFFICER: (clubId: number) => `${CLUB_ADMIN_BASE}/${clubId}/statistics`,
    ADMIN_ACTIVITY_LOGS: (clubId: number) => `${CLUB_ADMIN_BASE}/${clubId}/activity-log`,
    ADMIN_ACTIVITY_BY_TYPE: (clubId: number, type: ActivityLogType) =>
        `${CLUB_ADMIN_BASE}/${clubId}/activity-log/type/${type}`,
    ADMIN_CHANGE_POSITION: (memId: number) => `${CLUB_ADMIN_BASE}/memberships/${memId}/position`,
    ADMIN_BULK_APPROVE: (clubId: number) => `${CLUB_ADMIN_BASE}/${clubId}/memberships/bulk-approve`,
    ADMIN_TOGGLE_REG: (clubId: number) => `${CLUB_ADMIN_BASE}/${clubId}/toggle-registration`,
};

// ============================================================================
// Helper
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
// Club Services
// ============================================================================

/** List all clubs (paginated) */
export async function getClubs(params: ClubPaginationParams = {}): Promise<ClubListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${CLUB_ENDPOINTS.LIST}?${query}` : CLUB_ENDPOINTS.LIST;
    const response = await apiClient.get<ClubListResponse>(url);
    return response.data;
}

/** Get club by ID */
export async function getClubById(id: number): Promise<ClubDetailResponse> {
    const response = await apiClient.get<ClubDetailResponse>(CLUB_ENDPOINTS.BY_ID(id));
    return response.data;
}

/** Get club by code */
export async function getClubByCode(code: string): Promise<ClubDetailResponse> {
    const response = await apiClient.get<ClubDetailResponse>(CLUB_ENDPOINTS.BY_CODE(code));
    return response.data;
}

/** Search clubs */
export async function searchClubs(params: ClubSearchParams): Promise<ClubListResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<ClubListResponse>(`${CLUB_ENDPOINTS.SEARCH}?${query}`);
    return response.data;
}

/** Filter clubs by faculty */
export async function getClubsByFaculty(faculty: string, params: ClubPaginationParams = {}): Promise<ClubListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.BY_FACULTY(faculty)}?${query}`
        : CLUB_ENDPOINTS.BY_FACULTY(faculty);
    const response = await apiClient.get<ClubListResponse>(url);
    return response.data;
}

/** Get clubs with open registration */
export async function getOpenRegistrationClubs(params: ClubPaginationParams = {}): Promise<ClubListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.OPEN_REGISTRATION}?${query}`
        : CLUB_ENDPOINTS.OPEN_REGISTRATION;
    const response = await apiClient.get<ClubListResponse>(url);
    return response.data;
}

/** Create a new club (form-data with optional logo) */
export async function createClub(data: CreateClubRequest, logo?: File): Promise<ClubDetailResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('faculty', data.faculty);
    if (data.description) formData.append('description', data.description);
    if (data.registrationOpen !== undefined) formData.append('registrationOpen', String(data.registrationOpen));
    if (logo) formData.append('logo', logo);

    const response = await apiClient.post<ClubDetailResponse>(CLUB_ENDPOINTS.LIST, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/** Update club (form-data with optional logo) */
export async function updateClub(id: number, data: UpdateClubRequest, logo?: File): Promise<ClubDetailResponse> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.faculty) formData.append('faculty', data.faculty);
    if (logo) formData.append('logo', logo);

    const response = await apiClient.put<ClubDetailResponse>(CLUB_ENDPOINTS.BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/** Delete club */
export async function deleteClub(id: number): Promise<ClubActionResponse> {
    const response = await apiClient.delete<ClubActionResponse>(CLUB_ENDPOINTS.BY_ID(id));
    return response.data;
}

/** Toggle registration */
export async function toggleRegistration(id: number): Promise<ClubActionResponse> {
    const response = await apiClient.put<ClubActionResponse>(CLUB_ENDPOINTS.TOGGLE_REG(id));
    return response.data;
}

/** Get club statistics */
export async function getClubStatistics(id: number): Promise<ClubStatisticsResponse> {
    const response = await apiClient.get<ClubStatisticsResponse>(CLUB_ENDPOINTS.STATISTICS(id));
    return response.data;
}

// ============================================================================
// Membership Services
// ============================================================================

/** Join a club */
export async function joinClub(data: JoinClubRequest): Promise<ClubActionResponse> {
    const response = await apiClient.post<ClubActionResponse>(CLUB_ENDPOINTS.JOIN, data);
    return response.data;
}

/** Get my memberships */
export async function getMyMemberships(params: ClubPaginationParams = {}): Promise<MembershipListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${CLUB_ENDPOINTS.MY_MEMBERSHIPS}?${query}` : CLUB_ENDPOINTS.MY_MEMBERSHIPS;
    const response = await apiClient.get<MembershipListResponse>(url);
    return response.data;
}

/** Get membership by ID */
export async function getMembershipById(id: number): Promise<MembershipDetailResponse> {
    const response = await apiClient.get<MembershipDetailResponse>(CLUB_ENDPOINTS.MEMBERSHIP_BY_ID(id));
    return response.data;
}

/** Leave a club */
export async function leaveClub(clubId: number): Promise<ClubActionResponse> {
    const response = await apiClient.delete<ClubActionResponse>(CLUB_ENDPOINTS.LEAVE(clubId));
    return response.data;
}

/** Get club members */
export async function getClubMembers(clubId: number, params: ClubPaginationParams = {}): Promise<MembershipListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${CLUB_ENDPOINTS.MEMBERS(clubId)}?${query}` : CLUB_ENDPOINTS.MEMBERS(clubId);
    const response = await apiClient.get<MembershipListResponse>(url);
    return response.data;
}

/** Get active members */
export async function getActiveMembers(clubId: number, params: ClubPaginationParams = {}): Promise<MembershipListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${CLUB_ENDPOINTS.ACTIVE_MEMBERS(clubId)}?${query}` : CLUB_ENDPOINTS.ACTIVE_MEMBERS(clubId);
    const response = await apiClient.get<MembershipListResponse>(url);
    return response.data;
}

/** Get pending members */
export async function getPendingMembers(clubId: number, params: ClubPaginationParams = {}): Promise<MembershipListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${CLUB_ENDPOINTS.PENDING_MEMBERS(clubId)}?${query}` : CLUB_ENDPOINTS.PENDING_MEMBERS(clubId);
    const response = await apiClient.get<MembershipListResponse>(url);
    return response.data;
}

/** Approve membership */
export async function approveMembership(membershipId: number): Promise<ClubActionResponse> {
    const response = await apiClient.post<ClubActionResponse>(CLUB_ENDPOINTS.APPROVE(membershipId));
    return response.data;
}

/** Reject membership */
export async function rejectMembership(membershipId: number, reason?: string): Promise<ClubActionResponse> {
    const url = reason
        ? `${CLUB_ENDPOINTS.REJECT(membershipId)}?reason=${encodeURIComponent(reason)}`
        : CLUB_ENDPOINTS.REJECT(membershipId);
    const response = await apiClient.post<ClubActionResponse>(url);
    return response.data;
}

/** Suspend membership */
export async function suspendMembership(membershipId: number, reason?: string): Promise<ClubActionResponse> {
    const url = reason
        ? `${CLUB_ENDPOINTS.SUSPEND(membershipId)}?reason=${encodeURIComponent(reason)}`
        : CLUB_ENDPOINTS.SUSPEND(membershipId);
    const response = await apiClient.post<ClubActionResponse>(url);
    return response.data;
}

// ============================================================================
// Announcement Services
// ============================================================================

/** Create announcement (form-data) */
export async function createAnnouncement(formData: FormData): Promise<AnnouncementDetailResponse> {
    const response = await apiClient.post<AnnouncementDetailResponse>(CLUB_ENDPOINTS.ANNOUNCEMENTS_CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/** Get announcements by club */
export async function getAnnouncementsByClub(clubId: number, params: ClubPaginationParams = {}): Promise<AnnouncementListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ANNOUNCEMENTS_BY_CLUB(clubId)}?${query}`
        : CLUB_ENDPOINTS.ANNOUNCEMENTS_BY_CLUB(clubId);
    const response = await apiClient.get<AnnouncementListResponse>(url);
    return response.data;
}

/** Get public announcements */
export async function getPublicAnnouncements(clubId: number, params: ClubPaginationParams = {}): Promise<AnnouncementListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ANNOUNCEMENTS_PUBLIC(clubId)}?${query}`
        : CLUB_ENDPOINTS.ANNOUNCEMENTS_PUBLIC(clubId);
    const response = await apiClient.get<AnnouncementListResponse>(url);
    return response.data;
}

/** Get pinned announcements */
export async function getPinnedAnnouncements(clubId: number, params: ClubPaginationParams = {}): Promise<AnnouncementListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ANNOUNCEMENTS_PINNED(clubId)}?${query}`
        : CLUB_ENDPOINTS.ANNOUNCEMENTS_PINNED(clubId);
    const response = await apiClient.get<AnnouncementListResponse>(url);
    return response.data;
}

/** Search announcements */
export async function searchAnnouncements(params: ClubSearchParams): Promise<AnnouncementListResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<AnnouncementListResponse>(`${CLUB_ENDPOINTS.ANNOUNCEMENTS_SEARCH}?${query}`);
    return response.data;
}

/** Get announcement by ID */
export async function getAnnouncementById(id: number): Promise<AnnouncementDetailResponse> {
    const response = await apiClient.get<AnnouncementDetailResponse>(CLUB_ENDPOINTS.ANNOUNCEMENTS_BY_ID(id));
    return response.data;
}

/** Update announcement (form-data) */
export async function updateAnnouncement(id: number, formData: FormData): Promise<AnnouncementDetailResponse> {
    const response = await apiClient.put<AnnouncementDetailResponse>(CLUB_ENDPOINTS.ANNOUNCEMENTS_BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/** Delete announcement */
export async function deleteAnnouncement(id: number): Promise<ClubActionResponse> {
    const response = await apiClient.delete<ClubActionResponse>(CLUB_ENDPOINTS.ANNOUNCEMENTS_BY_ID(id));
    return response.data;
}

/** Pin announcement */
export async function pinAnnouncement(id: number): Promise<ClubActionResponse> {
    const response = await apiClient.put<ClubActionResponse>(CLUB_ENDPOINTS.ANNOUNCEMENTS_PIN(id));
    return response.data;
}

/** Unpin announcement */
export async function unpinAnnouncement(id: number): Promise<ClubActionResponse> {
    const response = await apiClient.put<ClubActionResponse>(CLUB_ENDPOINTS.ANNOUNCEMENTS_UNPIN(id));
    return response.data;
}

// ============================================================================
// Election Services
// ============================================================================

/** Get club elections */
export async function getClubElections(clubId: number, params: ClubPaginationParams = {}): Promise<ElectionListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${CLUB_ENDPOINTS.ELECTIONS(clubId)}?${query}` : CLUB_ENDPOINTS.ELECTIONS(clubId);
    const response = await apiClient.get<ElectionListResponse>(url);
    return response.data;
}

/** Get active elections */
export async function getActiveElections(clubId: number, params: ClubPaginationParams = {}): Promise<ElectionListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ELECTIONS_ACTIVE(clubId)}?${query}`
        : CLUB_ENDPOINTS.ELECTIONS_ACTIVE(clubId);
    const response = await apiClient.get<ElectionListResponse>(url);
    return response.data;
}

/** Get upcoming elections */
export async function getUpcomingElections(clubId: number, params: ClubPaginationParams = {}): Promise<ElectionListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ELECTIONS_UPCOMING(clubId)}?${query}`
        : CLUB_ENDPOINTS.ELECTIONS_UPCOMING(clubId);
    const response = await apiClient.get<ElectionListResponse>(url);
    return response.data;
}

/** Get election by ID */
export async function getElectionById(electionId: number): Promise<ElectionDetailResponse> {
    const response = await apiClient.get<ElectionDetailResponse>(CLUB_ENDPOINTS.ELECTION_BY_ID(electionId));
    return response.data;
}

/** Get election with candidates */
export async function getElectionDetails(electionId: number): Promise<ElectionDetailResponse> {
    const response = await apiClient.get<ElectionDetailResponse>(CLUB_ENDPOINTS.ELECTION_DETAILS(electionId));
    return response.data;
}

// ============================================================================
// Admin Services
// ============================================================================

/** Get detailed club stats (admin) */
export async function getAdminClubStats(clubId: number): Promise<ClubStatisticsResponse> {
    const response = await apiClient.get<ClubStatisticsResponse>(CLUB_ENDPOINTS.ADMIN_STATS(clubId));
    return response.data;
}

/** Get club statistics (officer view) */
export async function getAdminClubStatisticsOfficer(clubId: number): Promise<ClubStatisticsResponse> {
    const response = await apiClient.get<ClubStatisticsResponse>(CLUB_ENDPOINTS.ADMIN_STATS_OFFICER(clubId));
    return response.data;
}

/** Get activity logs */
export async function getActivityLogs(clubId: number, params: ClubPaginationParams = {}): Promise<ActivityLogResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ADMIN_ACTIVITY_LOGS(clubId)}?${query}`
        : CLUB_ENDPOINTS.ADMIN_ACTIVITY_LOGS(clubId);
    const response = await apiClient.get<ActivityLogResponse>(url);
    return response.data;
}

/** Get activity logs by type */
export async function getActivityLogsByType(
    clubId: number,
    type: ActivityLogType,
    params: ClubPaginationParams = {},
): Promise<ActivityLogResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${CLUB_ENDPOINTS.ADMIN_ACTIVITY_BY_TYPE(clubId, type)}?${query}`
        : CLUB_ENDPOINTS.ADMIN_ACTIVITY_BY_TYPE(clubId, type);
    const response = await apiClient.get<ActivityLogResponse>(url);
    return response.data;
}

/** Change member position (admin) */
export async function changePosition(data: ChangePositionRequest): Promise<ClubActionResponse> {
    const response = await apiClient.put<ClubActionResponse>(
        CLUB_ENDPOINTS.ADMIN_CHANGE_POSITION(data.membershipId),
        data,
    );
    return response.data;
}

/** Bulk approve memberships (admin) */
export async function bulkApprove(clubId: number, membershipIds: number[]): Promise<ClubActionResponse> {
    const response = await apiClient.post<ClubActionResponse>(
        CLUB_ENDPOINTS.ADMIN_BULK_APPROVE(clubId),
        membershipIds,
    );
    return response.data;
}

/** Admin toggle registration */
export async function adminToggleRegistration(clubId: number): Promise<ClubActionResponse> {
    const response = await apiClient.put<ClubActionResponse>(CLUB_ENDPOINTS.ADMIN_TOGGLE_REG(clubId));
    return response.data;
}


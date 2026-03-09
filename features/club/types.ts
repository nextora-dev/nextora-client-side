/**
 * @fileoverview Club Module Types
 * @description Type definitions for Clubs, Memberships, Announcements, Elections
 */

// ============================================================================
// Enums
// ============================================================================

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'LEFT';

export type ClubPosition =
    | 'PRESIDENT'
    | 'VICE_PRESIDENT'
    | 'SECRETARY'
    | 'TREASURER'
    | 'COMMITTEE_MEMBER'
    | 'MEMBER';

export type ElectionStatus =
    | 'UPCOMING'
    | 'NOMINATIONS_OPEN'
    | 'NOMINATIONS_CLOSED'
    | 'VOTING_OPEN'
    | 'VOTING_CLOSED'
    | 'RESULTS_PUBLISHED'
    | 'CANCELLED';

export type ActivityLogType =
    // Club
    | 'CLUB_CREATED'
    | 'CLUB_UPDATED'
    | 'CLUB_DELETED'
    | 'CLUB_REGISTRATION_OPENED'
    | 'CLUB_REGISTRATION_CLOSED'
    // Members
    | 'MEMBER_JOINED'
    | 'MEMBER_APPROVED'
    | 'MEMBER_REJECTED'
    | 'MEMBER_SUSPENDED'
    | 'MEMBER_LEFT'
    | 'MEMBER_POSITION_CHANGED'
    | 'MEMBER_REVOKED'
    // Announcements
    | 'ANNOUNCEMENT_POSTED'
    | 'ANNOUNCEMENT_UPDATED'
    | 'ANNOUNCEMENT_DELETED'
    | 'ANNOUNCEMENT_PINNED'
    // Elections
    | 'ELECTION_CREATED'
    | 'ELECTION_NOMINATIONS_OPENED'
    | 'ELECTION_NOMINATIONS_CLOSED'
    | 'ELECTION_VOTING_OPENED'
    | 'ELECTION_VOTING_CLOSED'
    | 'ELECTION_RESULTS_PUBLISHED'
    | 'ELECTION_CANCELLED'
    | 'ELECTION_PRESIDENT_AUTO_UPDATED'
    // Admin
    | 'BULK_MEMBER_APPROVED'
    | 'ADMIN_OVERRIDE';

// ============================================================================
// Club Types
// ============================================================================

export interface ClubResponse {
    id: number;
    clubCode: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    faculty: string;
    registrationOpen: boolean;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClubDetailResponse {
    success: boolean;
    message: string;
    data: ClubResponse;
    timestamp: string;
}

export interface ClubListResponse {
    success: boolean;
    message: string;
    data: {
        content: ClubResponse[];
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

export interface CreateClubRequest {
    name: string;
    description?: string;
    faculty: string;
    registrationOpen?: boolean;
}

export interface UpdateClubRequest {
    name?: string;
    description?: string;
    faculty?: string;
}

// ============================================================================
// Membership Types
// ============================================================================

export interface MembershipResponse {
    id: number;
    clubId: number;
    clubName: string;
    clubCode: string;
    userId: number;
    userName: string;
    userEmail: string;
    position: ClubPosition;
    status: MembershipStatus;
    remarks: string | null;
    joinedAt: string;
    updatedAt: string;
}

export interface MembershipListResponse {
    success: boolean;
    message: string;
    data: {
        content: MembershipResponse[];
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

export interface MembershipDetailResponse {
    success: boolean;
    message: string;
    data: MembershipResponse;
    timestamp: string;
}

export interface JoinClubRequest {
    clubId: number;
    remarks?: string;
}

export interface ChangePositionRequest {
    membershipId: number;
    newPosition: ClubPosition;
    reason: string;
}

// ============================================================================
// Announcement Types
// ============================================================================

export interface AnnouncementResponse {
    id: number;
    clubId: number;
    clubName: string;
    title: string;
    content: string;
    imageUrl: string | null;
    isPinned: boolean;
    isPublic: boolean;
    authorName: string;
    createdAt: string;
    updatedAt: string;
}

export interface AnnouncementListResponse {
    success: boolean;
    message: string;
    data: {
        content: AnnouncementResponse[];
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

export interface AnnouncementDetailResponse {
    success: boolean;
    message: string;
    data: AnnouncementResponse;
    timestamp: string;
}

// ============================================================================
// Election Types
// ============================================================================

export interface CandidateResponse {
    id: number;
    userId: number;
    userName: string;
    position: ClubPosition;
    manifesto: string | null;
    voteCount: number;
}

export interface ElectionResponse {
    id: number;
    clubId: number;
    clubName: string;
    title: string;
    description: string | null;
    status: ElectionStatus;
    nominationStartDate: string;
    nominationEndDate: string;
    votingStartDate: string;
    votingEndDate: string;
    candidates: CandidateResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface ElectionListResponse {
    success: boolean;
    message: string;
    data: {
        content: ElectionResponse[];
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

export interface ElectionDetailResponse {
    success: boolean;
    message: string;
    data: ElectionResponse;
    timestamp: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface ClubStatistics {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    totalAnnouncements: number;
    totalElections: number;
    activeElections: number;
    upcomingElections: number;
}

export interface ClubStatisticsResponse {
    success: boolean;
    message: string;
    data: ClubStatistics;
    timestamp: string;
}

// ============================================================================
// Activity Log Types
// ============================================================================

export interface ActivityLogEntry {
    id: number;
    clubId: number;
    type: ActivityLogType;
    description: string;
    performedBy: string;
    createdAt: string;
}

export interface ActivityLogResponse {
    success: boolean;
    message: string;
    data: {
        content: ActivityLogEntry[];
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

// ============================================================================
// Common Params
// ============================================================================

export interface ClubPaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export interface ClubSearchParams extends ClubPaginationParams {
    keyword?: string;
}

// ============================================================================
// Action Response
// ============================================================================

export interface ClubActionResponse {
    success: boolean;
    message: string;
    data?: unknown;
    timestamp: string;
}


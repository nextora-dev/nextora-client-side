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
    | 'TOP_BOARD_MEMBER'
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

export interface ClubOfficer {
    id: number;
    name: string;
    email: string;
    profilePictureUrl: string | null;
}

export interface ClubResponse {
    id: number;
    clubCode: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    faculty: string;

    // Registration — backend may send either field
    registrationOpen: boolean;
    isRegistrationOpen?: boolean;

    // Counts
    memberCount: number;
    totalMembers?: number;
    activeMembers?: number;
    totalElections?: number;
    activeElections?: number;

    // Officers (populated by club-by-id endpoint)
    president?: ClubOfficer | null;
    vicePresident?: ClubOfficer | null;
    secretary?: ClubOfficer | null;
    treasurer?: ClubOfficer | null;
    advisor?: ClubOfficer | null;

    // Contact / extra info
    email?: string | null;
    contactNumber?: string | null;
    establishedDate?: string | null;
    socialMediaLinks?: string | null;
    maxMembers?: number;
    isActive?: boolean;

    // Metadata
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
    membershipNumber: string | null;
    clubId: number;
    clubCode: string;
    clubName: string;
    memberId: number;
    memberName: string;
    memberEmail: string;
    memberProfilePictureUrl: string | null;
    memberStudentId: string | null;
    memberBatch: string | null;
    status: MembershipStatus;
    position: ClubPosition | null;
    joinDate: string;
    expiryDate: string | null;
    remarks: string | null;
    approvedAt: string | null;
    approvedById: number | null;
    approvedByName: string | null;
    canVote: boolean;
    canNominate: boolean;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    /** @deprecated — old field name aliases for backward compat */
    userId?: number;
    userName?: string;
    userEmail?: string;
    joinedAt?: string;
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
    clubCode?: string;
    clubName: string;
    title: string;
    content: string;
    priority?: string;
    isPinned: boolean;
    isMembersOnly: boolean;
    authorId?: number;
    authorName: string;
    authorEmail?: string;
    attachmentUrl: string | null;
    attachmentName?: string | null;
    viewCount?: number;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
    isActive?: boolean;
    /** @deprecated use isMembersOnly instead — kept for backward compat */
    isPublic?: boolean;
}

export interface UpdateAnnouncementRequest {
    title?: string;
    content?: string;
    priority?: string;
    isPinned?: boolean;
    isMembersOnly?: boolean;
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


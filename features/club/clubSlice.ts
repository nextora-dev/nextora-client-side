/**
 * @fileoverview Club Module Redux Slice
 * @description State management for Clubs, Memberships, Announcements, Elections
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as clubServices from './services';
import {
    ClubResponse,
    MembershipResponse,
    AnnouncementResponse,
    ElectionResponse,
    ClubStatistics,
    ActivityLogEntry,
    ClubPaginationParams,
    ClubSearchParams,
    CreateClubRequest,
    UpdateClubRequest,
    UpdateAnnouncementRequest,
    JoinClubRequest,
    ChangePositionRequest,
    ActivityLogType,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

/**
 * Normalize club response from backend.
 * Handles field name differences (isRegistrationOpen vs registrationOpen, totalMembers vs memberCount).
 */
function normalizeClub(club: ClubResponse): ClubResponse {
    const c = { ...club };
    // Backend may send isRegistrationOpen instead of registrationOpen
    if (c.registrationOpen === undefined && c.isRegistrationOpen !== undefined) {
        c.registrationOpen = c.isRegistrationOpen;
    }
    // Default to false if neither is set
    if (c.registrationOpen === undefined) {
        c.registrationOpen = false;
    }
    // Backend may send totalMembers instead of memberCount
    if ((c.memberCount === undefined || c.memberCount === 0) && c.totalMembers !== undefined) {
        c.memberCount = c.totalMembers;
    }
    // Default memberCount
    if (c.memberCount === undefined) {
        c.memberCount = 0;
    }
    return c;
}

function normalizeClubs(clubs: ClubResponse[]): ClubResponse[] {
    return clubs.map(normalizeClub);
}

/**
 * Normalize membership response from backend.
 * Backend uses memberName/memberEmail/joinDate; UI components may use userName/userEmail/joinedAt.
 */
function normalizeMembership(m: MembershipResponse): MembershipResponse {
    const n = { ...m };
    // Provide backward-compat aliases
    if (!n.userName) n.userName = n.memberName;
    if (!n.userEmail) n.userEmail = n.memberEmail;
    if (!n.userId) n.userId = n.memberId;
    if (!n.joinedAt) n.joinedAt = n.joinDate;
    return n;
}

function normalizeMemberships(list: MembershipResponse[]): MembershipResponse[] {
    return list.map(normalizeMembership);
}

/**
 * Normalize announcement response from backend.
 * Backend sends `isMembersOnly` (boolean). We derive `isPublic = !isMembersOnly` for backward compat.
 * Backend may also send `pinned` instead of `isPinned` in some cases.
 */
function normalizeAnnouncement(a: AnnouncementResponse): AnnouncementResponse {
    const n = { ...a } as AnnouncementResponse & { pinned?: boolean; membersOnly?: boolean; public?: boolean };

    // isPinned: handle alternate field names
    if (n.isPinned === undefined) {
        n.isPinned = n.pinned ?? false;
    }

    // isMembersOnly: the backend's canonical field
    if (n.isMembersOnly === undefined) {
        n.isMembersOnly = n.membersOnly ?? false;
    }

    // Derive isPublic from isMembersOnly for backward compatibility
    n.isPublic = !n.isMembersOnly;

    return n;
}

function normalizeAnnouncements(list: AnnouncementResponse[]): AnnouncementResponse[] {
    return list.map(normalizeAnnouncement);
}

export interface ClubState {
    // Clubs
    clubs: ClubResponse[];
    selectedClub: ClubResponse | null;
    totalClubs: number;

    // Memberships
    myMemberships: MembershipResponse[];
    clubMembers: MembershipResponse[];
    activeMembers: MembershipResponse[];
    pendingMembers: MembershipResponse[];
    selectedMembership: MembershipResponse | null;
    totalMembers: number;
    totalActiveMembers: number;
    totalPendingMembers: number;

    // Announcements
    announcements: AnnouncementResponse[];
    pinnedAnnouncements: AnnouncementResponse[];
    selectedAnnouncement: AnnouncementResponse | null;
    totalAnnouncements: number;
    totalPinnedAnnouncements: number;

    // Elections
    elections: ElectionResponse[];
    activeElections: ElectionResponse[];
    selectedElection: ElectionResponse | null;
    totalElections: number;

    // Statistics
    clubStatistics: ClubStatistics | null;
    adminClubStatistics: ClubStatistics | null;

    // Activity Logs
    activityLogs: ActivityLogEntry[];
    totalActivityLogs: number;

    // Pagination
    currentPage: number;
    pageSize: number;

    // Loading States
    isLoading: boolean;
    isClubLoading: boolean;
    isMembershipLoading: boolean;
    isAnnouncementLoading: boolean;
    isElectionLoading: boolean;
    isStatsLoading: boolean;
    isAdminStatsLoading: boolean;
    isActivityLogLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Messages
    error: string | null;
    successMessage: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: ClubState = {
    clubs: [],
    selectedClub: null,
    totalClubs: 0,

    myMemberships: [],
    clubMembers: [],
    activeMembers: [],
    pendingMembers: [],
    selectedMembership: null,
    totalMembers: 0,
    totalActiveMembers: 0,
    totalPendingMembers: 0,

    announcements: [],
    pinnedAnnouncements: [],
    selectedAnnouncement: null,
    totalAnnouncements: 0,
    totalPinnedAnnouncements: 0,

    elections: [],
    activeElections: [],
    selectedElection: null,
    totalElections: 0,

    clubStatistics: null,
    adminClubStatistics: null,

    activityLogs: [],
    totalActivityLogs: 0,

    currentPage: 0,
    pageSize: 10,

    isLoading: false,
    isClubLoading: false,
    isMembershipLoading: false,
    isAnnouncementLoading: false,
    isElectionLoading: false,
    isStatsLoading: false,
    isAdminStatsLoading: false,
    isActivityLogLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    error: null,
    successMessage: null,
};

// ============================================================================
// Error Helper
// ============================================================================

/**
 * Extract a human-readable error message from various error shapes:
 * - ApiError from interceptor: { success, error: { code, message }, timestamp }
 * - Axios error: { response: { data: { message } } }
 * - Error instance: { message }
 * - Plain string
 */
function extractErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
        const obj = error as Record<string, unknown>;
        // ApiError shape from Axios interceptor
        if (obj.error && typeof obj.error === 'object') {
            const nested = obj.error as Record<string, unknown>;
            if (typeof nested.message === 'string') return nested.message;
        }
        // Top-level message
        if (typeof obj.message === 'string') return obj.message;
        // Axios error shape
        const axiosErr = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
        if (axiosErr.response?.data?.error?.message) return axiosErr.response.data.error.message;
        if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    }
    return fallback;
}

// ============================================================================
// Async Thunks — Clubs
// ============================================================================

export const fetchClubs = createAsyncThunk(
    'club/fetchClubs',
    async (params: ClubPaginationParams, { rejectWithValue }) => {
        try {
            return await clubServices.getClubs(params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch clubs'));
        }
    },
);

export const fetchClubById = createAsyncThunk(
    'club/fetchClubById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getClubById(id);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch club'));
        }
    },
);

export const searchClubsAsync = createAsyncThunk(
    'club/searchClubs',
    async (params: ClubSearchParams, { rejectWithValue }) => {
        try {
            return await clubServices.searchClubs(params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to search clubs'));
        }
    },
);

export const fetchClubsByFaculty = createAsyncThunk(
    'club/fetchClubsByFaculty',
    async ({ faculty, params }: { faculty: string; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getClubsByFaculty(faculty, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch clubs by faculty'));
        }
    },
);

export const fetchOpenRegistrationClubs = createAsyncThunk(
    'club/fetchOpenRegistrationClubs',
    async (params: ClubPaginationParams, { rejectWithValue }) => {
        try {
            return await clubServices.getOpenRegistrationClubs(params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch open registration clubs'));
        }
    },
);

export const createClubAsync = createAsyncThunk(
    'club/createClub',
    async ({ data, logo }: { data: CreateClubRequest; logo?: File }, { rejectWithValue }) => {
        try {
            const response = await clubServices.createClub(data, logo);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to create club'));
        }
    },
);

export const updateClubAsync = createAsyncThunk(
    'club/updateClub',
    async ({ id, data, logo }: { id: number; data: UpdateClubRequest; logo?: File }, { rejectWithValue }) => {
        try {
            const response = await clubServices.updateClub(id, data, logo);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to update club'));
        }
    },
);

export const deleteClubAsync = createAsyncThunk(
    'club/deleteClub',
    async (id: number, { rejectWithValue }) => {
        try {
            await clubServices.deleteClub(id);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to delete club'));
        }
    },
);

export const toggleRegistrationAsync = createAsyncThunk(
    'club/toggleRegistration',
    async (id: number, { rejectWithValue }) => {
        try {
            await clubServices.toggleRegistration(id);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to toggle registration'));
        }
    },
);

// ============================================================================
// Async Thunks — Memberships
// ============================================================================

export const joinClubAsync = createAsyncThunk(
    'club/joinClub',
    async (data: JoinClubRequest, { rejectWithValue }) => {
        try {
            return await clubServices.joinClub(data);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to join club'));
        }
    },
);

export const fetchMyMemberships = createAsyncThunk(
    'club/fetchMyMemberships',
    async (params: ClubPaginationParams, { rejectWithValue }) => {
        try {
            return await clubServices.getMyMemberships(params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch memberships'));
        }
    },
);

export const leaveClubAsync = createAsyncThunk(
    'club/leaveClub',
    async (clubId: number, { rejectWithValue }) => {
        try {
            await clubServices.leaveClub(clubId);
            return clubId;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to leave club'));
        }
    },
);

export const fetchClubMembers = createAsyncThunk(
    'club/fetchClubMembers',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getClubMembers(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch club members'));
        }
    },
);

export const fetchPendingMembers = createAsyncThunk(
    'club/fetchPendingMembers',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getPendingMembers(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch pending members'));
        }
    },
);

export const approveMembershipAsync = createAsyncThunk(
    'club/approveMembership',
    async (membershipId: number, { rejectWithValue }) => {
        try {
            await clubServices.approveMembership(membershipId);
            return membershipId;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to approve membership'));
        }
    },
);

export const rejectMembershipAsync = createAsyncThunk(
    'club/rejectMembership',
    async ({ membershipId, reason }: { membershipId: number; reason?: string }, { rejectWithValue }) => {
        try {
            await clubServices.rejectMembership(membershipId, reason);
            return membershipId;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to reject membership'));
        }
    },
);

export const suspendMembershipAsync = createAsyncThunk(
    'club/suspendMembership',
    async ({ membershipId, reason }: { membershipId: number; reason?: string }, { rejectWithValue }) => {
        try {
            await clubServices.suspendMembership(membershipId, reason);
            return membershipId;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to suspend membership'));
        }
    },
);

export const bulkApproveAsync = createAsyncThunk(
    'club/bulkApprove',
    async ({ clubId, membershipIds }: { clubId: number; membershipIds: number[] }, { rejectWithValue }) => {
        try {
            await clubServices.bulkApprove(clubId, membershipIds);
            return membershipIds;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to bulk approve'));
        }
    },
);

export const changePositionAsync = createAsyncThunk(
    'club/changePosition',
    async (data: ChangePositionRequest, { rejectWithValue }) => {
        try {
            await clubServices.changePosition(data);
            return data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to change position'));
        }
    },
);

// ============================================================================
// Async Thunks — Announcements
// ============================================================================

export const fetchAnnouncementsByClub = createAsyncThunk(
    'club/fetchAnnouncementsByClub',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getAnnouncementsByClub(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch announcements'));
        }
    },
);

export const fetchPublicAnnouncements = createAsyncThunk(
    'club/fetchPublicAnnouncements',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getPublicAnnouncements(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch public announcements'));
        }
    },
);

export const createAnnouncementAsync = createAsyncThunk(
    'club/createAnnouncement',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await clubServices.createAnnouncement(formData);
            // response is AnnouncementDetailResponse { success, message, data: AnnouncementResponse }
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to create announcement'));
        }
    },
);

export const updateAnnouncementAsync = createAsyncThunk(
    'club/updateAnnouncement',
    async ({ id, data, attachment }: { id: number; data: UpdateAnnouncementRequest; attachment?: File }, { rejectWithValue }) => {
        try {
            const response = await clubServices.updateAnnouncement(id, data, attachment);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to update announcement'));
        }
    },
);

export const deleteAnnouncementAsync = createAsyncThunk(
    'club/deleteAnnouncement',
    async (id: number, { rejectWithValue }) => {
        try {
            await clubServices.deleteAnnouncement(id);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to delete announcement'));
        }
    },
);

export const pinAnnouncementAsync = createAsyncThunk(
    'club/pinAnnouncement',
    async (id: number, { rejectWithValue }) => {
        try {
            await clubServices.pinAnnouncement(id);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to pin announcement'));
        }
    },
);

export const unpinAnnouncementAsync = createAsyncThunk(
    'club/unpinAnnouncement',
    async (id: number, { rejectWithValue }) => {
        try {
            await clubServices.unpinAnnouncement(id);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to unpin announcement'));
        }
    },
);

// ============================================================================
// Async Thunks — Elections
// ============================================================================

export const fetchClubElections = createAsyncThunk(
    'club/fetchClubElections',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getClubElections(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch elections'));
        }
    },
);

export const fetchActiveElections = createAsyncThunk(
    'club/fetchActiveElections',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getActiveElections(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch active elections'));
        }
    },
);

export const fetchUpcomingElections = createAsyncThunk(
    'club/fetchUpcomingElections',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getUpcomingElections(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch upcoming elections'));
        }
    },
);

export const fetchElectionDetails = createAsyncThunk(
    'club/fetchElectionDetails',
    async (electionId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getElectionDetails(electionId);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch election details'));
        }
    },
);

// ============================================================================
// Async Thunks — Statistics & Activity Logs
// ============================================================================

export const fetchClubStatistics = createAsyncThunk(
    'club/fetchClubStatistics',
    async (clubId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getClubStatistics(clubId);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch club statistics'));
        }
    },
);

export const fetchActivityLogs = createAsyncThunk(
    'club/fetchActivityLogs',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getActivityLogs(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch activity logs'));
        }
    },
);

export const fetchActivityLogsByType = createAsyncThunk(
    'club/fetchActivityLogsByType',
    async (
        { clubId, type, params }: { clubId: number; type: ActivityLogType; params?: ClubPaginationParams },
        { rejectWithValue },
    ) => {
        try {
            return await clubServices.getActivityLogsByType(clubId, type, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch activity logs by type'));
        }
    },
);

// ============================================================================
// Async Thunks — Additional Services
// ============================================================================

export const fetchClubByCode = createAsyncThunk(
    'club/fetchClubByCode',
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await clubServices.getClubByCode(code);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch club by code'));
        }
    },
);

export const fetchActiveMembers = createAsyncThunk(
    'club/fetchActiveMembers',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getActiveMembers(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch active members'));
        }
    },
);

export const fetchMembershipById = createAsyncThunk(
    'club/fetchMembershipById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getMembershipById(id);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch membership'));
        }
    },
);

export const fetchPinnedAnnouncements = createAsyncThunk(
    'club/fetchPinnedAnnouncements',
    async ({ clubId, params }: { clubId: number; params?: ClubPaginationParams }, { rejectWithValue }) => {
        try {
            return await clubServices.getPinnedAnnouncements(clubId, params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch pinned announcements'));
        }
    },
);

export const searchAnnouncementsAsync = createAsyncThunk(
    'club/searchAnnouncements',
    async (params: ClubSearchParams, { rejectWithValue }) => {
        try {
            return await clubServices.searchAnnouncements(params);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to search announcements'));
        }
    },
);

export const fetchAnnouncementById = createAsyncThunk(
    'club/fetchAnnouncementById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getAnnouncementById(id);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch announcement'));
        }
    },
);

export const fetchElectionById = createAsyncThunk(
    'club/fetchElectionById',
    async (electionId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getElectionById(electionId);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch election'));
        }
    },
);

export const fetchAdminClubStats = createAsyncThunk(
    'club/fetchAdminClubStats',
    async (clubId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getAdminClubStats(clubId);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch admin club stats'));
        }
    },
);

export const fetchAdminClubStatisticsOfficer = createAsyncThunk(
    'club/fetchAdminClubStatisticsOfficer',
    async (clubId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.getAdminClubStatisticsOfficer(clubId);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to fetch officer club stats'));
        }
    },
);

export const adminToggleRegistrationAsync = createAsyncThunk(
    'club/adminToggleRegistration',
    async (clubId: number, { rejectWithValue }) => {
        try {
            await clubServices.adminToggleRegistration(clubId);
            return clubId;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to toggle registration'));
        }
    },
);

// ============================================================================
// Async Thunks — Super Admin Permanent Delete
// ============================================================================

export const permanentDeleteClubAsync = createAsyncThunk(
    'club/permanentDeleteClub',
    async (clubId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.permanentDeleteClub(clubId);
            return { id: clubId, response };
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to permanently delete club'));
        }
    },
);

export const permanentDeleteAnnouncementAsync = createAsyncThunk(
    'club/permanentDeleteAnnouncement',
    async (announcementId: number, { rejectWithValue }) => {
        try {
            const response = await clubServices.permanentDeleteAnnouncement(announcementId);
            return { id: announcementId, response };
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Failed to permanently delete announcement'));
        }
    },
);

// ============================================================================
// Slice
// ============================================================================

const clubSlice = createSlice({
    name: 'club',
    initialState,
    reducers: {
        clearClubError(state) {
            state.error = null;
        },
        clearClubSuccessMessage(state) {
            state.successMessage = null;
        },
        setClubPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
        setClubPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload;
        },
        clearSelectedClub(state) {
            state.selectedClub = null;
        },
        clearSelectedAnnouncement(state) {
            state.selectedAnnouncement = null;
        },
        clearSelectedElection(state) {
            state.selectedElection = null;
        },
        clearSelectedMembership(state) {
            state.selectedMembership = null;
        },
        clearPinnedAnnouncements(state) {
            state.pinnedAnnouncements = [];
            state.totalPinnedAnnouncements = 0;
        },
        clearActiveMembers(state) {
            state.activeMembers = [];
            state.totalActiveMembers = 0;
        },
        clearAdminClubStatistics(state) {
            state.adminClubStatistics = null;
        },
    },
    extraReducers: (builder) => {
        // ----------------------------------------------------------------
        // Clubs
        // ----------------------------------------------------------------
        builder
            .addCase(fetchClubs.pending, (state) => {
                state.isClubLoading = true;
                state.error = null;
            })
            .addCase(fetchClubs.fulfilled, (state, action) => {
                state.isClubLoading = false;
                state.clubs = normalizeClubs(action.payload.data.content);
                state.totalClubs = action.payload.data.totalElements;
            })
            .addCase(fetchClubs.rejected, (state, action) => {
                state.isClubLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchClubById.pending, (state) => {
                state.isClubLoading = true;
                state.error = null;
            })
            .addCase(fetchClubById.fulfilled, (state, action) => {
                state.isClubLoading = false;
                state.selectedClub = normalizeClub(action.payload);
            })
            .addCase(fetchClubById.rejected, (state, action) => {
                state.isClubLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(searchClubsAsync.pending, (state) => {
                state.isClubLoading = true;
                state.error = null;
            })
            .addCase(searchClubsAsync.fulfilled, (state, action) => {
                state.isClubLoading = false;
                state.clubs = normalizeClubs(action.payload.data.content);
                state.totalClubs = action.payload.data.totalElements;
            })
            .addCase(searchClubsAsync.rejected, (state, action) => {
                state.isClubLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchClubsByFaculty.pending, (state) => {
                state.isClubLoading = true;
                state.error = null;
            })
            .addCase(fetchClubsByFaculty.fulfilled, (state, action) => {
                state.isClubLoading = false;
                state.clubs = normalizeClubs(action.payload.data.content);
                state.totalClubs = action.payload.data.totalElements;
            })
            .addCase(fetchClubsByFaculty.rejected, (state, action) => {
                state.isClubLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchOpenRegistrationClubs.pending, (state) => {
                state.isClubLoading = true;
                state.error = null;
            })
            .addCase(fetchOpenRegistrationClubs.fulfilled, (state, action) => {
                state.isClubLoading = false;
                state.clubs = normalizeClubs(action.payload.data.content);
                state.totalClubs = action.payload.data.totalElements;
            })
            .addCase(fetchOpenRegistrationClubs.rejected, (state, action) => {
                state.isClubLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(createClubAsync.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createClubAsync.fulfilled, (state, action) => {
                state.isCreating = false;
                state.clubs = [normalizeClub(action.payload), ...state.clubs];
                state.totalClubs += 1;
                state.successMessage = 'Club created successfully';
            })
            .addCase(createClubAsync.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateClubAsync.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateClubAsync.fulfilled, (state, action) => {
                state.isUpdating = false;
                const normalized = normalizeClub(action.payload);
                const idx = state.clubs.findIndex((c) => c.id === normalized.id);
                if (idx !== -1) state.clubs[idx] = normalized;
                if (state.selectedClub?.id === normalized.id) state.selectedClub = normalized;
                state.successMessage = 'Club updated successfully';
            })
            .addCase(updateClubAsync.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteClubAsync.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteClubAsync.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.clubs = state.clubs.filter((c) => c.id !== action.payload);
                state.totalClubs -= 1;
                state.successMessage = 'Club deleted successfully';
            })
            .addCase(deleteClubAsync.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(toggleRegistrationAsync.fulfilled, (state, action) => {
                const club = state.clubs.find((c) => c.id === action.payload);
                if (club) {
                    club.registrationOpen = !club.registrationOpen;
                    if (club.isRegistrationOpen !== undefined) club.isRegistrationOpen = club.registrationOpen;
                }
                if (state.selectedClub?.id === action.payload) {
                    state.selectedClub.registrationOpen = !state.selectedClub.registrationOpen;
                    if (state.selectedClub.isRegistrationOpen !== undefined) state.selectedClub.isRegistrationOpen = state.selectedClub.registrationOpen;
                }
                state.successMessage = 'Registration toggled successfully';
            })
            .addCase(toggleRegistrationAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Memberships
        // ----------------------------------------------------------------
        builder
            .addCase(joinClubAsync.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(joinClubAsync.fulfilled, (state) => {
                state.isMembershipLoading = false;
                state.successMessage = 'Join request submitted successfully';
            })
            .addCase(joinClubAsync.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchMyMemberships.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(fetchMyMemberships.fulfilled, (state, action) => {
                state.isMembershipLoading = false;
                state.myMemberships = normalizeMemberships(action.payload.data.content);
            })
            .addCase(fetchMyMemberships.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(leaveClubAsync.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(leaveClubAsync.fulfilled, (state, action) => {
                state.isMembershipLoading = false;
                state.myMemberships = state.myMemberships.filter((m) => m.clubId !== action.payload);
                state.successMessage = 'Left club successfully';
            })
            .addCase(leaveClubAsync.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchClubMembers.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(fetchClubMembers.fulfilled, (state, action) => {
                state.isMembershipLoading = false;
                state.clubMembers = normalizeMemberships(action.payload.data.content);
                state.totalMembers = action.payload.data.totalElements;
            })
            .addCase(fetchClubMembers.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchPendingMembers.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(fetchPendingMembers.fulfilled, (state, action) => {
                state.isMembershipLoading = false;
                state.pendingMembers = normalizeMemberships(action.payload.data.content);
                state.totalPendingMembers = action.payload.data.totalElements;
            })
            .addCase(fetchPendingMembers.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(approveMembershipAsync.fulfilled, (state, action) => {
                state.pendingMembers = state.pendingMembers.filter((m) => m.id !== action.payload);
                state.totalPendingMembers -= 1;
                state.successMessage = 'Membership approved';
            })
            .addCase(approveMembershipAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(rejectMembershipAsync.fulfilled, (state, action) => {
                state.pendingMembers = state.pendingMembers.filter((m) => m.id !== action.payload);
                state.totalPendingMembers -= 1;
                state.successMessage = 'Membership rejected';
            })
            .addCase(rejectMembershipAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(suspendMembershipAsync.fulfilled, (state, action) => {
                const member = state.clubMembers.find((m) => m.id === action.payload);
                if (member) member.status = 'SUSPENDED';
                state.successMessage = 'Member suspended';
            })
            .addCase(suspendMembershipAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(bulkApproveAsync.fulfilled, (state, action) => {
                const ids = new Set(action.payload);
                state.pendingMembers = state.pendingMembers.filter((m) => !ids.has(m.id));
                state.totalPendingMembers -= action.payload.length;
                state.successMessage = `${action.payload.length} members approved`;
            })
            .addCase(bulkApproveAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(changePositionAsync.fulfilled, (state) => {
                state.successMessage = 'Position changed successfully';
            })
            .addCase(changePositionAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Announcements
        // ----------------------------------------------------------------
        builder
            .addCase(fetchAnnouncementsByClub.pending, (state) => {
                state.isAnnouncementLoading = true;
                state.error = null;
            })
            .addCase(fetchAnnouncementsByClub.fulfilled, (state, action) => {
                state.isAnnouncementLoading = false;
                state.announcements = normalizeAnnouncements(action.payload.data.content);
                state.totalAnnouncements = action.payload.data.totalElements;
            })
            .addCase(fetchAnnouncementsByClub.rejected, (state, action) => {
                state.isAnnouncementLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchPublicAnnouncements.pending, (state) => {
                state.isAnnouncementLoading = true;
                state.error = null;
            })
            .addCase(fetchPublicAnnouncements.fulfilled, (state, action) => {
                state.isAnnouncementLoading = false;
                state.announcements = normalizeAnnouncements(action.payload.data.content);
                state.totalAnnouncements = action.payload.data.totalElements;
            })
            .addCase(fetchPublicAnnouncements.rejected, (state, action) => {
                state.isAnnouncementLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(createAnnouncementAsync.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createAnnouncementAsync.fulfilled, (state, action) => {
                state.isCreating = false;
                state.announcements = [normalizeAnnouncement(action.payload), ...state.announcements];
                state.totalAnnouncements += 1;
                state.successMessage = 'Announcement created successfully';
            })
            .addCase(createAnnouncementAsync.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateAnnouncementAsync.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateAnnouncementAsync.fulfilled, (state, action) => {
                state.isUpdating = false;
                const normalized = normalizeAnnouncement(action.payload);
                const idx = state.announcements.findIndex((a) => a.id === normalized.id);
                if (idx !== -1) state.announcements[idx] = normalized;
                state.successMessage = 'Announcement updated successfully';
            })
            .addCase(updateAnnouncementAsync.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteAnnouncementAsync.fulfilled, (state, action) => {
                state.announcements = state.announcements.filter((a) => a.id !== action.payload);
                state.totalAnnouncements -= 1;
                state.successMessage = 'Announcement deleted';
            })
            .addCase(deleteAnnouncementAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(pinAnnouncementAsync.fulfilled, (state, action) => {
                const ann = state.announcements.find((a) => a.id === action.payload);
                if (ann) ann.isPinned = true;
                state.successMessage = 'Announcement pinned';
            })
            .addCase(pinAnnouncementAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(unpinAnnouncementAsync.fulfilled, (state, action) => {
                const ann = state.announcements.find((a) => a.id === action.payload);
                if (ann) ann.isPinned = false;
                state.successMessage = 'Announcement unpinned';
            })
            .addCase(unpinAnnouncementAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Elections
        // ----------------------------------------------------------------
        builder
            .addCase(fetchClubElections.pending, (state) => {
                state.isElectionLoading = true;
                state.error = null;
            })
            .addCase(fetchClubElections.fulfilled, (state, action) => {
                state.isElectionLoading = false;
                state.elections = action.payload.data.content;
                state.totalElections = action.payload.data.totalElements;
            })
            .addCase(fetchClubElections.rejected, (state, action) => {
                state.isElectionLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchActiveElections.pending, (state) => {
                state.isElectionLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveElections.fulfilled, (state, action) => {
                state.isElectionLoading = false;
                state.activeElections = action.payload.data.content;
            })
            .addCase(fetchActiveElections.rejected, (state, action) => {
                state.isElectionLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchElectionDetails.pending, (state) => {
                state.isElectionLoading = true;
                state.error = null;
            })
            .addCase(fetchElectionDetails.fulfilled, (state, action) => {
                state.isElectionLoading = false;
                state.selectedElection = action.payload;
            })
            .addCase(fetchElectionDetails.rejected, (state, action) => {
                state.isElectionLoading = false;
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Statistics & Activity Logs
        // ----------------------------------------------------------------
        builder
            .addCase(fetchClubStatistics.pending, (state) => {
                state.isStatsLoading = true;
                state.error = null;
            })
            .addCase(fetchClubStatistics.fulfilled, (state, action) => {
                state.isStatsLoading = false;
                state.clubStatistics = action.payload;
            })
            .addCase(fetchClubStatistics.rejected, (state, action) => {
                state.isStatsLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchActivityLogs.pending, (state) => {
                state.isActivityLogLoading = true;
                state.error = null;
            })
            .addCase(fetchActivityLogs.fulfilled, (state, action) => {
                state.isActivityLogLoading = false;
                state.activityLogs = action.payload.data.content;
                state.totalActivityLogs = action.payload.data.totalElements;
            })
            .addCase(fetchActivityLogs.rejected, (state, action) => {
                state.isActivityLogLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchActivityLogsByType.pending, (state) => {
                state.isActivityLogLoading = true;
                state.error = null;
            })
            .addCase(fetchActivityLogsByType.fulfilled, (state, action) => {
                state.isActivityLogLoading = false;
                state.activityLogs = action.payload.data.content;
                state.totalActivityLogs = action.payload.data.totalElements;
            })
            .addCase(fetchActivityLogsByType.rejected, (state, action) => {
                state.isActivityLogLoading = false;
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Additional Services
        // ----------------------------------------------------------------

        // Fetch club by code
        builder
            .addCase(fetchClubByCode.pending, (state) => {
                state.isClubLoading = true;
                state.error = null;
            })
            .addCase(fetchClubByCode.fulfilled, (state, action) => {
                state.isClubLoading = false;
                const club = normalizeClub(action.payload);
                state.selectedClub = club;
                // Also put the result into the clubs list so search-by-code shows in the list
                state.clubs = [club];
                state.totalClubs = 1;
            })
            .addCase(fetchClubByCode.rejected, (state, action) => {
                state.isClubLoading = false;
                state.error = action.payload as string;
            });

        // Fetch active members
        builder
            .addCase(fetchActiveMembers.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveMembers.fulfilled, (state, action) => {
                state.isMembershipLoading = false;
                state.activeMembers = normalizeMemberships(action.payload.data.content);
                state.totalActiveMembers = action.payload.data.totalElements;
            })
            .addCase(fetchActiveMembers.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        // Fetch membership by ID
        builder
            .addCase(fetchMembershipById.pending, (state) => {
                state.isMembershipLoading = true;
                state.error = null;
            })
            .addCase(fetchMembershipById.fulfilled, (state, action) => {
                state.isMembershipLoading = false;
                state.selectedMembership = normalizeMembership(action.payload);
            })
            .addCase(fetchMembershipById.rejected, (state, action) => {
                state.isMembershipLoading = false;
                state.error = action.payload as string;
            });

        // Fetch pinned announcements
        builder
            .addCase(fetchPinnedAnnouncements.pending, (state) => {
                state.isAnnouncementLoading = true;
                state.error = null;
            })
            .addCase(fetchPinnedAnnouncements.fulfilled, (state, action) => {
                state.isAnnouncementLoading = false;
                state.pinnedAnnouncements = normalizeAnnouncements(action.payload.data.content);
                state.totalPinnedAnnouncements = action.payload.data.totalElements;
            })
            .addCase(fetchPinnedAnnouncements.rejected, (state, action) => {
                state.isAnnouncementLoading = false;
                state.error = action.payload as string;
            });

        // Search announcements
        builder
            .addCase(searchAnnouncementsAsync.pending, (state) => {
                state.isAnnouncementLoading = true;
                state.error = null;
            })
            .addCase(searchAnnouncementsAsync.fulfilled, (state, action) => {
                state.isAnnouncementLoading = false;
                state.announcements = normalizeAnnouncements(action.payload.data.content);
                state.totalAnnouncements = action.payload.data.totalElements;
            })
            .addCase(searchAnnouncementsAsync.rejected, (state, action) => {
                state.isAnnouncementLoading = false;
                state.error = action.payload as string;
            });

        // Fetch announcement by ID
        builder
            .addCase(fetchAnnouncementById.pending, (state) => {
                state.isAnnouncementLoading = true;
                state.error = null;
            })
            .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
                state.isAnnouncementLoading = false;
                state.selectedAnnouncement = normalizeAnnouncement(action.payload);
            })
            .addCase(fetchAnnouncementById.rejected, (state, action) => {
                state.isAnnouncementLoading = false;
                state.error = action.payload as string;
            });

        // Fetch election by ID
        builder
            .addCase(fetchElectionById.pending, (state) => {
                state.isElectionLoading = true;
                state.error = null;
            })
            .addCase(fetchElectionById.fulfilled, (state, action) => {
                state.isElectionLoading = false;
                state.selectedElection = action.payload;
            })
            .addCase(fetchElectionById.rejected, (state, action) => {
                state.isElectionLoading = false;
                state.error = action.payload as string;
            });

        // Fetch admin club stats
        builder
            .addCase(fetchAdminClubStats.pending, (state) => {
                state.isAdminStatsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminClubStats.fulfilled, (state, action) => {
                state.isAdminStatsLoading = false;
                state.adminClubStatistics = action.payload;
            })
            .addCase(fetchAdminClubStats.rejected, (state, action) => {
                state.isAdminStatsLoading = false;
                state.error = action.payload as string;
            });

        // Fetch admin club statistics (officer view)
        builder
            .addCase(fetchAdminClubStatisticsOfficer.pending, (state) => {
                state.isAdminStatsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminClubStatisticsOfficer.fulfilled, (state, action) => {
                state.isAdminStatsLoading = false;
                state.adminClubStatistics = action.payload;
            })
            .addCase(fetchAdminClubStatisticsOfficer.rejected, (state, action) => {
                state.isAdminStatsLoading = false;
                state.error = action.payload as string;
            });

        // Admin toggle registration
        builder
            .addCase(adminToggleRegistrationAsync.fulfilled, (state, action) => {
                const club = state.clubs.find((c) => c.id === action.payload);
                if (club) {
                    club.registrationOpen = !club.registrationOpen;
                    if (club.isRegistrationOpen !== undefined) club.isRegistrationOpen = club.registrationOpen;
                }
                if (state.selectedClub?.id === action.payload) {
                    state.selectedClub.registrationOpen = !state.selectedClub.registrationOpen;
                    if (state.selectedClub.isRegistrationOpen !== undefined) state.selectedClub.isRegistrationOpen = state.selectedClub.registrationOpen;
                }
                state.successMessage = 'Registration toggled successfully (admin)';
            })
            .addCase(adminToggleRegistrationAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Super Admin — Permanent Delete Club
        // ----------------------------------------------------------------
        builder
            .addCase(permanentDeleteClubAsync.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(permanentDeleteClubAsync.fulfilled, (state, action) => {
                state.isDeleting = false;
                const id = action.payload.id;
                state.clubs = state.clubs.filter((c) => c.id !== id);
                if (state.selectedClub?.id === id) state.selectedClub = null;
                state.totalClubs = Math.max(0, state.totalClubs - 1);
                state.successMessage = action.payload.response?.message || 'Club permanently deleted';
            })
            .addCase(permanentDeleteClubAsync.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload as string;
            });

        // ----------------------------------------------------------------
        // Super Admin — Permanent Delete Announcement
        // ----------------------------------------------------------------
        builder
            .addCase(permanentDeleteAnnouncementAsync.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(permanentDeleteAnnouncementAsync.fulfilled, (state, action) => {
                state.isDeleting = false;
                const id = action.payload.id;
                state.announcements = state.announcements.filter((a) => a.id !== id);
                state.pinnedAnnouncements = state.pinnedAnnouncements.filter((a) => a.id !== id);
                if (state.selectedAnnouncement?.id === id) state.selectedAnnouncement = null;
                state.totalAnnouncements = Math.max(0, state.totalAnnouncements - 1);
                state.successMessage = action.payload.response?.message || 'Announcement permanently deleted';
            })
            .addCase(permanentDeleteAnnouncementAsync.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload as string;
            });
    },
});

// ============================================================================
// Actions
// ============================================================================

export const {
    clearClubError,
    clearClubSuccessMessage,
    setClubPage,
    setClubPageSize,
    clearSelectedClub,
    clearSelectedAnnouncement,
    clearSelectedElection,
    clearSelectedMembership,
    clearPinnedAnnouncements,
    clearActiveMembers,
    clearAdminClubStatistics,
} = clubSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectClubs = (state: { club: ClubState }) => state.club.clubs;
export const selectSelectedClub = (state: { club: ClubState }) => state.club.selectedClub;
export const selectTotalClubs = (state: { club: ClubState }) => state.club.totalClubs;

export const selectMyMemberships = (state: { club: ClubState }) => state.club.myMemberships;
export const selectClubMembers = (state: { club: ClubState }) => state.club.clubMembers;
export const selectActiveMembers = (state: { club: ClubState }) => state.club.activeMembers;
export const selectPendingMembers = (state: { club: ClubState }) => state.club.pendingMembers;
export const selectSelectedMembership = (state: { club: ClubState }) => state.club.selectedMembership;
export const selectTotalMembers = (state: { club: ClubState }) => state.club.totalMembers;
export const selectTotalActiveMembers = (state: { club: ClubState }) => state.club.totalActiveMembers;
export const selectTotalPendingMembers = (state: { club: ClubState }) => state.club.totalPendingMembers;

export const selectAnnouncements = (state: { club: ClubState }) => state.club.announcements;
export const selectPinnedAnnouncements = (state: { club: ClubState }) => state.club.pinnedAnnouncements;
export const selectSelectedAnnouncement = (state: { club: ClubState }) => state.club.selectedAnnouncement;
export const selectTotalAnnouncements = (state: { club: ClubState }) => state.club.totalAnnouncements;
export const selectTotalPinnedAnnouncements = (state: { club: ClubState }) => state.club.totalPinnedAnnouncements;

export const selectElections = (state: { club: ClubState }) => state.club.elections;
export const selectActiveElections = (state: { club: ClubState }) => state.club.activeElections;
export const selectSelectedElection = (state: { club: ClubState }) => state.club.selectedElection;
export const selectTotalElections = (state: { club: ClubState }) => state.club.totalElections;

export const selectClubStatistics = (state: { club: ClubState }) => state.club.clubStatistics;
export const selectAdminClubStatistics = (state: { club: ClubState }) => state.club.adminClubStatistics;

export const selectActivityLogs = (state: { club: ClubState }) => state.club.activityLogs;
export const selectTotalActivityLogs = (state: { club: ClubState }) => state.club.totalActivityLogs;

export const selectClubCurrentPage = (state: { club: ClubState }) => state.club.currentPage;
export const selectClubPageSize = (state: { club: ClubState }) => state.club.pageSize;

export const selectClubIsLoading = (state: { club: ClubState }) => state.club.isLoading;
export const selectClubIsClubLoading = (state: { club: ClubState }) => state.club.isClubLoading;
export const selectClubIsMembershipLoading = (state: { club: ClubState }) => state.club.isMembershipLoading;
export const selectClubIsAnnouncementLoading = (state: { club: ClubState }) => state.club.isAnnouncementLoading;
export const selectClubIsElectionLoading = (state: { club: ClubState }) => state.club.isElectionLoading;
export const selectClubIsStatsLoading = (state: { club: ClubState }) => state.club.isStatsLoading;
export const selectClubIsAdminStatsLoading = (state: { club: ClubState }) => state.club.isAdminStatsLoading;
export const selectClubIsActivityLogLoading = (state: { club: ClubState }) => state.club.isActivityLogLoading;
export const selectClubIsCreating = (state: { club: ClubState }) => state.club.isCreating;
export const selectClubIsUpdating = (state: { club: ClubState }) => state.club.isUpdating;
export const selectClubIsDeleting = (state: { club: ClubState }) => state.club.isDeleting;

export const selectClubError = (state: { club: ClubState }) => state.club.error;
export const selectClubSuccessMessage = (state: { club: ClubState }) => state.club.successMessage;

export default clubSlice.reducer;


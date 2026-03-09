/**
 * @fileoverview Club Custom Hook
 * @description Reusable hook for club module state and actions
 */
'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { useRole } from './useRole';
import {
    // Selectors
    selectClubs,
    selectSelectedClub,
    selectTotalClubs,
    selectMyMemberships,
    selectClubMembers,
    selectActiveMembers,
    selectPendingMembers,
    selectSelectedMembership,
    selectTotalMembers,
    selectTotalActiveMembers,
    selectTotalPendingMembers,
    selectAnnouncements,
    selectPinnedAnnouncements,
    selectSelectedAnnouncement,
    selectTotalAnnouncements,
    selectTotalPinnedAnnouncements,
    selectElections,
    selectActiveElections,
    selectSelectedElection,
    selectTotalElections,
    selectClubStatistics,
    selectAdminClubStatistics,
    selectActivityLogs,
    selectTotalActivityLogs,
    selectClubIsClubLoading,
    selectClubIsMembershipLoading,
    selectClubIsAnnouncementLoading,
    selectClubIsElectionLoading,
    selectClubIsStatsLoading,
    selectClubIsAdminStatsLoading,
    selectClubIsActivityLogLoading,
    selectClubIsCreating,
    selectClubIsUpdating,
    selectClubIsDeleting,
    selectClubError,
    selectClubSuccessMessage,
    // Thunks
    fetchClubs,
    fetchClubById,
    fetchClubByCode,
    searchClubsAsync,
    fetchClubsByFaculty,
    fetchOpenRegistrationClubs,
    createClubAsync,
    updateClubAsync,
    deleteClubAsync,
    toggleRegistrationAsync,
    joinClubAsync,
    fetchMyMemberships,
    leaveClubAsync,
    fetchClubMembers,
    fetchActiveMembers,
    fetchPendingMembers,
    fetchMembershipById,
    approveMembershipAsync,
    rejectMembershipAsync,
    suspendMembershipAsync,
    bulkApproveAsync,
    changePositionAsync,
    fetchAnnouncementsByClub,
    fetchPublicAnnouncements,
    fetchPinnedAnnouncements,
    searchAnnouncementsAsync,
    fetchAnnouncementById,
    createAnnouncementAsync,
    updateAnnouncementAsync,
    deleteAnnouncementAsync,
    pinAnnouncementAsync,
    unpinAnnouncementAsync,
    fetchClubElections,
    fetchActiveElections,
    fetchUpcomingElections,
    fetchElectionDetails,
    fetchElectionById,
    fetchClubStatistics,
    fetchAdminClubStats,
    fetchAdminClubStatisticsOfficer,
    adminToggleRegistrationAsync,
    fetchActivityLogs,
    fetchActivityLogsByType,
    // Actions
    clearClubError,
    clearClubSuccessMessage,
    clearSelectedClub,
    clearSelectedAnnouncement,
    clearSelectedElection,
    clearSelectedMembership,
    clearPinnedAnnouncements,
    clearActiveMembers,
    clearAdminClubStatistics,
} from '@/features/club/clubSlice';
import {
    CLUB_FEATURES,
    isOfficerPosition,
} from '@/features/club/permissions';
import type {
    ClubPaginationParams,
    ClubSearchParams,
    CreateClubRequest,
    UpdateClubRequest,
    JoinClubRequest,
    ChangePositionRequest,
    ActivityLogType,
} from '@/features/club/types';

export function useClub() {
    const dispatch = useAppDispatch();
    const { role } = useRole();

    // ---- Selectors ----
    const clubs = useAppSelector(selectClubs);
    const selectedClub = useAppSelector(selectSelectedClub);
    const totalClubs = useAppSelector(selectTotalClubs);
    const myMemberships = useAppSelector(selectMyMemberships);
    const clubMembers = useAppSelector(selectClubMembers);
    const activeMembers = useAppSelector(selectActiveMembers);
    const pendingMembers = useAppSelector(selectPendingMembers);
    const selectedMembership = useAppSelector(selectSelectedMembership);
    const totalMembers = useAppSelector(selectTotalMembers);
    const totalActiveMembers = useAppSelector(selectTotalActiveMembers);
    const totalPendingMembers = useAppSelector(selectTotalPendingMembers);
    const announcements = useAppSelector(selectAnnouncements);
    const pinnedAnnouncements = useAppSelector(selectPinnedAnnouncements);
    const selectedAnnouncement = useAppSelector(selectSelectedAnnouncement);
    const totalAnnouncements = useAppSelector(selectTotalAnnouncements);
    const totalPinnedAnnouncements = useAppSelector(selectTotalPinnedAnnouncements);
    const elections = useAppSelector(selectElections);
    const activeElections = useAppSelector(selectActiveElections);
    const selectedElection = useAppSelector(selectSelectedElection);
    const totalElections = useAppSelector(selectTotalElections);
    const clubStatistics = useAppSelector(selectClubStatistics);
    const adminClubStatistics = useAppSelector(selectAdminClubStatistics);
    const activityLogs = useAppSelector(selectActivityLogs);
    const totalActivityLogs = useAppSelector(selectTotalActivityLogs);

    // Loading
    const isClubLoading = useAppSelector(selectClubIsClubLoading);
    const isMembershipLoading = useAppSelector(selectClubIsMembershipLoading);
    const isAnnouncementLoading = useAppSelector(selectClubIsAnnouncementLoading);
    const isElectionLoading = useAppSelector(selectClubIsElectionLoading);
    const isStatsLoading = useAppSelector(selectClubIsStatsLoading);
    const isAdminStatsLoading = useAppSelector(selectClubIsAdminStatsLoading);
    const isActivityLogLoading = useAppSelector(selectClubIsActivityLogLoading);
    const isCreating = useAppSelector(selectClubIsCreating);
    const isUpdating = useAppSelector(selectClubIsUpdating);
    const isDeleting = useAppSelector(selectClubIsDeleting);
    const error = useAppSelector(selectClubError);
    const successMessage = useAppSelector(selectClubSuccessMessage);

    // ---- Permissions ----
    const isOfficerInClub = useCallback(
        (clubId: number): boolean => {
            const membership = myMemberships.find((m) => m.clubId === clubId && m.status === 'ACTIVE');
            return membership ? isOfficerPosition(membership.position) : false;
        },
        [myMemberships],
    );

    const isMemberOfClub = useCallback(
        (clubId: number): boolean => {
            return myMemberships.some((m) => m.clubId === clubId && m.status === 'ACTIVE');
        },
        [myMemberships],
    );

    const permissions = useMemo(() => {
        if (!role) return null;
        return {
            canViewClubs: CLUB_FEATURES.canViewClubs(role),
            canJoinClub: CLUB_FEATURES.canJoinClub(role),
            canCreateClub: CLUB_FEATURES.canCreateClub(role),
            canDeleteClub: CLUB_FEATURES.canDeleteClub(role),
            canManageElections: CLUB_FEATURES.canManageElections(role),
            canVote: CLUB_FEATURES.canVote(role),
            canBulkApprove: CLUB_FEATURES.canBulkApprove(role),
            canChangePosition: CLUB_FEATURES.canChangePosition(role),
            canUpdateClub: (isOfficer = false) => CLUB_FEATURES.canUpdateClub(role, isOfficer),
            canManageMembers: (isOfficer = false) => CLUB_FEATURES.canManageMembers(role, isOfficer),
            canCreateAnnouncement: (isMember = false) => CLUB_FEATURES.canCreateAnnouncement(role, isMember),
            canViewAnnouncements: CLUB_FEATURES.canViewAnnouncements(role),
            canNominate: (isMember = false) => CLUB_FEATURES.canNominate(role, isMember),
            canViewStats: (isOfficer = false) => CLUB_FEATURES.canViewStats(role, isOfficer),
            canViewActivityLogs: (isOfficer = false) => CLUB_FEATURES.canViewActivityLogs(role, isOfficer),
        };
    }, [role]);

    // ---- Dispatchers ----
    const loadClubs = useCallback((params: ClubPaginationParams = {}) => dispatch(fetchClubs(params)), [dispatch]);
    const loadClubById = useCallback((id: number) => dispatch(fetchClubById(id)), [dispatch]);
    const loadClubByCode = useCallback((code: string) => dispatch(fetchClubByCode(code)), [dispatch]);
    const searchClubs = useCallback((params: ClubSearchParams) => dispatch(searchClubsAsync(params)), [dispatch]);
    const loadClubsByFaculty = useCallback(
        (faculty: string, params?: ClubPaginationParams) => dispatch(fetchClubsByFaculty({ faculty, params })),
        [dispatch],
    );
    const loadOpenRegistrationClubs = useCallback(
        (params: ClubPaginationParams = {}) => dispatch(fetchOpenRegistrationClubs(params)),
        [dispatch],
    );
    const createClub = useCallback(
        (data: CreateClubRequest, logo?: File) => dispatch(createClubAsync({ data, logo })),
        [dispatch],
    );
    const updateClub = useCallback(
        (id: number, data: UpdateClubRequest, logo?: File) => dispatch(updateClubAsync({ id, data, logo })),
        [dispatch],
    );
    const removeClub = useCallback((id: number) => dispatch(deleteClubAsync(id)), [dispatch]);
    const toggleReg = useCallback((id: number) => dispatch(toggleRegistrationAsync(id)), [dispatch]);

    // Memberships
    const joinClub = useCallback((data: JoinClubRequest) => dispatch(joinClubAsync(data)), [dispatch]);
    const loadMyMemberships = useCallback((params: ClubPaginationParams = {}) => dispatch(fetchMyMemberships(params)), [dispatch]);
    const leaveClub = useCallback((clubId: number) => dispatch(leaveClubAsync(clubId)), [dispatch]);
    const loadClubMembers = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchClubMembers({ clubId, params })),
        [dispatch],
    );
    const loadActiveMembers = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchActiveMembers({ clubId, params })),
        [dispatch],
    );
    const loadPendingMembers = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchPendingMembers({ clubId, params })),
        [dispatch],
    );
    const loadMembershipById = useCallback(
        (id: number) => dispatch(fetchMembershipById(id)),
        [dispatch],
    );
    const approveMember = useCallback((membershipId: number) => dispatch(approveMembershipAsync(membershipId)), [dispatch]);
    const rejectMember = useCallback(
        (membershipId: number, reason?: string) => dispatch(rejectMembershipAsync({ membershipId, reason })),
        [dispatch],
    );
    const suspendMember = useCallback(
        (membershipId: number, reason?: string) => dispatch(suspendMembershipAsync({ membershipId, reason })),
        [dispatch],
    );
    const bulkApproveMembers = useCallback(
        (clubId: number, membershipIds: number[]) => dispatch(bulkApproveAsync({ clubId, membershipIds })),
        [dispatch],
    );
    const changePosition = useCallback(
        (data: ChangePositionRequest) => dispatch(changePositionAsync(data)),
        [dispatch],
    );

    // Announcements
    const loadAnnouncements = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchAnnouncementsByClub({ clubId, params })),
        [dispatch],
    );
    const loadPublicAnnouncements = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchPublicAnnouncements({ clubId, params })),
        [dispatch],
    );
    const loadPinnedAnnouncements = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchPinnedAnnouncements({ clubId, params })),
        [dispatch],
    );
    const searchAnnouncementsAction = useCallback(
        (params: ClubSearchParams) => dispatch(searchAnnouncementsAsync(params)),
        [dispatch],
    );
    const loadAnnouncementById = useCallback(
        (id: number) => dispatch(fetchAnnouncementById(id)),
        [dispatch],
    );
    const createAnnouncement = useCallback(
        (formData: FormData) => dispatch(createAnnouncementAsync(formData)),
        [dispatch],
    );
    const updateAnnouncement = useCallback(
        (id: number, formData: FormData) => dispatch(updateAnnouncementAsync({ id, formData })),
        [dispatch],
    );
    const removeAnnouncement = useCallback((id: number) => dispatch(deleteAnnouncementAsync(id)), [dispatch]);
    const pinAnnouncement = useCallback((id: number) => dispatch(pinAnnouncementAsync(id)), [dispatch]);
    const unpinAnnouncement = useCallback((id: number) => dispatch(unpinAnnouncementAsync(id)), [dispatch]);

    // Elections
    const loadElections = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchClubElections({ clubId, params })),
        [dispatch],
    );
    const loadActiveElections = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchActiveElections({ clubId, params })),
        [dispatch],
    );
    const loadUpcomingElections = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchUpcomingElections({ clubId, params })),
        [dispatch],
    );
    const loadElectionDetails = useCallback(
        (electionId: number) => dispatch(fetchElectionDetails(electionId)),
        [dispatch],
    );
    const loadElectionById = useCallback(
        (electionId: number) => dispatch(fetchElectionById(electionId)),
        [dispatch],
    );

    // Stats & logs
    const loadClubStatistics = useCallback((clubId: number) => dispatch(fetchClubStatistics(clubId)), [dispatch]);
    const loadAdminClubStats = useCallback((clubId: number) => dispatch(fetchAdminClubStats(clubId)), [dispatch]);
    const loadAdminClubStatisticsOfficer = useCallback((clubId: number) => dispatch(fetchAdminClubStatisticsOfficer(clubId)), [dispatch]);
    const adminToggleReg = useCallback((clubId: number) => dispatch(adminToggleRegistrationAsync(clubId)), [dispatch]);
    const loadActivityLogs = useCallback(
        (clubId: number, params?: ClubPaginationParams) => dispatch(fetchActivityLogs({ clubId, params })),
        [dispatch],
    );
    const loadActivityLogsByType = useCallback(
        (clubId: number, type: ActivityLogType, params?: ClubPaginationParams) =>
            dispatch(fetchActivityLogsByType({ clubId, type, params })),
        [dispatch],
    );

    // Utility
    const clearError = useCallback(() => dispatch(clearClubError()), [dispatch]);
    const clearSuccess = useCallback(() => dispatch(clearClubSuccessMessage()), [dispatch]);
    const resetSelectedClub = useCallback(() => dispatch(clearSelectedClub()), [dispatch]);
    const resetSelectedAnnouncement = useCallback(() => dispatch(clearSelectedAnnouncement()), [dispatch]);
    const resetSelectedElection = useCallback(() => dispatch(clearSelectedElection()), [dispatch]);
    const resetSelectedMembership = useCallback(() => dispatch(clearSelectedMembership()), [dispatch]);
    const resetPinnedAnnouncements = useCallback(() => dispatch(clearPinnedAnnouncements()), [dispatch]);
    const resetActiveMembers = useCallback(() => dispatch(clearActiveMembers()), [dispatch]);
    const resetAdminClubStatistics = useCallback(() => dispatch(clearAdminClubStatistics()), [dispatch]);

    return {
        // State
        clubs,
        selectedClub,
        totalClubs,
        myMemberships,
        clubMembers,
        activeMembers,
        pendingMembers,
        selectedMembership,
        totalMembers,
        totalActiveMembers,
        totalPendingMembers,
        announcements,
        pinnedAnnouncements,
        selectedAnnouncement,
        totalAnnouncements,
        totalPinnedAnnouncements,
        elections,
        activeElections,
        selectedElection,
        totalElections,
        clubStatistics,
        adminClubStatistics,
        activityLogs,
        totalActivityLogs,

        // Loading
        isClubLoading,
        isMembershipLoading,
        isAnnouncementLoading,
        isElectionLoading,
        isStatsLoading,
        isAdminStatsLoading,
        isActivityLogLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        successMessage,

        // Permissions
        permissions,
        isOfficerInClub,
        isMemberOfClub,

        // Club actions
        loadClubs,
        loadClubById,
        loadClubByCode,
        searchClubs,
        loadClubsByFaculty,
        loadOpenRegistrationClubs,
        createClub,
        updateClub,
        removeClub,
        toggleReg,

        // Membership actions
        joinClub,
        loadMyMemberships,
        leaveClub,
        loadClubMembers,
        loadActiveMembers,
        loadPendingMembers,
        loadMembershipById,
        approveMember,
        rejectMember,
        suspendMember,
        bulkApproveMembers,
        changePosition,

        // Announcement actions
        loadAnnouncements,
        loadPublicAnnouncements,
        loadPinnedAnnouncements,
        searchAnnouncementsAction,
        loadAnnouncementById,
        createAnnouncement,
        updateAnnouncement,
        removeAnnouncement,
        pinAnnouncement,
        unpinAnnouncement,

        // Election actions
        loadElections,
        loadActiveElections,
        loadUpcomingElections,
        loadElectionDetails,
        loadElectionById,

        // Stats & logs (admin)
        loadClubStatistics,
        loadAdminClubStats,
        loadAdminClubStatisticsOfficer,
        adminToggleReg,
        loadActivityLogs,
        loadActivityLogsByType,

        // Utility
        clearError,
        clearSuccess,
        resetSelectedClub,
        resetSelectedAnnouncement,
        resetSelectedElection,
        resetSelectedMembership,
        resetPinnedAnnouncements,
        resetActiveMembers,
        resetAdminClubStatistics,
    };
}


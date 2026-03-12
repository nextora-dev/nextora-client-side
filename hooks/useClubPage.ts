/**
 * @fileoverview Club Page Hook
 * @description Centralized hook for club page UI state & handlers (mirrors useKuppiPage)
 */
'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useClub } from './useClub';
import type { ClubResponse, AnnouncementResponse, ElectionResponse, ActivityLogType } from '@/features/club/types';

export type ClubPageRole = 'student' | 'admin' | 'non-academic' | 'academic' | 'super-admin';

interface UseClubPageOptions {
    role: ClubPageRole;
}

const ADMIN_ACTIVITY_LOG_TYPES: { label: string; value: ActivityLogType }[] = [
    { label: 'Club Created', value: 'CLUB_CREATED' },
    { label: 'Club Updated', value: 'CLUB_UPDATED' },
    { label: 'Club Deleted', value: 'CLUB_DELETED' },
    { label: 'Member Joined', value: 'MEMBER_JOINED' },
    { label: 'Member Approved', value: 'MEMBER_APPROVED' },
    { label: 'Member Rejected', value: 'MEMBER_REJECTED' },
    { label: 'Member Suspended', value: 'MEMBER_SUSPENDED' },
    { label: 'Position Changed', value: 'MEMBER_POSITION_CHANGED' },
    { label: 'Announcement Posted', value: 'ANNOUNCEMENT_POSTED' },
    { label: 'Election Created', value: 'ELECTION_CREATED' },
    { label: 'Bulk Approved', value: 'BULK_MEMBER_APPROVED' },
];

const SUPER_ADMIN_ACTIVITY_LOG_TYPES: { label: string; value: ActivityLogType }[] = [
    ...ADMIN_ACTIVITY_LOG_TYPES,
    { label: 'Registration Opened', value: 'CLUB_REGISTRATION_OPENED' },
    { label: 'Registration Closed', value: 'CLUB_REGISTRATION_CLOSED' },
    { label: 'Member Left', value: 'MEMBER_LEFT' },
    { label: 'Announcement Deleted', value: 'ANNOUNCEMENT_DELETED' },
    { label: 'Election Cancelled', value: 'ELECTION_CANCELLED' },
    { label: 'Results Published', value: 'ELECTION_RESULTS_PUBLISHED' },
    { label: 'Admin Override', value: 'ADMIN_OVERRIDE' },
];

export default function useClubPage({ role }: UseClubPageOptions) {
    const club = useClub();

    // ── UI State ──
    const [mainTab, setMainTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClub, setSelectedClub] = useState<ClubResponse | null>(null);
    const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

    // Dialogs
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

    // Targets
    const [selectedClubForJoin, setSelectedClubForJoin] = useState<ClubResponse | null>(null);
    const [clubToDelete, setClubToDelete] = useState<ClubResponse | null>(null);

    // Filters
    const [logTypeFilter, setLogTypeFilter] = useState('');

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // ── Derived ──
    const isAdmin = role === 'admin' || role === 'super-admin' || role === 'non-academic';
    const isStudent = role === 'student';
    const isReadOnly = role === 'academic';

    const memberClubIds = useMemo(
        () => club.myMemberships.filter((m) => m.status === 'ACTIVE').map((m) => m.clubId),
        [club.myMemberships],
    );

    const activeMemberships = useMemo(
        () => club.myMemberships.filter((m) => m.status === 'ACTIVE'),
        [club.myMemberships],
    );

    const pendingMemberships = useMemo(
        () => club.myMemberships.filter((m) => m.status === 'PENDING'),
        [club.myMemberships],
    );

    const activityLogTypes = role === 'super-admin' ? SUPER_ADMIN_ACTIVITY_LOG_TYPES : ADMIN_ACTIVITY_LOG_TYPES;

    // ── Initial Data Load ──
    useEffect(() => {
        club.loadClubs({ page: 0, size: 20 });
        if (isStudent) {
            club.loadMyMemberships({ page: 0, size: 50 });
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // ── Search debounce ──
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                club.searchClubs({ keyword: searchQuery, page: 0, size: 20 });
            } else {
                if (isStudent && mainTab === 1) {
                    club.loadOpenRegistrationClubs({ page: 0, size: 20 });
                } else {
                    club.loadClubs({ page: 0, size: 20 });
                }
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load club details when selected (admin modes) ──
    useEffect(() => {
        if (!selectedClub || isReadOnly) return;
        const id = selectedClub.id;

        if (isAdmin) {
            club.loadClubMembers(id, { page: 0, size: 20 });
            club.loadPendingMembers(id, { page: 0, size: 20 });
            club.loadAnnouncements(id, { page: 0, size: 20 });
            club.loadElections(id, { page: 0, size: 20 });
            club.loadActivityLogs(id, { page: 0, size: 20 });

            if (role === 'admin' || role === 'super-admin') {
                club.loadActiveMembers(id, { page: 0, size: 20 });
                club.loadPinnedAnnouncements(id, { page: 0, size: 20 });
                club.loadAdminClubStats(id);
            } else {
                club.loadClubStatistics(id);
            }
        }
    }, [selectedClub]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load club details for student drawer ──
    useEffect(() => {
        if (!selectedClubId || !isStudent) return;
        club.loadPublicAnnouncements(selectedClubId, { page: 0, size: 10 });
        club.loadPinnedAnnouncements(selectedClubId, { page: 0, size: 10 });
        club.loadElections(selectedClubId, { page: 0, size: 10 });
    }, [selectedClubId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Student open-registration tab
    useEffect(() => {
        if (isStudent && mainTab === 1 && !searchQuery.trim()) {
            club.loadOpenRegistrationClubs({ page: 0, size: 20 });
        }
    }, [mainTab]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Error/Success ──
    useEffect(() => {
        if (club.error) {
            setSnackbar({ open: true, message: club.error, severity: 'error' });
            club.clearError();
        }
        if (club.successMessage) {
            setSnackbar({ open: true, message: club.successMessage, severity: 'success' });
            club.clearSuccess();
        }
    }, [club.error, club.successMessage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers ──
    const handleMainTabChange = useCallback((_: React.SyntheticEvent, v: number) => {
        setMainTab(v);
    }, []);

    const handleRefresh = useCallback(() => {
        club.loadClubs({ page: 0, size: 20 });
        if (isStudent) club.loadMyMemberships({ page: 0, size: 50 });
        if (selectedClub && isAdmin) {
            const id = selectedClub.id;
            club.loadClubMembers(id, { page: 0, size: 20 });
            club.loadPendingMembers(id, { page: 0, size: 20 });
            club.loadAnnouncements(id, { page: 0, size: 20 });
            club.loadElections(id, { page: 0, size: 20 });
            club.loadActivityLogs(id, { page: 0, size: 20 });
        }
    }, [selectedClub, isStudent, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewClub = useCallback((c: ClubResponse) => {
        if (isStudent) {
            setSelectedClubId(c.id);
            setDetailDrawerOpen(true);
        } else {
            setSelectedClub(c);
            setMainTab(1);
        }
    }, [isStudent]);

    const handleJoinClick = useCallback((c: ClubResponse) => {
        setSelectedClubForJoin(c);
        setJoinDialogOpen(true);
    }, []);

    const handleJoinSubmit = useCallback((remarks: string) => {
        if (!selectedClubForJoin) return;
        club.joinClub({ clubId: selectedClubForJoin.id, remarks }).then(() => {
            setJoinDialogOpen(false);
            setSelectedClubForJoin(null);
            club.loadMyMemberships({ page: 0, size: 50 });
        });
    }, [selectedClubForJoin]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCreateClub = useCallback((data: any, logo?: File) => {
        club.createClub(data, logo).then(() => {
            setCreateDialogOpen(false);
            club.loadClubs({ page: 0, size: 20 });
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeleteClub = useCallback(() => {
        if (!clubToDelete) return;
        club.removeClub(clubToDelete.id).then(() => {
            setDeleteConfirmOpen(false);
            setClubToDelete(null);
            if (selectedClub?.id === clubToDelete.id) {
                setSelectedClub(null);
                setMainTab(0);
            }
        });
    }, [clubToDelete, selectedClub]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleBulkApprove = useCallback(() => {
        if (!selectedClub) return;
        const ids = club.pendingMembers.map((m) => m.id);
        if (ids.length > 0) club.bulkApproveMembers(selectedClub.id, ids);
    }, [selectedClub, club.pendingMembers]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLogTypeFilter = useCallback((type: string) => {
        setLogTypeFilter(type);
        if (selectedClub && type) {
            club.loadActivityLogsByType(selectedClub.id, type as ActivityLogType, { page: 0, size: 20 });
        } else if (selectedClub) {
            club.loadActivityLogs(selectedClub.id, { page: 0, size: 20 });
        }
    }, [selectedClub]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleRegistration = useCallback(() => {
        if (!selectedClub) return;
        if (role === 'admin' || role === 'super-admin') {
            club.adminToggleReg(selectedClub.id);
        } else {
            club.toggleReg(selectedClub.id);
        }
    }, [selectedClub, role]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleSearchClear = useCallback(() => {
        setSearchQuery('');
    }, []);

    return {
        // ── Club hook passthrough ──
        ...club,

        // ── Config ──
        role,
        isAdmin,
        isStudent,
        isReadOnly,
        activityLogTypes,

        // ── UI State ──
        mainTab,
        setMainTab,
        searchQuery,
        setSearchQuery,
        selectedClub,
        setSelectedClub,
        selectedClubId,
        setSelectedClubId,
        createDialogOpen,
        setCreateDialogOpen,
        joinDialogOpen,
        setJoinDialogOpen,
        viewDialogOpen,
        setViewDialogOpen,
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        detailDrawerOpen,
        setDetailDrawerOpen,
        selectedClubForJoin,
        setSelectedClubForJoin,
        clubToDelete,
        setClubToDelete,
        logTypeFilter,
        setLogTypeFilter,
        snackbar,
        setSnackbar,

        // ── Derived ──
        memberClubIds,
        activeMemberships,
        pendingMemberships,

        // ── Handlers ──
        handleMainTabChange,
        handleRefresh,
        handleViewClub,
        handleJoinClick,
        handleJoinSubmit,
        handleCreateClub,
        handleDeleteClub,
        handleBulkApprove,
        handleLogTypeFilter,
        handleToggleRegistration,
        handleSearch,
        handleSearchClear,
    };
}


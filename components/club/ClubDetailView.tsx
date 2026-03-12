'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    Stack,
    Chip,
    Card,
    CardContent,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    IconButton,
    Avatar,
    Divider,
    CircularProgress,
    Skeleton,
    TablePagination,
    Switch,
    FormControlLabel,
    alpha,
    useTheme,
    Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CampaignIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useClub } from '@/hooks/useClub';
import { MembershipTable } from '@/components/club/MembershipTable';
import { AnnouncementCard } from '@/components/club/AnnouncementCard';
import { ElectionCard } from '@/components/club/ElectionCard';
import { ActivityLogList } from '@/components/club/ActivityLogList';
import { MembershipActionDialog } from '@/components/club/MembershipActionDialog';
import type { MembershipActionType } from '@/components/club/MembershipActionDialog';
import type {
    ActivityLogType,
    MembershipResponse,
    AnnouncementResponse,
    UpdateClubRequest,
    ClubPosition,
} from '@/features/club/types';
import { FACULTY_LABELS } from '@/constants/faculty';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const ACTIVITY_LOG_TYPES: { label: string; value: ActivityLogType }[] = [
    { label: 'Club Created', value: 'CLUB_CREATED' },
    { label: 'Club Updated', value: 'CLUB_UPDATED' },
    { label: 'Member Joined', value: 'MEMBER_JOINED' },
    { label: 'Member Approved', value: 'MEMBER_APPROVED' },
    { label: 'Member Rejected', value: 'MEMBER_REJECTED' },
    { label: 'Member Suspended', value: 'MEMBER_SUSPENDED' },
    { label: 'Announcement Posted', value: 'ANNOUNCEMENT_POSTED' },
    { label: 'Election Created', value: 'ELECTION_CREATED' },
    { label: 'Bulk Approved', value: 'BULK_MEMBER_APPROVED' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25];

interface ClubDetailViewProps {
    clubId: number;
    backPath: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

export default function ClubDetailView({ clubId, backPath, isAdmin = false, isSuperAdmin = false }: ClubDetailViewProps) {
    const theme = useTheme();
    const router = useRouter();

    const {
        clubMembers,
        activeMembers,
        pendingMembers,
        totalMembers,
        totalActiveMembers,
        totalPendingMembers,
        announcements,
        totalAnnouncements,
        elections,
        totalElections,
        selectedAnnouncement,
        selectedElection,
        clubStatistics,
        adminClubStatistics,
        activityLogs,
        totalActivityLogs,
        isMembershipLoading,
        isAnnouncementLoading,
        isElectionLoading,
        isActivityLogLoading,
        isUpdating,
        isDeleting,
        error,
        successMessage,
        loadClubById,
        selectedClub,
        updateClub,
        removeClub,
        toggleReg,
        adminToggleReg,
        loadClubMembers,
        loadActiveMembers,
        loadPendingMembers,
        approveMember,
        rejectMember,
        suspendMember,
        bulkApproveMembers,
        loadAnnouncements,
        loadElections,
        loadActiveElections,
        loadUpcomingElections,
        activeElections,
        loadClubStatistics,
        loadAdminClubStats,
        loadAdminClubStatisticsOfficer,
        loadActivityLogs,
        loadActivityLogsByType,
        searchAnnouncementsAction,
        loadAnnouncementById,
        createAnnouncement,
        updateAnnouncement,
        removeAnnouncement,
        pinAnnouncement,
        unpinAnnouncement,
        changePosition,
        loadElectionDetails,
        loadElectionById,
        loadMembershipById,
        selectedMembership,
        resetSelectedAnnouncement,
        resetSelectedElection,
        resetSelectedMembership,
        resetPinnedAnnouncements,
        resetActiveMembers,
        resetAdminClubStatistics,
        clearError,
        clearSuccess,
        permanentDeleteClub,
        permanentDeleteAnnouncement,
    } = useClub();

    // ── Tab state ──
    const [mainTab, setMainTab] = useState(0);

    // ── Member sub-tab state ──
    const [memberSubTab, setMemberSubTab] = useState(0); // 0=All Members, 1=Active Members

    // ── Pagination state per tab ──
    const [membersPage, setMembersPage] = useState(0);
    const [membersPageSize, setMembersPageSize] = useState(10);
    const [activeMembersPage, setActiveMembersPage] = useState(0);
    const [activeMembersPageSize, setActiveMembersPageSize] = useState(10);
    const [pendingPage, setPendingPage] = useState(0);
    const [pendingPageSize, setPendingPageSize] = useState(10);
    const [announcementsPage, setAnnouncementsPage] = useState(0);
    const [announcementsPageSize, setAnnouncementsPageSize] = useState(10);
    const [electionsPage, setElectionsPage] = useState(0);
    const [electionsPageSize, setElectionsPageSize] = useState(10);
    const [logsPage, setLogsPage] = useState(0);
    const [logsPageSize, setLogsPageSize] = useState(10);

    // ── Election sub-tab state ──
    const [electionSubTab, setElectionSubTab] = useState(0); // 0=All, 1=Active, 2=Upcoming

    // ── Announcement search state ──
    const [announcementSearch, setAnnouncementSearch] = useState('');

    // ── Dialog state ──
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editFaculty, setEditFaculty] = useState('');

    // ── Announcement dialog state ──
    const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
    const [announcementEditTarget, setAnnouncementEditTarget] = useState<AnnouncementResponse | null>(null);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [announcementIsPublic, setAnnouncementIsPublic] = useState(true);
    const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
    const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
    const [deleteAnnouncementTarget, setDeleteAnnouncementTarget] = useState<AnnouncementResponse | null>(null);
    const [deleteAnnouncementOpen, setDeleteAnnouncementOpen] = useState(false);

    // ── Permanent Delete dialog state (super admin only) ──
    const [permDeleteClubOpen, setPermDeleteClubOpen] = useState(false);
    const [permDeleteAnnouncementOpen, setPermDeleteAnnouncementOpen] = useState(false);
    const [permDeleteAnnouncementTarget, setPermDeleteAnnouncementTarget] = useState<AnnouncementResponse | null>(null);

    // ── Change Position dialog state ──
    const [changePositionDialogOpen, setChangePositionDialogOpen] = useState(false);
    const [changePositionTarget, setChangePositionTarget] = useState<MembershipResponse | null>(null);
    const [newPosition, setNewPosition] = useState<ClubPosition>('MEMBER');
    const [changePositionReason, setChangePositionReason] = useState('');
    const [isPositionChanging, setIsPositionChanging] = useState(false);

    // ── View detail dialog state ──
    const [viewAnnouncementOpen, setViewAnnouncementOpen] = useState(false);
    const [viewElectionOpen, setViewElectionOpen] = useState(false);
    const [viewMemberOpen, setViewMemberOpen] = useState(false);
    const [logTypeFilter, setLogTypeFilter] = useState<string>('');

    // Membership action dialog
    const [memberActionDialogOpen, setMemberActionDialogOpen] = useState(false);
    const [memberActionType, setMemberActionType] = useState<MembershipActionType>(null);
    const [memberActionTarget, setMemberActionTarget] = useState<MembershipResponse | null>(null);
    const [isMemberActionLoading, setIsMemberActionLoading] = useState(false);

    const club = selectedClub;
    const hasAdminAccess = isAdmin || isSuperAdmin;
    const stats = hasAdminAccess ? adminClubStatistics : clubStatistics;

    // ── Load club ──
    useEffect(() => { loadClubById(clubId); }, [clubId, loadClubById]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            resetPinnedAnnouncements();
            resetActiveMembers();
            resetAdminClubStatistics();
            resetSelectedMembership();
            resetSelectedAnnouncement();
            resetSelectedElection();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Load data on club ready ──
    useEffect(() => {
        if (!club || club.id !== clubId) return;
        loadClubMembers(clubId, { page: membersPage, size: membersPageSize });
        loadActiveMembers(clubId, { page: activeMembersPage, size: activeMembersPageSize });
        loadPendingMembers(clubId, { page: pendingPage, size: pendingPageSize });
        loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
        loadElections(clubId, { page: electionsPage, size: electionsPageSize });
        loadActivityLogs(clubId, { page: logsPage, size: logsPageSize });
        if (hasAdminAccess) {
            loadAdminClubStats(clubId);
        } else {
            loadClubStatistics(clubId);
            // Also try officer-level stats (non-academic staff who are officers)
            loadAdminClubStatisticsOfficer(clubId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [club?.id, clubId]);

    // ── Pagination handlers ──
    const handleMembersPageChange = (_: unknown, p: number) => {
        setMembersPage(p);
        loadClubMembers(clubId, { page: p, size: membersPageSize });
    };
    const handleMembersPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setMembersPageSize(s);
        setMembersPage(0);
        loadClubMembers(clubId, { page: 0, size: s });
    };
    const handlePendingPageChange = (_: unknown, p: number) => {
        setPendingPage(p);
        loadPendingMembers(clubId, { page: p, size: pendingPageSize });
    };
    const handlePendingPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setPendingPageSize(s);
        setPendingPage(0);
        loadPendingMembers(clubId, { page: 0, size: s });
    };
    const handleActiveMembersPageChange = (_: unknown, p: number) => {
        setActiveMembersPage(p);
        loadActiveMembers(clubId, { page: p, size: activeMembersPageSize });
    };
    const handleActiveMembersPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setActiveMembersPageSize(s);
        setActiveMembersPage(0);
        loadActiveMembers(clubId, { page: 0, size: s });
    };
    const handleMemberSubTabChange = (_: React.SyntheticEvent, v: number) => {
        setMemberSubTab(v);
        if (v === 0) {
            setMembersPage(0);
            loadClubMembers(clubId, { page: 0, size: membersPageSize });
        } else {
            setActiveMembersPage(0);
            loadActiveMembers(clubId, { page: 0, size: activeMembersPageSize });
        }
    };
    const handleAnnouncementsPageChange = (_: unknown, p: number) => {
        setAnnouncementsPage(p);
        loadAnnouncements(clubId, { page: p, size: announcementsPageSize });
    };
    const handleAnnouncementsPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setAnnouncementsPageSize(s);
        setAnnouncementsPage(0);
        loadAnnouncements(clubId, { page: 0, size: s });
    };
    const handleElectionsPageChange = (_: unknown, p: number) => {
        setElectionsPage(p);
        const loader = electionSubTab === 1 ? loadActiveElections : electionSubTab === 2 ? loadUpcomingElections : loadElections;
        loader(clubId, { page: p, size: electionsPageSize });
    };
    const handleElectionsPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setElectionsPageSize(s);
        setElectionsPage(0);
        const loader = electionSubTab === 1 ? loadActiveElections : electionSubTab === 2 ? loadUpcomingElections : loadElections;
        loader(clubId, { page: 0, size: s });
    };
    const handleElectionSubTabChange = (_: React.SyntheticEvent, v: number) => {
        setElectionSubTab(v);
        setElectionsPage(0);
        const loader = v === 1 ? loadActiveElections : v === 2 ? loadUpcomingElections : loadElections;
        loader(clubId, { page: 0, size: electionsPageSize });
    };

    // ── Announcement search ──
    const handleAnnouncementSearch = useCallback(() => {
        setAnnouncementsPage(0);
        if (announcementSearch.trim()) {
            searchAnnouncementsAction({ keyword: announcementSearch, page: 0, size: announcementsPageSize });
        } else {
            loadAnnouncements(clubId, { page: 0, size: announcementsPageSize });
        }
    }, [announcementSearch, announcementsPageSize, clubId, searchAnnouncementsAction, loadAnnouncements]);
    const handleLogsPageChange = (_: unknown, p: number) => {
        setLogsPage(p);
        if (logTypeFilter) {
            loadActivityLogsByType(clubId, logTypeFilter as ActivityLogType, { page: p, size: logsPageSize });
        } else {
            loadActivityLogs(clubId, { page: p, size: logsPageSize });
        }
    };
    const handleLogsPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setLogsPageSize(s);
        setLogsPage(0);
        if (logTypeFilter) {
            loadActivityLogsByType(clubId, logTypeFilter as ActivityLogType, { page: 0, size: s });
        } else {
            loadActivityLogs(clubId, { page: 0, size: s });
        }
    };

    // ── Refresh ──
    const refreshAll = useCallback(() => {
        loadClubById(clubId);
        loadClubMembers(clubId, { page: membersPage, size: membersPageSize });
        loadActiveMembers(clubId, { page: activeMembersPage, size: activeMembersPageSize });
        loadPendingMembers(clubId, { page: pendingPage, size: pendingPageSize });
        loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
        loadElections(clubId, { page: electionsPage, size: electionsPageSize });
        loadActivityLogs(clubId, { page: logsPage, size: logsPageSize });
        if (hasAdminAccess) { loadAdminClubStats(clubId); }
        else { loadClubStatistics(clubId); }
    }, [clubId, hasAdminAccess, membersPage, membersPageSize, activeMembersPage, activeMembersPageSize, pendingPage, pendingPageSize, announcementsPage, announcementsPageSize, electionsPage, electionsPageSize, logsPage, logsPageSize, loadClubById, loadClubMembers, loadActiveMembers, loadPendingMembers, loadAnnouncements, loadElections, loadActivityLogs, loadAdminClubStats, loadClubStatistics]);

    // ── Edit dialog ──
    const handleOpenEdit = useCallback(() => {
        if (!club) return;
        setEditName(club.name);
        setEditDescription(club.description || '');
        setEditFaculty(club.faculty);
        setEditDialogOpen(true);
    }, [club]);

    const handleSaveEdit = useCallback(async () => {
        if (!club) return;
        const data: UpdateClubRequest = {};
        if (editName !== club.name) data.name = editName;
        if (editDescription !== (club.description || '')) data.description = editDescription;
        if (editFaculty !== club.faculty) data.faculty = editFaculty;
        await updateClub(club.id, data);
        setEditDialogOpen(false);
        loadClubById(clubId);
    }, [club, editName, editDescription, editFaculty, updateClub, loadClubById, clubId]);

    const handleDelete = useCallback(async () => {
        if (!club) return;
        await removeClub(club.id);
        setDeleteConfirmOpen(false);
        router.push(backPath);
    }, [club, removeClub, router, backPath]);

    const handlePermanentDeleteClub = useCallback(async () => {
        if (!club) return;
        await permanentDeleteClub(club.id);
        setPermDeleteClubOpen(false);
        router.push(backPath);
    }, [club, permanentDeleteClub, router, backPath]);

    const handlePermanentDeleteAnnouncement = useCallback(async () => {
        if (!permDeleteAnnouncementTarget) return;
        await permanentDeleteAnnouncement(permDeleteAnnouncementTarget.id);
        setPermDeleteAnnouncementOpen(false);
        setPermDeleteAnnouncementTarget(null);
        loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
    }, [permDeleteAnnouncementTarget, permanentDeleteAnnouncement, loadAnnouncements, clubId, announcementsPage, announcementsPageSize]);

    const handleToggleReg = useCallback(() => {
        if (!club) return;
        if (hasAdminAccess) { adminToggleReg(club.id); } else { toggleReg(club.id); }
    }, [club, hasAdminAccess, adminToggleReg, toggleReg]);

    const handleBulkApprove = useCallback(() => {
        const ids = pendingMembers.map((m) => m.id);
        if (ids.length > 0) bulkApproveMembers(clubId, ids);
    }, [pendingMembers, bulkApproveMembers, clubId]);

    const handleLogTypeFilter = (type: string) => {
        setLogTypeFilter(type);
        setLogsPage(0);
        if (type) { loadActivityLogsByType(clubId, type as ActivityLogType, { page: 0, size: logsPageSize }); }
        else { loadActivityLogs(clubId, { page: 0, size: logsPageSize }); }
    };

    // ── Membership action handlers ──
    const openMemberAction = useCallback((action: MembershipActionType, member: MembershipResponse) => {
        setMemberActionType(action); setMemberActionTarget(member); setMemberActionDialogOpen(true);
    }, []);
    const closeMemberAction = useCallback(() => {
        setMemberActionDialogOpen(false); setMemberActionType(null); setMemberActionTarget(null);
    }, []);
    const handleMemberActionConfirm = useCallback(async (membershipId: number, reason?: string) => {
        if (!memberActionType) return;
        setIsMemberActionLoading(true);
        try {
            if (memberActionType === 'approve') await approveMember(membershipId);
            else if (memberActionType === 'reject') await rejectMember(membershipId, reason);
            else if (memberActionType === 'suspend') await suspendMember(membershipId, reason);
            closeMemberAction();
            loadClubMembers(clubId, { page: membersPage, size: membersPageSize });
            loadActiveMembers(clubId, { page: activeMembersPage, size: activeMembersPageSize });
            loadPendingMembers(clubId, { page: pendingPage, size: pendingPageSize });
            if (hasAdminAccess) { loadAdminClubStats(clubId); }
            else { loadClubStatistics(clubId); }
        } finally { setIsMemberActionLoading(false); }
    }, [memberActionType, clubId, hasAdminAccess, membersPage, membersPageSize, activeMembersPage, activeMembersPageSize, pendingPage, pendingPageSize, approveMember, rejectMember, suspendMember, closeMemberAction, loadClubMembers, loadActiveMembers, loadPendingMembers, loadAdminClubStats, loadClubStatistics]);

    // ── Announcement handlers ──
    const openCreateAnnouncement = useCallback(() => {
        setAnnouncementEditTarget(null);
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAnnouncementIsPublic(true);
        setAnnouncementImage(null);
        setAnnouncementDialogOpen(true);
    }, []);

    const openEditAnnouncement = useCallback((a: AnnouncementResponse) => {
        setAnnouncementEditTarget(a);
        setAnnouncementTitle(a.title);
        setAnnouncementContent(a.content);
        setAnnouncementIsPublic(!a.isMembersOnly);
        setAnnouncementImage(null);
        setAnnouncementDialogOpen(true);
    }, []);

    const handleSaveAnnouncement = useCallback(async () => {
        setIsAnnouncementSaving(true);
        try {
            if (announcementEditTarget) {
                await updateAnnouncement(
                    announcementEditTarget.id,
                    { title: announcementTitle, content: announcementContent, isMembersOnly: !announcementIsPublic },
                    announcementImage || undefined,
                );
            } else {
                const formData = new FormData();
                formData.append('clubId', String(clubId));
                formData.append('title', announcementTitle);
                formData.append('content', announcementContent);
                formData.append('isMembersOnly', String(!announcementIsPublic));
                if (announcementImage) formData.append('attachment', announcementImage);
                await createAnnouncement(formData);
            }
            setAnnouncementDialogOpen(false);
            loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
        } finally { setIsAnnouncementSaving(false); }
    }, [clubId, announcementTitle, announcementContent, announcementIsPublic, announcementImage, announcementEditTarget, createAnnouncement, updateAnnouncement, loadAnnouncements, announcementsPage, announcementsPageSize]);

    const handleDeleteAnnouncement = useCallback(async () => {
        if (!deleteAnnouncementTarget) return;
        await removeAnnouncement(deleteAnnouncementTarget.id);
        setDeleteAnnouncementOpen(false);
        setDeleteAnnouncementTarget(null);
        loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
    }, [deleteAnnouncementTarget, removeAnnouncement, loadAnnouncements, clubId, announcementsPage, announcementsPageSize]);

    const handleTogglePin = useCallback(async (a: AnnouncementResponse) => {
        if (a.isPinned) { await unpinAnnouncement(a.id); }
        else { await pinAnnouncement(a.id); }
        loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
    }, [pinAnnouncement, unpinAnnouncement, loadAnnouncements, clubId, announcementsPage, announcementsPageSize]);

    // ── Change Position handlers ──
    const openChangePosition = useCallback((member: MembershipResponse) => {
        setChangePositionTarget(member);
        setNewPosition(member.position || 'MEMBER');
        setChangePositionReason('');
        setChangePositionDialogOpen(true);
    }, []);

    const handleChangePosition = useCallback(async () => {
        if (!changePositionTarget) return;
        setIsPositionChanging(true);
        try {
            await changePosition({ membershipId: changePositionTarget.id, newPosition, reason: changePositionReason });
            setChangePositionDialogOpen(false);
            setChangePositionTarget(null);
            loadClubMembers(clubId, { page: membersPage, size: membersPageSize });
            loadActiveMembers(clubId, { page: activeMembersPage, size: activeMembersPageSize });
        } finally { setIsPositionChanging(false); }
    }, [changePositionTarget, newPosition, changePositionReason, changePosition, loadClubMembers, clubId, membersPage, membersPageSize, activeMembersPage, activeMembersPageSize, loadActiveMembers]);

    const POSITION_OPTIONS: { value: ClubPosition; label: string }[] = [
        { value: 'PRESIDENT', label: 'President' },
        { value: 'VICE_PRESIDENT', label: 'Vice President' },
        { value: 'SECRETARY', label: 'Secretary' },
        { value: 'TREASURER', label: 'Treasurer' },
        { value: 'TOP_BOARD_MEMBER', label: 'Top Board Member' },
        { value: 'COMMITTEE_MEMBER', label: 'Committee Member' },
        { value: 'MEMBER', label: 'Member' },
    ];

    // ── View detail handlers ──
    const handleViewAnnouncement = useCallback((a: AnnouncementResponse) => {
        loadAnnouncementById(a.id);
        setViewAnnouncementOpen(true);
    }, [loadAnnouncementById]);

    const handleViewElection = useCallback((e: { id: number }) => {
        loadElectionDetails(e.id);
        loadElectionById(e.id);
        setViewElectionOpen(true);
    }, [loadElectionDetails, loadElectionById]);

    const handleViewMember = useCallback((member: MembershipResponse) => {
        loadMembershipById(member.id);
        setViewMemberOpen(true);
    }, [loadMembershipById]);

    // ── Overview stats ──
    const overviewStats = [
        { label: 'Total Members', value: stats?.totalMembers ?? 0, icon: PersonIcon, color: '#3B82F6' },
        { label: 'Active', value: stats?.activeMembers ?? 0, icon: CheckCircleIcon, color: '#10B981' },
        { label: 'Pending', value: stats?.pendingMembers ?? 0, icon: HourglassEmptyIcon, color: '#F59E0B' },
        { label: 'Announcements', value: stats?.totalAnnouncements ?? 0, icon: CampaignIcon, color: '#8B5CF6' },
        { label: 'Elections', value: stats?.totalElections ?? 0, icon: HowToVoteIcon, color: '#6366F1' },
    ];

    // ── Tab labels ──
    const tabLabels = [
        `Members (${totalMembers})`,
        `Applications (${totalPendingMembers})`,
        `Announcements (${totalAnnouncements})`,
        `Elections (${totalElections})`,
        'Activity Log',
    ];

    // Loading skeleton
    if (!club || club.id !== clubId) {
        return (
            <Box sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}><Skeleton variant="text" width="30%" height={36} /><Skeleton variant="text" width="50%" height={20} /></Box>
                </Box>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}><Skeleton variant="rounded" height={80} sx={{ borderRadius: 1 }} /></Grid>
                    ))}
                </Grid>
                <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1, mb: 3 }} />
                <Skeleton variant="rounded" height={300} sx={{ borderRadius: 1 }} />
            </Box>
        );
    }

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* ── Header ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Tooltip title="Back to all clubs">
                        <IconButton onClick={() => router.push(backPath)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar src={club.logoUrl || undefined} sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, fontSize: '1.1rem' }}>
                                {club.name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>{club.name}</Typography>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Chip label={club.clubCode} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                                    <Chip label={FACULTY_LABELS[club.faculty] || club.faculty} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                                    <Chip icon={<FiberManualRecordIcon sx={{ fontSize: '8px !important' }} />} label={club.registrationOpen ? 'Open' : 'Closed'} size="small" color={club.registrationOpen ? 'success' : 'default'} sx={{ fontSize: '0.7rem', height: 22 }} />
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Club"><IconButton onClick={handleOpenEdit} sx={{ bgcolor: alpha(theme.palette.info.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.15) } }}><EditIcon sx={{ color: 'info.main' }} /></IconButton></Tooltip>
                        <Tooltip title={club.registrationOpen ? 'Close Registration' : 'Open Registration'}><IconButton onClick={handleToggleReg} sx={{ bgcolor: alpha(theme.palette.warning.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.15) } }}>{club.registrationOpen ? <ToggleOnIcon sx={{ color: 'success.main' }} /> : <ToggleOffIcon sx={{ color: 'text.disabled' }} />}</IconButton></Tooltip>
                        <Tooltip title="Refresh"><IconButton onClick={refreshAll} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}><RefreshIcon /></IconButton></Tooltip>
                        <Tooltip title="Delete Club"><IconButton onClick={() => setDeleteConfirmOpen(true)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}><DeleteIcon sx={{ color: 'error.main' }} /></IconButton></Tooltip>
                        {isSuperAdmin && (
                            <Tooltip title="Permanently Delete Club">
                                <IconButton onClick={() => setPermDeleteClubOpen(true)} sx={{ bgcolor: alpha('#EF4444', 0.12), '&:hover': { bgcolor: alpha('#EF4444', 0.22) } }}>
                                    <DeleteForeverIcon sx={{ color: '#EF4444' }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>
                {club.description && <Typography variant="body2" color="text.secondary" sx={{ ml: 8.5, maxWidth: 600 }}>{club.description}</Typography>}
            </MotionBox>

            {/* ── Overview Stats ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {overviewStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid key={index} size={{ xs: 6, sm: 4, md: 12 / overviewStats.length }}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%', transition: 'all 0.2s', '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), border: '1px solid', borderColor: alpha(stat.color, 0.15) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* ── Tabs (kuppi-style) ── */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 3, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 2 }}>
                    <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} variant="scrollable" scrollButtons="auto"
                        sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 1, px: 2 }, '& .MuiTabs-indicator': { borderRadius: 1, height: 2 } }}>
                        {tabLabels.map((label, i) => <Tab key={i} label={label} />)}
                    </Tabs>
                </CardContent>
            </MotionCard>

            {/* ═══════════════ TAB 0: Members ═══════════════ */}
            <Box role="tabpanel" hidden={mainTab !== 0} sx={{ display: mainTab === 0 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 3, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: 'hidden' }}>
                    <Box sx={{ height: 3, background: `linear-gradient(90deg, #3B82F6, ${alpha('#3B82F6', 0.3)})` }} />
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#3B82F6', 0.1) }}>
                                <GroupsIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>Members</Typography>
                        </Stack>
                        <Tabs value={memberSubTab} onChange={handleMemberSubTabChange} sx={{ mb: 2, minHeight: 32, '& .MuiTab-root': { minHeight: 32, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', px: 1.5, py: 0 }, '& .MuiTabs-indicator': { height: 2, borderRadius: 1 } }}>
                            <Tab label={`All Members (${totalMembers})`} />
                            <Tab label={`Active (${totalActiveMembers})`} />
                        </Tabs>
                        {isMembershipLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                        ) : memberSubTab === 0 ? (
                            <>
                                {clubMembers.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <GroupsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="text.secondary">No members found</Typography>
                                    </Box>
                                ) : (
                                    <MembershipTable members={clubMembers} isLoading={false} showActions onSuspendRequest={(m) => openMemberAction('suspend', m)} onChangePosition={openChangePosition} onRowClick={handleViewMember} />
                                )}
                                <TablePagination component="div" count={totalMembers} page={membersPage} onPageChange={handleMembersPageChange} rowsPerPage={membersPageSize} onRowsPerPageChange={handleMembersPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                            </>
                        ) : (
                            <>
                                {activeMembers.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <CheckCircleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="text.secondary">No active members</Typography>
                                    </Box>
                                ) : (
                                    <MembershipTable members={activeMembers} isLoading={false} showActions onSuspendRequest={(m) => openMemberAction('suspend', m)} onChangePosition={openChangePosition} onRowClick={handleViewMember} />
                                )}
                                <TablePagination component="div" count={totalActiveMembers} page={activeMembersPage} onPageChange={handleActiveMembersPageChange} rowsPerPage={activeMembersPageSize} onRowsPerPageChange={handleActiveMembersPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                            </>
                        )}
                    </CardContent>
                </MotionCard>
            </Box>

            {/* ═══════════════ TAB 1: Applications ═══════════════ */}
            <Box role="tabpanel" hidden={mainTab !== 1} sx={{ display: mainTab === 1 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: 'hidden' }}>
                    <Box sx={{ height: 3, background: `linear-gradient(90deg, #F59E0B, ${alpha('#F59E0B', 0.3)})` }} />
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#F59E0B', 0.1) }}>
                                    <HourglassEmptyIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Pending Applications</Typography>
                                <Chip label={totalPendingMembers} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: totalPendingMembers > 0 ? alpha('#F59E0B', 0.15) : alpha(theme.palette.text.disabled, 0.1), color: totalPendingMembers > 0 ? '#92400E' : 'text.disabled' }} />
                            </Stack>
                            {totalPendingMembers > 0 && (
                                <Button size="small" variant="contained" color="success" onClick={handleBulkApprove} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
                                    Approve All
                                </Button>
                            )}
                        </Stack>
                        {isMembershipLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
                        ) : totalPendingMembers === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CheckCircleIcon sx={{ fontSize: 60, color: alpha(theme.palette.success.main, 0.3), mb: 2 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>No pending applications</Typography>
                                <Typography variant="caption" color="text.disabled">New membership requests will appear here for review</Typography>
                            </Box>
                        ) : (
                            <>
                                <MembershipTable members={pendingMembers} isLoading={false} showActions onApproveRequest={(m) => openMemberAction('approve', m)} onRejectRequest={(m) => openMemberAction('reject', m)} />
                                <TablePagination component="div" count={totalPendingMembers} page={pendingPage} onPageChange={handlePendingPageChange} rowsPerPage={pendingPageSize} onRowsPerPageChange={handlePendingPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                            </>
                        )}
                    </CardContent>
                </MotionCard>
            </Box>

            {/* ═══════════════ TAB 2: Announcements ═══════════════ */}
            <Box role="tabpanel" hidden={mainTab !== 2} sx={{ display: mainTab === 2 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: 'hidden' }}>
                    <Box sx={{ height: 3, background: `linear-gradient(90deg, #8B5CF6, ${alpha('#8B5CF6', 0.3)})` }} />
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#8B5CF6', 0.1) }}>
                                    <CampaignIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Announcements ({totalAnnouncements})</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                    placeholder="Search announcements..."
                                    value={announcementSearch}
                                    onChange={(e) => setAnnouncementSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnnouncementSearch()}
                                    size="small"
                                    sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>, endAdornment: announcementSearch ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setAnnouncementSearch(''); loadAnnouncements(clubId, { page: 0, size: announcementsPageSize }); }}><Typography sx={{ fontSize: 14, cursor: 'pointer', color: 'text.disabled' }}>✕</Typography></IconButton></InputAdornment> : null } }}
                                />
                                <Button size="small" variant="contained" onClick={openCreateAnnouncement} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}>
                                    + New
                                </Button>
                            </Stack>
                        </Stack>
                        {isAnnouncementLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                        ) : announcements.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CampaignIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">No announcements yet</Typography>
                                <Typography variant="caption" color="text.disabled">Create your first announcement above</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {[...announcements]
                                    .sort((a, b) => {
                                        const aPinned = a.isPinned ?? false;
                                        const bPinned = b.isPinned ?? false;
                                        if (aPinned && !bPinned) return -1;
                                        if (!aPinned && bPinned) return 1;
                                        return 0;
                                    })
                                    .map((a) => (
                                    <AnnouncementCard
                                        key={a.id}
                                        announcement={a}
                                        showActions
                                        onClick={handleViewAnnouncement}
                                        onEdit={openEditAnnouncement}
                                        onDelete={(ann) => { setDeleteAnnouncementTarget(ann); setDeleteAnnouncementOpen(true); }}
                                        onPermanentDelete={isSuperAdmin ? (ann) => { setPermDeleteAnnouncementTarget(ann); setPermDeleteAnnouncementOpen(true); } : undefined}
                                        onTogglePin={handleTogglePin}
                                    />
                                ))}
                            </Stack>
                        )}
                        {totalAnnouncements > 0 && (
                            <TablePagination component="div" count={totalAnnouncements} page={announcementsPage} onPageChange={handleAnnouncementsPageChange} rowsPerPage={announcementsPageSize} onRowsPerPageChange={handleAnnouncementsPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                        )}
                    </CardContent>
                </MotionCard>
            </Box>

            {/* ═══════════════ TAB 3: Elections ═══════════════ */}
            <Box role="tabpanel" hidden={mainTab !== 3} sx={{ display: mainTab === 3 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: 'hidden' }}>
                    <Box sx={{ height: 3, background: `linear-gradient(90deg, #6366F1, ${alpha('#6366F1', 0.3)})` }} />
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#6366F1', 0.1) }}>
                                <HowToVoteIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>Elections</Typography>
                        </Stack>
                        {/* Election sub-tabs */}
                        <Tabs value={electionSubTab} onChange={handleElectionSubTabChange} sx={{ mb: 2, minHeight: 32, '& .MuiTab-root': { minHeight: 32, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', px: 1.5, py: 0 }, '& .MuiTabs-indicator': { height: 2, borderRadius: 1 } }}>
                            <Tab label="All" />
                            <Tab label="Active" />
                            <Tab label="Upcoming" />
                        </Tabs>
                        {isElectionLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                        ) : (electionSubTab === 1 ? activeElections : elections).length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <HowToVoteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">
                                    {electionSubTab === 1 ? 'No active elections' : electionSubTab === 2 ? 'No upcoming elections' : 'No elections found'}
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {(electionSubTab === 1 ? activeElections : elections).map((e) => <ElectionCard key={e.id} election={e} onClick={handleViewElection} />)}
                            </Stack>
                        )}
                        {totalElections > 0 && (
                            <TablePagination component="div" count={totalElections} page={electionsPage} onPageChange={handleElectionsPageChange} rowsPerPage={electionsPageSize} onRowsPerPageChange={handleElectionsPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                        )}
                    </CardContent>
                </MotionCard>
            </Box>

            {/* ═══════════════ TAB 4: Activity Log ═══════════════ */}
            <Box role="tabpanel" hidden={mainTab !== 4} sx={{ display: mainTab === 4 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: 'hidden' }}>
                    <Box sx={{ height: 3, background: `linear-gradient(90deg, #6B7280, ${alpha('#6B7280', 0.3)})` }} />
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#6B7280', 0.1) }}>
                                    <HistoryIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Activity Log ({totalActivityLogs})</Typography>
                            </Stack>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>Filter by type</InputLabel>
                                <Select value={logTypeFilter} label="Filter by type" onChange={(e) => handleLogTypeFilter(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {ACTIVITY_LOG_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Stack>
                        <ActivityLogList logs={activityLogs} isLoading={isActivityLogLoading} />
                        {totalActivityLogs > 0 && (
                            <TablePagination component="div" count={totalActivityLogs} page={logsPage} onPageChange={handleLogsPageChange} rowsPerPage={logsPageSize} onRowsPerPageChange={handleLogsPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                        )}
                    </CardContent>
                </MotionCard>
            </Box>

            {/* ── Edit Club Dialog ── */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>Edit Club</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField label="Club Name" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <TextField label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} fullWidth multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <FormControl fullWidth>
                            <InputLabel>Faculty</InputLabel>
                            <Select value={editFaculty} label="Faculty" onChange={(e) => setEditFaculty(e.target.value)} sx={{ borderRadius: 1 }}>
                                {Object.entries(FACULTY_LABELS).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setEditDialogOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={isUpdating || !editName.trim()} startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : undefined} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirm Dialog ── */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Club</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.12) }}>
                        <DeleteIcon sx={{ color: 'error.main', fontSize: 20, mt: 0.25 }} />
                        <Typography variant="body2" color="text.secondary">
                            Are you sure you want to delete <strong>{club.name}</strong>? This will remove all members, announcements, elections, and activity logs. This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting} startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : undefined} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}` }}>
                        {isDeleting ? 'Deleting...' : 'Delete Club'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Membership Action Dialog ── */}
            <MembershipActionDialog open={memberActionDialogOpen} action={memberActionType} member={memberActionTarget} isLoading={isMemberActionLoading} onClose={closeMemberAction} onConfirm={handleMemberActionConfirm} />

            {/* ── Create/Edit Announcement Dialog ── */}
            <Dialog open={announcementDialogOpen} onClose={() => setAnnouncementDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, #8B5CF6, ${alpha('#8B5CF6', 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>{announcementEditTarget ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField label="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <TextField label="Content" value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} fullWidth required multiline rows={4} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <FormControlLabel control={<Switch checked={announcementIsPublic} onChange={(e) => setAnnouncementIsPublic(e.target.checked)} color="primary" />} label={announcementIsPublic ? 'Public (visible to everyone)' : 'Members only'} />
                        <Button variant="outlined" component="label" sx={{ borderRadius: 1, textTransform: 'none' }}>
                            {announcementImage ? announcementImage.name : 'Upload Image (optional)'}
                            <input type="file" hidden accept="image/*" onChange={(e) => setAnnouncementImage(e.target.files?.[0] || null)} />
                        </Button>
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setAnnouncementDialogOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleSaveAnnouncement} variant="contained" disabled={isAnnouncementSaving || !announcementTitle.trim() || !announcementContent.trim()} startIcon={isAnnouncementSaving ? <CircularProgress size={18} color="inherit" /> : undefined} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}>
                        {isAnnouncementSaving ? 'Saving...' : (announcementEditTarget ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Announcement Confirm ── */}
            <Dialog open={deleteAnnouncementOpen} onClose={() => setDeleteAnnouncementOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Announcement</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.12) }}>
                        <DeleteIcon sx={{ color: 'error.main', fontSize: 20, mt: 0.25 }} />
                        <Typography variant="body2" color="text.secondary">
                            Are you sure you want to delete &ldquo;<strong>{deleteAnnouncementTarget?.title}</strong>&rdquo;? This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteAnnouncementOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleDeleteAnnouncement} variant="contained" color="error" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* ── Permanent Delete Club Confirm (Super Admin) ── */}
            {isSuperAdmin && (
                <Dialog open={permDeleteClubOpen} onClose={() => setPermDeleteClubOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                    <Box sx={{ height: 4, background: 'linear-gradient(90deg, #EF4444, #DC2626)' }} />
                    <DialogTitle sx={{ fontWeight: 700 }}>Permanently Delete Club</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 1, bgcolor: alpha('#EF4444', 0.06), border: '1px solid', borderColor: alpha('#EF4444', 0.15) }}>
                            <DeleteForeverIcon sx={{ color: '#EF4444', fontSize: 20, mt: 0.25 }} />
                            <Typography variant="body2" color="text.secondary">
                                Are you sure you want to <strong>permanently</strong> delete <strong>{club?.name}</strong>? This will irrecoverably remove the club, all members, announcements, elections, and activity logs. <strong>This action cannot be reversed.</strong>
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => setPermDeleteClubOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                        <Button onClick={handlePermanentDeleteClub} variant="contained" disabled={isDeleting} startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteForeverIcon />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, boxShadow: `0 4px 14px ${alpha('#EF4444', 0.4)}` }}>
                            {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* ── Permanent Delete Announcement Confirm (Super Admin) ── */}
            {isSuperAdmin && (
                <Dialog open={permDeleteAnnouncementOpen} onClose={() => setPermDeleteAnnouncementOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                    <Box sx={{ height: 4, background: 'linear-gradient(90deg, #EF4444, #DC2626)' }} />
                    <DialogTitle sx={{ fontWeight: 700 }}>Permanently Delete Announcement</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 1, bgcolor: alpha('#EF4444', 0.06), border: '1px solid', borderColor: alpha('#EF4444', 0.15) }}>
                            <DeleteForeverIcon sx={{ color: '#EF4444', fontSize: 20, mt: 0.25 }} />
                            <Typography variant="body2" color="text.secondary">
                                Are you sure you want to <strong>permanently</strong> delete &ldquo;<strong>{permDeleteAnnouncementTarget?.title}</strong>&rdquo;? <strong>This action cannot be reversed.</strong>
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => setPermDeleteAnnouncementOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                        <Button onClick={handlePermanentDeleteAnnouncement} variant="contained" disabled={isDeleting} startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteForeverIcon />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, boxShadow: 'none' }}>
                            {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* ── Change Position Dialog ── */}
            <Dialog open={changePositionDialogOpen} onClose={() => setChangePositionDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>Change Member Position</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {changePositionTarget && (
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.1) }}>
                                <Typography variant="body2" fontWeight={600}>{changePositionTarget.memberName || changePositionTarget.userName}</Typography>
                                <Typography variant="caption" color="text.secondary">{changePositionTarget.memberEmail || changePositionTarget.userEmail}</Typography>
                                <Chip label={(changePositionTarget.position || 'MEMBER').replace(/_/g, ' ')} size="small" sx={{ ml: 1, fontSize: '0.7rem', height: 22 }} />
                            </Box>
                            <FormControl fullWidth>
                                <InputLabel>New Position</InputLabel>
                                <Select value={newPosition} label="New Position" onChange={(e) => setNewPosition(e.target.value as ClubPosition)} sx={{ borderRadius: 1 }}>
                                    {POSITION_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField label="Reason" value={changePositionReason} onChange={(e) => setChangePositionReason(e.target.value)} fullWidth required multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        </Stack>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setChangePositionDialogOpen(false)} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleChangePosition} variant="contained" disabled={isPositionChanging || !changePositionReason.trim()} startIcon={isPositionChanging ? <CircularProgress size={18} color="inherit" /> : undefined} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
                        {isPositionChanging ? 'Changing...' : 'Change Position'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── View Announcement Detail Dialog ── */}
            <Dialog open={viewAnnouncementOpen} onClose={() => { setViewAnnouncementOpen(false); resetSelectedAnnouncement(); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, #8B5CF6, ${alpha('#8B5CF6', 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>{selectedAnnouncement?.title || 'Announcement'}</DialogTitle>
                <DialogContent>
                    {selectedAnnouncement ? (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={selectedAnnouncement.isPublic ? 'Public' : 'Members Only'} size="small" color={selectedAnnouncement.isPublic ? 'success' : 'info'} sx={{ fontSize: '0.7rem', height: 22 }} />
                                {selectedAnnouncement.isPinned && <Chip label="Pinned" size="small" color="warning" sx={{ fontSize: '0.7rem', height: 22 }} />}
                                <Typography variant="caption" color="text.disabled">by {selectedAnnouncement.authorName}</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedAnnouncement.content}</Typography>
                            {selectedAnnouncement.imageUrl && (
                                <Box sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                    <Box component="img" src={selectedAnnouncement.imageUrl} alt="" sx={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                                </Box>
                            )}
                            <Typography variant="caption" color="text.disabled">
                                Created: {new Date(selectedAnnouncement.createdAt).toLocaleString()} · Updated: {new Date(selectedAnnouncement.updatedAt).toLocaleString()}
                            </Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => { setViewAnnouncementOpen(false); resetSelectedAnnouncement(); }} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* ── View Election Detail Dialog ── */}
            <Dialog open={viewElectionOpen} onClose={() => { setViewElectionOpen(false); resetSelectedElection(); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, #6366F1, ${alpha('#6366F1', 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>{selectedElection?.title || 'Election'}</DialogTitle>
                <DialogContent>
                    {selectedElection ? (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label={(selectedElection.status || 'UNKNOWN').replace(/_/g, ' ')} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 22 }} />
                                <Chip label={selectedElection.clubName} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                            </Stack>
                            {selectedElection.description && (
                                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{selectedElection.description}</Typography>
                            )}
                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.1) }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Nominations</Typography>
                                        <Typography variant="body2">{new Date(selectedElection.nominationStartDate).toLocaleDateString()} – {new Date(selectedElection.nominationEndDate).toLocaleDateString()}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Voting</Typography>
                                        <Typography variant="body2">{new Date(selectedElection.votingStartDate).toLocaleDateString()} – {new Date(selectedElection.votingEndDate).toLocaleDateString()}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            {selectedElection.candidates && selectedElection.candidates.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" fontWeight={700}>Candidates ({selectedElection.candidates.length})</Typography>
                                    <Stack spacing={1}>
                                        {selectedElection.candidates.map((c) => (
                                            <Box key={c.id} sx={{ p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{c.userName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{(c.position || '').replace(/_/g, ' ')}</Typography>
                                                    {c.manifesto && <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>{c.manifesto}</Typography>}
                                                </Box>
                                                <Chip label={`${c.voteCount} votes`} size="small" sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700 }} />
                                            </Box>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => { setViewElectionOpen(false); resetSelectedElection(); }} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* ── View Member Detail Dialog ── */}
            <Dialog open={viewMemberOpen} onClose={() => { setViewMemberOpen(false); resetSelectedMembership(); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, #3B82F6, ${alpha('#3B82F6', 0.3)})` }} />
                <DialogTitle sx={{ fontWeight: 700 }}>Member Details</DialogTitle>
                <DialogContent>
                    {selectedMembership ? (
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                            {/* Member info card */}
                            <Box sx={{ p: 2.5, borderRadius: 1, bgcolor: alpha('#3B82F6', 0.04), border: '1px solid', borderColor: alpha('#3B82F6', 0.1) }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', fontWeight: 700, fontSize: '1.1rem' }}>
                                        {selectedMembership.memberName?.charAt(0) || selectedMembership.userName?.charAt(0) || 'U'}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>{selectedMembership.memberName || selectedMembership.userName}</Typography>
                                        <Typography variant="body2" color="text.secondary">{selectedMembership.memberEmail || selectedMembership.userEmail}</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Details grid */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600}>Club</Typography>
                                    <Typography variant="body2" fontWeight={600}>{selectedMembership.clubName}</Typography>
                                    <Typography variant="caption" color="text.disabled">{selectedMembership.clubCode}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600}>Position</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip label={(selectedMembership.position || 'MEMBER').replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }} />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600}>Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={selectedMembership.status}
                                            size="small"
                                            color={selectedMembership.status === 'ACTIVE' ? 'success' : selectedMembership.status === 'PENDING' ? 'warning' : selectedMembership.status === 'SUSPENDED' ? 'error' : 'default'}
                                            sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600}>Joined</Typography>
                                    <Typography variant="body2">
                                        {new Date(selectedMembership.joinDate || selectedMembership.joinedAt || selectedMembership.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Remarks */}
                            {selectedMembership.remarks && (
                                <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.1) }}>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>Remarks</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedMembership.remarks}</Typography>
                                </Box>
                            )}

                            <Typography variant="caption" color="text.disabled">
                                Last updated: {new Date(selectedMembership.updatedAt).toLocaleString()}
                            </Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => { setViewMemberOpen(false); resetSelectedMembership(); }} color="inherit" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbars ── */}
            <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="error" onClose={clearError} variant="filled" sx={{ borderRadius: 1 }}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={clearSuccess} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" onClose={clearSuccess} variant="filled" sx={{ borderRadius: 1 }}>{successMessage}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

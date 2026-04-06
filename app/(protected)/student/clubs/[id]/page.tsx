'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, Chip, Button, Avatar,
    Divider, Snackbar, Alert, Stack, Grid, alpha, useTheme, CircularProgress,
    Paper, Skeleton, Tabs, Tab, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Switch, FormControlLabel, InputAdornment, IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import ShieldIcon from '@mui/icons-material/Shield';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useClub } from '@/hooks/useClub';
import { AnnouncementCard } from '@/components/club/AnnouncementCard';
import { ElectionCard } from '@/components/club/ElectionCard';
import { JoinClubDialog } from '@/components/club/JoinClubDialog';
import { FACULTY_LABELS } from '@/constants/faculty';
import type { MembershipResponse, ClubPosition, ClubOfficer as ClubOfficerType, AnnouncementResponse } from '@/features/club/types';
import { isOfficerPosition } from '@/features/club/permissions';
import * as clubServices from '@/features/club/services';

const MotionCard = motion.create(Card);

/* ── Position config ── */
const OFFICER_POSITIONS: { key: ClubPosition; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'PRESIDENT', label: 'President', icon: <StarIcon sx={{ fontSize: 20 }} />, color: '#F59E0B' },
    { key: 'VICE_PRESIDENT', label: 'Vice President', icon: <ShieldIcon sx={{ fontSize: 20 }} />, color: '#8B5CF6' },
    { key: 'SECRETARY', label: 'Secretary', icon: <BadgeIcon sx={{ fontSize: 20 }} />, color: '#3B82F6' },
    { key: 'TREASURER', label: 'Treasurer', icon: <AccountBalanceIcon sx={{ fontSize: 20 }} />, color: '#10B981' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25];

/* ── Helpers ── */
function stagger(i: number) {
    return { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 * i, duration: 0.35 } };
}

export default function StudentClubDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const clubId = Number(params.id);

    const {
        selectedClub,
        activeMembers,
        announcements,
        pinnedAnnouncements,
        totalAnnouncements,
        elections,
        totalElections,
        clubStatistics,
        myMemberships,
        isAnnouncementLoading,
        isElectionLoading,
        isMembershipLoading,
        error,
        successMessage,
        permissions,
        loadClubById,
        loadActiveMembers,
        loadPublicAnnouncements,
        loadPinnedAnnouncements,
        loadAnnouncements,
        searchAnnouncementsAction,
        createAnnouncement,
        updateAnnouncement,
        removeAnnouncement,
        pinAnnouncement,
        unpinAnnouncement,
        loadElections,
        loadActiveElections,
        loadUpcomingElections,
        loadClubStatistics,
        loadMyMemberships,
        joinClub,
        leaveClub,
        clearError,
        clearSuccess,
        resetSelectedClub,
        resetPinnedAnnouncements,
        resetActiveMembers,
    } = useClub();

    // ── Tab & pagination state ──
    const [mainTab, setMainTab] = useState(0); // 0=Announcements, 1=Elections
    const [electionSubTab, setElectionSubTab] = useState(0); // 0=All, 1=Active, 2=Upcoming
    const [announcementsPage, setAnnouncementsPage] = useState(0);
    const [announcementsPageSize, setAnnouncementsPageSize] = useState(10);
    const [announcementSearch, setAnnouncementSearch] = useState('');
    const [electionsPage, setElectionsPage] = useState(0);
    const [electionsPageSize, setElectionsPageSize] = useState(10);

    // ── Join dialog ──
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);

    // ── Snackbar ──
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const club = selectedClub;

    // ── Load data ──
    useEffect(() => {
        if (!clubId || isNaN(clubId)) return;
        loadClubById(clubId);
        loadActiveMembers(clubId, { page: 0, size: 50 });
        loadPublicAnnouncements(clubId, { page: 0, size: announcementsPageSize });
        loadPinnedAnnouncements(clubId, { page: 0, size: 10 });
        loadElections(clubId, { page: 0, size: electionsPageSize });
        loadClubStatistics(clubId);
        loadMyMemberships({ page: 0, size: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clubId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            resetSelectedClub();
            resetPinnedAnnouncements();
            resetActiveMembers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Error/Success → snackbar
    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);


    // ── Derived data ──
    const myMembership = useMemo(() =>
        myMemberships.find((m) => m.clubId === clubId && (m.status === 'ACTIVE' || m.status === 'PENDING')),
        [myMemberships, clubId],
    );
    const isMember = myMembership?.status === 'ACTIVE';
    const isPending = myMembership?.status === 'PENDING';

    // Officer check: PRESIDENT, VICE_PRESIDENT, SECRETARY, TREASURER, TOP_BOARD_MEMBER
    const isOfficer = useMemo(() =>
        isMember && myMembership?.position ? isOfficerPosition(myMembership.position) : false,
        [isMember, myMembership],
    );
    const canManageAnnouncements = isOfficer;

    // ── Announcement search ──
    useEffect(() => {
        const timer = setTimeout(() => {
            if (announcementSearch.trim()) {
                searchAnnouncementsAction({ keyword: announcementSearch, page: 0, size: announcementsPageSize });
            } else if (isOfficer) {
                loadAnnouncements(clubId, { page: 0, size: announcementsPageSize });
            } else {
                loadPublicAnnouncements(clubId, { page: 0, size: announcementsPageSize });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [announcementSearch, announcementsPageSize, clubId, isOfficer, searchAnnouncementsAction, loadAnnouncements, loadPublicAnnouncements]);


    // Merge pinned + regular announcements into one list: pinned first, then unpinned (no duplicates)
    const allAnnouncements = useMemo(() => {
        const pinnedIds = new Set(pinnedAnnouncements.map((a) => a.id));
        const unpinned = announcements.filter((a) => !pinnedIds.has(a.id));
        return [...pinnedAnnouncements, ...unpinned];
    }, [pinnedAnnouncements, announcements]);

    // When officer status is confirmed, fetch ALL announcements (not just public)
    useEffect(() => {
        if (isOfficer && clubId) {
            loadAnnouncements(clubId, { page: announcementsPage, size: announcementsPageSize });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOfficer, clubId]);

    // Officers: use club's officer fields directly (from API), fallback to activeMembers
    const officers = useMemo(() => {
        if (!club) return OFFICER_POSITIONS.map((o) => ({ ...o, officer: null as ClubOfficerType | null, member: null as MembershipResponse | null }));

        // Map ClubPosition key to club officer field
        const officerMap: Record<string, ClubOfficerType | null | undefined> = {
            PRESIDENT: club.president,
            VICE_PRESIDENT: club.vicePresident,
            SECRETARY: club.secretary,
            TREASURER: club.treasurer,
        };

        // Fallback: extract from activeMembers if club doesn't have officer fields
        const memberMap = new Map<ClubPosition, MembershipResponse>();
        for (const m of activeMembers) {
            if (m.position && m.position !== 'MEMBER' && m.position !== 'COMMITTEE_MEMBER' && !memberMap.has(m.position)) {
                memberMap.set(m.position, m);
            }
        }

        return OFFICER_POSITIONS.map((o) => ({
            ...o,
            officer: officerMap[o.key] ?? null,
            member: memberMap.get(o.key) || null,
        }));
    }, [club, activeMembers]);

    // Advisor (separate from the 4 officer positions)
    const advisor = club?.advisor ?? null;

    // Adviser: look for committee member with "adviser" or similar in remarks — or just show committee_member as adviser
    // For now, we'll show faculty adviser if available from stats or just skip
    const stats = clubStatistics;

    // ── Pagination handlers ──
    const loadAnnouncementsFn = isOfficer ? loadAnnouncements : loadPublicAnnouncements;
    const handleAnnouncementsPageChange = (_: unknown, p: number) => {
        setAnnouncementsPage(p);
        loadAnnouncementsFn(clubId, { page: p, size: announcementsPageSize });
    };
    const handleAnnouncementsPageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value, 10);
        setAnnouncementsPageSize(s);
        setAnnouncementsPage(0);
        loadAnnouncementsFn(clubId, { page: 0, size: s });
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

    // ── Join / Leave ──
    const handleJoinSubmit = useCallback((remarks: string) => {
        joinClub({ clubId, remarks }).then(() => {
            setJoinDialogOpen(false);
            loadMyMemberships({ page: 0, size: 100 });
        });
    }, [clubId, joinClub, loadMyMemberships]);

    const handleLeave = useCallback(() => {
        leaveClub(clubId).then(() => {
            loadMyMemberships({ page: 0, size: 100 });
        });
    }, [clubId, leaveClub, loadMyMemberships]);

    // ── Announcement CRUD (officers only) ──
    const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
    const [announcementEditTarget, setAnnouncementEditTarget] = useState<AnnouncementResponse | null>(null);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [announcementPriority, setAnnouncementPriority] = useState('NORMAL');
    const [announcementIsPinned, setAnnouncementIsPinned] = useState(false);
    const [announcementIsPublic, setAnnouncementIsPublic] = useState(true);
    const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
    const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
    const [deleteAnnouncementTarget, setDeleteAnnouncementTarget] = useState<AnnouncementResponse | null>(null);
    const [deleteAnnouncementOpen, setDeleteAnnouncementOpen] = useState(false);
    // Validation errors
    const [announcementErrors, setAnnouncementErrors] = useState<{ title?: string; content?: string }>({});

    const openCreateAnnouncement = useCallback(() => {
        setAnnouncementEditTarget(null);
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAnnouncementPriority('NORMAL');
        setAnnouncementIsPinned(false);
        setAnnouncementIsPublic(true);
        setAnnouncementImage(null);
        setAnnouncementErrors({});
        setAnnouncementDialogOpen(true);
    }, []);

    const openEditAnnouncement = useCallback((a: AnnouncementResponse) => {
        setAnnouncementEditTarget(a);
        setAnnouncementTitle(a.title);
        setAnnouncementContent(a.content);
        setAnnouncementPriority(a.priority || 'NORMAL');
        setAnnouncementIsPinned(a.isPinned || false);
        setAnnouncementIsPublic(!a.isMembersOnly);
        setAnnouncementImage(null);
        setAnnouncementErrors({});
        setAnnouncementDialogOpen(true);
    }, []);

    // ── Validation ──
    const validateAnnouncement = (): boolean => {
        const errors: { title?: string; content?: string } = {};

        if (!announcementTitle || announcementTitle.trim().length === 0) {
            errors.title = 'Title is required';
        } else if (announcementTitle.length > 200) {
            errors.title = 'Title must be 200 characters or less';
        }

        if (!announcementContent || announcementContent.trim().length === 0) {
            errors.content = 'Content is required';
        } else if (announcementContent.length > 5000) {
            errors.content = 'Content must be 5000 characters or less';
        }

        setAnnouncementErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveAnnouncement = useCallback(async () => {
        // Validate before saving
        if (!validateAnnouncement()) {
            return;
        }

        setIsAnnouncementSaving(true);
        try {
            if (announcementEditTarget) {
                await updateAnnouncement(
                    announcementEditTarget.id,
                    {
                        title: announcementTitle,
                        content: announcementContent,
                        isMembersOnly: !announcementIsPublic,
                        priority: announcementPriority as any,
                        isPinned: announcementIsPinned,
                    },
                    announcementImage || undefined,
                );
            } else {
                // Use the service function directly with proper parameters
                await clubServices.createAnnouncement(
                    clubId,
                    announcementTitle,
                    announcementContent,
                    announcementPriority,
                    announcementIsPinned,
                    !announcementIsPublic,
                    announcementImage || undefined,
                );
            }
            setAnnouncementDialogOpen(false);
            const loader = isOfficer ? loadAnnouncements : loadPublicAnnouncements;
            loader(clubId, { page: announcementsPage, size: announcementsPageSize });
            loadPinnedAnnouncements(clubId, { page: 0, size: 10 });
        } finally { setIsAnnouncementSaving(false); }
    }, [clubId, announcementTitle, announcementContent, announcementPriority, announcementIsPinned, announcementIsPublic, announcementImage, announcementEditTarget, isOfficer, loadAnnouncements, loadPublicAnnouncements, loadPinnedAnnouncements, announcementsPage, announcementsPageSize, updateAnnouncement]);

    const handleDeleteAnnouncement = useCallback(async () => {
        if (!deleteAnnouncementTarget) return;
        await removeAnnouncement(deleteAnnouncementTarget.id);
        setDeleteAnnouncementOpen(false);
        setDeleteAnnouncementTarget(null);
        const loader = isOfficer ? loadAnnouncements : loadPublicAnnouncements;
        loader(clubId, { page: announcementsPage, size: announcementsPageSize });
        loadPinnedAnnouncements(clubId, { page: 0, size: 10 });
    }, [deleteAnnouncementTarget, isOfficer, removeAnnouncement, loadAnnouncements, loadPublicAnnouncements, loadPinnedAnnouncements, clubId, announcementsPage, announcementsPageSize]);

    const handleTogglePin = useCallback(async (a: AnnouncementResponse) => {
        if (a.isPinned) { await unpinAnnouncement(a.id); }
        else { await pinAnnouncement(a.id); }
        const loader = isOfficer ? loadAnnouncements : loadPublicAnnouncements;
        loader(clubId, { page: announcementsPage, size: announcementsPageSize });
        loadPinnedAnnouncements(clubId, { page: 0, size: 10 });
    }, [pinAnnouncement, unpinAnnouncement, isOfficer, loadAnnouncements, loadPublicAnnouncements, loadPinnedAnnouncements, clubId, announcementsPage, announcementsPageSize]);

    // ── Loading skeleton ──
    if (!club || club.id !== clubId) {
        return (
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/clubs')} sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}>Back to Clubs</Button>
                <Skeleton variant="rounded" height={200} sx={{ borderRadius: 1, mb: 3 }} />
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[0, 1, 2, 3].map((i) => <Grid key={i} size={{ xs: 6, sm: 3 }}><Skeleton variant="rounded" height={100} sx={{ borderRadius: 1 }} /></Grid>)}
                </Grid>
                <Skeleton variant="rounded" height={300} sx={{ borderRadius: 1 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* ── Back Navigation ── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/clubs')}
                sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) } }}
            >
                Back to Clubs
            </Button>

            <Grid container spacing={3}>
                {/* ══════════════  LEFT COLUMN  ══════════════ */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* ── Hero Header (kuppi-style) ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #6366F1 100%)`, p: { xs: 2.5, sm: 3.5 }, position: 'relative' }}>
                            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '20px 20px' }} />
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                {/* Status chips */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: `${club.registrationOpen ? '#10B981' : '#6B7280'} !important` }} />}
                                        label={club.registrationOpen ? 'Open Registration' : 'Closed'}
                                        size="small"
                                        sx={{ bgcolor: alpha(club.registrationOpen ? '#10B981' : '#6B7280', 0.25), color: 'white', fontWeight: 700 }}
                                    />
                                    <Chip label={FACULTY_LABELS[club.faculty] || club.faculty} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
                                    <Chip label={club.clubCode} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }} />
                                    {isMember && <Chip label="Member" size="small" sx={{ bgcolor: alpha('#10B981', 0.3), color: 'white', fontWeight: 700 }} />}
                                    {isPending && <Chip label="Pending" size="small" sx={{ bgcolor: alpha('#F59E0B', 0.3), color: 'white', fontWeight: 700 }} />}
                                </Stack>

                                {/* Club name + logo */}
                                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 2 }}>
                                    <Avatar
                                        src={club.logoUrl || undefined}
                                        sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '1.75rem', border: '3px solid rgba(255,255,255,0.3)' }}
                                    >
                                        {club.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.25 }}>{club.name}</Typography>
                                        {club.description && (
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, lineHeight: 1.5 }}>
                                                {club.description.length > 120 ? `${club.description.slice(0, 120)}...` : club.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>

                                {/* Meta row */}
                                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <GroupsIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{club.memberCount} Members</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CampaignIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{stats?.totalAnnouncements ?? 0} Announcements</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <HowToVoteIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{stats?.totalElections ?? 0} Elections</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            Since {new Date(club.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Box>

                        {/* Quick stats bar */}
                        <Stack
                            direction="row"
                            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                        >
                            {[
                                { label: 'Members', value: stats?.totalMembers ?? club.totalMembers ?? club.memberCount, color: '#3B82F6' },
                                { label: 'Active', value: stats?.activeMembers ?? club.activeMembers ?? 0, color: '#10B981' },
                                { label: 'Announcements', value: stats?.totalAnnouncements ?? 0, color: '#8B5CF6' },
                                { label: 'Elections', value: stats?.totalElections ?? club.totalElections ?? 0, color: '#6366F1' },
                            ].map((s, idx) => (
                                <Box key={idx} sx={{ flex: 1, py: 1.5, px: 2, textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </MotionCard>

                    {/* ── Officers Card ── */}
                    <MotionCard
                        {...stagger(1)}
                        elevation={0}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'hidden' }}
                    >
                        <Box sx={{ height: 3, background: `linear-gradient(90deg, #F59E0B, ${alpha('#F59E0B', 0.3)})` }} />
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#F59E0B', 0.1) }}>
                                    <StarIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Club Leadership</Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                {officers.map((officer) => {
                                    // Prefer officer data from club response, fallback to membership data
                                    const hasOfficer = !!(officer.officer || officer.member);
                                    const displayName = officer.officer?.name || officer.member?.memberName || officer.member?.userName || null;
                                    const displayEmail = officer.officer?.email || officer.member?.userEmail || null;
                                    const displayAvatar = officer.officer?.profilePictureUrl || null;
                                    const initial = displayName?.charAt(0) || 'U';

                                    return (
                                    <Grid key={officer.key} size={{ xs: 6, sm: 3 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: hasOfficer ? alpha(officer.color, 0.2) : 'divider',
                                                bgcolor: hasOfficer ? alpha(officer.color, 0.03) : 'transparent',
                                                height: '100%',
                                                textAlign: 'center',
                                                transition: 'all 0.2s',
                                                '&:hover': hasOfficer ? { borderColor: officer.color, boxShadow: `0 4px 16px ${alpha(officer.color, 0.15)}` } : {},
                                            }}
                                        >
                                            {hasOfficer ? (
                                                <>
                                                    <Avatar
                                                        src={displayAvatar || undefined}
                                                        sx={{
                                                            width: 48, height: 48, mx: 'auto', mb: 1.5,
                                                            bgcolor: alpha(officer.color, 0.12),
                                                            color: officer.color,
                                                            fontWeight: 700, fontSize: '1.1rem',
                                                            border: '2px solid',
                                                            borderColor: alpha(officer.color, 0.3),
                                                        }}
                                                    >
                                                        {initial}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={700} noWrap>{displayName}</Typography>
                                                    <Chip
                                                        label={officer.label}
                                                        size="small"
                                                        sx={{
                                                            mt: 0.75, fontSize: '0.68rem', height: 22, fontWeight: 600,
                                                            bgcolor: alpha(officer.color, 0.1), color: officer.color,
                                                            border: `1px solid ${alpha(officer.color, 0.2)}`,
                                                        }}
                                                    />
                                                    {displayEmail && (
                                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }} noWrap>
                                                            {displayEmail}
                                                        </Typography>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 1.5, bgcolor: alpha(theme.palette.text.disabled, 0.06), color: 'text.disabled' }}>
                                                        <Box sx={{ display: 'flex', fontSize: 22, color: 'text.disabled' }}>{officer.icon}</Box>
                                                    </Avatar>
                                                    <Typography variant="body2" color="text.disabled" fontWeight={600}>{officer.label}</Typography>
                                                    <Typography variant="caption" color="text.disabled">Vacant</Typography>
                                                </>
                                            )}
                                        </Paper>
                                    </Grid>
                                    );
                                })}

                                {/* Advisor card (5th position, full width on xs) */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: advisor ? alpha('#EF4444', 0.2) : 'divider',
                                            bgcolor: advisor ? alpha('#EF4444', 0.03) : 'transparent',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': advisor ? { borderColor: '#EF4444', boxShadow: `0 4px 16px ${alpha('#EF4444', 0.15)}` } : {},
                                        }}
                                    >
                                        <Avatar
                                            src={advisor?.profilePictureUrl || undefined}
                                            sx={{
                                                width: 48, height: 48,
                                                bgcolor: advisor ? alpha('#EF4444', 0.12) : alpha(theme.palette.text.disabled, 0.06),
                                                color: advisor ? '#EF4444' : 'text.disabled',
                                                fontWeight: 700, fontSize: '1.1rem',
                                                border: '2px solid',
                                                borderColor: advisor ? alpha('#EF4444', 0.3) : alpha(theme.palette.text.disabled, 0.1),
                                            }}
                                        >
                                            {advisor ? advisor.name.charAt(0) : <SchoolIcon sx={{ fontSize: 22 }} />}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>
                                                {advisor ? advisor.name : 'No Advisor Assigned'}
                                            </Typography>
                                            <Chip
                                                label="Advisor"
                                                size="small"
                                                sx={{
                                                    mt: 0.5, fontSize: '0.68rem', height: 22, fontWeight: 600,
                                                    bgcolor: alpha('#EF4444', 0.1), color: '#EF4444',
                                                    border: `1px solid ${alpha('#EF4444', 0.2)}`,
                                                }}
                                            />
                                            {advisor?.email && (
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }} noWrap>
                                                    {advisor.email}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </MotionCard>

                    {/* ── Tabs (Announcements / Elections) ── */}
                    <MotionCard
                        {...stagger(2)}
                        elevation={0}
                        sx={{ mb: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Tabs
                                value={mainTab}
                                onChange={(_, v) => setMainTab(v)}
                                sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 1, px: 2 }, '& .MuiTabs-indicator': { borderRadius: 1, height: 2 } }}
                            >
                                <Tab label={`Announcements (${totalAnnouncements})`} />
                                <Tab label={`Elections (${totalElections})`} />
                            </Tabs>
                        </CardContent>
                    </MotionCard>

                    {/* ═══ TAB 0: Announcements ═══ */}
                    <Box role="tabpanel" hidden={mainTab !== 0} sx={{ display: mainTab === 0 ? 'block' : 'none' }}>
                        <MotionCard {...stagger(3)} elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                            <Box sx={{ height: 3, background: `linear-gradient(90deg, #8B5CF6, ${alpha('#8B5CF6', 0.3)})` }} />
                            <CardContent sx={{ p: 3 }}>
                                {/* Header */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#8B5CF6', 0.1) }}>
                                            <CampaignIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700}>Announcements</Typography>
                                        <Chip label={totalAnnouncements} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha('#8B5CF6', 0.1), color: '#8B5CF6' }} />
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            placeholder="Search announcements..."
                                            value={announcementSearch}
                                            onChange={(e) => setAnnouncementSearch(e.target.value)}
                                            size="small"
                                            sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: announcementSearch ? (
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => setAnnouncementSearch('')} sx={{ p: 0 }}>
                                                                <Typography sx={{ fontSize: 14, cursor: 'pointer', color: 'text.disabled' }}>✕</Typography>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ) : null,
                                                },
                                            }}
                                        />
                                        {canManageAnnouncements && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={openCreateAnnouncement}
                                                sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}
                                            >
                                                New
                                            </Button>
                                        )}
                                    </Stack>
                                </Stack>

                                {/* Content */}
                                {isAnnouncementLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                                ) : allAnnouncements.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <CampaignIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="text.secondary">No announcements yet</Typography>
                                        {canManageAnnouncements && (
                                            <Typography variant="caption" color="text.disabled">Create your first announcement above</Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Stack spacing={2}>
                                        {allAnnouncements.map((a, i) => (
                                            <AnnouncementCard
                                                key={a.id}
                                                announcement={a}
                                                index={i}
                                                showActions={canManageAnnouncements}
                                                onTogglePin={canManageAnnouncements ? handleTogglePin : undefined}
                                                onEdit={canManageAnnouncements ? openEditAnnouncement : undefined}
                                                onDelete={canManageAnnouncements ? (ann) => { setDeleteAnnouncementTarget(ann); setDeleteAnnouncementOpen(true); } : undefined}
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

                    {/* ═══ TAB 1: Elections ═══ */}
                    <Box role="tabpanel" hidden={mainTab !== 1} sx={{ display: mainTab === 1 ? 'block' : 'none' }}>
                        <MotionCard {...stagger(3)} elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                            <Box sx={{ height: 3, background: `linear-gradient(90deg, #6366F1, ${alpha('#6366F1', 0.3)})` }} />
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#6366F1', 0.1) }}>
                                        <HowToVoteIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>Elections</Typography>
                                </Stack>
                                {/* Sub-tabs */}
                                <Tabs value={electionSubTab} onChange={handleElectionSubTabChange} sx={{ mb: 2, minHeight: 32, '& .MuiTab-root': { minHeight: 32, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', px: 1.5, py: 0 }, '& .MuiTabs-indicator': { height: 2, borderRadius: 1 } }}>
                                    <Tab label="All" />
                                    <Tab label="Active" />
                                    <Tab label="Upcoming" />
                                </Tabs>
                                {isElectionLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                                ) : elections.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <HowToVoteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="text.secondary">
                                            {electionSubTab === 1 ? 'No active elections' : electionSubTab === 2 ? 'No upcoming elections' : 'No elections found'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={2}>
                                        {elections.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}
                                    </Stack>
                                )}
                                {totalElections > 0 && (
                                    <TablePagination component="div" count={totalElections} page={electionsPage} onPageChange={handleElectionsPageChange} rowsPerPage={electionsPageSize} onRowsPerPageChange={handleElectionsPageSizeChange} rowsPerPageOptions={PAGE_SIZE_OPTIONS} />
                                )}
                            </CardContent>
                        </MotionCard>
                    </Box>
                </Grid>

                {/* ══════════════  RIGHT COLUMN (Sidebar)  ══════════════ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* ── Club Info Card ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'visible' }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Club Info</Typography>

                            <Stack spacing={2}>
                                {/* Description */}
                                {club.description && (
                                    <Box>
                                        <Typography variant="caption" color="text.disabled" fontWeight={600}>About</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mt: 0.5 }}>{club.description}</Typography>
                                    </Box>
                                )}

                                {/* Details grid */}
                                <Grid container spacing={1.5}>
                                    {[
                                        { label: 'Code', value: club.clubCode },
                                        { label: 'Faculty', value: FACULTY_LABELS[club.faculty] || club.faculty },
                                        { label: 'Members', value: String(club.memberCount) },
                                        { label: 'Since', value: new Date(club.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                                    ].map((item) => (
                                        <Grid key={item.label} size={{ xs: 6 }}>
                                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                                <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Divider />

                                {/* Membership status */}
                                {isMember && (
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 2, borderRadius: 1, bgcolor: alpha('#10B981', 0.04), borderColor: alpha('#10B981', 0.2) }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                                            <PersonIcon sx={{ fontSize: 18, color: '#10B981' }} />
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#10B981' }}>You are a member</Typography>
                                        </Stack>
                                        {myMembership && (
                                            <Stack spacing={0.75}>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="caption" color="text.secondary">Position</Typography>
                                                    <Chip label={(myMembership.position || 'MEMBER').replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.68rem', height: 20, fontWeight: 600 }} />
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="caption" color="text.secondary">Joined</Typography>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {new Date(myMembership.joinDate || myMembership.joinedAt || myMembership.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        )}
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<ExitToAppIcon sx={{ fontSize: 16 }} />}
                                            onClick={handleLeave}
                                            sx={{ mt: 2, borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Leave Club
                                        </Button>
                                    </Paper>
                                )}

                                {isPending && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: alpha('#F59E0B', 0.04), borderColor: alpha('#F59E0B', 0.2) }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CircularProgress size={16} sx={{ color: '#F59E0B' }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ color: '#F59E0B' }}>Your join request is pending</Typography>
                                        </Stack>
                                    </Paper>
                                )}

                                {!isMember && !isPending && club.registrationOpen && permissions?.canJoinClub && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => setJoinDialogOpen(true)}
                                        sx={{
                                            textTransform: 'none', fontWeight: 700, borderRadius: 1, py: 1.5,
                                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                                        }}
                                    >
                                        Join This Club
                                    </Button>
                                )}

                                {!isMember && !isPending && !club.registrationOpen && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.text.disabled, 0.04), borderColor: 'divider', textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.disabled">Registration is currently closed</Typography>
                                    </Paper>
                                )}
                            </Stack>
                        </CardContent>
                    </MotionCard>

                    {/* ── Officers Sidebar (compact) ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Officers</Typography>
                            <Stack spacing={1.5}>
                                {officers.map((officer) => {
                                    const name = officer.officer?.name || officer.member?.memberName || officer.member?.userName || 'Vacant';
                                    const avatar = officer.officer?.profilePictureUrl || null;
                                    const initial = name !== 'Vacant' ? name.charAt(0) : '?';
                                    return (
                                    <Stack key={officer.key} direction="row" spacing={1.5} alignItems="center">
                                        <Avatar src={avatar || undefined} sx={{ width: 36, height: 36, bgcolor: alpha(officer.color, 0.1), color: officer.color, fontSize: '0.85rem', fontWeight: 700 }}>
                                            {initial}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={600} noWrap>{name}</Typography>
                                            <Typography variant="caption" sx={{ color: officer.color, fontWeight: 600 }}>{officer.label}</Typography>
                                        </Box>
                                    </Stack>
                                    );
                                })}
                                {/* Advisor row */}
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar src={advisor?.profilePictureUrl || undefined} sx={{ width: 36, height: 36, bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', fontSize: '0.85rem', fontWeight: 700 }}>
                                        {advisor ? advisor.name.charAt(0) : '?'}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight={600} noWrap>{advisor?.name || 'Vacant'}</Typography>
                                        <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600 }}>Advisor</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>

            {/* ── Join Dialog ── */}
            <JoinClubDialog
                open={joinDialogOpen}
                onClose={() => setJoinDialogOpen(false)}
                onSubmit={handleJoinSubmit}
                clubName={club.name}
                isLoading={isMembershipLoading}
            />

            {/* ── Create / Edit Announcement Dialog (officers) ── */}
            {canManageAnnouncements && (
                <Dialog
                    open={announcementDialogOpen}
                    onClose={() => setAnnouncementDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}
                >
                    <Box sx={{ height: 4, background: `linear-gradient(90deg, #8B5CF6, ${alpha('#8B5CF6', 0.3)})` }} />
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        {announcementEditTarget ? 'Edit Announcement' : 'New Announcement'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                            {/* Title */}
                            <Box>
                                <TextField
                                    label="Title *"
                                    value={announcementTitle}
                                    onChange={(e) => {
                                        setAnnouncementTitle(e.target.value);
                                        if (announcementErrors.title) setAnnouncementErrors({ ...announcementErrors, title: undefined });
                                    }}
                                    fullWidth
                                    error={!!announcementErrors.title}
                                    helperText={announcementErrors.title || `${announcementTitle.length}/200`}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                />
                            </Box>

                            {/* Content */}
                            <Box>
                                <TextField
                                    label="Content *"
                                    value={announcementContent}
                                    onChange={(e) => {
                                        setAnnouncementContent(e.target.value);
                                        if (announcementErrors.content) setAnnouncementErrors({ ...announcementErrors, content: undefined });
                                    }}
                                    fullWidth
                                    error={!!announcementErrors.content}
                                    helperText={announcementErrors.content || `${announcementContent.length}/5000`}
                                    multiline
                                    rows={4}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                />
                            </Box>

                            {/* Priority */}
                            <TextField
                                select
                                label="Priority"
                                value={announcementPriority}
                                onChange={(e) => setAnnouncementPriority(e.target.value)}
                                fullWidth
                                SelectProps={{ native: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </TextField>

                            {/* Pin Announcement */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={announcementIsPinned}
                                        onChange={(e) => setAnnouncementIsPinned(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={announcementIsPinned ? 'Pinned (show at top)' : 'Not pinned'}
                            />

                            {/* Visibility */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={announcementIsPublic}
                                        onChange={(e) => setAnnouncementIsPublic(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={announcementIsPublic ? 'Public (visible to everyone)' : 'Members only'}
                            />

                            {/* Attachment */}
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ borderRadius: 1, textTransform: 'none', justifyContent: 'flex-start', color: 'text.primary', borderColor: 'divider' }}
                            >
                                {announcementImage ? `✓ ${announcementImage.name}` : '+ Upload Attachment (optional)'}
                                <input type="file" hidden onChange={(e) => setAnnouncementImage(e.target.files?.[0] || null)} />
                            </Button>
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => setAnnouncementDialogOpen(false)}
                            color="inherit"
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveAnnouncement}
                            variant="contained"
                            disabled={isAnnouncementSaving || Object.keys(announcementErrors).length > 0}
                            startIcon={isAnnouncementSaving ? <CircularProgress size={18} color="inherit" /> : undefined}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' }, '&:disabled': { opacity: 0.6 } }}
                        >
                            {isAnnouncementSaving ? 'Saving...' : (announcementEditTarget ? 'Update' : 'Create')}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* ── Delete Announcement Confirm (officers) ── */}
            {canManageAnnouncements && (
                <Dialog
                    open={deleteAnnouncementOpen}
                    onClose={() => setDeleteAnnouncementOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 1, overflow: 'hidden' } } }}
                >
                    <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.3)})` }} />
                    <DialogTitle sx={{ fontWeight: 700 }}>Delete Announcement</DialogTitle>
                    <DialogContent>
                        <Box sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 1,
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.12),
                        }}>
                            <DeleteIcon sx={{ color: 'error.main', fontSize: 20, mt: 0.25 }} />
                            <Typography variant="body2" color="text.secondary">
                                Are you sure you want to delete &ldquo;<strong>{deleteAnnouncementTarget?.title}</strong>&rdquo;? This action cannot be undone.
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => setDeleteAnnouncementOpen(false)}
                            color="inherit"
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteAnnouncement}
                            variant="contained"
                            color="error"
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}` }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* ── Snackbar ── */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}


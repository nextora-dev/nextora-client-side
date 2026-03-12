'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Button,
    Snackbar,
    Alert,
    Chip,
    Stack,
    alpha,
    useTheme,
    Avatar,
    Paper,
    IconButton,
    Badge,
    Tooltip,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useClub } from '@/hooks/useClub';
import { ClubList } from '@/components/club/ClubList';
import { JoinClubDialog } from '@/components/club/JoinClubDialog';
import type { ClubResponse, MembershipResponse } from '@/features/club/types';

const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ── Membership Card for "My Clubs" tab ──────────────────────
function MembershipCard({ membership, onLeave, onSelect }: {
    membership: MembershipResponse;
    onLeave: (clubId: number) => void;
    onSelect: (clubId: number) => void;
}) {
    const theme = useTheme();

    const POSITION_COLORS: Record<string, string> = {
        PRESIDENT: '#F59E0B',
        VICE_PRESIDENT: '#8B5CF6',
        SECRETARY: '#3B82F6',
        TREASURER: '#10B981',
        TOP_BOARD_MEMBER: '#EC4899',
        COMMITTEE_MEMBER: '#6366F1',
        MEMBER: '#6B7280',
    };

    const posColor = (membership.position && POSITION_COLORS[membership.position]) || '#6B7280';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
            }}
            onClick={() => onSelect(membership.clubId)}
        >
            <Avatar
                sx={{
                    width: 44,
                    height: 44,
                    bgcolor: alpha(posColor, 0.1),
                    color: posColor,
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: '2px solid',
                    borderColor: alpha(posColor, 0.2),
                }}
            >
                {membership.clubName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={700} noWrap>
                        {membership.clubName}
                    </Typography>
                    {membership.status === 'ACTIVE' && (
                        <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    )}
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                        label={membership.position?.replace(/_/g, ' ') || 'Member'}
                        size="small"
                        sx={{
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 600,
                            bgcolor: alpha(posColor, 0.1),
                            color: posColor,
                            border: '1px solid',
                            borderColor: alpha(posColor, 0.2),
                        }}
                    />
                    <Chip
                        label={membership.status}
                        size="small"
                        color={membership.status === 'ACTIVE' ? 'success' : 'warning'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                </Stack>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                        {new Date(membership.joinDate || membership.joinedAt || membership.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Stack>
                {membership.status === 'ACTIVE' && (
                    <Tooltip title="Leave Club">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLeave(membership.clubId);
                            }}
                            sx={{
                                border: '1px solid',
                                borderColor: alpha(theme.palette.error.main, 0.2),
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.error.main, 0.06),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) },
                            }}
                        >
                            <ExitToAppIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Paper>
    );
}

/**
 * Student Clubs Page — Kuppi-level UI
 */
export default function StudentClubsPage() {
    const theme = useTheme();
    const router = useRouter();
    const {
        clubs,
        totalClubs,
        myMemberships,
        isClubLoading,
        isMembershipLoading,
        error,
        successMessage,
        permissions,
        loadClubs,
        searchClubs,
        loadOpenRegistrationClubs,
        loadMyMemberships,
        joinClub,
        leaveClub,
        clearError,
        clearSuccess,
    } = useClub();

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [selectedClubForJoin, setSelectedClubForJoin] = useState<ClubResponse | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Load initial data
    useEffect(() => {
        loadClubs({ page: 0, size: 20 });
        loadMyMemberships({ page: 0, size: 50 });
    }, [loadClubs, loadMyMemberships]);

    // Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchClubs({ keyword: searchQuery, page: 0, size: 20 });
            } else {
                if (activeTab === 1) {
                    loadOpenRegistrationClubs({ page: 0, size: 20 });
                } else {
                    loadClubs({ page: 0, size: 20 });
                }
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchClubs, loadClubs, loadOpenRegistrationClubs, activeTab]);

    // Load tab-specific data
    useEffect(() => {
        if (activeTab === 1 && !searchQuery.trim()) {
            loadOpenRegistrationClubs({ page: 0, size: 20 });
        }
    }, [activeTab, loadOpenRegistrationClubs, searchQuery]);


    // Error/Success handling
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            clearError();
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            clearSuccess();
        }
    }, [error, successMessage, clearError, clearSuccess]);

    const memberClubIds = myMemberships
        .filter((m) => m.status === 'ACTIVE')
        .map((m) => m.clubId);

    const activeMemberships = myMemberships.filter((m) => m.status === 'ACTIVE');
    const pendingMemberships = myMemberships.filter((m) => m.status === 'PENDING');
    const openClubs = clubs.filter((c) => c.registrationOpen);

    const handleViewClub = useCallback((club: ClubResponse) => {
        router.push(`/student/clubs/${club.id}`);
    }, [router]);

    const handleJoinClick = useCallback((club: ClubResponse) => {
        setSelectedClubForJoin(club);
        setJoinDialogOpen(true);
    }, []);

    const handleJoinSubmit = useCallback(
        (remarks: string) => {
            if (!selectedClubForJoin) return;
            joinClub({ clubId: selectedClubForJoin.id, remarks }).then(() => {
                setJoinDialogOpen(false);
                setSelectedClubForJoin(null);
                loadMyMemberships({ page: 0, size: 50 });
            });
        },
        [selectedClubForJoin, joinClub, loadMyMemberships],
    );

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            searchClubs({ keyword: searchQuery, page: 0, size: 20 });
        } else {
            loadClubs({ page: 0, size: 20 });
        }
    }, [searchClubs, loadClubs, searchQuery]);

    const handleRefresh = () => {
        loadClubs({ page: 0, size: 20 });
        loadMyMemberships({ page: 0, size: 50 });
    };

    // ── Stats ──
    const stats = [
        { label: 'Total Clubs', value: totalClubs, icon: Diversity3Icon, color: '#3B82F6' },
        { label: 'My Clubs', value: activeMemberships.length, icon: GroupsIcon, color: '#10B981' },
        { label: 'Pending', value: pendingMemberships.length, icon: HourglassEmptyIcon, color: '#F59E0B' },
        { label: 'Open Registration', value: openClubs.length, icon: PersonAddIcon, color: '#6366F1' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ══════════════  PAGE HEADER  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Clubs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Browse, join, and explore university clubs
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {activeMemberships.length > 0 && (
                            <Chip
                                icon={<GroupsIcon sx={{ fontSize: '16px !important' }} />}
                                label={`${activeMemberships.length} Club${activeMemberships.length !== 1 ? 's' : ''} Joined`}
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                    '& .MuiChip-icon': { color: 'inherit' },
                                }}
                            />
                        )}
                    </Stack>
                </Stack>
            </MotionBox>

            {/* ══════════════  STATS GRID  ══════════════ */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` },
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: alpha(stat.color, 0.1),
                                                    border: '1px solid',
                                                    borderColor: alpha(stat.color, 0.15),
                                                }}
                                            >
                                                <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* ══════════════  FILTERS  ══════════════ */}
            <Card
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search clubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{
                                maxWidth: { sm: 320 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton size="small" onClick={handleSearch} disabled={isClubLoading}>
                                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => { setSearchQuery(''); loadClubs({ page: 0, size: 20 }); }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                        />
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    minHeight: 36,
                                    '& .MuiTab-root': {
                                        minHeight: 36,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.8125rem',
                                        borderRadius: 1,
                                        px: 2,
                                    },
                                    '& .MuiTabs-indicator': { borderRadius: 1, height: 2 },
                                }}
                            >
                                <Tab label="All Clubs" />
                                <Tab label="Open" />
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={pendingMemberships.length}
                                            color="warning"
                                            sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
                                        >
                                            <span>My Clubs</span>
                                        </Badge>
                                    }
                                />
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={isClubLoading}
                                    size="small"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                    }}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* ══════════════  TAB PANELS  ══════════════ */}
            <AnimatePresence mode="wait">
                {activeTab === 0 && (
                    <MotionBox key="all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        <ClubList
                            clubs={clubs}
                            isLoading={isClubLoading}
                            onView={handleViewClub}
                            memberClubIds={memberClubIds}
                        />
                    </MotionBox>
                )}

                {activeTab === 1 && (
                    <MotionBox key="open" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        <ClubList clubs={clubs} isLoading={isClubLoading} onView={handleViewClub} onJoin={handleJoinClick} canJoin={permissions?.canJoinClub ?? false} memberClubIds={memberClubIds} emptyMessage="No clubs are currently accepting new members." />
                    </MotionBox>
                )}

                {activeTab === 2 && (
                    <MotionBox key="my" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {myMemberships.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                                    <GroupsIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                                </Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>You haven&apos;t joined any clubs yet</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mb: 3 }}>Browse available clubs and submit a join request to get started.</Typography>
                                <Button variant="contained" onClick={() => setActiveTab(0)} size="small" sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` }}>
                                    Browse Clubs
                                </Button>
                            </Paper>
                        ) : (
                            <Stack spacing={1.5}>
                                {activeMemberships.length > 0 && (
                                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                                        Active ({activeMemberships.length})
                                    </Typography>
                                )}
                                {activeMemberships.map((m) => (
                                    <MembershipCard key={m.id} membership={m} onLeave={(id) => leaveClub(id)} onSelect={(id) => router.push(`/student/clubs/${id}`)} />
                                ))}
                                {pendingMemberships.length > 0 && (
                                    <>
                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1, mt: 2 }}>Pending ({pendingMemberships.length})</Typography>
                                        {pendingMemberships.map((m) => (
                                            <MembershipCard key={m.id} membership={m} onLeave={() => {}} onSelect={(id) => router.push(`/student/clubs/${id}`)} />
                                        ))}
                                    </>
                                )}
                            </Stack>
                        )}
                    </MotionBox>
                )}
            </AnimatePresence>


            {/* Join Dialog */}
            <JoinClubDialog open={joinDialogOpen} onClose={() => { setJoinDialogOpen(false); setSelectedClubForJoin(null); }} onSubmit={handleJoinSubmit} clubName={selectedClubForJoin?.name || ''} isLoading={isMembershipLoading} />

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

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
    Drawer,
    Divider,
    Skeleton,
    Badge,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import VerifiedIcon from '@mui/icons-material/Verified';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion, AnimatePresence } from 'framer-motion';
import { useClub } from '@/hooks/useClub';
import { ClubList } from '@/components/club/ClubList';
import { JoinClubDialog } from '@/components/club/JoinClubDialog';
import { AnnouncementCard } from '@/components/club/AnnouncementCard';
import { ElectionCard } from '@/components/club/ElectionCard';
import type { ClubResponse, MembershipResponse } from '@/features/club/types';

const MotionBox = motion.create(Box);

// Membership card component for "My Clubs" tab
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
        COMMITTEE_MEMBER: '#6366F1',
        MEMBER: '#6B7280',
    };

    const posColor = POSITION_COLORS[membership.position] || '#6B7280';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    transform: 'translateX(4px)',
                },
            }}
            onClick={() => onSelect(membership.clubId)}
        >
            <Avatar
                sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(posColor, 0.1),
                    color: posColor,
                    fontWeight: 700,
                    fontSize: '1rem',
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
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip
                        label={membership.position.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                            fontSize: '0.68rem',
                            height: 22,
                            fontWeight: 600,
                            bgcolor: alpha(posColor, 0.1),
                            color: posColor,
                            border: `1px solid ${alpha(posColor, 0.2)}`,
                        }}
                    />
                    <Chip
                        label={membership.status}
                        size="small"
                        color={membership.status === 'ACTIVE' ? 'success' : 'warning'}
                        sx={{ fontSize: '0.68rem', height: 22 }}
                    />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                    Joined {new Date(membership.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
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
 * Student Clubs Page — Enhanced UI
 */
export default function StudentClubsPage() {
    const theme = useTheme();
    const {
        clubs,
        totalClubs,
        myMemberships,
        announcements,
        pinnedAnnouncements,
        elections,
        isClubLoading,
        isMembershipLoading,
        isAnnouncementLoading,
        isElectionLoading,
        error,
        successMessage,
        permissions,
        loadClubs,
        searchClubs,
        loadOpenRegistrationClubs,
        loadMyMemberships,
        loadPublicAnnouncements,
        loadPinnedAnnouncements,
        loadElections,
        joinClub,
        leaveClub,
        clearError,
        clearSuccess,
    } = useClub();

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [selectedClubForJoin, setSelectedClubForJoin] = useState<ClubResponse | null>(null);
    const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

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

    // Load announcements & elections for a selected club
    useEffect(() => {
        if (selectedClubId) {
            loadPublicAnnouncements(selectedClubId, { page: 0, size: 10 });
            loadPinnedAnnouncements(selectedClubId, { page: 0, size: 10 });
            loadElections(selectedClubId, { page: 0, size: 10 });
        }
    }, [selectedClubId, loadPublicAnnouncements, loadPinnedAnnouncements, loadElections]);

    const memberClubIds = myMemberships
        .filter((m) => m.status === 'ACTIVE')
        .map((m) => m.clubId);

    const activeMemberships = myMemberships.filter((m) => m.status === 'ACTIVE');
    const pendingMemberships = myMemberships.filter((m) => m.status === 'PENDING');

    const handleViewClub = useCallback((club: ClubResponse) => {
        setSelectedClubId(club.id);
        setDetailDrawerOpen(true);
    }, []);

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

    const handleRefresh = () => {
        loadClubs({ page: 0, size: 20 });
        loadMyMemberships({ page: 0, size: 50 });
    };

    const selectedClubData = clubs.find((c) => c.id === selectedClubId);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2.5,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha('#6366F1', 0.7)} 100%)`,
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Diversity3Icon sx={{ color: '#fff', fontSize: 26 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                                Clubs
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Browse, join, and explore university clubs
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {activeMemberships.length > 0 && (
                            <Chip
                                icon={<GroupsIcon sx={{ fontSize: '16px !important' }} />}
                                label={`${activeMemberships.length} Club${activeMemberships.length !== 1 ? 's' : ''} Joined`}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {/* Search Bar */}
                <TextField
                    placeholder="Search clubs by name, faculty, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{
                        mb: 2.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2.5,
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                />

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        mb: 3,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            minHeight: 44,
                        },
                        '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 },
                    }}
                >
                    <Tab label={`All Clubs (${totalClubs})`} />
                    <Tab label="Open Registration" />
                    <Tab
                        label={
                            <Badge
                                badgeContent={pendingMemberships.length}
                                color="warning"
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
                            >
                                <span>My Clubs ({activeMemberships.length})</span>
                            </Badge>
                        }
                    />
                </Tabs>
            </MotionBox>

            {/* Tab Panels */}
            <AnimatePresence mode="wait">
                {activeTab === 0 && (
                    <MotionBox
                        key="all"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ClubList
                            clubs={clubs}
                            isLoading={isClubLoading}
                            onView={handleViewClub}
                            onJoin={handleJoinClick}
                            canJoin={permissions?.canJoinClub ?? false}
                            memberClubIds={memberClubIds}
                        />
                    </MotionBox>
                )}

                {activeTab === 1 && (
                    <MotionBox
                        key="open"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ClubList
                            clubs={clubs}
                            isLoading={isClubLoading}
                            onView={handleViewClub}
                            onJoin={handleJoinClick}
                            canJoin={permissions?.canJoinClub ?? false}
                            memberClubIds={memberClubIds}
                            emptyMessage="No clubs are currently accepting new members."
                        />
                    </MotionBox>
                )}

                {activeTab === 2 && (
                    <MotionBox
                        key="my"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {myMemberships.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: { xs: 6, sm: 10 },
                                    px: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <GroupsIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                                </Box>
                                <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                                    You haven&apos;t joined any clubs yet
                                </Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                                    Browse available clubs and submit a join request to get started.
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => setActiveTab(0)}
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                                >
                                    Browse Clubs
                                </Button>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {/* Active memberships first */}
                                {activeMemberships.length > 0 && (
                                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                                        Active ({activeMemberships.length})
                                    </Typography>
                                )}
                                {activeMemberships.map((m) => (
                                    <MembershipCard
                                        key={m.id}
                                        membership={m}
                                        onLeave={(id) => leaveClub(id)}
                                        onSelect={(id) => {
                                            setSelectedClubId(id);
                                            setDetailDrawerOpen(true);
                                        }}
                                    />
                                ))}

                                {/* Pending memberships */}
                                {pendingMemberships.length > 0 && (
                                    <>
                                        <Typography
                                            variant="overline"
                                            color="text.secondary"
                                            sx={{ fontWeight: 600, letterSpacing: 1, mt: 2 }}
                                        >
                                            Pending ({pendingMemberships.length})
                                        </Typography>
                                        {pendingMemberships.map((m) => (
                                            <MembershipCard
                                                key={m.id}
                                                membership={m}
                                                onLeave={() => {}}
                                                onSelect={(id) => {
                                                    setSelectedClubId(id);
                                                    setDetailDrawerOpen(true);
                                                }}
                                            />
                                        ))}
                                    </>
                                )}
                            </Stack>
                        )}
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* Club Detail Drawer */}
            <Drawer
                anchor="right"
                open={detailDrawerOpen}
                onClose={() => setDetailDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 420 },
                        borderRadius: { xs: 0, sm: '16px 0 0 16px' },
                    },
                }}
            >
                {selectedClubId && (
                    <Box sx={{ height: '100%', overflow: 'auto' }}>
                        {/* Drawer Header */}
                        <Box
                            sx={{
                                height: 120,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha('#6366F1', 0.7)} 100%)`,
                                display: 'flex',
                                alignItems: 'flex-end',
                                px: 3,
                                pb: 2,
                                position: 'relative',
                            }}
                        >
                            <IconButton
                                onClick={() => setDetailDrawerOpen(false)}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    color: 'rgba(255,255,255,0.8)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>

                            {selectedClubData && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        src={selectedClubData.logoUrl || undefined}
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '1.25rem',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                        }}
                                    >
                                        {selectedClubData.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
                                            {selectedClubData.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                            <Chip
                                                label={selectedClubData.faculty}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.65rem',
                                                    height: 20,
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                }}
                                            />
                                            <Chip
                                                label={`${selectedClubData.memberCount} members`}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.65rem',
                                                    height: 20,
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Description */}
                        {selectedClubData?.description && (
                            <Box sx={{ px: 3, py: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {selectedClubData.description}
                                </Typography>
                            </Box>
                        )}

                        <Divider />

                        {/* Pinned Announcements */}
                        {pinnedAnnouncements.length > 0 && (
                            <>
                                <Box sx={{ px: 3, py: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <StarIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            Pinned Announcements
                                        </Typography>
                                    </Box>
                                    <Stack spacing={1.5}>
                                        {pinnedAnnouncements.map((a, i) => (
                                            <AnnouncementCard key={a.id} announcement={a} index={i} />
                                        ))}
                                    </Stack>
                                </Box>
                                <Divider />
                            </>
                        )}

                        {/* Announcements */}
                        <Box sx={{ px: 3, py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CampaignIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Public Announcements
                                </Typography>
                            </Box>
                            {isAnnouncementLoading ? (
                                <Stack spacing={1.5}>
                                    {[0, 1].map((i) => (
                                        <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                                    ))}
                                </Stack>
                            ) : announcements.length === 0 ? (
                                <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                                    No announcements yet.
                                </Typography>
                            ) : (
                                <Stack spacing={1.5}>
                                    {announcements.map((a, i) => (
                                        <AnnouncementCard key={a.id} announcement={a} index={i} />
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        <Divider />

                        {/* Elections */}
                        <Box sx={{ px: 3, py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <HowToVoteIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Elections
                                </Typography>
                            </Box>
                            {isElectionLoading ? (
                                <Stack spacing={1.5}>
                                    {[0, 1].map((i) => (
                                        <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                                    ))}
                                </Stack>
                            ) : elections.length === 0 ? (
                                <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                                    No elections scheduled.
                                </Typography>
                            ) : (
                                <Stack spacing={1.5}>
                                    {elections.map((e, i) => (
                                        <ElectionCard key={e.id} election={e} index={i} />
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        {/* Join Button at bottom */}
                        {selectedClubData &&
                            permissions?.canJoinClub &&
                            selectedClubData.registrationOpen &&
                            !memberClubIds.includes(selectedClubData.id) && (
                                <Box sx={{ p: 3, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={() => handleJoinClick(selectedClubData)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            borderRadius: 2.5,
                                            py: 1.5,
                                            boxShadow: 'none',
                                            '&:hover': { boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}` },
                                        }}
                                    >
                                        Join This Club
                                    </Button>
                                </Box>
                            )}
                    </Box>
                )}
            </Drawer>

            {/* Join Dialog */}
            <JoinClubDialog
                open={joinDialogOpen}
                onClose={() => { setJoinDialogOpen(false); setSelectedClubForJoin(null); }}
                onSubmit={handleJoinSubmit}
                clubName={selectedClubForJoin?.name || ''}
                isLoading={isMembershipLoading}
            />

            {/* Snackbars */}
            <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="error" onClose={clearError} variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={clearSuccess} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" onClose={clearSuccess} variant="filled" sx={{ borderRadius: 2 }}>{successMessage}</Alert>
            </Snackbar>
        </Box>
    );
}


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
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useClub } from '@/hooks/useClub';
import { ClubList } from '@/components/club/ClubList';
import { MembershipTable } from '@/components/club/MembershipTable';
import { AnnouncementCard } from '@/components/club/AnnouncementCard';
import { ElectionCard } from '@/components/club/ElectionCard';
import { ClubStatsCards } from '@/components/club/ClubStatsCards';
import { ActivityLogList } from '@/components/club/ActivityLogList';
import { CreateClubDialog } from '@/components/club/CreateClubDialog';
import type { ClubResponse, ActivityLogType } from '@/features/club/types';

const MotionBox = motion.create(Box);

const ACTIVITY_LOG_TYPES: { label: string; value: ActivityLogType }[] = [
    { label: 'Club Created', value: 'CLUB_CREATED' },
    { label: 'Club Updated', value: 'CLUB_UPDATED' },
    { label: 'Club Deleted', value: 'CLUB_DELETED' },
    { label: 'Registration Opened', value: 'CLUB_REGISTRATION_OPENED' },
    { label: 'Registration Closed', value: 'CLUB_REGISTRATION_CLOSED' },
    { label: 'Member Joined', value: 'MEMBER_JOINED' },
    { label: 'Member Approved', value: 'MEMBER_APPROVED' },
    { label: 'Member Rejected', value: 'MEMBER_REJECTED' },
    { label: 'Member Suspended', value: 'MEMBER_SUSPENDED' },
    { label: 'Member Left', value: 'MEMBER_LEFT' },
    { label: 'Position Changed', value: 'MEMBER_POSITION_CHANGED' },
    { label: 'Announcement Posted', value: 'ANNOUNCEMENT_POSTED' },
    { label: 'Announcement Deleted', value: 'ANNOUNCEMENT_DELETED' },
    { label: 'Election Created', value: 'ELECTION_CREATED' },
    { label: 'Election Cancelled', value: 'ELECTION_CANCELLED' },
    { label: 'Results Published', value: 'ELECTION_RESULTS_PUBLISHED' },
    { label: 'Bulk Approved', value: 'BULK_MEMBER_APPROVED' },
    { label: 'Admin Override', value: 'ADMIN_OVERRIDE' },
];

/**
 * Super Admin — Platform-wide Club Control
 * Unrestricted access to all club endpoints
 */
export default function SuperAdminClubsPage() {
    const {
        clubs,
        totalClubs,
        clubMembers,
        activeMembers,
        pendingMembers,
        totalMembers,
        totalActiveMembers,
        totalPendingMembers,
        announcements,
        pinnedAnnouncements,
        elections,
        adminClubStatistics,
        activityLogs,
        isClubLoading,
        isMembershipLoading,
        isAnnouncementLoading,
        isElectionLoading,
        isAdminStatsLoading,
        isActivityLogLoading,
        isCreating,
        isDeleting,
        error,
        successMessage,
        loadClubs,
        searchClubs,
        createClub,
        removeClub,
        adminToggleReg,
        loadClubMembers,
        loadActiveMembers,
        loadPendingMembers,
        approveMember,
        rejectMember,
        suspendMember,
        bulkApproveMembers,
        loadAnnouncements,
        loadPinnedAnnouncements,
        loadElections,
        loadAdminClubStats,
        loadActivityLogs,
        loadActivityLogsByType,
        clearError,
        clearSuccess,
    } = useClub();

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState<ClubResponse | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clubToDelete, setClubToDelete] = useState<ClubResponse | null>(null);
    const [logTypeFilter, setLogTypeFilter] = useState<string>('');

    useEffect(() => {
        loadClubs({ page: 0, size: 20 });
    }, [loadClubs]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchClubs({ keyword: searchQuery, page: 0, size: 20 });
            } else {
                loadClubs({ page: 0, size: 20 });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchClubs, loadClubs]);

    useEffect(() => {
        if (selectedClub) {
            loadClubMembers(selectedClub.id, { page: 0, size: 20 });
            loadActiveMembers(selectedClub.id, { page: 0, size: 20 });
            loadPendingMembers(selectedClub.id, { page: 0, size: 20 });
            loadAnnouncements(selectedClub.id, { page: 0, size: 20 });
            loadPinnedAnnouncements(selectedClub.id, { page: 0, size: 20 });
            loadElections(selectedClub.id, { page: 0, size: 20 });
            loadAdminClubStats(selectedClub.id);
            loadActivityLogs(selectedClub.id, { page: 0, size: 20 });
        }
    }, [selectedClub, loadClubMembers, loadActiveMembers, loadPendingMembers, loadAnnouncements, loadPinnedAnnouncements, loadElections, loadAdminClubStats, loadActivityLogs]);

    const handleViewClub = useCallback((club: ClubResponse) => {
        setSelectedClub(club);
        setActiveTab(1);
    }, []);

    const handleDeleteClub = useCallback(() => {
        if (!clubToDelete) return;
        removeClub(clubToDelete.id).then(() => {
            setDeleteConfirmOpen(false);
            setClubToDelete(null);
            if (selectedClub?.id === clubToDelete.id) {
                setSelectedClub(null);
                setActiveTab(0);
            }
        });
    }, [clubToDelete, removeClub, selectedClub]);

    const handleBulkApprove = useCallback(() => {
        if (!selectedClub) return;
        const ids = pendingMembers.map((m) => m.id);
        if (ids.length > 0) bulkApproveMembers(selectedClub.id, ids);
    }, [selectedClub, pendingMembers, bulkApproveMembers]);

    const handleLogTypeFilter = (type: string) => {
        setLogTypeFilter(type);
        if (selectedClub && type) {
            loadActivityLogsByType(selectedClub.id, type as ActivityLogType, { page: 0, size: 20 });
        } else if (selectedClub) {
            loadActivityLogs(selectedClub.id, { page: 0, size: 20 });
        }
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>Platform-wide Club Control</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Super Admin — Unrestricted access to all club operations
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Create Club
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => loadClubs({ page: 0, size: 20 })}
                            sx={{ textTransform: 'none' }}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>

                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                    <Tab label={`All Clubs (${totalClubs})`} />
                    {selectedClub && <Tab label={`${selectedClub.name} — Control Panel`} />}
                </Tabs>
            </MotionBox>

            {/* Tab 0: All Clubs */}
            {activeTab === 0 && (
                <Box>
                    <TextField
                        placeholder="Search clubs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 3 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
                                ),
                            },
                        }}
                    />
                    <ClubList
                        clubs={clubs}
                        isLoading={isClubLoading}
                        onView={handleViewClub}
                        onManage={handleViewClub}
                        canManage
                    />
                </Box>
            )}

            {/* Tab 1: Club Control Panel */}
            {activeTab === 1 && selectedClub && (
                <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Club Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>{selectedClub.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label={selectedClub.clubCode} size="small" variant="outlined" />
                                <Chip label={selectedClub.faculty} size="small" />
                                <Chip
                                    label={selectedClub.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                                    size="small"
                                    color={selectedClub.registrationOpen ? 'success' : 'default'}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => adminToggleReg(selectedClub.id)}
                                sx={{ textTransform: 'none' }}
                            >
                                Toggle Registration
                            </Button>
                            <IconButton
                                color="error"
                                onClick={() => { setClubToDelete(selectedClub); setDeleteConfirmOpen(true); }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>📊 Statistics</Typography>
                        <ClubStatsCards stats={adminClubStatistics} isLoading={isAdminStatsLoading} />
                    </Box>

                    {/* Pending */}
                    {totalPendingMembers > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    ⏳ Pending Applications ({totalPendingMembers})
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={handleBulkApprove}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Approve All
                                </Button>
                            </Box>
                            <MembershipTable
                                members={pendingMembers}
                                isLoading={isMembershipLoading}
                                showActions
                                onApprove={approveMember}
                                onReject={(id) => rejectMember(id)}
                            />
                        </Box>
                    )}

                    {/* All Members */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            👥 All Members ({totalMembers})
                        </Typography>
                        <MembershipTable
                            members={clubMembers}
                            isLoading={isMembershipLoading}
                            showActions
                            onSuspend={(id) => suspendMember(id)}
                        />
                    </Box>

                    {/* Active Members */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            ✅ Active Members ({totalActiveMembers})
                        </Typography>
                        <MembershipTable
                            members={activeMembers}
                            isLoading={isMembershipLoading}
                        />
                    </Box>

                    {/* Pinned Announcements */}
                    {pinnedAnnouncements.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>📌 Pinned Announcements</Typography>
                            <Stack spacing={2}>
                                {pinnedAnnouncements.map((a) => (
                                    <AnnouncementCard key={a.id} announcement={a} />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Announcements */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>📢 Announcements</Typography>
                        {isAnnouncementLoading ? (
                            <Typography color="text.secondary">Loading...</Typography>
                        ) : announcements.length === 0 ? (
                            <Typography color="text.secondary">No announcements.</Typography>
                        ) : (
                            <Stack spacing={2}>
                                {announcements.map((a) => (
                                    <AnnouncementCard key={a.id} announcement={a} />
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {/* Elections */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>🗳️ Elections</Typography>
                        {isElectionLoading ? (
                            <Typography color="text.secondary">Loading...</Typography>
                        ) : elections.length === 0 ? (
                            <Typography color="text.secondary">No elections.</Typography>
                        ) : (
                            <Stack spacing={2}>
                                {elections.map((e) => (
                                    <ElectionCard key={e.id} election={e} />
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {/* Activity Logs */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>📋 Activity Log</Typography>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Filter by type</InputLabel>
                                <Select
                                    value={logTypeFilter}
                                    label="Filter by type"
                                    onChange={(e) => handleLogTypeFilter(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {ACTIVITY_LOG_TYPES.map((t) => (
                                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <ActivityLogList logs={activityLogs} isLoading={isActivityLogLoading} />
                    </Box>
                </MotionBox>
            )}

            {/* Create Club Dialog */}
            <CreateClubDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={(data, logo) => {
                    createClub(data, logo).then(() => {
                        setCreateDialogOpen(false);
                        loadClubs({ page: 0, size: 20 });
                    });
                }}
                isCreating={isCreating}
            />

            {/* Delete Confirm */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Club</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete <strong>{clubToDelete?.name}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteClub} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbars */}
            <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
                <Alert severity="error" onClose={clearError}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={clearSuccess}>
                <Alert severity="success" onClose={clearSuccess}>{successMessage}</Alert>
            </Snackbar>
        </Box>
    );
}



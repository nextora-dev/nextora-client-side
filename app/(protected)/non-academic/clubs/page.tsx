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
    { label: 'Member Joined', value: 'MEMBER_JOINED' },
    { label: 'Member Approved', value: 'MEMBER_APPROVED' },
    { label: 'Member Rejected', value: 'MEMBER_REJECTED' },
    { label: 'Announcement Posted', value: 'ANNOUNCEMENT_POSTED' },
    { label: 'Election Created', value: 'ELECTION_CREATED' },
];

/**
 * Non-Academic Staff Club Management Console
 * Full CRUD on clubs, members, announcements, elections, stats, logs
 */
export default function NonAcademicClubsPage() {
    const {
        clubs,
        totalClubs,
        clubMembers,
        pendingMembers,
        totalMembers,
        totalPendingMembers,
        announcements,
        elections,
        clubStatistics,
        activityLogs,
        isClubLoading,
        isMembershipLoading,
        isAnnouncementLoading,
        isElectionLoading,
        isStatsLoading,
        isActivityLogLoading,
        isCreating,
        isDeleting,
        error,
        successMessage,
        permissions,
        loadClubs,
        searchClubs,
        createClub,
        removeClub,
        toggleReg,
        loadClubMembers,
        loadPendingMembers,
        approveMember,
        rejectMember,
        suspendMember,
        bulkApproveMembers,
        loadAnnouncements,
        loadElections,
        loadClubStatistics,
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

    // Load clubs
    useEffect(() => {
        loadClubs({ page: 0, size: 20 });
    }, [loadClubs]);

    // Search
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

    // Load club-specific data when a club is selected
    useEffect(() => {
        if (selectedClub) {
            loadClubMembers(selectedClub.id, { page: 0, size: 20 });
            loadPendingMembers(selectedClub.id, { page: 0, size: 20 });
            loadAnnouncements(selectedClub.id, { page: 0, size: 20 });
            loadElections(selectedClub.id, { page: 0, size: 20 });
            loadClubStatistics(selectedClub.id);
            loadActivityLogs(selectedClub.id, { page: 0, size: 20 });
        }
    }, [selectedClub, loadClubMembers, loadPendingMembers, loadAnnouncements, loadElections, loadClubStatistics, loadActivityLogs]);

    const handleViewClub = useCallback((club: ClubResponse) => {
        setSelectedClub(club);
        setActiveTab(1);
    }, []);

    const handleManageClub = useCallback((club: ClubResponse) => {
        setSelectedClub(club);
        setActiveTab(1);
    }, []);

    const handleDeleteClub = useCallback(() => {
        if (!clubToDelete) return;
        removeClub(clubToDelete.id).then(() => {
            setDeleteConfirmOpen(false);
            setClubToDelete(null);
            if (selectedClub?.id === clubToDelete.id) setSelectedClub(null);
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
                        <Typography variant="h4" fontWeight={700}>Club Management</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage clubs, members, announcements, elections & more
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

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                    <Tab label={`All Clubs (${totalClubs})`} />
                    {selectedClub && <Tab label={`${selectedClub.name} — Details`} />}
                </Tabs>
            </MotionBox>

            {/* Tab 0: Club List */}
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
                        onManage={handleManageClub}
                        canManage={permissions?.canCreateClub ?? false}
                    />
                </Box>
            )}

            {/* Tab 1: Club Detail Management */}
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
                                onClick={() => toggleReg(selectedClub.id)}
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
                        <ClubStatsCards stats={clubStatistics} isLoading={isStatsLoading} />
                    </Box>

                    {/* Pending Members */}
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

                    {/* Active Members */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            👥 Members ({totalMembers})
                        </Typography>
                        <MembershipTable
                            members={clubMembers}
                            isLoading={isMembershipLoading}
                            showActions
                            onSuspend={(id) => suspendMember(id)}
                        />
                    </Box>

                    {/* Announcements */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            📢 Announcements
                        </Typography>
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
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            🗳️ Elections
                        </Typography>
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

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Club</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{clubToDelete?.name}</strong>? This action cannot be undone.
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



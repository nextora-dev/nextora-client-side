'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Stack,
    Button,
    TextField,
    IconButton,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    alpha,
    useTheme,
    Divider,
    useMediaQuery,
    Tabs,
    Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import useKuppiPage from '@/hooks/useKuppiPage';
import { useAppDispatch } from '@/store';
import {
    adminFetchApplications,
    adminFetchApplicationById,
    adminFetchApplicationStats,
    adminFetchPlatformStats,
    adminApproveApplicationAsync,
    adminRejectApplicationAsync,
    fetchSessions,
    fetchSessionById,
    fetchNoteById,
    fetchNotes,
    setKuppiCurrentPage,
    setKuppiPageSize,
    clearKuppiError,
    clearKuppiSuccessMessage,
    KuppiApplicationResponse,
    KuppiSessionResponse,
    KuppiNoteResponse,
    ApplicationStatus,
    SessionStatus,
} from '@/features/kuppi';

// New component imports
import { SessionSearchPanel, ApplicationSearchPanel, ApplicationsTable, SessionsTable, NotesTable, RowActionMenu, KuppiViewDialog, KuppiCommon, KuppiOverviewStats } from '@/components/kuppi';
import DownloadIcon from "@mui/icons-material/Download";

const MotionCard = motion.create(Card);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Status colors
const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
    PENDING: '#F59E0B',
    UNDER_REVIEW: '#3B82F6',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280',
    EXPIRED: '#9CA3AF',
};

const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
    SCHEDULED: '#3B82F6',
    IN_PROGRESS: '#10B981',
    COMPLETED: '#6B7280',
    CANCELLED: '#EF4444',
};

// Get status icon
const getApplicationStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
        case 'PENDING': return <PendingIcon fontSize="small" />;
        case 'UNDER_REVIEW': return <HourglassEmptyIcon fontSize="small" />;
        case 'APPROVED': return <CheckCircleIcon fontSize="small" />;
        case 'REJECTED': return <CancelIcon fontSize="small" />;
        case 'CANCELLED': return <CancelIcon fontSize="small" />;
        case 'EXPIRED': return <ScheduleIcon fontSize="small" />;
        default: return undefined;
    }
};

const getSessionStatusIcon = (status: SessionStatus) => {
    switch (status) {
        case 'SCHEDULED': return <EventIcon fontSize="small" />;
        case 'IN_PROGRESS': return <VideoCallIcon fontSize="small" />;
        case 'COMPLETED': return <CheckCircleIcon fontSize="small" />;
        case 'CANCELLED': return <CancelIcon fontSize="small" />;
        default: return undefined;
    }
};

export default function AdminKuppiDashboard() {
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const kuppi = useKuppiPage();
    const dispatch = useAppDispatch();
    // destructure the fields used by this page for clarity
    const {
        applications,
        totalApplications,
        applicationStats,
        platformStats,
        selectedApplication,
        sessions,
        notes,
        totalSessions,
        totalNotes,
        page,
        pageSize,
        isLoading,
        isApplicationLoading,
        isSessionLoading,
        isNoteLoading,
        isApproving,
        isRejecting,
        error,
        successMessage,
        mainTab,
        setMainTab,
        applicationStatusFilter,
        setApplicationStatusFilter,
        sessionAnchorEl,
        sessionActionTarget,
        noteAnchorEl,
        noteActionTarget,
        anchorEl,
        setAnchorEl,
        selectedApp,
        setSelectedApp,
        selectedSession,
        setSelectedSession,
        selectedNote,
        setSelectedNote,
        filteredSessions,
        setFilteredSessions,
        handleMainTabChange,
        handleRefresh,
        handleApplicationMenuOpen,
        handleMenuClose,
        handleViewApplication,
        handleApprove,
        handleReject,
        handleMarkUnderReview,
        handleDeleteSession,
        handleSessionMenuOpen,
        handleSessionMenuClose,
        handleSessionView,
        handleSessionDeleteConfirm,
        handleNoteMenuOpen,
        handleNoteMenuClose,
        handleNoteView,
        handleNoteDeleteConfirm,
        handleDeleteNote,
        openSessionById,
        viewMode,
        viewDialogOpen,
        setViewDialogOpen,
        setViewMode,
        setApproveDialogOpen,
        setRejectDialogOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        reviewNotes,
        setReviewNotes,
        rejectionReason,
        setRejectionReason,
        approveDialogOpen,
        rejectDialogOpen,
        snackbar,
        setSnackbar,
        actionLoading,
    } = kuppi;

    // handlers and effects are provided by useKuppiPage hook; component uses those directly

    // Handlers are provided by useKuppiPage and were destructured above; no local redefinitions here.

    // Handle messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearKuppiSuccessMessage());
            handleRefresh();
        }
    }, [error, successMessage, dispatch, handleRefresh]);

    // Helper to render uploader which might be a string or an object
    const renderUploader = (note: KuppiNoteResponse) => {
        const u: any = (note as any).uploader;
        if (!u) return note.uploaderName ?? '';
        if (typeof u === 'string') return u;
        // try common fields
        return u.uploaderName ?? u.name ?? u.fullName ?? u.studentName ?? '';
    };

    // Prepare overview stats for common component
    const overviewStatsCommon = [
        { label: 'Total Sessions', value: platformStats?.totalSessions ?? 0, icon: EventIcon, color: '#3B82F6' },
        { label: 'Total Notes', value: platformStats?.totalNotes ?? 0, icon: DescriptionIcon, color: '#10B981' },
        { label: 'Participants', value: platformStats?.totalParticipants ?? 0, icon: PeopleIcon, color: '#6366F1' },
        { label: 'Kuppi Students', value: platformStats?.totalKuppiStudents ?? 0, icon: SchoolIcon, color: '#8B5CF6' },
        { label: 'Completed', value: platformStats?.completedSessions ?? 0, icon: CheckCircleIcon, color: '#059669' },
        { label: 'Cancelled', value: platformStats?.cancelledSessions ?? 0, icon: CancelIcon, color: '#DC2626' },
        { label: 'Total Views', value: platformStats?.totalViews ?? 0, icon: VisibilityIcon, color: '#F59E0B' },
        { label: 'Total Downloads', value: platformStats?.totalDownloads ?? 0, icon: DownloadIcon, color: '#EF4444' },
        { label: 'This Week', value: platformStats?.sessionsThisWeek ?? 0, icon: TrendingUpIcon, color: '#0EA5E9' },
        { label: 'This Month', value: platformStats?.sessionsThisMonth ?? 0, icon: CalendarMonthIcon, color: '#14B8A6' },
        { label: 'New Students', value: platformStats?.newKuppiStudentsThisMonth ?? 0, icon: PersonAddIcon, color: '#EC4899' },
    ];

    return (
        <KuppiCommon
            title="Kuppi Management"
            description="Manage sessions, notes, and applications"
            overviewStats={overviewStatsCommon}
            mainTab={mainTab}
            onMainTabChange={handleMainTabChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
        >
            {/* Children (original tab contents) */}
            {/* Applications Tab (mounted always, hidden when inactive) */}
            <Box role="tabpanel" hidden={mainTab !== 0} sx={{ display: mainTab === 0 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {/* Application Search */}
                    <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <ApplicationSearchPanel
                            pageSize={pageSize}
                            statusFilter={applicationStatusFilter}
                            onClear={() => dispatch(adminFetchApplications({ page: 0, size: pageSize, status: applicationStatusFilter || undefined }))}
                        />
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                            <Tabs
                                value={['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].indexOf(applicationStatusFilter)}
                                onChange={(_, v) => {
                                    const statuses: (ApplicationStatus | '')[] = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];
                                    setApplicationStatusFilter(statuses[v]);
                                    dispatch(adminFetchApplications({ page: 0, size: pageSize, status: statuses[v] || undefined }));
                                }}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
                            >
                                <Tab label="All" />
                                <Tab label="Pending" />
                                <Tab label="Under Review" />
                                <Tab label="Approved" />
                                <Tab label="Rejected" />
                                <Tab label="Cancelled" />
                                <Tab label="Expired" />
                            </Tabs>
                        </Stack>
                    </CardContent>

                    <ApplicationsTable
                        applications={applications}
                        total={totalApplications}
                        page={page}
                        rowsPerPage={pageSize}
                        isLoading={isApplicationLoading}
                        isTablet={isTablet}
                        onOpenMenu={(e, app) => handleApplicationMenuOpen(e, app)}
                        onChangePage={(p) => { dispatch(setKuppiCurrentPage(p)); dispatch(adminFetchApplications({ page: p, size: pageSize, status: applicationStatusFilter || undefined })); }}
                        onChangeRowsPerPage={(size) => { dispatch(setKuppiPageSize(size)); dispatch(setKuppiCurrentPage(0)); }}
                    />
                </MotionCard>
            </Box>

            {/* Sessions Tab (mounted always, hidden when inactive) */}
            <Box role="tabpanel" hidden={mainTab !== 1} sx={{ display: mainTab === 1 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {/* Search Panel - Always visible */}
                    <Box sx={{ mb: 2, p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <SessionSearchPanel onResults={(results) => setFilteredSessions(results)} />
                    </Box>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : (
                        (() => {
                            const sessionsToShow = filteredSessions ?? sessions;
                            if (sessionsToShow.length === 0) {
                                return (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography color="text.secondary">No sessions found</Typography>
                                    </Box>
                                );
                            }
                            return (
                                <>
                                    <TableContainer>
                                        <Table size={isTablet ? 'small' : 'medium'}>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>Session</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Host</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sessionsToShow.map((session) => {
                                                    const sessionColor = SESSION_STATUS_COLORS[(session.status as SessionStatus)] ?? '#6B7280';
                                                    return (
                                                        <TableRow key={session.id} hover>
                                                            <TableCell>
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={600}>{session.title}</Typography>
                                                                    <Chip label={session.subject} size="small" sx={{ mt: 0.5 }} />
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                                <Typography variant="body2">{session.host?.fullName ?? ''}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    icon={getSessionStatusIcon(session.status)}
                                                                    label={session.status ?? '—'}
                                                                    size="small"
                                                                    sx={{ bgcolor: alpha(sessionColor, 0.1), color: sessionColor, '& .MuiChip-icon': { color: 'inherit' } }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                                <Typography variant="caption">{session.scheduledStartTime ? new Date(session.scheduledStartTime).toLocaleDateString() : ''}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">{session.viewCount}</Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small" onClick={(e) => handleSessionMenuOpen(e, session)}><MoreVertIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        component="div"
                                        count={totalSessions}
                                        page={page}
                                        onPageChange={(_, p) => { dispatch(setKuppiCurrentPage(p)); dispatch(fetchSessions({ page: p, size: pageSize })); }}
                                        rowsPerPage={pageSize}
                                        onRowsPerPageChange={(e) => { dispatch(setKuppiPageSize(parseInt(e.target.value, 10))); dispatch(setKuppiCurrentPage(0)); }}
                                        rowsPerPageOptions={[5, 10, 25]}
                                    />
                                </>
                            );
                        })()
                    )}
                </MotionCard>
            </Box>

            {/* Notes Tab (mounted always, hidden when inactive) */}
            <Box role="tabpanel" hidden={mainTab !== 2} sx={{ display: mainTab === 2 ? 'block' : 'none' }}>
                <NotesTable
                    notes={notes}
                    total={totalNotes}
                    page={page}
                    rowsPerPage={pageSize}
                    isLoading={isLoading}
                    isTablet={isTablet}
                    onOpenMenu={handleNoteMenuOpen}
                    onChangePage={(p) => { dispatch(setKuppiCurrentPage(p)); dispatch(fetchNotes({ page: p, size: pageSize })); }}
                    onChangeRowsPerPage={(size) => { dispatch(setKuppiPageSize(size)); dispatch(setKuppiCurrentPage(0)); }}
                    onOpenSessionById={openSessionById}
                />
            </Box>

            {/* Row action menus handled via RowActionMenu component */}
            <RowActionMenu
                anchorEl={sessionAnchorEl}
                open={Boolean(sessionAnchorEl)}
                mode="session"
                targetItem={sessionActionTarget}
                onClose={handleSessionMenuClose}
                onView={handleSessionView}
                onDelete={handleSessionDeleteConfirm}
            />

            <RowActionMenu
                anchorEl={noteAnchorEl}
                open={Boolean(noteAnchorEl)}
                mode="note"
                targetItem={noteActionTarget}
                onClose={handleNoteMenuClose}
                onView={handleNoteView}
                onDelete={handleNoteDeleteConfirm}
            />

            <RowActionMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                mode="application"
                targetItem={selectedApp}
                onClose={handleMenuClose}
                onView={handleViewApplication}
                onApprove={() => { handleMenuClose(); setApproveDialogOpen(true); }}
                onReject={() => { handleMenuClose(); setRejectDialogOpen(true); }}
                onMarkUnderReview={handleMarkUnderReview}
            />

            {/* Centralized view dialog component */}
            <KuppiViewDialog
                open={viewDialogOpen}
                mode={viewMode}
                application={selectedApplication}
                session={selectedSession}
                note={selectedNote}
                isApplicationLoading={isApplicationLoading}
                isSessionLoading={isSessionLoading}
                isNoteLoading={isNoteLoading}
                onClose={() => { setViewDialogOpen(false); setViewMode(null); }}
                onOpenSessionById={openSessionById}
                renderFooter={null}
            />

            {/* Approve Application Dialog */}
            <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Are you sure you want to approve this application? The student will be notified.
                    </Typography>
                    <TextField
                        label="Review Notes (optional)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApproveDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleApprove} variant="contained" color="primary" disabled={isApproving}>
                        {isApproving ? <CircularProgress size={24} color="inherit" /> : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Application Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Are you sure you want to reject this application? The student will be notified.
                    </Typography>
                    <TextField
                        label="Rejection Reason"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Review Notes (optional)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleReject} variant="contained" color="error" disabled={isRejecting}>
                        {isRejecting ? <CircularProgress size={24} color="inherit" /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={selectedSession ? handleDeleteSession : handleDeleteNote}
                        variant="contained"
                        color="error"
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for messages */}
            <Snackbar
                open={snackbar.open}
                onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })}
                autoHideDuration={6000}
            >
                <Alert onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </KuppiCommon>
    );
}

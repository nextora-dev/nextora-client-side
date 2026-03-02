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
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import DownloadIcon from '@mui/icons-material/Download';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { SessionSearchPanel, SessionsTable, NotesTable, RowActionMenu, KuppiViewDialog, KuppiCommon, ApplicationsTable, ApplicationSearchPanel } from '@/components/kuppi';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    adminFetchApplications,
    adminFetchApplicationById,
    adminFetchApplicationStats,
    adminApproveApplicationAsync,
    adminRejectApplicationAsync,
    adminFetchPlatformStats,
    fetchSessions,
    fetchSessionById,
    fetchNotes,
    fetchNoteById,
    setKuppiCurrentPage,
    setKuppiPageSize,
    clearKuppiError,
    clearKuppiSuccessMessage,
    selectKuppiAllApplications,
    selectKuppiTotalApplications,
    selectKuppiApplicationStats,
    selectKuppiSelectedApplication,
    selectKuppiPlatformStats,
    selectKuppiSessions,
    selectKuppiNotes,
    selectKuppiTotalSessions,
    selectKuppiTotalNotes,
    selectKuppiCurrentPage,
    selectKuppiPageSize,
    selectKuppiIsApplicationLoading,
    selectKuppiIsLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    selectKuppiIsCreating,
    selectKuppiIsUpdating,
    selectKuppiIsDeleting,
    adminSoftDeleteSessionAsync,
    adminSoftDeleteNoteAsync,
    KuppiApplicationResponse,
    KuppiSessionResponse,
    KuppiNoteResponse,
    ApplicationStatus,
    SessionStatus,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';

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

export default function AcademicKuppiDashboard() {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Selectors
    const applications = useAppSelector(selectKuppiAllApplications);
    const totalApplications = useAppSelector(selectKuppiTotalApplications);
    const applicationStats = useAppSelector(selectKuppiApplicationStats);
    const platformStats = useAppSelector(selectKuppiPlatformStats);
    const selectedApplication = useAppSelector(selectKuppiSelectedApplication);
    const sessions = useAppSelector(selectKuppiSessions);
    const notes = useAppSelector(selectKuppiNotes);
    const totalSessions = useAppSelector(selectKuppiTotalSessions);
    const totalNotes = useAppSelector(selectKuppiTotalNotes);
    const page = useAppSelector(selectKuppiCurrentPage);
    const pageSize = useAppSelector(selectKuppiPageSize);
    const isLoading = useAppSelector(selectKuppiIsLoading);
    const isApplicationLoading = useAppSelector(selectKuppiIsApplicationLoading);
    const isApproving = useAppSelector(selectKuppiIsCreating);
    const isRejecting = useAppSelector(selectKuppiIsUpdating);
    const isDeleting = useAppSelector(selectKuppiIsDeleting);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [mainTab, setMainTab] = useState(0);
    const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationStatus | ''>('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedApp, setSelectedApp] = useState<KuppiApplicationResponse | null>(null);
    const [selectedSession, setSelectedSession] = useState<KuppiSessionResponse | null>(null);
    const [selectedNote, setSelectedNote] = useState<KuppiNoteResponse | null>(null);
    // viewMode allows showing application, session or note in the same dialog
    const [viewMode, setViewMode] = useState<'application' | 'session' | 'note' | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [actionLoading, setActionLoading] = useState(false);

    // Session & note menus and search state (admin parity)
    const [sessionAnchorEl, setSessionAnchorEl] = useState<null | HTMLElement>(null);
    const [sessionActionTarget, setSessionActionTarget] = useState<KuppiSessionResponse | null>(null);
    const [noteAnchorEl, setNoteAnchorEl] = useState<null | HTMLElement>(null);
    const [noteActionTarget, setNoteActionTarget] = useState<KuppiNoteResponse | null>(null);
    const [filteredSessions, setFilteredSessions] = useState<KuppiSessionResponse[] | null>(null);

    // Fetch data on mount
    useEffect(() => {
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
        dispatch(adminFetchApplications({ page: 0, size: pageSize }));
        dispatch(fetchSessions({ page: 0, size: pageSize }));
        dispatch(fetchNotes({ page: 0, size: pageSize }));
    }, [dispatch, pageSize]);

    // session & note loading flags (for dialog spinners)
    const isSessionLoading = useAppSelector((state) => (state as any).kuppi?.isSessionLoading ?? false);
    const isNoteLoading = useAppSelector((state) => (state as any).kuppi?.isNoteLoading ?? false);

    const handleMainTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setMainTab(newValue);
        dispatch(setKuppiCurrentPage(0));
        // Fetch the relevant data immediately when switching tabs so sessions/notes load like admin
        if (newValue === 0) {
            dispatch(adminFetchApplications({ page: 0, size: pageSize, status: applicationStatusFilter || undefined }));
        } else if (newValue === 1) {
            dispatch(fetchSessions({ page: 0, size: pageSize }));
            setFilteredSessions(null);
        } else if (newValue === 2) {
            dispatch(fetchNotes({ page: 0, size: pageSize }));
        }
    };

    const handleRefresh = useCallback(() => {
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
        if (mainTab === 0) {
            dispatch(adminFetchApplications({ page, size: pageSize, status: applicationStatusFilter || undefined }));
        } else if (mainTab === 1) {
            dispatch(fetchSessions({ page, size: pageSize }));
            // clear any client-side session filters when refreshing
            setFilteredSessions(null);
        } else if (mainTab === 2) {
            dispatch(fetchNotes({ page, size: pageSize }));
        }
    }, [dispatch, mainTab, page, pageSize, applicationStatusFilter]);

    const handleApplicationMenuOpen = (event: React.MouseEvent<HTMLElement>, app: KuppiApplicationResponse) => {
        setAnchorEl(event.currentTarget);
        setSelectedApp(app);
    };

    const handleMenuClose = () => setAnchorEl(null);

    // Session action menu handlers
    const handleSessionMenuOpen = (event: React.MouseEvent<HTMLElement>, session: KuppiSessionResponse) => {
        setSessionAnchorEl(event.currentTarget);
        setSessionActionTarget(session);
    };
    const handleSessionMenuClose = () => {
        setSessionAnchorEl(null);
        setSessionActionTarget(null);
    };

    const handleSessionView = async () => {
        handleSessionMenuClose();
        if (sessionActionTarget) {
            // clear other selections
            setSelectedApp(null);
            setSelectedNote(null);
            setSelectedSession(null);
            setViewMode('session');
            setViewDialogOpen(true);
            try {
                const session = await dispatch((fetchSessionById as any)(sessionActionTarget.id)).unwrap();
                setSelectedSession(session as KuppiSessionResponse);
            } catch (err: unknown) {
                setSnackbar({ open: true, message: (err as any)?.message || 'Failed to fetch session', severity: 'error' });
                setViewDialogOpen(false);
                setViewMode(null);
            }
        }
    };

    const handleSessionDeleteConfirm = () => {
        handleSessionMenuClose();
        if (sessionActionTarget) {
            setSelectedSession(sessionActionTarget);
            setDeleteDialogOpen(true);
        }
    };

    // Note action menu handlers
    const handleNoteMenuOpen = (event: React.MouseEvent<HTMLElement>, note: KuppiNoteResponse) => {
        setNoteAnchorEl(event.currentTarget);
        setNoteActionTarget(note);
    };
    const handleNoteMenuClose = () => {
        setNoteAnchorEl(null);
        setNoteActionTarget(null);
    };

    const handleNoteView = async () => {
        handleNoteMenuClose();
        if (noteActionTarget) {
            setSelectedApp(null);
            setSelectedSession(null);
            setSelectedNote(null);
            setViewMode('note');
            setViewDialogOpen(true);
            try {
                const note = await dispatch((fetchNoteById as any)(noteActionTarget.id)).unwrap();
                setSelectedNote(note as KuppiNoteResponse);
            } catch (err: unknown) {
                setSnackbar({ open: true, message: (err as any)?.message || 'Failed to fetch note', severity: 'error' });
                setViewDialogOpen(false);
                setViewMode(null);
            }
        }
    };

    const handleNoteDeleteConfirm = () => {
        handleNoteMenuClose();
        if (noteActionTarget) {
            setSelectedNote(noteActionTarget);
            setDeleteDialogOpen(true);
        }
    };

    // Open session by id and show session view in dialog (used from note view)
    const openSessionById = async (sessionId?: number | string | null, prevNoteToRestore?: KuppiNoteResponse | null) => {
        if (sessionId === null || sessionId === undefined) {
            setSnackbar({ open: true, message: 'Session not available for this note', severity: 'error' });
            return;
        }
        const prevNote = prevNoteToRestore ?? null;
        setSelectedNote(null);
        setSelectedApp(null);
        setSelectedSession(null);
        setViewMode('session');
        setViewDialogOpen(true);
        try {
            const session = await dispatch((fetchSessionById as any)(Number(sessionId))).unwrap();
            setSelectedSession(session as KuppiSessionResponse);
        } catch (err: unknown) {
            setSnackbar({ open: true, message: (err as any)?.message || 'Failed to open session', severity: 'error' });
            setViewDialogOpen(false);
            setViewMode(null);
            if (prevNote) {
                setSelectedNote(prevNote);
                setViewMode('note');
                setViewDialogOpen(true);
            }
        }
    };

    const handleViewApplication = () => {
        handleMenuClose();
        if (selectedApp) {
            dispatch(adminFetchApplicationById(selectedApp.id));
            setViewDialogOpen(true);
         }
    };

    const handleApprove = () => {
        if (selectedApp) {
            dispatch(adminApproveApplicationAsync({ id: selectedApp.id, data: reviewNotes ? { reviewNotes } : undefined }));
            setApproveDialogOpen(false);
            setReviewNotes('');
        }
    };

    const handleReject = () => {
        if (selectedApp && rejectionReason) {
            dispatch(adminRejectApplicationAsync({ id: selectedApp.id, data: { rejectionReason, reviewNotes } }));
            setRejectDialogOpen(false);
            setRejectionReason('');
            setReviewNotes('');
        }
    };

    const handleMarkUnderReview = async () => {
        handleMenuClose();
        if (selectedApp) {
            try {
                await kuppiServices.adminMarkUnderReview(selectedApp.id);
                handleRefresh();
                setSnackbar({ open: true, message: 'Marked as under review', severity: 'success' });
            } catch {
                setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
            }
        }
    };

    const handleDeleteSession = async () => {
        if (selectedSession) {
            setActionLoading(true);
            try {
                await dispatch(adminSoftDeleteSessionAsync(selectedSession.id)).unwrap();
                setDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Session deleted', severity: 'success' });
            } catch (err: unknown) {
                setSnackbar({ open: true, message: (err as any)?.message || 'Failed to delete session', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteNote = async () => {
        if (selectedNote) {
            setActionLoading(true);
            try {
                await dispatch(adminSoftDeleteNoteAsync(selectedNote.id)).unwrap();
                setDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Note deleted', severity: 'success' });
            } catch (err: unknown) {
                setSnackbar({ open: true, message: (err as any)?.message || 'Failed to delete note', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

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
            />

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Approve this application? The student will become a Kuppi host.</Typography>
                    <TextField label="Review Notes (Optional)" multiline rows={3} fullWidth value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleApprove} disabled={isApproving}>{isApproving ? <CircularProgress size={20} /> : 'Approve'}</Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Rejection Reason" multiline rows={2} fullWidth required value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                        <TextField label="Review Notes (Optional)" multiline rows={2} fullWidth value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject} disabled={isRejecting || !rejectionReason}>{isRejecting ? <CircularProgress size={20} /> : 'Reject'}</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this {selectedSession ? 'session' : 'note'}? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={selectedSession ? handleDeleteSession : handleDeleteNote} disabled={actionLoading || isDeleting}>{actionLoading || isDeleting ? <CircularProgress size={20} /> : 'Delete'}</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </KuppiCommon>
    );
}

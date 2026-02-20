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
    InputAdornment,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    alpha,
    useTheme,
    Divider,
    useMediaQuery,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    adminFetchApplications,
    adminFetchApplicationById,
    adminFetchApplicationStats,
    adminApproveApplicationAsync,
    adminRejectApplicationAsync,
    adminFetchPlatformStats,
    fetchSessions,
    fetchNotes,
    setKuppiCurrentPage,
    setKuppiPageSize,
    clearKuppiSelectedApplication,
    clearKuppiError,
    clearKuppiSuccessMessage,
    clearKuppiSelectedSession,
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
    KuppiApplicationResponse,
    KuppiSessionResponse,
    KuppiNoteResponse,
    ApplicationStatus,
    SessionStatus,
    ReviewKuppiApplicationRequest,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

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
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [mainTab, setMainTab] = useState(0); // 0: Overview, 1: Applications, 2: Sessions, 3: Notes
    const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationStatus | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedApp, setSelectedApp] = useState<KuppiApplicationResponse | null>(null);
    const [selectedSession, setSelectedSession] = useState<KuppiSessionResponse | null>(null);
    const [selectedNote, setSelectedNote] = useState<KuppiNoteResponse | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
        dispatch(adminFetchApplications({ page: 0, size: pageSize }));
        dispatch(fetchSessions({ page: 0, size: pageSize }));
        dispatch(fetchNotes({ page: 0, size: pageSize }));
    }, [dispatch, pageSize]);

    // Handle tab change
    const handleMainTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setMainTab(newValue);
        dispatch(setKuppiCurrentPage(0));
    };

    // Handle refresh
    const handleRefresh = useCallback(() => {
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
        if (mainTab === 1) {
            dispatch(adminFetchApplications({ page, size: pageSize, status: applicationStatusFilter || undefined }));
        } else if (mainTab === 2) {
            dispatch(fetchSessions({ page, size: pageSize }));
        } else if (mainTab === 3) {
            dispatch(fetchNotes({ page, size: pageSize }));
        }
    }, [dispatch, mainTab, page, pageSize, applicationStatusFilter]);

    // Application handlers
    const handleApplicationMenuOpen = (event: React.MouseEvent<HTMLElement>, app: KuppiApplicationResponse) => {
        setAnchorEl(event.currentTarget);
        setSelectedApp(app);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
            }
        }
    };

    // Session handlers
    const handleDeleteSession = async () => {
        if (selectedSession) {
            setActionLoading(true);
            try {
                await kuppiServices.adminDeleteSession(selectedSession.id);
                setDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Session deleted', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to delete session', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Note handlers
    const handleDeleteNote = async () => {
        if (selectedNote) {
            setActionLoading(true);
            try {
                await kuppiServices.adminDeleteNote(selectedNote.id);
                setDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Note deleted', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to delete note', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

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

    // Overview stats
    const overviewStats = [
        { label: 'Total Sessions', value: platformStats?.totalSessions ?? 0, icon: EventIcon, color: '#3B82F6' },
        { label: 'Total Notes', value: platformStats?.totalNotes ?? 0, icon: DescriptionIcon, color: '#10B981' },
        { label: 'Kuppi Students', value: platformStats?.totalKuppiStudents ?? applicationStats?.totalKuppiStudents ?? 0, icon: SchoolIcon, color: '#8B5CF6' },
        { label: 'Total Views', value: platformStats?.totalViews ?? 0, icon: VisibilityIcon, color: '#F59E0B' },
        { label: 'Total Downloads', value: platformStats?.totalDownloads ?? 0, icon: DownloadIcon, color: '#EF4444' },
        { label: 'Pending Apps', value: applicationStats?.pendingApplications ?? 0, icon: PendingIcon, color: '#EC4899' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>Kuppi Management</Typography>
                        <Typography variant="body2" color="text.secondary">Manage sessions, notes, and applications</Typography>
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleRefresh} disabled={isLoading} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </MotionBox>

            {/* Overview Stats */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {overviewStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
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

            {/* Main Tabs */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 2 }}>
                    <Tabs value={mainTab} onChange={handleMainTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab label="Applications" icon={<AssignmentIcon />} iconPosition="start" />
                        <Tab label="Sessions" icon={<EventIcon />} iconPosition="start" />
                        <Tab label="Notes" icon={<DescriptionIcon />} iconPosition="start" />
                    </Tabs>
                </CardContent>
            </MotionCard>

            {/* Applications Tab */}
            {mainTab === 0 && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                            <Tabs
                                value={applicationStatusFilter === '' ? 0 : applicationStatusFilter === 'PENDING' ? 1 : applicationStatusFilter === 'UNDER_REVIEW' ? 2 : 3}
                                onChange={(_, v) => {
                                    const statuses: (ApplicationStatus | '')[] = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED'];
                                    setApplicationStatusFilter(statuses[v]);
                                    dispatch(adminFetchApplications({ page: 0, size: pageSize, status: statuses[v] || undefined }));
                                }}
                                sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
                            >
                                <Tab label="All" />
                                <Tab label="Pending" />
                                <Tab label="Under Review" />
                                <Tab label="Approved" />
                            </Tabs>
                        </Stack>
                    </CardContent>

                    {isApplicationLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : applications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography color="text.secondary">No applications found</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table size={isTablet ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Subjects</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>GPA</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {applications.map((app) => (
                                            <TableRow key={app.id} hover>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main }}>{app.studentName?.[0]}</Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{app.studentName}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{app.studentEmail}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                        {app.subjectsToTeach.slice(0, 2).map((s, i) => <Chip key={i} label={s} size="small" />)}
                                                        {app.subjectsToTeach.length > 2 && <Chip label={`+${app.subjectsToTeach.length - 2}`} size="small" />}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                                                        <Typography variant="body2" fontWeight={600}>{app.currentGpa.toFixed(2)}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getApplicationStatusIcon(app.status)}
                                                        label={app.statusDisplayName}
                                                        size="small"
                                                        sx={{ bgcolor: alpha(APPLICATION_STATUS_COLORS[app.status], 0.1), color: APPLICATION_STATUS_COLORS[app.status], '& .MuiChip-icon': { color: 'inherit' } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={(e) => handleApplicationMenuOpen(e, app)}><MoreVertIcon /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={totalApplications}
                                page={page}
                                onPageChange={(_, p) => { dispatch(setKuppiCurrentPage(p)); dispatch(adminFetchApplications({ page: p, size: pageSize, status: applicationStatusFilter || undefined })); }}
                                rowsPerPage={pageSize}
                                onRowsPerPageChange={(e) => { dispatch(setKuppiPageSize(parseInt(e.target.value, 10))); dispatch(setKuppiCurrentPage(0)); }}
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </>
                    )}
                </MotionCard>
            )}

            {/* Sessions Tab */}
            {mainTab === 1 && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : sessions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography color="text.secondary">No sessions found</Typography>
                        </Box>
                    ) : (
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
                                        {sessions.map((session) => (
                                            <TableRow key={session.id} hover>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{session.title}</Typography>
                                                        <Chip label={session.subject} size="small" sx={{ mt: 0.5 }} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                    <Typography variant="body2">{session.hostName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getSessionStatusIcon(session.status)}
                                                        label={session.status}
                                                        size="small"
                                                        sx={{ bgcolor: alpha(SESSION_STATUS_COLORS[session.status], 0.1), color: SESSION_STATUS_COLORS[session.status], '& .MuiChip-icon': { color: 'inherit' } }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                    <Typography variant="caption">{new Date(session.scheduledStartTime).toLocaleDateString()}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{session.viewCount}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => { setSelectedSession(session); setDeleteDialogOpen(true); }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                    )}
                </MotionCard>
            )}

            {/* Notes Tab */}
            {mainTab === 2 && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : notes.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography color="text.secondary">No notes found</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table size={isTablet ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Uploader</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Downloads</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {notes.map((note) => (
                                            <TableRow key={note.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{note.title}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                    <Typography variant="body2">{note.uploaderName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={note.fileType?.toUpperCase() || 'FILE'} size="small" />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{note.viewCount}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                    <Typography variant="body2">{note.downloadCount}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => { setSelectedNote(note); setDeleteDialogOpen(true); }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={totalNotes}
                                page={page}
                                onPageChange={(_, p) => { dispatch(setKuppiCurrentPage(p)); dispatch(fetchNotes({ page: p, size: pageSize })); }}
                                rowsPerPage={pageSize}
                                onRowsPerPageChange={(e) => { dispatch(setKuppiPageSize(parseInt(e.target.value, 10))); dispatch(setKuppiCurrentPage(0)); }}
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </>
                    )}
                </MotionCard>
            )}

            {/* Application Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewApplication}><VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details</MenuItem>
                {selectedApp?.canBeApproved && (
                    <MenuItem onClick={() => { handleMenuClose(); setApproveDialogOpen(true); }} sx={{ color: 'success.main' }}>
                        <ThumbUpIcon sx={{ mr: 1.5, fontSize: 20 }} />Approve
                    </MenuItem>
                )}
                {selectedApp?.canBeRejected && (
                    <MenuItem onClick={() => { handleMenuClose(); setRejectDialogOpen(true); }} sx={{ color: 'error.main' }}>
                        <ThumbDownIcon sx={{ mr: 1.5, fontSize: 20 }} />Reject
                    </MenuItem>
                )}
                {selectedApp?.status === 'PENDING' && (
                    <MenuItem onClick={handleMarkUnderReview} sx={{ color: 'info.main' }}>
                        <HourglassEmptyIcon sx={{ mr: 1.5, fontSize: 20 }} />Mark Under Review
                    </MenuItem>
                )}
            </Menu>

            {/* View Application Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Application Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {isApplicationLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : selectedApplication ? (
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main }}>{selectedApplication.studentName?.[0]}</Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>{selectedApplication.studentName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedApplication.studentEmail}</Typography>
                                </Box>
                            </Stack>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">GPA</Typography><Typography variant="body1" fontWeight={600}>{selectedApplication.currentGpa.toFixed(2)}</Typography></Grid>
                                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Semester</Typography><Typography variant="body1">{selectedApplication.currentSemester}</Typography></Grid>
                                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Level</Typography><Typography variant="body1">{selectedApplication.preferredExperienceLevel}</Typography></Grid>
                                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Status</Typography><Chip icon={getApplicationStatusIcon(selectedApplication.status)} label={selectedApplication.statusDisplayName} size="small" sx={{ bgcolor: alpha(APPLICATION_STATUS_COLORS[selectedApplication.status], 0.1), color: APPLICATION_STATUS_COLORS[selectedApplication.status], '& .MuiChip-icon': { color: 'inherit' } }} /></Grid>
                            </Grid>
                            <Box><Typography variant="caption" color="text.secondary">Subjects</Typography><Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>{selectedApplication.subjectsToTeach.map((s, i) => <Chip key={i} label={s} size="small" />)}</Stack></Box>
                            <Box><Typography variant="caption" color="text.secondary">Motivation</Typography><Typography variant="body2">{selectedApplication.motivation}</Typography></Box>
                            {selectedApplication.relevantExperience && <Box><Typography variant="caption" color="text.secondary">Experience</Typography><Typography variant="body2">{selectedApplication.relevantExperience}</Typography></Box>}
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    {selectedApplication?.canBeApproved && <Button variant="contained" color="success" onClick={() => { setViewDialogOpen(false); setApproveDialogOpen(true); }}>Approve</Button>}
                    {selectedApplication?.canBeRejected && <Button variant="contained" color="error" onClick={() => { setViewDialogOpen(false); setRejectDialogOpen(true); }}>Reject</Button>}
                </DialogActions>
            </Dialog>

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
                    <Button variant="contained" color="error" onClick={selectedSession ? handleDeleteSession : handleDeleteNote} disabled={actionLoading}>
                        {actionLoading ? <CircularProgress size={20} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


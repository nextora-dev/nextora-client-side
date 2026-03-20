'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    alpha,
    useTheme,
    Grid,
    Card,
    CardContent,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Paper,
    Skeleton,
    Divider,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningIcon from '@mui/icons-material/Warning';
import GroupsIcon from '@mui/icons-material/Groups';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchAdminAllMeetings,
    adminForceCancelAsync,
    adminPermanentDeleteAsync,
    fetchPlatformStatistics,
    fetchLecturerStatsAdmin,
    fetchMeetingById,
    selectMeetings,
    selectTotalMeetings,
    selectTotalPages,
    selectPlatformStatistics,
    selectLecturerStatistics,
    selectSelectedMeeting,
    selectIsMeetingLoading,
    selectIsStatsLoading,
    selectIsActionLoading,
    selectMeetingError,
    selectMeetingSuccess,
    clearMeetingError,
    clearMeetingSuccess,
    clearSelectedMeeting,
} from '@/features/meeting/meetingSlice';
import type { MeetingResponse, MeetingStatus, MeetingStatistics } from '@/features/meeting/types';
import MeetingDetailDialog from '@/components/meeting/MeetingDetailDialog';

// ============================================================================
// Animation
// ============================================================================

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<MeetingStatus, string> = {
    PENDING: '#F59E0B',
    ACCEPTED: '#3B82F6',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280',
    IN_PROGRESS: '#10B981',
    COMPLETED: '#8B5CF6',
    RESCHEDULED: '#D97706',
    NO_SHOW: '#991B1B',
};

const ALL_STATUSES: MeetingStatus[] = [
    'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED', 'NO_SHOW',
];

const formatDateTime = (value: string | null) =>
    value ? new Date(value).toLocaleString() : 'N/A';

// ============================================================================
// Component
// ============================================================================

export default function SuperAdminMeetingsPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Selectors
    const meetings = useAppSelector(selectMeetings);
    const totalMeetings = useAppSelector(selectTotalMeetings);
    const totalPages = useAppSelector(selectTotalPages);
    const platformStatistics = useAppSelector(selectPlatformStatistics);
    const lecturerStatistics = useAppSelector(selectLecturerStatistics);
    const selectedMeeting = useAppSelector(selectSelectedMeeting);
    const isMeetingLoading = useAppSelector(selectIsMeetingLoading);
    const isStatsLoading = useAppSelector(selectIsStatsLoading);
    const isActionLoading = useAppSelector(selectIsActionLoading);
    const error = useAppSelector(selectMeetingError);
    const successMessage = useAppSelector(selectMeetingSuccess);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'ALL'>('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [detailOpen, setDetailOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
    const [lecturerIdInput, setLecturerIdInput] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // ── Data loading ──

    const loadMeetings = useCallback(() => {
        dispatch(fetchAdminAllMeetings({ page, size: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    useEffect(() => {
        loadMeetings();
        dispatch(fetchPlatformStatistics());
    }, [loadMeetings, dispatch]);

    // ── Search debounce ──

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            dispatch(fetchAdminAllMeetings({ page: 0, size: rowsPerPage }));
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // ── Error / success snackbar ──

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearMeetingError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearMeetingSuccess());
        }
    }, [error, successMessage, dispatch]);

    // ── Handlers ──

    const handleRefresh = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setPage(0);
        dispatch(fetchAdminAllMeetings({ page: 0, size: rowsPerPage }));
        dispatch(fetchPlatformStatistics());
    };

    const handleViewDetails = (meeting: MeetingResponse) => {
        dispatch(fetchMeetingById(meeting.id));
        setDetailOpen(true);
    };

    const handleOpenCancel = (meetingId: number) => {
        setSelectedMeetingId(meetingId);
        setCancelReason('');
        setCancelDialogOpen(true);
    };

    const handleForceCancel = () => {
        if (selectedMeetingId !== null) {
            dispatch(adminForceCancelAsync({ id: selectedMeetingId, reason: cancelReason || 'Force cancelled by super admin' })).then(() => {
                setCancelDialogOpen(false);
                setSelectedMeetingId(null);
                setCancelReason('');
                loadMeetings();
            });
        }
    };

    const handleOpenDelete = (meetingId: number) => {
        setSelectedMeetingId(meetingId);
        setDeleteDialogOpen(true);
    };

    const handlePermanentDelete = () => {
        if (selectedMeetingId !== null) {
            dispatch(adminPermanentDeleteAsync(selectedMeetingId)).then(() => {
                setDeleteDialogOpen(false);
                setSelectedMeetingId(null);
                loadMeetings();
                dispatch(fetchPlatformStatistics());
            });
        }
    };

    const handleLecturerStatsLookup = () => {
        const id = parseInt(lecturerIdInput, 10);
        if (!isNaN(id) && id > 0) {
            dispatch(fetchLecturerStatsAdmin(id));
        }
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ── Filtered meetings ──

    const filteredMeetings = meetings.filter((m) => {
        const matchesSearch = searchQuery.trim() === '' ||
            m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // ── Stats cards ──

    const statsCards = platformStatistics
        ? [
            { label: 'Total', value: platformStatistics.totalMeetings, icon: GroupsIcon, color: '#3B82F6' },
            { label: 'Pending', value: platformStatistics.pendingMeetings, icon: PendingActionsIcon, color: '#F59E0B' },
            { label: 'Accepted', value: platformStatistics.acceptedMeetings, icon: CheckCircleOutlineIcon, color: '#3B82F6' },
            { label: 'In Progress', value: platformStatistics.inProgressMeetings, icon: PlayCircleOutlineIcon, color: '#10B981' },
            { label: 'Completed', value: platformStatistics.completedMeetings, icon: TaskAltIcon, color: '#8B5CF6' },
            { label: 'Cancelled', value: platformStatistics.cancelledMeetings, icon: CancelIcon, color: '#6B7280' },
            { label: 'Avg Rating', value: platformStatistics.averageRating?.toFixed(1) ?? 'N/A', icon: StarIcon, color: '#F59E0B' },
        ]
        : [];

    // ── Skeleton rows for loading ──

    const renderSkeletonRows = () =>
        Array.from({ length: rowsPerPage }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
                {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                ))}
            </TableRow>
        ));

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            {/* ── Header ── */}
            <MotionBox
                variants={itemVariants}
                sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
                    color: '#fff',
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Meeting Management
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Full administrative control over all platform meetings — including force cancellation and permanent deletion
                        </Typography>
                    </Box>
                    <TextField
                        placeholder="Search meetings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 280,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: alpha('#fff', 0.1),
                                color: '#fff',
                                borderRadius: 1,
                                '& fieldset': { borderColor: alpha('#fff', 0.2) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.4) },
                                '&.Mui-focused fieldset': { borderColor: alpha('#fff', 0.6) },
                            },
                            '& .MuiInputAdornment-root': { color: alpha('#fff', 0.6) },
                            '& input::placeholder': { color: alpha('#fff', 0.5), opacity: 1 },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            },
                        }}
                    />
                </Stack>
            </MotionBox>

            {/* ── Statistics Cards ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {isStatsLoading
                        ? Array.from({ length: 7 }).map((_, i) => (
                            <Grid size={{ xs: 6, sm: 4, md: 12 / 7 }} key={`stat-skel-${i}`}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Skeleton variant="rectangular" height={48} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                        : statsCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Grid size={{ xs: 6, sm: 4, md: 12 / 7 }} key={index}>
                                    <MotionCard
                                        variants={itemVariants}
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
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: alpha(stat.color, 0.1),
                                                        border: '1px solid',
                                                        borderColor: alpha(stat.color, 0.15),
                                                    }}
                                                >
                                                    <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize: '0.68rem' }}>
                                                        {stat.label}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                </Grid>
            </MotionBox>

            {/* ── Tabs ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
                <Paper elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => { setActiveTab(v); setStatusFilter('ALL'); }}
                        sx={{ px: 2 }}
                    >
                        <Tab label="All Meetings" />
                        <Tab label="By Status" />
                    </Tabs>
                </Paper>
            </MotionBox>

            {/* ── Status filter chips (shown on "By Status" tab) ── */}
            {activeTab === 1 && (
                <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            label="All"
                            variant={statusFilter === 'ALL' ? 'filled' : 'outlined'}
                            onClick={() => setStatusFilter('ALL')}
                            sx={{ fontWeight: 600 }}
                        />
                        {ALL_STATUSES.map((status) => (
                            <Chip
                                key={status}
                                label={status.replace('_', ' ')}
                                variant={statusFilter === status ? 'filled' : 'outlined'}
                                onClick={() => setStatusFilter(status)}
                                sx={{
                                    fontWeight: 600,
                                    ...(statusFilter === status && {
                                        bgcolor: alpha(STATUS_COLORS[status], 0.15),
                                        color: STATUS_COLORS[status],
                                        borderColor: STATUS_COLORS[status],
                                    }),
                                }}
                            />
                        ))}
                    </Stack>
                </MotionBox>
            )}

            {/* ── Toolbar ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''} found
                    </Typography>
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleRefresh} disabled={isMeetingLoading} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </MotionBox>

            {/* ── Meetings Table ── */}
            <MotionBox variants={itemVariants}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Lecturer</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Preferred Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isMeetingLoading ? (
                                renderSkeletonRows()
                            ) : filteredMeetings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <Stack alignItems="center" spacing={1}>
                                            <EventBusyIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                            <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                                No meetings found
                                            </Typography>
                                            <Typography variant="body2" color="text.disabled">
                                                Try adjusting your search or filters
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMeetings.map((meeting) => {
                                    const statusColor = STATUS_COLORS[meeting.status] || '#6B7280';
                                    const canCancel = meeting.status !== 'CANCELLED' && meeting.status !== 'COMPLETED';

                                    return (
                                        <TableRow
                                            key={meeting.id}
                                            hover
                                            sx={{ '&:last-child td': { borderBottom: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>#{meeting.id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                                                    {meeting.subject}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                    {meeting.studentName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                    {meeting.lecturerName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={meeting.meetingType.replace(/_/g, ' ')}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={meeting.status.replace('_', ' ')}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.65rem',
                                                        bgcolor: alpha(statusColor, 0.1),
                                                        color: statusColor,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDateTime(meeting.preferredDateTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(meeting)}
                                                            sx={{ color: '#3B82F6' }}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {canCancel && (
                                                        <Tooltip title="Force Cancel">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenCancel(meeting.id)}
                                                                sx={{ color: '#F59E0B' }}
                                                            >
                                                                <BlockIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Permanent Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDelete(meeting.id)}
                                                            sx={{ color: '#EF4444' }}
                                                        >
                                                            <DeleteForeverIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={totalMeetings}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </TableContainer>
            </MotionBox>

            <Divider sx={{ my: 4 }} />

            {/* ── Platform Statistics ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <BarChartIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight={700}>Platform Statistics</Typography>
                </Stack>
                {isStatsLoading ? (
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
                ) : platformStatistics ? (
                    <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Total Meetings</Typography>
                                    <Typography variant="h5" fontWeight={700}>{platformStatistics.totalMeetings}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                                    <Typography variant="h5" fontWeight={700} color="success.main">{platformStatistics.completedMeetings}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Average Rating</Typography>
                                    <Typography variant="h5" fontWeight={700} color="warning.main">{platformStatistics.averageRating?.toFixed(1) ?? 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Total Feedbacks</Typography>
                                    <Typography variant="h5" fontWeight={700}>{platformStatistics.totalFeedbacks}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ) : (
                    <Typography variant="body2" color="text.secondary">No platform statistics available.</Typography>
                )}
            </MotionBox>

            {/* ── Lecturer Statistics Lookup ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <PersonSearchIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight={700}>Lecturer Statistics</Typography>
                </Stack>
                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: lecturerStatistics ? 3 : 0 }}>
                            <TextField
                                placeholder="Enter Lecturer ID"
                                value={lecturerIdInput}
                                onChange={(e) => setLecturerIdInput(e.target.value)}
                                size="small"
                                type="number"
                                sx={{ maxWidth: 200 }}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><PersonSearchIcon fontSize="small" /></InputAdornment>,
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleLecturerStatsLookup}
                                disabled={isStatsLoading || !lecturerIdInput.trim()}
                                sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700, boxShadow: 'none' }}
                            >
                                {isStatsLoading ? 'Loading...' : 'Look Up'}
                            </Button>
                        </Stack>
                        {lecturerStatistics && (
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Total Meetings</Typography>
                                    <Typography variant="h6" fontWeight={700}>{lecturerStatistics.totalMeetings}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#F59E0B' }}>{lecturerStatistics.pendingMeetings}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#8B5CF6' }}>{lecturerStatistics.completedMeetings}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Average Rating</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#F59E0B' }}>{lecturerStatistics.averageRating?.toFixed(1) ?? 'N/A'}</Typography>
                                </Grid>
                            </Grid>
                        )}
                    </CardContent>
                </Card>
            </MotionBox>

            {/* ── Meeting Detail Dialog ── */}
            <MeetingDetailDialog
                open={detailOpen}
                onClose={() => { setDetailOpen(false); dispatch(clearSelectedMeeting()); }}
                meeting={selectedMeeting}
                isLoading={isMeetingLoading}
            />

            {/* ── Force Cancel Dialog ── */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <BlockIcon color="warning" />
                        <Typography component="span" fontWeight={700}>Force Cancel Meeting</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This will force cancel the meeting regardless of its current state.
                    </Typography>
                    <TextField
                        label="Cancellation Reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        placeholder="Enter reason for force cancellation..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCancelDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 1 }}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleForceCancel}
                        disabled={isActionLoading}
                        sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700 }}
                    >
                        {isActionLoading ? 'Cancelling...' : 'Force Cancel'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Permanent Delete Dialog ── */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <WarningIcon sx={{ color: '#EF4444' }} />
                        <Typography component="span" fontWeight={700} sx={{ color: '#EF4444' }}>
                            Permanent Delete
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: alpha('#EF4444', 0.05),
                            border: '1px solid',
                            borderColor: alpha('#EF4444', 0.2),
                            mb: 1,
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 600 }}>
                            This action cannot be undone.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            The meeting and all associated data will be permanently removed from the database. This includes all feedback, notes, and scheduling records.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 1 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={handlePermanentDelete}
                        disabled={isActionLoading}
                        sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700 }}
                    >
                        {isActionLoading ? 'Deleting...' : 'Permanently Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    variant="filled"
                    sx={{ borderRadius: 1 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MotionBox>
    );
}

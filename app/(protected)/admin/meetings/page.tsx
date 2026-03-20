'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Snackbar,
    Alert,
    Stack,
    alpha,
    useTheme,
    IconButton,
    Card,
    CardContent,
    Grid,
    Chip,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupsIcon from '@mui/icons-material/Groups';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import StarIcon from '@mui/icons-material/Star';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchAdminAllMeetings,
    adminForceCancelAsync,
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

const STATUS_OPTIONS: { value: MeetingStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RESCHEDULED', label: 'Rescheduled' },
    { value: 'NO_SHOW', label: 'No Show' },
];

const PAGE_SIZE = 10;

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function formatMeetingType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function canForceCancel(status: MeetingStatus): boolean {
    return status !== 'CANCELLED' && status !== 'COMPLETED';
}

// ============================================================================
// Component
// ============================================================================

export default function AdminMeetingsPage() {
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
    const [statusFilter, setStatusFilter] = useState<MeetingStatus | ''>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
    const [detailOpen, setDetailOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedMeetingForCancel, setSelectedMeetingForCancel] = useState<number | null>(null);
    const [lecturerIdInput, setLecturerIdInput] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // ── Data Loading ──
    const loadMeetings = useCallback(() => {
        dispatch(fetchAdminAllMeetings({ page, size: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    useEffect(() => {
        loadMeetings();
        dispatch(fetchPlatformStatistics());
    }, [loadMeetings, dispatch]);

    // ── Error / Success handling ──
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

    // ── Filtered meetings ──
    const filteredMeetings = useMemo(() => {
        let result = meetings;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (m) =>
                    m.studentName.toLowerCase().includes(q) ||
                    m.lecturerName.toLowerCase().includes(q) ||
                    m.subject.toLowerCase().includes(q) ||
                    String(m.id).includes(q),
            );
        }

        if (activeTab === 1 && statusFilter) {
            result = result.filter((m) => m.status === statusFilter);
        }

        return result;
    }, [meetings, searchQuery, activeTab, statusFilter]);

    // ── Handlers ──
    const handleRefresh = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPage(0);
        dispatch(fetchAdminAllMeetings({ page: 0, size: rowsPerPage }));
        dispatch(fetchPlatformStatistics());
    };

    const handleViewDetails = useCallback(
        (meeting: MeetingResponse) => {
            dispatch(fetchMeetingById(meeting.id));
            setDetailOpen(true);
        },
        [dispatch],
    );

    const handleCloseDetail = () => {
        setDetailOpen(false);
        dispatch(clearSelectedMeeting());
    };

    const handleOpenCancelDialog = (meetingId: number) => {
        setSelectedMeetingForCancel(meetingId);
        setCancelReason('');
        setCancelDialogOpen(true);
    };

    const handleForceCancel = () => {
        if (selectedMeetingForCancel !== null && cancelReason.trim()) {
            dispatch(adminForceCancelAsync({ id: selectedMeetingForCancel, reason: cancelReason })).then(() => {
                setCancelDialogOpen(false);
                setCancelReason('');
                setSelectedMeetingForCancel(null);
                loadMeetings();
                dispatch(fetchPlatformStatistics());
            });
        }
    };

    const handleFetchLecturerStats = () => {
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

    // ── Statistics Cards Data ──
    const statsCards = platformStatistics
        ? [
              { label: 'Total', value: platformStatistics.totalMeetings, icon: GroupsIcon, color: '#3B82F6' },
              { label: 'Pending', value: platformStatistics.pendingMeetings, icon: PendingActionsIcon, color: '#F59E0B' },
              { label: 'Accepted', value: platformStatistics.acceptedMeetings, icon: CheckCircleIcon, color: '#3B82F6' },
              { label: 'In Progress', value: platformStatistics.inProgressMeetings, icon: PlayCircleIcon, color: '#10B981' },
              { label: 'Completed', value: platformStatistics.completedMeetings, icon: TaskAltIcon, color: '#8B5CF6' },
              { label: 'Cancelled', value: platformStatistics.cancelledMeetings, icon: DoNotDisturbIcon, color: '#6B7280' },
              { label: 'Avg Rating', value: platformStatistics.averageRating?.toFixed(1) ?? '-', icon: StarIcon, color: '#F59E0B' },
          ]
        : [];

    // ── Render ──
    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            {/* ── Header ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #DC2626 0%, #7C3AED 100%)',
                        color: '#fff',
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
                                Meeting Management
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                                Monitor and manage all platform meetings
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                placeholder="Search meetings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                sx={{
                                    minWidth: 260,
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: alpha('#fff', 0.15),
                                        borderRadius: 1,
                                        color: '#fff',
                                        '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                        '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                        '&.Mui-focused fieldset': { borderColor: '#fff' },
                                    },
                                    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: alpha('#fff', 0.7) },
                                    '& input::placeholder': { color: alpha('#fff', 0.6), opacity: 1 },
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={isMeetingLoading}
                                    size="small"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: alpha('#fff', 0.3),
                                        borderRadius: 1,
                                        color: '#fff',
                                        '&:hover': { bgcolor: alpha('#fff', 0.1) },
                                    }}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>
            </MotionBox>

            {/* ── Statistics Cards ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                {isStatsLoading && !platformStatistics ? (
                    <Grid container spacing={2}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Grid size={{ xs: 6, sm: 4, md: 12 / 7 }} key={i}>
                                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 1 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : statsCards.length > 0 ? (
                    <Grid container spacing={2}>
                        {statsCards.map((stat, index) => {
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
                                            '&:hover': {
                                                borderColor: stat.color,
                                                boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}`,
                                            },
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
                ) : null}
            </MotionBox>

            {/* ── Tabs ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2} sx={{ px: 2, py: 1 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => {
                                setActiveTab(v);
                                setStatusFilter('');
                                setPage(0);
                            }}
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' },
                            }}
                        >
                            <Tab label="All Meetings" />
                            <Tab label="By Status" />
                        </Tabs>
                        {activeTab === 1 && (
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value as MeetingStatus | '');
                                        setPage(0);
                                    }}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value="">All Statuses</MenuItem>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: STATUS_COLORS[opt.value],
                                                    }}
                                                />
                                                <span>{opt.label}</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </Card>
            </MotionBox>

            {/* ── Meetings Table ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {isMeetingLoading ? (
                        <Box sx={{ p: 2 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 1 }} />
                            ))}
                        </Box>
                    ) : filteredMeetings.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <EventBusyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="h6" color="text.secondary" fontWeight={600}>
                                No meetings found
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                {searchQuery || statusFilter
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'There are no meetings on the platform yet'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>ID</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Student</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Lecturer</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Subject</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Preferred Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>Priority</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }} align="right">
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredMeetings.map((meeting) => (
                                            <TableRow
                                                key={meeting.id}
                                                hover
                                                sx={{ '&:last-child td': { borderBottom: 0 }, cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(meeting)}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                                                        #{meeting.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }} noWrap>
                                                        {meeting.studentName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }} noWrap>
                                                        {meeting.lecturerName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', maxWidth: 180 }} noWrap>
                                                        {meeting.subject}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        {formatMeetingType(meeting.meetingType)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={meeting.status.replace('_', ' ')}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                            height: 24,
                                                            bgcolor: alpha(STATUS_COLORS[meeting.status] ?? '#6B7280', 0.1),
                                                            color: STATUS_COLORS[meeting.status] ?? '#6B7280',
                                                            border: '1px solid',
                                                            borderColor: alpha(STATUS_COLORS[meeting.status] ?? '#6B7280', 0.2),
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        {formatDate(meeting.preferredDateTime)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`P${meeting.priority}`}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: '0.7rem',
                                                            height: 22,
                                                            bgcolor: alpha(meeting.priority >= 4 ? '#EF4444' : meeting.priority >= 2 ? '#F59E0B' : '#10B981', 0.1),
                                                            color: meeting.priority >= 4 ? '#EF4444' : meeting.priority >= 2 ? '#F59E0B' : '#10B981',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDetails(meeting);
                                                                }}
                                                                sx={{ color: '#3B82F6' }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {canForceCancel(meeting.status) && (
                                                            <Tooltip title="Force Cancel">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenCancelDialog(meeting.id);
                                                                    }}
                                                                    sx={{ color: '#EF4444' }}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={totalMeetings}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                            />
                        </>
                    )}
                </Card>
            </MotionBox>

            {/* ── Lecturer Statistics Lookup ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            Lecturer Statistics Lookup
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                            <TextField
                                placeholder="Lecturer ID"
                                value={lecturerIdInput}
                                onChange={(e) => setLecturerIdInput(e.target.value)}
                                size="small"
                                type="number"
                                sx={{ maxWidth: 200 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonSearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleFetchLecturerStats}
                                disabled={!lecturerIdInput.trim() || isStatsLoading}
                                sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                            >
                                {isStatsLoading ? 'Loading...' : 'Fetch Statistics'}
                            </Button>
                        </Stack>

                        {lecturerStatistics && (
                            <Box sx={{ mt: 2 }}>
                                <Divider sx={{ mb: 2 }} />
                                {'lecturerName' in lecturerStatistics && (
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                        {(lecturerStatistics as MeetingStatistics & { lecturerName?: string }).lecturerName ?? 'Lecturer'} — Statistics
                                    </Typography>
                                )}
                                <Grid container spacing={1.5}>
                                    {[
                                        { label: 'Total', value: lecturerStatistics.totalMeetings, color: '#3B82F6' },
                                        { label: 'Pending', value: lecturerStatistics.pendingMeetings, color: '#F59E0B' },
                                        { label: 'Accepted', value: lecturerStatistics.acceptedMeetings, color: '#3B82F6' },
                                        { label: 'In Progress', value: lecturerStatistics.inProgressMeetings, color: '#10B981' },
                                        { label: 'Completed', value: lecturerStatistics.completedMeetings, color: '#8B5CF6' },
                                        { label: 'Cancelled', value: lecturerStatistics.cancelledMeetings, color: '#6B7280' },
                                        { label: 'Avg Rating', value: lecturerStatistics.averageRating?.toFixed(1) ?? '-', color: '#F59E0B' },
                                    ].map((item) => (
                                        <Grid size={{ xs: 6, sm: 3, md: 12 / 7 }} key={item.label}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(item.color, 0.05),
                                                    border: '1px solid',
                                                    borderColor: alpha(item.color, 0.12),
                                                }}
                                            >
                                                <Typography variant="h6" fontWeight={700} sx={{ color: item.color, lineHeight: 1.1 }}>
                                                    {item.value}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </MotionBox>

            {/* ── Meeting Detail Dialog ── */}
            <Dialog
                open={detailOpen}
                onClose={handleCloseDetail}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>
                    <Typography fontWeight={700}>Meeting Details</Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {isMeetingLoading && !selectedMeeting ? (
                        <Box sx={{ py: 3 }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} variant="text" height={32} sx={{ mb: 0.5 }} />
                            ))}
                        </Box>
                    ) : selectedMeeting ? (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    Meeting #{selectedMeeting.id}
                                </Typography>
                                <Chip
                                    label={selectedMeeting.status.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: alpha(STATUS_COLORS[selectedMeeting.status] ?? '#6B7280', 0.1),
                                        color: STATUS_COLORS[selectedMeeting.status] ?? '#6B7280',
                                        border: '1px solid',
                                        borderColor: alpha(STATUS_COLORS[selectedMeeting.status] ?? '#6B7280', 0.2),
                                    }}
                                />
                            </Stack>
                            <Divider />
                            {[
                                { label: 'Subject', value: selectedMeeting.subject },
                                { label: 'Student', value: `${selectedMeeting.studentName} (${selectedMeeting.studentEmail})` },
                                { label: 'Lecturer', value: `${selectedMeeting.lecturerName} (${selectedMeeting.lecturerEmail})` },
                                { label: 'Type', value: formatMeetingType(selectedMeeting.meetingType) },
                                { label: 'Priority', value: `P${selectedMeeting.priority}` },
                                { label: 'Preferred Date', value: formatDate(selectedMeeting.preferredDateTime) },
                                { label: 'Duration', value: `${selectedMeeting.preferredDurationMinutes} min` },
                                { label: 'Online', value: selectedMeeting.isOnline ? 'Yes' : 'No' },
                                ...(selectedMeeting.location ? [{ label: 'Location', value: selectedMeeting.location }] : []),
                                ...(selectedMeeting.meetingLink ? [{ label: 'Meeting Link', value: selectedMeeting.meetingLink }] : []),
                                ...(selectedMeeting.meetingPlatform ? [{ label: 'Platform', value: selectedMeeting.meetingPlatform }] : []),
                                ...(selectedMeeting.scheduledStartTime
                                    ? [{ label: 'Scheduled Start', value: formatDate(selectedMeeting.scheduledStartTime) }]
                                    : []),
                                ...(selectedMeeting.scheduledEndTime
                                    ? [{ label: 'Scheduled End', value: formatDate(selectedMeeting.scheduledEndTime) }]
                                    : []),
                                ...(selectedMeeting.actualStartTime
                                    ? [{ label: 'Actual Start', value: formatDate(selectedMeeting.actualStartTime) }]
                                    : []),
                                ...(selectedMeeting.actualEndTime
                                    ? [{ label: 'Actual End', value: formatDate(selectedMeeting.actualEndTime) }]
                                    : []),
                                ...(selectedMeeting.description ? [{ label: 'Description', value: selectedMeeting.description }] : []),
                                ...(selectedMeeting.responseMessage
                                    ? [{ label: 'Response Message', value: selectedMeeting.responseMessage }]
                                    : []),
                                ...(selectedMeeting.cancellationReason
                                    ? [{ label: 'Cancellation Reason', value: selectedMeeting.cancellationReason }]
                                    : []),
                                ...(selectedMeeting.rejectionReason
                                    ? [{ label: 'Rejection Reason', value: selectedMeeting.rejectionReason }]
                                    : []),
                                ...(selectedMeeting.notes ? [{ label: 'Notes', value: selectedMeeting.notes }] : []),
                                ...(selectedMeeting.followUpRequired
                                    ? [{ label: 'Follow-up Required', value: selectedMeeting.followUpNotes || 'Yes' }]
                                    : []),
                                ...(selectedMeeting.rating !== null ? [{ label: 'Rating', value: `${selectedMeeting.rating}/5` }] : []),
                                ...(selectedMeeting.feedback ? [{ label: 'Feedback', value: selectedMeeting.feedback }] : []),
                                { label: 'Created', value: formatDate(selectedMeeting.createdAt) },
                                { label: 'Updated', value: formatDate(selectedMeeting.updatedAt) },
                            ].map((row) => (
                                <Stack key={row.label} direction="row" spacing={2}>
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, flexShrink: 0, fontWeight: 600 }}>
                                        {row.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                        {row.value}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                            Meeting not found
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDetail} sx={{ textTransform: 'none', borderRadius: 1 }}>
                        Close
                    </Button>
                    {selectedMeeting && canForceCancel(selectedMeeting.status) && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                handleCloseDetail();
                                handleOpenCancelDialog(selectedMeeting.id);
                            }}
                            sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700, boxShadow: 'none' }}
                        >
                            Force Cancel
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* ── Force Cancel Dialog ── */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>
                    <Typography fontWeight={700} color="error">
                        Force Cancel Meeting
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This action will forcefully cancel the meeting. Please provide a reason.
                    </Typography>
                    <TextField
                        label="Cancellation Reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCancelDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 1 }}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleForceCancel}
                        disabled={isActionLoading || !cancelReason.trim()}
                        sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700, boxShadow: 'none' }}
                    >
                        {isActionLoading ? 'Cancelling...' : 'Force Cancel'}
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

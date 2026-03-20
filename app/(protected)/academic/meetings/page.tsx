'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventIcon from '@mui/icons-material/Event';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FlagIcon from '@mui/icons-material/Flag';
import FilterListIcon from '@mui/icons-material/FilterList';
import InboxIcon from '@mui/icons-material/Inbox';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchLecturerPending,
    fetchLecturerPendingCount,
    fetchLecturerAll,
    fetchLecturerUpcoming,
    fetchLecturerHighPriority,
    fetchLecturerFollowUp,
    fetchLecturerByStatus,
    searchLecturerMeetingsAsync,
    fetchLecturerStatistics,
    acceptMeetingAsync,
    rejectMeetingAsync,
    rescheduleMeetingAsync,
    lecturerCancelAsync,
    addNotesAsync,
    startMeetingAsync,
    completeMeetingAsync,
    fetchMeetingById,
    selectMeetings,
    selectTotalMeetings,
    selectPendingRequests,
    selectTotalPending,
    selectPendingCount,
    selectUpcomingMeetings,
    selectLecturerStatistics,
    selectSelectedMeeting,
    selectIsMeetingLoading,
    selectIsRequestLoading,
    selectIsStatsLoading,
    selectIsSubmitting,
    selectIsActionLoading,
    selectMeetingError,
    selectMeetingSuccess,
    clearMeetingError,
    clearMeetingSuccess,
    clearSelectedMeeting,
} from '@/features/meeting/meetingSlice';
import type { MeetingResponse, MeetingStatus, MeetingType, MeetingStatistics, AcceptMeetingRequest, RejectMeetingRequest, RescheduleMeetingRequest } from '@/features/meeting/types';
import {
    MeetingDetailDialog,
    AcceptMeetingDialog,
    RejectMeetingDialog,
    RescheduleMeetingDialog,
    NotesDialog,
    CancelMeetingDialog,
} from '@/components/meeting';

// ============================================================================
// Motion & Animation
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

const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
    PROJECT_DISCUSSION: 'Project Discussion',
    ACADEMIC_GUIDANCE: 'Academic Guidance',
    CAREER_GUIDANCE: 'Career Guidance',
    GRADE_REVIEW: 'Grade Review',
    RESEARCH: 'Research',
    OTHER: 'Other',
};

const STATUS_OPTIONS: MeetingStatus[] = [
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED',
    'IN_PROGRESS',
    'COMPLETED',
    'RESCHEDULED',
    'NO_SHOW',
];

// ============================================================================
// Helpers
// ============================================================================

function formatDateTime(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function getPriorityLabel(priority: number): string {
    if (priority >= 8) return 'Critical';
    if (priority >= 5) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
}

function getPriorityColor(priority: number): string {
    if (priority >= 8) return '#DC2626';
    if (priority >= 5) return '#F59E0B';
    if (priority >= 3) return '#3B82F6';
    return '#6B7280';
}

// ============================================================================
// Component
// ============================================================================

export default function AcademicMeetingsPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Selectors
    const meetings = useAppSelector(selectMeetings);
    const totalMeetings = useAppSelector(selectTotalMeetings);
    const pendingRequests = useAppSelector(selectPendingRequests);
    const totalPending = useAppSelector(selectTotalPending);
    const pendingCount = useAppSelector(selectPendingCount);
    const upcomingMeetings = useAppSelector(selectUpcomingMeetings);
    const statistics = useAppSelector(selectLecturerStatistics);
    const selectedMeeting = useAppSelector(selectSelectedMeeting);
    const isMeetingLoading = useAppSelector(selectIsMeetingLoading);
    const isRequestLoading = useAppSelector(selectIsRequestLoading);
    const isStatsLoading = useAppSelector(selectIsStatsLoading);
    const isSubmitting = useAppSelector(selectIsSubmitting);
    const isActionLoading = useAppSelector(selectIsActionLoading);
    const error = useAppSelector(selectMeetingError);
    const successMessage = useAppSelector(selectMeetingSuccess);

    // Local state
    const [activeTab, setActiveTab] = useState(0);
    const [statusFilter, setStatusFilter] = useState<MeetingStatus>('PENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Dialog state
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [actionMeetingId, setActionMeetingId] = useState<number | null>(null);

    // ── Initial data load ──
    useEffect(() => {
        dispatch(fetchLecturerPending({ page: 0, size: 20 }));
        dispatch(fetchLecturerPendingCount());
        dispatch(fetchLecturerStatistics());
    }, [dispatch]);

    // ── Tab change data loading ──
    const loadTabData = useCallback(
        (tab: number) => {
            switch (tab) {
                case 0:
                    dispatch(fetchLecturerPending({ page: 0, size: 20 }));
                    break;
                case 1:
                    dispatch(fetchLecturerAll({ page: 0, size: 20 }));
                    break;
                case 2:
                    dispatch(fetchLecturerUpcoming({ page: 0, size: 20 }));
                    break;
                case 3:
                    dispatch(fetchLecturerHighPriority({ page: 0, size: 20 }));
                    break;
                case 4:
                    dispatch(fetchLecturerFollowUp({ page: 0, size: 20 }));
                    break;
                case 5:
                    dispatch(fetchLecturerByStatus({ status: statusFilter, page: 0, size: 20 }));
                    break;
            }
        },
        [dispatch, statusFilter],
    );

    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab, loadTabData]);

    // ── Search debounce ──
    useEffect(() => {
        if (!searchQuery.trim()) {
            loadTabData(activeTab);
            return;
        }
        const timer = setTimeout(() => {
            dispatch(searchLecturerMeetingsAsync({ keyword: searchQuery, page: 0, size: 20 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, dispatch, activeTab, loadTabData]);

    // ── Error & success handling ──
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

    // ── Displayed meetings based on active tab ──
    const displayedMeetings = useMemo((): MeetingResponse[] => {
        if (activeTab === 0) return pendingRequests;
        if (activeTab === 2) return upcomingMeetings;
        return meetings;
    }, [activeTab, pendingRequests, upcomingMeetings, meetings]);

    const isLoading = isMeetingLoading || isRequestLoading;

    // ── Handlers ──

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
    };

    const handleStatusFilterChange = (status: MeetingStatus) => {
        setStatusFilter(status);
        dispatch(fetchLecturerByStatus({ status, page: 0, size: 20 }));
    };

    const handleRefresh = () => {
        setSearchQuery('');
        loadTabData(activeTab);
        dispatch(fetchLecturerPendingCount());
        dispatch(fetchLecturerStatistics());
    };

    const handleViewMeeting = (meeting: MeetingResponse) => {
        dispatch(fetchMeetingById(meeting.id));
        setDetailDialogOpen(true);
    };

    const openAcceptDialog = (id: number) => {
        setActionMeetingId(id);
        dispatch(fetchMeetingById(id));
        setAcceptDialogOpen(true);
    };

    const openRejectDialog = (id: number) => {
        setActionMeetingId(id);
        dispatch(fetchMeetingById(id));
        setRejectDialogOpen(true);
    };

    const openRescheduleDialog = (id: number) => {
        setActionMeetingId(id);
        dispatch(fetchMeetingById(id));
        setRescheduleDialogOpen(true);
    };

    const openNotesDialog = (id: number) => {
        setActionMeetingId(id);
        dispatch(fetchMeetingById(id));
        setNotesDialogOpen(true);
    };

    const openCancelDialog = (id: number) => {
        setActionMeetingId(id);
        dispatch(fetchMeetingById(id));
        setCancelDialogOpen(true);
    };

    const handleStartMeeting = (id: number) => {
        dispatch(startMeetingAsync(id)).then(() => {
            loadTabData(activeTab);
            dispatch(fetchLecturerStatistics());
        });
    };

    const handleCompleteMeeting = (id: number) => {
        dispatch(completeMeetingAsync(id)).then(() => {
            loadTabData(activeTab);
            dispatch(fetchLecturerStatistics());
        });
    };

    const afterAction = () => {
        loadTabData(activeTab);
        dispatch(fetchLecturerPendingCount());
        dispatch(fetchLecturerStatistics());
    };

    const closeAllDialogs = () => {
        setDetailDialogOpen(false);
        setAcceptDialogOpen(false);
        setRejectDialogOpen(false);
        setRescheduleDialogOpen(false);
        setNotesDialogOpen(false);
        setCancelDialogOpen(false);
        setActionMeetingId(null);
        dispatch(clearSelectedMeeting());
    };

    // ── Statistics cards data ──
    const statsCards = useMemo(() => {
        const s = statistics as MeetingStatistics | null;
        return [
            { label: 'Total', value: s?.totalMeetings ?? 0, icon: EventIcon, color: '#3B82F6' },
            { label: 'Pending', value: s?.pendingMeetings ?? 0, icon: PendingActionsIcon, color: '#F59E0B' },
            { label: 'Accepted', value: s?.acceptedMeetings ?? 0, icon: CheckCircleOutlineIcon, color: '#3B82F6' },
            { label: 'Completed', value: s?.completedMeetings ?? 0, icon: DoneAllIcon, color: '#8B5CF6' },
            { label: 'Cancelled', value: s?.cancelledMeetings ?? 0, icon: CancelOutlinedIcon, color: '#6B7280' },
            { label: 'Avg Rating', value: s?.averageRating ? s.averageRating.toFixed(1) : '0.0', icon: StarOutlineIcon, color: '#10B981' },
        ];
    }, [statistics]);

    // ── Action buttons renderer ──
    const renderActions = (meeting: MeetingResponse) => {
        const status = meeting.status;
        const btnSx = { textTransform: 'none' as const, borderRadius: 1, fontWeight: 600, fontSize: '0.75rem' };

        switch (status) {
            case 'PENDING':
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} sx={btnSx} onClick={() => openAcceptDialog(meeting.id)}>
                            Accept
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} sx={btnSx} onClick={() => openRejectDialog(meeting.id)}>
                            Reject
                        </Button>
                        <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewMeeting(meeting)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            case 'ACCEPTED':
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        <Button size="small" variant="contained" color="success" startIcon={<PlayArrowIcon />} sx={btnSx} onClick={() => handleStartMeeting(meeting.id)}>
                            Start
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<ScheduleIcon />} sx={btnSx} onClick={() => openRescheduleDialog(meeting.id)}>
                            Reschedule
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} sx={btnSx} onClick={() => openCancelDialog(meeting.id)}>
                            Cancel
                        </Button>
                        <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewMeeting(meeting)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            case 'IN_PROGRESS':
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        <Button size="small" variant="contained" startIcon={<TaskAltIcon />} sx={{ ...btnSx, bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }} onClick={() => handleCompleteMeeting(meeting.id)}>
                            Complete
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<EditNoteIcon />} sx={btnSx} onClick={() => openNotesDialog(meeting.id)}>
                            Notes
                        </Button>
                        <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewMeeting(meeting)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            case 'COMPLETED':
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        <Button size="small" variant="outlined" startIcon={<EditNoteIcon />} sx={btnSx} onClick={() => openNotesDialog(meeting.id)}>
                            Notes
                        </Button>
                        <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewMeeting(meeting)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            default:
                return (
                    <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewMeeting(meeting)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                );
        }
    };

    // ── Loading skeleton ──
    const renderSkeletons = () => (
        <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 1 }} />
            ))}
        </Stack>
    );

    // ── Empty state ──
    const renderEmptyState = () => (
        <MotionBox variants={itemVariants} sx={{ textAlign: 'center', py: 8 }}>
            <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No meetings found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {activeTab === 0
                    ? 'There are no pending meeting requests at the moment.'
                    : 'No meetings match the current filter criteria.'}
            </Typography>
        </MotionBox>
    );

    // ── Meeting table/card row ──
    const renderMeetingRow = (meeting: MeetingResponse) => {
        const statusColor = STATUS_COLORS[meeting.status] || '#6B7280';
        const priorityColor = getPriorityColor(meeting.priority);

        return (
            <MotionCard
                key={meeting.id}
                variants={itemVariants}
                elevation={0}
                sx={{
                    mb: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: alpha(statusColor, 0.4),
                        boxShadow: `0 2px 12px ${alpha(statusColor, 0.1)}`,
                    },
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ lg: 'center' }} spacing={2}>
                        {/* Left: Student info & meeting details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight={700} noWrap>
                                    {meeting.studentName}
                                </Typography>
                                <Chip
                                    label={meeting.status.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        bgcolor: alpha(statusColor, 0.1),
                                        color: statusColor,
                                        border: '1px solid',
                                        borderColor: alpha(statusColor, 0.2),
                                    }}
                                />
                                <Chip
                                    label={getPriorityLabel(meeting.priority)}
                                    size="small"
                                    icon={<FlagIcon sx={{ fontSize: 12, color: `${priorityColor} !important` }} />}
                                    sx={{
                                        height: 22,
                                        fontSize: '0.68rem',
                                        fontWeight: 600,
                                        bgcolor: alpha(priorityColor, 0.08),
                                        color: priorityColor,
                                    }}
                                />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {meeting.studentEmail}
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 300 }}>
                                    {meeting.subject}
                                </Typography>
                                <Divider orientation="vertical" flexItem />
                                <Chip
                                    label={MEETING_TYPE_LABELS[meeting.meetingType] || meeting.meetingType}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(meeting.preferredDateTime)}
                                </Typography>
                            </Stack>
                        </Box>

                        {/* Right: Actions */}
                        <Box sx={{ flexShrink: 0 }}>{renderActions(meeting)}</Box>
                    </Stack>
                </CardContent>
            </MotionCard>
        );
    };

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            {/* ── Header ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, #059669 0%, #10B981 100%)`,
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
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
                                    Student Meetings
                                </Typography>
                                {pendingCount > 0 && (
                                    <Badge
                                        badgeContent={pendingCount}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                minWidth: 24,
                                                height: 24,
                                                borderRadius: 12,
                                            },
                                        }}
                                    >
                                        <PendingActionsIcon sx={{ fontSize: 28, opacity: 0.9 }} />
                                    </Badge>
                                )}
                            </Stack>
                            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                                Manage meeting requests, schedules, and follow-ups
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
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
                                    '& .MuiInputAdornment-root': { color: alpha('#fff', 0.7) },
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
                                    disabled={isLoading}
                                    sx={{
                                        color: '#fff',
                                        bgcolor: alpha('#fff', 0.15),
                                        borderRadius: 1,
                                        '&:hover': { bgcolor: alpha('#fff', 0.25) },
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>
            </MotionBox>

            {/* ── Statistics Cards ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                {isStatsLoading ? (
                                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 1 }} />
                                ) : (
                                    <Card
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
                                    </Card>
                                )}
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
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            px: 1,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                minHeight: 48,
                            },
                        }}
                    >
                        <Tab
                            label={
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <span>Pending</span>
                                    {pendingCount > 0 && (
                                        <Chip
                                            label={pendingCount}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                bgcolor: alpha('#F59E0B', 0.15),
                                                color: '#F59E0B',
                                            }}
                                        />
                                    )}
                                </Stack>
                            }
                        />
                        <Tab label="All Requests" />
                        <Tab label="Upcoming" />
                        <Tab label="High Priority" icon={<PriorityHighIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                        <Tab label="Follow Up" />
                        <Tab
                            label={
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <FilterListIcon sx={{ fontSize: 16 }} />
                                    <span>By Status</span>
                                </Stack>
                            }
                        />
                    </Tabs>

                    {/* Status sub-filter for "By Status" tab */}
                    {activeTab === 5 && (
                        <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
                            <Divider sx={{ mb: 1.5 }} />
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {STATUS_OPTIONS.map((status) => {
                                    const color = STATUS_COLORS[status];
                                    const isActive = statusFilter === status;
                                    return (
                                        <Chip
                                            key={status}
                                            label={status.replace('_', ' ')}
                                            size="small"
                                            onClick={() => handleStatusFilterChange(status)}
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.72rem',
                                                cursor: 'pointer',
                                                bgcolor: isActive ? alpha(color, 0.15) : 'transparent',
                                                color: isActive ? color : 'text.secondary',
                                                border: '1px solid',
                                                borderColor: isActive ? alpha(color, 0.3) : 'divider',
                                                '&:hover': {
                                                    bgcolor: alpha(color, 0.1),
                                                    borderColor: alpha(color, 0.3),
                                                },
                                            }}
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>
                    )}
                </Paper>
            </MotionBox>

            {/* ── Meetings List ── */}
            <MotionBox variants={itemVariants}>
                {isLoading ? (
                    renderSkeletons()
                ) : displayedMeetings.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        {displayedMeetings.map((meeting) => renderMeetingRow(meeting))}
                    </motion.div>
                )}
            </MotionBox>

            {/* ── Dialogs ── */}
            <MeetingDetailDialog
                open={detailDialogOpen}
                meeting={selectedMeeting}
                onClose={closeAllDialogs}
                isLoading={isMeetingLoading}
            />

            <AcceptMeetingDialog
                open={acceptDialogOpen}
                meeting={selectedMeeting}
                onClose={closeAllDialogs}
                onSubmit={(data: AcceptMeetingRequest) => {
                    if (actionMeetingId !== null) {
                        dispatch(acceptMeetingAsync({ id: actionMeetingId, data })).then(() => {
                            closeAllDialogs();
                            afterAction();
                        });
                    }
                }}
                isSubmitting={isActionLoading}
            />

            <RejectMeetingDialog
                open={rejectDialogOpen}
                onClose={closeAllDialogs}
                onSubmit={(data: RejectMeetingRequest) => {
                    if (actionMeetingId !== null) {
                        dispatch(rejectMeetingAsync({ id: actionMeetingId, data })).then(() => {
                            closeAllDialogs();
                            afterAction();
                        });
                    }
                }}
                isSubmitting={isActionLoading}
            />

            <RescheduleMeetingDialog
                open={rescheduleDialogOpen}
                meeting={selectedMeeting}
                onClose={closeAllDialogs}
                onSubmit={(data: RescheduleMeetingRequest) => {
                    if (actionMeetingId !== null) {
                        dispatch(rescheduleMeetingAsync({ id: actionMeetingId, data })).then(() => {
                            closeAllDialogs();
                            afterAction();
                        });
                    }
                }}
                isSubmitting={isActionLoading}
            />

            <NotesDialog
                open={notesDialogOpen}
                onClose={closeAllDialogs}
                onSubmit={(notes: string, followUpRequired: boolean, followUpNotes?: string) => {
                    if (actionMeetingId !== null) {
                        dispatch(addNotesAsync({ id: actionMeetingId, notes, followUpRequired, followUpNotes })).then(() => {
                            closeAllDialogs();
                            afterAction();
                        });
                    }
                }}
                isSubmitting={isActionLoading}
            />

            <CancelMeetingDialog
                open={cancelDialogOpen}
                onClose={closeAllDialogs}
                onSubmit={(reason: string) => {
                    if (actionMeetingId !== null) {
                        dispatch(lecturerCancelAsync({ id: actionMeetingId, reason })).then(() => {
                            closeAllDialogs();
                            afterAction();
                        });
                    }
                }}
                isSubmitting={isActionLoading}
            />

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
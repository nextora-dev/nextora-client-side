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
    Rating,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import TimerIcon from '@mui/icons-material/Timer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BlockIcon from '@mui/icons-material/Block';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchMyRequests,
    fetchMyMeetingsByStatus,
    fetchMyUpcoming,
    searchMyMeetingsAsync,
    createMeetingAsync,
    cancelMeetingAsync,
    submitFeedbackAsync,
    fetchMeetingById,
    selectMyRequests,
    selectTotalMyRequests,
    selectUpcomingMeetings,
    selectSelectedMeeting,
    selectIsRequestLoading,
    selectIsMeetingLoading,
    selectIsSubmitting,
    selectIsActionLoading,
    selectMeetingError,
    selectMeetingSuccess,
    clearMeetingError,
    clearMeetingSuccess,
    clearSelectedMeeting,
} from '@/features/meeting/meetingSlice';
import type { MeetingResponse, MeetingStatus, MeetingType } from '@/features/meeting/types';
import CreateMeetingDialog from '@/components/meeting/CreateMeetingDialog';
import MeetingDetailDialog from '@/components/meeting/MeetingDetailDialog';
import FeedbackDialog from '@/components/meeting/FeedbackDialog';
import CancelMeetingDialog from '@/components/meeting/CancelMeetingDialog';

// ── Motion wrappers ─────────────────────────────────────────
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

// ── Status Configuration ────────────────────────────────────
const STATUS_CONFIG: Record<MeetingStatus, { color: string; label: string; icon: React.ReactElement; pulse?: boolean }> = {
    PENDING:      { color: '#F59E0B', label: 'Pending',      icon: <PendingActionsIcon sx={{ fontSize: 14 }} /> },
    ACCEPTED:     { color: '#3B82F6', label: 'Accepted',     icon: <EventAvailableIcon sx={{ fontSize: 14 }} /> },
    REJECTED:     { color: '#EF4444', label: 'Rejected',     icon: <BlockIcon sx={{ fontSize: 14 }} /> },
    CANCELLED:    { color: '#6B7280', label: 'Cancelled',    icon: <CancelIcon sx={{ fontSize: 14 }} /> },
    IN_PROGRESS:  { color: '#10B981', label: 'In Progress',  icon: <VideoCallIcon sx={{ fontSize: 14 }} />, pulse: true },
    COMPLETED:    { color: '#8B5CF6', label: 'Completed',    icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
    RESCHEDULED:  { color: '#D97706', label: 'Rescheduled',  icon: <CalendarTodayIcon sx={{ fontSize: 14 }} /> },
    NO_SHOW:      { color: '#991B1B', label: 'No Show',      icon: <BlockIcon sx={{ fontSize: 14 }} /> },
};

const getStatusConfig = (status: MeetingStatus | undefined | null) => {
    if (!status || !(status in STATUS_CONFIG)) return STATUS_CONFIG.PENDING;
    return STATUS_CONFIG[status];
};

// ── Meeting Type Labels ─────────────────────────────────────
const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
    PROJECT_DISCUSSION: 'Project Discussion',
    ACADEMIC_GUIDANCE:  'Academic Guidance',
    CAREER_GUIDANCE:    'Career Guidance',
    GRADE_REVIEW:       'Grade Review',
    RESEARCH:           'Research',
    OTHER:              'Other',
};

// ── Helpers ─────────────────────────────────────────────────
const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return { date: 'TBD', time: '' };
    const d = new Date(dateStr);
    return {
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
};

const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return { label: 'High', color: '#EF4444' };
    if (priority >= 4) return { label: 'Medium', color: '#F59E0B' };
    return { label: 'Low', color: '#10B981' };
};

// ── Tab Definitions ─────────────────────────────────────────
const TABS = ['All Requests', 'Upcoming', 'Pending', 'Completed', 'Cancelled'] as const;
const PAGE_SIZE = 12;

export default function MeetLecturersPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Redux state
    const myRequests = useAppSelector(selectMyRequests);
    const totalMyRequests = useAppSelector(selectTotalMyRequests);
    const upcomingMeetings = useAppSelector(selectUpcomingMeetings);
    const selectedMeeting = useAppSelector(selectSelectedMeeting);
    const isRequestLoading = useAppSelector(selectIsRequestLoading);
    const isMeetingLoading = useAppSelector(selectIsMeetingLoading);
    const isSubmitting = useAppSelector(selectIsSubmitting);
    const isActionLoading = useAppSelector(selectIsActionLoading);
    const error = useAppSelector(selectMeetingError);
    const successMessage = useAppSelector(selectMeetingSuccess);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [actionMeeting, setActionMeeting] = useState<MeetingResponse | null>(null);

    // ── Data Fetching ───────────────────────────────────────
    const loadTabData = useCallback((tab: number, pageNum = 0) => {
        const params = { page: pageNum, size: PAGE_SIZE };
        switch (tab) {
            case 0: dispatch(fetchMyRequests(params)); break;
            case 1: dispatch(fetchMyUpcoming(params)); break;
            case 2: dispatch(fetchMyMeetingsByStatus({ status: 'PENDING', ...params })); break;
            case 3: dispatch(fetchMyMeetingsByStatus({ status: 'COMPLETED', ...params })); break;
            case 4: dispatch(fetchMyMeetingsByStatus({ status: 'CANCELLED', ...params })); break;
        }
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchMyRequests({ page: 0, size: PAGE_SIZE }));
        dispatch(fetchMyUpcoming({ page: 0, size: PAGE_SIZE }));
    }, [dispatch]);

    // Handle error/success messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearMeetingError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearMeetingSuccess());
            // Refresh current tab after a successful action
            loadTabData(activeTab, page);
        }
    }, [error, successMessage, dispatch, activeTab, page, loadTabData]);

    // ── Handlers ────────────────────────────────────────────
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setPage(0);
        setSearchQuery('');
        loadTabData(newValue, 0);
    };

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            dispatch(searchMyMeetingsAsync({ keyword: searchQuery, page: 0, size: PAGE_SIZE }));
        } else {
            loadTabData(activeTab, 0);
        }
    }, [dispatch, searchQuery, activeTab, loadTabData]);

    const handleRefresh = () => {
        setSearchQuery('');
        loadTabData(activeTab, page);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadTabData(activeTab, nextPage);
    };

    const handleViewDetails = (meeting: MeetingResponse) => {
        dispatch(fetchMeetingById(meeting.id));
        setDetailDialogOpen(true);
    };

    const handleCancelClick = (meeting: MeetingResponse) => {
        setActionMeeting(meeting);
        setCancelDialogOpen(true);
    };

    const handleFeedbackClick = (meeting: MeetingResponse) => {
        setActionMeeting(meeting);
        setFeedbackDialogOpen(true);
    };

    const handleCancelConfirm = (reason: string) => {
        if (actionMeeting) {
            dispatch(cancelMeetingAsync({ id: actionMeeting.id, reason }));
            setCancelDialogOpen(false);
            setActionMeeting(null);
        }
    };

    const handleFeedbackSubmit = (rating: number, feedback: string) => {
        if (actionMeeting) {
            dispatch(submitFeedbackAsync({ id: actionMeeting.id, data: { rating, feedback } }));
            setFeedbackDialogOpen(false);
            setActionMeeting(null);
        }
    };

    const handleCreateSuccess = () => {
        setCreateDialogOpen(false);
        loadTabData(activeTab, page);
    };

    // Determine which meetings to show
    const displayMeetings = activeTab === 1 ? upcomingMeetings : myRequests;
    const hasMore = activeTab !== 1 && displayMeetings.length < totalMyRequests;

    // Stats
    const stats = [
        { label: 'Total Requests', value: totalMyRequests, icon: SchoolIcon, color: '#3B82F6' },
        { label: 'Upcoming', value: upcomingMeetings.length, icon: EventAvailableIcon, color: '#10B981' },
        { label: 'Pending', value: myRequests.filter(m => m.status === 'PENDING').length, icon: PendingActionsIcon, color: '#F59E0B' },
        { label: 'Completed', value: myRequests.filter(m => m.status === 'COMPLETED').length, icon: CheckCircleIcon, color: '#8B5CF6' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ══════════════  PAGE HEADER  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                    }}
                >
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #6366F1 100%)`,
                            p: { xs: 3, md: 4 },
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                                backgroundSize: '20px 20px',
                            }}
                        />
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            justifyContent="space-between"
                            spacing={3}
                            sx={{ position: 'relative', zIndex: 1 }}
                        >
                            <Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'white', letterSpacing: '-0.02em' }}>
                                    Meet Lecturers
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                                    Schedule meetings with lecturers for academic guidance and support
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    placeholder="Search meetings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    size="small"
                                    sx={{
                                        minWidth: { sm: 260 },
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            backdropFilter: 'blur(8px)',
                                            borderRadius: 1,
                                            color: 'white',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                            '&.Mui-focused fieldset': { borderColor: 'white', borderWidth: 1 },
                                        },
                                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.6)' },
                                    }}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size="small" onClick={handleSearch} disabled={isRequestLoading}>
                                                        <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchQuery ? (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => { setSearchQuery(''); loadTabData(activeTab, 0); }}>
                                                        <CloseIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null,
                                        },
                                    }}
                                />
                                <Button
                                    variant="text"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateDialogOpen(true)}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        px: 3,
                                        borderRadius: 1,
                                        textTransform: 'none',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                        '&:hover': { bgcolor: alpha('#fff', 0.92), transform: 'translateY(-1px)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    New Request
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
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
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
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
                            {TABS.map((label) => (
                                <Tab key={label} label={label} />
                            ))}
                        </Tabs>
                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={handleRefresh}
                                disabled={isRequestLoading}
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
                </CardContent>
            </Card>

            {/* ══════════════  MEETINGS GRID  ══════════════ */}
            {isRequestLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                <Skeleton variant="rectangular" height={4} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Skeleton variant="text" width="60%" height={28} />
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                        <Skeleton variant="text" width="80%" />
                                        <Skeleton variant="text" width="50%" />
                                        <Stack direction="row" spacing={2}>
                                            <Skeleton variant="text" width="30%" />
                                            <Skeleton variant="text" width="30%" />
                                        </Stack>
                                        <Divider />
                                        <Stack direction="row" spacing={1}>
                                            <Skeleton variant="rounded" width={90} height={32} sx={{ borderRadius: 1 }} />
                                            <Skeleton variant="rounded" width={70} height={32} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : displayMeetings.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 8,
                        textAlign: 'center',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
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
                            mb: 2.5,
                        }}
                    >
                        <PersonIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Meetings Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mb: 3 }}>
                        {searchQuery
                            ? 'No meetings match your search. Try adjusting your keywords.'
                            : 'You have no meeting requests yet. Schedule a meeting with a lecturer to get started.'}
                    </Typography>
                    {!searchQuery && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 700,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                            }}
                        >
                            New Request
                        </Button>
                    )}
                </Paper>
            ) : (
                <AnimatePresence mode="popLayout">
                    <Grid container spacing={3}>
                        {displayMeetings.map((meeting, index) => {
                            const { date, time } = formatDateTime(meeting.preferredDateTime);
                            const sc = getStatusConfig(meeting.status);
                            const priorityInfo = getPriorityLabel(meeting.priority);
                            const canCancel = meeting.status === 'PENDING' || meeting.status === 'ACCEPTED';
                            const canGiveFeedback = meeting.status === 'COMPLETED' && meeting.rating === null;

                            return (
                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={meeting.id}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.35, delay: index * 0.04 }}
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            overflow: 'hidden',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.25s ease',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-3px)',
                                                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                                            },
                                        }}
                                    >
                                        {/* Accent bar */}
                                        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${sc.color}, ${alpha(sc.color, 0.4)})` }} />

                                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Stack spacing={2} sx={{ flex: 1 }}>
                                                {/* ── Header: Subject + Status ── */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                                                            {meeting.subject}
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                                            <Chip
                                                                label={MEETING_TYPE_LABELS[meeting.meetingType] || meeting.meetingType}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                    color: 'primary.main',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                }}
                                                            />
                                                            {meeting.isOnline ? (
                                                                <Chip
                                                                    icon={<VideoCallIcon sx={{ fontSize: '14px !important' }} />}
                                                                    label="Online"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.7rem', borderColor: 'divider', '& .MuiChip-icon': { color: 'inherit' } }}
                                                                />
                                                            ) : meeting.location ? (
                                                                <Chip
                                                                    icon={<LocationOnIcon sx={{ fontSize: '14px !important' }} />}
                                                                    label="In-Person"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.7rem', borderColor: 'divider', '& .MuiChip-icon': { color: 'inherit' } }}
                                                                />
                                                            ) : null}
                                                        </Stack>
                                                    </Box>
                                                    <Chip
                                                        icon={
                                                            sc.pulse
                                                                ? <FiberManualRecordIcon sx={{ fontSize: 8, color: `${sc.color} !important`, animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                                                                : sc.icon
                                                        }
                                                        label={sc.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(sc.color, 0.1),
                                                            color: sc.color,
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                            flexShrink: 0,
                                                            '& .MuiChip-icon': { color: 'inherit' },
                                                        }}
                                                    />
                                                </Stack>

                                                {/* ── Lecturer Name ── */}
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {meeting.lecturerName}
                                                    </Typography>
                                                </Stack>

                                                {/* ── Description ── */}
                                                {meeting.description && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.6,
                                                        }}
                                                    >
                                                        {meeting.description}
                                                    </Typography>
                                                )}

                                                {/* ── Meta Row ── */}
                                                <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{date}</Typography>
                                                    </Stack>
                                                    {time && (
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{time}</Typography>
                                                        </Stack>
                                                    )}
                                                    {meeting.preferredDurationMinutes > 0 && (
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <TimerIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{meeting.preferredDurationMinutes} min</Typography>
                                                        </Stack>
                                                    )}
                                                    <Tooltip title={`Priority: ${priorityInfo.label}`}>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <PriorityHighIcon sx={{ fontSize: 14, color: priorityInfo.color }} />
                                                            <Typography variant="caption" sx={{ color: priorityInfo.color, fontWeight: 600 }}>{priorityInfo.label}</Typography>
                                                        </Stack>
                                                    </Tooltip>
                                                </Stack>

                                                {/* ── Rating (if completed and rated) ── */}
                                                {meeting.status === 'COMPLETED' && meeting.rating !== null && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Rating value={meeting.rating} readOnly size="small" precision={0.5} />
                                                        <Typography variant="caption" color="text.secondary">({meeting.rating})</Typography>
                                                    </Stack>
                                                )}

                                                <Box sx={{ flex: 1 }} />
                                                <Divider />

                                                {/* ── Action Buttons ── */}
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewDetails(meeting)}
                                                        sx={{
                                                            borderRadius: 1,
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            borderColor: 'divider',
                                                            color: 'text.secondary',
                                                            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                    {canCancel && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<CancelIcon />}
                                                            onClick={() => handleCancelClick(meeting)}
                                                            disabled={isActionLoading}
                                                            sx={{
                                                                borderRadius: 1,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                                borderColor: alpha('#EF4444', 0.4),
                                                                color: '#EF4444',
                                                                '&:hover': { borderColor: '#EF4444', bgcolor: alpha('#EF4444', 0.05) },
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                    {canGiveFeedback && (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<FeedbackIcon />}
                                                            onClick={() => handleFeedbackClick(meeting)}
                                                            disabled={isSubmitting}
                                                            sx={{
                                                                borderRadius: 1,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                                bgcolor: '#8B5CF6',
                                                                boxShadow: `0 4px 14px ${alpha('#8B5CF6', 0.4)}`,
                                                                '&:hover': { bgcolor: '#7C3AED', boxShadow: `0 6px 20px ${alpha('#8B5CF6', 0.5)}` },
                                                            }}
                                                        >
                                                            Give Feedback
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </Grid>
                </AnimatePresence>
            )}

            {/* ══════════════  LOAD MORE  ══════════════ */}
            {!isRequestLoading && hasMore && displayMeetings.length > 0 && (
                <MotionBox variants={itemVariants} sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={handleLoadMore}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                        }}
                    >
                        Load More ({displayMeetings.length} of {totalMyRequests})
                    </Button>
                </MotionBox>
            )}

            {/* ══════════════  DIALOGS  ══════════════ */}
            <CreateMeetingDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                isSubmitting={isSubmitting}
                onSubmit={(data) => {
                    dispatch(createMeetingAsync(data)).then(() => handleCreateSuccess());
                }}
            />

            <MeetingDetailDialog
                open={detailDialogOpen}
                meeting={selectedMeeting}
                isLoading={isMeetingLoading}
                onClose={() => { setDetailDialogOpen(false); dispatch(clearSelectedMeeting()); }}
            />

            <FeedbackDialog
                open={feedbackDialogOpen}
                isSubmitting={isSubmitting}
                onClose={() => { setFeedbackDialogOpen(false); setActionMeeting(null); }}
                onSubmit={(data) => {
                    if (actionMeeting) {
                        dispatch(submitFeedbackAsync({ id: actionMeeting.id, data }));
                        setFeedbackDialogOpen(false);
                        setActionMeeting(null);
                    }
                }}
            />

            <CancelMeetingDialog
                open={cancelDialogOpen}
                isSubmitting={isActionLoading}
                onClose={() => { setCancelDialogOpen(false); setActionMeeting(null); }}
                onSubmit={handleCancelConfirm}
            />

            {/* ══════════════  SNACKBAR  ══════════════ */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

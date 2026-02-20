'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    Avatar,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchSessions,
    fetchUpcomingSessions,
    fetchSessionById,
    searchSessionsAsync,
    checkCanApplyAsync,
    checkIsKuppiStudentAsync,
    selectKuppiSessions,
    selectKuppiSelectedSession,
    selectKuppiTotalSessions,
    selectKuppiCanApply,
    selectKuppiIsKuppiStudent,
    selectKuppiIsLoading,
    selectKuppiIsSessionLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    clearKuppiSelectedSession,
    KuppiSessionResponse,
    SessionStatus,
} from '@/features/kuppi';

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
const STATUS_COLORS: Record<SessionStatus, string> = {
    SCHEDULED: '#3B82F6',
    IN_PROGRESS: '#10B981',
    COMPLETED: '#6B7280',
    CANCELLED: '#EF4444',
};

// Default status fallback
const DEFAULT_STATUS: SessionStatus = 'SCHEDULED';

// Safe status color getter
const getStatusColor = (status: SessionStatus | undefined | null): string => {
    if (!status || !(status in STATUS_COLORS)) {
        return STATUS_COLORS[DEFAULT_STATUS];
    }
    return STATUS_COLORS[status];
};

// Safe status display getter
const getStatusDisplay = (status: SessionStatus | undefined | null): string => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
};

// Get status icon
const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
        case 'SCHEDULED': return <EventIcon fontSize="small" />;
        case 'IN_PROGRESS': return <VideoCallIcon fontSize="small" />;
        case 'COMPLETED': return <CheckCircleIcon fontSize="small" />;
        case 'CANCELLED': return <CancelIcon fontSize="small" />;
        default: return undefined;
    }
};

// Format date/time
const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
};

export default function KuppiPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Redux state
    const sessions = useAppSelector(selectKuppiSessions);
    const selectedSession = useAppSelector(selectKuppiSelectedSession);
    const totalSessions = useAppSelector(selectKuppiTotalSessions);
    const canApply = useAppSelector(selectKuppiCanApply);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const isLoading = useAppSelector(selectKuppiIsLoading);
    const isSessionLoading = useAppSelector(selectKuppiIsSessionLoading);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Fetch sessions on mount
    useEffect(() => {
        dispatch(fetchSessions({ page: 0, size: 10 }));
        dispatch(checkCanApplyAsync());
        dispatch(checkIsKuppiStudentAsync());
    }, [dispatch]);

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setPage(0);
        if (newValue === 0) {
            dispatch(fetchSessions({ page: 0, size: 10 }));
        } else if (newValue === 1) {
            dispatch(fetchUpcomingSessions({ page: 0, size: 10 }));
        }
    };

    // Handle search
    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            dispatch(searchSessionsAsync({ keyword: searchQuery, page: 0, size: 10 }));
        } else {
            dispatch(fetchSessions({ page: 0, size: 10 }));
        }
    }, [dispatch, searchQuery]);

    // Handle refresh
    const handleRefresh = () => {
        if (activeTab === 0) {
            dispatch(fetchSessions({ page, size: 10 }));
        } else {
            dispatch(fetchUpcomingSessions({ page, size: 10 }));
        }
    };

    // Handle session click
    const handleSessionClick = (session: KuppiSessionResponse) => {
        dispatch(fetchSessionById(session.id));
        setDetailModalOpen(true);
    };

    // Handle close detail modal
    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        dispatch(clearKuppiSelectedSession());
    };

    // Handle error/success messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearKuppiSuccessMessage());
        }
    }, [error, successMessage, dispatch]);

    // Stats
    const stats = [
        { label: 'Total Sessions', value: totalSessions, icon: SchoolIcon, color: '#3B82F6' },
        { label: 'Available', value: sessions.filter(s => s.status === 'SCHEDULED').length, icon: EventIcon, color: '#10B981' },
        { label: 'In Progress', value: sessions.filter(s => s.status === 'IN_PROGRESS').length, icon: VideoCallIcon, color: '#F59E0B' },
        { label: 'Completed', value: sessions.filter(s => s.status === 'COMPLETED').length, icon: CheckCircleIcon, color: '#6B7280' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Page Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>Kuppi Sessions</Typography>
                        <Typography variant="body2" color="text.secondary">Join peer-led study sessions and excel in your studies</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<PersonIcon />}
                            onClick={() => router.push('/student/kuppi/tutors')}
                            sx={{ borderRadius: 1 }}
                            size="small"
                        >
                            Find Tutors
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            onClick={() => router.push('/student/kuppi/notes')}
                            sx={{ borderRadius: 1 }}
                            size="small"
                        >
                            Notes
                        </Button>
                        {isKuppiStudent && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => router.push('/student/kuppi/create')}
                                sx={{ borderRadius: 1 }}
                                size="small"
                            >
                                Create Session
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </MotionBox>

            {/* Hero Banner for non-Kuppi students */}
            {!isKuppiStudent && canApply && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 4, borderRadius: 3, background: theme.palette.primary.main, color: 'white' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={4}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>Become a Kuppi Host</Typography>
                                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>Share your knowledge and help fellow students succeed. Apply to become a Kuppi host today!</Typography>
                                <Button variant="text" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: alpha('#fff', 0.9) } }} onClick={() => router.push('/student/kuppi/hosts')}>Apply Now</Button>
                            </Box>
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <SchoolIcon sx={{ fontSize: 120, opacity: 0.3 }} />
                            </Box>
                        </Stack>
                    </CardContent>
                </MotionCard>
            )}

            {/* Stats Grid */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1) }}>
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

            {/* Filters */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 4, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{ maxWidth: { sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton size="small" onClick={handleSearch} disabled={isLoading}>
                                                <SearchIcon sx={{ color: 'text.secondary' }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => { setSearchQuery(''); dispatch(fetchSessions({ page: 0, size: 10 })); }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
                                <Tab label="All Sessions" />
                                <Tab label="Upcoming" />
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={isLoading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Sessions Grid */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : sessions.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Sessions Found</Typography>
                    <Typography color="text.secondary">Try adjusting your search or check back later for new sessions.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence mode="popLayout">
                        {sessions.map((session, index) => {
                            const { date, time } = formatDateTime(session.scheduledStartTime);
                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={session.id}>
                                    <MotionCard
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        elevation={0}
                                        sx={{
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                                            }
                                        }}
                                        onClick={() => handleSessionClick(session)}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={2}>
                                                {/* Header */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="h6" fontWeight={600} noWrap>{session.title}</Typography>
                                                        <Chip label={session.subject} size="small" sx={{ mt: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                                                    </Box>
                                                    <Chip
                                                        icon={getStatusIcon(session.status)}
                                                        label={getStatusDisplay(session.status)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getStatusColor(session.status), 0.1),
                                                            color: getStatusColor(session.status),
                                                            '& .MuiChip-icon': { color: 'inherit' }
                                                        }}
                                                    />
                                                </Stack>

                                                {/* Description */}
                                                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {session.description || 'No description provided'}
                                                </Typography>

                                                {/* Info Row */}
                                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">{date}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">{time}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">{session.viewCount} views</Typography>
                                                    </Stack>
                                                </Stack>

                                                {/* Host */}
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}>
                                                        {session.hostName?.[0] || 'H'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>{session.hostName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Host</Typography>
                                                    </Box>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </AnimatePresence>
                </Grid>
            )}

            {/* Session Detail Modal */}
            <Dialog open={detailModalOpen} onClose={handleCloseDetailModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Session Details</Typography>
                        <IconButton onClick={handleCloseDetailModal} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {isSessionLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : selectedSession ? (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" fontWeight={700}>{selectedSession.title}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip label={selectedSession.subject} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                                    <Chip
                                        icon={getStatusIcon(selectedSession.status)}
                                        label={getStatusDisplay(selectedSession.status)}
                                        size="small"
                                        sx={{ bgcolor: alpha(getStatusColor(selectedSession.status), 0.1), color: getStatusColor(selectedSession.status), '& .MuiChip-icon': { color: 'inherit' } }}
                                    />
                                </Stack>
                            </Box>

                            <Typography variant="body1" color="text.secondary">{selectedSession.description || 'No description provided'}</Typography>

                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <CalendarTodayIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                                        <Typography variant="body1">{formatDateTime(selectedSession.scheduledStartTime).date} at {formatDateTime(selectedSession.scheduledStartTime).time}</Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <PersonIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Host</Typography>
                                        <Typography variant="body1">{selectedSession.hostName}</Typography>
                                    </Box>
                                </Stack>

                                {selectedSession.meetingPlatform && (
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <VideoCallIcon color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Platform</Typography>
                                            <Typography variant="body1">{selectedSession.meetingPlatform}</Typography>
                                        </Box>
                                    </Stack>
                                )}

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <VisibilityIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Views</Typography>
                                        <Typography variant="body1">{selectedSession.viewCount}</Typography>
                                    </Box>
                                </Stack>
                            </Stack>

                            {/* Notes */}
                            {selectedSession.notes && selectedSession.notes.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Session Notes</Typography>
                                    <Stack spacing={1}>
                                        {selectedSession.notes.map((note) => (
                                            <Paper key={note.id} elevation={0} sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <DescriptionIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">{note.title}</Typography>
                                                    </Stack>
                                                    <Typography variant="caption" color="text.secondary">{note.formattedFileSize}</Typography>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    ) : (
                        <Typography color="text.secondary">No session selected</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDetailModal}>Close</Button>
                    {selectedSession?.canJoin && selectedSession.liveLink && (
                        <Button
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => window.open(selectedSession.liveLink, '_blank')}
                        >
                            Join Session
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

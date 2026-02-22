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
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Skeleton,
    LinearProgress,
    Divider,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TimerIcon from '@mui/icons-material/Timer';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchSessions,
    fetchUpcomingSessions,
    searchSessionsAsync,
    checkCanApplyAsync,
    checkIsKuppiStudentAsync,
    selectKuppiSessions,
    selectKuppiTotalSessions,
    selectKuppiCanApply,
    selectKuppiIsKuppiStudent,
    selectKuppiIsLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    SessionStatus,
} from '@/features/kuppi';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

// ── Status Configuration ─────────────────────────────────────
const STATUS_CONFIG: Record<SessionStatus, { color: string; icon: React.ReactElement; label: string; pulse?: boolean }> = {
    SCHEDULED: { color: '#3B82F6', icon: <EventIcon sx={{ fontSize: 14 }} />, label: 'Scheduled' },
    IN_PROGRESS: { color: '#10B981', icon: <VideoCallIcon sx={{ fontSize: 14 }} />, label: 'Live Now', pulse: true },
    COMPLETED: { color: '#6B7280', icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Completed' },
    CANCELLED: { color: '#EF4444', icon: <CancelIcon sx={{ fontSize: 14 }} />, label: 'Cancelled' },
};

const getStatusConfig = (status: SessionStatus | undefined | null) => {
    if (!status || !(status in STATUS_CONFIG)) return STATUS_CONFIG.SCHEDULED;
    return STATUS_CONFIG[status];
};

// ── Helpers ──────────────────────────────────────────────────
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
    const totalSessions = useAppSelector(selectKuppiTotalSessions);
    const canApply = useAppSelector(selectKuppiCanApply);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const isLoading = useAppSelector(selectKuppiIsLoading);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
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
            {/* ══════════════  PAGE HEADER  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Kuppi Sessions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Join peer-led study sessions and excel in your studies
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                            variant="outlined"
                            startIcon={<PersonIcon />}
                            onClick={() => router.push('/student/kuppi/tutors')}
                            size="small"
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                            }}
                        >
                            Find Tutors
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            onClick={() => router.push('/student/kuppi/notes')}
                            size="small"
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                            }}
                        >
                            Notes
                        </Button>
                        {isKuppiStudent && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => router.push('/student/kuppi/create')}
                                size="small"
                                sx={{
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                                }}
                            >
                                Create Session
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </MotionBox>

            {/* ══════════════  HERO BANNER (non-Kuppi students)  ══════════════ */}
            {!isKuppiStudent && canApply && (
                <MotionCard
                    variants={itemVariants}
                    elevation={0}
                    sx={{
                        mb: 4,
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
                        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '20px 20px' }} />
                        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                                    Become a Kuppi Host
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                                    Share your knowledge and help fellow students succeed. Apply to become a Kuppi host today!
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => router.push('/student/kuppi/hosts')}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        px: 3,
                                        borderRadius: 1,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                        '&:hover': { bgcolor: alpha('#fff', 0.92), transform: 'translateY(-1px)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Apply Now
                                </Button>
                            </Box>
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                <SchoolIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.6)' }} />
                            </Box>
                        </Stack>
                    </Box>
                </MotionCard>
            )}

            {/* ══════════════  STATS GRID  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
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
            </MotionBox>

            {/* ══════════════  FILTERS  ══════════════ */}
            <MotionCard
                variants={itemVariants}
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
                        <TextField
                            placeholder="Search sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{
                                maxWidth: { sm: 320 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton size="small" onClick={handleSearch} disabled={isLoading}>
                                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
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
                                <Tab label="All Sessions" />
                                <Tab label="Upcoming" />
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={isLoading}
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
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* ══════════════  SESSIONS GRID  ══════════════ */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                <Skeleton variant="rectangular" height={6} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Skeleton variant="text" width="60%" height={28} />
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                        <Skeleton variant="text" width="90%" />
                                        <Skeleton variant="text" width="70%" />
                                        <Stack direction="row" spacing={2}>
                                            <Skeleton variant="circular" width={36} height={36} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton variant="text" width="40%" />
                                                <Skeleton variant="text" width="25%" />
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : sessions.length === 0 ? (
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
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                        <SchoolIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Sessions Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                        Try adjusting your search or check back later for new sessions.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence mode="popLayout">
                        {sessions.map((session, index) => {
                            const { date, time } = formatDateTime(session.scheduledStartTime);
                            const sc = getStatusConfig(session.status);
                            const duration = session.scheduledStartTime && session.scheduledEndTime
                                ? Math.round((new Date(session.scheduledEndTime).getTime() - new Date(session.scheduledStartTime).getTime()) / 60000)
                                : 0;

                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={session.id}>
                                    <Link href={`/student/kuppi/${session.id}`} style={{ textDecoration: 'none' }}>
                                        <MotionCard
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.04 }}
                                            elevation={0}
                                            sx={{
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
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

                                            <CardContent sx={{ p: 3 }}>
                                                <Stack spacing={2}>
                                                    {/* ── Header ── */}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                                                                {session.title}
                                                            </Typography>
                                                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                                                <Chip
                                                                    label={session.subject}
                                                                    size="small"
                                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }}
                                                                />
                                                                {session.sessionType && (
                                                                    <Chip
                                                                        label={session.sessionType}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ fontSize: '0.7rem', textTransform: 'capitalize', borderColor: 'divider' }}
                                                                    />
                                                                )}
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
                                                                '& .MuiChip-icon': { color: 'inherit' },
                                                            }}
                                                        />
                                                    </Stack>

                                                    {/* ── Description ── */}
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}
                                                    >
                                                        {session.description || 'No description provided'}
                                                    </Typography>

                                                    {/* ── Meta Row ── */}
                                                    <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{date}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{time}</Typography>
                                                        </Stack>
                                                        {duration > 0 && (
                                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                                <TimerIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                                <Typography variant="caption" color="text.secondary">{duration} min</Typography>
                                                            </Stack>
                                                        )}
                                                    </Stack>

                                                    <Divider />

                                                    {/* ── Footer: Host + Capacity ── */}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                                            <Avatar
                                                                src={session.host.profilePictureUrl || undefined}
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                                    color: 'primary.main',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.8rem',
                                                                    border: '2px solid',
                                                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                                                }}
                                                            >
                                                                {session.host.fullName?.[0]?.toUpperCase() || 'H'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{session.host.fullName}</Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Host</Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                            {session.viewCount > 0 && (
                                                                <Stack direction="row" spacing={0.25} alignItems="center">
                                                                    <VisibilityIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                                    <Typography variant="caption" color="text.secondary">{session.viewCount}</Typography>
                                                                </Stack>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </MotionCard>
                                    </Link>
                                </Grid>
                            );
                        })}
                    </AnimatePresence>
                </Grid>
            )}

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, Chip, Button, Avatar,
    Divider, Snackbar, Alert, Stack, Grid, alpha, useTheme, CircularProgress,
    Tooltip, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// ...existing icon imports...
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SubjectIcon from '@mui/icons-material/Subject';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LinkIcon from '@mui/icons-material/Link';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import TimerIcon from '@mui/icons-material/Timer';
import EmailIcon from '@mui/icons-material/Email';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

import { SAMPLE_SESSIONS } from '@/lib/constants/kuppi.constants';
import {
    getTutorInitials,
    formatSessionDate,
    formatSessionTime,
    getDifficultyColor,
} from '@/components/features/kuppi';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchSessionById,
    selectKuppiSelectedSession, selectKuppiIsSessionLoading, selectKuppiSessions,
    updateSessionAsync, selectKuppiIsUpdating,
    selectKuppiError, selectKuppiSuccessMessage,
    clearKuppiError, clearKuppiSuccessMessage,
    UpdateKuppiSessionRequest,
    checkIsKuppiStudentAsync,
    cancelSessionAsync,
    deleteSessionAsync,
    selectKuppiIsDeleting,
} from '@/features/kuppi';
import { useAuth } from '@/hooks';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

/* ── Constants ───────────────────────────────────────────────────── */

const SUBJECT_SUGGESTIONS = [
    'Data Structures', 'Algorithms', 'Object Oriented Programming',
    'Database Management', 'Web Development', 'Mobile Development',
    'Software Engineering', 'Computer Networks', 'Operating Systems',
    'Machine Learning', 'Artificial Intelligence', 'Mathematics',
    'Statistics', 'Physics',
];

const MEETING_PLATFORMS = ['Google Meet', 'Zoom', 'Microsoft Teams', 'Discord', 'Other'];

const editFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 1,
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
    },
};

/* ── Helpers ─────────────────────────────────────────────────────── */

function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusConfig(status: string | null) {
    switch (status?.toLowerCase()) {
        case 'active':
        case 'ongoing':
            return { label: 'Live Now', color: '#10B981', pulse: true };
        case 'upcoming':
        case 'scheduled':
            return { label: 'Upcoming', color: '#3B82F6', pulse: false };
        case 'completed':
            return { label: 'Completed', color: '#6B7280', pulse: false };
        case 'cancelled':
            return { label: 'Cancelled', color: '#EF4444', pulse: false };
        default:
            return { label: status || 'Scheduled', color: '#3B82F6', pulse: false };
    }
}

function getSessionTypeIcon(type: string | null) {
    switch (type?.toLowerCase()) {
        case 'workshop': return <BuildIcon sx={{ fontSize: 16 }} />;
        case 'lecture': return <SchoolIcon sx={{ fontSize: 16 }} />;
        default: return <EventIcon sx={{ fontSize: 16 }} />;
    }
}

function formatTimeRange(start: string | null, end: string | null): string {
    if (!start) return '';
    const fmt = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

export default function KuppiSessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const sessionId = params.id as string;

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

    // ── Edit Session State ──
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '', subject: '', description: '',
        startDate: '', startTime: '', endDate: '', endTime: '',
        liveLink: '', meetingPlatform: '',
    });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    // Cancel / Delete state
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const dispatch = useAppDispatch();
    const selectedSession = useAppSelector(selectKuppiSelectedSession);
    const isSessionLoading = useAppSelector(selectKuppiIsSessionLoading);
    const sessionsList = useAppSelector(selectKuppiSessions);
    const isUpdating = useAppSelector(selectKuppiIsUpdating);
    const isDeleting = useAppSelector(selectKuppiIsDeleting);
    const reduxError = useAppSelector(selectKuppiError);
    const reduxSuccess = useAppSelector(selectKuppiSuccessMessage);

    // Check if user is a Kuppi Student (host) on mount
    useEffect(() => { dispatch(checkIsKuppiStudentAsync()); }, [dispatch]);

    // Try to load from backend when sessionId looks numeric or 'session-<number>' slug
    useEffect(() => {
        const numericId = Number(sessionId);
        if (!Number.isNaN(numericId)) {
            dispatch(fetchSessionById(numericId));
            return;
        }
        // attempt to extract trailing number from slugs like 'session-1' or '123-session'
        const m = String(sessionId).match(/(\d+)$/);
        if (m) {
            const n = Number(m[1]);
            if (!Number.isNaN(n)) dispatch(fetchSessionById(n));
        }
    }, [dispatch, sessionId]);

    const rawSession = useMemo(() => {
        // prefer selectedSession from store (API) when available
        if (selectedSession && String((selectedSession as any).id) === String(sessionId)) return selectedSession as any;
        // next, try the sessions list already fetched (match by exact or numeric suffix)
        if (sessionsList && sessionsList.length) {
            // direct match
            let found = sessionsList.find((s: any) => String(s.id) === String(sessionId));
            if (found) return found as any;
            // if sessionId is like 'session-1', try to match numeric suffix
            const m = String(sessionId).match(/(\d+)$/);
            if (m) {
                const n = Number(m[1]);
                if (!Number.isNaN(n)) found = sessionsList.find((s: any) => Number(s.id) === n);
                if (found) return found as any;
            }
        }
        // fallback to local sample data (string ids)
        return SAMPLE_SESSIONS.find(s => String(s.id) === String(sessionId));
    }, [selectedSession, sessionId, sessionsList]);

    // Normalize session shape so the JSX can use common fields
    const session = useMemo(() => {
        if (!rawSession) return null;
        const rs: any = rawSession;
        // If API shape (has scheduledStartTime), map accordingly
        if (rs.scheduledStartTime) {
            const start = rs.scheduledStartTime;
            const end = rs.scheduledEndTime;
            const duration = start && end ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000) : (rs.duration || 0);
            return {
                id: rs.id,
                title: rs.title,
                subject: rs.subject || '',
                description: rs.description || '',
                date: start,
                time: start,
                duration,
                sessionType: rs.sessionType ?? rs.session_type ?? null,
                status: rs.status ?? null,
                scheduledStartTime: rs.scheduledStartTime ?? null,
                scheduledEndTime: rs.scheduledEndTime ?? null,
                liveLink: rs.liveLink ?? null,
                meetingPlatform: rs.meetingPlatform ?? null,
                topics: rs.topics || [],
                isOnline: !!rs.liveLink || !!rs.meetingPlatform || rs.isOnline,
                meetingLink: rs.liveLink || rs.meetingLink || null,
                viewCount: rs.viewCount ?? rs.view_count ?? 0,
                createdAt: rs.createdAt ?? rs.created_at ?? null,
                updatedAt: rs.updatedAt ?? rs.updated_at ?? null,
                host: {
                    id: rs.hostId ?? rs.host?.id ?? null,
                    name: rs.hostName ?? rs.host?.name ?? 'Unknown',
                    email: rs.hostEmail ?? rs.host?.email ?? null,
                    department: rs.hostDepartment ?? rs.host?.department ?? '',
                    rating: rs.hostRating ?? rs.host?.rating ?? 0,
                    sessionsHosted: rs.hostSessionsHosted ?? rs.host?.sessionsHosted ?? 0,
                    gpa: rs.hostGpa ?? rs.host?.gpa ?? null,
                    profilePictureUrl: rs.host?.profilePictureUrl ?? null,
                },
                isActive: rs.isActive ?? rs.is_active ?? false,
                canJoin: rs.canJoin ?? rs.can_join ?? false,
            } as any;
        }

        // Fallback: sample session shape
        return {
            id: rs.id,
            title: rs.title,
            subject: rs.subject || '',
            description: rs.description || '',
            date: rs.date || '',
            time: rs.time || '',
            duration: rs.duration || 0,
            viewCount: rs.viewCount ?? 0,
            createdAt: rs.createdAt ?? null,
            updatedAt: rs.updatedAt ?? null,
            sessionType: rs.sessionType ?? null,
            status: rs.status ?? null,
            scheduledStartTime: rs.scheduledStartTime ?? null,
            scheduledEndTime: rs.scheduledEndTime ?? null,
            liveLink: rs.liveLink ?? null,
            meetingPlatform: rs.meetingPlatform ?? null,
            isActive: rs.isActive ?? false,
            canJoin: rs.canJoin ?? false,
            topics: rs.topics || [],
            isOnline: rs.isOnline ?? false,
            meetingLink: rs.meetingLink || null,
            host: {
                id: rs.host?.id ?? rs.host?.userId ?? null,
                name: rs.host?.name ?? 'Unknown',
                email: rs.host?.email ?? null,
                department: rs.host?.department ?? '',
                rating: rs.host?.rating ?? 0,
                sessionsHosted: rs.host?.sessionsHosted ?? 0,
                gpa: rs.host?.gpa ?? null,
            },
        } as any;
    }, [rawSession]);

    const { user } = useAuth();
    const isHost = !!(user && session && user.email && session.host?.email && user.email === session.host.email);

    // Determine whether the session can be cancelled from the UI
    const isCancellable = useMemo(() => {
        if (!session) return false;
        const st = String(session.status || '').toLowerCase();
        // do not allow cancelling sessions that are completed or already cancelled
        return st !== 'completed' && st !== 'cancelled';
    }, [session]);

    // ── Edit Dialog Helpers ──
    const openEditDialog = useCallback(() => {
        if (!session) return;
        const start = session.scheduledStartTime ? new Date(session.scheduledStartTime) : null;
        const end = session.scheduledEndTime ? new Date(session.scheduledEndTime) : null;
        setEditForm({
            title: session.title || '',
            subject: session.subject || '',
            description: session.description || '',
            startDate: start ? start.toISOString().slice(0, 10) : '',
            startTime: start ? start.toTimeString().slice(0, 5) : '',
            endDate: end ? end.toISOString().slice(0, 10) : '',
            endTime: end ? end.toTimeString().slice(0, 5) : '',
            liveLink: session.liveLink || session.meetingLink || '',
            meetingPlatform: session.meetingPlatform || '',
        });
        setEditErrors({});
        setIsEditOpen(true);
    }, [session]);

    const handleEditChange = (field: string, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
        if (editErrors[field]) setEditErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!editForm.title.trim()) errors.title = 'Title is required';
        if (editForm.title.length > 200) errors.title = 'Title must be less than 200 characters';
        if (!editForm.subject.trim()) errors.subject = 'Subject is required';
        if (!editForm.startDate) errors.startDate = 'Start date is required';
        if (!editForm.startTime) errors.startTime = 'Start time is required';
        if (!editForm.endDate) errors.endDate = 'End date is required';
        if (!editForm.endTime) errors.endTime = 'End time is required';
        if (!editForm.liveLink.trim()) errors.liveLink = 'Meeting link is required';
        const startDT = new Date(`${editForm.startDate}T${editForm.startTime}`);
        const endDT = new Date(`${editForm.endDate}T${editForm.endTime}`);
        if (endDT <= startDT) errors.endTime = 'End time must be after start time';
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditSubmit = async () => {
        if (!validateEditForm() || !session) return;
        const data: UpdateKuppiSessionRequest = {
            title: editForm.title,
            description: editForm.description || undefined,
            subject: editForm.subject,
            scheduledStartTime: `${editForm.startDate}T${editForm.startTime}:00`,
            scheduledEndTime: `${editForm.endDate}T${editForm.endTime}:00`,
            liveLink: editForm.liveLink,
            meetingPlatform: editForm.meetingPlatform || undefined,
        };
        const result = await dispatch(updateSessionAsync({ id: Number(session.id), data }));
        if (updateSessionAsync.fulfilled.match(result)) {
            setSnackbarMessage('Session updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setIsEditOpen(false);
            dispatch(fetchSessionById(Number(session.id)));
        } else {
            const errMsg = typeof result.payload === 'string' ? result.payload : 'Failed to update session';
            setSnackbarMessage(errMsg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Cancel session handler
    const handleCancelSession = async () => {
        if (!session) return;
        // Guard: if the session is completed or cancelled don't attempt to call API
        const st = String(session.status || '').toLowerCase();
        if (st === 'completed') {
            setSnackbarMessage('Cannot cancel a completed session');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setCancelDialogOpen(false);
            setCancelReason('');
            return;
        }
        if (st === 'cancelled') {
            setSnackbarMessage('This session is already cancelled');
            setSnackbarSeverity('info');
            setSnackbarOpen(true);
            setCancelDialogOpen(false);
            setCancelReason('');
            return;
        }
        setActionLoading(true);
        try {
            const result = await dispatch(cancelSessionAsync({ id: Number(session.id), reason: cancelReason })).unwrap();
            setSnackbarMessage(result?.message || 'Session cancelled');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setCancelDialogOpen(false);
            // refresh details
            dispatch(fetchSessionById(Number(session.id)));
        } catch (err: unknown) {
            const errMsg = typeof err === 'string' ? err : (err as any)?.message || 'Failed to cancel session';
            setSnackbarMessage(errMsg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
            setCancelReason('');
        }
    };

    // Delete session handler
    const handleDeleteSession = async () => {
        if (!session) return;
        setActionLoading(true);
        try {
            await dispatch(deleteSessionAsync(Number(session.id))).unwrap();
            setSnackbarMessage('Session deleted');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setDeleteDialogOpen(false);
            // navigate back to sessions list
            router.push('/student/kuppi');
        } catch (err: unknown) {
            setSnackbarMessage((err as any)?.message || 'Failed to delete session');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    // Clear redux messages
    useEffect(() => {
        if (reduxError) dispatch(clearKuppiError());
        if (reduxSuccess) dispatch(clearKuppiSuccessMessage());
    }, [reduxError, reduxSuccess, dispatch]);

    if (isSessionLoading) {
        return (
            <Box sx={{ p: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>Loading session...</Typography>
            </Box>
        );
    }

    if (!session) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                    Session not found
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi')}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Back to Sessions
                </Button>
            </Box>
        );
    }

    const difficultyColor = getDifficultyColor(session.difficulty);


    const statusConfig = getStatusConfig(session.status);
    const timeRange = formatTimeRange(session.scheduledStartTime, session.scheduledEndTime);

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setSnackbarMessage('Meeting link copied!');
        setSnackbarOpen(true);
    };

    /* stagger animation helper */
    const stagger = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 * i, duration: 0.35 } });

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* ── Back Navigation ────────────────────────────────── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi')}
                sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) } }}
            >
                Back to Sessions
            </Button>

            <Grid container spacing={3}>
                {/* ══════════════  LEFT COLUMN  ══════════════ */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* ── Hero Header ────────────────────────────── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        <Box
                            sx={{
                                background: theme.palette.primary.main,
                                p: { xs: 2.5, sm: 3.5 },
                                position: 'relative',
                            }}
                        >
                            {/* dot-grid overlay */}
                            <Box>
                                {/* ── Status + Chips row ── */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                    {/* Status badge */}
                                    <Chip
                                        icon={
                                            statusConfig.pulse
                                                ? <FiberManualRecordIcon sx={{ fontSize: 10, color: `${statusConfig.color} !important`, animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
                                                : undefined
                                        }
                                        label={statusConfig.label}
                                        size="small"
                                        sx={{ bgcolor: alpha(statusConfig.color, 0.25), color: 'white', fontWeight: 700, letterSpacing: '0.02em' }}
                                    />
                                    <Chip label={session.subject} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
                                    <Chip label={session.difficulty} size="small" sx={{ bgcolor: alpha(difficultyColor, 0.3), color: 'white', fontWeight: 600, textTransform: 'capitalize' }} />
                                    {session.sessionType && (
                                        <Chip
                                            icon={getSessionTypeIcon(session.sessionType)}
                                            label={session.sessionType}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, textTransform: 'capitalize', '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' } }}
                                        />
                                    )}
                                    {session.isOnline && (
                                        <Chip
                                            icon={<VideocamIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                                            label={session.meetingPlatform ? `Online · ${session.meetingPlatform}` : 'Online'}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                                        />
                                    )}
                                </Stack>

                                {/* Title */}
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2, lineHeight: 1.25 }}>
                                    {session.title}
                                </Typography>

                                {/* Meta row */}
                                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{formatSessionDate(session.date)}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <AccessTimeIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            {timeRange || formatSessionTime(session.time)} ({session.duration} min)
                                        </Typography>
                                    </Stack>
                                    {session.viewCount > 0 && (
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <VisibilityIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{session.viewCount} views</Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>
                        </Box>

                        {/* ── Quick Stats Bar ── */}
                        <Stack
                            direction="row"
                            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                        >
                            {[
                                { icon: <TimerIcon sx={{ fontSize: 18, color: 'primary.main' }} />, label: 'Duration', value: `${session.duration} min` },
                                ...(session.viewCount > 0 ? [{ icon: <VisibilityIcon sx={{ fontSize: 18, color: 'info.main' }} />, label: 'Views', value: String(session.viewCount) }] : []),
                            ].map((stat, idx) => (
                                <Box key={idx} sx={{ flex: 1, py: 1.5, px: 2, textAlign: 'center' }}>
                                    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                        {stat.icon}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{stat.label}</Typography>
                                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{stat.value}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>

                        <CardContent sx={{ p: 3 }}>
                            {/* ── About ── */}
                            <MotionBox {...stagger(1)}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>About this session</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{session.description || 'No description provided.'}</Typography>
                            </MotionBox>

                            <Divider sx={{ my: 3 }} />

                            {/* ── Session Details Grid ── */}
                            <MotionBox {...stagger(2)}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>Session Details</Typography>
                                <Grid container spacing={2}>
                                    {[
                                        { icon: <CalendarTodayIcon sx={{ fontSize: 18 }} />, label: 'Date', value: formatSessionDate(session.date) },
                                        { icon: <AccessTimeIcon sx={{ fontSize: 18 }} />, label: 'Time', value: timeRange || formatSessionTime(session.time) },
                                        { icon: <TimerIcon sx={{ fontSize: 18 }} />, label: 'Duration', value: `${session.duration} minutes` },
                                        ...(session.sessionType ? [{ icon: <EventIcon sx={{ fontSize: 18 }} />, label: 'Type', value: session.sessionType }] : []),
                                        ...(session.meetingPlatform ? [{ icon: <VideocamIcon sx={{ fontSize: 18 }} />, label: 'Platform', value: session.meetingPlatform }] : []),
                                    ].map((item, idx) => (
                                        <Grid size={{ xs: 6, sm: 4 }} key={idx}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                                    borderColor: 'divider',
                                                    height: '100%',
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                    <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                                                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                                </Stack>
                                                <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{item.value}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </MotionBox>

                            <Divider sx={{ my: 3 }} />

                            {/* ── Topics Covered ── */}
                            {session.topics.length > 0 && (
                                <MotionBox {...stagger(3)}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>Topics Covered</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {session.topics.map((topic: string) => (
                                            <Chip
                                                key={topic}
                                                label={topic}
                                                size="small"
                                                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                                sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 500, '& .MuiChip-icon': { color: 'success.main' } }}
                                            />
                                        ))}
                                    </Stack>
                                    <Divider sx={{ my: 3 }} />
                                </MotionBox>
                            )}

                            {/* ── Meeting Information ── */}
                            {session.isOnline && (session.meetingLink || session.liveLink) && (
                                <MotionBox {...stagger(4)}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>Meeting Information</Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette.info.main, 0.04),
                                            borderColor: alpha(theme.palette.info.main, 0.2),
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            {session.meetingPlatform && (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <VideocamIcon sx={{ fontSize: 18, color: 'info.main' }} />
                                                    <Typography variant="body2" color="text.secondary">Platform:</Typography>
                                                    <Typography variant="body2" fontWeight={600}>{session.meetingPlatform}</Typography>
                                                </Stack>
                                            )}
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <LinkIcon sx={{ fontSize: 18, color: 'info.main' }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                                                    {session.meetingLink || session.liveLink}
                                                </Typography>
                                                <Tooltip title="Copy link">
                                                    <IconButton size="small" onClick={() => handleCopyLink(session.meetingLink || session.liveLink)}>
                                                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                            <Button
                                                variant="contained"
                                                startIcon={<VideocamIcon />}
                                                onClick={() => window.open(session.meetingLink || session.liveLink, '_blank')}
                                                sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
                                            >
                                                Join {session.meetingPlatform || 'Online'} Session
                                            </Button>
                                        </Stack>
                                    </Paper>
                                    <Divider sx={{ my: 3 }} />
                                </MotionBox>
                            )}

                            {/* ── Host Edit Button ── */}
                            {isHost && (
                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={openEditDialog}
                                        sx={{
                                            borderRadius: 1, textTransform: 'none', fontWeight: 700, mr: 2,
                                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                                            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                                        }}
                                    >
                                        Edit Session
                                    </Button>

                                    {isCancellable && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => setCancelDialogOpen(true)}
                                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, mr: 2 }}
                                            disabled={actionLoading || isDeleting}
                                        >
                                            Cancel Session
                                        </Button>
                                    )}

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
                                        onClick={() => setDeleteDialogOpen(true)}
                                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700 }}
                                        disabled={actionLoading || isDeleting}
                                    >
                                        Delete Session
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </MotionCard>
                </Grid>

                {/* ══════════════  RIGHT COLUMN (Sidebar)  ══════════════ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* ── Host Profile Card ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'visible' }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight={600} color="text.primary">Hosted by</Typography>
                            </Stack>

                            {/* Avatar + name — clickable to tutor profile */}
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                onClick={() => session.host.id && router.push(`/student/kuppi/tutors/${session.host.id}`)}
                                sx={{
                                    mb: 1.5,
                                    cursor: session.host.id ? 'pointer' : 'default',
                                    borderRadius: 1,
                                    p: 1,
                                    mx: -1,
                                    transition: 'background-color 0.2s',
                                    '&:hover': session.host.id ? { bgcolor: alpha(theme.palette.primary.main, 0.06) } : {},
                                }}
                            >
                                <Avatar
                                    src={session.host.profilePictureUrl || undefined}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        border: '3px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                    }}
                                >
                                    {getTutorInitials(session.host.name)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                        noWrap
                                        sx={session.host.id ? { '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' } : {}}
                                    >
                                        {session.host.name}
                                    </Typography>
                                    {session.host.email && (
                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.15 }}>
                                            <EmailIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary" noWrap>{session.host.email}</Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Stack>
                        </CardContent>
                    </MotionCard>

                    {/* ── Session Info Card ── */}
                    {(session.scheduledStartTime || session.createdAt) && (
                        <MotionCard
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28 }}
                            sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>Session Info</Typography>
                                <Stack spacing={1.5}>
                                    {session.scheduledStartTime && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Scheduled Start</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {new Date(session.scheduledStartTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {session.scheduledEndTime && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Scheduled End</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {new Date(session.scheduledEndTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {session.createdAt && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Created</Typography>
                                            <Typography variant="body2" fontWeight={600}>{getRelativeTime(session.createdAt)}</Typography>
                                        </Stack>
                                    )}
                                    {session.updatedAt && session.updatedAt !== session.createdAt && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                                            <Typography variant="body2" fontWeight={600}>{getRelativeTime(session.updatedAt)}</Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    )}
                </Grid>
            </Grid>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ borderRadius: 2 }}>{snackbarMessage}</Alert>
            </Snackbar>

            {/* ══════════════  EDIT SESSION DIALOG  ══════════════ */}
            <Dialog
                open={isEditOpen}
                onClose={() => !isUpdating && setIsEditOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{ '& .MuiPaper-root': { borderRadius: 2, overflow: 'hidden' } }}
            >
                {/* Gradient accent */}
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.primary.main}, #6366F1)` }} />

                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <EditIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Edit Session</Typography>
                            <Typography variant="caption" color="text.secondary">Update your Kuppi session details</Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack spacing={3}>
                        {/* ── Session Info ── */}
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <SubjectIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Typography variant="subtitle2" fontWeight={700}>Session Information</Typography>
                            </Stack>
                            <Stack spacing={2}>
                                <TextField
                                    label="Session Title" placeholder="e.g., Data Structures - Binary Trees" fullWidth required
                                    value={editForm.title} onChange={(e) => handleEditChange('title', e.target.value)}
                                    error={!!editErrors.title} helperText={editErrors.title || 'Max 200 characters'} sx={editFieldSx}
                                />
                                <TextField
                                    label="Subject" fullWidth required select
                                    value={editForm.subject} onChange={(e) => handleEditChange('subject', e.target.value)}
                                    error={!!editErrors.subject} helperText={editErrors.subject} sx={editFieldSx}
                                >
                                    {SUBJECT_SUGGESTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </TextField>
                                <TextField
                                    label="Description" placeholder="Describe what you'll cover..." fullWidth multiline rows={3}
                                    value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)}
                                    helperText="Optional — Max 2000 characters" sx={editFieldSx}
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        {/* ── Schedule ── */}
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <Box sx={{ width: 30, height: 30, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#3B82F6', 0.1) }}>
                                    <CalendarTodayIcon sx={{ fontSize: 15, color: '#3B82F6' }} />
                                </Box>
                                <Typography variant="subtitle2" fontWeight={700}>Schedule</Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label="Start Date" type="date" fullWidth required value={editForm.startDate}
                                        onChange={(e) => handleEditChange('startDate', e.target.value)} error={!!editErrors.startDate}
                                        helperText={editErrors.startDate} slotProps={{ inputLabel: { shrink: true } }} sx={editFieldSx} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label="Start Time" type="time" fullWidth required value={editForm.startTime}
                                        onChange={(e) => handleEditChange('startTime', e.target.value)} error={!!editErrors.startTime}
                                        helperText={editErrors.startTime} slotProps={{ inputLabel: { shrink: true } }} sx={editFieldSx} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label="End Date" type="date" fullWidth required value={editForm.endDate}
                                        onChange={(e) => handleEditChange('endDate', e.target.value)} error={!!editErrors.endDate}
                                        helperText={editErrors.endDate} slotProps={{ inputLabel: { shrink: true } }} sx={editFieldSx} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label="End Time" type="time" fullWidth required value={editForm.endTime}
                                        onChange={(e) => handleEditChange('endTime', e.target.value)} error={!!editErrors.endTime}
                                        helperText={editErrors.endTime} slotProps={{ inputLabel: { shrink: true } }} sx={editFieldSx} />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* ── Meeting Details ── */}
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <Box sx={{ width: 30, height: 30, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#10B981', 0.1) }}>
                                    <VideoCallIcon sx={{ fontSize: 15, color: '#10B981' }} />
                                </Box>
                                <Typography variant="subtitle2" fontWeight={700}>Meeting Details</Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField label="Meeting Platform" fullWidth select value={editForm.meetingPlatform}
                                        onChange={(e) => handleEditChange('meetingPlatform', e.target.value)} sx={editFieldSx}>
                                        {MEETING_PLATFORMS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField label="Meeting Link" placeholder="https://meet.google.com/..." fullWidth required
                                        value={editForm.liveLink} onChange={(e) => handleEditChange('liveLink', e.target.value)}
                                        error={!!editErrors.liveLink} helperText={editErrors.liveLink} sx={editFieldSx}
                                        slotProps={{ input: { startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> } }} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setIsEditOpen(false)}
                        disabled={isUpdating}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                        onClick={handleEditSubmit}
                        disabled={isUpdating}
                        sx={{
                            borderRadius: 1, textTransform: 'none', fontWeight: 700, px: 3,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                        }}
                    >
                        {isUpdating ? 'Updating...' : 'Update Session'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* CANCEL CONFIRMATION DIALOG */}
            <Dialog open={cancelDialogOpen} onClose={() => !actionLoading && setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Cancel Session</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Provide a reason for cancelling (optional) — this will be sent to attendees.</Typography>
                    <TextField fullWidth multiline rows={3} placeholder="Reason (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>Close</Button>
                    <Button variant="contained" color="error" onClick={handleCancelSession} disabled={actionLoading || isDeleting}>{actionLoading || isDeleting ? <CircularProgress size={20} /> : 'Cancel Session'}</Button>
                </DialogActions>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog open={deleteDialogOpen} onClose={() => !actionLoading && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Session</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to permanently delete this session? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteSession} disabled={actionLoading || isDeleting}>{actionLoading || isDeleting ? <CircularProgress size={20} /> : 'Delete'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

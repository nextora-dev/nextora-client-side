'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Avatar,
    Stack,
    Grid,
    Chip,
    Divider,
    alpha,
    useTheme,
    Paper,
    Snackbar,
    Alert,
    Skeleton,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import VerifiedIcon from '@mui/icons-material/Verified';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import GroupIcon from '@mui/icons-material/Group';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchKuppiStudentById,
    selectSelectedKuppiStudent,
    selectKuppiStudentDetailLoading,
    selectKuppiError,
    clearKuppiError,
    clearSelectedKuppiStudent,
    SessionStatus,
} from '@/features/kuppi';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

// ── Status Configuration ─────────────────
const STATUS_CONFIG: Record<SessionStatus, { color: string; icon: React.ReactElement; pulse?: boolean }> = {
    SCHEDULED: { color: '#3B82F6', icon: <EventIcon sx={{ fontSize: 14 }} /> },
    IN_PROGRESS: { color: '#10B981', icon: <VideoCallIcon sx={{ fontSize: 14 }} />, pulse: true },
    COMPLETED: { color: '#6B7280', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
    CANCELLED: { color: '#EF4444', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
};

const EXPERIENCE_COLORS: Record<string, string> = {
    BEGINNER: '#10B981',
    INTERMEDIATE: '#3B82F6',
    ADVANCED: '#8B5CF6',
};

const getInitials = (name: string): string =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export default function TutorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const studentId = Number(params.id);

    const student = useAppSelector(selectSelectedKuppiStudent);
    const isLoading = useAppSelector(selectKuppiStudentDetailLoading);
    const error = useAppSelector(selectKuppiError);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'error' });

    useEffect(() => {
        if (studentId) dispatch(fetchKuppiStudentById(studentId));
        return () => { dispatch(clearSelectedKuppiStudent()); };
    }, [dispatch, studentId]);

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); dispatch(clearKuppiError()); }
    }, [error, dispatch]);

    /* ── Loading skeleton ── */
    if (isLoading) {
        return (
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                <Skeleton variant="text" width={140} height={36} sx={{ mb: 2 }} />
                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            {[...Array(4)].map((_, i) => <Grid size={{ xs: 6, sm: 3 }} key={i}><Skeleton variant="rounded" height={70} sx={{ borderRadius: 1 }} /></Grid>)}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    /* ── Not Found ── */
    if (!student && !isLoading) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <PersonIcon sx={{ fontSize: 40, color: alpha(theme.palette.error.main, 0.4) }} />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>Tutor Not Found</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>This tutor profile doesn't exist or has been removed.</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi/tutors')} variant="outlined" sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
                    Back to Tutors
                </Button>
            </Box>
        );
    }

    if (!student) return null;

    const expColor = EXPERIENCE_COLORS[student.kuppiExperienceLevel] || '#6B7280';

    return (
        <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ maxWidth: 1000, mx: 'auto' }}>
            {/* ── Back Button ── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi/tutors')}
                sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
            >
                Back to Tutors
            </Button>

            {/* ══════════════  HERO PROFILE CARD  ══════════════ */}
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                elevation={0}
                sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'hidden' }}
            >
                {/* Gradient Banner */}
                <Box
                    sx={{
                        height: 160,
                        background: theme.palette.background.paper,
                        position: 'relative',
                    }}
                >
                    <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 2px, transparent 0)', backgroundSize: '20px 20px' }} />
                </Box>

                <CardContent sx={{ p: 3, pt: 0, mt: -16, position: 'relative', zIndex: 1 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-end' }}>
                        <Avatar
                            src={student.profilePictureUrl || undefined}
                            sx={{
                                width: 110,
                                height: 110,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: 'primary.main',
                                fontWeight: 700,
                                fontSize: '2.2rem',
                                border: '4px solid',
                                borderColor: 'background.paper',
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}
                        >
                            {getInitials(student.fullName)}
                        </Avatar>
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, pb: 0.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                <Typography variant="h4" fontWeight={700}>{student.fullName}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ mt: 0.5 }}>
                                <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">{student.program}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }} justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
                                <Chip
                                    label={student.kuppiExperienceLevel}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(expColor, 0.1),
                                        color: expColor,
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        border: '1px solid',
                                        borderColor: alpha(expColor, 0.2),
                                    }}
                                />
                                <Chip label={student.faculty} size="small" variant="outlined" sx={{ borderColor: 'divider', fontWeight: 500 }} />
                            </Stack>
                        </Box>
                    </Stack>

                    {/* ── Quick Stats ── */}
                    <Grid container spacing={2} sx={{ mt: 3 }}>
                        {[
                            { label: 'Rating', value: (student.kuppiRating ?? 0).toFixed(1), icon: StarIcon, color: '#F59E0B' },
                            { label: 'Completed', value: student.completedSessions ?? 0, icon: CheckCircleIcon, color: '#10B981' },
                            { label: 'Total Sessions', value: student.totalSessionsHosted ?? 0, icon: SchoolIcon, color: '#3B82F6' },
                            { label: 'Total Views', value: student.totalViews ?? 0, icon: VisibilityIcon, color: '#8B5CF6' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: stat.color, boxShadow: `0 4px 14px ${alpha(stat.color, 0.12)}` },
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 20, color: stat.color, mb: 0.5 }} />
                                        <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                                        <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </CardContent>
            </MotionCard>

            {/* ══════════════  DETAILS CARD ══════════════ */}
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                elevation={0}
                sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>Tutor Information</Typography>
                    <Grid container spacing={2}>
                        {[
                            { icon: BadgeIcon, label: 'Student ID', value: student.studentId },
                            { icon: EmailIcon, label: 'Email', value: student.email },
                            { icon: SchoolIcon, label: 'Batch', value: student.batch },
                            { icon: AccessTimeIcon, label: 'Availability', value: student.kuppiAvailability || 'Not specified' },
                            { icon: CalendarTodayIcon, label: 'Kuppi Host Since', value: formatDate(student.kuppiApprovedAt) },
                            { icon: DescriptionIcon, label: 'Notes Uploaded', value: student.totalNotesUploaded ?? 0 },
                        ].map(({ icon: Icon, label, value }, idx) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                                            <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{label}</Typography>
                                            <Typography variant="body2" fontWeight={600}>{String(value)}</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Expertise */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                            <EmojiEventsIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom', color: 'warning.main' }} />
                            Expertise
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            {(student.kuppiSubjects ?? []).map((subject, idx) => (
                                <Chip
                                    key={idx}
                                    icon={<CheckCircleIcon sx={{ fontSize: 14, color: `primary.main !important` }} />}
                                    label={subject}
                                    size="small"
                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontWeight: 600, '& .MuiChip-icon': { color: 'primary.main' } }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </CardContent>
            </MotionCard>

            {/* ══════════════  SESSION STATISTICS  ══════════════ */}
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                elevation={0}
                sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                        <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                        Session Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            { label: 'Completed', value: student.completedSessions ?? 0, color: '#6B7280' },
                            { label: 'Scheduled', value: student.scheduledSessions ?? 0, color: '#3B82F6' },
                            { label: 'Live', value: student.liveSessions ?? 0, color: '#10B981' },
                            { label: 'Cancelled', value: student.cancelledSessions ?? 0, color: '#EF4444' },
                        ].map((s, idx) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2, borderRadius: 1, textAlign: 'center',
                                        border: '1px solid', borderColor: 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: s.color, boxShadow: `0 4px 14px ${alpha(s.color, 0.12)}` },
                                    }}
                                >
                                    <Typography variant="h4" fontWeight={700} sx={{ color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </MotionCard>

            {/* ══════════════  UPCOMING SESSIONS  ══════════════ */}
            {student.upcomingSessions && student.upcomingSessions.length > 0 && (
                <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    elevation={0}
                    sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            <EventIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom', color: '#3B82F6' }} />
                            Upcoming Sessions
                        </Typography>
                        <Grid container spacing={2}>
                            {student.upcomingSessions.map((session) => {
                                const sc = STATUS_CONFIG[session.status] || STATUS_CONFIG.SCHEDULED;
                                return (
                                    <Grid size={{ xs: 12, sm: 6 }} key={session.id}>
                                        <Paper
                                            elevation={0}
                                            onClick={() => router.push(`/student/kuppi/${session.id}`)}
                                            sx={{
                                                borderRadius: 1, overflow: 'hidden', cursor: 'pointer',
                                                border: '1px solid', borderColor: 'divider',
                                                transition: 'all 0.25s',
                                                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}` },
                                            }}
                                        >
                                            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${sc.color}, ${alpha(sc.color, 0.3)})` }} />
                                            <Box sx={{ p: 2 }}>
                                                <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} alignItems="center">
                                                    <Chip
                                                        icon={sc.pulse
                                                            ? <FiberManualRecordIcon sx={{ fontSize: 8, color: `${sc.color} !important`, animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                                                            : sc.icon}
                                                        label={session.status.replace('_', ' ')}
                                                        size="small"
                                                        sx={{ bgcolor: alpha(sc.color, 0.1), color: sc.color, fontWeight: 600, fontSize: '0.65rem', '& .MuiChip-icon': { color: 'inherit' } }}
                                                    />
                                                    <Chip label={session.subject} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: 'divider' }} />
                                                </Stack>
                                                <Typography variant="subtitle2" fontWeight={700} noWrap>{session.title}</Typography>
                                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{formatDate(session.scheduledStartTime)}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{formatTime(session.scheduledStartTime)}</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}

            {/* ══════════════  RECENT SESSIONS  ══════════════ */}
            {student.recentSessions && student.recentSessions.length > 0 && (
                <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    elevation={0}
                    sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            <AutoStoriesIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom', color: '#8B5CF6' }} />
                            Recent Sessions
                        </Typography>
                        <Grid container spacing={2}>
                            {student.recentSessions.map((session) => {
                                const sc = STATUS_CONFIG[session.status] || STATUS_CONFIG.SCHEDULED;
                                return (
                                    <Grid size={{ xs: 12, sm: 6 }} key={session.id}>
                                        <Paper
                                            elevation={0}
                                            onClick={() => router.push(`/student/kuppi/${session.id}`)}
                                            sx={{
                                                borderRadius: 1, overflow: 'hidden', cursor: 'pointer',
                                                border: '1px solid', borderColor: 'divider',
                                                transition: 'all 0.25s',
                                                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}` },
                                            }}
                                        >
                                            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${sc.color}, ${alpha(sc.color, 0.3)})` }} />
                                            <Box sx={{ p: 2 }}>
                                                <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} alignItems="center">
                                                    <Chip
                                                        icon={sc.icon}
                                                        label={session.status.replace('_', ' ')}
                                                        size="small"
                                                        sx={{ bgcolor: alpha(sc.color, 0.1), color: sc.color, fontWeight: 600, fontSize: '0.65rem', '& .MuiChip-icon': { color: 'inherit' } }}
                                                    />
                                                    <Chip label={session.subject} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: 'divider' }} />
                                                </Stack>
                                                <Typography variant="subtitle2" fontWeight={700} noWrap>{session.title}</Typography>
                                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <VisibilityIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{session.viewCount} views</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{formatDate(session.scheduledStartTime)}</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}

            {/* ── No Sessions ── */}
            {(!student.recentSessions || student.recentSessions.length === 0) &&
                (!student.upcomingSessions || (Array.isArray(student.upcomingSessions) && student.upcomingSessions.length === 0)) && (
                    <Paper elevation={0} sx={{ p: 6, borderRadius: 1, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                            <AutoStoriesIcon sx={{ fontSize: 30, color: alpha(theme.palette.primary.main, 0.4) }} />
                        </Box>
                        <Typography variant="body1" fontWeight={600} gutterBottom>No Sessions Yet</Typography>
                        <Typography variant="body2" color="text.secondary">This tutor hasn't hosted any sessions yet.</Typography>
                    </Paper>
                )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


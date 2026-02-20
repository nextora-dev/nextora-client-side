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

// Status colors
const STATUS_COLORS: Record<SessionStatus, string> = {
    SCHEDULED: '#3B82F6',
    IN_PROGRESS: '#10B981',
    COMPLETED: '#6B7280',
    CANCELLED: '#EF4444',
};

// Get status icon
const getStatusIcon = (status: SessionStatus): React.ReactElement | undefined => {
    switch (status) {
        case 'SCHEDULED': return <EventIcon sx={{ fontSize: 14 }} />;
        case 'IN_PROGRESS': return <VideoCallIcon sx={{ fontSize: 14 }} />;
        case 'COMPLETED': return <CheckCircleIcon sx={{ fontSize: 14 }} />;
        case 'CANCELLED': return <CancelIcon sx={{ fontSize: 14 }} />;
        default: return undefined;
    }
};

// Experience level colors
const EXPERIENCE_COLORS = {
    BEGINNER: '#10B981',
    INTERMEDIATE: '#3B82F6',
    ADVANCED: '#8B5CF6',
};

// Get initials from name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Format date
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

// Format time
const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function TutorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const studentId = Number(params.id);

    // Redux state
    const student = useAppSelector(selectSelectedKuppiStudent);
    const isLoading = useAppSelector(selectKuppiStudentDetailLoading);
    const error = useAppSelector(selectKuppiError);

    // Local state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'error' });

    // Fetch student details on mount
    useEffect(() => {
        if (studentId) {
            dispatch(fetchKuppiStudentById(studentId));
        }

        return () => {
            dispatch(clearSelectedKuppiStudent());
        };
    }, [dispatch, studentId]);

    // Handle error messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
    }, [error, dispatch]);

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi/tutors')}
                    sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}
                >
                    Back to Tutors
                </Button>

                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                            <Skeleton variant="circular" width={100} height={100} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="50%" height={40} />
                                <Skeleton variant="text" width="30%" />
                            </Box>
                        </Stack>
                        <Divider sx={{ my: 3 }} />
                        <Grid container spacing={3}>
                            {[...Array(4)].map((_, i) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={i}>
                                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Not found state
    if (!student && !isLoading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>Tutor not found</Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi/tutors')}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Back to Tutors
                </Button>
            </Box>
        );
    }

    if (!student) return null;

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ maxWidth: 1000, mx: 'auto' }}
        >
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi/tutors')}
                sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}
            >
                Back to Tutors
            </Button>

            {/* Main Profile Card */}
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                elevation={0}
                sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 3 }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                        <Avatar
                            src={student.profilePictureUrl || undefined}
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: 'primary.main',
                                fontWeight: 700,
                                fontSize: '2rem',
                            }}
                        >
                            {getInitials(student.fullName)}
                        </Avatar>
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                                {student.fullName}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body1" color="text.secondary">{student.program}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                <Chip
                                    label={student.kuppiExperienceLevel}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(EXPERIENCE_COLORS[student.kuppiExperienceLevel] || '#6B7280', 0.1),
                                        color: EXPERIENCE_COLORS[student.kuppiExperienceLevel] || '#6B7280',
                                        fontWeight: 500,
                                        textTransform: 'capitalize',
                                    }}
                                />
                                <Chip
                                    label={student.faculty}
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    {/* Stats Grid */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                    <StarIcon sx={{ color: 'warning.main' }} />
                                    <Typography variant="h5" fontWeight={700}>{(student.kuppiRating ?? 0).toFixed(1)}</Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">Rating</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700}>{student.completedSessions ?? 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Completed</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700}>{student.totalSessionsHosted ?? 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700}>{student.totalViews ?? 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Total Views</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Details */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        <BadgeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        Student ID
                                    </Typography>
                                    <Typography variant="body1">{student.studentId}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        <EmailIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        Email
                                    </Typography>
                                    <Typography variant="body1">{student.email}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        <SchoolIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        Batch
                                    </Typography>
                                    <Typography variant="body1">{student.batch}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        Availability
                                    </Typography>
                                    <Typography variant="body1">{student.kuppiAvailability || 'Not specified'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        Kuppi Host Since
                                    </Typography>
                                    <Typography variant="body1">{formatDate(student.kuppiApprovedAt)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        <DescriptionIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        Notes Uploaded
                                    </Typography>
                                    <Typography variant="body1">{student.totalNotesUploaded ?? 0}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Subjects */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                            <EmojiEventsIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            Expertise
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {(student.kuppiSubjects ?? []).map((subject, idx) => (
                                <Chip
                                    key={idx}
                                    label={subject}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        fontWeight: 500,
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </CardContent>
            </MotionCard>

            {/* Sessions Stats Card */}
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                elevation={0}
                sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 3 }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Session Statistics</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(STATUS_COLORS.COMPLETED, 0.1), textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700} color={STATUS_COLORS.COMPLETED}>{student.completedSessions ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Completed</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(STATUS_COLORS.SCHEDULED, 0.1), textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700} color={STATUS_COLORS.SCHEDULED}>{student.scheduledSessions ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Scheduled</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(STATUS_COLORS.IN_PROGRESS, 0.1), textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700} color={STATUS_COLORS.IN_PROGRESS}>{student.liveSessions ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Live</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(STATUS_COLORS.CANCELLED, 0.1), textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700} color={STATUS_COLORS.CANCELLED}>{student.cancelledSessions ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Cancelled</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </MotionCard>

            {/* Upcoming Sessions */}
            {student.upcomingSessions && student.upcomingSessions.length > 0 && (
                <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    elevation={0}
                    sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 3 }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            <EventIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            Upcoming Sessions
                        </Typography>
                        <Grid container spacing={2}>
                            {student.upcomingSessions.map((session) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={session.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }}
                                        onClick={() => router.push(`/student/kuppi/${session.id}`)}
                                    >
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                                            <Chip
                                                icon={getStatusIcon(session.status)}
                                                label={session.status.replace('_', ' ')}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(STATUS_COLORS[session.status] || '#6B7280', 0.1),
                                                    color: STATUS_COLORS[session.status] || '#6B7280',
                                                    '& .MuiChip-icon': { color: 'inherit' },
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                            <Chip label={session.subject} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                        </Stack>
                                        <Typography variant="subtitle2" fontWeight={600} noWrap>{session.title}</Typography>
                                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                                {formatDate(session.scheduledStartTime)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                                {formatTime(session.scheduledStartTime)}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}

            {/* Recent Sessions */}
            {student.recentSessions && student.recentSessions.length > 0 && (
                <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    elevation={0}
                    sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            <AutoStoriesIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            Recent Sessions
                        </Typography>
                        <Grid container spacing={2}>
                            {student.recentSessions.map((session) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={session.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }}
                                        onClick={() => router.push(`/student/kuppi/${session.id}`)}
                                    >
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                                            <Chip
                                                icon={getStatusIcon(session.status)}
                                                label={session.status.replace('_', ' ')}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(STATUS_COLORS[session.status] || '#6B7280', 0.1),
                                                    color: STATUS_COLORS[session.status] || '#6B7280',
                                                    '& .MuiChip-icon': { color: 'inherit' },
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                            <Chip label={session.subject} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                        </Stack>
                                        <Typography variant="subtitle2" fontWeight={600} noWrap>{session.title}</Typography>
                                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                <VisibilityIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                                {session.viewCount} views
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                                {formatDate(session.scheduledStartTime)}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}

            {/* No Sessions Message */}
            {(!student.recentSessions || student.recentSessions.length === 0) &&
             (!student.upcomingSessions || (Array.isArray(student.upcomingSessions) && student.upcomingSessions.length === 0)) && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        textAlign: 'center',
                    }}
                >
                    <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">No sessions available</Typography>
                </Paper>
            )}

            {/* Snackbar */}
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
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MotionBox>
    );
}


'use client';

/**
 * @fileoverview Student Dashboard Page
 * @description Modern SaaS-style dashboard for student users
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Card, CardContent, Grid, Stack, Paper, Chip, Divider, IconButton, Avatar, LinearProgress, Button, alpha, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WorkIcon from '@mui/icons-material/Work';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import StarIcon from '@mui/icons-material/Star';
import { useAuth, useDashboard } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchUpcomingSessions,
    checkIsKuppiStudentAsync,
    fetchMyAnalytics,
    selectKuppiSessions,
    selectKuppiIsKuppiStudent,
    selectKuppiMyAnalytics,
    selectKuppiIsLoading,
    selectKuppiTotalSessions,
} from '@/features/kuppi';

// ============================================================================
// Animation Configuration
// ============================================================================

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

// ============================================================================
// Stats Configuration
// ============================================================================

const STUDENT_STATS = [
    { icon: SchoolIcon, title: 'Current GPA', value: '3.72', color: '#3B82F6', trend: { value: 5, isPositive: true } },
    { icon: AssignmentIcon, title: 'Pending Tasks', value: '8', color: '#F59E0B', trend: { value: 2, isPositive: false } },
    { icon: EmojiEventsIcon, title: 'Achievements', value: '12', color: '#10B981', subtitle: 'badges earned' },
    { icon: GroupsIcon, title: 'Attendance', value: '94%', color: '#8B5CF6', trend: { value: 3, isPositive: true } },
];

// ============================================================================
// Quick Actions Configuration
// ============================================================================

const QUICK_ACTIONS = [
    { id: 'events', icon: ConfirmationNumberIcon, label: 'Events', description: 'Browse & book tickets', count: 5, path: '/student/events', color: '#3B82F6' },
    { id: 'lostandfound', icon: SearchIcon, label: 'Lost & Found', description: 'Report or find items', count: 12, path: '/student/lost-found', color: '#8B5CF6' },
    { id: 'voting', icon: HowToVoteIcon, label: 'Elections', description: 'Vote in active polls', count: 2, path: '/student/voting', color: '#0EA5E9' },
    { id: 'boarding', icon: ApartmentIcon, label: 'Housing', description: 'Find accommodation', count: 23, path: '/student/boarding', color: '#10B981' },
    { id: 'internships', icon: WorkIcon, label: 'Internships', description: 'Career opportunities', count: 8, path: '/student/internships', color: '#F59E0B' },
    { id: 'kuppi', icon: AutoStoriesIcon, label: 'Kuppi Sessions', description: 'Study together', count: 15, path: '/student/kuppi', color: '#EC4899' },
    { id: 'calendar', icon: CalendarMonthIcon, label: 'Calendar', description: 'Academic schedule', path: '/student/calendar', color: '#6366F1' },
    { id: 'map', icon: MapIcon, label: 'Campus Map', description: 'Navigate campus', path: '/student/maps', color: '#14B8A6' },
];

// ============================================================================
// Upcoming Events Data
// ============================================================================

const UPCOMING_EVENTS = [
    { id: 1, title: 'Tech Talk: AI in Education', date: 'Feb 12, 2026', time: '2:00 PM', location: 'Auditorium A', type: 'Academic' },
    { id: 2, title: 'Career Fair 2026', date: 'Feb 15, 2026', time: '9:00 AM', location: 'Main Hall', type: 'Career' },
    { id: 3, title: 'Sports Week Opening', date: 'Feb 18, 2026', time: '10:00 AM', location: 'Stadium', type: 'Sports' },
];

// ============================================================================
// Recent Activity Data
// ============================================================================

const RECENT_ACTIVITY = [
    { action: 'Assignment submitted', subject: 'Data Structures - Lab 5', time: '2 hours ago', type: 'success' },
    { action: 'Kuppi session booked', subject: 'Database Management', time: '5 hours ago', type: 'info' },
    { action: 'Event registered', subject: 'Tech Talk: AI in Education', time: '1 day ago', type: 'primary' },
    { action: 'GPA updated', subject: 'Semester 4 Results', time: '2 days ago', type: 'success' },
];

// ============================================================================
// Component
// ============================================================================

export default function StudentDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    // Kuppi state from Redux
    const upcomingSessions = useAppSelector(selectKuppiSessions);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const myAnalytics = useAppSelector(selectKuppiMyAnalytics);
    const kuppiLoading = useAppSelector(selectKuppiIsLoading);
    const totalSessions = useAppSelector(selectKuppiTotalSessions);

    // Fetch Kuppi data on mount
    useEffect(() => {
        dispatch(checkIsKuppiStudentAsync());
        dispatch(fetchUpcomingSessions({ page: 0, size: 3 }));
        // If Kuppi student, fetch analytics
    }, [dispatch]);

    useEffect(() => {
        if (isKuppiStudent) {
            dispatch(fetchMyAnalytics());
        }
    }, [dispatch, isKuppiStudent]);

    // Kuppi quick actions for students
    const getKuppiActions = () => {
        if (isKuppiStudent) {
            return [
                { icon: VideoCallIcon, label: 'My Sessions', count: myAnalytics?.totalSessions ?? 0, path: '/student/kuppi', color: '#3B82F6', description: 'Your sessions' },
                { icon: AddIcon, label: 'Create Session', count: null, path: '/student/kuppi/create', color: '#10B981', description: 'Host a session' },
                { icon: CloudUploadIcon, label: 'Upload Notes', count: myAnalytics?.totalNotes ?? 0, path: '/student/kuppi/notes', color: '#8B5CF6', description: 'Share materials' },
                { icon: VisibilityIcon, label: 'Total Views', count: myAnalytics?.totalSessionViews ?? 0, path: '/student/kuppi', color: '#F59E0B', description: 'Session views' },
            ];
        }
        return [
            { icon: AutoStoriesIcon, label: 'Browse Sessions', count: totalSessions, path: '/student/kuppi', color: '#3B82F6', description: 'Find sessions' },
            { icon: DescriptionIcon, label: 'Study Notes', count: null, path: '/student/kuppi/notes', color: '#10B981', description: 'Download notes' },
            { icon: StarIcon, label: 'Become Host', count: null, path: '/student/kuppi/hosts', color: '#EC4899', description: 'Apply to host' },
            { icon: SearchIcon, label: 'Search', count: null, path: '/student/kuppi', color: '#F59E0B', description: 'Find by subject' },
        ];
    };

    const kuppiActions = getKuppiActions();

    const handleNavigation = (path: string) => router.push(path);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            {/* Header Section */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
                            {getGreeting()}, {user?.firstName || 'Student'}!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Here&apos;s what&apos;s happening with your university life today
                        </Typography>
                    </Box>
                </Stack>
            </MotionBox>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {STUDENT_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Grid size={{ xs: 6, md: 3 }} key={stat.title}>
                            <MotionCard variants={itemVariants} whileHover={{ y: -4 }} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ width: 56, height: 56, borderRadius: 1, bgcolor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: stat.color, fontSize: 28 }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>{stat.value}</Typography>
                                            <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                                            {stat.trend && (
                                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                                                    {stat.trend.isPositive ? (
                                                        <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                                    ) : (
                                                        <TrendingDownIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                                    )}
                                                    <Typography variant="caption" sx={{ color: stat.trend.isPositive ? 'success.main' : 'warning.main' }}>
                                                        {stat.trend.value}%
                                                    </Typography>
                                                </Stack>
                                            )}
                                            {stat.subtitle && (
                                                <Typography variant="caption" color="text.secondary">{stat.subtitle}</Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Quick Actions */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>Quick Access</Typography>
                <Grid container spacing={2}>
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={action.id}>
                                <MotionCard
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleNavigation(action.path)}
                                    sx={{
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: action.color,
                                            boxShadow: `0 8px 24px -8px ${action.color}30`,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon sx={{ color: action.color, fontSize: 24 }} />
                                            </Box>
                                            <Box>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'text.primary' }}>{action.label}</Typography>
                                                    {action.count && (
                                                        <Chip label={action.count} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: `${action.color}20`, color: action.color }} />
                                                    )}
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary">{action.description}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* Kuppi Section */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoStoriesIcon sx={{ color: '#EC4899' }} />
                        <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                            {isKuppiStudent ? 'Your Kuppi Dashboard' : 'Kuppi Sessions'}
                        </Typography>
                        {isKuppiStudent && (
                            <Chip label="Kuppi Host" size="small" sx={{ bgcolor: alpha('#EC4899', 0.1), color: '#EC4899' }} />
                        )}
                    </Stack>
                    <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleNavigation('/student/kuppi')}
                        sx={{ textTransform: 'none' }}
                    >
                        {isKuppiStudent ? 'Manage' : 'Browse All'}
                    </Button>
                </Stack>

                <Grid container spacing={2}>
                    {kuppiActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <MotionCard
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleNavigation(action.path)}
                                    sx={{
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: action.color,
                                            boxShadow: `0 8px 24px -8px ${action.color}40`,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(action.color, 0.1),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Icon sx={{ color: action.color, fontSize: 22 }} />
                                                </Box>
                                                {action.count !== null && (
                                                    kuppiLoading ? (
                                                        <CircularProgress size={18} />
                                                    ) : (
                                                        <Typography variant="h6" fontWeight={700} sx={{ color: action.color }}>
                                                            {action.count}
                                                        </Typography>
                                                    )
                                                )}
                                            </Stack>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'text.primary' }}>{action.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">{action.description}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Upcoming Sessions Preview for Normal Students */}
                {!isKuppiStudent && upcomingSessions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Upcoming Sessions</Typography>
                        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                            {upcomingSessions.slice(0, 3).map((session) => (
                                <Paper
                                    key={session.id}
                                    variant="outlined"
                                    onClick={() => handleNavigation(`/student/kuppi/${session.id}`)}
                                    sx={{
                                        p: 2,
                                        minWidth: 240,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Typography fontWeight={600} sx={{ mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {session.title}
                                    </Typography>
                                    <Chip label={session.subject} size="small" sx={{ mb: 1 }} />
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(session.scheduledStartTime).toLocaleDateString()}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}
            </MotionBox>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Upcoming Events */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 1, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <EventIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" fontWeight={600}>Upcoming Events</Typography>
                                </Stack>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => handleNavigation('/student/events')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    View All
                                </Button>
                            </Stack>
                            <Stack spacing={2}>
                                {UPCOMING_EVENTS.map((event, index) => (
                                    <Paper key={event.id} variant="outlined" sx={{ p: 2, borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }} onClick={() => handleNavigation(`/student/events/${event.id}`)}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography fontWeight={500} sx={{ color: 'text.primary' }}>{event.title}</Typography>
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">{event.date} • {event.time}</Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary">{event.location}</Typography>
                                            </Box>
                                            <Chip label={event.type} size="small" color={event.type === 'Academic' ? 'primary' : event.type === 'Career' ? 'secondary' : 'default'} />
                                        </Stack>
                                        {index < UPCOMING_EVENTS.length - 1 && <Divider sx={{ mt: 2, display: 'none' }} />}
                                    </Paper>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                {/* Recent Activity */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 1, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <AccessTimeIcon sx={{ color: 'secondary.main' }} />
                                    <Typography variant="h6" fontWeight={600}>Recent Activity</Typography>
                                </Stack>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => handleNavigation('/student/activity')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    View All
                                </Button>
                            </Stack>
                            <Stack spacing={2}>
                                {RECENT_ACTIVITY.map((activity, index) => (
                                    <Box key={index}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography fontWeight={500} sx={{ color: 'text.primary' }}>{activity.action}</Typography>
                                                <Typography variant="body2" color="text.secondary">{activity.subject}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                                        </Stack>
                                        {index < RECENT_ACTIVITY.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                {/* Academic Progress */}
                <Grid size={{ xs: 12 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <SchoolIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight={600}>Academic Progress</Typography>
                            </Stack>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Semester Progress</Typography>
                                        <Box sx={{ mb: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={500}>Week 8 of 16</Typography>
                                                <Typography variant="body2" color="primary.main">50%</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={50} sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 } }} />
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Assignments Completed</Typography>
                                        <Box sx={{ mb: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={500}>12 of 20</Typography>
                                                <Typography variant="body2" color="success.main">60%</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 4 } }} />
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Credits Earned</Typography>
                                        <Box sx={{ mb: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={500}>96 of 120</Typography>
                                                <Typography variant="body2" color="secondary.main">80%</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={80} sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main', borderRadius: 4 } }} />
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>
        </MotionBox>
    );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Card, CardContent, Grid, Stack, Paper, Chip, Button, alpha, IconButton, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    adminFetchApplicationStats,
    adminFetchPlatformStats,
    selectKuppiApplicationStats,
    selectKuppiPlatformStats,
    selectKuppiIsLoading,
} from '@/features/kuppi';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const ADMIN_STATS = [
    { icon: PeopleIcon, title: 'Total Users', count: '2,547', trend: '+12%', color: '#2563EB' },
    { icon: SchoolIcon, title: 'Active Courses', count: '156', trend: '+8%', color: '#7C3AED' },
    { icon: EventIcon, title: 'Upcoming Events', count: '23', trend: '+5%', color: '#059669' },
    { icon: AssessmentIcon, title: 'Reports', count: '89', trend: '+15%', color: '#DC2626' },
];

const RECENT_ACTIVITIES = [
    { action: 'New user registered', user: 'John Doe', time: '5 minutes ago' },
    { action: 'Course updated', user: 'Dr. Smith', time: '1 hour ago' },
    { action: 'Event created', user: 'Admin Team', time: '2 hours ago' },
    { action: 'Report generated', user: 'System', time: '3 hours ago' },
];

const PENDING_APPROVALS = [
    { title: 'Event: Tech Summit 2026', type: 'Event' },
    { title: 'Course: Advanced AI', type: 'Course' },
    { title: 'User: Faculty Request', type: 'User' },
];


export default function AdminDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Kuppi stats from Redux
    const applicationStats = useAppSelector(selectKuppiApplicationStats);
    const platformStats = useAppSelector(selectKuppiPlatformStats);
    const kuppiLoading = useAppSelector(selectKuppiIsLoading);

    // Fetch Kuppi stats on mount
    useEffect(() => {
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
    }, [dispatch]);

    // Kuppi quick actions
    const kuppiActions = [
        {
            icon: PendingIcon,
            title: 'Pending Applications',
            count: applicationStats?.pendingApplications ?? 0,
            color: '#F59E0B',
            action: () => router.push('/admin/kuppi'),
            description: 'Review applications',
        },
        {
            icon: CheckCircleIcon,
            title: 'Kuppi Hosts',
            count: applicationStats?.totalKuppiStudents ?? platformStats?.totalKuppiStudents ?? 0,
            color: '#10B981',
            action: () => router.push('/admin/kuppi'),
            description: 'Active hosts',
        },
        {
            icon: EventIcon,
            title: 'Total Sessions',
            count: platformStats?.totalSessions ?? 0,
            color: '#3B82F6',
            action: () => router.push('/admin/kuppi'),
            description: 'All sessions',
        },
        {
            icon: DescriptionIcon,
            title: 'Study Notes',
            count: platformStats?.totalNotes ?? 0,
            color: '#8B5CF6',
            action: () => router.push('/admin/kuppi'),
            description: 'Uploaded notes',
        },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
                <Typography variant="body1" color="text.secondary">Welcome back, {user?.firstName || 'Admin'}!</Typography>
            </MotionBox>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {ADMIN_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Grid size={{ xs: 6, md: 3 }} key={stat.title}>
                            <MotionCard variants={itemVariants} whileHover={{ y: -4 }} sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{stat.title}</Typography>
                                            <Typography variant="h4" fontWeight={700}>{stat.count}</Typography>
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                                                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                <Typography variant="caption" color="success.main">{stat.trend}</Typography>
                                            </Stack>
                                        </Box>
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: stat.color }} />
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Recent Activity</Typography>
                            <Stack spacing={2}>
                                {RECENT_ACTIVITIES.map((activity, index) => (
                                    <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography fontWeight={500}>{activity.action}</Typography>
                                                <Typography variant="body2" color="text.secondary">by {activity.user}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Pending Approvals</Typography>
                            <Stack spacing={2}>
                                {PENDING_APPROVALS.map((item, index) => (
                                    <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography fontWeight={500}>{item.title}</Typography>
                                                <Chip label={item.type} size="small" sx={{ mt: 1 }} />
                                            </Box>
                                            <Stack direction="row" spacing={1}>
                                                <Button size="small" variant="contained" color="success">Approve</Button>
                                                <Button size="small" variant="outlined" color="error">Reject</Button>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>

            {/* Kuppi Management Section */}
            <MotionBox variants={itemVariants} sx={{ mt: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoStoriesIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>Kuppi Management</Typography>
                    </Stack>
                    <Button
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => router.push('/admin/kuppi')}
                        sx={{ textTransform: 'none' }}
                    >
                        Manage Kuppi
                    </Button>
                </Stack>

                <Grid container spacing={2}>
                    {kuppiActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <MotionCard
                                    variants={itemVariants}
                                    whileHover={{ y: -4 }}
                                    onClick={action.action}
                                    sx={{
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            borderColor: action.color,
                                            boxShadow: `0 8px 24px -8px ${action.color}40`,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(action.color, 0.1),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Icon sx={{ color: action.color, fontSize: 24 }} />
                                                </Box>
                                                {kuppiLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <Typography variant="h5" fontWeight={700} sx={{ color: action.color }}>
                                                        {action.count}
                                                    </Typography>
                                                )}
                                            </Stack>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>{action.title}</Typography>
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
        </MotionBox>
    );
}


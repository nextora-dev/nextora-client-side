'use client';

import { Box, Grid, Typography, Card, CardContent, Stack, Chip, LinearProgress, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorageIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import MessageIcon from '@mui/icons-material/Message';
import ApartmentIcon from '@mui/icons-material/Apartment';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PendingIcon from '@mui/icons-material/Pending';
import { WelcomeBanner, StatsCard, QuickAccessGrid } from '@/components/widgets';
import { useAuthStore } from '@/store/auth.store';
import type { QuickAction, StatItem } from '@/features/dashboard';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const QUICK_ACTIONS: QuickAction[] = [
    { id: 'tasks', icon: <AssessmentIcon sx={{ fontSize: 26 }} />, label: 'My Tasks', description: 'View assigned tasks', count: 8, path: '/non-academic/tasks', color: '#2563EB' },
    { id: 'inventory', icon: <StorageIcon sx={{ fontSize: 26 }} />, label: 'Inventory', description: 'Manage supplies', count: 15, path: '/non-academic/inventory', color: '#7C3AED' },
    { id: 'maintenance', icon: <BuildIcon sx={{ fontSize: 26 }} />, label: 'Maintenance', description: 'Repair requests', count: 5, path: '/non-academic/maintenance', color: '#DC2626' },
    { id: 'requests', icon: <MessageIcon sx={{ fontSize: 26 }} />, label: 'Service Requests', description: 'Pending requests', count: 12, path: '/non-academic/requests', color: '#F59E0B' },
    { id: 'facilities', icon: <ApartmentIcon sx={{ fontSize: 26 }} />, label: 'Facilities', description: 'Room bookings', path: '/non-academic/facilities', color: '#059669' },
    { id: 'events', icon: <EventIcon sx={{ fontSize: 26 }} />, label: 'Events Support', description: 'Upcoming events', count: 3, path: '/non-academic/events', color: '#EC4899' },
    { id: 'calendar', icon: <CalendarMonthIcon sx={{ fontSize: 26 }} />, label: 'Work Schedule', description: 'Your schedule', path: '/non-academic/calendar', color: '#6366F1' },
    { id: 'map', icon: <MapIcon sx={{ fontSize: 26 }} />, label: 'Campus Map', description: 'Navigate campus', path: '/non-academic/maps', color: '#14B8A6' },
];

const STATS_CONFIG: StatItem[] = [
    { id: 'tasks', title: 'Active Tasks', value: '8', icon: <AssessmentIcon sx={{ fontSize: 24 }} />, color: '#2563EB', trend: { value: 3, label: 'due today', isPositive: false } },
    { id: 'requests', title: 'Open Requests', value: '12', icon: <MessageIcon sx={{ fontSize: 24 }} />, color: '#F59E0B', trend: { value: 5, label: 'new today', isPositive: false } },
    { id: 'maintenance', title: 'Maintenance Jobs', value: '5', icon: <BuildIcon sx={{ fontSize: 24 }} />, color: '#DC2626', subtitle: 'in progress' },
    { id: 'completed', title: 'Completed Today', value: '7', icon: <CheckCircleIcon sx={{ fontSize: 24 }} />, color: '#059669', trend: { value: 15, label: 'above target', isPositive: true } },
];

const ACTIVE_TASKS = [
    { id: 1, title: 'Clean Lecture Hall A', location: 'Building 1', priority: 'High', status: 'In Progress', progress: 60 },
    { id: 2, title: 'Replace AC Filters', location: 'Admin Block', priority: 'Medium', status: 'Pending', progress: 0 },
    { id: 3, title: 'Setup Event Hall', location: 'Main Hall', priority: 'High', status: 'In Progress', progress: 35 },
];

const SERVICE_REQUESTS = [
    { id: 1, request: 'Projector not working', from: 'Dr. Smith', location: 'Room 205', time: '2 hours ago', urgent: true },
    { id: 2, request: 'Water cooler maintenance', from: 'Admin Office', location: 'Block B', time: '4 hours ago', urgent: false },
];

const getPriorityColor = (p: string): 'error' | 'warning' | 'default' => {
    if (p === 'High') return 'error';
    if (p === 'Medium') return 'warning';
    return 'default';
};

export default function NonAcademicDashboard() {
    const router = useRouter();
    const { user } = useAuthStore();
    const handleNavigation = (path: string) => router.push(path);

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <WelcomeBanner
                    userName={user?.firstName || 'Staff'}
                    subtitle="Here's your work overview for today"
                    isLoading={false}
                />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {STATS_CONFIG.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                            <StatsCard {...stat} index={index} isLoading={false} />
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mb: 4 }}>
                <QuickAccessGrid actions={QUICK_ACTIONS} onActionClick={handleNavigation} isLoading={false} />
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600}>Active Tasks</Typography>
                                <Button size="small" onClick={() => handleNavigation('/non-academic/tasks')}>View All</Button>
                            </Stack>
                            <Stack spacing={2}>
                                {ACTIVE_TASKS.map((task) => (
                                    <Card key={task.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography fontWeight={500}>{task.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{task.location}</Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={1}>
                                                        <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                                                        <Chip
                                                            icon={task.status === 'In Progress' ? <PendingIcon sx={{ fontSize: 16 }} /> : undefined}
                                                            label={task.status}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                </Stack>
                                                {task.progress > 0 && (
                                                    <Box>
                                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                            <Typography variant="caption" color="text.secondary">Progress</Typography>
                                                            <Typography variant="caption" fontWeight={600}>{task.progress}%</Typography>
                                                        </Stack>
                                                        <LinearProgress variant="determinate" value={task.progress} sx={{ borderRadius: 1 }} />
                                                    </Box>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600}>Service Requests</Typography>
                                <Button size="small" onClick={() => handleNavigation('/non-academic/requests')}>View All</Button>
                            </Stack>
                            <Stack spacing={2}>
                                {SERVICE_REQUESTS.map((req) => (
                                    <Card
                                        key={req.id}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            borderLeft: req.urgent ? '4px solid' : undefined,
                                            borderLeftColor: req.urgent ? 'error.main' : undefined,
                                        }}
                                    >
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            bgcolor: req.urgent ? 'error.lighter' : 'grey.100',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {req.urgent ? (
                                                            <WarningIcon color="error" sx={{ fontSize: 20 }} />
                                                        ) : (
                                                            <MessageIcon color="action" sx={{ fontSize: 20 }} />
                                                        )}
                                                    </Box>
                                                    <Box>
                                                        <Typography fontWeight={500}>{req.request}</Typography>
                                                        <Typography variant="body2" color="text.secondary">From: {req.from}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{req.location} • {req.time}</Typography>
                                                    </Box>
                                                </Stack>
                                                {req.urgent && <Chip label="Urgent" size="small" color="error" />}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>
        </MotionBox>
    );
}


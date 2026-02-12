'use client';

import { Box, Grid, Typography, Card, CardContent, Stack, Chip, LinearProgress, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { WelcomeBanner, StatsCard, QuickAccessGrid } from '@/components/widgets';
import { useAppSelector } from '@/store';
import { selectUser } from '@/features/auth/authSlice';
import type { QuickAction, StatItem } from '@/features/dashboard';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const QUICK_ACTIONS: QuickAction[] = [
    { id: 'courses', icon: <SchoolIcon sx={{ fontSize: 26 }} />, label: 'My Courses', description: 'Manage your courses', count: 4, path: '/academic/courses', color: '#2563EB' },
    { id: 'students', icon: <PeopleIcon sx={{ fontSize: 26 }} />, label: 'My Students', description: 'View enrolled students', count: 156, path: '/academic/students', color: '#7C3AED' },
    { id: 'grades', icon: <AssessmentIcon sx={{ fontSize: 26 }} />, label: 'Grades', description: 'Manage assessments', count: 12, path: '/academic/grades', color: '#059669' },
    { id: 'attendance', icon: <EventIcon sx={{ fontSize: 26 }} />, label: 'Attendance', description: 'Track attendance', path: '/academic/attendance', color: '#DC2626' },
    { id: 'kuppi', icon: <AutoStoriesIcon sx={{ fontSize: 26 }} />, label: 'Kuppi Sessions', description: 'Schedule sessions', count: 3, path: '/academic/kuppi', color: '#EC4899' },
    { id: 'meetings', icon: <PersonIcon sx={{ fontSize: 26 }} />, label: 'Student Meetings', description: 'Meeting requests', count: 5, path: '/academic/meetings', color: '#F59E0B' },
    { id: 'calendar', icon: <CalendarMonthIcon sx={{ fontSize: 26 }} />, label: 'Calendar', description: 'Academic schedule', path: '/academic/calendar', color: '#6366F1' },
    { id: 'map', icon: <MapIcon sx={{ fontSize: 26 }} />, label: 'Campus Map', description: 'Navigate campus', path: '/academic/maps', color: '#14B8A6' },
];

const STATS_CONFIG: StatItem[] = [
    { id: 'courses', title: 'Active Courses', value: '4', icon: <SchoolIcon sx={{ fontSize: 24 }} />, color: '#2563EB', subtitle: 'this semester' },
    { id: 'students', title: 'Total Students', value: '156', icon: <PeopleIcon sx={{ fontSize: 24 }} />, color: '#7C3AED', trend: { value: 12, label: 'new this month', isPositive: true } },
    { id: 'pending', title: 'Pending Grades', value: '12', icon: <AssessmentIcon sx={{ fontSize: 24 }} />, color: '#F59E0B', trend: { value: 3, label: 'due this week', isPositive: false } },
    { id: 'meetings', title: 'Today\'s Meetings', value: '3', icon: <PersonIcon sx={{ fontSize: 24 }} />, color: '#059669', subtitle: 'scheduled' },
];

const UPCOMING_CLASSES = [
    { id: 1, name: 'Data Structures', code: 'CS201', time: '09:00 AM', room: 'Room 301', students: 45 },
    { id: 2, name: 'Software Engineering', code: 'CS301', time: '11:00 AM', room: 'Lab 102', students: 38 },
    { id: 3, name: 'Database Systems', code: 'CS202', time: '02:00 PM', room: 'Room 205', students: 42 },
];

const PENDING_TASKS = [
    { id: 1, task: 'Grade CS201 Midterm', course: 'Data Structures', deadline: 'Today', progress: 65 },
    { id: 2, task: 'Review Assignment 3', course: 'Software Engineering', deadline: 'Tomorrow', progress: 30 },
    { id: 3, task: 'Prepare Lab Materials', course: 'Database Systems', deadline: 'Feb 10', progress: 0 },
];

export default function AcademicDashboard() {
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const handleNavigation = (path: string) => router.push(path);

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <WelcomeBanner
                    userName={user?.firstName || 'Lecturer'}
                    subtitle="Here's your academic overview for today"
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
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600}>Today's Classes</Typography>
                                <Button size="small" onClick={() => handleNavigation('/academic/calendar')}>View Schedule</Button>
                            </Stack>
                            <Stack spacing={2}>
                                {UPCOMING_CLASSES.map((cls) => (
                                    <Card key={cls.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <SchoolIcon sx={{ color: 'white' }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography fontWeight={600}>{cls.name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{cls.code} • {cls.room}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack alignItems="flex-end">
                                                    <Chip icon={<AccessTimeIcon sx={{ fontSize: 16 }} />} label={cls.time} size="small" color="primary" variant="outlined" />
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{cls.students} students</Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600}>Pending Tasks</Typography>
                                <Button size="small" onClick={() => handleNavigation('/academic/grades')}>View All</Button>
                            </Stack>
                            <Stack spacing={2}>
                                {PENDING_TASKS.map((task) => (
                                    <Card key={task.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography fontWeight={500}>{task.task}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{task.course}</Typography>
                                                    </Box>
                                                    <Chip label={task.deadline} size="small" color={task.deadline === 'Today' ? 'error' : task.deadline === 'Tomorrow' ? 'warning' : 'default'} />
                                                </Stack>
                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                                                        <Typography variant="caption" fontWeight={600}>{task.progress}%</Typography>
                                                    </Stack>
                                                    <LinearProgress variant="determinate" value={task.progress} sx={{ borderRadius: 1 }} />
                                                </Box>
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


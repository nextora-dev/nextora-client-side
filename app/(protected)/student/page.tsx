'use client';

/**
 * @fileoverview User Dashboard Page
 * @description Main dashboard view for authenticated users
 */

import { useRouter } from 'next/navigation';
import { Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WorkIcon from '@mui/icons-material/Work';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';

import { useAuth, useDashboard } from '@/hooks';
import {
    WelcomeBanner,
    StatsCard,
    QuickAccessGrid,
    EventsWidget,
    NotificationsWidget,
    ActivityFeed,
    ProgressWidget,
    CalendarWidget,
} from '@/components/widgets';
import type { QuickAction, StatItem } from '@/features/dashboard';

// ============================================================================
// Configuration
// ============================================================================

const QUICK_ACTIONS: QuickAction[] = [
    { id: 'events', icon: <ConfirmationNumberIcon sx={{ fontSize: 26 }} />, label: 'Events', description: 'Browse & book tickets', count: 5, path: '/student/events', color: '#60A5FA' },
    { id: 'lostandfound', icon: <SearchIcon sx={{ fontSize: 26 }} />, label: 'Lost & Found', description: 'Report or find items', count: 12, path: '/student/lost-found', color: '#8B5CF6' },
    { id: 'voting', icon: <HowToVoteIcon sx={{ fontSize: 26 }} />, label: 'Elections', description: 'Vote in active polls', count: 2, path: '/student/voting', color: '#0EA5E9' },
    { id: 'boarding', icon: <ApartmentIcon sx={{ fontSize: 26 }} />, label: 'Housing', description: 'Find accommodation', count: 23, path: '/student/boarding', color: '#10B981' },
    { id: 'internships', icon: <WorkIcon sx={{ fontSize: 26 }} />, label: 'Internships', description: 'Career opportunities', count: 8, path: '/student/internships', color: '#F59E0B' },
    { id: 'kuppi', icon: <AutoStoriesIcon sx={{ fontSize: 26 }} />, label: 'Kuppi Sessions', description: 'Study together', count: 15, path: '/student/kuppi', color: '#EC4899' },
    { id: 'calendar', icon: <CalendarMonthIcon sx={{ fontSize: 26 }} />, label: 'Calendar', description: 'Academic schedule', path: '/student/calendar', color: '#6366F1' },
    { id: 'map', icon: <MapIcon sx={{ fontSize: 26 }} />, label: 'Campus Map', description: 'Navigate campus', path: '/student/maps', color: '#14B8A6' },
];

const STATS_CONFIG: StatItem[] = [
    { id: 'gpa', title: 'Current GPA', value: '3.72', icon: <SchoolIcon sx={{ fontSize: 24 }} />, color: '#60A5FA', trend: { value: 5, label: 'vs last semester', isPositive: true } },
    { id: 'assignments', title: 'Pending Tasks', value: '8', icon: <AssignmentIcon sx={{ fontSize: 24 }} />, color: '#F59E0B', trend: { value: 2, label: 'due this week', isPositive: false } },
    { id: 'achievements', title: 'Achievements', value: '12', icon: <EmojiEventsIcon sx={{ fontSize: 24 }} />, color: '#10B981', subtitle: 'badges earned' },
    { id: 'attendance', title: 'Attendance', value: '94%', icon: <GroupsIcon sx={{ fontSize: 24 }} />, color: '#8B5CF6', trend: { value: 3, label: 'above average', isPositive: true } },
];

// ============================================================================
// Animation
// ============================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const MotionBox = motion.create(Box);

// ============================================================================
// Component
// ============================================================================

export default function UserDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        isLoading,
        events,
        notifications,
        activities,
        progress,
        calendarEvents,
        unreadNotificationCount,
        markAllNotificationsAsRead,
    } = useDashboard();

    const handleNavigation = (path: string) => router.push(path);

    return (
        <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="show"
            sx={{ maxWidth: 1600, mx: 'auto' }}
        >
            {/* Welcome Banner */}
            <Box sx={{ mb: 4 }}>
                <WelcomeBanner
                    userName={user?.firstName || 'Student'}
                    subtitle="Here's what's happening with your university life today"
                    isLoading={isLoading}
                    notificationCount={unreadNotificationCount}
                    onNotificationClick={() => handleNavigation('/student/notifications')}
                />
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {STATS_CONFIG.map((stat, index) => (
                    <Grid size={{ xs: 6, sm: 6, md: 3 }} key={stat.id}>
                        <StatsCard
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            trend={stat.trend}
                            subtitle={stat.subtitle}
                            isLoading={isLoading}
                            index={index}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Quick Access */}
            <Box sx={{ mb: 4 }}>
                <QuickAccessGrid
                    actions={QUICK_ACTIONS}
                    onActionClick={handleNavigation}
                    isLoading={isLoading}
                />
            </Box>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <EventsWidget
                                events={events}
                                onViewAll={() => handleNavigation('/student/events')}
                                onEventClick={(id) => handleNavigation(`/student/events/${id}`)}
                                isLoading={isLoading}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <ProgressWidget
                                items={progress}
                                title="Your Progress"
                                subtitle="Keep up the great work!"
                                isLoading={isLoading}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <ActivityFeed
                                activities={activities}
                                onViewAll={() => handleNavigation('/student/activity')}
                                isLoading={isLoading}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right Column */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <NotificationsWidget
                                notifications={notifications}
                                onViewAll={() => handleNavigation('/student/notifications')}
                                onMarkAllRead={markAllNotificationsAsRead}
                                isLoading={isLoading}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <CalendarWidget
                                events={calendarEvents}
                                onDateSelect={(date) => handleNavigation(`/student/calendar?date=${date.toISOString()}`)}
                                isLoading={isLoading}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </MotionBox>
    );
}

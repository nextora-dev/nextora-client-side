'use client';

/**
 * @fileoverview User Profile Page
 * @description View and manage user profile information
 */

import { Box, Typography, Card, CardContent, Grid, Avatar, Stack, Chip, Divider, Button } from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// Mock profile data
const PROFILE_DATA = {
    studentId: 'STU2024001',
    department: 'Faculty of Computing',
    program: 'BSc (Hons) in Software Engineering',
    batch: '2024',
    semester: '4th Semester',
    phone: '+94 77 123 4567',
    address: 'Colombo, Sri Lanka',
    joinedDate: 'January 2024',
    gpa: '3.72',
    credits: '68/120',
    achievements: ['Dean\'s List 2024', 'Hackathon Winner', 'Best Project Award'],
};

export default function UserProfilePage() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    // Get base path for settings (e.g., /student/profile -> /student/profile/settings)
    const settingsPath = `${pathname}/settings`;

    const profileInfo = [
        { icon: BadgeIcon, label: 'Student ID', value: PROFILE_DATA.studentId },
        { icon: EmailIcon, label: 'Email', value: user?.email || 'user@nsbm.ac.lk' },
        { icon: PhoneIcon, label: 'Phone', value: PROFILE_DATA.phone },
        { icon: SchoolIcon, label: 'Program', value: PROFILE_DATA.program },
        { icon: CalendarTodayIcon, label: 'Batch', value: PROFILE_DATA.batch },
        { icon: LocationOnIcon, label: 'Address', value: PROFILE_DATA.address },
    ];

    return (
        <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="show"
            sx={{ maxWidth: 1200, mx: 'auto' }}
        >
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700}>
                        My Profile
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => router.push(settingsPath)}
                        sx={{ borderRadius: 2 }}
                    >
                        Settings
                    </Button>
                </Stack>
            </MotionBox>

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard
                        variants={itemVariants}
                        sx={{ borderRadius: 4, overflow: 'hidden', textAlign: 'center' }}
                    >
                        <Box
                            sx={{
                                height: 120,
                                background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
                            }}
                        />
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                mx: 'auto',
                                mt: -6,
                                border: '4px solid white',
                                bgcolor: 'primary.main',
                                fontSize: '2rem',
                                fontWeight: 700,
                            }}
                        >
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>

                        <CardContent sx={{ pt: 2 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {PROFILE_DATA.program}
                            </Typography>
                            <Chip label={PROFILE_DATA.semester} color="primary" size="small" sx={{ mt: 1 }} />

                            <Divider sx={{ my: 3 }} />

                            <Stack direction="row" justifyContent="space-around">
                                <Box>
                                    <Typography variant="h5" fontWeight={700} color="primary.main">
                                        {PROFILE_DATA.gpa}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">GPA</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight={700} color="primary.main">
                                        {PROFILE_DATA.credits}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Credits</Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                fullWidth
                                sx={{ mt: 3, borderRadius: 2 }}
                                onClick={() => router.push(settingsPath)}
                            >
                                Edit Profile
                            </Button>
                        </CardContent>
                    </MotionCard>
                </Grid>

                {/* Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* Personal Information */}
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                    Personal Information
                                </Typography>
                                <Grid container spacing={3}>
                                    {profileInfo.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            bgcolor: 'primary.50',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Icon sx={{ color: 'primary.main', fontSize: 20 }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.label}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {item.value}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </CardContent>
                        </MotionCard>

                        {/* Achievements */}
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                    Achievements
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {PROFILE_DATA.achievements.map((achievement, index) => (
                                        <Chip
                                            key={index}
                                            label={achievement}
                                            color="success"
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    ))}
                                </Stack>
                            </CardContent>
                        </MotionCard>

                        {/* Academic Info */}
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                    Academic Information
                                </Typography>
                                <Grid container spacing={2}>
                                    {[
                                        { label: 'Faculty', value: 'Computing' },
                                        { label: 'Batch', value: PROFILE_DATA.batch },
                                        { label: 'Status', value: 'Active', color: 'success.main' },
                                        { label: 'Semester', value: '4th' },
                                    ].map((item, index) => (
                                        <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                                                <Typography variant="h6" fontWeight={700} color={item.color || 'primary.main'}>
                                                    {item.value}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </MotionCard>
                    </Stack>
                </Grid>
            </Grid>
        </MotionBox>
    );
}


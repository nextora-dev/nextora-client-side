/**
 * @fileoverview Unified Profile Page Component
 * @description Industry-standard reusable profile page that works for all user roles
 *
 * This component is used by all role-specific profile routes:
 * - /student/profile
 * - /academic/profile
 * - /non-academic/profile
 * - /admin/profile (if needed)
 * - /super-admin/profile (if needed)
 */

'use client';

import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Stack,
    Chip,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedIcon from '@mui/icons-material/Verified';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { RoleProfileSection, RoleBadge } from '@/components/profile';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface UnifiedProfilePageProps {
    /** Base path for navigation (e.g., '/student', '/academic') */
    basePath?: string;
}

export default function UnifiedProfilePage({ basePath }: UnifiedProfilePageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const { profile, isLoading, error, refetch } = useProfile({ forceRefresh: true });

    // Derive paths from current pathname or basePath
    const currentBasePath = basePath || pathname.replace('/profile', '');
    const settingsPath = `${pathname}/settings`;
    const editPath = `${pathname}/edit`;

    // Get student sub-roles if applicable
    const studentSubRoles = profile?.role === 'ROLE_STUDENT' && 'studentRoleTypes' in (profile.roleSpecificData || {})
        ? (profile.roleSpecificData as { studentRoleTypes?: string[] }).studentRoleTypes
        : undefined;

    // Loading state
    if (isLoading && !profile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress size={48} sx={{ color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">Loading profile...</Typography>
            </Box>
        );
    }

    // Error state
    if (error && !profile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={refetch} startIcon={<RefreshIcon />}>Try Again</Button>
            </Box>
        );
    }

    // No profile data state
    if (!profile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 3 }}>
                <Typography variant="h6" color="text.secondary">No profile data available</Typography>
                <Button variant="contained" onClick={refetch} startIcon={<RefreshIcon />}>Load Profile</Button>
            </Box>
        );
    }

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
                {/* Profile Card - Left Sidebar */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <MotionCard
                        variants={itemVariants}
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
                            overflow: 'visible',
                            position: { lg: 'sticky' },
                            top: { lg: 100 },
                        }}
                    >
                        {/* Header Banner */}
                        <Box
                            sx={{
                                height: 120,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                borderRadius: '8px 8px 0 0',
                                position: 'relative',
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => router.push(editPath)}
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    bgcolor: alpha('#fff', 0.2),
                                    color: 'white',
                                    '&:hover': { bgcolor: alpha('#fff', 0.3) },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => router.push(settingsPath)}
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 52,
                                    bgcolor: alpha('#fff', 0.2),
                                    color: 'white',
                                    '&:hover': { bgcolor: alpha('#fff', 0.3) },
                                }}
                            >
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                            {/* Refresh button */}
                            <IconButton
                                size="small"
                                onClick={refetch}
                                disabled={isLoading}
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    bgcolor: alpha('#fff', 0.2),
                                    color: 'white',
                                    '&:hover': { bgcolor: alpha('#fff', 0.3) },
                                }}
                            >
                                <RefreshIcon fontSize="small" sx={{ animation: isLoading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                            </IconButton>
                        </Box>

                        {/* Avatar */}
                        <Avatar
                            src={profile.profilePictureUrl || undefined}
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mt: -8,
                                border: `4px solid ${theme.palette.background.paper}`,
                                bgcolor: theme.palette.primary.main,
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                            }}
                        >
                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </Avatar>

                        <CardContent sx={{ pt: 2, pb: 4, textAlign: 'center' }}>
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Typography variant="h5" fontWeight={700}>
                                    {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                                </Typography>
                                {profile.status === 'ACTIVE' && <VerifiedIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {profile.userType}
                            </Typography>

                            {/* Role Badge */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <RoleBadge role={profile.role} subRoles={studentSubRoles} />
                            </Box>

                            {/* Contact Info */}
                            <Stack spacing={1.5} sx={{ mb: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">{profile.email}</Typography>
                                </Stack>
                                {profile.phoneNumber && (
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                        <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2">{profile.phoneNumber}</Typography>
                                    </Stack>
                                )}
                            </Stack>

                            {/* Status Chip */}
                            <Chip
                                label={profile.status}
                                size="small"
                                sx={{
                                    bgcolor: alpha(profile.status === 'ACTIVE' ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                                    color: profile.status === 'ACTIVE' ? 'success.main' : 'warning.main',
                                    fontWeight: 600,
                                }}
                            />

                            {/* Action Buttons */}
                            <Stack spacing={1.5} sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    fullWidth
                                    onClick={() => router.push(editPath)}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<SettingsIcon />}
                                    fullWidth
                                    onClick={() => router.push(settingsPath)}
                                >
                                    Settings
                                </Button>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>

                {/* Role-Specific Content - Right Side */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <RoleProfileSection profile={profile} />
                </Grid>
            </Grid>
        </MotionBox>
    );
}


'use client';

/**
 * @fileoverview Profile Settings Page
 * @description User profile settings and preferences management
 */

import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Avatar,
    Stack,
    Divider,
    Switch,
    FormControlLabel,
    Alert,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import { useRouter } from 'next/navigation';
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

export default function ProfileSettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '+94 77 123 4567',
        address: 'Colombo, Sri Lanka',
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        events: true,
        announcements: true,
        reminders: true,
    });

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleNotificationChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotifications(prev => ({ ...prev, [field]: e.target.checked }));
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="show"
            sx={{ maxWidth: 1000, mx: 'auto' }}
        >
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={() => router.push('/profile')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight={700}>
                        Profile Settings
                    </Typography>
                </Stack>
            </MotionBox>

            {saved && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    Settings saved successfully!
                </Alert>
            )}

            <Stack spacing={3}>
                {/* Profile Picture */}
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Profile Picture
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        bgcolor: 'primary.main',
                                        fontSize: '2rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </Avatar>
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                    }}
                                    size="small"
                                >
                                    <CameraAltIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="body1" fontWeight={500}>
                                    {user?.firstName} {user?.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    JPG, PNG or GIF. Max size 2MB
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Button size="small" variant="outlined">
                                        Upload
                                    </Button>
                                    <Button size="small" color="error">
                                        Remove
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </MotionCard>

                {/* Personal Information */}
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Personal Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    value={formData.firstName}
                                    onChange={handleInputChange('firstName')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Last Name"
                                    fullWidth
                                    value={formData.lastName}
                                    onChange={handleInputChange('lastName')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    disabled
                                    helperText="Contact admin to change email"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Phone"
                                    fullWidth
                                    value={formData.phone}
                                    onChange={handleInputChange('phone')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Address"
                                    fullWidth
                                    value={formData.address}
                                    onChange={handleInputChange('address')}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </MotionCard>

                {/* Notification Settings */}
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <NotificationsIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Notification Settings
                            </Typography>
                        </Stack>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            Notification Channels
                        </Typography>
                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.email}
                                        onChange={handleNotificationChange('email')}
                                    />
                                }
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.push}
                                        onChange={handleNotificationChange('push')}
                                    />
                                }
                                label="Push Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.sms}
                                        onChange={handleNotificationChange('sms')}
                                    />
                                }
                                label="SMS Notifications"
                            />
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            Notification Types
                        </Typography>
                        <Stack spacing={1}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.events}
                                        onChange={handleNotificationChange('events')}
                                    />
                                }
                                label="Event Updates"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.announcements}
                                        onChange={handleNotificationChange('announcements')}
                                    />
                                }
                                label="University Announcements"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.reminders}
                                        onChange={handleNotificationChange('reminders')}
                                    />
                                }
                                label="Assignment Reminders"
                            />
                        </Stack>
                    </CardContent>
                </MotionCard>

                {/* Security */}
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <SecurityIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Security
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <LockIcon fontSize="small" color="action" />
                                        <Typography fontWeight={500}>Password</Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        Last changed 30 days ago
                                    </Typography>
                                </Box>
                                <Button variant="outlined" size="small">
                                    Change
                                </Button>
                            </Box>

                            <Box
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    <Typography fontWeight={500}>Two-Factor Authentication</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Add an extra layer of security
                                    </Typography>
                                </Box>
                                <Button variant="outlined" size="small" color="success">
                                    Enable
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </MotionCard>

                {/* Save Button */}
                <MotionBox variants={itemVariants}>
                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => router.push('/profile')}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            sx={{ px: 4 }}
                        >
                            Save Changes
                        </Button>
                    </Stack>
                </MotionBox>
            </Stack>
        </MotionBox>
    );
}


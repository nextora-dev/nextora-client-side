'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Switch, TextField, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const SETTINGS_SECTIONS = [
    {
        title: 'Notifications', icon: NotificationsIcon,
        settings: [
            { label: 'Email notifications', description: 'Receive email alerts', enabled: true },
            { label: 'Push notifications', description: 'Get push notifications', enabled: true },
        ]
    },
    {
        title: 'Security', icon: SecurityIcon,
        settings: [
            { label: 'Two-factor authentication', description: 'Extra security layer', enabled: true },
            { label: 'Login alerts', description: 'Get notified of logins', enabled: true },
        ]
    },
];

export default function AdminSettingsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1200, mx: 'auto' }}>
            <PageHeader title="Settings" subtitle="Manage your admin preferences" showBackButton={false} />
            <Stack spacing={3}>
                {SETTINGS_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <MotionCard key={section.title} variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                    <Icon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>{section.title}</Typography>
                                </Stack>
                                <Stack spacing={2} divider={<Divider />}>
                                    {section.settings.map((setting, idx) => (
                                        <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography fontWeight={500}>{setting.label}</Typography>
                                                <Typography variant="body2" color="text.secondary">{setting.description}</Typography>
                                            </Box>
                                            <Switch defaultChecked={setting.enabled} />
                                        </Stack>
                                    ))}
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    );
                })}
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <LanguageIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>General</Typography>
                        </Stack>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Organization Name" defaultValue="University" />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Admin Email" defaultValue="admin@university.edu" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </MotionCard>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined">Cancel</Button>
                    <Button variant="contained">Save Changes</Button>
                </Box>
            </Stack>
        </Box>
    );
}


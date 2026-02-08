'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Switch, TextField, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SuperAdminSettingsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1200, mx: 'auto' }}>
            <PageHeader title="System Settings" subtitle="Configure global system settings" showBackButton={false} />
            <Stack spacing={3}>
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <SettingsIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>General Settings</Typography>
                        </Stack>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="System Name" defaultValue="Nextora University Portal" />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Support Email" defaultValue="support@nextora.edu" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <BackupIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>Backup & Maintenance</Typography>
                        </Stack>
                        <Stack spacing={2} divider={<Divider />}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography fontWeight={500}>Automatic Backups</Typography>
                                    <Typography variant="body2" color="text.secondary">Daily backups at 2:00 AM</Typography>
                                </Box>
                                <Switch defaultChecked />
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography fontWeight={500}>Maintenance Mode</Typography>
                                    <Typography variant="body2" color="text.secondary">Show maintenance page</Typography>
                                </Box>
                                <Switch />
                            </Stack>
                        </Stack>
                    </CardContent>
                </MotionCard>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined">Reset to Defaults</Button>
                    <Button variant="contained">Save All Changes</Button>
                </Box>
            </Stack>
        </Box>
    );
}


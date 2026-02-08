'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Switch, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const SECURITY_STATS = [
    { title: 'Security Score', value: '95%', icon: ShieldIcon, color: '#059669' },
    { title: 'Active Sessions', value: '1,234', icon: VpnKeyIcon, color: '#2563EB' },
    { title: 'Failed Logins', value: '23', icon: LockIcon, color: '#DC2626' },
    { title: 'Threats Blocked', value: '156', icon: SecurityIcon, color: '#7C3AED' },
];

const SECURITY_SETTINGS = [
    { label: 'Two-Factor Authentication', description: 'Require 2FA for admins', enabled: true },
    { label: 'Password Policy', description: 'Strong password requirements', enabled: true },
    { label: 'Session Timeout', description: 'Auto logout after 30 mins', enabled: true },
];

const RECENT_ALERTS = [
    { id: 1, message: 'Multiple failed login attempts', severity: 'high', time: '10 mins ago' },
    { id: 2, message: 'New admin account created', severity: 'medium', time: '2 hours ago' },
];

export default function SuperAdminSecurityPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Security" subtitle="Monitor and manage system security" showBackButton={false} />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {SECURITY_STATS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <Grid size={{ xs: 6, md: 3 }} key={s.title}>
                            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: s.color }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                                            <Typography variant="body2" color="text.secondary">{s.title}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Security Settings</Typography>
                            <Stack spacing={2} divider={<Divider />}>
                                {SECURITY_SETTINGS.map((setting, idx) => (
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
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Recent Alerts</Typography>
                            <Stack spacing={2}>
                                {RECENT_ALERTS.map((alert) => (
                                    <Card key={alert.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ py: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                <WarningAmberIcon sx={{ color: alert.severity === 'high' ? 'error.main' : 'warning.main' }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2">{alert.message}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
                                                </Box>
                                                <Chip label={alert.severity} size="small" color={alert.severity === 'high' ? 'error' : 'warning'} />
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>
        </Box>
    );
}


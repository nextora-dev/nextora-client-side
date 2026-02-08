'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Paper, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '@/hooks/useAuth';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const SYSTEM_STATS = [
    { icon: PeopleIcon, title: 'Total Users', count: '15,847', color: '#2563EB' },
    { icon: AdminPanelSettingsIcon, title: 'Administrators', count: '24', color: '#7C3AED' },
    { icon: StorageIcon, title: 'Storage Used', count: '78%', color: '#059669' },
    { icon: SecurityIcon, title: 'Security Score', count: '95%', color: '#DC2626' },
];

const SYSTEM_HEALTH = [
    { service: 'API Server', status: 'operational', uptime: '99.9%' },
    { service: 'Database', status: 'operational', uptime: '99.8%' },
    { service: 'Auth Service', status: 'operational', uptime: '100%' },
    { service: 'File Storage', status: 'warning', uptime: '98.5%' },
];

const AUDIT_LOGS = [
    { action: 'User role changed', admin: 'System Admin', target: 'john.doe@uni.edu', time: '10 min ago' },
    { action: 'System config updated', admin: 'Super Admin', target: 'Email Settings', time: '1 hour ago' },
    { action: 'New admin created', admin: 'Super Admin', target: 'jane.smith@uni.edu', time: '2 hours ago' },
    { action: 'Backup completed', admin: 'System', target: 'Database', time: '6 hours ago' },
];

export default function SuperAdminDashboardPage() {
    const { user } = useAuth();

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>Super Admin Console</Typography>
                <Typography variant="body1" color="text.secondary">Welcome, {user?.firstName || 'Super Admin'}!</Typography>
            </MotionBox>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {SYSTEM_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Grid size={{ xs: 6, md: 3 }} key={stat.title}>
                            <MotionCard variants={itemVariants} whileHover={{ y: -4 }} sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: stat.color, fontSize: 28 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>{stat.count}</Typography>
                                            <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
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
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <SecurityIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>System Health</Typography>
                            </Stack>
                            <Stack spacing={2}>
                                {SYSTEM_HEALTH.map((item, index) => (
                                    <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {item.status === 'operational' ? <CheckCircleIcon sx={{ color: 'success.main' }} /> : <WarningIcon sx={{ color: 'warning.main' }} />}
                                                <Box>
                                                    <Typography fontWeight={500}>{item.service}</Typography>
                                                    <Typography variant="body2" color="text.secondary">Uptime: {item.uptime}</Typography>
                                                </Box>
                                            </Stack>
                                            <Chip label={item.status} size="small" color={item.status === 'operational' ? 'success' : 'warning'} />
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
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <HistoryIcon color="secondary" />
                                <Typography variant="h6" fontWeight={600}>Recent Audit Logs</Typography>
                            </Stack>
                            <Stack spacing={2}>
                                {AUDIT_LOGS.map((log, index) => (
                                    <Box key={index}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography fontWeight={500}>{log.action}</Typography>
                                                <Typography variant="body2" color="text.secondary">by {log.admin} → {log.target}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">{log.time}</Typography>
                                        </Stack>
                                        {index < AUDIT_LOGS.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>
        </MotionBox>
    );
}


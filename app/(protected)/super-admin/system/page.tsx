'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudIcon from '@mui/icons-material/Cloud';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const SYSTEM_METRICS = [
    { title: 'CPU Usage', value: 45, icon: MemoryIcon, color: '#2563EB' },
    { title: 'Memory', value: 68, icon: StorageIcon, color: '#7C3AED' },
    { title: 'Disk', value: 78, icon: CloudIcon, color: '#059669' },
    { title: 'Network', value: 23, icon: SpeedIcon, color: '#DC2626' },
];

const SERVICES = [
    { name: 'API Server', status: 'operational', uptime: '99.9%' },
    { name: 'Database', status: 'operational', uptime: '99.8%' },
    { name: 'Auth Service', status: 'operational', uptime: '100%' },
    { name: 'File Storage', status: 'degraded', uptime: '98.5%' },
];

export default function SuperAdminSystemPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="System Health" subtitle="Monitor system performance" showBackButton={false} />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {SYSTEM_METRICS.map((m) => {
                    const Icon = m.icon;
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={m.title}>
                            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: m.color }} />
                                        </Box>
                                        <Typography variant="h4" fontWeight={700}>{m.value}%</Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{m.title}</Typography>
                                    <LinearProgress variant="determinate" value={m.value} sx={{ borderRadius: 1 }} />
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>
            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Service Status</Typography>
                    <Grid container spacing={2}>
                        {SERVICES.map((s) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.name}>
                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            {s.status === 'operational' ? <CheckCircleIcon color="success" /> : <WarningIcon color="warning" />}
                                            <Typography fontWeight={600}>{s.name}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Chip label={s.status} size="small" color={s.status === 'operational' ? 'success' : 'warning'} />
                                            <Typography variant="body2" color="text.secondary">{s.uptime}</Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </MotionCard>
        </Box>
    );
}


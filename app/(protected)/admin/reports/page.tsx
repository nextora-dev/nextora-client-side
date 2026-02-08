'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const REPORT_CATEGORIES = [
    { id: 1, title: 'User Analytics', icon: PeopleIcon, count: 12, color: '#2563EB' },
    { id: 2, title: 'Event Reports', icon: EventIcon, count: 8, color: '#7C3AED' },
    { id: 3, title: 'Academic Reports', icon: SchoolIcon, count: 15, color: '#059669' },
    { id: 4, title: 'System Reports', icon: AssessmentIcon, count: 5, color: '#DC2626' },
];

const RECENT_REPORTS = [
    { id: 1, name: 'Monthly User Activity', date: 'Feb 1, 2026', status: 'Ready' },
    { id: 2, name: 'Event Attendance Q1', date: 'Jan 28, 2026', status: 'Ready' },
    { id: 3, name: 'Course Enrollment Stats', date: 'Jan 25, 2026', status: 'Processing' },
];

export default function AdminReportsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Reports" subtitle="Generate and download analytics reports" showBackButton={false} />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {REPORT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat.id}>
                            <MotionCard variants={itemVariants} whileHover={{ y: -4 }} sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: cat.color }} />
                                        </Box>
                                        <Chip label={`${cat.count} reports`} size="small" />
                                    </Stack>
                                    <Typography variant="h6" fontWeight={600}>{cat.title}</Typography>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>
            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Recent Reports</Typography>
                    <Stack spacing={2}>
                        {RECENT_REPORTS.map((report) => (
                            <Card key={report.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography fontWeight={500}>{report.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{report.date}</Typography>
                                        </Box>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Chip label={report.status} size="small" color={report.status === 'Ready' ? 'success' : 'warning'} />
                                            {report.status === 'Ready' ? (
                                                <Button size="small" startIcon={<DownloadIcon />}>Download</Button>
                                            ) : (
                                                <LinearProgress sx={{ width: 80 }} />
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </MotionCard>
        </Box>
    );
}

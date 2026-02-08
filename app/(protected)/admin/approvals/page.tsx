'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, Button, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PENDING_APPROVALS = [
    { id: 1, type: 'Event', title: 'Tech Summit 2026', requester: 'John Doe', date: 'Feb 5, 2026', icon: EventIcon, color: '#7C3AED' },
    { id: 2, type: 'User', title: 'Faculty Account Request', requester: 'Dr. Smith', date: 'Feb 4, 2026', icon: PersonIcon, color: '#2563EB' },
    { id: 3, type: 'Course', title: 'Advanced AI Course', requester: 'Prof. Johnson', date: 'Feb 3, 2026', icon: SchoolIcon, color: '#059669' },
];

export default function AdminApprovalsPage() {
    const [tab, setTab] = useState(0);
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Approvals" subtitle="Review and approve pending requests" showBackButton={false} />
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="All (8)" />
                    <Tab label="Events (3)" />
                    <Tab label="Users (3)" />
                </Tabs>
            </Card>
            <Stack spacing={2}>
                {PENDING_APPROVALS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <MotionCard key={item.id} variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon sx={{ color: item.color }} />
                                        </Box>
                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography fontWeight={600}>{item.title}</Typography>
                                                <Chip label={item.type} size="small" variant="outlined" />
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">Requested by {item.requester} • {item.date}</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />}>Approve</Button>
                                        <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />}>Reject</Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    );
                })}
            </Stack>
        </Box>
    );
}


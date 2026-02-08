'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, Button, Avatar, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import MessageIcon from '@mui/icons-material/Message';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const SERVICE_REQUESTS = [
    { id: 1, title: 'Projector not working', from: 'Dr. Smith', department: 'Computer Science', location: 'Room 205', time: '2 hours ago', priority: 'High', status: 'Open' },
    { id: 2, title: 'Water cooler maintenance needed', from: 'Admin Office', department: 'Administration', location: 'Block B', time: '4 hours ago', priority: 'Medium', status: 'Open' },
    { id: 3, title: 'Furniture arrangement for event', from: 'Event Committee', department: 'Student Affairs', location: 'Main Hall', time: '1 day ago', priority: 'High', status: 'In Progress' },
    { id: 4, title: 'Whiteboard markers needed', from: 'Prof. Johnson', department: 'Mathematics', location: 'Room 401', time: '2 days ago', priority: 'Low', status: 'Resolved' },
];

const getPriorityColor = (p: string): 'error' | 'warning' | 'default' => p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'default';
const getStatusColor = (s: string): 'error' | 'info' | 'success' => s === 'Open' ? 'error' : s === 'In Progress' ? 'info' : 'success';

export default function NonAcademicRequestsPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Service Requests" subtitle="Manage incoming service requests" showBackButton={false} />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="Open (12)" />
                    <Tab label="In Progress (5)" />
                    <Tab label="Resolved" />
                </Tabs>
            </Card>

            <Stack spacing={2}>
                {SERVICE_REQUESTS.map((request) => (
                    <MotionCard key={request.id} variants={itemVariants} sx={{ borderRadius: 3, borderLeft: request.priority === 'High' ? '4px solid' : undefined, borderLeftColor: request.priority === 'High' ? 'error.main' : undefined }}>
                        <CardContent>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: request.priority === 'High' ? 'error.lighter' : 'grey.100' }}>
                                        <MessageIcon color={request.priority === 'High' ? 'error' : 'action'} />
                                    </Avatar>
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography fontWeight={600}>{request.title}</Typography>
                                            <Chip label={request.priority} size="small" color={getPriorityColor(request.priority)} />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">From: {request.from} ({request.department})</Typography>
                                        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">{request.location}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                                {request.time}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={request.status} size="small" color={getStatusColor(request.status)} variant="outlined" />
                                    {request.status !== 'Resolved' && (
                                        <Button size="small" variant="contained" startIcon={request.status === 'Open' ? undefined : <CheckIcon />}>
                                            {request.status === 'Open' ? 'Accept' : 'Complete'}
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                ))}
            </Stack>
        </Box>
    );
}


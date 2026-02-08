'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, Button, Avatar, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const MEETING_REQUESTS = [
    { id: 1, student: 'John Smith', email: 'john.smith@uni.edu', reason: 'Discuss assignment feedback', date: 'Feb 10, 2026', time: '10:00 AM', status: 'Pending' },
    { id: 2, student: 'Sarah Johnson', email: 'sarah.j@uni.edu', reason: 'Career guidance discussion', date: 'Feb 11, 2026', time: '2:00 PM', status: 'Pending' },
    { id: 3, student: 'Michael Brown', email: 'michael.b@uni.edu', reason: 'Project clarification', date: 'Feb 9, 2026', time: '11:00 AM', status: 'Confirmed' },
];

const SCHEDULED_MEETINGS = [
    { id: 1, student: 'Emily Davis', reason: 'Research discussion', date: 'Feb 8, 2026', time: '3:00 PM', location: 'Office 205' },
    { id: 2, student: 'David Wilson', reason: 'Grade review', date: 'Feb 8, 2026', time: '4:30 PM', location: 'Office 205' },
];

export default function AcademicMeetingsPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Student Meetings" subtitle="Manage meeting requests and schedule" showBackButton={false} />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="Requests (5)" />
                    <Tab label="Today's Schedule (2)" />
                    <Tab label="History" />
                </Tabs>
            </Card>

            {tab === 0 && (
                <Stack spacing={2}>
                    {MEETING_REQUESTS.map((request) => (
                        <MotionCard key={request.id} variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ width: 48, height: 48 }}>{request.student[0]}</Avatar>
                                        <Box>
                                            <Typography fontWeight={600}>{request.student}</Typography>
                                            <Typography variant="body2" color="text.secondary">{request.reason}</Typography>
                                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                                    {request.date} at {request.time}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Chip label={request.status} size="small" color={request.status === 'Pending' ? 'warning' : 'success'} />
                                        {request.status === 'Pending' && (
                                            <>
                                                <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}>Accept</Button>
                                                <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />}>Decline</Button>
                                            </>
                                        )}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    ))}
                </Stack>
            )}

            {tab === 1 && (
                <Stack spacing={2}>
                    {SCHEDULED_MEETINGS.map((meeting) => (
                        <MotionCard key={meeting.id} variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <PersonIcon color="primary" />
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={600}>{meeting.student}</Typography>
                                            <Typography variant="body2" color="text.secondary">{meeting.reason}</Typography>
                                            <Typography variant="caption" color="text.secondary">{meeting.time} • {meeting.location}</Typography>
                                        </Box>
                                    </Stack>
                                    <Button variant="outlined" size="small">Join / Start</Button>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    ))}
                </Stack>
            )}

            {tab === 2 && (
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography color="text.secondary">Meeting history will appear here.</Typography>
                    </CardContent>
                </MotionCard>
            )}
        </Box>
    );
}


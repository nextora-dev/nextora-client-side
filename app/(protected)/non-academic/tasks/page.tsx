'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, Button, LinearProgress, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const TASKS = [
    { id: 1, title: 'Clean Lecture Hall A', location: 'Building 1, Floor 2', priority: 'High', deadline: 'Today 12:00 PM', progress: 60, assigned: 'John D.' },
    { id: 2, title: 'Replace AC Filters', location: 'Admin Block', priority: 'Medium', deadline: 'Today 5:00 PM', progress: 0, assigned: 'You' },
    { id: 3, title: 'Setup Event Hall', location: 'Main Hall', priority: 'High', deadline: 'Tomorrow 8:00 AM', progress: 35, assigned: 'Team A' },
    { id: 4, title: 'Inventory Check - Stationery', location: 'Store Room', priority: 'Low', deadline: 'Feb 10, 2026', progress: 0, assigned: 'You' },
];

const getPriorityColor = (p: string): 'error' | 'warning' | 'default' => p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'default';

export default function NonAcademicTasksPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="My Tasks" subtitle="View and manage assigned tasks" showBackButton={false} />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="Active (8)" />
                    <Tab label="Completed" />
                    <Tab label="Overdue (2)" />
                </Tabs>
            </Card>

            <Stack spacing={2}>
                {TASKS.map((task) => (
                    <MotionCard key={task.id} variants={itemVariants} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AssignmentIcon color="primary" />
                                    </Box>
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography fontWeight={600}>{task.title}</Typography>
                                            <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">{task.location}</Typography>
                                        <Typography variant="caption" color="text.secondary">Assigned to: {task.assigned} • Due: {task.deadline}</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {task.progress > 0 && (
                                        <Box sx={{ width: 150 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="caption">Progress</Typography>
                                                <Typography variant="caption" fontWeight={600}>{task.progress}%</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={task.progress} sx={{ borderRadius: 1 }} />
                                        </Box>
                                    )}
                                    <Button variant="contained" size="small" startIcon={task.progress === 0 ? undefined : <CheckCircleIcon />}>
                                        {task.progress === 0 ? 'Start' : 'Update'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                ))}
            </Stack>
        </Box>
    );
}


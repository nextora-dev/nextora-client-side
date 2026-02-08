'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const MAINTENANCE_JOBS = [
    { id: 1, title: 'AC Unit Repair', location: 'Building A, Room 305', priority: 'High', reported: 'Feb 6, 2026', status: 'In Progress', assignee: 'Mike T.' },
    { id: 2, title: 'Plumbing Issue', location: 'Block B, Restroom', priority: 'High', reported: 'Feb 7, 2026', status: 'Pending', assignee: 'Unassigned' },
    { id: 3, title: 'Light Fixture Replacement', location: 'Library, 2nd Floor', priority: 'Medium', reported: 'Feb 5, 2026', status: 'In Progress', assignee: 'You' },
    { id: 4, title: 'Door Lock Repair', location: 'Admin Office', priority: 'Low', reported: 'Feb 4, 2026', status: 'Completed', assignee: 'John D.' },
];

const getPriorityColor = (p: string): 'error' | 'warning' | 'default' => p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'default';
const getStatusColor = (s: string): 'warning' | 'info' | 'success' | 'default' => s === 'Pending' ? 'warning' : s === 'In Progress' ? 'info' : s === 'Completed' ? 'success' : 'default';

export default function NonAcademicMaintenancePage() {
    const [tab, setTab] = useState(0);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Maintenance"
                subtitle="Manage repair and maintenance jobs"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<AddIcon />}>Report Issue</Button>}
            />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="All Jobs (5)" />
                    <Tab label="My Assigned (2)" />
                    <Tab label="Completed" />
                </Tabs>
            </Card>

            <Grid container spacing={3}>
                {MAINTENANCE_JOBS.map((job) => (
                    <Grid size={{ xs: 12, md: 6 }} key={job.id}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'warning.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BuildIcon color="warning" />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight={600}>{job.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">{job.location}</Typography>
                                            </Box>
                                        </Stack>
                                        <Chip label={job.priority} size="small" color={getPriorityColor(job.priority)} />
                                    </Stack>

                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack spacing={0.5}>
                                            <Typography variant="caption" color="text.secondary">Reported: {job.reported}</Typography>
                                            <Typography variant="caption" color="text.secondary">Assigned: {job.assignee}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip label={job.status} size="small" color={getStatusColor(job.status)} />
                                            {job.status !== 'Completed' && <Button size="small" variant="outlined">Update</Button>}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}


'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, Avatar, AvatarGroup } from '@mui/material';
import { motion } from 'framer-motion';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const KUPPI_SESSIONS = [
    { id: 1, topic: 'Data Structures Revision', course: 'CS201', date: 'Feb 10, 2026', time: '3:00 PM', location: 'Room 301', enrolled: 25, status: 'Upcoming' },
    { id: 2, topic: 'Algorithm Analysis', course: 'CS201', date: 'Feb 12, 2026', time: '4:00 PM', location: 'Lab 102', enrolled: 18, status: 'Upcoming' },
    { id: 3, topic: 'SQL Query Optimization', course: 'CS202', date: 'Feb 8, 2026', time: '2:00 PM', location: 'Room 205', enrolled: 32, status: 'Completed' },
];

export default function AcademicKuppiPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Kuppi Sessions"
                subtitle="Schedule and manage study sessions"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<AddIcon />}>Create Session</Button>}
            />

            <Grid container spacing={3}>
                {KUPPI_SESSIONS.map((session) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session.id}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'secondary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AutoStoriesIcon color="secondary" />
                                        </Box>
                                        <Chip label={session.status} size="small" color={session.status === 'Upcoming' ? 'primary' : 'default'} />
                                    </Stack>

                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>{session.topic}</Typography>
                                        <Typography variant="body2" color="text.secondary">{session.course}</Typography>
                                    </Box>

                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2">{session.date} at {session.time}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2">{session.location}</Typography>
                                        </Stack>
                                    </Stack>

                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
                                                {[...Array(Math.min(session.enrolled, 4))].map((_, i) => (
                                                    <Avatar key={i} sx={{ bgcolor: `hsl(${i * 60}, 70%, 50%)` }}>{String.fromCharCode(65 + i)}</Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <Typography variant="body2" color="text.secondary">{session.enrolled} enrolled</Typography>
                                        </Stack>
                                        <Button size="small" variant="outlined">Manage</Button>
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


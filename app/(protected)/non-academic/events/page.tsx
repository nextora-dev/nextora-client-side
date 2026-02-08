'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, Avatar, AvatarGroup } from '@mui/material';
import { motion } from 'framer-motion';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const EVENTS = [
    { id: 1, name: 'Annual Tech Summit', date: 'Feb 15, 2026', time: '9:00 AM - 5:00 PM', location: 'Main Auditorium', tasks: 5, team: 4, status: 'Upcoming' },
    { id: 2, name: 'Career Fair 2026', date: 'Feb 20, 2026', time: '10:00 AM - 4:00 PM', location: 'Sports Complex', tasks: 8, team: 6, status: 'Upcoming' },
    { id: 3, name: 'Department Meeting', date: 'Feb 10, 2026', time: '2:00 PM - 4:00 PM', location: 'Conference Room A', tasks: 2, team: 2, status: 'Today' },
];

export default function NonAcademicEventsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Events Support" subtitle="Support and coordinate upcoming events" showBackButton={false} />

            <Grid container spacing={3}>
                {EVENTS.map((event) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'secondary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <EventIcon color="secondary" />
                                        </Box>
                                        <Chip label={event.status} size="small" color={event.status === 'Today' ? 'error' : 'primary'} />
                                    </Stack>

                                    <Box>
                                        <Typography fontWeight={600}>{event.name}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">{event.date}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">{event.location}</Typography>
                                        </Stack>
                                    </Box>

                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
                                                {[...Array(event.team)].map((_, i) => (
                                                    <Avatar key={i} sx={{ bgcolor: `hsl(${i * 60}, 70%, 50%)` }}>{String.fromCharCode(65 + i)}</Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <Typography variant="caption" color="text.secondary">{event.tasks} tasks</Typography>
                                        </Stack>
                                        <Button size="small" variant="outlined">View Tasks</Button>
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


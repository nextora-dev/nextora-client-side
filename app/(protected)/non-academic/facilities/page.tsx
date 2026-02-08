'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const FACILITIES = [
    { id: 1, name: 'Main Auditorium', type: 'Hall', capacity: 500, status: 'Available', bookings: 3, icon: ApartmentIcon },
    { id: 2, name: 'Conference Room A', type: 'Meeting Room', capacity: 20, status: 'Booked', bookings: 8, icon: MeetingRoomIcon },
    { id: 3, name: 'Seminar Hall B', type: 'Hall', capacity: 100, status: 'Available', bookings: 5, icon: EventSeatIcon },
    { id: 4, name: 'Board Room', type: 'Meeting Room', capacity: 15, status: 'Maintenance', bookings: 0, icon: MeetingRoomIcon },
    { id: 5, name: 'Lecture Hall 1', type: 'Classroom', capacity: 60, status: 'Available', bookings: 12, icon: EventSeatIcon },
    { id: 6, name: 'Sports Complex', type: 'Facility', capacity: 200, status: 'Available', bookings: 2, icon: ApartmentIcon },
];

const getStatusColor = (s: string): 'success' | 'error' | 'warning' => s === 'Available' ? 'success' : s === 'Booked' ? 'error' : 'warning';

export default function NonAcademicFacilitiesPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Facilities" subtitle="Manage room bookings and facilities" showBackButton={false} />

            <Grid container spacing={3}>
                {FACILITIES.map((facility) => {
                    const Icon = facility.icon;
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={facility.id}>
                            <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon color="primary" />
                                            </Box>
                                            <Chip label={facility.status} size="small" color={getStatusColor(facility.status)} />
                                        </Stack>

                                        <Box>
                                            <Typography fontWeight={600}>{facility.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{facility.type}</Typography>
                                        </Box>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack spacing={0.5}>
                                                <Typography variant="caption" color="text.secondary">Capacity: {facility.capacity}</Typography>
                                                <Typography variant="caption" color="text.secondary">This week: {facility.bookings} bookings</Typography>
                                            </Stack>
                                            <Button size="small" variant="outlined" disabled={facility.status === 'Maintenance'}>
                                                Manage
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}


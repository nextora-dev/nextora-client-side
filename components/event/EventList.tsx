'use client';

import React from 'react';
import { Box, Typography, Grid, CircularProgress, alpha, useTheme } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { EventCard } from './EventCard';
import type { EventResponse } from '@/features/event/types';

interface EventListProps {
    events: EventResponse[];
    isLoading: boolean;
    onView: (event: EventResponse) => void;
    onRegister?: (event: EventResponse) => void;
    canRegister?: boolean;
    registeredEventIds?: number[];
    showStatus?: boolean;
    emptyMessage?: string;
}

export function EventList({
    events,
    isLoading,
    onView,
    onRegister,
    canRegister = false,
    registeredEventIds = [],
    showStatus = false,
    emptyMessage = 'No events found.',
}: EventListProps) {
    const theme = useTheme();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (!events.length) {
        return (
            <Box
                sx={{
                    p: 8,
                    textAlign: 'center',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2.5,
                    }}
                >
                    <EventIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    {emptyMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                    Check back later for new events.
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={2.5}>
            {events.map((event, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                    <EventCard
                        event={event}
                        onView={onView}
                        onRegister={onRegister}
                        canRegister={canRegister}
                        isRegistered={registeredEventIds.includes(event.id)}
                        showStatus={showStatus}
                        index={index}
                    />
                </Grid>
            ))}
        </Grid>
    );
}

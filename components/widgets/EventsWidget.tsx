'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip, IconButton, Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
    color: string;
    location?: string;
    image?: string;
}

interface EventsWidgetProps {
    events: Event[];
    title?: string;
    onViewAll?: () => void;
    onEventClick?: (id: string) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

const MotionBox = motion.create(Box);

export const EventsWidget: React.FC<EventsWidgetProps> = ({
    events,
    title = 'Upcoming Events',
    onViewAll,
    onEventClick,
    isLoading = false,
    emptyMessage = 'No upcoming events',
}) => {
    if (isLoading) {
        return (
            <Box
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'grey.100',
                    height: '100%',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Skeleton width={140} height={28} />
                    <Skeleton width={24} height={24} variant="circular" />
                </Box>
                {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'grey.100',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {title}
                </Typography>
                {onViewAll && (
                    <IconButton
                        size="small"
                        onClick={onViewAll}
                        sx={{
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                        }}
                    >
                        <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatePresence>
                    {events.length === 0 ? (
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                py: 4,
                            }}
                        >
                            <CalendarTodayIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                            <Typography color="text.secondary">{emptyMessage}</Typography>
                        </Box>
                    ) : (
                        events.map((event, index) => (
                            <MotionBox
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 4, scale: 1.01 }}
                                onClick={() => onEventClick?.(event.id)}
                                sx={{
                                    p: 2,
                                    borderRadius: 2.5,
                                    bgcolor: 'grey.50',
                                    cursor: onEventClick ? 'pointer' : 'default',
                                    display: 'flex',
                                    gap: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: `${event.color}08`,
                                        '& .event-indicator': {
                                            height: '100%',
                                        },
                                    },
                                }}
                            >
                                {/* Left Color Indicator */}
                                <Box
                                    className="event-indicator"
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 4,
                                        height: '60%',
                                        borderRadius: '0 4px 4px 0',
                                        bgcolor: event.color,
                                        transition: 'height 0.2s ease',
                                    }}
                                />

                                <Avatar
                                    src={event.image}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        bgcolor: `${event.color}15`,
                                        color: event.color,
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    <CalendarTodayIcon sx={{ fontSize: 20 }} />
                                </Avatar>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary',
                                            mb: 0.5,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {event.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {event.date}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {event.time}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Chip
                                    label={event.type}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        bgcolor: `${event.color}12`,
                                        color: event.color,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        alignSelf: 'flex-start',
                                    }}
                                />
                            </MotionBox>
                        ))
                    )}
                </AnimatePresence>
            </Box>
        </MotionBox>
    );
};

export default EventsWidget;

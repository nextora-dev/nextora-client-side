'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    Button,
    alpha,
    useTheme,
    Tooltip,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';
import type { EventResponse } from '@/features/event/types';

/** Safely format a date string, returning fallback on invalid input */
function safeFormat(dateStr: string | null | undefined, pattern: string, fallback = '—'): string {
    if (!dateStr) return fallback;
    try {
        const d = new Date(dateStr);
        return isValid(d) ? format(d, pattern) : fallback;
    } catch {
        return fallback;
    }
}

const MotionCard = motion.create(Card);

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    DRAFT: { color: '#6B7280', label: 'Draft' },
    PUBLISHED: { color: '#10B981', label: 'Published' },
    CANCELLED: { color: '#EF4444', label: 'Cancelled' },
    COMPLETED: { color: '#3B82F6', label: 'Completed' },
};

const TYPE_CONFIG: Record<string, { color: string }> = {
    WORKSHOP: { color: '#8B5CF6' },
    SEMINAR: { color: '#3B82F6' },
    CONFERENCE: { color: '#F59E0B' },
    HACKATHON: { color: '#EC4899' },
    CULTURAL: { color: '#10B981' },
    SPORTS: { color: '#EF4444' },
    SOCIAL: { color: '#6366F1' },
    ACADEMIC: { color: '#0EA5E9' },
    OTHER: { color: '#6B7280' },
};

interface EventCardProps {
    event: EventResponse;
    onView: (event: EventResponse) => void;
    onRegister?: (event: EventResponse) => void;
    canRegister?: boolean;
    isRegistered?: boolean;
    showStatus?: boolean;
    index?: number;
}

export function EventCard({
    event,
    onView,
    onRegister,
    canRegister = false,
    isRegistered = false,
    showStatus = false,
    index = 0,
}: EventCardProps) {
    const theme = useTheme();
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
    const typeCfg = TYPE_CONFIG[event.eventType] || TYPE_CONFIG.OTHER;

    const startDate = event.startAt ? new Date(event.startAt) : new Date();
    const isUpcoming = isValid(startDate) && startDate > new Date();

    return (
        <MotionCard
            elevation={0}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{
                y: -6,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
            sx={{
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.25s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    '& .event-arrow': { opacity: 1, transform: 'translateX(0)' },
                },
            }}
            onClick={() => onView(event)}
        >
            {/* Accent bar */}
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${typeCfg.color}, ${alpha(typeCfg.color, 0.4)})` }} />

            {/* Cover image or gradient header */}
            <Box
                sx={{
                    height: 120,
                    background: event.coverImageUrl
                        ? `url(${event.coverImageUrl}) center/cover`
                        : `linear-gradient(135deg, ${typeCfg.color} 0%, ${alpha(typeCfg.color, 0.6)} 50%, ${theme.palette.primary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    p: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '20px 20px' }} />

                {showStatus && (
                    <Chip
                        size="small"
                        label={statusCfg.label}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            height: 24,
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)',
                            zIndex: 1,
                        }}
                    />
                )}

                {isRegistered && (
                    <Tooltip title="You're registered">
                        <Chip
                            size="small"
                            icon={<EventAvailableIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                            label="Registered"
                            sx={{
                                bgcolor: 'rgba(16,185,129,0.8)',
                                color: '#fff',
                                fontSize: '0.65rem',
                                height: 24,
                                fontWeight: 600,
                                backdropFilter: 'blur(4px)',
                                zIndex: 1,
                                ml: 'auto',
                            }}
                        />
                    </Tooltip>
                )}

                {/* Date badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.75,
                        textAlign: 'center',
                        minWidth: 50,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: typeCfg.color, fontSize: '0.85rem', lineHeight: 1, display: 'block' }}>
                        {safeFormat(event.startAt, 'dd')}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                        {safeFormat(event.startAt, 'MMM')}
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ flex: 1, pt: 2, pb: 1, px: 3 }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                    {event.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        minHeight: 40,
                        lineHeight: 1.6,
                        fontSize: '0.8rem',
                    }}
                >
                    {event.description || 'No description available.'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                    <Chip
                        size="small"
                        label={event.eventType.replace(/_/g, ' ')}
                        sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            bgcolor: alpha(typeCfg.color, 0.1),
                            color: typeCfg.color,
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha(typeCfg.color, 0.15),
                        }}
                    />
                </Box>

                {/* Event details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                            {safeFormat(event.startAt, 'MMM dd, yyyy • hh:mm a')}
                        </Typography>
                    </Box>
                    {event.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.72rem' }}>
                                {event.location}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Footer info */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {event.creatorName}
                            </Typography>
                        </Box>
                        {event.maxAttendees && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PeopleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {event.registrationCount}/{event.maxAttendees}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box
                        className="event-arrow"
                        sx={{ opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
                {canRegister && isUpcoming && event.status === 'PUBLISHED' && !isRegistered && (
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<EventAvailableIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegister?.(event);
                        }}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            px: 2,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                        }}
                    >
                        Register
                    </Button>
                )}
            </CardActions>
        </MotionCard>
    );
}
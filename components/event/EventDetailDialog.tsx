'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Chip,
    Button,
    IconButton,
    Divider,
    alpha,
    useTheme,
    Stack,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format, isValid } from 'date-fns';
import type { EventResponse } from '@/features/event/types';

function safeFormat(dateStr: string | null | undefined, pattern: string, fallback = '—'): string {
    if (!dateStr) return fallback;
    try {
        const d = new Date(dateStr);
        return isValid(d) ? format(d, pattern) : fallback;
    } catch {
        return fallback;
    }
}

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

interface EventDetailDialogProps {
    open: boolean;
    event: EventResponse | null;
    onClose: () => void;
    isLoading?: boolean;
    // Actions
    onRegister?: () => void;
    onUnregister?: () => void;
    isRegistered?: boolean;
    isRegistrationLoading?: boolean;
    // Creator/Admin actions
    onPublish?: () => void;
    onCancel?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isUpdating?: boolean;
    canManage?: boolean;
}

export function EventDetailDialog({
    open,
    event,
    onClose,
    isLoading = false,
    onRegister,
    onUnregister,
    isRegistered = false,
    isRegistrationLoading = false,
    onPublish,
    onCancel,
    onEdit,
    onDelete,
    isUpdating = false,
    canManage = false,
}: EventDetailDialogProps) {
    const theme = useTheme();

    if (!event && !isLoading) return null;

    const statusCfg = event ? (STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT) : STATUS_CONFIG.DRAFT;
    const typeCfg = event ? (TYPE_CONFIG[event.eventType] || TYPE_CONFIG.OTHER) : TYPE_CONFIG.OTHER;
    const isUpcoming = event?.startAt ? (isValid(new Date(event.startAt)) && new Date(event.startAt) > new Date()) : false;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : event ? (
                <>
                    {/* Cover */}
                    <Box
                        sx={{
                            height: 160,
                            background: event.coverImageUrl
                                ? `url(${event.coverImageUrl}) center/cover`
                                : `linear-gradient(135deg, ${typeCfg.color} 0%, ${theme.palette.primary.main} 100%)`,
                            position: 'relative',
                        }}
                    >
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                            }}
                            size="small"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>

                        <Box sx={{ position: 'absolute', bottom: 12, left: 16, display: 'flex', gap: 1 }}>
                            <Chip
                                size="small"
                                label={statusCfg.label}
                                sx={{ bgcolor: alpha(statusCfg.color, 0.9), color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
                            />
                            <Chip
                                size="small"
                                label={event.eventType.replace(/_/g, ' ')}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}
                            />
                        </Box>
                    </Box>

                    <DialogTitle sx={{ pb: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                        {event.title}
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        {event.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                                {event.description}
                            </Typography>
                        )}

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CalendarTodayIcon sx={{ fontSize: 20, color: typeCfg.color }} />
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {safeFormat(event.startAt, 'EEEE, MMMM dd, yyyy')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {safeFormat(event.startAt, 'hh:mm a')} - {safeFormat(event.endAt, 'hh:mm a')}
                                    </Typography>
                                </Box>
                            </Box>

                            {event.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <LocationOnIcon sx={{ fontSize: 20, color: typeCfg.color }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{event.location}</Typography>
                                        {event.venue && (
                                            <Typography variant="caption" color="text.secondary">{event.venue}</Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <PersonIcon sx={{ fontSize: 20, color: typeCfg.color }} />
                                <Typography variant="body2">
                                    Organized by <strong>{event.creatorName}</strong>
                                </Typography>
                            </Box>

                            {event.maxAttendees && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PeopleIcon sx={{ fontSize: 20, color: typeCfg.color }} />
                                    <Typography variant="body2">
                                        {event.registrationCount} / {event.maxAttendees} attendees
                                    </Typography>
                                </Box>
                            )}

                            {event.registrationLink && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <LinkIcon sx={{ fontSize: 20, color: typeCfg.color }} />
                                    <Typography
                                        variant="body2"
                                        component="a"
                                        href={event.registrationLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: 'primary.main', textDecoration: 'underline' }}
                                    >
                                        External Registration Link
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </DialogContent>

                    <Divider />

                    <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {/* Registration actions */}
                            {onRegister && isUpcoming && event.status === 'PUBLISHED' && !isRegistered && (
                                <Button
                                    variant="contained"
                                    startIcon={<EventAvailableIcon />}
                                    onClick={onRegister}
                                    disabled={isRegistrationLoading}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700 }}
                                >
                                    {isRegistrationLoading ? 'Registering...' : 'Register'}
                                </Button>
                            )}
                            {onUnregister && isRegistered && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<EventBusyIcon />}
                                    onClick={onUnregister}
                                    disabled={isRegistrationLoading}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 600 }}
                                >
                                    Cancel Registration
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {/* Creator/Admin actions */}
                            {canManage && event.status === 'DRAFT' && onPublish && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<PublishIcon />}
                                    onClick={onPublish}
                                    disabled={isUpdating}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 600 }}
                                >
                                    Publish
                                </Button>
                            )}
                            {canManage && onEdit && (
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={onEdit}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 600, borderColor: 'divider', color: 'text.secondary' }}
                                >
                                    Edit
                                </Button>
                            )}
                            {canManage && event.status !== 'CANCELLED' && onCancel && (
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<EventBusyIcon />}
                                    onClick={onCancel}
                                    disabled={isUpdating}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 600 }}
                                >
                                    Cancel Event
                                </Button>
                            )}
                            {canManage && onDelete && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={onDelete}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 600 }}
                                >
                                    Delete
                                </Button>
                            )}
                        </Box>
                    </DialogActions>
                </>
            ) : null}
        </Dialog>
    );
}

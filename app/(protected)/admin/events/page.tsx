'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Snackbar,
    Alert,
    Stack,
    alpha,
    useTheme,
    IconButton,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import { motion } from 'framer-motion';
import { useEvent } from '@/hooks/useEvent';
import { EventList } from '@/components/event/EventList';
import { CreateEventDialog } from '@/components/event/CreateEventDialog';
import { EventDetailDialog } from '@/components/event/EventDetailDialog';
import type { EventResponse, EventType } from '@/features/event/types';

const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const EVENT_TYPE_OPTIONS: { value: '' | EventType; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'HACKATHON', label: 'Hackathon' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'OTHER', label: 'Other' },
];

export default function AdminEventsPage() {
    const theme = useTheme();
    const {
        events,
        totalEvents,
        selectedEvent,
        platformStatistics,
        isEventLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        successMessage,
        loadAdminEvents,
        loadEventById,
        loadPlatformStatistics,
        searchEvents,
        searchByType,
        createEvent,
        publishEvent,
        cancelEvent,
        adminDeleteEvent,
        clearError,
        clearSuccess,
        resetSelectedEvent,
    } = useEvent();

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'' | EventType>('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedEventForCancel, setSelectedEventForCancel] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
        loadPlatformStatistics();
    }, [loadAdminEvents, loadPlatformStatistics]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchEvents({ keyword: searchQuery, page: 0, size: 20 });
            } else if (typeFilter) {
                searchByType(typeFilter, { page: 0, size: 20 });
            } else {
                loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, typeFilter, searchEvents, searchByType, loadAdminEvents]);

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const handleViewEvent = useCallback((event: EventResponse) => {
        loadEventById(event.id);
        setDetailOpen(true);
    }, [loadEventById]);

    const handleRefresh = () => {
        setSearchQuery('');
        setTypeFilter('');
        loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
        loadPlatformStatistics();
    };

    const handleCancelEvent = () => {
        if (selectedEventForCancel !== null) {
            cancelEvent(selectedEventForCancel, cancelReason || undefined).then(() => {
                setCancelDialogOpen(false);
                setCancelReason('');
                setSelectedEventForCancel(null);
                loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
            });
        }
    };

    const stats = platformStatistics
        ? [
            { label: 'Total Events', value: platformStatistics.totalEvents, icon: EventIcon, color: '#3B82F6' },
            { label: 'Published', value: platformStatistics.publishedEvents, icon: PublishIcon, color: '#10B981' },
            { label: 'Drafts', value: platformStatistics.draftEvents, icon: DraftsIcon, color: '#F59E0B' },
            { label: 'Cancelled', value: platformStatistics.cancelledEvents, icon: CancelIcon, color: '#EF4444' },
            { label: 'Total Registrations', value: platformStatistics.totalRegistrations, icon: PeopleIcon, color: '#8B5CF6' },
            { label: 'Upcoming', value: platformStatistics.upcomingEvents, icon: BarChartIcon, color: '#0EA5E9' },
        ]
        : [];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Event Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create, manage, and monitor all campus events
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="small"
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                    >
                        Create Event
                    </Button>
                </Stack>
            </MotionBox>

            {/* Stats Grid */}
            {stats.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: alpha(stat.color, 0.1),
                                                        border: '1px solid',
                                                        borderColor: alpha(stat.color, 0.15),
                                                    }}
                                                >
                                                    <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize: '0.68rem' }}>{stat.label}</Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {/* Filters */}
            <Card elevation={0} sx={{ mb: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                        <TextField
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                },
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Event Type</InputLabel>
                            <Select
                                value={typeFilter}
                                label="Event Type"
                                onChange={(e) => { setTypeFilter(e.target.value as '' | EventType); setSearchQuery(''); }}
                                sx={{ borderRadius: 1 }}
                            >
                                {EVENT_TYPE_OPTIONS.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="Refresh">
                            <IconButton onClick={handleRefresh} disabled={isEventLoading} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>

            {/* Event List */}
            <EventList
                events={events}
                isLoading={isEventLoading}
                onView={handleViewEvent}
                showStatus
            />

            {/* Create Event Dialog */}
            <CreateEventDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={(data, coverImage) => {
                    createEvent(data, coverImage).then(() => {
                        setCreateDialogOpen(false);
                        loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
                        loadPlatformStatistics();
                    });
                }}
                isCreating={isCreating}
            />

            {/* Event Detail Dialog */}
            <EventDetailDialog
                open={detailOpen}
                event={selectedEvent}
                onClose={() => { setDetailOpen(false); resetSelectedEvent(); }}
                isLoading={isEventLoading}
                canManage
                onPublish={() => {
                    if (selectedEvent) {
                        publishEvent(selectedEvent.id).then(() => {
                            setDetailOpen(false);
                            loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
                            loadPlatformStatistics();
                        });
                    }
                }}
                onCancel={() => {
                    if (selectedEvent) {
                        setSelectedEventForCancel(selectedEvent.id);
                        setCancelDialogOpen(true);
                        setDetailOpen(false);
                    }
                }}
                onDelete={() => {
                    if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
                        adminDeleteEvent(selectedEvent.id).then(() => {
                            setDetailOpen(false);
                            loadAdminEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
                            loadPlatformStatistics();
                        });
                    }
                }}
                isUpdating={isUpdating}
            />

            {/* Cancel Event Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                <DialogTitle><Typography fontWeight={700}>Cancel Event</Typography></DialogTitle>
                <DialogContent>
                    <TextField
                        label="Cancellation Reason (optional)"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCancelDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 1 }}>Back</Button>
                    <Button variant="contained" color="warning" onClick={handleCancelEvent} disabled={isUpdating} sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 700 }}>
                        {isUpdating ? 'Cancelling...' : 'Cancel Event'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

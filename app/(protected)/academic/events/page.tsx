'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
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
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import PeopleIcon from '@mui/icons-material/People';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvent } from '@/hooks/useEvent';
import { EventList } from '@/components/event/EventList';
import { CreateEventDialog } from '@/components/event/CreateEventDialog';
import { EventDetailDialog } from '@/components/event/EventDetailDialog';
import type { EventResponse } from '@/features/event/types';

const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AcademicEventsPage() {
    const theme = useTheme();
    const {
        events,
        totalEvents,
        selectedEvent,
        myEvents,
        totalMyEvents,
        creatorAnalytics,
        isEventLoading,
        isMyEventsLoading,
        isCreating,
        isUpdating,
        error,
        successMessage,
        loadEvents,
        loadUpcomingEvents,
        loadMyEvents,
        loadMyAnalytics,
        loadEventById,
        searchEvents,
        createEvent,
        publishEvent,
        cancelEvent,
        removeEvent,
        clearError,
        clearSuccess,
        resetSelectedEvent,
    } = useEvent();

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        loadEvents({ page: 0, size: 20, sortBy: 'startAt', sortDirection: 'ASC' });
        loadMyEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
        loadMyAnalytics();
    }, [loadEvents, loadMyEvents, loadMyAnalytics]);

    // Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchEvents({ keyword: searchQuery, page: 0, size: 20 });
            } else {
                loadTabData(activeTab);
            }
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const loadTabData = useCallback((tab: number) => {
        if (tab === 0) loadEvents({ page: 0, size: 20, sortBy: 'startAt', sortDirection: 'ASC' });
        else if (tab === 1) loadUpcomingEvents({ page: 0, size: 20 });
        else if (tab === 2) loadMyEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
    }, [loadEvents, loadUpcomingEvents, loadMyEvents]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
        loadTabData(newValue);
    };

    const handleViewEvent = useCallback((event: EventResponse) => {
        loadEventById(event.id);
        setDetailOpen(true);
    }, [loadEventById]);

    const handleRefresh = () => {
        setSearchQuery('');
        loadTabData(activeTab);
        loadMyAnalytics();
    };

    const isMyEvent = selectedEvent ? myEvents.some(e => e.id === selectedEvent.id) : false;
    const displayEvents = activeTab === 2 ? myEvents : events;
    const displayLoading = activeTab === 2 ? isMyEventsLoading : isEventLoading;

    const stats = creatorAnalytics
        ? [
            { label: 'Total Events', value: creatorAnalytics.totalEvents, icon: EventIcon, color: '#3B82F6' },
            { label: 'Published', value: creatorAnalytics.publishedEvents, icon: PublishIcon, color: '#10B981' },
            { label: 'Drafts', value: creatorAnalytics.draftEvents, icon: DraftsIcon, color: '#F59E0B' },
            { label: 'Total Registrations', value: creatorAnalytics.totalRegistrations, icon: PeopleIcon, color: '#8B5CF6' },
        ]
        : [
            { label: 'All Events', value: totalEvents, icon: EventIcon, color: '#3B82F6' },
            { label: 'My Events', value: totalMyEvents, icon: PublishIcon, color: '#10B981' },
        ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Events
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Browse events and create your own academic events
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

            {/* Stats */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), border: '1px solid', borderColor: alpha(stat.color, 0.15) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* Filters */}
            <Card elevation={0} sx={{ mb: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(12px)' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            sx={{
                                maxWidth: { sm: 320 },
                                '& .MuiOutlinedInput-root': { borderRadius: 1, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' } },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                                    endAdornment: searchQuery ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => { setSearchQuery(''); loadTabData(activeTab); }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                        />
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    minHeight: 36,
                                    '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 1, px: 2 },
                                    '& .MuiTabs-indicator': { borderRadius: 1, height: 2 },
                                }}
                            >
                                <Tab label="All Events" />
                                <Tab label="Upcoming" />
                                <Tab label="My Events" />
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={isEventLoading} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Event List */}
            <AnimatePresence mode="wait">
                <MotionBox key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <EventList
                        events={displayEvents}
                        isLoading={displayLoading}
                        onView={handleViewEvent}
                        showStatus={activeTab === 2}
                        emptyMessage={activeTab === 2 ? 'You haven\'t created any events yet.' : 'No events found.'}
                    />
                </MotionBox>
            </AnimatePresence>

            {/* Create Event Dialog */}
            <CreateEventDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={(data, coverImage) => {
                    createEvent(data, coverImage).then(() => {
                        setCreateDialogOpen(false);
                        loadMyEvents({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' });
                        loadMyAnalytics();
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
                canManage={isMyEvent}
                onPublish={() => {
                    if (selectedEvent) {
                        publishEvent(selectedEvent.id).then(() => {
                            setDetailOpen(false);
                            handleRefresh();
                        });
                    }
                }}
                onCancel={() => {
                    if (selectedEvent) {
                        cancelEvent(selectedEvent.id).then(() => {
                            setDetailOpen(false);
                            handleRefresh();
                        });
                    }
                }}
                onDelete={() => {
                    if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
                        removeEvent(selectedEvent.id).then(() => {
                            setDetailOpen(false);
                            handleRefresh();
                        });
                    }
                }}
                isUpdating={isUpdating}
            />

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

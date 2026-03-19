'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
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
import EventIcon from '@mui/icons-material/Event';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import HistoryIcon from '@mui/icons-material/History';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvent } from '@/hooks/useEvent';
import { EventList } from '@/components/event/EventList';
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

export default function NonAcademicEventsPage() {
    const theme = useTheme();
    const {
        events,
        totalEvents,
        selectedEvent,
        isEventLoading,
        error,
        successMessage,
        loadEvents,
        loadUpcomingEvents,
        loadOngoingEvents,
        loadPastEvents,
        searchEvents,
        loadEventById,
        clearError,
        clearSuccess,
        resetSelectedEvent,
    } = useEvent();

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        loadEvents({ page: 0, size: 20, sortBy: 'startAt', sortDirection: 'ASC' });
    }, [loadEvents]);

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
        const params = { page: 0, size: 20 };
        switch (tab) {
            case 0: loadEvents({ ...params, sortBy: 'startAt', sortDirection: 'ASC' }); break;
            case 1: loadUpcomingEvents(params); break;
            case 2: loadOngoingEvents(params); break;
            case 3: loadPastEvents(params); break;
        }
    }, [loadEvents, loadUpcomingEvents, loadOngoingEvents, loadPastEvents]);

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
    };

    const stats = [
        { label: 'All Events', value: totalEvents, icon: EventIcon, color: '#3B82F6' },
        { label: 'Upcoming', value: events.filter(e => new Date(e.startAt) > new Date()).length, icon: UpcomingIcon, color: '#8B5CF6' },
        { label: 'Ongoing', value: events.filter(e => new Date(e.startAt) <= new Date() && new Date(e.endAt) >= new Date()).length, icon: PlayCircleIcon, color: '#F59E0B' },
        { label: 'Past', value: events.filter(e => new Date(e.endAt) < new Date()).length, icon: HistoryIcon, color: '#6B7280' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                        Events Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and support campus events coordination
                    </Typography>
                </Box>
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
                            sx={{ maxWidth: { sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
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
                                <Tab label="All" />
                                <Tab label="Upcoming" />
                                <Tab label="Ongoing" />
                                <Tab label="Past" />
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={isEventLoading} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
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
                        events={events}
                        isLoading={isEventLoading}
                        onView={handleViewEvent}
                    />
                </MotionBox>
            </AnimatePresence>

            {/* Detail Dialog */}
            <EventDetailDialog
                open={detailOpen}
                event={selectedEvent}
                onClose={() => { setDetailOpen(false); resetSelectedEvent(); }}
                isLoading={isEventLoading}
            />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

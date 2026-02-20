'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, Button, TextField, Stack,
    MenuItem, alpha, useTheme, Alert, CircularProgress, Snackbar,
    Grid, Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    createSessionAsync,
    checkIsKuppiStudentAsync,
    selectKuppiIsKuppiStudent,
    selectKuppiIsCreating,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    CreateKuppiSessionRequest,
} from '@/features/kuppi';

const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Common subjects for suggestions
const SUBJECT_SUGGESTIONS = [
    'Data Structures',
    'Algorithms',
    'Object Oriented Programming',
    'Database Management',
    'Web Development',
    'Mobile Development',
    'Software Engineering',
    'Computer Networks',
    'Operating Systems',
    'Machine Learning',
    'Artificial Intelligence',
    'Mathematics',
    'Statistics',
    'Physics',
];

// Meeting platforms
const MEETING_PLATFORMS = [
    'Google Meet',
    'Zoom',
    'Microsoft Teams',
    'Discord',
    'Other',
];

export default function CreateKuppiSessionPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Redux state
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const isCreating = useAppSelector(selectKuppiIsCreating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        liveLink: '',
        meetingPlatform: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Check if user is a Kuppi student
    useEffect(() => {
        dispatch(checkIsKuppiStudentAsync());
    }, [dispatch]);

    // Handle form change
    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is edited
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) errors.title = 'Title is required';
        if (formData.title.length > 200) errors.title = 'Title must be less than 200 characters';
        if (!formData.subject.trim()) errors.subject = 'Subject is required';
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.startTime) errors.startTime = 'Start time is required';
        if (!formData.endDate) errors.endDate = 'End date is required';
        if (!formData.endTime) errors.endTime = 'End time is required';
        if (!formData.liveLink.trim()) errors.liveLink = 'Meeting link is required';

        // Check if end time is after start time
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        if (endDateTime <= startDateTime) {
            errors.endTime = 'End time must be after start time';
        }

        // Check if start time is in the future
        if (startDateTime <= new Date()) {
            errors.startDate = 'Session must be scheduled for a future date/time';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle submit
    const handleSubmit = () => {
        if (!validateForm()) return;

        const sessionData: CreateKuppiSessionRequest = {
            title: formData.title,
            subject: formData.subject,
            description: formData.description || undefined,
            scheduledStartTime: `${formData.startDate}T${formData.startTime}:00`,
            scheduledEndTime: `${formData.endDate}T${formData.endTime}:00`,
            liveLink: formData.liveLink,
            meetingPlatform: formData.meetingPlatform || undefined,
        };

        dispatch(createSessionAsync(sessionData));
    };

    // Handle messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearKuppiSuccessMessage());
            // Redirect after success
            setTimeout(() => {
                router.push('/student/kuppi');
            }, 1500);
        }
    }, [error, successMessage, dispatch, router]);

    // If not a Kuppi student, show access denied
    if (!isKuppiStudent) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight={600}>Access Denied</Typography>
                    <Typography variant="body2">You need to be a Kuppi Student to create sessions. Apply to become a host first.</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.push('/student/kuppi/hosts')}>
                        Apply to Become a Host
                    </Button>
                </Alert>
            </Box>
        );
    }

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    sx={{ textTransform: 'none' }}
                >
                    Back
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Create Session</Typography>
                    <Typography variant="body2" color="text.secondary">Schedule a new Kuppi session</Typography>
                </Box>
            </Stack>

            {/* Form */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        {/* Title */}
                        <TextField
                            label="Session Title"
                            placeholder="e.g., Data Structures - Binary Trees"
                            fullWidth
                            required
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            error={!!formErrors.title}
                            helperText={formErrors.title || 'Max 200 characters'}
                        />

                        {/* Subject */}
                        <TextField
                            label="Subject"
                            placeholder="e.g., Data Structures"
                            fullWidth
                            required
                            select
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            error={!!formErrors.subject}
                            helperText={formErrors.subject}
                        >
                            {SUBJECT_SUGGESTIONS.map((subject) => (
                                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                            ))}
                        </TextField>

                        {/* Description */}
                        <TextField
                            label="Description"
                            placeholder="Describe what you'll cover in this session..."
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            helperText="Optional - Max 2000 characters"
                        />

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <CalendarTodayIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle2" fontWeight={600}>Schedule</Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        fullWidth
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        error={!!formErrors.startDate}
                                        helperText={formErrors.startDate}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Start Time"
                                        type="time"
                                        fullWidth
                                        required
                                        value={formData.startTime}
                                        onChange={(e) => handleChange('startTime', e.target.value)}
                                        error={!!formErrors.startTime}
                                        helperText={formErrors.startTime}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        fullWidth
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => handleChange('endDate', e.target.value)}
                                        error={!!formErrors.endDate}
                                        helperText={formErrors.endDate}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="End Time"
                                        type="time"
                                        fullWidth
                                        required
                                        value={formData.endTime}
                                        onChange={(e) => handleChange('endTime', e.target.value)}
                                        error={!!formErrors.endTime}
                                        helperText={formErrors.endTime}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <VideoCallIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle2" fontWeight={600}>Meeting Details</Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Meeting Platform"
                                        fullWidth
                                        select
                                        value={formData.meetingPlatform}
                                        onChange={(e) => handleChange('meetingPlatform', e.target.value)}
                                    >
                                        {MEETING_PLATFORMS.map((platform) => (
                                            <MenuItem key={platform} value={platform}>{platform}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Meeting Link"
                                        placeholder="https://meet.google.com/..."
                                        fullWidth
                                        required
                                        value={formData.liveLink}
                                        onChange={(e) => handleChange('liveLink', e.target.value)}
                                        error={!!formErrors.liveLink}
                                        helperText={formErrors.liveLink}
                                        slotProps={{
                                            input: {
                                                startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Actions */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                            <Button variant="outlined" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                onClick={handleSubmit}
                                disabled={isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Session'}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

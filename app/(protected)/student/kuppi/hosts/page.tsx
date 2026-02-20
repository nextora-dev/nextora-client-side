'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, TextField, MenuItem,
    Avatar, Chip, IconButton, Stack, Grid, alpha, useTheme, Button,
    Alert, Snackbar, CircularProgress, Stepper, Step, StepLabel, Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    submitApplicationAsync,
    fetchActiveApplication,
    cancelApplicationAsync,
    checkCanApplyAsync,
    checkIsKuppiStudentAsync,
    selectKuppiActiveApplication,
    selectKuppiCanApply,
    selectKuppiIsKuppiStudent,
    selectKuppiIsCreating,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    CreateKuppiApplicationRequest,
    ExperienceLevel,
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

// Subject suggestions
const SUBJECT_OPTIONS = [
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

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
    { value: 'BEGINNER', label: 'Beginner', description: 'For students new to the subject' },
    { value: 'INTERMEDIATE', label: 'Intermediate', description: 'For students with some knowledge' },
    { value: 'ADVANCED', label: 'Advanced', description: 'For students with strong foundation' },
];

const STEPS = ['Basic Info', 'Experience', 'Review'];

export default function HostApplicationPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Redux state
    const activeApplication = useAppSelector(selectKuppiActiveApplication);
    const canApply = useAppSelector(selectKuppiCanApply);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const isCreating = useAppSelector(selectKuppiIsCreating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Form state
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        motivation: '',
        relevantExperience: '',
        subjectsToTeach: [] as string[],
        preferredExperienceLevel: 'INTERMEDIATE' as ExperienceLevel,
        availability: '',
        currentGpa: '',
        currentSemester: '',
    });
    const [newSubject, setNewSubject] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Fetch application status on mount
    useEffect(() => {
        dispatch(checkCanApplyAsync());
        dispatch(checkIsKuppiStudentAsync());
        dispatch(fetchActiveApplication());
    }, [dispatch]);

    // Handle form change
    const handleChange = (field: string, value: string | string[] | ExperienceLevel) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Add subject
    const handleAddSubject = () => {
        if (newSubject && !formData.subjectsToTeach.includes(newSubject) && formData.subjectsToTeach.length < 10) {
            handleChange('subjectsToTeach', [...formData.subjectsToTeach, newSubject]);
            setNewSubject('');
        }
    };

    // Remove subject
    const handleRemoveSubject = (subject: string) => {
        handleChange('subjectsToTeach', formData.subjectsToTeach.filter(s => s !== subject));
    };

    // Validate step
    const validateStep = (): boolean => {
        const errors: Record<string, string> = {};

        if (activeStep === 0) {
            if (!formData.currentGpa) errors.currentGpa = 'GPA is required';
            else if (parseFloat(formData.currentGpa) < 0 || parseFloat(formData.currentGpa) > 4) {
                errors.currentGpa = 'GPA must be between 0 and 4';
            }
            if (!formData.currentSemester) errors.currentSemester = 'Current semester is required';
            if (formData.subjectsToTeach.length === 0) errors.subjectsToTeach = 'At least one subject is required';
        } else if (activeStep === 1) {
            if (!formData.motivation || formData.motivation.length < 50) {
                errors.motivation = 'Motivation must be at least 50 characters';
            }
            if (formData.motivation.length > 1000) {
                errors.motivation = 'Motivation must be less than 1000 characters';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep()) {
            setActiveStep(prev => prev + 1);
        }
    };

    // Handle previous step
    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // Handle submit
    const handleSubmit = () => {
        if (!validateStep()) return;

        const applicationData: CreateKuppiApplicationRequest = {
            motivation: formData.motivation,
            relevantExperience: formData.relevantExperience || undefined,
            subjectsToTeach: formData.subjectsToTeach,
            preferredExperienceLevel: formData.preferredExperienceLevel,
            availability: formData.availability || undefined,
            currentGpa: parseFloat(formData.currentGpa),
            currentSemester: formData.currentSemester,
        };

        dispatch(submitApplicationAsync(applicationData));
    };

    // Handle cancel application
    const handleCancelApplication = () => {
        if (activeApplication) {
            dispatch(cancelApplicationAsync(activeApplication.id));
        }
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
        }
    }, [error, successMessage, dispatch]);

    // If already a Kuppi student
    if (isKuppiStudent) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                <Alert severity="success" sx={{ borderRadius: 2 }} icon={<CheckCircleIcon />}>
                    <Typography variant="body1" fontWeight={600}>You're a Kuppi Host!</Typography>
                    <Typography variant="body2">You can now create sessions and upload notes.</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/student/kuppi/create')}>
                        Create a Session
                    </Button>
                </Alert>
            </Box>
        );
    }

    // If has active application
    if (activeApplication && !activeApplication.isFinalState) {
        const statusColors: Record<string, string> = {
            PENDING: '#F59E0B',
            UNDER_REVIEW: '#3B82F6',
        };
        const statusIcons: Record<string, React.ReactNode> = {
            PENDING: <HourglassEmptyIcon />,
            UNDER_REVIEW: <HourglassEmptyIcon />,
        };

        return (
            <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 700, mx: 'auto' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi')} sx={{ mb: 3, textTransform: 'none' }}>
                    Back to Sessions
                </Button>

                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(statusColors[activeApplication.status] || '#6B7280', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            color: statusColors[activeApplication.status] || '#6B7280',
                        }}>
                            {statusIcons[activeApplication.status] || <HourglassEmptyIcon sx={{ fontSize: 40 }} />}
                        </Box>

                        <Typography variant="h5" fontWeight={700} gutterBottom>Application {activeApplication.statusDisplayName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Your application was submitted on {new Date(activeApplication.submittedAt).toLocaleDateString()}. We'll notify you once it's reviewed.
                        </Typography>

                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), textAlign: 'left', mb: 3 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Current GPA</Typography>
                                    <Typography variant="body1" fontWeight={600}>{activeApplication.currentGpa.toFixed(2)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Semester</Typography>
                                    <Typography variant="body1">{activeApplication.currentSemester}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">Subjects</Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>
                                        {activeApplication.subjectsToTeach.map((subject, idx) => (
                                            <Chip key={idx} label={subject} size="small" />
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>

                        {activeApplication.canBeCancelled && (
                            <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancelApplication}>
                                Cancel Application
                            </Button>
                        )}
                    </CardContent>
                </MotionCard>
            </Box>
        );
    }

    // If cannot apply
    if (!canApply) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight={600}>Cannot Apply</Typography>
                    <Typography variant="body2">You are not eligible to apply at this time. This could be because you have a pending application or have already been approved/rejected.</Typography>
                </Alert>
            </Box>
        );
    }

    // Application form
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 800, mx: 'auto' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi')} sx={{ mb: 3, textTransform: 'none' }}>
                Back to Sessions
            </Button>

            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}>
                            <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>Become a Kuppi Host</Typography>
                        <Typography variant="body2" color="text.secondary">Share your knowledge and help fellow students succeed</Typography>
                    </Box>

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step Content */}
                    {activeStep === 0 && (
                        <Stack spacing={3}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Current GPA"
                                        type="number"
                                        fullWidth
                                        required
                                        value={formData.currentGpa}
                                        onChange={(e) => handleChange('currentGpa', e.target.value)}
                                        error={!!formErrors.currentGpa}
                                        helperText={formErrors.currentGpa || 'Enter your GPA (0.0 - 4.0)'}
                                        slotProps={{ htmlInput: { min: 0, max: 4, step: 0.01 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Current Semester"
                                        fullWidth
                                        required
                                        value={formData.currentSemester}
                                        onChange={(e) => handleChange('currentSemester', e.target.value)}
                                        error={!!formErrors.currentSemester}
                                        helperText={formErrors.currentSemester}
                                        placeholder="e.g., Year 3 Semester 1"
                                    />
                                </Grid>
                            </Grid>

                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Subjects to Teach *</Typography>
                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                    <TextField
                                        select
                                        size="small"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        sx={{ minWidth: 200 }}
                                        placeholder="Select a subject"
                                    >
                                        {SUBJECT_OPTIONS.filter(s => !formData.subjectsToTeach.includes(s)).map((subject) => (
                                            <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                                        ))}
                                    </TextField>
                                    <Button variant="outlined" onClick={handleAddSubject} disabled={!newSubject}>
                                        <AddIcon />
                                    </Button>
                                </Stack>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                    {formData.subjectsToTeach.map((subject) => (
                                        <Chip key={subject} label={subject} onDelete={() => handleRemoveSubject(subject)} />
                                    ))}
                                </Stack>
                                {formErrors.subjectsToTeach && (
                                    <Typography variant="caption" color="error">{formErrors.subjectsToTeach}</Typography>
                                )}
                            </Box>

                            <TextField
                                label="Preferred Experience Level"
                                select
                                fullWidth
                                value={formData.preferredExperienceLevel}
                                onChange={(e) => handleChange('preferredExperienceLevel', e.target.value as ExperienceLevel)}
                            >
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <MenuItem key={level.value} value={level.value}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{level.label}</Typography>
                                            <Typography variant="caption" color="text.secondary">{level.description}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    )}

                    {activeStep === 1 && (
                        <Stack spacing={3}>
                            <TextField
                                label="Motivation"
                                multiline
                                rows={4}
                                fullWidth
                                required
                                value={formData.motivation}
                                onChange={(e) => handleChange('motivation', e.target.value)}
                                error={!!formErrors.motivation}
                                helperText={formErrors.motivation || `${formData.motivation.length}/1000 characters (min 50)`}
                                placeholder="Why do you want to become a Kuppi host? What motivates you to help other students?"
                            />

                            <TextField
                                label="Relevant Experience"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.relevantExperience}
                                onChange={(e) => handleChange('relevantExperience', e.target.value)}
                                helperText="Optional - Any tutoring, teaching, or mentoring experience"
                                placeholder="e.g., Tutored junior students, conducted study groups..."
                            />

                            <TextField
                                label="Availability"
                                multiline
                                rows={2}
                                fullWidth
                                value={formData.availability}
                                onChange={(e) => handleChange('availability', e.target.value)}
                                helperText="Optional - When are you typically available for sessions?"
                                placeholder="e.g., Weekday evenings 6-9 PM, Weekend mornings"
                            />
                        </Stack>
                    )}

                    {activeStep === 2 && (
                        <Box>
                            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                Please review your application before submitting. You can go back to make changes.
                            </Alert>

                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Current GPA</Typography>
                                        <Typography variant="body1" fontWeight={600}>{formData.currentGpa}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Semester</Typography>
                                        <Typography variant="body1">{formData.currentSemester}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Subjects</Typography>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>
                                            {formData.subjectsToTeach.map((subject) => (
                                                <Chip key={subject} label={subject} size="small" />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Experience Level</Typography>
                                        <Typography variant="body1">{formData.preferredExperienceLevel}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Motivation</Typography>
                                        <Typography variant="body2">{formData.motivation}</Typography>
                                    </Grid>
                                    {formData.relevantExperience && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="caption" color="text.secondary">Experience</Typography>
                                            <Typography variant="body2">{formData.relevantExperience}</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Box>
                    )}

                    {/* Actions */}
                    <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
                        <Button onClick={activeStep === 0 ? () => router.push('/student/kuppi') : handleBack} disabled={isCreating}>
                            {activeStep === 0 ? 'Cancel' : 'Back'}
                        </Button>
                        {activeStep < STEPS.length - 1 ? (
                            <Button variant="contained" onClick={handleNext}>Next</Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                onClick={handleSubmit}
                                disabled={isCreating}
                            >
                                {isCreating ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        )}
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

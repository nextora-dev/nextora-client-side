'use client';

import React from 'react';
import {
    Box, Typography, Card, CardContent, Button, TextField, Alert,
    Stepper, Step, StepLabel, alpha, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';

import { useHostApplication } from '@/hooks/useKuppi';
import { HOST_APPLICATION_STEPS, MIN_HOST_GPA } from '@/lib/constants/kuppi.constants';
import { isValidHostGpa } from '@/components/features/kuppi/kuppi.utils';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

interface HostApplicationFormProps {
    onBack: () => void;
}

export default function HostApplicationForm({ onBack }: HostApplicationFormProps) {
    const theme = useTheme();
    const {
        formData,
        activeStep,
        resultFile,
        setResultFile,
        updateField,
        nextStep,
        prevStep,
        isFormValid,
    } = useHostApplication();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setResultFile(file);
    };

    const handleSubmit = () => {
        // In real app, this would call an API
        console.log('Submitting application:', { ...formData, resultFile });
        alert('Application submitted successfully!');
        onBack();
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}
            >
                Back to Sessions
            </Button>

            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <MotionBox
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #6366F1 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}>
                                <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                        </MotionBox>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                            Become a Kuppi Host
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Share your knowledge and help fellow students succeed
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {HOST_APPLICATION_STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step Content */}
                    {activeStep === 0 && (
                        <AcademicInfoStep
                            formData={formData}
                            resultFile={resultFile}
                            onUpdateField={updateField}
                            onFileUpload={handleFileUpload}
                        />
                    )}

                    {activeStep === 1 && (
                        <SessionDetailsStep
                            formData={formData}
                            onUpdateField={updateField}
                        />
                    )}

                    {activeStep === 2 && (
                        <ReviewStep formData={formData} resultFile={resultFile} />
                    )}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                        {activeStep > 0 && (
                            <Button
                                variant="outlined"
                                onClick={prevStep}
                                sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Back
                            </Button>
                        )}
                        {activeStep < 2 ? (
                            <Button
                                variant="contained"
                                onClick={nextStep}
                                sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                color="success"
                                sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Submit Application
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </MotionCard>
        </Box>
    );
}

// Step 1: Academic Info
function AcademicInfoStep({
    formData,
    resultFile,
    onUpdateField,
    onFileUpload
}: {
    formData: { gpa: string; subject: string; topic: string; experience: string; motivation: string };
    resultFile: File | null;
    onUpdateField: (field: string, value: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const theme = useTheme();
    const gpaValid = formData.gpa ? isValidHostGpa(formData.gpa) : true;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
                To become a host, you need a minimum GPA of {MIN_HOST_GPA}. Please upload your academic results for verification.
            </Alert>

            <TextField
                label="Your GPA"
                type="number"
                value={formData.gpa}
                onChange={(e) => onUpdateField('gpa', e.target.value)}
                error={!gpaValid}
                helperText={!gpaValid ? `Minimum GPA requirement is ${MIN_HOST_GPA}` : ''}
                inputProps={{ step: 0.01, min: 0, max: 4 }}
                fullWidth
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    },
                }}
            />

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>Upload Academic Results</Typography>
                <Box
                    component="label"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                        border: '2px dashed',
                        borderColor: resultFile ? 'success.main' : 'divider',
                        borderRadius: 3,
                        cursor: 'pointer',
                        bgcolor: resultFile ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                    }}
                >
                    <input type="file" accept=".pdf,.jpg,.png" hidden onChange={onFileUpload} />
                    {resultFile ? (
                        <>
                            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="body2" color="success.main" fontWeight={600}>{resultFile.name}</Typography>
                        </>
                    ) : (
                        <>
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Click to upload PDF or image</Typography>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// Step 2: Session Details
function SessionDetailsStep({
    formData,
    onUpdateField
}: {
    formData: { gpa: string; subject: string; topic: string; experience: string; motivation: string };
    onUpdateField: (field: string, value: string) => void;
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                label="Subject You Want to Teach"
                value={formData.subject}
                onChange={(e) => onUpdateField('subject', e.target.value)}
                placeholder="e.g., Data Structures & Algorithms"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
                label="Specific Topics"
                value={formData.topic}
                onChange={(e) => onUpdateField('topic', e.target.value)}
                placeholder="e.g., Trees, Graphs, Dynamic Programming"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
                label="Teaching Experience"
                value={formData.experience}
                onChange={(e) => onUpdateField('experience', e.target.value)}
                placeholder="Describe any tutoring or teaching experience..."
                multiline
                rows={3}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
                label="Why do you want to become a host?"
                value={formData.motivation}
                onChange={(e) => onUpdateField('motivation', e.target.value)}
                placeholder="Share your motivation for helping other students..."
                multiline
                rows={3}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
        </Box>
    );
}

// Step 3: Review
function ReviewStep({
    formData,
    resultFile
}: {
    formData: { gpa: string; subject: string; topic: string; experience: string; motivation: string };
    resultFile: File | null;
}) {
    const reviewItems = [
        { label: 'GPA', value: formData.gpa },
        { label: 'Results Uploaded', value: resultFile ? 'Yes' : 'No' },
        { label: 'Subject', value: formData.subject },
        { label: 'Topics', value: formData.topic },
        { label: 'Experience', value: formData.experience || 'Not provided' },
    ];

    return (
        <Box>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Please review your application before submitting
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviewItems.map((item, i) => (
                    <Box key={i} sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}>
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ maxWidth: '60%', textAlign: 'right', color: 'text.primary' }}>
                            {item.value || '-'}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

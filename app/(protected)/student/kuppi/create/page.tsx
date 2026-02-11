'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, Button, TextField, Stack,
    MenuItem, Chip, alpha, useTheme, Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import { KUPPI_SUBJECTS } from '@/lib/constants/kuppi.constants';

const MotionCard = motion.create(Card);

export default function CreateKuppiSessionPage() {
    const router = useRouter();
    const theme = useTheme();
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        venue: '',
        maxParticipants: '15',
        isOnline: false,
        meetingLink: '',
    });
    const [topics, setTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTopic = () => {
        if (newTopic.trim() && !topics.includes(newTopic.trim())) {
            setTopics([...topics, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const handleRemoveTopic = (topic: string) => {
        setTopics(topics.filter(t => t !== topic));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        router.push('/student/kuppi');
    };

    const isFormValid = formData.title && formData.subject && formData.description && formData.date && formData.time && formData.venue && topics.length > 0;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi')} sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}>Back to Sessions</Button>

            <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #6366F1 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                            <AutoStoriesIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Create Kuppi Session</Typography>
                        <Typography variant="body2" color="text.secondary">Share your knowledge with fellow students</Typography>
                    </Box>

                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        Fill in the details below to create a new Kuppi session. Make sure to provide accurate information.
                    </Alert>

                    {/* Form */}
                    <Stack spacing={3}>
                        <TextField label="Session Title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="e.g., Data Structures: Trees & Graphs" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                        <TextField select label="Subject" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                            {KUPPI_SUBJECTS.filter(s => s !== 'All Subjects').map((subject) => (
                                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                            ))}
                        </TextField>

                        <TextField label="Description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe what participants will learn..." multiline rows={3} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                        {/* Topics */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Topics Covered</Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <TextField size="small" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Add a topic" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())} sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <Button variant="outlined" onClick={handleAddTopic} sx={{ borderRadius: 2 }}><AddIcon /></Button>
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {topics.map((topic) => (
                                    <Chip key={topic} label={topic} onDelete={() => handleRemoveTopic(topic)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                                ))}
                            </Stack>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField type="date" label="Date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            <TextField type="time" label="Time" value={formData.time} onChange={(e) => handleChange('time', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField select label="Duration" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                <MenuItem value="30">30 minutes</MenuItem>
                                <MenuItem value="60">1 hour</MenuItem>
                                <MenuItem value="90">1.5 hours</MenuItem>
                                <MenuItem value="120">2 hours</MenuItem>
                            </TextField>
                            <TextField type="number" label="Max Participants" value={formData.maxParticipants} onChange={(e) => handleChange('maxParticipants', e.target.value)} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Stack>

                        <TextField label="Venue / Location" value={formData.venue} onChange={(e) => handleChange('venue', e.target.value)} placeholder="e.g., Study Room A - Library" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                        {/* Submit */}
                        <Button variant="contained" size="large" onClick={handleSubmit} disabled={!isFormValid || isSubmitting} sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '1rem' }}>
                            {isSubmitting ? 'Creating Session...' : 'Create Session'}
                        </Button>
                    </Stack>
                </CardContent>
            </MotionCard>
        </Box>
    );
}


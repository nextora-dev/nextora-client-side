'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Stack, Typography, alpha, useTheme, IconButton,
    Rating, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { SubmitFeedbackRequest } from '@/features/meeting/types';

interface FeedbackDialogProps {
    open: boolean;
    onClose: () => void;
    isSubmitting: boolean;
    onSubmit: (data: SubmitFeedbackRequest) => void;
}

export default function FeedbackDialog({ open, onClose, isSubmitting, onSubmit }: FeedbackDialogProps) {
    const theme = useTheme();

    const [rating, setRating] = useState<number | null>(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (open) {
            setRating(null);
            setFeedback('');
        }
    }, [open]);

    const isValid = rating !== null && rating >= 1 && feedback.trim();

    const handleSubmit = () => {
        if (!isValid || rating === null) return;
        onSubmit({ rating, feedback: feedback.trim() });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>
                    Meeting Feedback
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            How was your meeting experience?
                        </Typography>
                        <Rating
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue)}
                            size="large"
                            sx={{
                                '& .MuiRating-iconFilled': { color: theme.palette.warning.main },
                                '& .MuiRating-iconHover': { color: theme.palette.warning.dark },
                            }}
                        />
                        {rating !== null && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {rating}/5
                            </Typography>
                        )}
                    </Box>
                    <TextField
                        label="Feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required fullWidth multiline rows={4} size="small"
                        placeholder="Share your thoughts about the meeting..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: theme.palette.warning.main, '&:hover': { bgcolor: theme.palette.warning.dark } }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

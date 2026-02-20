/**
 * @fileoverview Review Form Component
 * @description Form for creating and editing session reviews
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Rating,
    Button,
    IconButton,
    alpha,
    useTheme,
    Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { KuppiReviewResponse, CreateKuppiReviewRequest, UpdateKuppiReviewRequest } from '@/features/kuppi';

interface ReviewFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateKuppiReviewRequest | UpdateKuppiReviewRequest) => void;
    review?: KuppiReviewResponse | null;
    sessionId?: number;
    sessionTitle?: string;
    isLoading?: boolean;
}

const ratingLabels: { [key: number]: string } = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
};

export const ReviewForm: React.FC<ReviewFormProps> = ({
    open,
    onClose,
    onSubmit,
    review,
    sessionId,
    sessionTitle,
    isLoading = false,
}) => {
    const theme = useTheme();
    const isEditing = Boolean(review);

    const [rating, setRating] = useState<number | null>(5);
    const [hoverRating, setHoverRating] = useState<number>(-1);
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

    useEffect(() => {
        if (review) {
            setRating(review.rating);
            setComment(review.comment);
        } else {
            setRating(5);
            setComment('');
        }
        setErrors({});
    }, [review, open]);

    const validate = (): boolean => {
        const newErrors: { rating?: string; comment?: string } = {};
        if (!rating || rating < 1 || rating > 5) {
            newErrors.rating = 'Please select a rating';
        }
        if (!comment.trim()) {
            newErrors.comment = 'Please write a comment';
        } else if (comment.trim().length < 10) {
            newErrors.comment = 'Comment must be at least 10 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        if (isEditing) {
            onSubmit({ rating: rating!, comment: comment.trim() });
        } else if (sessionId) {
            onSubmit({ sessionId, rating: rating!, comment: comment.trim() });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                    {isEditing ? 'Edit Review' : 'Write a Review'}
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {sessionTitle && (
                    <Box sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, p: 2, mb: 3 }}>
                        <Typography variant="caption" color="text.secondary">Session</Typography>
                        <Typography variant="subtitle1" fontWeight={600}>{sessionTitle}</Typography>
                    </Box>
                )}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Your Rating *</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating
                            value={rating}
                            onChange={(_, v) => setRating(v)}
                            onChangeActive={(_, h) => setHoverRating(h)}
                            size="large"
                            emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                        />
                        <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                            {ratingLabels[hoverRating !== -1 ? hoverRating : rating || 0] || ''}
                        </Typography>
                    </Box>
                    {errors.rating && <Typography variant="caption" color="error">{errors.rating}</Typography>}
                </Box>
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Your Review *</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        error={Boolean(errors.comment)}
                        helperText={errors.comment || `${comment.length}/1000`}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button fullWidth variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button fullWidth variant="contained" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewForm;


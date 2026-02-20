/**
 * @fileoverview Review Card Component
 * @description Displays a single review with rating, comment, and tutor response
 */

'use client';

import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Rating,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Stack,
    Collapse,
    TextField,
    Button,
    alpha,
    useTheme,
    Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { KuppiReviewResponse } from '@/features/kuppi';

const MotionCard = motion.create(Card);

interface ReviewCardProps {
    review: KuppiReviewResponse;
    currentUserId?: number;
    isTutor?: boolean;
    isAdmin?: boolean;
    onEdit?: (review: KuppiReviewResponse) => void;
    onDelete?: (reviewId: number) => void;
    onAddResponse?: (reviewId: number, responseText: string) => void;
    isUpdating?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    currentUserId,
    isTutor = false,
    isAdmin = false,
    onEdit,
    onDelete,
    onAddResponse,
    isUpdating = false,
}) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showResponseForm, setShowResponseForm] = useState(false);
    const [responseText, setResponseText] = useState('');

    const isOwner = currentUserId === review.reviewerId;
    const isTutorOfSession = currentUserId === review.tutorId;
    const canEdit = isOwner && !review.tutorResponse;
    const canDelete = isOwner || isAdmin;
    const canRespond = (isTutor || isTutorOfSession) && !review.tutorResponse;
    const showMenu = canEdit || canDelete || canRespond;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit?.(review);
    };

    const handleDelete = () => {
        handleMenuClose();
        onDelete?.(review.id);
    };

    const handleShowResponseForm = () => {
        handleMenuClose();
        setShowResponseForm(true);
    };

    const handleSubmitResponse = () => {
        if (responseText.trim()) {
            onAddResponse?.(review.id, responseText.trim());
            setShowResponseForm(false);
            setResponseText('');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }}
                        >
                            <PersonIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {review.reviewerName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Typography variant="body2" color="text.secondary">
                                    ({review.rating}/5)
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {showMenu && (
                        <>
                            <IconButton onClick={handleMenuOpen} size="small">
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                {canEdit && (
                                    <MenuItem onClick={handleEdit}>
                                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                        Edit Review
                                    </MenuItem>
                                )}
                                {canRespond && (
                                    <MenuItem onClick={handleShowResponseForm}>
                                        <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
                                        Add Response
                                    </MenuItem>
                                )}
                                {canDelete && (
                                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                        Delete
                                    </MenuItem>
                                )}
                            </Menu>
                        </>
                    )}
                </Box>

                {/* Session Info */}
                <Chip
                    icon={<SchoolIcon fontSize="small" />}
                    label={review.sessionTitle}
                    size="small"
                    sx={{
                        mb: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                    }}
                />

                {/* Review Comment */}
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                    {review.comment}
                </Typography>

                {/* Timestamp */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {formatDate(review.createdAt)}
                        </Typography>
                    </Box>
                    {review.updatedAt !== review.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                            (edited)
                        </Typography>
                    )}
                </Stack>

                {/* Tutor Response */}
                {review.tutorResponse && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderRadius: 2,
                                p: 2,
                                borderLeft: `3px solid ${theme.palette.primary.main}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        bgcolor: theme.palette.primary.main,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    T
                                </Avatar>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {review.tutorName}
                                </Typography>
                                <Chip label="Tutor" size="small" color="primary" sx={{ height: 20 }} />
                            </Box>
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                {review.tutorResponse}
                            </Typography>
                            {review.tutorResponseAt && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Responded on {formatDate(review.tutorResponseAt)}
                                </Typography>
                            )}
                        </Box>
                    </>
                )}

                {/* Response Form */}
                <Collapse in={showResponseForm}>
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Write your response..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowResponseForm(false);
                                    setResponseText('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmitResponse}
                                disabled={!responseText.trim() || isUpdating}
                            >
                                {isUpdating ? 'Submitting...' : 'Submit Response'}
                            </Button>
                        </Stack>
                    </Box>
                </Collapse>
            </CardContent>
        </MotionCard>
    );
};

export default ReviewCard;


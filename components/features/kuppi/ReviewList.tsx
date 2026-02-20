/**
 * @fileoverview Review List Component
 * @description Displays a list of reviews with pagination
 */

'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Skeleton,
    Pagination,
    alpha,
    useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { ReviewCard } from './ReviewCard';
import { KuppiReviewResponse } from '@/features/kuppi';

const MotionBox = motion.create(Box);

interface ReviewListProps {
    reviews: KuppiReviewResponse[];
    isLoading?: boolean;
    currentUserId?: number;
    isTutor?: boolean;
    isAdmin?: boolean;
    onEdit?: (review: KuppiReviewResponse) => void;
    onDelete?: (reviewId: number) => void;
    onAddResponse?: (reviewId: number, responseText: string) => void;
    isUpdating?: boolean;
    // Pagination
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    isLoading = false,
    currentUserId,
    isTutor = false,
    isAdmin = false,
    onEdit,
    onDelete,
    onAddResponse,
    isUpdating = false,
    page = 1,
    totalPages = 1,
    onPageChange,
    emptyMessage = 'No reviews yet',
}) => {
    const theme = useTheme();

    if (isLoading) {
        return (
            <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Skeleton
                        key={i}
                        variant="rounded"
                        height={180}
                        sx={{ borderRadius: 3 }}
                    />
                ))}
            </Stack>
        );
    }

    if (reviews.length === 0) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    borderRadius: 3,
                    border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                }}
            >
                <RateReviewIcon
                    sx={{
                        fontSize: 64,
                        color: alpha(theme.palette.text.secondary, 0.3),
                        mb: 2,
                    }}
                />
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                    {emptyMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Be the first to share your experience!
                </Typography>
            </MotionBox>
        );
    }

    return (
        <Box>
            <AnimatePresence mode="popLayout">
                <Stack spacing={2}>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ReviewCard
                                review={review}
                                currentUserId={currentUserId}
                                isTutor={isTutor}
                                isAdmin={isAdmin}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddResponse={onAddResponse}
                                isUpdating={isUpdating}
                            />
                        </motion.div>
                    ))}
                </Stack>
            </AnimatePresence>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, newPage) => onPageChange?.(newPage)}
                        color="primary"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default ReviewList;


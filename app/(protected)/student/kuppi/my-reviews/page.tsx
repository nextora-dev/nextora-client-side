'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    alpha,
    useTheme,
    Grid,
    Card,
    CardContent,
    Stack,
    Snackbar,
    Alert,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplyIcon from '@mui/icons-material/Reply';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchMyHostedReviews,
    addTutorResponseAsync,
    selectKuppiMyHostedReviews,
    selectKuppiTotalReviews,
    selectKuppiIsReviewsLoading,
    selectKuppiIsReviewUpdating,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    KuppiReviewResponse,
} from '@/features/kuppi';
import { ReviewList } from '@/components/features/kuppi';
import { useAuth } from '@/hooks';

const MotionBox = motion.create(Box);

export default function TutorReviewsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // Redux state
    const myHostedReviews = useAppSelector(selectKuppiMyHostedReviews);
    const totalReviews = useAppSelector(selectKuppiTotalReviews);
    const isLoading = useAppSelector(selectKuppiIsReviewsLoading);
    const isUpdating = useAppSelector(selectKuppiIsReviewUpdating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const totalPages = Math.ceil(totalReviews / pageSize);

    // Fetch reviews on mount
    useEffect(() => {
        dispatch(fetchMyHostedReviews({ page, size: pageSize }));
    }, [dispatch, page]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchMyHostedReviews({ page, size: pageSize }));
    }, [dispatch, page]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage - 1);
    };

    const handleAddResponse = async (reviewId: number, responseText: string) => {
        await dispatch(addTutorResponseAsync({ reviewId, data: { responseText } }));
        handleRefresh();
    };

    // Calculate stats
    const averageRating = myHostedReviews.length > 0
        ? (myHostedReviews.reduce((acc, r) => acc + r.rating, 0) / myHostedReviews.length).toFixed(1)
        : '0.0';
    const respondedCount = myHostedReviews.filter((r) => r.tutorResponse).length;
    const pendingResponses = myHostedReviews.filter((r) => !r.tutorResponse).length;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ mb: 4 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Reviews for My Sessions
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            View and respond to reviews on your hosted sessions
                        </Typography>
                    </Box>
                </Box>
            </MotionBox>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <RateReviewIcon color="primary" />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>{totalReviews}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Reviews</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                                    <StarIcon sx={{ color: theme.palette.warning.main }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>{averageRating}</Typography>
                                    <Typography variant="body2" color="text.secondary">Average Rating</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                                    <ReplyIcon sx={{ color: theme.palette.info.main }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>{pendingResponses}</Typography>
                                    <Typography variant="body2" color="text.secondary">Pending Responses</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleRefresh}
                                fullWidth
                                disabled={isLoading}
                            >
                                Refresh
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Reviews List */}
            <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Session Reviews
                </Typography>
                <ReviewList
                    reviews={myHostedReviews}
                    isLoading={isLoading}
                    currentUserId={user?.id ? Number(user.id) : undefined}
                    isTutor={true}
                    onAddResponse={handleAddResponse}
                    isUpdating={isUpdating}
                    page={page + 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    emptyMessage="No reviews on your sessions yet"
                />
            </Card>

            {/* Snackbars */}
            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={4000}
                onClose={() => dispatch(clearKuppiSuccessMessage())}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => dispatch(clearKuppiSuccessMessage())}>
                    {successMessage}
                </Alert>
            </Snackbar>
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={4000}
                onClose={() => dispatch(clearKuppiError())}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={() => dispatch(clearKuppiError())}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}


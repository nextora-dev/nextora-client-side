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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchMyReviews,
    updateReviewAsync,
    deleteReviewAsync,
    selectKuppiMyReviews,
    selectKuppiTotalReviews,
    selectKuppiIsReviewsLoading,
    selectKuppiIsReviewUpdating,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    KuppiReviewResponse,
    CreateKuppiReviewRequest,
    UpdateKuppiReviewRequest,
} from '@/features/kuppi';
import { ReviewList, ReviewForm } from '@/components/features/kuppi';
import { useAuth } from '@/hooks';

const MotionBox = motion.create(Box);

export default function StudentReviewsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // Redux state
    const myReviews = useAppSelector(selectKuppiMyReviews);
    const totalReviews = useAppSelector(selectKuppiTotalReviews);
    const isLoading = useAppSelector(selectKuppiIsReviewsLoading);
    const isUpdating = useAppSelector(selectKuppiIsReviewUpdating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [page, setPage] = useState(0);
    const [editingReview, setEditingReview] = useState<KuppiReviewResponse | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

    const pageSize = 10;
    const totalPages = Math.ceil(totalReviews / pageSize);

    // Fetch reviews on mount
    useEffect(() => {
        dispatch(fetchMyReviews({ page, size: pageSize }));
    }, [dispatch, page]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchMyReviews({ page, size: pageSize }));
    }, [dispatch, page]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage - 1);
    };

    const handleEditReview = (review: KuppiReviewResponse) => {
        setEditingReview(review);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (reviewId: number) => {
        setReviewToDelete(reviewId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (reviewToDelete) {
            await dispatch(deleteReviewAsync(reviewToDelete));
            setDeleteConfirmOpen(false);
            setReviewToDelete(null);
            handleRefresh();
        }
    };

    const handleFormSubmit = async (data: CreateKuppiReviewRequest | UpdateKuppiReviewRequest) => {
        if (editingReview) {
            await dispatch(updateReviewAsync({ reviewId: editingReview.id, data: data as UpdateKuppiReviewRequest }));
        }
        setIsFormOpen(false);
        setEditingReview(null);
        handleRefresh();
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingReview(null);
    };

    // Calculate stats
    const averageRating = myReviews.length > 0
        ? (myReviews.reduce((acc, r) => acc + r.rating, 0) / myReviews.length).toFixed(1)
        : '0.0';

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
                            My Reviews
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your session reviews
                        </Typography>
                    </Box>
                </Box>
            </MotionBox>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    }}
                                >
                                    <RateReviewIcon color="primary" />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {totalReviews}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Reviews
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    }}
                                >
                                    <StarIcon sx={{ color: theme.palette.warning.main }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {averageRating}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Average Rating Given
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleRefresh}
                                fullWidth
                                disabled={isLoading}
                            >
                                Refresh Reviews
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Reviews List */}
            <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Your Reviews
                </Typography>
                <ReviewList
                    reviews={myReviews}
                    isLoading={isLoading}
                    currentUserId={user?.id ? Number(user.id) : undefined}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteClick}
                    isUpdating={isUpdating}
                    page={page + 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    emptyMessage="You haven't written any reviews yet"
                />
            </Card>

            {/* Edit Review Form */}
            <ReviewForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                review={editingReview}
                sessionTitle={editingReview?.sessionTitle}
                isLoading={isUpdating}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Review</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this review? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbars */}
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


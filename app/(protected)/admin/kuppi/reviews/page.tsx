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
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Avatar,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Rating,
    Tooltip,
    Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    adminFetchAllReviews,
    adminDeleteReviewAsync,
    selectKuppiReviews,
    selectKuppiTotalReviews,
    selectKuppiIsReviewsLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    KuppiReviewResponse,
} from '@/features/kuppi';

const MotionBox = motion.create(Box);

export default function AdminReviewsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Redux state
    const reviews = useAppSelector(selectKuppiReviews);
    const totalReviews = useAppSelector(selectKuppiTotalReviews);
    const isLoading = useAppSelector(selectKuppiIsReviewsLoading);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReview, setSelectedReview] = useState<KuppiReviewResponse | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuReviewId, setMenuReviewId] = useState<number | null>(null);

    // Fetch reviews
    useEffect(() => {
        dispatch(adminFetchAllReviews({ page, size: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    const handleRefresh = useCallback(() => {
        dispatch(adminFetchAllReviews({ page, size: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, reviewId: number) => {
        setAnchorEl(event.currentTarget);
        setMenuReviewId(reviewId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuReviewId(null);
    };

    const handleViewReview = (review: KuppiReviewResponse) => {
        setSelectedReview(review);
        setViewDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteClick = (reviewId: number) => {
        setReviewToDelete(reviewId);
        setDeleteConfirmOpen(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        if (reviewToDelete) {
            await dispatch(adminDeleteReviewAsync(reviewToDelete));
            setDeleteConfirmOpen(false);
            setReviewToDelete(null);
            handleRefresh();
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Filter reviews by search
    const filteredReviews = searchQuery
        ? reviews.filter(
              (r) =>
                  r.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : reviews;

    // Calculate stats
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';
    const withResponses = reviews.filter((r) => r.tutorResponse).length;

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
                            Review Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage all Kuppi session reviews
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
                            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                                    <PersonIcon sx={{ color: theme.palette.success.main }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>{withResponses}</Typography>
                                    <Typography variant="body2" color="text.secondary">With Responses</Typography>
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

            {/* Search */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search by reviewer, tutor, or session..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card sx={{ borderRadius: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Reviewer</TableCell>
                                <TableCell>Session</TableCell>
                                <TableCell>Tutor</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Response</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReviews.map((review) => (
                                <TableRow key={review.id} hover>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                                <PersonIcon fontSize="small" color="primary" />
                                            </Avatar>
                                            <Typography variant="body2">{review.reviewerName}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={review.sessionTitle}>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                {review.sessionTitle}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{review.tutorName}</TableCell>
                                    <TableCell>
                                        <Rating value={review.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={review.tutorResponse ? 'Yes' : 'No'}
                                            size="small"
                                            color={review.tutorResponse ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuOpen(e, review.id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && menuReviewId === review.id}
                                            onClose={handleMenuClose}
                                        >
                                            <MenuItem onClick={() => handleViewReview(review)}>
                                                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View
                                            </MenuItem>
                                            <MenuItem onClick={() => handleDeleteClick(review.id)} sx={{ color: 'error.main' }}>
                                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                                            </MenuItem>
                                        </Menu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredReviews.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <RateReviewIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No reviews found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalReviews}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Card>

            {/* View Review Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Review Details</DialogTitle>
                <DialogContent dividers>
                    {selectedReview && (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Session</Typography>
                                <Typography variant="subtitle1" fontWeight={600}>{selectedReview.sessionTitle}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Reviewer</Typography>
                                <Typography>{selectedReview.reviewerName}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Tutor</Typography>
                                <Typography>{selectedReview.tutorName}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Rating</Typography>
                                <Rating value={selectedReview.rating} readOnly />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Comment</Typography>
                                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                    <Typography>{selectedReview.comment}</Typography>
                                </Paper>
                            </Box>
                            {selectedReview.tutorResponse && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tutor Response</Typography>
                                    <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderLeft: `3px solid ${theme.palette.primary.main}` }}>
                                        <Typography>{selectedReview.tutorResponse}</Typography>
                                    </Paper>
                                </Box>
                            )}
                            <Box>
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                                <Typography>{formatDate(selectedReview.createdAt)}</Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Review</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this review? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbars */}
            <Snackbar open={Boolean(successMessage)} autoHideDuration={4000} onClose={() => dispatch(clearKuppiSuccessMessage())} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" onClose={() => dispatch(clearKuppiSuccessMessage())}>{successMessage}</Alert>
            </Snackbar>
            <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => dispatch(clearKuppiError())} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="error" onClose={() => dispatch(clearKuppiError())}>{error}</Alert>
            </Snackbar>
        </Box>
    );
}


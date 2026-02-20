'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Stack,
    Button,
    TextField,
    IconButton,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    alpha,
    useTheme,
    Divider,
    useMediaQuery,
    Tabs,
    Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    adminFetchApplications,
    adminFetchApplicationById,
    adminFetchApplicationStats,
    adminApproveApplicationAsync,
    adminRejectApplicationAsync,
    setKuppiCurrentPage,
    setKuppiPageSize,
    clearKuppiSelectedApplication,
    clearKuppiError,
    clearKuppiSuccessMessage,
    selectKuppiAllApplications,
    selectKuppiTotalApplications,
    selectKuppiApplicationStats,
    selectKuppiSelectedApplication,
    selectKuppiCurrentPage,
    selectKuppiPageSize,
    selectKuppiIsApplicationLoading,
    selectKuppiIsLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    selectKuppiIsCreating,
    selectKuppiIsUpdating,
    selectKuppiIsDeleting,
    KuppiApplicationResponse,
    ApplicationStatus,
    ReviewKuppiApplicationRequest,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Status colors
const STATUS_COLORS: Record<ApplicationStatus, string> = {
    PENDING: '#F59E0B',
    UNDER_REVIEW: '#3B82F6',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280',
};

// Status icons
const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
        case 'PENDING': return <PendingIcon fontSize="small" />;
        case 'UNDER_REVIEW': return <HourglassEmptyIcon fontSize="small" />;
        case 'APPROVED': return <CheckCircleIcon fontSize="small" />;
        case 'REJECTED': return <CancelIcon fontSize="small" />;
        case 'CANCELLED': return <CancelIcon fontSize="small" />;
        default: return undefined;
    }
};

// Experience level colors
const EXPERIENCE_COLORS: Record<string, string> = {
    BEGINNER: '#10B981',
    INTERMEDIATE: '#3B82F6',
    ADVANCED: '#8B5CF6',
};

export default function SuperAdminKuppiPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Selectors
    const applications = useAppSelector(selectKuppiAllApplications);
    const totalApplications = useAppSelector(selectKuppiTotalApplications);
    const stats = useAppSelector(selectKuppiApplicationStats);
    const selectedApplication = useAppSelector(selectKuppiSelectedApplication);
    const page = useAppSelector(selectKuppiCurrentPage);
    const pageSize = useAppSelector(selectKuppiPageSize);
    const isLoading = useAppSelector(selectKuppiIsLoading);
    const isApplicationLoading = useAppSelector(selectKuppiIsApplicationLoading);
    const isApproving = useAppSelector(selectKuppiIsCreating);
    const isRejecting = useAppSelector(selectKuppiIsUpdating);
    const isDeleting = useAppSelector(selectKuppiIsDeleting);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
    const [activeTab, setActiveTab] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedApp, setSelectedApp] = useState<KuppiApplicationResponse | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
    const [revokeRoleDialogOpen, setRevokeRoleDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [revokeReason, setRevokeReason] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch on mount
    useEffect(() => {
        dispatch(adminFetchApplications({ page, size: pageSize }));
        dispatch(adminFetchApplicationStats());
    }, [dispatch, page, pageSize]);

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        const statuses: (ApplicationStatus | '')[] = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
        const status = statuses[newValue];
        setStatusFilter(status);
        dispatch(adminFetchApplications({ page: 0, size: pageSize, status: status || undefined }));
        dispatch(setKuppiCurrentPage(0));
    };

    // Handle refresh
    const handleRefresh = useCallback(() => {
        dispatch(adminFetchApplications({ page, size: pageSize, status: statusFilter || undefined }));
        dispatch(adminFetchApplicationStats());
    }, [dispatch, page, pageSize, statusFilter]);

    // Handle menu
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: KuppiApplicationResponse) => {
        setAnchorEl(event.currentTarget);
        setSelectedApp(app);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle view
    const handleView = () => {
        handleMenuClose();
        if (selectedApp) {
            dispatch(adminFetchApplicationById(selectedApp.id));
            setViewDialogOpen(true);
        }
    };

    // Handle approve
    const handleOpenApproveDialog = () => {
        handleMenuClose();
        setReviewNotes('');
        setApproveDialogOpen(true);
    };

    const handleApprove = () => {
        if (selectedApp) {
            dispatch(adminApproveApplicationAsync({ id: selectedApp.id, data: reviewNotes ? { reviewNotes } : undefined }));
            setApproveDialogOpen(false);
        }
    };

    // Handle reject
    const handleOpenRejectDialog = () => {
        handleMenuClose();
        setRejectionReason('');
        setReviewNotes('');
        setRejectDialogOpen(true);
    };

    const handleReject = () => {
        if (selectedApp && rejectionReason) {
            dispatch(adminRejectApplicationAsync({ id: selectedApp.id, data: { rejectionReason, reviewNotes } }));
            setRejectDialogOpen(false);
        }
    };

    // Handle mark under review
    const handleMarkUnderReview = async () => {
        handleMenuClose();
        if (selectedApp) {
            try {
                await kuppiServices.adminMarkUnderReview(selectedApp.id);
                handleRefresh();
                setSnackbar({ open: true, message: 'Application marked as under review', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to update application', severity: 'error' });
            }
        }
    };

    // Handle permanent delete
    const handleOpenPermanentDeleteDialog = () => {
        handleMenuClose();
        setConfirmText('');
        setPermanentDeleteDialogOpen(true);
    };

    const handlePermanentDelete = async () => {
        if (selectedApp && confirmText === 'DELETE') {
            setActionLoading(true);
            try {
                await kuppiServices.superAdminPermanentDeleteApplication(selectedApp.id);
                setPermanentDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Application permanently deleted', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to delete application', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Handle revoke role
    const handleOpenRevokeRoleDialog = () => {
        handleMenuClose();
        setRevokeReason('');
        setRevokeRoleDialogOpen(true);
    };

    const handleRevokeRole = async () => {
        if (selectedApp && revokeReason) {
            setActionLoading(true);
            try {
                await kuppiServices.superAdminRevokeKuppiRole(selectedApp.studentId, revokeReason);
                setRevokeRoleDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Kuppi role revoked successfully', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to revoke role', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
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
            handleRefresh();
        }
    }, [error, successMessage, dispatch, handleRefresh]);

    // Stats cards
    const statsCards = [
        { label: 'Total', value: stats?.totalApplications ?? 0, icon: AssignmentIcon, color: theme.palette.primary.main },
        { label: 'Pending', value: stats?.pendingApplications ?? 0, icon: PendingIcon, color: '#F59E0B' },
        { label: 'Under Review', value: stats?.underReviewApplications ?? 0, icon: HourglassEmptyIcon, color: '#3B82F6' },
        { label: 'Approved', value: stats?.approvedApplications ?? 0, icon: CheckCircleIcon, color: '#10B981' },
        { label: 'Rejected', value: stats?.rejectedApplications ?? 0, icon: CancelIcon, color: '#EF4444' },
        { label: 'Kuppi Students', value: stats?.totalKuppiStudents ?? 0, icon: SchoolIcon, color: '#8B5CF6' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }} fontWeight={700} gutterBottom>
                            Kuppi Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Super Admin: Full control over Kuppi applications and roles
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleRefresh} disabled={isLoading} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </MotionBox>

            {/* Stats Cards */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), flexShrink: 0 }}>
                                                <Icon sx={{ color: stat.color, fontSize: { xs: 18, sm: 20 } }} />
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} fontWeight={700}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, display: 'block' }}>{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* Tabs & Filters */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Stack spacing={2}>
                        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
                            <Tab label="All" />
                            <Tab label="Pending" />
                            <Tab label="Under Review" />
                            <Tab label="Approved" />
                            <Tab label="Rejected" />
                        </Tabs>
                        <TextField
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ maxWidth: { sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>
                                }
                            }}
                        />
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Applications Table */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : applications.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">No applications found</Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table size={isTablet ? 'small' : 'medium'}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Subjects</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>GPA</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Submitted</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {applications.map((app) => (
                                        <TableRow key={app.id} hover>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Avatar src={app.studentProfilePictureUrl || undefined} sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                                                        {app.studentName?.[0] || 'S'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{app.studentName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{app.studentEmail}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                    {app.subjectsToTeach.slice(0, 2).map((subject, idx) => (
                                                        <Chip key={idx} label={subject} size="small" sx={{ fontSize: '0.7rem' }} />
                                                    ))}
                                                    {app.subjectsToTeach.length > 2 && (
                                                        <Chip label={`+${app.subjectsToTeach.length - 2}`} size="small" sx={{ fontSize: '0.7rem' }} />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={app.preferredExperienceLevel}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(EXPERIENCE_COLORS[app.preferredExperienceLevel] || theme.palette.grey[500], 0.1),
                                                        color: EXPERIENCE_COLORS[app.preferredExperienceLevel] || theme.palette.grey[500],
                                                        fontWeight: 500,
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                                                    <Typography variant="body2" fontWeight={600}>{app.currentGpa.toFixed(2)}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(app.status)}
                                                    label={app.statusDisplayName}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(STATUS_COLORS[app.status], 0.1),
                                                        color: STATUS_COLORS[app.status],
                                                        fontWeight: 500,
                                                        fontSize: '0.7rem',
                                                        '& .MuiChip-icon': { color: 'inherit' }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(app.submittedAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, app)}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={totalApplications}
                            page={page}
                            onPageChange={(_, p) => dispatch(setKuppiCurrentPage(p))}
                            rowsPerPage={pageSize}
                            onRowsPerPageChange={(e) => {
                                dispatch(setKuppiPageSize(parseInt(e.target.value, 10)));
                                dispatch(setKuppiCurrentPage(0));
                            }}
                            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
                        />
                    </>
                )}
            </MotionCard>

            {/* Action Menu - Super Admin has additional options */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleView}>
                    <VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details
                </MenuItem>
                {selectedApp?.canBeApproved && (
                    <MenuItem onClick={handleOpenApproveDialog} sx={{ color: 'success.main' }}>
                        <ThumbUpIcon sx={{ mr: 1.5, fontSize: 20 }} />Approve
                    </MenuItem>
                )}
                {selectedApp?.canBeRejected && (
                    <MenuItem onClick={handleOpenRejectDialog} sx={{ color: 'error.main' }}>
                        <ThumbDownIcon sx={{ mr: 1.5, fontSize: 20 }} />Reject
                    </MenuItem>
                )}
                {selectedApp?.status === 'PENDING' && (
                    <MenuItem onClick={handleMarkUnderReview} sx={{ color: 'info.main' }}>
                        <HourglassEmptyIcon sx={{ mr: 1.5, fontSize: 20 }} />Mark Under Review
                    </MenuItem>
                )}
                <Divider />
                {/* Super Admin Only Actions */}
                {selectedApp?.status === 'APPROVED' && (
                    <MenuItem onClick={handleOpenRevokeRoleDialog} sx={{ color: 'warning.main' }}>
                        <PersonOffIcon sx={{ mr: 1.5, fontSize: 20 }} />Revoke Kuppi Role
                    </MenuItem>
                )}
                <MenuItem onClick={handleOpenPermanentDeleteDialog} sx={{ color: 'error.main' }}>
                    <DeleteForeverIcon sx={{ mr: 1.5, fontSize: 20 }} />Permanent Delete
                </MenuItem>
            </Menu>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Application Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {isApplicationLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : selectedApplication ? (
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={selectedApplication.studentProfilePictureUrl || undefined} sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main }}>
                                    {selectedApplication.studentName?.[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>{selectedApplication.studentName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedApplication.studentEmail}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip label={selectedApplication.studentProgram || 'N/A'} size="small" />
                                        <Chip label={`Batch ${selectedApplication.studentBatch || 'N/A'}`} size="small" />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Current GPA</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedApplication.currentGpa.toFixed(2)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Current Semester</Typography>
                                    <Typography variant="body1">{selectedApplication.currentSemester}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Experience Level</Typography>
                                    <Typography variant="body1">{selectedApplication.preferredExperienceLevel}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box>
                                        <Chip
                                            icon={getStatusIcon(selectedApplication.status)}
                                            label={selectedApplication.statusDisplayName}
                                            size="small"
                                            sx={{ bgcolor: alpha(STATUS_COLORS[selectedApplication.status], 0.1), color: STATUS_COLORS[selectedApplication.status], '& .MuiChip-icon': { color: 'inherit' } }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Subjects to Teach</Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>
                                    {selectedApplication.subjectsToTeach.map((subject, idx) => (
                                        <Chip key={idx} label={subject} size="small" />
                                    ))}
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Motivation</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedApplication.motivation}</Typography>
                            </Box>

                            {selectedApplication.relevantExperience && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Relevant Experience</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedApplication.relevantExperience}</Typography>
                                </Box>
                            )}

                            {selectedApplication.reviewNotes && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Review Notes</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedApplication.reviewNotes}</Typography>
                                </Box>
                            )}

                            {selectedApplication.rejectionReason && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    <Typography variant="body2"><strong>Rejection Reason:</strong> {selectedApplication.rejectionReason}</Typography>
                                </Alert>
                            )}
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Are you sure you want to approve this application?</Typography>
                    <TextField
                        label="Review Notes (Optional)"
                        multiline
                        rows={3}
                        fullWidth
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleApprove} disabled={isApproving}>
                        {isApproving ? <CircularProgress size={20} /> : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Rejection Reason"
                            multiline
                            rows={2}
                            fullWidth
                            required
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <TextField
                            label="Review Notes (Optional)"
                            multiline
                            rows={2}
                            fullWidth
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject} disabled={isRejecting || !rejectionReason}>
                        {isRejecting ? <CircularProgress size={20} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permanent Delete Dialog */}
            <Dialog open={permanentDeleteDialogOpen} onClose={() => setPermanentDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <WarningIcon />
                        <Typography variant="h6">Permanent Delete</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        This action is <strong>IRREVERSIBLE</strong>. The application will be permanently deleted from the database.
                    </Alert>
                    <Typography sx={{ mb: 2 }}>Type <strong>DELETE</strong> to confirm:</Typography>
                    <TextField
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPermanentDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handlePermanentDelete}
                        disabled={confirmText !== 'DELETE' || actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Role Dialog */}
            <Dialog open={revokeRoleDialogOpen} onClose={() => setRevokeRoleDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'warning.main' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonOffIcon />
                        <Typography variant="h6">Revoke Kuppi Role</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This will remove the Kuppi Student role from this user. They will no longer be able to create sessions or upload notes.
                    </Alert>
                    <TextField
                        label="Reason for Revocation"
                        multiline
                        rows={3}
                        fullWidth
                        required
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRevokeRoleDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleRevokeRole}
                        disabled={!revokeReason || actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : 'Revoke Role'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


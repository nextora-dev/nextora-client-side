'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    IconButton,
    Chip,
    CircularProgress,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Skeleton,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BlockIcon from '@mui/icons-material/Block';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchMyApplications,
    cancelApplicationAsync,
    checkCanApplyAsync,
    checkIsKuppiStudentAsync,
    selectKuppiMyApplications,
    selectKuppiCanApply,
    selectKuppiIsKuppiStudent,
    selectKuppiIsApplicationLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    ApplicationStatus,
} from '@/features/kuppi';

// ── Motion ───────────────────────────────────────────────────
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ── Application Status Config ────────────────────────────────
const APP_STATUS_CONFIG: Record<ApplicationStatus, { color: string; icon: React.ReactElement; label: string }> = {
    PENDING: { color: '#F59E0B', icon: <PendingIcon sx={{ fontSize: 14 }} />, label: 'Pending' },
    UNDER_REVIEW: { color: '#3B82F6', icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} />, label: 'Under Review' },
    APPROVED: { color: '#10B981', icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Approved' },
    REJECTED: { color: '#EF4444', icon: <CancelIcon sx={{ fontSize: 14 }} />, label: 'Rejected' },
    CANCELLED: { color: '#6B7280', icon: <BlockIcon sx={{ fontSize: 14 }} />, label: 'Cancelled' },
    EXPIRED: { color: '#9CA3AF', icon: <ScheduleIcon sx={{ fontSize: 14 }} />, label: 'Expired' },
};

const APPLICATION_STATUS_TABS: { value: ApplicationStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
];

// ── Page Component ───────────────────────────────────────────
export default function MyApplicationsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const myApplications = useAppSelector(selectKuppiMyApplications);
    const isApplicationLoading = useAppSelector(selectKuppiIsApplicationLoading);
    const canApply = useAppSelector(selectKuppiCanApply);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Fetch on mount — same pattern as notes page
    useEffect(() => {
        dispatch(fetchMyApplications());
        dispatch(checkCanApplyAsync());
        dispatch(checkIsKuppiStudentAsync());
    }, [dispatch]);

    // Handle Redux error/success
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearKuppiSuccessMessage());
        }
    }, [error, successMessage, dispatch]);

    const handleRefresh = () => {
        dispatch(fetchMyApplications());
    };

    const handleCancelApplication = async () => {
        if (!cancelTargetId) return;
        setIsCancelling(true);
        try {
            await dispatch(cancelApplicationAsync(cancelTargetId)).unwrap();
            setSnackbar({ open: true, message: 'Application cancelled successfully', severity: 'success' });
            setCancelDialogOpen(false);
            setCancelTargetId(null);
            dispatch(fetchMyApplications());
            dispatch(checkCanApplyAsync());
        } catch (err: any) {
            const message = typeof err === 'string' ? err : err?.message || 'Failed to cancel application';
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredApplications = myApplications.filter((app) =>
        appStatusFilter === 'ALL' ? true : app.status === appStatusFilter
    );


    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ── Back ── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi')}
                sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
            >
                Back to Sessions
            </Button>

            {/* ── Header ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                    My Applications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track and manage your Kuppi host applications
                </Typography>
            </MotionBox>

            {/* ── Status Filter Tabs ── */}
            <Card
                elevation={0}
                sx={{ mb: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(12px)' }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <Tabs
                            value={APPLICATION_STATUS_TABS.findIndex(t => t.value === appStatusFilter)}
                            onChange={(_, v) => setAppStatusFilter(APPLICATION_STATUS_TABS[v].value)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: 36,
                                '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 1, px: 2 },
                                '& .MuiTabs-indicator': { borderRadius: 1, height: 2 },
                            }}
                        >
                            {APPLICATION_STATUS_TABS.map((tab) => (
                                <Tab key={tab.value} label={tab.label} />
                            ))}
                        </Tabs>
                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={handleRefresh}
                                disabled={isApplicationLoading}
                                size="small"
                                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>

            {/* ── Applications List ── */}
            {isApplicationLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((i) => (
                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <Skeleton variant="rectangular" height={4} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Skeleton variant="text" width="50%" height={28} />
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                        <Skeleton variant="text" width="80%" />
                                        <Skeleton variant="text" width="60%" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : filteredApplications.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                        <AssignmentIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Applications Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mb: 3 }}>
                        {appStatusFilter === 'ALL'
                            ? "You haven't submitted any applications yet."
                            : `No applications with status "${appStatusFilter.replace('_', ' ')}".`}
                    </Typography>
                </Paper>
            ) : (
                <AnimatePresence mode="popLayout">
                    <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                        {filteredApplications.map((app, index) => {
                            const statusCfg = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.PENDING;
                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={app.id}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.35, delay: index * 0.04 }}
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden',
                                            height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.25s ease',
                                            '&:hover': { borderColor: statusCfg.color, boxShadow: `0 8px 24px ${alpha(statusCfg.color, 0.12)}` },
                                        }}
                                    >
                                        <Box sx={{ height: 4, flexShrink: 0, background: `linear-gradient(90deg, ${statusCfg.color}, ${alpha(statusCfg.color, 0.4)})` }} />
                                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Stack spacing={2} sx={{ flex: 1 }}>
                                                {/* Header */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 0.5 }}>Application #{app.id}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Submitted {new Date(app.submittedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </Typography>
                                                    </Box>
                                                    <Chip icon={statusCfg.icon} label={app.statusDisplayName || app.status} size="small"
                                                        sx={{ bgcolor: alpha(statusCfg.color, 0.1), color: statusCfg.color, fontWeight: 600, fontSize: '0.7rem', flexShrink: 0, '& .MuiChip-icon': { color: 'inherit' } }}
                                                    />
                                                </Stack>

                                                {/* Subjects */}
                                                <Box sx={{ minHeight: 28 }}>
                                                    {app.subjectsToTeach && app.subjectsToTeach.length > 0 ? (
                                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                                            {app.subjectsToTeach.slice(0, 3).map((subject, idx) => (
                                                                <Chip key={idx} label={subject} size="small"
                                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }}
                                                                />
                                                            ))}
                                                            {app.subjectsToTeach.length > 3 && (
                                                                <Chip label={`+${app.subjectsToTeach.length - 3} more`} size="small"
                                                                    sx={{ fontSize: '0.65rem', fontWeight: 500, bgcolor: alpha(theme.palette.grey[500], 0.08) }}
                                                                />
                                                            )}
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="caption" color="text.disabled">No subjects specified</Typography>
                                                    )}
                                                </Box>

                                                {/* Details */}
                                                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <SchoolIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">GPA: {app.currentGpa ?? '—'}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <TrendingUpIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {app.preferredExperienceLevel ? app.preferredExperienceLevel.charAt(0) + app.preferredExperienceLevel.slice(1).toLowerCase() : '—'}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{app.currentSemester || '—'}</Typography>
                                                    </Stack>
                                                </Stack>

                                                {/* Motivation */}
                                                <Typography variant="body2" color="text.secondary"
                                                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, minHeight: '2.4em' }}
                                                >
                                                    {app.motivation || 'No motivation provided'}
                                                </Typography>

                                                {/* Alerts */}
                                                <Box sx={{ minHeight: 32 }}>
                                                    {app.status === 'REJECTED' && app.rejectionReason ? (
                                                        <Alert severity="error" sx={{ borderRadius: 1, py: 0.5, '& .MuiAlert-message': { overflow: 'hidden' } }}>
                                                            <Typography variant="caption" noWrap><strong>Reason:</strong> {app.rejectionReason}</Typography>
                                                        </Alert>
                                                    ) : app.reviewNotes ? (
                                                        <Alert severity="info" sx={{ borderRadius: 1, py: 0.5, '& .MuiAlert-message': { overflow: 'hidden' } }}>
                                                            <Typography variant="caption" noWrap><strong>Review Notes:</strong> {app.reviewNotes}</Typography>
                                                        </Alert>
                                                    ) : null}
                                                </Box>

                                                <Box sx={{ flex: 1 }} />
                                                <Divider />

                                                {/* Footer */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="caption" color="text.disabled">
                                                        Updated {new Date(app.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Typography>
                                                    {app.canBeCancelled ? (
                                                        <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />}
                                                            onClick={() => { setCancelTargetId(app.id); setCancelDialogOpen(true); }}
                                                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    ) : (
                                                        <Chip label={app.isFinalState ? 'Final' : app.statusDisplayName || app.status} size="small" variant="outlined"
                                                            sx={{ fontSize: '0.65rem', fontWeight: 500, borderColor: 'divider', color: 'text.disabled' }}
                                                        />
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </Grid>
                </AnimatePresence>
            )}

            {/* ── Cancel Dialog ── */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Cancel Application</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">Are you sure you want to cancel this application? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>No, Keep It</Button>
                    <Button onClick={handleCancelApplication} variant="contained" color="error" disabled={isCancelling} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        {isCancelling ? <CircularProgress size={20} color="inherit" /> : 'Yes, Cancel'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


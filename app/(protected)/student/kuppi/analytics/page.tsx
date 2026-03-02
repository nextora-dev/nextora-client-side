'use client';

import React, { useEffect, useState } from 'react';
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
    Paper,
    Tooltip,
    Skeleton,
    Divider,
    Snackbar,
    Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchMyAnalytics,
    selectKuppiIsAnalyticsLoading,
    selectKuppiMyAnalytics,
    selectKuppiError,
    clearKuppiError,
} from '@/features/kuppi';

// ── Motion ───────────────────────────────────────────────────
const MotionBox = motion.create(Box);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ── Page Component ───────────────────────────────────────────
export default function MyAnalyticsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const isAnalyticsLoading = useAppSelector(selectKuppiIsAnalyticsLoading);
    const myAnalytics = useAppSelector(selectKuppiMyAnalytics);
    const error = useAppSelector(selectKuppiError);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'error' });

    useEffect(() => {
        dispatch(fetchMyAnalytics());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
    }, [error, dispatch]);

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
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            My Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Overview of your Kuppi hosting performance
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh Analytics">
                        <IconButton
                            onClick={() => dispatch(fetchMyAnalytics())}
                            disabled={isAnalyticsLoading}
                            size="small"
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </MotionBox>

            {/* ── Content ── */}
            {isAnalyticsLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Stack spacing={1.5}>
                                        <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 1 }} />
                                        <Skeleton variant="text" width="50%" height={32} />
                                        <Skeleton variant="text" width="70%" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : !myAnalytics ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                        <BarChartIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Analytics Available</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                        Start hosting sessions and uploading notes to see your analytics here.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {/* ── Primary Stats ── */}
                    <Grid container spacing={2.5}>
                        {[
                            { label: 'Total Sessions', value: myAnalytics.totalSessions, icon: SchoolIcon, color: '#3B82F6' },
                            { label: 'Completed', value: myAnalytics.completedSessions, icon: CheckCircleIcon, color: '#10B981' },
                            { label: 'Upcoming', value: myAnalytics.upcomingSessions, icon: EventIcon, color: '#8B5CF6' },
                            { label: 'Session Views', value: myAnalytics.totalSessionViews, icon: VisibilityIcon, color: '#F59E0B' },
                            { label: 'Total Notes', value: myAnalytics.totalNotes, icon: NoteAltIcon, color: '#EC4899' },
                            { label: 'Note Views', value: myAnalytics.totalNoteViews, icon: VisibilityIcon, color: '#06B6D4' },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                            <Stack spacing={1.5}>
                                                <Box
                                                    sx={{
                                                        width: 44, height: 44, borderRadius: 1,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        bgcolor: alpha(stat.color, 0.1), border: '1px solid', borderColor: alpha(stat.color, 0.15),
                                                    }}
                                                >
                                                    <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                                                        {stat.value.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                        {stat.label}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* ── Highlights ── */}
                    <Grid container spacing={2.5}>
                        {/* Most Viewed Session */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%', overflow: 'hidden' }}>
                                <Box sx={{ height: 4, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#3B82F6', 0.1) }}>
                                                <VisibilityIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>Most Viewed Session</Typography>
                                                <Typography variant="caption" color="text.secondary">Your top performing session</Typography>
                                            </Box>
                                        </Stack>
                                        <Divider />
                                        {myAnalytics.mostViewedSessionId ? (
                                            <Stack spacing={1}>
                                                <Typography variant="body1" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {myAnalytics.mostViewedSessionTitle}
                                                </Typography>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Chip icon={<VisibilityIcon sx={{ fontSize: 14 }} />} label={`${myAnalytics.mostViewedSessionViews.toLocaleString()} views`} size="small"
                                                        sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', fontWeight: 600, fontSize: '0.7rem', '& .MuiChip-icon': { color: 'inherit' } }}
                                                    />
                                                    <Button size="small" onClick={() => router.push(`/student/kuppi/${myAnalytics.mostViewedSessionId}`)}
                                                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                                                    >
                                                        View Session →
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                                                No sessions yet. Host your first session!
                                            </Typography>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Most Downloaded Note */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%', overflow: 'hidden' }}>
                                <Box sx={{ height: 4, background: 'linear-gradient(90deg, #EC4899, #F59E0B)' }} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#EC4899', 0.1) }}>
                                                <DownloadIcon sx={{ color: '#EC4899', fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>Most Downloaded Note</Typography>
                                                <Typography variant="caption" color="text.secondary">Your most popular resource</Typography>
                                            </Box>
                                        </Stack>
                                        <Divider />
                                        {myAnalytics.mostDownloadedNoteId ? (
                                            <Stack spacing={1}>
                                                <Typography variant="body1" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {myAnalytics.mostDownloadedNoteTitle}
                                                </Typography>
                                                <Chip icon={<DownloadIcon sx={{ fontSize: 14 }} />} label={`${myAnalytics.mostDownloadedNoteDownloads.toLocaleString()} downloads`} size="small"
                                                    sx={{ bgcolor: alpha('#EC4899', 0.1), color: '#EC4899', fontWeight: 600, fontSize: '0.7rem', '& .MuiChip-icon': { color: 'inherit' }, width: 'fit-content' }}
                                                />
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                                                No notes yet. Upload your first note!
                                            </Typography>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* ── Quick Actions ── */}
                    <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => router.push('/student/kuppi/create')}
                                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                >
                                    Create New Session
                                </Button>
                                <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={() => router.push('/student/kuppi/notes')}
                                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                >
                                    Manage Notes
                                </Button>
                                <Button variant="outlined" startIcon={<PersonIcon />} onClick={() => router.push('/student/kuppi/tutors')}
                                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                >
                                    Browse Tutors
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            )}

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


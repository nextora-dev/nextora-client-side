'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, Chip, Button, Avatar,
    LinearProgress, Divider, Snackbar, Alert, Stack, Grid, alpha, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShareIcon from '@mui/icons-material/Share';
import SchoolIcon from '@mui/icons-material/School';

import { SAMPLE_SESSIONS } from '@/lib/constants/kuppi.constants';
import {
    getTutorInitials,
    getParticipationRate,
    getRemainingSpots,
    formatSessionDate,
    formatSessionTime,
    getDifficultyColor,
} from '@/components/features/kuppi';

const MotionCard = motion.create(Card);

export default function KuppiSessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const sessionId = params.id as string;

    const [isSaved, setIsSaved] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const session = useMemo(() => {
        return SAMPLE_SESSIONS.find(s => s.id === sessionId);
    }, [sessionId]);

    if (!session) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                    Session not found
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi')}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Back to Sessions
                </Button>
            </Box>
        );
    }

    const participationRate = getParticipationRate(session.currentParticipants, session.maxParticipants);
    const remainingSpots = getRemainingSpots(session.currentParticipants, session.maxParticipants);
    const isFull = remainingSpots === 0;
    const difficultyColor = getDifficultyColor(session.difficulty);

    const handleBookSession = async () => {
        setIsBooking(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsBooked(true);
        setIsBooking(false);
        setSnackbarMessage('Successfully booked the session!');
        setSnackbarOpen(true);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setSnackbarMessage('Link copied to clipboard!');
        setSnackbarOpen(true);
    };

    const handleToggleSave = () => {
        setIsSaved(!isSaved);
        setSnackbarMessage(isSaved ? 'Removed from saved' : 'Added to saved');
        setSnackbarOpen(true);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi')}
                sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}
            >
                Back to Sessions
            </Button>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #6366F1 100%)`,
                                p: 3,
                                position: 'relative',
                            }}
                        >
                            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '20px 20px' }} />
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Chip label={session.subject} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
                                    <Chip label={session.difficulty} size="small" sx={{ bgcolor: alpha(difficultyColor, 0.3), color: 'white', fontWeight: 600, textTransform: 'capitalize' }} />
                                    {session.isOnline && <Chip icon={<VideocamIcon sx={{ fontSize: 14, color: 'white !important' }} />} label="Online" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />}
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>{session.title}</Typography>
                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{formatSessionDate(session.date)}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <AccessTimeIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{formatSessionTime(session.time)} ({session.duration} min)</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <LocationOnIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{session.venue}</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>About this session</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{session.description}</Typography>
                            </Box>
                            <Divider sx={{ my: 3 }} />
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>Topics Covered</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {session.topics.map((topic) => (
                                        <Chip key={topic} label={topic} size="small" icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 500, '& .MuiChip-icon': { color: 'success.main' } }} />
                                    ))}
                                </Stack>
                            </Box>
                            {session.isOnline && session.meetingLink && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>Meeting Link</Typography>
                                        <Button variant="outlined" startIcon={<VideocamIcon />} onClick={() => window.open(session.meetingLink, '_blank')} sx={{ borderRadius: 2, textTransform: 'none' }}>Join Online Session</Button>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>Hosted by</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontWeight: 700, fontSize: '1.25rem' }}>{getTutorInitials(session.host.name)}</Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>{session.host.name}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">{session.host.department}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Rating</Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                        <Typography variant="body2" fontWeight={600}>{session.host.rating}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Sessions Hosted</Typography>
                                    <Typography variant="body2" fontWeight={600}>{session.host.sessionsHosted}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">GPA</Typography>
                                    <Typography variant="body2" fontWeight={600}>{session.host.gpa}</Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </MotionCard>

                    <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <GroupIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{session.currentParticipants}/{session.maxParticipants}</Typography>
                                    </Stack>
                                    <Chip label={isFull ? 'Full' : `${remainingSpots} spots left`} size="small" sx={{ fontWeight: 600, bgcolor: isFull ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1), color: isFull ? 'error.main' : 'success.main' }} />
                                </Stack>
                                <LinearProgress variant="determinate" value={participationRate} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(isFull ? theme.palette.error.main : theme.palette.primary.main, 0.1), '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: isFull ? 'error.main' : 'primary.main' } }} />
                            </Box>
                            <Stack spacing={2}>
                                <Button variant="contained" size="large" fullWidth disabled={isFull || isBooked || isBooking} onClick={handleBookSession} sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                                    {isBooking ? 'Booking...' : isBooked ? 'Already Booked' : isFull ? 'Session Full' : 'Book Session'}
                                </Button>
                                <Stack direction="row" spacing={1}>
                                    <Button variant="outlined" fullWidth onClick={handleToggleSave} startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: isSaved ? 'warning.main' : 'divider', color: isSaved ? 'warning.main' : 'text.secondary' }}>
                                        {isSaved ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button variant="outlined" fullWidth onClick={handleShare} startIcon={<ShareIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.secondary' }}>
                                        Share
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ borderRadius: 2 }}>{snackbarMessage}</Alert>
            </Snackbar>
        </Box>
    );
}



'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Stack,
    Chip,
    Avatar,
    Button,
    IconButton,
    Divider,
    LinearProgress,
    alpha,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import MessageIcon from '@mui/icons-material/Message';
import { KuppiSession } from '@/types/kuppi';
import {
    getTutorInitials,
    getParticipationRate,
    formatSessionDate,
    formatSessionTime,
    getDifficultyColor,
    getRemainingSpots,
} from './kuppi.utils';

interface SessionDetailModalProps {
    session: KuppiSession | null;
    open: boolean;
    onClose: () => void;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    isBooked?: boolean;
    onBook?: (id: string) => void;
    isBooking?: boolean;
    onMessageHost?: () => void;
}

const MotionBox = motion.create(Box);

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
    session,
    open,
    onClose,
    isSaved,
    onToggleSave,
    isBooked = false,
    onBook,
    isBooking = false,
    onMessageHost,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!session) return null;

    const participationRate = getParticipationRate(session.currentParticipants, session.maxParticipants);
    const remainingSpots = getRemainingSpots(session.currentParticipants, session.maxParticipants);
    const isFull = remainingSpots === 0;
    const difficultyColor = getDifficultyColor(session.difficulty);

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    maxWidth="md"
                    fullWidth
                    fullScreen={isMobile}
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: isMobile ? 0 : 1,
                                bgcolor: 'background.paper',
                                backgroundImage: 'none',
                                overflow: 'hidden',
                            },
                        },
                    }}
                >
                    {/* Header with gradient */}
                    <Box
                        sx={{
                            position: 'relative',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #6366F1 100%)`,
                            p: 3,
                            pb: 4,
                        }}
                    >
                        {/* Background pattern */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                                backgroundSize: '20px 20px',
                            }}
                        />

                        {/* Close button */}
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 2,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Header content */}
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                <Chip
                                    label={session.subject}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                                <Chip
                                    label={session.difficulty}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(difficultyColor, 0.3),
                                        color: 'white',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                    }}
                                />
                                {session.isOnline && (
                                    <Chip
                                        icon={<VideocamIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                                        label="Online"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </Stack>

                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    mb: 1,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {session.title}
                            </Typography>

                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CalendarTodayIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {formatSessionDate(session.date)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {formatSessionTime(session.time)} ({session.duration} min)
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Box>

                    <DialogContent sx={{ p: 0 }}>
                        <Box sx={{ p: 3 }}>
                            {/* Host Info Card */}
                            <MotionBox
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    mb: 3,
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                                            color: 'primary.main',
                                            fontWeight: 700,
                                            fontSize: '1.25rem',
                                        }}
                                    >
                                        {getTutorInitials(session.host.name)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {session.host.name}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {session.host.department}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {session.host.rating} ({session.host.sessionsHosted} sessions)
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </MotionBox>

                            {/* Description */}
                            <MotionBox
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                    About this session
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {session.description}
                                </Typography>
                            </MotionBox>

                            {/* Topics */}
                            <MotionBox
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                                    Topics Covered
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {session.topics.map((topic) => (
                                        <Chip
                                            key={topic}
                                            label={topic}
                                            size="small"
                                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                            sx={{
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                color: 'success.main',
                                                fontWeight: 500,
                                                '& .MuiChip-icon': {
                                                    color: 'success.main',
                                                },
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </MotionBox>

                            {/* Location */}
                            <MotionBox
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                    Location
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {session.venue}
                                    </Typography>
                                </Stack>
                                {session.isOnline && session.meetingLink && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<VideocamIcon />}
                                        sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
                                        onClick={() => window.open(session.meetingLink, '_blank')}
                                    >
                                        Join Meeting
                                    </Button>
                                )}
                            </MotionBox>

                            <Divider sx={{ my: 3 }} />

                            {/* Capacity */}
                            <MotionBox
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                sx={{ mb: 3 }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <GroupIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {session.currentParticipants} of {session.maxParticipants} participants
                                        </Typography>
                                    </Stack>
                                    <Chip
                                        label={isFull ? 'Session Full' : `${remainingSpots} spots left`}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: isFull
                                                ? alpha(theme.palette.error.main, 0.1)
                                                : alpha(theme.palette.success.main, 0.1),
                                            color: isFull ? 'error.main' : 'success.main',
                                        }}
                                    />
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={participationRate}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: alpha(isFull ? theme.palette.error.main : theme.palette.primary.main, 0.1),
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                            bgcolor: isFull ? 'error.main' : 'primary.main',
                                        },
                                    }}
                                />
                            </MotionBox>

                            {/* Actions */}
                            <MotionBox
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={isFull || isBooked || isBooking}
                                        onClick={() => onBook?.(session.id)}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        {isBooking
                                            ? 'Booking...'
                                            : isBooked
                                            ? 'Already Booked'
                                            : isFull
                                            ? 'Session Full'
                                            : 'Book Session'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<MessageIcon />}
                                        onClick={onMessageHost}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderColor: 'divider',
                                            color: 'text.primary',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            },
                                        }}
                                    >
                                        Message Host
                                    </Button>
                                    <IconButton
                                        onClick={() => onToggleSave(session.id)}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            px: 2,
                                        }}
                                    >
                                        {isSaved ? (
                                            <BookmarkIcon sx={{ color: 'warning.main' }} />
                                        ) : (
                                            <BookmarkBorderIcon />
                                        )}
                                    </IconButton>
                                    <IconButton
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            px: 2,
                                        }}
                                    >
                                        <ShareIcon />
                                    </IconButton>
                                </Stack>
                            </MotionBox>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
};


'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Stack,
    Chip,
    Avatar,
    IconButton,
    LinearProgress,
    alpha,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import VideocamIcon from '@mui/icons-material/Videocam';
import { KuppiSession } from '@/types/kuppi';
import {
    getTutorInitials,
    getParticipationRate,
    formatSessionDate,
    formatSessionTime,
    getDifficultyColor
} from './kuppi.utils';

interface SessionCardProps {
    session: KuppiSession;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    onClick: (session: KuppiSession) => void;
    animationDelay?: number;
}

const MotionCard = motion.create(Card);

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    isSaved,
    onToggleSave,
    onClick,
    animationDelay = 0,
}) => {
    const theme = useTheme();
    const participationRate = getParticipationRate(session.currentParticipants, session.maxParticipants);
    const isFull = session.currentParticipants >= session.maxParticipants;
    const difficultyColor = getDifficultyColor(session.difficulty);

    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: animationDelay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => onClick(session)}
            sx={{
                cursor: 'pointer',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
            }}
        >
            {/* Header with gradient */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Chip
                                label={session.subject}
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                }}
                            />
                            <Chip
                                label={session.difficulty}
                                size="small"
                                sx={{
                                    bgcolor: alpha(difficultyColor, 0.15),
                                    color: difficultyColor,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    textTransform: 'capitalize',
                                }}
                            />
                            {session.isOnline && (
                                <Chip
                                    icon={<VideocamIcon sx={{ fontSize: 14 }} />}
                                    label="Online"
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(theme.palette.info.main, 0.15),
                                        color: 'info.main',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        '& .MuiChip-icon': { color: 'info.main' },
                                    }}
                                />
                            )}
                        </Stack>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {session.title}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(session.id);
                        }}
                        sx={{
                            bgcolor: isSaved ? alpha(theme.palette.warning.main, 0.15) : 'action.hover',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.warning.main, 0.25),
                            },
                        }}
                    >
                        {isSaved ? (
                            <BookmarkIcon sx={{ color: 'warning.main' }} />
                        ) : (
                            <BookmarkBorderIcon sx={{ color: 'text.secondary' }} />
                        )}
                    </IconButton>
                </Stack>
            </Box>

            <CardContent sx={{ p: 2 }}>
                {/* Host Info */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {getTutorInitials(session.host.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                            {session.host.name}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                            <Typography variant="caption" color="text.secondary">
                                {session.host.rating} • {session.host.sessionsHosted} sessions
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                {/* Session Info */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatSessionDate(session.date)} • {formatSessionTime(session.time)} ({session.duration} min)
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {session.venue}
                        </Typography>
                    </Stack>
                </Stack>

                {/* Topics */}
                <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                    {session.topics.slice(0, 3).map((topic) => (
                        <Chip
                            key={topic}
                            label={topic}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.65rem',
                                height: 22,
                                borderColor: 'divider',
                                color: 'text.secondary',
                            }}
                        />
                    ))}
                    {session.topics.length > 3 && (
                        <Chip
                            label={`+${session.topics.length - 3}`}
                            size="small"
                            sx={{
                                fontSize: '0.65rem',
                                height: 22,
                                bgcolor: 'action.hover',
                                color: 'text.secondary',
                            }}
                        />
                    )}
                </Stack>

                {/* Capacity */}
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {session.currentParticipants}/{session.maxParticipants} participants
                            </Typography>
                        </Stack>
                        <Chip
                            label={isFull ? 'Full' : `${session.maxParticipants - session.currentParticipants} spots left`}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: isFull ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.success.main, 0.15),
                                color: isFull ? 'error.main' : 'success.main',
                            }}
                        />
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={participationRate}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(isFull ? theme.palette.error.main : theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: isFull ? 'error.main' : 'primary.main',
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </MotionCard>
    );
};


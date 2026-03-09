'use client';

import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    LinearProgress,
    useTheme,
    alpha,
    Avatar,
    AvatarGroup,
    Tooltip,
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EventIcon from '@mui/icons-material/Event';
import TimerIcon from '@mui/icons-material/Timer';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { motion } from 'framer-motion';
import type { ElectionResponse, ElectionStatus } from '@/features/club/types';

const MotionCard = motion.create(Card);

interface ElectionCardProps {
    election: ElectionResponse;
    onClick?: (election: ElectionResponse) => void;
    index?: number;
}

const STATUS_CONFIG: Record<ElectionStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'; icon: string }> = {
    UPCOMING: { label: 'Upcoming', color: 'info', icon: '🗓️' },
    NOMINATIONS_OPEN: { label: 'Nominations Open', color: 'warning', icon: '📝' },
    NOMINATIONS_CLOSED: { label: 'Nominations Closed', color: 'default', icon: '📋' },
    VOTING_OPEN: { label: 'Voting Open', color: 'success', icon: '🗳️' },
    VOTING_CLOSED: { label: 'Voting Closed', color: 'default', icon: '🔒' },
    RESULTS_PUBLISHED: { label: 'Results Published', color: 'primary', icon: '🏆' },
    CANCELLED: { label: 'Cancelled', color: 'error', icon: '❌' },
};

export function ElectionCard({ election, onClick, index = 0 }: ElectionCardProps) {
    const theme = useTheme();
    const config = STATUS_CONFIG[election.status] || { label: election.status, color: 'default' as const, icon: '📋' };
    const isActive = election.status === 'VOTING_OPEN' || election.status === 'NOMINATIONS_OPEN';

    const timeInfo = useMemo(() => {
        const now = new Date();
        const votingStart = new Date(election.votingStartDate);
        const votingEnd = new Date(election.votingEndDate);

        if (election.status === 'VOTING_OPEN') {
            const diff = votingEnd.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (diff > 0) {
                return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
            }
            return 'Closing soon';
        }
        if (election.status === 'UPCOMING' || election.status === 'NOMINATIONS_OPEN') {
            const diff = votingStart.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (diff > 0) return `Voting starts in ${days}d`;
        }
        return null;
    }, [election]);

    // Progress for active elections
    const progress = useMemo(() => {
        if (election.status !== 'VOTING_OPEN') return 0;
        const now = new Date().getTime();
        const start = new Date(election.votingStartDate).getTime();
        const end = new Date(election.votingEndDate).getTime();
        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    }, [election]);

    return (
        <MotionCard
            elevation={0}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                borderRadius: 3,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                '&:hover': onClick
                    ? {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }
                    : {},
                ...(isActive && {
                    borderColor: alpha(
                        config.color === 'success' ? theme.palette.success.main : theme.palette.warning.main,
                        0.3,
                    ),
                }),
            }}
            onClick={() => onClick?.(election)}
        >
            {/* Active progress bar */}
            {isActive && (
                <LinearProgress
                    variant={election.status === 'VOTING_OPEN' ? 'determinate' : 'indeterminate'}
                    value={progress}
                    color={config.color === 'default' ? 'primary' : config.color}
                    sx={{ height: 3 }}
                />
            )}

            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(
                                config.color === 'default'
                                    ? theme.palette.grey[500]
                                    : theme.palette[config.color]?.main || theme.palette.primary.main,
                                0.1,
                            ),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '1.2rem',
                        }}
                    >
                        {config.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.25, lineHeight: 1.3 }}>
                            {election.title}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {election.clubName}
                        </Typography>
                    </Box>
                    <Chip
                        label={config.label}
                        size="small"
                        color={config.color}
                        sx={{ fontSize: '0.68rem', height: 24, fontWeight: 600 }}
                    />
                </Box>

                {/* Description */}
                {election.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                            mb: 2,
                            lineHeight: 1.5,
                            fontSize: '0.82rem',
                        }}
                    >
                        {election.description}
                    </Typography>
                )}

                {/* Countdown / Timer */}
                {timeInfo && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                            py: 1,
                            px: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(
                                isActive ? theme.palette.success.main : theme.palette.info.main,
                                0.06,
                            ),
                            border: `1px solid ${alpha(
                                isActive ? theme.palette.success.main : theme.palette.info.main,
                                0.12,
                            )}`,
                        }}
                    >
                        <TimerIcon sx={{ fontSize: 16, color: isActive ? 'success.main' : 'info.main' }} />
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{
                                color: isActive ? 'success.main' : 'info.main',
                                fontSize: '0.75rem',
                            }}
                        >
                            {timeInfo}
                        </Typography>
                    </Box>
                )}

                {/* Footer: dates + candidates */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                        pt: 1.5,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                            {new Date(election.votingStartDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                            {' – '}
                            {new Date(election.votingEndDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Typography>
                    </Box>

                    {election.candidates && election.candidates.length > 0 && (
                        <Tooltip
                            title={election.candidates.map((c) => c.userName).join(', ')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <AvatarGroup
                                    max={4}
                                    sx={{
                                        '& .MuiAvatar-root': {
                                            width: 22,
                                            height: 22,
                                            fontSize: '0.6rem',
                                            borderColor: theme.palette.background.paper,
                                        },
                                    }}
                                >
                                    {election.candidates.map((c) => (
                                        <Avatar
                                            key={c.id}
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                color: 'primary.main',
                                            }}
                                        >
                                            {c.userName.charAt(0)}
                                        </Avatar>
                                    ))}
                                </AvatarGroup>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {election.candidates.length} candidate{election.candidates.length !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </MotionCard>
    );
}

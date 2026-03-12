'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    Avatar,
    Button,
    alpha,
    useTheme,
    Tooltip,
    AvatarGroup,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedIcon from '@mui/icons-material/Verified';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import type { ClubResponse } from '@/features/club/types';

const MotionCard = motion.create(Card);

interface ClubCardProps {
    club: ClubResponse;
    onView: (club: ClubResponse) => void;
    onJoin?: (club: ClubResponse) => void;
    onManage?: (club: ClubResponse) => void;
    canJoin?: boolean;
    canManage?: boolean;
    isMember?: boolean;
    index?: number;
}

export function ClubCard({
    club,
    onView,
    onJoin,
    onManage,
    canJoin = false,
    canManage = false,
    isMember = false,
    index = 0,
}: ClubCardProps) {
    const theme = useTheme();

    return (
        <MotionCard
            elevation={0}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{
                y: -6,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
            sx={{
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.25s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                    '& .club-arrow': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                },
            }}
            onClick={() => onView(club)}
        >
            {/* Accent bar */}
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.4)})` }} />

            {/* Header gradient with pattern */}
            <Box
                sx={{
                    height: 96,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #6366F1 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '20px 20px' }} />

                {/* Registration status badge */}
                {club.registrationOpen && (
                    <Chip
                        size="small"
                        icon={<FiberManualRecordIcon sx={{ fontSize: '8px !important', animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />}
                        label="Open"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            height: 24,
                            backdropFilter: 'blur(4px)',
                            '& .MuiChip-icon': { color: '#4ade80' },
                        }}
                    />
                )}

                <Avatar
                    src={club.logoUrl || undefined}
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                        color: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        border: '2px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        boxShadow: `0 4px 14px ${alpha('#000', 0.2)}`,
                        zIndex: 1,
                    }}
                >
                    {club.name.charAt(0).toUpperCase()}
                </Avatar>
            </Box>

            <CardContent sx={{ flex: 1, pt: 2, pb: 1, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '1rem', flex: 1 }}>
                        {club.name}
                    </Typography>
                    {isMember && (
                        <Tooltip title="You're a member">
                            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        </Tooltip>
                    )}
                </Box>

                <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block' }}>
                    {club.clubCode}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        minHeight: 40,
                        lineHeight: 1.6,
                        fontSize: '0.8rem',
                    }}
                >
                    {club.description || 'No description available.'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                    <Chip
                        size="small"
                        label={club.faculty}
                        sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.15),
                        }}
                    />
                </Box>

                {/* Member count with visual indicator */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AvatarGroup
                            max={3}
                            sx={{
                                '& .MuiAvatar-root': {
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.65rem',
                                    borderColor: theme.palette.background.paper,
                                },
                            }}
                        >
                            {Array.from({ length: Math.min(club.memberCount || 0, 3) }).map((_, i) => (
                                <Avatar
                                    key={i}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.15 + i * 0.1),
                                        color: 'primary.main',
                                    }}
                                >
                                    {String.fromCharCode(65 + i)}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {club.memberCount || 0} member{(club.memberCount || 0) !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    <Box
                        className="club-arrow"
                        sx={{
                            opacity: 0,
                            transform: 'translateX(-8px)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
                {canJoin && club.registrationOpen && !isMember && (
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<PersonAddIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onJoin?.(club);
                        }}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            px: 2,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                        }}
                    >
                        Join Club
                    </Button>
                )}
                {canManage && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SettingsIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onManage?.(club);
                        }}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            px: 2,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                        }}
                    >
                        Manage
                    </Button>
                )}
            </CardActions>
        </MotionCard>
    );
}

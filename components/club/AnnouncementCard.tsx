'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Avatar,
    alpha,
    useTheme,
    IconButton,
    Tooltip,
    Divider,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImageIcon from '@mui/icons-material/Image';
import { motion } from 'framer-motion';
import type { AnnouncementResponse } from '@/features/club/types';

const MotionCard = motion.create(Card);

interface AnnouncementCardProps {
    announcement: AnnouncementResponse;
    onClick?: (announcement: AnnouncementResponse) => void;
    index?: number;
}

export function AnnouncementCard({ announcement, onClick, index = 0 }: AnnouncementCardProps) {
    const theme = useTheme();

    const timeAgo = (date: string) => {
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return d.toLocaleDateString();
    };

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
                          transform: 'translateX(4px)',
                      }
                    : {},
                ...(announcement.isPinned && {
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                    bgcolor: alpha(theme.palette.warning.main, 0.02),
                }),
            }}
            onClick={() => onClick?.(announcement)}
        >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                {/* Top row: pin + title + visibility */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    {announcement.isPinned && (
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                mt: 0.25,
                            }}
                        >
                            <PushPinIcon sx={{ fontSize: 14, color: 'warning.main', transform: 'rotate(45deg)' }} />
                        </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.25, lineHeight: 1.3 }}>
                            {announcement.title}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {announcement.clubName}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                        <Tooltip title={announcement.isPublic ? 'Public announcement' : 'Members only'}>
                            <Chip
                                icon={
                                    announcement.isPublic
                                        ? <PublicIcon sx={{ fontSize: '14px !important' }} />
                                        : <LockIcon sx={{ fontSize: '14px !important' }} />
                                }
                                label={announcement.isPublic ? 'Public' : 'Members'}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.68rem',
                                    height: 24,
                                    borderColor: alpha(
                                        announcement.isPublic ? theme.palette.success.main : theme.palette.info.main,
                                        0.3,
                                    ),
                                    color: announcement.isPublic ? theme.palette.success.main : theme.palette.info.main,
                                }}
                            />
                        </Tooltip>
                    </Box>
                </Box>

                {/* Content */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        mb: 2,
                        lineHeight: 1.6,
                        fontSize: '0.82rem',
                    }}
                >
                    {announcement.content}
                </Typography>

                {/* Image indicator */}
                {announcement.imageUrl && (
                    <Box
                        sx={{
                            mb: 2,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                        }}
                    >
                        <Box
                            component="img"
                            src={announcement.imageUrl}
                            alt=""
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </Box>
                )}

                {/* Footer */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 1.5,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            sx={{
                                width: 28,
                                height: 28,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                            }}
                        >
                            {announcement.authorName?.charAt(0) || 'A'}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', lineHeight: 1.2 }}>
                                {announcement.authorName}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                            {timeAgo(announcement.createdAt)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </MotionCard>
    );
}

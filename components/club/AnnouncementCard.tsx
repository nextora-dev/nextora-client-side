'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Avatar,
    IconButton,
    Stack,
    alpha,
    useTheme,
    Tooltip,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { motion } from 'framer-motion';
import type { AnnouncementResponse } from '@/features/club/types';

const MotionCard = motion.create(Card);

interface AnnouncementCardProps {
    announcement: AnnouncementResponse;
    onClick?: (announcement: AnnouncementResponse) => void;
    onEdit?: (announcement: AnnouncementResponse) => void;
    onDelete?: (announcement: AnnouncementResponse) => void;
    onPermanentDelete?: (announcement: AnnouncementResponse) => void;
    onTogglePin?: (announcement: AnnouncementResponse) => void;
    showActions?: boolean;
    index?: number;
}

export function AnnouncementCard({ announcement, onClick, onEdit, onDelete, onPermanentDelete, onTogglePin, showActions = false, index = 0 }: AnnouncementCardProps) {
    const theme = useTheme();

    // Backend sends `isMembersOnly`. Derive `isPublic` = !isMembersOnly.
    const isMembersOnly = announcement.isMembersOnly ?? false;
    const isPublic = announcement.isPublic ?? !isMembersOnly;
    const isPinned = announcement.isPinned ?? false;

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
                border: '1px solid',
                borderColor: isPinned ? alpha('#F59E0B', 0.35) : 'divider',
                borderRadius: 1,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': onClick
                    ? {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                      }
                    : {},
                ...(isPinned && {
                    borderLeft: `4px solid #F59E0B`,
                    bgcolor: alpha('#F59E0B', 0.03),
                    boxShadow: `0 2px 12px ${alpha('#F59E0B', 0.08)}`,
                }),
            }}
            onClick={() => onClick?.(announcement)}
        >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                {/* Top row: pin + title + visibility */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    {isPinned && (
                        <Chip
                            icon={<PushPinIcon sx={{ fontSize: '13px !important', transform: 'rotate(45deg)' }} />}
                            label="Pinned"
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: alpha('#F59E0B', 0.1),
                                color: '#D97706',
                                border: `1px solid ${alpha('#F59E0B', 0.25)}`,
                                flexShrink: 0,
                                mt: 0.25,
                                '& .MuiChip-icon': { color: '#D97706' },
                            }}
                        />
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
                        <Tooltip title={isPublic ? 'Public announcement' : 'Members only'}>
                            <Chip
                                icon={
                                    isPublic
                                        ? <PublicIcon sx={{ fontSize: '14px !important' }} />
                                        : <LockIcon sx={{ fontSize: '14px !important' }} />
                                }
                                label={isPublic ? 'Public' : 'Members'}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.68rem',
                                    height: 24,
                                    borderColor: alpha(
                                        isPublic ? theme.palette.success.main : theme.palette.info.main,
                                        0.3,
                                    ),
                                    color: isPublic ? theme.palette.success.main : theme.palette.info.main,
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
                {(announcement.imageUrl || announcement.attachmentUrl) && (
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
                            src={announcement.imageUrl || announcement.attachmentUrl || ''}
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
                        borderTop: '1px solid',
                        borderColor: 'divider',
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
                    {showActions && (
                        <Stack direction="row" spacing={0.5}>
                            {onTogglePin && (
                                <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onTogglePin(announcement); }} sx={{ color: isPinned ? 'warning.main' : 'text.disabled' }}>
                                        {isPinned ? <PushPinIcon sx={{ fontSize: 16 }} /> : <PushPinOutlinedIcon sx={{ fontSize: 16 }} />}
                                    </IconButton>
                                </Tooltip>
                            )}
                            {onEdit && (
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(announcement); }} sx={{ color: 'info.main' }}>
                                        <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {onDelete && (
                                <Tooltip title="Delete">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(announcement); }} sx={{ color: 'error.main' }}>
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {onPermanentDelete && (
                                <Tooltip title="Permanently Delete">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onPermanentDelete(announcement); }} sx={{ color: '#EF4444' }}>
                                        <DeleteForeverIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    )}
                </Box>
            </CardContent>
        </MotionCard>
    );
}

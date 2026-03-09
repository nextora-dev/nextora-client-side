'use client';

import React from 'react';
import {
    Typography,
    Chip,
    Skeleton,
    Box,
    Paper,
    alpha,
    useTheme,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import CampaignIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import { motion } from 'framer-motion';
import type { ActivityLogEntry, ActivityLogType } from '@/features/club/types';

const MotionBox = motion.create(Box);

interface ActivityLogListProps {
    logs: ActivityLogEntry[];
    isLoading: boolean;
    emptyMessage?: string;
}

function getLogConfig(type: ActivityLogType): { icon: React.ReactElement; color: string; category: string } {
    const defaultConfig = { icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />, color: '#EF4444', category: 'Admin' };
    if (!type) return defaultConfig;
    if (type.startsWith('CLUB_')) return { icon: <GroupsIcon sx={{ fontSize: 16 }} />, color: '#3B82F6', category: 'Club' };
    if (type.startsWith('MEMBER_') || type.startsWith('BULK_')) return { icon: <PersonIcon sx={{ fontSize: 16 }} />, color: '#10B981', category: 'Member' };
    if (type.startsWith('ANNOUNCEMENT_')) return { icon: <CampaignIcon sx={{ fontSize: 16 }} />, color: '#8B5CF6', category: 'Announcement' };
    if (type.startsWith('ELECTION_')) return { icon: <HowToVoteIcon sx={{ fontSize: 16 }} />, color: '#F59E0B', category: 'Election' };
    return defaultConfig;
}

function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ActivityLogList({ logs, isLoading, emptyMessage = 'No activity logs.' }: ActivityLogListProps) {
    const theme = useTheme();

    if (isLoading) {
        return (
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="80%" height={20} />
                            <Skeleton variant="text" width="50%" height={16} />
                        </Box>
                    </Box>
                ))}
            </Paper>
        );
    }

    if (!logs.length) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 6,
                    px: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <HistoryIcon sx={{ fontSize: 28, color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
                <Typography color="text.secondary" fontWeight={500}>{emptyMessage}</Typography>
            </Box>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                borderRadius: 3,
                overflow: 'hidden',
            }}
        >
            {logs.map((log, idx) => {
                const config = getLogConfig(log.type);
                return (
                    <MotionBox
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            px: 2.5,
                            py: 2,
                            alignItems: 'flex-start',
                            borderBottom: idx < logs.length - 1
                                ? `1px solid ${alpha(theme.palette.divider, 0.4)}`
                                : 'none',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                            },
                            position: 'relative',
                        }}
                    >
                        {/* Timeline line */}
                        {idx < logs.length - 1 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 35,
                                    top: 44,
                                    bottom: 0,
                                    width: 2,
                                    bgcolor: alpha(config.color, 0.15),
                                }}
                            />
                        )}

                        {/* Icon */}
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                bgcolor: alpha(config.color, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                color: config.color,
                                zIndex: 1,
                            }}
                        >
                            {config.icon}
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                    {log.description}
                                </Typography>
                                <Chip
                                    label={config.category}
                                    size="small"
                                    sx={{
                                        fontSize: '0.6rem',
                                        height: 18,
                                        fontWeight: 600,
                                        bgcolor: alpha(config.color, 0.08),
                                        color: config.color,
                                        border: `1px solid ${alpha(config.color, 0.15)}`,
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {log.performedBy}
                                </Typography>
                                <FiberManualRecordIcon sx={{ fontSize: 4, color: 'text.disabled' }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                                        {formatTimeAgo(log.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </MotionBox>
                );
            })}
        </Paper>
    );
}

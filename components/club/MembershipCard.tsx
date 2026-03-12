'use client';
import React from 'react';
import { Paper, Typography, Box, Chip, Avatar, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { motion } from 'framer-motion';
import type { MembershipResponse } from '@/features/club/types';
const MotionPaper = motion.create(Paper);
const POSITION_COLORS: Record<string, string> = {
    PRESIDENT: '#F59E0B', VICE_PRESIDENT: '#8B5CF6', SECRETARY: '#3B82F6',
    TREASURER: '#10B981', TOP_BOARD_MEMBER: '#EC4899', COMMITTEE_MEMBER: '#6366F1', MEMBER: '#6B7280',
};
interface MembershipCardProps {
    membership: MembershipResponse;
    onLeave?: (clubId: number) => void;
    onSelect?: (clubId: number) => void;
    index?: number;
}
export function MembershipCard({ membership, onLeave, onSelect, index = 0 }: MembershipCardProps) {
    const theme = useTheme();
    const posColor = (membership.position && POSITION_COLORS[membership.position]) || '#6B7280';
    return (
        <MotionPaper
            elevation={0}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            sx={{
                p: 2.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: onSelect ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': onSelect ? {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    transform: 'translateX(4px)',
                } : {},
            }}
            onClick={() => onSelect?.(membership.clubId)}
        >
            <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(posColor, 0.1), color: posColor, fontWeight: 700, fontSize: '1rem' }}>
                {membership.clubName?.charAt(0) || 'C'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={700} noWrap>{membership.clubName}</Typography>
                    {membership.status === 'ACTIVE' && <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={membership.position?.replace(/_/g, ' ') || 'Member'} size="small" sx={{ fontSize: '0.68rem', height: 22, fontWeight: 600, bgcolor: alpha(posColor, 0.1), color: posColor, border: `1px solid ${alpha(posColor, 0.2)}` }} />
                    <Chip label={membership.status} size="small" color={membership.status === 'ACTIVE' ? 'success' : 'warning'} sx={{ fontSize: '0.68rem', height: 22 }} />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                    Joined {new Date(membership.joinDate || membership.joinedAt || membership.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
                {membership.status === 'ACTIVE' && onLeave && (
                    <Tooltip title="Leave Club">
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onLeave(membership.clubId); }}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.06), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) } }}>
                            <ExitToAppIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </MotionPaper>
    );
}

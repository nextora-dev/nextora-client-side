'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    Skeleton,
    Box,
    Avatar,
    alpha,
    useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import ShieldIcon from '@mui/icons-material/Shield';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';
import type { MembershipResponse, ClubPosition, MembershipStatus } from '@/features/club/types';

const MotionTableRow = motion.create(TableRow);

interface MembershipTableProps {
    members: MembershipResponse[];
    isLoading: boolean;
    showActions?: boolean;
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
    onSuspend?: (id: number) => void;
    /** Enhanced callbacks that pass the full member object for dialog-based flows */
    onApproveRequest?: (member: MembershipResponse) => void;
    onRejectRequest?: (member: MembershipResponse) => void;
    onSuspendRequest?: (member: MembershipResponse) => void;
    onChangePosition?: (member: MembershipResponse) => void;
    onRowClick?: (member: MembershipResponse) => void;
    emptyMessage?: string;
}

const STATUS_CONFIG: Record<MembershipStatus, { color: 'success' | 'warning' | 'error' | 'default' | 'info'; label: string }> = {
    ACTIVE: { color: 'success', label: 'Active' },
    PENDING: { color: 'warning', label: 'Pending' },
    SUSPENDED: { color: 'error', label: 'Suspended' },
    REJECTED: { color: 'error', label: 'Rejected' },
    LEFT: { color: 'default', label: 'Left' },
};

const POSITION_CONFIG: Record<ClubPosition, { label: string; color: string; icon?: React.ReactNode }> = {
    PRESIDENT: { label: 'President', color: '#F59E0B', icon: <StarIcon sx={{ fontSize: 12 }} /> },
    VICE_PRESIDENT: { label: 'Vice President', color: '#8B5CF6', icon: <ShieldIcon sx={{ fontSize: 12 }} /> },
    SECRETARY: { label: 'Secretary', color: '#3B82F6' },
    TREASURER: { label: 'Treasurer', color: '#10B981' },
    TOP_BOARD_MEMBER: { label: 'Top Board', color: '#EC4899' },
    COMMITTEE_MEMBER: { label: 'Committee', color: '#6366F1' },
    MEMBER: { label: 'Member', color: '#6B7280' },
};

export function MembershipTable({
    members,
    isLoading,
    showActions = false,
    onApprove,
    onReject,
    onSuspend,
    onApproveRequest,
    onRejectRequest,
    onSuspendRequest,
    onChangePosition,
    onRowClick,
    emptyMessage = 'No members found.',
}: MembershipTableProps) {
    const theme = useTheme();

    if (isLoading) {
        return (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Skeleton variant="circular" width={36} height={36} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="text" width="60%" height={16} />
                        </Box>
                        <Skeleton variant="rounded" width={70} height={24} />
                        <Skeleton variant="rounded" width={60} height={24} />
                    </Box>
                ))}
            </Paper>
        );
    }

    if (!members.length) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 6,
                    px: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
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
                    <PersonIcon sx={{ fontSize: 28, color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {emptyMessage}
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                '& .MuiTableHead-root': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
                '& .MuiTableCell-head': {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'text.secondary',
                    py: 1.5,
                    borderBottom: `2px solid ${alpha(theme.palette.divider, 0.6)}`,
                },
                '& .MuiTableCell-body': {
                    py: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                },
            }}
        >
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Member</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Joined</TableCell>
                        {showActions && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {members.map((member, index) => {
                        const posConfig = (member.position && POSITION_CONFIG[member.position]) || { label: member.position || 'Member', color: '#6B7280' };
                        const statusConfig = (member.status && STATUS_CONFIG[member.status]) || { color: 'default' as const, label: member.status || 'Unknown' };
                        return (
                            <MotionTableRow
                                key={member.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                hover
                                onClick={() => onRowClick?.(member)}
                                sx={{
                                    '&:last-child td': { borderBottom: 0 },
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                    cursor: onRowClick ? 'pointer' : 'default',
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                            }}
                                        >
                                            {member.memberName?.charAt(0) || member.userName?.charAt(0) || 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                                {member.memberName || member.userName}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                                                {member.memberEmail || member.userEmail}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={posConfig.label}
                                        size="small"
                                        icon={posConfig.icon as React.ReactElement | undefined}
                                        sx={{
                                            fontSize: '0.7rem',
                                            height: 26,
                                            fontWeight: 600,
                                            bgcolor: alpha(posConfig.color, 0.1),
                                            color: posConfig.color,
                                            border: `1px solid ${alpha(posConfig.color, 0.2)}`,
                                            '& .MuiChip-icon': { color: posConfig.color },
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={statusConfig.label}
                                        size="small"
                                        color={statusConfig.color}
                                        sx={{ fontSize: '0.7rem', height: 24, fontWeight: 500 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(member.joinDate || member.joinedAt || member.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                {showActions && (
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            {member.status === 'PENDING' && (
                                                <>
                                                    <Tooltip title="Approve" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onApproveRequest ? onApproveRequest(member) : onApprove?.(member.id)}
                                                            sx={{
                                                                color: 'success.main',
                                                                bgcolor: alpha(theme.palette.success.main, 0.08),
                                                                '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                                            }}
                                                        >
                                                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onRejectRequest ? onRejectRequest(member) : onReject?.(member.id)}
                                                            sx={{
                                                                color: 'error.main',
                                                                bgcolor: alpha(theme.palette.error.main, 0.08),
                                                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                                            }}
                                                        >
                                                            <CancelIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {member.status === 'ACTIVE' && (
                                                <>
                                                    {onChangePosition && (
                                                        <Tooltip title="Change Position" arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onChangePosition(member)}
                                                                sx={{
                                                                    color: 'info.main',
                                                                    bgcolor: alpha(theme.palette.info.main, 0.08),
                                                                    '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.15) },
                                                                }}
                                                            >
                                                                <SwapHorizIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Suspend" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onSuspendRequest ? onSuspendRequest(member) : onSuspend?.(member.id)}
                                                            sx={{
                                                                color: 'warning.main',
                                                                bgcolor: alpha(theme.palette.warning.main, 0.08),
                                                                '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.15) },
                                                            }}
                                                        >
                                                            <BlockIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                )}
                            </MotionTableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

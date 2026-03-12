'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box,
    Avatar,
    Chip,
    Stack,
    CircularProgress,
    alpha,
    useTheme,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { MembershipResponse } from '@/features/club/types';

export type MembershipActionType = 'approve' | 'reject' | 'suspend' | null;

interface MembershipActionDialogProps {
    open: boolean;
    action: MembershipActionType;
    member: MembershipResponse | null;
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: (membershipId: number, reason?: string) => void;
}

const ACTION_CONFIG: Record<string, {
    title: string;
    description: string;
    confirmLabel: string;
    color: 'success' | 'error' | 'warning';
    icon: React.ReactNode;
    requiresReason: boolean;
    reasonLabel: string;
}> = {
    approve: {
        title: 'Approve Membership',
        description: 'Are you sure you want to approve this membership request? The member will be notified and granted access to the club.',
        confirmLabel: 'Approve',
        color: 'success',
        icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
        requiresReason: false,
        reasonLabel: 'Notes (optional)',
    },
    reject: {
        title: 'Reject Membership',
        description: 'Are you sure you want to reject this membership request? The member will be notified of the decision.',
        confirmLabel: 'Reject',
        color: 'error',
        icon: <CancelIcon sx={{ fontSize: 28 }} />,
        requiresReason: true,
        reasonLabel: 'Rejection Reason',
    },
    suspend: {
        title: 'Suspend Member',
        description: 'Are you sure you want to suspend this member? They will lose access to club activities until reinstated.',
        confirmLabel: 'Suspend',
        color: 'warning',
        icon: <BlockIcon sx={{ fontSize: 28 }} />,
        requiresReason: true,
        reasonLabel: 'Suspension Reason',
    },
};

const POSITION_COLORS: Record<string, string> = {
    PRESIDENT: '#F59E0B',
    VICE_PRESIDENT: '#8B5CF6',
    SECRETARY: '#3B82F6',
    TREASURER: '#10B981',
    TOP_BOARD_MEMBER: '#EC4899',
    COMMITTEE_MEMBER: '#6366F1',
    MEMBER: '#6B7280',
};

export function MembershipActionDialog({
    open,
    action,
    member,
    isLoading = false,
    onClose,
    onConfirm,
}: MembershipActionDialogProps) {
    const theme = useTheme();
    const [reason, setReason] = useState('');

    // Reset reason when dialog opens/closes or action changes
    useEffect(() => {
        if (open) {
            setReason('');
        }
    }, [open, action]);

    if (!action) return null;

    const config = ACTION_CONFIG[action];
    const posColor = member?.position ? (POSITION_COLORS[member.position] || '#6B7280') : '#6B7280';
    const actionColor = theme.palette[config.color].main;

    const handleConfirm = () => {
        if (!member) return;
        onConfirm(member.id, reason.trim() || undefined);
    };

    const isConfirmDisabled = isLoading || (config.requiresReason && !reason.trim());

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 1,
                    overflow: 'hidden',
                },
            }}
        >
            {/* Accent bar */}
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${actionColor}, ${alpha(actionColor, 0.4)})` }} />

            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(actionColor, 0.1),
                            border: '1px solid',
                            borderColor: alpha(actionColor, 0.2),
                            color: actionColor,
                        }}
                    >
                        {config.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                        {config.title}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {/* Warning message */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 2,
                        mb: 3,
                        borderRadius: 1,
                        bgcolor: alpha(actionColor, 0.05),
                        border: '1px solid',
                        borderColor: alpha(actionColor, 0.12),
                    }}
                >
                    <WarningAmberIcon sx={{ color: actionColor, fontSize: 20, mt: 0.25 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {config.description}
                    </Typography>
                </Box>

                {/* Member info card */}
                {member && (
                    <>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1, mb: 1.5, display: 'block' }}>
                            Member Details
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                mb: 3,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: alpha(posColor, 0.1),
                                    color: posColor,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    border: '2px solid',
                                    borderColor: alpha(posColor, 0.2),
                                }}
                            >
                                {member.memberName?.charAt(0) || member.userName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" fontWeight={700} noWrap>
                                    {member.memberName || member.userName}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                                    {member.memberEmail || member.userEmail}
                                </Typography>
                                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                                    <Chip
                                        label={member.position?.replace(/_/g, ' ') || 'Member'}
                                        size="small"
                                        sx={{
                                            fontSize: '0.68rem',
                                            height: 22,
                                            fontWeight: 600,
                                            bgcolor: alpha(posColor, 0.1),
                                            color: posColor,
                                            border: '1px solid',
                                            borderColor: alpha(posColor, 0.2),
                                        }}
                                    />
                                    <Chip
                                        label={member.clubName}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.68rem', height: 22 }}
                                    />
                                    <Chip
                                        label={member.status}
                                        size="small"
                                        color={
                                            member.status === 'ACTIVE' ? 'success' :
                                            member.status === 'PENDING' ? 'warning' : 'default'
                                        }
                                        sx={{ fontSize: '0.68rem', height: 22 }}
                                    />
                                </Stack>
                            </Box>
                        </Box>
                    </>
                )}

                {/* Reason / Notes input */}
                <TextField
                    label={config.reasonLabel}
                    placeholder={
                        action === 'approve'
                            ? 'Add any notes about this approval...'
                            : action === 'reject'
                            ? 'Please provide a reason for rejecting this request...'
                            : 'Please provide a reason for suspending this member...'
                    }
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required={config.requiresReason}
                    error={config.requiresReason && reason.trim().length === 0 && reason.length > 0}
                    helperText={
                        config.requiresReason && reason.trim().length === 0 && reason.length > 0
                            ? 'Reason is required'
                            : undefined
                    }
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                        },
                    }}
                />
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    disabled={isLoading}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={config.color}
                    disabled={isConfirmDisabled}
                    startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
                    sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 700,
                        minWidth: 120,
                        boxShadow: `0 4px 14px ${alpha(actionColor, 0.4)}`,
                        '&:hover': { boxShadow: `0 6px 20px ${alpha(actionColor, 0.5)}` },
                    }}
                >
                    {isLoading ? 'Processing...' : config.confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


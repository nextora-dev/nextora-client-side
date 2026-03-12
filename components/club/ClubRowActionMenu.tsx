'use client';

import React from 'react';
import { Box, Menu, MenuItem } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import BlockIcon from '@mui/icons-material/Block';
import PushPinIcon from '@mui/icons-material/PushPin';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import EditIcon from '@mui/icons-material/Edit';

interface ExtraAction {
    key: string;
    label: string;
    onClick: () => void;
    color?: string;
    icon?: React.ReactElement;
}

interface Props {
    anchorEl: HTMLElement | null;
    open: boolean;
    mode: 'club' | 'membership' | 'announcement' | 'election';
    targetItem: any;
    onClose: () => void;
    onView?: () => void;
    onDelete?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onSuspend?: () => void;
    onToggleRegistration?: () => void;
    onPin?: () => void;
    onUnpin?: () => void;
    onEdit?: () => void;
    extraActions?: ExtraAction[];
}

export function ClubRowActionMenu({
    anchorEl,
    open,
    mode,
    targetItem,
    onClose,
    onView,
    onDelete,
    onApprove,
    onReject,
    onSuspend,
    onToggleRegistration,
    onPin,
    onUnpin,
    onEdit,
    extraActions,
}: Props) {
    const handleClick = (cb?: () => void) => {
        onClose();
        if (cb) cb();
    };

    if (!targetItem) return null;

    return (
        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
            {onView && (
                <MenuItem onClick={() => handleClick(onView)}>
                    <VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View
                </MenuItem>
            )}
            {onEdit && (
                <MenuItem onClick={() => handleClick(onEdit)}>
                    <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />Edit
                </MenuItem>
            )}
            {mode === 'club' && onToggleRegistration && (
                <MenuItem onClick={() => handleClick(onToggleRegistration)} sx={{ color: 'info.main' }}>
                    <ToggleOffIcon sx={{ mr: 1.5, fontSize: 20 }} />Toggle Registration
                </MenuItem>
            )}
            {mode === 'membership' && targetItem?.status === 'PENDING' && onApprove && (
                <MenuItem onClick={() => handleClick(onApprove)} sx={{ color: 'success.main' }}>
                    <ThumbUpIcon sx={{ mr: 1.5, fontSize: 20 }} />Approve
                </MenuItem>
            )}
            {mode === 'membership' && targetItem?.status === 'PENDING' && onReject && (
                <MenuItem onClick={() => handleClick(onReject)} sx={{ color: 'error.main' }}>
                    <ThumbDownIcon sx={{ mr: 1.5, fontSize: 20 }} />Reject
                </MenuItem>
            )}
            {mode === 'membership' && targetItem?.status === 'ACTIVE' && onSuspend && (
                <MenuItem onClick={() => handleClick(onSuspend)} sx={{ color: 'warning.main' }}>
                    <BlockIcon sx={{ mr: 1.5, fontSize: 20 }} />Suspend
                </MenuItem>
            )}
            {mode === 'announcement' && !targetItem?.isPinned && onPin && (
                <MenuItem onClick={() => handleClick(onPin)} sx={{ color: 'warning.main' }}>
                    <PushPinIcon sx={{ mr: 1.5, fontSize: 20 }} />Pin
                </MenuItem>
            )}
            {mode === 'announcement' && targetItem?.isPinned && onUnpin && (
                <MenuItem onClick={() => handleClick(onUnpin)}>
                    <PushPinIcon sx={{ mr: 1.5, fontSize: 20 }} />Unpin
                </MenuItem>
            )}
            {onDelete && (
                <MenuItem onClick={() => handleClick(onDelete)} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />Delete
                </MenuItem>
            )}
            {extraActions?.map((a) => (
                <MenuItem key={a.key} onClick={() => handleClick(a.onClick)} sx={a.color ? { color: a.color } : undefined}>
                    {a.icon && <Box component="span" sx={{ mr: 1.5, fontSize: 20, display: 'inline-flex', verticalAlign: 'middle' }}>{a.icon}</Box>}
                    {a.label}
                </MenuItem>
            ))}
        </Menu>
    );
}


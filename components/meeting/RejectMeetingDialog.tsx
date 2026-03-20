'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Typography, Stack, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { RejectMeetingRequest } from '@/features/meeting/types';

interface RejectMeetingDialogProps {
    open: boolean;
    onClose: () => void;
    isSubmitting: boolean;
    onSubmit: (data: RejectMeetingRequest) => void;
}

export default function RejectMeetingDialog({ open, onClose, isSubmitting, onSubmit }: RejectMeetingDialogProps) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open) setReason('');
    }, [open]);

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onSubmit({ reason: reason.trim() });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>Reject Meeting</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Please provide a reason for rejecting this meeting request.
                    </Typography>
                    <TextField
                        label="Rejection Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required fullWidth multiline rows={3} size="small"
                        placeholder="e.g. Schedule conflict, please propose another time..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" color="error" onClick={handleSubmit}
                    disabled={!reason.trim() || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                >
                    {isSubmitting ? 'Rejecting...' : 'Reject Meeting'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Typography, Stack, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface RejectClaimDialogProps {
    open: boolean;
    onClose: () => void;
    claimId: number | null;
    isSubmitting: boolean;
    onReject: (id: number, reason: string) => void;
}

export default function RejectClaimDialog({ open, onClose, claimId, isSubmitting, onReject }: RejectClaimDialogProps) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open) setReason('');
    }, [open]);

    const handleReject = () => {
        if (!reason.trim() || !claimId) return;
        onReject(claimId, reason.trim());
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>Reject Claim</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Please provide a reason for rejecting this claim.
                    </Typography>
                    <TextField
                        label="Rejection Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required fullWidth multiline rows={3} size="small"
                        placeholder="e.g. Proof of ownership is insufficient..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" color="error" onClick={handleReject}
                    disabled={!reason.trim() || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                >
                    {isSubmitting ? 'Rejecting...' : 'Reject Claim'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

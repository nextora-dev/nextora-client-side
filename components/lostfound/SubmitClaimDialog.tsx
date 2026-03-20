'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Stack, Typography, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { SubmitClaimRequest } from '@/features/lostfound/types';

interface SubmitClaimDialogProps {
    open: boolean;
    onClose: () => void;
    lostItemId: number | null;
    foundItemId: number | null;
    isSubmitting: boolean;
    onSubmit: (data: SubmitClaimRequest) => void;
}

export default function SubmitClaimDialog({ open, onClose, lostItemId, foundItemId, isSubmitting, onSubmit }: SubmitClaimDialogProps) {
    const [proofDescription, setProofDescription] = useState('');

    useEffect(() => {
        if (open) setProofDescription('');
    }, [open]);

    const handleSubmit = () => {
        if (!proofDescription.trim() || !lostItemId || !foundItemId) return;
        onSubmit({ lostItemId, foundItemId, proofDescription: proofDescription.trim() });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>Submit Claim</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Provide proof of ownership to claim this item. Include details like serial numbers, receipts, distinguishing marks, etc.
                    </Typography>
                    <TextField
                        label="Proof of Ownership"
                        value={proofDescription}
                        onChange={(e) => setProofDescription(e.target.value)}
                        required fullWidth multiline rows={4} size="small"
                        placeholder="Describe how you can prove this item belongs to you..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSubmit}
                    disabled={!proofDescription.trim() || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

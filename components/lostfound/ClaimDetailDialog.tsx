'use client';

import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Chip, Box, alpha, IconButton, Divider, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ClaimResponse, ClaimStatus } from '@/features/lostfound/types';

const STATUS_CONFIG: Record<ClaimStatus, { color: string; label: string }> = {
    PENDING: { color: '#F59E0B', label: 'Pending' },
    APPROVED: { color: '#10B981', label: 'Approved' },
    REJECTED: { color: '#EF4444', label: 'Rejected' },
};

interface ClaimDetailDialogProps {
    open: boolean;
    onClose: () => void;
    claim: ClaimResponse | null;
    isLoading?: boolean;
    showActions?: boolean;
    isSubmitting?: boolean;
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
}

export default function ClaimDetailDialog({
    open, onClose, claim, isLoading, showActions, isSubmitting, onApprove, onReject,
}: ClaimDetailDialogProps) {
    if (!claim && !isLoading) return null;
    const sc = claim ? STATUS_CONFIG[claim.status] : STATUS_CONFIG.PENDING;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${sc.color}, ${alpha(sc.color, 0.4)})` }} />
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>Claim Details</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : claim ? (
                    <Stack spacing={2.5}>
                        <Chip label={sc.label} size="small" sx={{ bgcolor: alpha(sc.color, 0.1), color: sc.color, fontWeight: 700, alignSelf: 'flex-start' }} />

                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Lost Item</Typography>
                            <Typography variant="body2" color="text.secondary">#{claim.lostItemId} — {claim.lostItemTitle}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Found Item</Typography>
                            <Typography variant="body2" color="text.secondary">#{claim.foundItemId} — {claim.foundItemTitle}</Typography>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Proof of Ownership</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {claim.proofDescription}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Claimant</Typography>
                            <Typography variant="body2" color="text.secondary">{claim.claimantName}</Typography>
                        </Box>

                        {claim.rejectionReason && (
                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha('#EF4444', 0.05), border: '1px solid', borderColor: alpha('#EF4444', 0.2) }}>
                                <Typography variant="subtitle2" fontWeight={600} color="error.main" gutterBottom>Rejection Reason</Typography>
                                <Typography variant="body2" color="text.secondary">{claim.rejectionReason}</Typography>
                            </Box>
                        )}

                        <Typography variant="caption" color="text.disabled">
                            Submitted: {new Date(claim.createdAt).toLocaleString()}
                        </Typography>
                    </Stack>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                {showActions && claim?.status === 'PENDING' && (
                    <>
                        <Button
                            variant="contained" color="error" onClick={() => onReject?.(claim.id)}
                            disabled={isSubmitting}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="contained" onClick={() => onApprove?.(claim.id)}
                            disabled={isSubmitting}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Approve
                        </Button>
                    </>
                )}
                <Button onClick={onClose} sx={{ borderRadius: 1, textTransform: 'none' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

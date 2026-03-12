'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    Box,
    Typography,
    alpha,
    useTheme,
    Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';

interface JoinClubDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (remarks: string) => void;
    clubName: string;
    isLoading: boolean;
}

export function JoinClubDialog({ open, onClose, onSubmit, clubName, isLoading }: JoinClubDialogProps) {
    const theme = useTheme();
    const [remarks, setRemarks] = useState('');

    const handleSubmit = () => {
        onSubmit(remarks);
        setRemarks('');
    };

    const handleClose = () => {
        if (isLoading) return;
        setRemarks('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden' },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha('#10B981', 0.7)} 100%)`,
                    p: 3,
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                <IconButton
                    size="small"
                    onClick={handleClose}
                    disabled={isLoading}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Avatar
                    sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 1.5,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <PersonAddIcon sx={{ color: '#fff', fontSize: 28 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 0.25 }}>
                    Join Club
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {clubName}
                </Typography>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Your request will be reviewed by the club administrators. Add a brief note to introduce yourself.
                </Typography>
                <TextField
                    label="Message (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Tell the club why you'd like to join..."
                    disabled={isLoading}
                    sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={isLoading}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` },
                    }}
                >
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

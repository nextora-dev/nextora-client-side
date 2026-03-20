'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Stack, Typography, alpha, useTheme, IconButton,
    Switch, FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotesDialogProps {
    open: boolean;
    onClose: () => void;
    isSubmitting: boolean;
    onSubmit: (notes: string, followUpRequired: boolean, followUpNotes?: string) => void;
}

export default function NotesDialog({ open, onClose, isSubmitting, onSubmit }: NotesDialogProps) {
    const theme = useTheme();

    const [notes, setNotes] = useState('');
    const [followUpRequired, setFollowUpRequired] = useState(false);
    const [followUpNotes, setFollowUpNotes] = useState('');

    useEffect(() => {
        if (open) {
            setNotes('');
            setFollowUpRequired(false);
            setFollowUpNotes('');
        }
    }, [open]);

    const isValid = notes.trim();

    const handleSubmit = () => {
        if (!isValid) return;
        onSubmit(
            notes.trim(),
            followUpRequired,
            followUpRequired && followUpNotes.trim() ? followUpNotes.trim() : undefined,
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>
                    Meeting Notes
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <TextField
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required fullWidth multiline rows={4} size="small"
                        placeholder="Record meeting notes, key discussion points, action items..."
                    />
                    <FormControlLabel
                        control={<Switch checked={followUpRequired} onChange={(e) => setFollowUpRequired(e.target.checked)} />}
                        label="Follow-up Required"
                    />
                    {followUpRequired && (
                        <TextField
                            label="Follow-up Notes"
                            value={followUpNotes}
                            onChange={(e) => setFollowUpNotes(e.target.value)}
                            fullWidth multiline rows={3} size="small"
                            placeholder="Describe what follow-up actions are needed..."
                        />
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                >
                    {isSubmitting ? 'Saving...' : 'Save Notes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Stack, Typography, alpha, useTheme, IconButton,
    Switch, FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { RescheduleMeetingRequest, MeetingResponse } from '@/features/meeting/types';

interface RescheduleMeetingDialogProps {
    open: boolean;
    onClose: () => void;
    isSubmitting: boolean;
    meeting: MeetingResponse | null;
    onSubmit: (data: RescheduleMeetingRequest) => void;
}

export default function RescheduleMeetingDialog({ open, onClose, isSubmitting, meeting, onSubmit }: RescheduleMeetingDialogProps) {
    const theme = useTheme();

    const [scheduledStartTime, setScheduledStartTime] = useState('');
    const [scheduledEndTime, setScheduledEndTime] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingPlatform, setMeetingPlatform] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open) {
            setScheduledStartTime('');
            setScheduledEndTime('');
            setIsOnline(meeting?.isOnline ?? false);
            setLocation(meeting?.location ?? '');
            setMeetingLink(meeting?.meetingLink ?? '');
            setMeetingPlatform(meeting?.meetingPlatform ?? '');
            setReason('');
        }
    }, [open, meeting]);

    const isValid = scheduledStartTime && scheduledEndTime && (isOnline || location.trim());

    const handleSubmit = () => {
        if (!isValid) return;
        onSubmit({
            scheduledStartTime: new Date(scheduledStartTime).toISOString(),
            scheduledEndTime: new Date(scheduledEndTime).toISOString(),
            isOnline,
            location: !isOnline ? location.trim() : undefined,
            meetingLink: isOnline ? meetingLink.trim() || undefined : undefined,
            meetingPlatform: isOnline ? meetingPlatform.trim() || undefined : undefined,
            reason: reason.trim() || undefined,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>
                    Reschedule Meeting
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {meeting && (
                        <Typography variant="body2" color="text.secondary">
                            Rescheduling: <strong>{meeting.subject}</strong>
                        </Typography>
                    )}
                    <TextField
                        label="New Start Time"
                        type="datetime-local"
                        value={scheduledStartTime}
                        onChange={(e) => setScheduledStartTime(e.target.value)}
                        required fullWidth size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="New End Time"
                        type="datetime-local"
                        value={scheduledEndTime}
                        onChange={(e) => setScheduledEndTime(e.target.value)}
                        required fullWidth size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormControlLabel
                        control={<Switch checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />}
                        label="Online Meeting"
                    />
                    {!isOnline && (
                        <TextField
                            label="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required fullWidth size="small"
                            placeholder="e.g. Room 301, Block A"
                        />
                    )}
                    {isOnline && (
                        <>
                            <TextField
                                label="Meeting Link"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                fullWidth size="small"
                                placeholder="e.g. https://zoom.us/j/123456"
                            />
                            <TextField
                                label="Meeting Platform"
                                value={meetingPlatform}
                                onChange={(e) => setMeetingPlatform(e.target.value)}
                                fullWidth size="small"
                                placeholder="e.g. Zoom, Microsoft Teams, Google Meet"
                            />
                        </>
                    )}
                    <TextField
                        label="Reason (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth multiline rows={2} size="small"
                        placeholder="Reason for rescheduling..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}
                >
                    {isSubmitting ? 'Rescheduling...' : 'Reschedule Meeting'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

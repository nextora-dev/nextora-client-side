'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Stack, Typography, alpha, useTheme, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { CreateMeetingRequest, MeetingType } from '@/features/meeting/types';

interface CreateMeetingDialogProps {
    open: boolean;
    onClose: () => void;
    isSubmitting: boolean;
    onSubmit: (data: CreateMeetingRequest) => void;
}

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
    { value: 'PROJECT_DISCUSSION', label: 'Project Discussion' },
    { value: 'ACADEMIC_GUIDANCE', label: 'Academic Guidance' },
    { value: 'CAREER_GUIDANCE', label: 'Career Guidance' },
    { value: 'GRADE_REVIEW', label: 'Grade Review' },
    { value: 'RESEARCH', label: 'Research' },
    { value: 'OTHER', label: 'Other' },
];

const PRIORITIES = [
    { value: 1, label: '1 - Low' },
    { value: 2, label: '2 - Below Normal' },
    { value: 3, label: '3 - Normal' },
    { value: 4, label: '4 - High' },
    { value: 5, label: '5 - Urgent' },
];

export default function CreateMeetingDialog({ open, onClose, isSubmitting, onSubmit }: CreateMeetingDialogProps) {
    const theme = useTheme();

    const [lecturerId, setLecturerId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [meetingType, setMeetingType] = useState<MeetingType>('PROJECT_DISCUSSION');
    const [description, setDescription] = useState('');
    const [preferredDateTime, setPreferredDateTime] = useState('');
    const [preferredDurationMinutes, setPreferredDurationMinutes] = useState<string>('30');
    const [priority, setPriority] = useState<number>(3);

    useEffect(() => {
        if (open) {
            setLecturerId('');
            setSubject('');
            setMeetingType('PROJECT_DISCUSSION');
            setDescription('');
            setPreferredDateTime('');
            setPreferredDurationMinutes('30');
            setPriority(3);
        }
    }, [open]);

    const isValid = lecturerId.trim() && subject.trim() && preferredDateTime && Number(preferredDurationMinutes) > 0;

    const handleSubmit = () => {
        if (!isValid) return;
        onSubmit({
            lecturerId: Number(lecturerId),
            subject: subject.trim(),
            meetingType,
            description: description.trim() || undefined,
            preferredDateTime: new Date(preferredDateTime).toISOString(),
            preferredDurationMinutes: Number(preferredDurationMinutes),
            priority,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>
                    Request Meeting
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <TextField
                        label="Lecturer ID"
                        type="number"
                        value={lecturerId}
                        onChange={(e) => setLecturerId(e.target.value)}
                        required fullWidth size="small"
                        placeholder="Enter lecturer ID"
                    />
                    <TextField
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required fullWidth size="small"
                        placeholder="e.g. Discuss final year project progress"
                    />
                    <FormControl size="small" fullWidth required>
                        <InputLabel>Meeting Type</InputLabel>
                        <Select value={meetingType} label="Meeting Type" onChange={(e) => setMeetingType(e.target.value as MeetingType)}>
                            {MEETING_TYPES.map((mt) => (
                                <MenuItem key={mt.value} value={mt.value}>{mt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth multiline rows={3} size="small"
                        placeholder="Provide additional details about the meeting..."
                    />
                    <TextField
                        label="Preferred Date & Time"
                        type="datetime-local"
                        value={preferredDateTime}
                        onChange={(e) => setPreferredDateTime(e.target.value)}
                        required fullWidth size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Preferred Duration (minutes)"
                        type="number"
                        value={preferredDurationMinutes}
                        onChange={(e) => setPreferredDurationMinutes(e.target.value)}
                        required fullWidth size="small"
                        slotProps={{ htmlInput: { min: 5, max: 480 } }}
                    />
                    <FormControl size="small" fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select value={priority} label="Priority" onChange={(e) => setPriority(Number(e.target.value))}>
                            {PRIORITIES.map((p) => (
                                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                >
                    {isSubmitting ? 'Submitting...' : 'Request Meeting'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
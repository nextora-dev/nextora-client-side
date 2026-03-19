'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    IconButton,
    alpha,
    useTheme,
    Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { CreateEventRequest, EventType } from '@/features/event/types';

const EVENT_TYPES: { value: EventType; label: string }[] = [
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'HACKATHON', label: 'Hackathon' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'OTHER', label: 'Other' },
];

interface CreateEventDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateEventRequest, coverImage?: File) => void;
    isCreating: boolean;
}

export function CreateEventDialog({ open, onClose, onSubmit, isCreating }: CreateEventDialogProps) {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [location, setLocation] = useState('');
    const [venue, setVenue] = useState('');
    const [eventType, setEventType] = useState<EventType>('WORKSHOP');
    const [maxAttendees, setMaxAttendees] = useState('');
    const [registrationLink, setRegistrationLink] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);

    // datetime-local gives "2026-06-15T09:00", backend expects "2026-06-15T09:00:00"
    const normalizeDateTime = (dt: string): string => {
        if (!dt) return dt;
        // If it's "YYYY-MM-DDTHH:mm" (16 chars), append ":00"
        if (dt.length === 16) return `${dt}:00`;
        return dt;
    };

    const handleSubmit = () => {
        if (!title.trim() || !startAt || !endAt) return;
        const data: CreateEventRequest = {
            title: title.trim(),
            description: description.trim() || undefined,
            startAt: normalizeDateTime(startAt),
            endAt: normalizeDateTime(endAt),
            location: location.trim() || undefined,
            venue: venue.trim() || undefined,
            eventType,
            maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
            registrationLink: registrationLink.trim() || undefined,
        };
        onSubmit(data, coverImage || undefined);
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setStartAt('');
        setEndAt('');
        setLocation('');
        setVenue('');
        setEventType('WORKSHOP');
        setMaxAttendees('');
        setRegistrationLink('');
        setCoverImage(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, fontSize: '1.25rem', fontWeight: 700 }}>
                Create Event
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
                <TextField
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />

                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        label="Start Date & Time"
                        type="datetime-local"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        required
                        fullWidth
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        label="End Date & Time"
                        type="datetime-local"
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                        required
                        fullWidth
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        label="Venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Event Type</InputLabel>
                        <Select
                            value={eventType}
                            label="Event Type"
                            onChange={(e) => setEventType(e.target.value as EventType)}
                            sx={{ borderRadius: 1 }}
                        >
                            {EVENT_TYPES.map((t) => (
                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Max Attendees"
                        type="number"
                        value={maxAttendees}
                        onChange={(e) => setMaxAttendees(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                </Stack>

                <TextField
                    label="Registration Link (optional)"
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />

                {/* Cover Image Upload */}
                <Box>
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        size="small"
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                        }}
                    >
                        {coverImage ? coverImage.name : 'Upload Cover Image'}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        />
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} sx={{ textTransform: 'none', borderRadius: 1 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !startAt || !endAt || isCreating}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 1,
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` },
                    }}
                >
                    {isCreating ? 'Creating...' : 'Create Event'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Stack, Typography, alpha, useTheme, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ReportLostItemRequest, ReportFoundItemRequest } from '@/features/lostfound/types';

interface ReportItemDialogProps {
    open: boolean;
    onClose: () => void;
    type: 'LOST' | 'FOUND';
    categories: string[];
    isSubmitting: boolean;
    onSubmitLost?: (data: ReportLostItemRequest) => void;
    onSubmitFound?: (data: ReportFoundItemRequest) => void;
}

const DEFAULT_CATEGORIES = [
    'Electronics', 'Clothing', 'Accessories', 'Books', 'Keys',
    'ID Cards', 'Bags', 'Stationery', 'Sports Equipment', 'Other',
];

export default function ReportItemDialog({
    open, onClose, type, categories, isSubmitting, onSubmitLost, onSubmitFound,
}: ReportItemDialogProps) {
    const theme = useTheme();
    const allCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [dateField, setDateField] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');

    useEffect(() => {
        if (open) {
            setTitle(''); setDescription(''); setCategory('');
            setLocation(''); setContactNumber(''); setDateField(''); setPickupLocation('');
        }
    }, [open]);

    const isValid = title.trim() && description.trim() && category && location.trim() && contactNumber.trim() && dateField;

    const handleSubmit = () => {
        if (!isValid) return;
        if (type === 'LOST' && onSubmitLost) {
            onSubmitLost({
                title: title.trim(),
                description: description.trim(),
                category,
                location: location.trim(),
                contactNumber: contactNumber.trim(),
                dateLost: new Date(dateField).toISOString(),
            });
        } else if (type === 'FOUND' && onSubmitFound) {
            onSubmitFound({
                title: title.trim(),
                description: description.trim(),
                category,
                location: location.trim(),
                contactNumber: contactNumber.trim(),
                dateFound: new Date(dateField).toISOString(),
                pickupLocation: pickupLocation.trim() || location.trim(),
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>
                    Report {type === 'LOST' ? 'Lost' : 'Found'} Item
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth size="small" placeholder="e.g. Silver MacBook Pro 14-inch" />
                    <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required fullWidth multiline rows={3} size="small" placeholder="Detailed description to help identify the item..." />
                    <FormControl size="small" fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                            {allCategories.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required fullWidth size="small" placeholder="e.g. Block A - Computer Lab 1" />
                    <TextField label="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required fullWidth size="small" placeholder="+94771234567" />
                    <TextField
                        label={type === 'LOST' ? 'Date Lost' : 'Date Found'}
                        type="datetime-local"
                        value={dateField}
                        onChange={(e) => setDateField(e.target.value)}
                        required fullWidth size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    {type === 'FOUND' && (
                        <TextField label="Pickup Location" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} fullWidth size="small" placeholder="e.g. Student Services Office" />
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: type === 'LOST' ? '#EF4444' : '#10B981', '&:hover': { bgcolor: type === 'LOST' ? '#DC2626' : '#059669' } }}
                >
                    {isSubmitting ? 'Submitting...' : `Report ${type === 'LOST' ? 'Lost' : 'Found'}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

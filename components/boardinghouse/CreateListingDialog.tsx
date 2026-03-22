import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Grid, FormControl, InputLabel, Select, MenuItem,
    Stack, Typography, Chip, IconButton, Box, CircularProgress,
    alpha, useTheme, InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import type { CreateBoardingHouseRequest, GenderPreference } from '@/features/boardinghouse/types';

const COMMON_AMENITIES = ['WiFi', 'Meals', 'Laundry', 'Hot Water', 'AC', 'Parking', 'CCTV', 'Security', 'Study Room', 'Kitchen'];

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBoardingHouseRequest) => void;
    isCreating: boolean;
    initialData?: Partial<CreateBoardingHouseRequest>;
    title?: string;
};

export default function CreateListingDialog({ open, onClose, onSubmit, isCreating, initialData, title = 'Create New Listing' }: Props) {
    const theme = useTheme();
    const [formData, setFormData] = useState<CreateBoardingHouseRequest>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        address: initialData?.address || '',
        city: initialData?.city || '',
        district: initialData?.district || '',
        genderPreference: initialData?.genderPreference || 'ANY',
        totalRooms: initialData?.totalRooms || undefined,
        availableRooms: initialData?.availableRooms || undefined,
        contactName: initialData?.contactName || '',
        contactPhone: initialData?.contactPhone || '',
        contactEmail: initialData?.contactEmail || '',
        amenities: initialData?.amenities || [],
        isAvailable: initialData?.isAvailable ?? true,
    });
    const [customAmenity, setCustomAmenity] = useState('');

    const updateField = (field: keyof CreateBoardingHouseRequest, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (amenity: string) => {
        const current = formData.amenities || [];
        if (current.includes(amenity)) {
            updateField('amenities', current.filter((a) => a !== amenity));
        } else {
            updateField('amenities', [...current, amenity]);
        }
    };

    const addCustomAmenity = () => {
        if (customAmenity.trim() && !(formData.amenities || []).includes(customAmenity.trim())) {
            updateField('amenities', [...(formData.amenities || []), customAmenity.trim()]);
            setCustomAmenity('');
        }
    };

    const isValid = formData.title.trim() && formData.price > 0 && formData.address.trim() &&
        formData.city.trim() && formData.district.trim() && formData.contactName.trim() && formData.contactPhone.trim();

    const handleSubmit = () => {
        if (isValid) onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight={700}>{title}</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Title"
                            fullWidth
                            required
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="e.g., Spacious Room Near IIT Colombo"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Monthly Price (Rs.)"
                            fullWidth
                            required
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                            InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Gender Preference</InputLabel>
                            <Select
                                value={formData.genderPreference}
                                label="Gender Preference"
                                onChange={(e) => updateField('genderPreference', e.target.value as GenderPreference)}
                            >
                                <MenuItem value="ANY">Any Gender</MenuItem>
                                <MenuItem value="MALE">Male Only</MenuItem>
                                <MenuItem value="FEMALE">Female Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Address"
                            fullWidth
                            required
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="City"
                            fullWidth
                            required
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="District"
                            fullWidth
                            required
                            value={formData.district}
                            onChange={(e) => updateField('district', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Total Rooms"
                            fullWidth
                            type="number"
                            value={formData.totalRooms ?? ''}
                            onChange={(e) => updateField('totalRooms', parseInt(e.target.value) || undefined)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Available Rooms"
                            fullWidth
                            type="number"
                            value={formData.availableRooms ?? ''}
                            onChange={(e) => updateField('availableRooms', parseInt(e.target.value) || undefined)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Contact Name"
                            fullWidth
                            required
                            value={formData.contactName}
                            onChange={(e) => updateField('contactName', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Contact Phone"
                            fullWidth
                            required
                            value={formData.contactPhone}
                            onChange={(e) => updateField('contactPhone', e.target.value)}
                            placeholder="+94771234567"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Contact Email"
                            fullWidth
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => updateField('contactEmail', e.target.value)}
                        />
                    </Grid>

                    {/* Amenities */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Amenities</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                            {COMMON_AMENITIES.map((amenity) => (
                                <Chip
                                    key={amenity}
                                    label={amenity}
                                    size="small"
                                    onClick={() => toggleAmenity(amenity)}
                                    variant={(formData.amenities || []).includes(amenity) ? 'filled' : 'outlined'}
                                    color={(formData.amenities || []).includes(amenity) ? 'primary' : 'default'}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Add custom amenity"
                                value={customAmenity}
                                onChange={(e) => setCustomAmenity(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
                            />
                            <IconButton size="small" onClick={addCustomAmenity}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        {(formData.amenities || []).filter((a) => !COMMON_AMENITIES.includes(a)).length > 0 && (
                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                {(formData.amenities || []).filter((a) => !COMMON_AMENITIES.includes(a)).map((amenity) => (
                                    <Chip
                                        key={amenity}
                                        label={amenity}
                                        size="small"
                                        color="primary"
                                        onDelete={() => toggleAmenity(amenity)}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isCreating}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValid || isCreating}
                    startIcon={isCreating ? <CircularProgress size={16} /> : undefined}
                >
                    {isCreating ? 'Creating...' : 'Create Listing'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

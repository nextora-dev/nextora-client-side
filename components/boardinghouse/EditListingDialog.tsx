import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Grid, FormControl, InputLabel, Select, MenuItem,
    Stack, Typography, Chip, IconButton, CircularProgress,
    InputAdornment, Switch, FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import type { BoardingHouseResponse, UpdateBoardingHouseRequest, GenderPreference } from '@/features/boardinghouse/types';

const COMMON_AMENITIES = ['WiFi', 'Meals', 'Laundry', 'Hot Water', 'AC', 'Parking', 'CCTV', 'Security', 'Study Room', 'Kitchen'];

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: UpdateBoardingHouseRequest) => void;
    listing: BoardingHouseResponse | null;
    isUpdating: boolean;
};

export default function EditListingDialog({ open, onClose, onSubmit, listing, isUpdating }: Props) {
    const [formData, setFormData] = useState<UpdateBoardingHouseRequest>({});
    const [customAmenity, setCustomAmenity] = useState('');

    useEffect(() => {
        if (listing) {
            setFormData({
                title: listing.title,
                description: listing.description || '',
                price: listing.price,
                address: listing.address,
                city: listing.city,
                district: listing.district,
                genderPreference: listing.genderPreference,
                totalRooms: listing.totalRooms ?? undefined,
                availableRooms: listing.availableRooms ?? undefined,
                contactName: listing.contactName,
                contactPhone: listing.contactPhone,
                contactEmail: listing.contactEmail || '',
                amenities: listing.amenities || [],
                isAvailable: listing.isAvailable,
            });
        }
    }, [listing]);

    const updateField = (field: keyof UpdateBoardingHouseRequest, value: unknown) => {
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

    const handleSubmit = () => {
        if (listing) onSubmit(listing.id, formData);
    };

    if (!listing) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight={700}>Edit Listing</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField label="Title" fullWidth value={formData.title || ''} onChange={(e) => updateField('title', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField label="Description" fullWidth multiline rows={3} value={formData.description || ''} onChange={(e) => updateField('description', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Monthly Price (Rs.)"
                            fullWidth
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                            InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Gender Preference</InputLabel>
                            <Select value={formData.genderPreference || 'ANY'} label="Gender Preference" onChange={(e) => updateField('genderPreference', e.target.value as GenderPreference)}>
                                <MenuItem value="ANY">Any Gender</MenuItem>
                                <MenuItem value="MALE">Male Only</MenuItem>
                                <MenuItem value="FEMALE">Female Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField label="Address" fullWidth value={formData.address || ''} onChange={(e) => updateField('address', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="City" fullWidth value={formData.city || ''} onChange={(e) => updateField('city', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="District" fullWidth value={formData.district || ''} onChange={(e) => updateField('district', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField label="Total Rooms" fullWidth type="number" value={formData.totalRooms ?? ''} onChange={(e) => updateField('totalRooms', parseInt(e.target.value) || undefined)} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField label="Available Rooms" fullWidth type="number" value={formData.availableRooms ?? ''} onChange={(e) => updateField('availableRooms', parseInt(e.target.value) || undefined)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Contact Name" fullWidth value={formData.contactName || ''} onChange={(e) => updateField('contactName', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Contact Phone" fullWidth value={formData.contactPhone || ''} onChange={(e) => updateField('contactPhone', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Contact Email" fullWidth type="email" value={formData.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={<Switch checked={formData.isAvailable ?? true} onChange={(e) => updateField('isAvailable', e.target.checked)} />}
                            label="Available"
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
                                    <Chip key={amenity} label={amenity} size="small" color="primary" onDelete={() => toggleAmenity(amenity)} />
                                ))}
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isUpdating}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    startIcon={isUpdating ? <CircularProgress size={16} /> : undefined}
                >
                    {isUpdating ? 'Updating...' : 'Update Listing'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

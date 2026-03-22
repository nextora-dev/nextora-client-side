import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Box, Chip, Divider, Grid, IconButton, alpha, useTheme,
    Avatar, ImageList, ImageListItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import type { BoardingHouseResponse, GenderPreference } from '@/features/boardinghouse/types';

const GENDER_COLORS: Record<GenderPreference, string> = {
    MALE: '#3B82F6',
    FEMALE: '#EC4899',
    ANY: '#10B981',
};

const GENDER_LABELS: Record<GenderPreference, string> = {
    MALE: 'Male Only',
    FEMALE: 'Female Only',
    ANY: 'Any Gender',
};

type Props = {
    open: boolean;
    onClose: () => void;
    listing: BoardingHouseResponse | null;
    isLoading?: boolean;
};

export default function ListingDetailDialog({ open, onClose, listing, isLoading }: Props) {
    const theme = useTheme();

    if (!listing) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight={700}>{listing.title}</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {/* Images */}
                {listing.images && listing.images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <ImageList cols={listing.images.length === 1 ? 1 : 3} gap={8} sx={{ maxHeight: 300 }}>
                            {listing.images.map((img) => (
                                <ImageListItem key={img.id}>
                                    <Box
                                        component="img"
                                        src={img.imageUrl}
                                        alt={`${listing.title} - Image ${img.displayOrder}`}
                                        sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Box>
                )}

                {/* Status & Price Row */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Chip
                        label={listing.isAvailable ? 'Available' : 'Unavailable'}
                        sx={{
                            bgcolor: alpha(listing.isAvailable ? '#10B981' : '#6B7280', 0.1),
                            color: listing.isAvailable ? '#10B981' : '#6B7280',
                            fontWeight: 600,
                        }}
                    />
                    <Chip
                        label={GENDER_LABELS[listing.genderPreference]}
                        sx={{
                            bgcolor: alpha(GENDER_COLORS[listing.genderPreference], 0.1),
                            color: GENDER_COLORS[listing.genderPreference],
                            fontWeight: 600,
                        }}
                    />
                    <Typography variant="h5" fontWeight={700} color="primary">
                        {listing.formattedPrice || `Rs. ${listing.price.toLocaleString()}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">/month</Typography>
                </Stack>

                {/* Description */}
                {listing.description && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Description</Typography>
                        <Typography variant="body2" color="text.secondary">{listing.description}</Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Details Grid */}
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Address</Typography>
                                    <Typography variant="body2">{listing.address}</Typography>
                                    <Typography variant="body2" color="text.secondary">{listing.city}, {listing.district}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <HomeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Rooms</Typography>
                                    <Typography variant="body2">
                                        {listing.availableRooms ?? 0} available / {listing.totalRooms ?? 0} total
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <VisibilityIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Views</Typography>
                                    <Typography variant="body2">{listing.viewCount}</Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Contact Person</Typography>
                                    <Typography variant="body2">{listing.contactName}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                    <Typography variant="body2">{listing.contactPhone}</Typography>
                                </Box>
                            </Stack>
                            {listing.contactEmail && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2">{listing.contactEmail}</Typography>
                                    </Box>
                                </Stack>
                            )}
                        </Stack>
                    </Grid>
                </Grid>

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Amenities</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {listing.amenities.map((amenity, i) => (
                                <Chip key={i} label={amenity} size="small" variant="outlined" />
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Posted By */}
                <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            {listing.postedByName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>Posted by {listing.postedByName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

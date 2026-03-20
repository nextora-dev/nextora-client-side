'use client';

import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Chip, Box, alpha, useTheme, IconButton,
    Avatar, Divider, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import PlaceIcon from '@mui/icons-material/Place';
import type { LostItemResponse, FoundItemResponse } from '@/features/lostfound/types';

interface ItemDetailDialogProps {
    open: boolean;
    onClose: () => void;
    lostItem?: LostItemResponse | null;
    foundItem?: FoundItemResponse | null;
    isLoading?: boolean;
}

export default function ItemDetailDialog({ open, onClose, lostItem, foundItem, isLoading }: ItemDetailDialogProps) {
    const theme = useTheme();
    const item = lostItem || foundItem;
    const isLost = !!lostItem;

    if (!item && !isLoading) return null;

    const dateLabel = isLost ? 'Date Lost' : 'Date Found';
    const dateValue = isLost ? (lostItem as LostItemResponse)?.dateLost : (foundItem as FoundItemResponse)?.dateFound;
    const accentColor = isLost ? '#EF4444' : '#10B981';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.4)})` }} />
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        label={isLost ? 'Lost' : 'Found'}
                        size="small"
                        sx={{ bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700, fontSize: '0.7rem' }}
                    />
                    <Typography variant="h6" component="span" fontWeight={700} noWrap sx={{ maxWidth: 300 }}>
                        {item?.title}
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : item ? (
                    <Stack spacing={2.5}>
                        {/* Images */}
                        {item.imageUrls && item.imageUrls.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                {item.imageUrls.map((url, i) => (
                                    <Box
                                        key={i}
                                        component="img"
                                        src={url}
                                        alt={`${item.title} image ${i + 1}`}
                                        sx={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider', flexShrink: 0 }}
                                    />
                                ))}
                            </Stack>
                        )}

                        {/* Status */}
                        <Stack direction="row" spacing={1}>
                            <Chip
                                label={item.active ? 'Active' : 'Resolved'}
                                size="small"
                                sx={{
                                    bgcolor: alpha(item.active ? '#10B981' : '#6B7280', 0.1),
                                    color: item.active ? '#10B981' : '#6B7280',
                                    fontWeight: 600, fontSize: '0.7rem',
                                }}
                            />
                            <Chip
                                icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                                label={item.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                        </Stack>

                        {/* Description */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Description</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {item.description}
                            </Typography>
                        </Box>

                        <Divider />

                        {/* Details Grid */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LocationOnIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                <Typography variant="body2"><strong>Location:</strong> {item.location}</Typography>
                            </Stack>
                            {!isLost && (foundItem as FoundItemResponse)?.pickupLocation && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PlaceIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2"><strong>Pickup:</strong> {(foundItem as FoundItemResponse).pickupLocation}</Typography>
                                </Stack>
                            )}
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                <Typography variant="body2"><strong>{dateLabel}:</strong> {dateValue ? new Date(dateValue).toLocaleString() : 'N/A'}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                <Typography variant="body2"><strong>Contact:</strong> {item.contactNumber}</Typography>
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Reporter */}
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(accentColor, 0.15), color: accentColor, fontWeight: 700, fontSize: '0.8rem' }}>
                                {item.reportedByName?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>{item.reportedByName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Reported {new Date(item.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 1, textTransform: 'none' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

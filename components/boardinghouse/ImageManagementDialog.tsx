import React, { useRef, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Box, IconButton, ImageList, ImageListItem,
    ImageListItemBar, Chip, CircularProgress, alpha, useTheme, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { BoardingHouseImageResponse } from '@/features/boardinghouse/types';

type Props = {
    open: boolean;
    onClose: () => void;
    houseId: number;
    images: BoardingHouseImageResponse[];
    isLoading: boolean;
    onUpload: (houseId: number, files: File[]) => void;
    onSetPrimary: (houseId: number, imageId: number) => void;
    onDeleteImage: (houseId: number, imageId: number) => void;
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

export default function ImageManagementDialog({ open, onClose, houseId, images, isLoading, onUpload, onSetPrimary, onDeleteImage }: Props) {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setError(null);

        if (images.length + files.length > MAX_IMAGES) {
            setError(`Maximum ${MAX_IMAGES} images allowed. You can upload ${MAX_IMAGES - images.length} more.`);
            return;
        }

        const validFiles: File[] = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`${file.name}: Only JPEG, PNG, and WebP images are allowed.`);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(`${file.name}: File size exceeds 5MB limit.`);
                return;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            onUpload(houseId, validFiles);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight={700}>Manage Images</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {images.length} / {MAX_IMAGES} images uploaded
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={isLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || images.length >= MAX_IMAGES}
                        size="small"
                    >
                        Upload Images
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        hidden
                        onChange={handleFileSelect}
                    />
                </Stack>

                {images.length > 0 ? (
                    <ImageList cols={3} gap={8}>
                        {images.map((img) => (
                            <ImageListItem key={img.id} sx={{ borderRadius: 1, overflow: 'hidden', border: img.isPrimary ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent' }}>
                                <Box
                                    component="img"
                                    src={img.imageUrl}
                                    alt={`Image ${img.displayOrder}`}
                                    sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                                />
                                <ImageListItemBar
                                    sx={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}
                                    actionIcon={
                                        <Stack direction="row" spacing={0.5} sx={{ pr: 1 }}>
                                            {img.isPrimary ? (
                                                <Chip label="Primary" size="small" icon={<StarIcon />} color="primary" sx={{ height: 24 }} />
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onSetPrimary(houseId, img.id)}
                                                    sx={{ color: 'white' }}
                                                    title="Set as primary"
                                                >
                                                    <StarBorderIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={() => onDeleteImage(houseId, img.id)}
                                                sx={{ color: '#EF4444' }}
                                                title="Delete image"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    }
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                ) : (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">No images uploaded yet</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

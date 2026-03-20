'use client';

import React, { useState, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Box, alpha, useTheme, IconButton,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { LostItemImageResponse } from '@/features/lostfound/types';

interface ImageUploadDialogProps {
    open: boolean;
    onClose: () => void;
    images: LostItemImageResponse[];
    isLoading: boolean;
    onUpload: (files: File[]) => void;
    onDeleteImage?: (imageId: number) => void;
}

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploadDialog({ open, onClose, images, isLoading, onUpload, onDeleteImage }: ImageUploadDialogProps) {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > MAX_FILES) {
            setFileError(`Maximum ${MAX_FILES} images per item`);
            return;
        }
        const invalid = files.find((f) => !ACCEPTED_TYPES.includes(f.type));
        if (invalid) { setFileError('Only JPEG, PNG, WebP files allowed'); return; }
        const tooLarge = files.find((f) => f.size > MAX_SIZE);
        if (tooLarge) { setFileError('Each file must be under 5MB'); return; }
        setSelectedFiles(files);
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles);
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700}>Manage Images</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {/* Existing Images */}
                    {images.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Current Images ({images.length}/{MAX_FILES})</Typography>
                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                {images.map((img) => (
                                    <Box key={img.id} sx={{ position: 'relative', flexShrink: 0 }}>
                                        <Box
                                            component="img" src={img.imageUrl} alt="item"
                                            sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                                        />
                                        {onDeleteImage && (
                                            <IconButton
                                                size="small" onClick={() => onDeleteImage(img.id)}
                                                sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(239,68,68,0.9)' }, width: 24, height: 24 }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Upload */}
                    {images.length < MAX_FILES && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Upload New Images</Typography>
                            <Box
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 1,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                }}
                            >
                                <CloudUploadIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Click to select images (JPEG, PNG, WebP, max 5MB)
                                </Typography>
                                {selectedFiles.length > 0 && (
                                    <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                                        {selectedFiles.length} file(s) selected
                                    </Typography>
                                )}
                            </Box>
                            <input ref={fileInputRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} />
                            {fileError && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{fileError}</Typography>}
                        </Box>
                    )}

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 1, textTransform: 'none' }}>Close</Button>
                {selectedFiles.length > 0 && (
                    <Button variant="contained" onClick={handleUpload} disabled={isLoading} startIcon={<CloudUploadIcon />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
                        Upload
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

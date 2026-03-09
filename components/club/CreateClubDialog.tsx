'use client';

import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    FormControlLabel,
    Switch,
    IconButton,
    CircularProgress,
    Typography,
    Avatar,
    alpha,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { FACULTY_LABELS } from '@/constants/faculty';
import type { CreateClubRequest } from '@/features/club/types';

interface CreateClubDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateClubRequest, logo?: File) => void;
    isCreating: boolean;
}

export function CreateClubDialog({ open, onClose, onSubmit, isCreating }: CreateClubDialogProps) {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [faculty, setFaculty] = useState('');
    const [registrationOpen, setRegistrationOpen] = useState(true);
    const [logo, setLogo] = useState<File | undefined>();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!name.trim() || !faculty.trim()) return;
        onSubmit({ name, description, faculty, registrationOpen }, logo);
    };

    const handleClose = () => {
        if (isCreating) return;
        setName('');
        setDescription('');
        setFaculty('');
        setRegistrationOpen(true);
        setLogo(undefined);
        setLogoPreview(null);
        onClose();
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onload = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogo(undefined);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isValid = name.trim().length > 0 && faculty.trim().length > 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                },
            }}
        >
            {/* Gradient Header */}
            <Box
                sx={{
                    height: 80,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha('#6366F1', 0.7)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    position: 'relative',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <GroupsIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
                            Create New Club
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Set up a new university club
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    size="small"
                    onClick={handleClose}
                    disabled={isCreating}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Logo Upload */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={logoPreview || undefined}
                            sx={{
                                width: 72,
                                height: 72,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                },
                            }}
                            onClick={() => !isCreating && fileInputRef.current?.click()}
                        >
                            {!logoPreview && <AddPhotoAlternateIcon sx={{ fontSize: 28 }} />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                                Club Logo
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Upload a logo (JPEG, PNG). Max 5MB.
                            </Typography>
                            {logo && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip
                                        label={logo.name}
                                        size="small"
                                        onDelete={handleRemoveLogo}
                                        sx={{ fontSize: '0.7rem', maxWidth: 200 }}
                                    />
                                </Box>
                            )}
                        </Box>
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleLogoChange}
                        />
                    </Box>

                    <TextField
                        label="Club Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                        disabled={isCreating}
                        placeholder="e.g. Computer Science Society"
                        error={name.length > 0 && name.trim().length === 0}
                        helperText={name.length > 0 && name.trim().length === 0 ? 'Club name is required' : ''}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        }}
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={isCreating}
                        placeholder="Describe the club's purpose, activities, and goals..."
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        }}
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Faculty</InputLabel>
                        <Select
                            value={faculty}
                            label="Faculty"
                            onChange={(e) => setFaculty(e.target.value)}
                            disabled={isCreating}
                            sx={{ borderRadius: 2 }}
                        >
                            {Object.entries(FACULTY_LABELS).map(([value, label]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            bgcolor: alpha(registrationOpen ? theme.palette.success.main : theme.palette.grey[500], 0.04),
                        }}
                    >
                        <Box>
                            <Typography variant="body2" fontWeight={600}>Open Registration</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {registrationOpen ? 'Students can join this club' : 'Registration is closed'}
                            </Typography>
                        </Box>
                        <Switch
                            checked={registrationOpen}
                            onChange={(e) => setRegistrationOpen(e.target.checked)}
                            disabled={isCreating}
                            color="success"
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={isCreating}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValid || isCreating}
                    startIcon={isCreating ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` },
                    }}
                >
                    {isCreating ? 'Creating...' : 'Create Club'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

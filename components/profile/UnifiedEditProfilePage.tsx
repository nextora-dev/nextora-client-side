/**
 * @fileoverview Unified Edit Profile Page Component
 * @description Industry-standard reusable edit profile page that works for all user roles
 */

'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Avatar,
    Stack,
    Alert,
    IconButton,
    Paper,
    useTheme,
    alpha,
    CircularProgress,
    InputAdornment,
    Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { RoleEditForm, RoleBadge } from '@/components/profile';
import { updateProfile, UpdateProfilePayload } from '@/features/users/services';
import { useAppDispatch } from '@/store';
import { fetchUserProfile } from '@/features/users/userSlice';
import { isStudentProfile, isAcademicStaffProfile, isNonAcademicStaffProfile } from '@/features';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface UnifiedEditProfilePageProps {
    /** Base path for navigation */
    basePath?: string;
}

export default function UnifiedEditProfilePage({ basePath }: UnifiedEditProfilePageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { profile, isLoading, error, refetch } = useProfile({ forceRefresh: true });

    // Derive profile path
    const profilePath = pathname.replace('/edit', '');

    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [deleteProfilePicture, setDeleteProfilePicture] = useState(false);

    // Basic profile form state
    const [basicFormData, setBasicFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    // Role-specific form state
    const [roleFormData, setRoleFormData] = useState<Record<string, string | boolean>>({});

    // Form errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form with profile data
    useEffect(() => {
        if (profile) {
            setBasicFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phoneNumber: profile.phoneNumber || '',
            });
            if (profile.roleSpecificData) {
                setRoleFormData({ ...profile.roleSpecificData } as Record<string, string | boolean>);
            }
        }
    }, [profile]);

    const handleBasicInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setBasicFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleRoleDataChange = (field: string, value: string | boolean) => {
        setRoleFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB as per backend)
            if (file.size > 5 * 1024 * 1024) {
                setSnackbar({ open: true, message: 'Image size must be less than 5MB', severity: 'error' });
                return;
            }
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setSnackbar({ open: true, message: 'Only JPEG, PNG, GIF, and WebP images are allowed', severity: 'error' });
                return;
            }
            // Store the file for upload
            setSelectedFile(file);
            setDeleteProfilePicture(false);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setSelectedFile(null);
        setDeleteProfilePicture(true);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!basicFormData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!basicFormData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (basicFormData.phoneNumber && !/^(\+94|0)?[0-9]{9,10}$/.test(basicFormData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Invalid phone number format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setSnackbar({ open: true, message: 'Please fix the errors before saving', severity: 'error' });
            return;
        }

        if (!profile) {
            setSnackbar({ open: true, message: 'No profile data available', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            // Build the update payload matching backend @RequestParam fields
            const updatePayload: UpdateProfilePayload = {
                firstName: basicFormData.firstName || undefined,
                lastName: basicFormData.lastName || undefined,
                phone: basicFormData.phoneNumber || undefined, // Backend uses 'phone'
            };

            // Add role-specific fields based on user role
            if (isStudentProfile(profile)) {
                // Student specific fields
                updatePayload.address = roleFormData.address as string || undefined;
                updatePayload.guardianName = roleFormData.guardianName as string || undefined;
                updatePayload.guardianPhone = roleFormData.guardianPhone as string || undefined;
                updatePayload.dateOfBirth = roleFormData.dateOfBirth as string || undefined;
            }

            // Add profile picture if selected
            if (selectedFile) {
                updatePayload.profilePicture = selectedFile;
            }

            // Add delete flag if user wants to remove profile picture
            if (deleteProfilePicture) {
                updatePayload.deleteProfilePicture = true;
            }

            console.log('[EditProfile] Saving profile with payload:', {
                ...updatePayload,
                profilePicture: selectedFile ? `File: ${selectedFile.name}` : undefined,
            });

            // Call the API to update profile
            const updatedProfile = await updateProfile(updatePayload);
            console.log('[EditProfile] Profile updated successfully:', updatedProfile);

            // Refresh the profile in Redux store
            dispatch(fetchUserProfile());

            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
            setTimeout(() => router.push(profilePath), 1500);
        } catch (err) {
            console.error('[EditProfile] Error saving profile:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Loading state
    if (isLoading && !profile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Error state
    if (error && !profile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={refetch}>Try Again</Button>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Typography>No profile data available</Typography>
            </Box>
        );
    }

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton
                                onClick={() => router.push(profilePath)}
                                sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.3) } }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h5" fontWeight={700} color="white">Edit Profile</Typography>
                                <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                                    Update your personal information
                                </Typography>
                            </Box>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: alpha('#fff', 0.9) }, display: { xs: 'none', sm: 'flex' } }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Stack>
                </Paper>
            </MotionBox>

            <Grid container spacing={3}>
                {/* Left Column - Avatar & Account Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* Profile Picture */}
                        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Profile Picture</Typography>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                    <Avatar
                                        src={avatarPreview || profile.profilePictureUrl || undefined}
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            bgcolor: theme.palette.primary.main,
                                            fontSize: '3rem',
                                            fontWeight: 700,
                                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}
                                    >
                                        {!avatarPreview && !profile.profilePictureUrl && `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`}
                                    </Avatar>
                                    <IconButton
                                        component="label"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,
                                            right: 4,
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            '&:hover': { bgcolor: theme.palette.primary.dark },
                                        }}
                                    >
                                        <CameraAltIcon />
                                        <input type="file" hidden accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarChange} />
                                    </IconButton>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    JPEG, PNG, GIF, or WebP. Max 5MB
                                </Typography>
                                <Stack direction="row" spacing={1} justifyContent="center">
                                    <Button variant="outlined" startIcon={<CloudUploadIcon />} component="label" size="small">
                                        Upload
                                        <input type="file" hidden accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarChange} />
                                    </Button>
                                    {(avatarPreview || profile.profilePictureUrl) && (
                                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveAvatar} size="small">
                                            Remove
                                        </Button>
                                    )}
                                </Stack>
                            </CardContent>
                        </MotionCard>

                        {/* Account Info (Read-only) */}
                        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Account Info</Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Role</Typography>
                                        <Box sx={{ mt: 1 }}><RoleBadge role={profile.role} /></Box>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.04), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                        <Typography variant="body1" fontWeight={600} color="success.main">{profile.status}</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2" fontWeight={500}>{profile.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">Cannot be changed</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Stack>
                </Grid>

                {/* Right Column - Forms */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* Basic Information */}
                        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                        <PersonIcon sx={{ color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>Basic Information</Typography>
                                </Stack>

                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="First Name"
                                            fullWidth
                                            value={basicFormData.firstName}
                                            onChange={handleBasicInputChange('firstName')}
                                            error={!!errors.firstName}
                                            helperText={errors.firstName}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Last Name"
                                            fullWidth
                                            value={basicFormData.lastName}
                                            onChange={handleBasicInputChange('lastName')}
                                            error={!!errors.lastName}
                                            helperText={errors.lastName}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Email"
                                            fullWidth
                                            value={profile.email}
                                            disabled
                                            helperText="Contact admin to change"
                                            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Phone Number"
                                            fullWidth
                                            value={basicFormData.phoneNumber}
                                            onChange={handleBasicInputChange('phoneNumber')}
                                            error={!!errors.phoneNumber}
                                            helperText={errors.phoneNumber || 'e.g., +94 77 123 4567'}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </MotionCard>

                        {/* Role-Specific Edit Form */}
                        <RoleEditForm profile={profile} onRoleDataChange={handleRoleDataChange} errors={errors} formValues={roleFormData} />

                        {/* Action Buttons */}
                        <MotionBox variants={itemVariants}>
                            <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                <Button variant="outlined" onClick={() => router.push(profilePath)} sx={{ px: 4 }}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving}
                                    sx={{ px: 4 }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Stack>
                        </MotionBox>
                    </Stack>
                </Grid>
            </Grid>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} sx={{ borderRadius: 2 }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MotionBox>
    );
}


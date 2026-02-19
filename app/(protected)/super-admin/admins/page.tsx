'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Stack, Button, TextField, IconButton,
    Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
    DialogActions, InputAdornment, Alert, Snackbar,
    CircularProgress, Tooltip, alpha, useTheme, Divider, useMediaQuery, Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestoreIcon from '@mui/icons-material/Restore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BusinessIcon from '@mui/icons-material/Business';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchAdminUsers,
    fetchAdminUserById,
    createAdminUserManagementAsync,
    updateAdminUserAsync,
    softDeleteAdminUserAsync,
    permanentDeleteAdminUserAsync,
    restoreAdminUserAsync,
    clearSelectedAdminDetail,
    clearAdminMgmtSuccessMessage,
    selectAdminMgmtUsers,
    selectSelectedAdminDetail,
    selectIsAdminDetailLoading,
    selectIsAdminUsersLoading,
    selectIsCreatingAdminUser,
    selectIsUpdatingAdminUser,
    selectIsSoftDeletingAdmin,
    selectIsPermanentDeletingAdmin,
    selectIsRestoringAdmin,
    selectAdminMgmtError,
    selectAdminMgmtCreateError,
    selectAdminMgmtUpdateError,
    selectAdminMgmtDeleteError,
    selectAdminMgmtRestoreError,
    selectAdminMgmtSuccessMessage,
} from '@/features/super-admin';
import { AdminUser, CreateAdminRequest, UpdateAdminRequest } from '@/features/super-admin';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: '#22C55E',
    DEACTIVATED: '#F59E0B',
    SUSPENDED: '#EF4444',
    DELETED: '#6B7280',
    PASSWORD_CHANGE_REQUIRED: '#8B5CF6',
};

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Active',
    DEACTIVATED: 'Deactivated',
    SUSPENDED: 'Suspended',
    DELETED: 'Deleted',
    PASSWORD_CHANGE_REQUIRED: 'Password Change',
};

type ConfirmActionType = 'softDelete' | 'restore' | 'permanentDelete';

interface EditFormData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
}

export default function AdminManagementPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useAppDispatch();

    // Redux selectors
    const adminUsers = useAppSelector(selectAdminMgmtUsers);
    const selectedAdminDetail = useAppSelector(selectSelectedAdminDetail);
    const isAdminDetailLoading = useAppSelector(selectIsAdminDetailLoading);
    const loading = useAppSelector(selectIsAdminUsersLoading);
    const isCreating = useAppSelector(selectIsCreatingAdminUser);
    const isUpdating = useAppSelector(selectIsUpdatingAdminUser);
    const isSoftDeleting = useAppSelector(selectIsSoftDeletingAdmin);
    const isPermanentDeleting = useAppSelector(selectIsPermanentDeletingAdmin);
    const isRestoring = useAppSelector(selectIsRestoringAdmin);
    const error = useAppSelector(selectAdminMgmtError);
    const createError = useAppSelector(selectAdminMgmtCreateError);
    const updateError = useAppSelector(selectAdminMgmtUpdateError);
    const deleteError = useAppSelector(selectAdminMgmtDeleteError);
    const restoreError = useAppSelector(selectAdminMgmtRestoreError);
    const successMessage = useAppSelector(selectAdminMgmtSuccessMessage);

    // Local state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmActionType | null>(null);
    const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] = useState('');

    // Form states
    const [formData, setFormData] = useState<Partial<CreateAdminRequest>>({});
    const [editFormData, setEditFormData] = useState<EditFormData>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch admin users on mount only
    useEffect(() => {
        dispatch(fetchAdminUsers({ page: 0, size: 100 })); // Fetch all admins for grid display
    }, [dispatch]);

    // Handle success messages
    useEffect(() => {
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearAdminMgmtSuccessMessage());
            dispatch(fetchAdminUsers({ page: 0, size: 100 }));
        }
    }, [successMessage, dispatch]);

    // Handle errors
    useEffect(() => { if (error) setSnackbar({ open: true, message: error, severity: 'error' }); }, [error]);
    useEffect(() => { if (createError) setSnackbar({ open: true, message: createError, severity: 'error' }); }, [createError]);
    useEffect(() => { if (updateError) setSnackbar({ open: true, message: updateError, severity: 'error' }); }, [updateError]);
    useEffect(() => { if (deleteError) setSnackbar({ open: true, message: deleteError, severity: 'error' }); }, [deleteError]);
    useEffect(() => { if (restoreError) setSnackbar({ open: true, message: restoreError, severity: 'error' }); }, [restoreError]);

    // Populate edit form
    useEffect(() => {
        if (selectedAdminDetail && editDialogOpen) {
            // Get phone from various possible field names
            const phone = selectedAdminDetail.phone ||
                          selectedAdminDetail.phoneNumber ||
                          (selectedAdminDetail.roleSpecificData as Record<string, unknown>)?.phone as string ||
                          (selectedAdminDetail.roleSpecificData as Record<string, unknown>)?.phoneNumber as string || '';
            // Get department from direct field or roleSpecificData
            const department = selectedAdminDetail.department ||
                               selectedAdminDetail.roleSpecificData?.department || '';

            setEditFormData({
                firstName: selectedAdminDetail.firstName,
                lastName: selectedAdminDetail.lastName,
                phone: phone,
                department: department,
            });
        }
    }, [selectedAdminDetail, editDialogOpen]);

    // Handlers
    const handleRefresh = useCallback(() => {
        dispatch(fetchAdminUsers({ page: 0, size: 100 }));
    }, [dispatch]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, admin: AdminUser) => {
        setAnchorEl(event.currentTarget);
        setSelectedAdmin(admin);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleViewAdmin = () => {
        handleMenuClose();
        if (!selectedAdmin) return;
        setViewDialogOpen(true);
        dispatch(clearSelectedAdminDetail());
        dispatch(fetchAdminUserById(selectedAdmin.id));
    };

    const handleEditAdmin = () => {
        handleMenuClose();
        if (selectedAdmin) {
            setEditFormData({});
            setFormErrors({});
            dispatch(clearSelectedAdminDetail());
            dispatch(fetchAdminUserById(selectedAdmin.id));
        }
        setEditDialogOpen(true);
    };

    const handleStatusAction = (action: ConfirmActionType) => {
        handleMenuClose();
        setConfirmAction(action);
        setPermanentDeleteConfirmText('');
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedAdmin || !confirmAction) return;
        switch (confirmAction) {
            case 'softDelete': dispatch(softDeleteAdminUserAsync(selectedAdmin.id)); break;
            case 'restore': dispatch(restoreAdminUserAsync(selectedAdmin.id)); break;
            case 'permanentDelete':
                if (permanentDeleteConfirmText !== 'DELETE') {
                    setSnackbar({ open: true, message: 'Please type DELETE to confirm', severity: 'error' });
                    return;
                }
                dispatch(permanentDeleteAdminUserAsync(selectedAdmin.id));
                break;
        }
        setConfirmDialogOpen(false);
        setPermanentDeleteConfirmText('');
    };

    const handleCreateAdmin = () => {
        setFormData({});
        setFormErrors({});
        setCreateDialogOpen(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!formData.email?.trim()) errors.email = 'Email is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        if (!formData.password?.trim()) errors.password = 'Password is required';
        if (formData.password && formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
        if (!formData.adminId?.trim()) errors.adminId = 'Admin ID is required';
        if (!formData.department?.trim()) errors.department = 'Department is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCreate = () => {
        if (!validateForm()) return;
        dispatch(createAdminUserManagementAsync({
            email: formData.email!,
            password: formData.password!,
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            adminId: formData.adminId!,
            department: formData.department!,
            phone: formData.phone,
        }));
        setCreateDialogOpen(false);
        setFormData({});
    };

    const handleSubmitEdit = () => {
        if (!selectedAdmin) return;
        const updateData: UpdateAdminRequest = {};
        if (editFormData.firstName) updateData.firstName = editFormData.firstName;
        if (editFormData.lastName) updateData.lastName = editFormData.lastName;
        if (editFormData.phone !== undefined) updateData.phone = editFormData.phone;
        if (editFormData.department !== undefined) updateData.department = editFormData.department;
        if (Object.keys(updateData).length === 0) {
            setSnackbar({ open: true, message: 'No changes to save', severity: 'info' });
            setEditDialogOpen(false);
            return;
        }
        dispatch(updateAdminUserAsync({ adminId: selectedAdmin.id, data: updateData }));
        setEditDialogOpen(false);
        setEditFormData({});
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircleIcon fontSize="small" />;
            case 'DEACTIVATED': return <BlockIcon fontSize="small" />;
            case 'SUSPENDED': return <LockIcon fontSize="small" />;
            case 'DELETED': return <DeleteIcon fontSize="small" />;
            case 'PASSWORD_CHANGE_REQUIRED': return <VpnKeyIcon fontSize="small" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => STATUS_COLORS[status] || theme.palette.grey[500];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }} fontWeight={700} gutterBottom>Admin Management</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Manage administrator accounts (Super Admin Exclusive)</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Refresh">
                            <IconButton onClick={handleRefresh} disabled={loading} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }, borderRadius: 100 }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateAdmin} sx={{ borderRadius: 1 }} size={isMobile ? 'small' : 'medium'}>
                            Create Admin
                        </Button>
                    </Stack>
                </Stack>
            </MotionBox>

            {/* Admin Users Grid - 4 columns */}
            {loading && adminUsers.length === 0 ? (
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={item}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                                    <Stack spacing={1.5} alignItems="center">
                                        <Skeleton variant="circular" width={64} height={64} />
                                        <Skeleton variant="text" width="80%" height={24} />
                                        <Skeleton variant="text" width="60%" height={16} />
                                        <Skeleton variant="rounded" width={80} height={24} />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                        <Skeleton variant="rounded" width={60} height={22} />
                                        <Skeleton variant="text" width={50} height={16} />
                                        <Skeleton variant="circular" width={28} height={28} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : adminUsers.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography color="text.secondary">No admin users found</Typography></Box>
            ) : (
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                    {adminUsers.map((admin) => (
                        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={admin.id}>
                            <MotionCard
                                variants={itemVariants}
                                whileHover={{ y: -4, boxShadow: theme.shadows[4] }}
                                elevation={0}
                                sx={{
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Top Section - Avatar, Name, Email, Role */}
                                    <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ flex: 1 }}>
                                        {/* Avatar */}
                                        <Avatar
                                            src={admin.profilePictureUrl || undefined}
                                            sx={{
                                                width: { xs: 56, sm: 64 },
                                                height: { xs: 56, sm: 64 },
                                                bgcolor: admin.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : theme.palette.error.main,
                                                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                                fontWeight: 600,
                                            }}
                                        >
                                            {admin.firstName?.[0]}{admin.lastName?.[0]}
                                        </Avatar>

                                        {/* Name & Email */}
                                        <Box sx={{ width: '100%' }}>
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }} noWrap>
                                                {admin.fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: { xs: '0.6rem', sm: '0.7rem' } }} noWrap>
                                                {admin.email}
                                            </Typography>
                                        </Box>

                                        {/* Role Chip */}
                                        <Chip
                                            icon={admin.role === 'ROLE_SUPER_ADMIN' ? <SupervisorAccountIcon /> : <AdminPanelSettingsIcon />}
                                            label={admin.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(admin.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : '#EF4444', 0.1),
                                                color: admin.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : '#EF4444',
                                                fontWeight: 500,
                                                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                                height: 24,
                                                '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
                                            }}
                                        />
                                    </Stack>

                                    {/* Bottom Section - Status, Department, Action in one line */}
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{
                                            mt: 2,
                                            pt: 1.5,
                                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        }}
                                    >
                                        {/* Status Chip */}
                                        <Chip
                                            icon={getStatusIcon(admin.status) || undefined}
                                            label={STATUS_LABELS[admin.status]}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(getStatusColor(admin.status), 0.1),
                                                color: getStatusColor(admin.status),
                                                fontWeight: 500,
                                                fontSize: { xs: '0.55rem', sm: '0.6rem' },
                                                height: 22,
                                                '& .MuiChip-icon': { color: 'inherit', fontSize: 12 },
                                                '& .MuiChip-label': { px: 0.75 },
                                            }}
                                        />

                                        {/* Department */}
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: { xs: '0.55rem', sm: '0.6rem' },
                                                flex: 1,
                                                textAlign: 'center',
                                                px: 0.5,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {admin.department || '—'}
                                        </Typography>

                                        {/* Action Button */}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, admin)}
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                                width: 28,
                                                height: 28,
                                            }}
                                        >
                                            <MoreVertIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewAdmin}><VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details</MenuItem>
                <MenuItem onClick={handleEditAdmin}><EditIcon sx={{ mr: 1.5, fontSize: 20 }} />Edit Admin</MenuItem>
                <Divider />
                {selectedAdmin?.status !== 'DELETED' && (
                    <MenuItem onClick={() => handleStatusAction('softDelete')} sx={{ color: 'warning.main' }}><DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />Soft Delete</MenuItem>
                )}
                {selectedAdmin?.status === 'DELETED' && (
                    <MenuItem onClick={() => handleStatusAction('restore')} sx={{ color: 'success.main' }}><RestoreIcon sx={{ mr: 1.5, fontSize: 20 }} />Restore Admin</MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => handleStatusAction('permanentDelete')} sx={{ color: 'error.main' }}><DeleteForeverIcon sx={{ mr: 1.5, fontSize: 20 }} />Permanently Delete</MenuItem>
            </Menu>

            {/* Create Admin Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
                <DialogTitle><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="h6" fontWeight={600}>Create Admin User</Typography><IconButton onClick={() => setCreateDialogOpen(false)} size="small"><CloseIcon /></IconButton></Stack></DialogTitle>
                <DialogContent dividers>
                    <Alert severity="info" sx={{ mb: 2 }}>Admin users have elevated privileges. Please set a secure password.</Alert>
                    <Stack spacing={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} error={!!formErrors.firstName} helperText={formErrors.firstName} required /></Grid>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} error={!!formErrors.lastName} helperText={formErrors.lastName} required /></Grid>
                        </Grid>
                        <TextField label="Email" fullWidth value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                        <TextField label="Password" type="password" fullWidth value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} error={!!formErrors.password} helperText={formErrors.password || 'Minimum 8 characters'} required slotProps={{ input: { startAdornment: <InputAdornment position="start"><VpnKeyIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Admin ID" fullWidth value={formData.adminId || ''} onChange={(e) => setFormData({ ...formData, adminId: e.target.value })} error={!!formErrors.adminId} helperText={formErrors.adminId} required slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} /></Grid>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone" fullWidth value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} /></Grid>
                        </Grid>
                        <TextField label="Department" fullWidth value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} error={!!formErrors.department} helperText={formErrors.department} required slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}><Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleSubmitCreate} disabled={isCreating}>{isCreating ? <CircularProgress size={20} /> : 'Create Admin'}</Button></DialogActions>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
                <DialogTitle><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="h6" fontWeight={600}>Edit Admin</Typography><IconButton onClick={() => setEditDialogOpen(false)} size="small"><CloseIcon /></IconButton></Stack></DialogTitle>
                <DialogContent dividers>
                    {isAdminDetailLoading ? (<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>) : (
                        <Stack spacing={2}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth value={editFormData.firstName || ''} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth value={editFormData.lastName || ''} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} /></Grid>
                            </Grid>
                            <TextField label="Phone" fullWidth value={editFormData.phone || ''} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                            <TextField label="Department" fullWidth value={editFormData.department || ''} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}><Button onClick={() => setEditDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleSubmitEdit} disabled={isUpdating || isAdminDetailLoading}>{isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}</Button></DialogActions>
            </Dialog>

            {/* View Admin Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
                <DialogTitle><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="h6" fontWeight={600}>Admin Details</Typography><IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton></Stack></DialogTitle>
                <DialogContent dividers>
                    {isAdminDetailLoading ? (<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>) : selectedAdminDetail ? (
                        <Stack spacing={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar
                                    src={selectedAdminDetail.profilePictureUrl || undefined}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: selectedAdminDetail.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : theme.palette.error.main,
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {selectedAdminDetail.firstName?.[0]}{selectedAdminDetail.lastName?.[0]}
                                </Avatar>
                                <Typography variant="h6" fontWeight={600}>{selectedAdminDetail.fullName}</Typography>
                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                    <Chip label={selectedAdminDetail.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Admin'} size="small" sx={{ bgcolor: alpha(selectedAdminDetail.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : theme.palette.error.main, 0.1), color: selectedAdminDetail.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : theme.palette.error.main }} />
                                    <Chip icon={getStatusIcon(selectedAdminDetail.status) || undefined} label={STATUS_LABELS[selectedAdminDetail.status]} size="small" sx={{ bgcolor: alpha(getStatusColor(selectedAdminDetail.status), 0.1), color: getStatusColor(selectedAdminDetail.status), '& .MuiChip-icon': { color: 'inherit' } }} />
                                </Stack>
                            </Box>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><EmailIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2">{selectedAdminDetail.email}</Typography></Box></Stack></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><PhoneIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body2">{selectedAdminDetail.phone || selectedAdminDetail.phoneNumber || (selectedAdminDetail.roleSpecificData as Record<string, unknown>)?.phone as string || (selectedAdminDetail.roleSpecificData as Record<string, unknown>)?.phoneNumber as string || 'N/A'}</Typography></Box></Stack></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><BadgeIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">User ID</Typography><Typography variant="body2">{selectedAdminDetail.id}</Typography></Box></Stack></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><BusinessIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{selectedAdminDetail.department || selectedAdminDetail.roleSpecificData?.department || 'N/A'}</Typography></Box></Stack></Grid>
                            </Grid>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Created At</Typography><Typography variant="body2">{new Date(selectedAdminDetail.createdAt).toLocaleString()}</Typography></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Last Updated</Typography><Typography variant="body2">{new Date(selectedAdminDetail.updatedAt).toLocaleString()}</Typography></Grid>
                            </Grid>
                        </Stack>
                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography color="text.secondary">Failed to load admin details</Typography></Box>)}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}><Button onClick={() => setViewDialogOpen(false)}>Close</Button><Button variant="contained" onClick={() => { setViewDialogOpen(false); handleEditAdmin(); }} disabled={!selectedAdminDetail}>Edit Admin</Button></DialogActions>
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {confirmAction === 'softDelete' && 'Soft Delete Admin'}
                    {confirmAction === 'restore' && 'Restore Admin'}
                    {confirmAction === 'permanentDelete' && 'Permanently Delete Admin'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmAction === 'softDelete' && `Are you sure you want to soft delete ${selectedAdmin?.fullName}'s admin account?`}
                        {confirmAction === 'restore' && `Are you sure you want to restore ${selectedAdmin?.fullName}'s admin account?`}
                        {confirmAction === 'permanentDelete' && `Are you sure you want to PERMANENTLY delete ${selectedAdmin?.fullName}'s account? This is IRREVERSIBLE!`}
                    </Typography>
                    {confirmAction === 'permanentDelete' && (
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="error" sx={{ mb: 2 }}><Stack direction="row" alignItems="center" spacing={1}><WarningAmberIcon /><Typography variant="body2" fontWeight={600}>Type &quot;DELETE&quot; to confirm</Typography></Stack></Alert>
                            <TextField fullWidth size="small" placeholder="Type DELETE to confirm" value={permanentDeleteConfirmText} onChange={(e) => setPermanentDeleteConfirmText(e.target.value)} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color={confirmAction === 'restore' ? 'success' : 'error'} onClick={handleConfirmAction} disabled={isSoftDeleting || isPermanentDeleting || isRestoring || (confirmAction === 'permanentDelete' && permanentDeleteConfirmText !== 'DELETE')}>
                        {(isSoftDeleting || isPermanentDeleting || isRestoring) ? <CircularProgress size={20} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


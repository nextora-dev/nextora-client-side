'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Stack, Button, TextField, IconButton,
    Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
    DialogActions, InputAdornment, Select, FormControl, InputLabel, Alert, Snackbar,
    CircularProgress, Tooltip, alpha, useTheme, Divider, useMediaQuery, Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
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
    setAdminSearchQuery,
    setAdminStatusFilter,
    setAdminCurrentPage,
    setAdminPageSize,
    clearSelectedAdminDetail,
    clearAdminSuccessMessage,
    selectAdminUsers,
    selectTotalAdminUsers,
    selectAdminCurrentPage,
    selectAdminPageSize,
    selectSelectedAdminDetail,
    selectIsAdminDetailLoading,
    selectIsAdminUsersLoading,
    selectIsCreatingAdmin,
    selectIsUpdatingAdmin,
    selectIsSoftDeletingAdmin,
    selectIsPermanentDeletingAdmin,
    selectIsRestoringAdmin,
    selectAdminUsersError,
    selectAdminCreateError,
    selectAdminUpdateError,
    selectAdminDeleteError,
    selectAdminRestoreError,
    selectAdminSuccessMessage,
    selectAdminStatusFilter,
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
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const dispatch = useAppDispatch();

    // Redux selectors
    const adminUsers = useAppSelector(selectAdminUsers);
    const totalAdminUsers = useAppSelector(selectTotalAdminUsers);
    const page = useAppSelector(selectAdminCurrentPage);
    const rowsPerPage = useAppSelector(selectAdminPageSize);
    const statusFilter = useAppSelector(selectAdminStatusFilter);
    const selectedAdminDetail = useAppSelector(selectSelectedAdminDetail);
    const isAdminDetailLoading = useAppSelector(selectIsAdminDetailLoading);
    const loading = useAppSelector(selectIsAdminUsersLoading);
    const isCreating = useAppSelector(selectIsCreatingAdmin);
    const isUpdating = useAppSelector(selectIsUpdatingAdmin);
    const isSoftDeleting = useAppSelector(selectIsSoftDeletingAdmin);
    const isPermanentDeleting = useAppSelector(selectIsPermanentDeletingAdmin);
    const isRestoring = useAppSelector(selectIsRestoringAdmin);
    const error = useAppSelector(selectAdminUsersError);
    const createError = useAppSelector(selectAdminCreateError);
    const updateError = useAppSelector(selectAdminUpdateError);
    const deleteError = useAppSelector(selectAdminDeleteError);
    const restoreError = useAppSelector(selectAdminRestoreError);
    const successMessage = useAppSelector(selectAdminSuccessMessage);

    // Local state
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Debounce search
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            dispatch(setAdminSearchQuery(localSearchQuery));
        }, 500);
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [localSearchQuery, dispatch]);

    // Fetch admin users on mount
    useEffect(() => {
        dispatch(fetchAdminUsers({ page, size: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    // Handle success messages
    useEffect(() => {
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearAdminSuccessMessage());
            dispatch(fetchAdminUsers({ page, size: rowsPerPage }));
        }
    }, [successMessage, dispatch, page, rowsPerPage]);

    // Handle errors
    useEffect(() => { if (error) setSnackbar({ open: true, message: error, severity: 'error' }); }, [error]);
    useEffect(() => { if (createError) setSnackbar({ open: true, message: createError, severity: 'error' }); }, [createError]);
    useEffect(() => { if (updateError) setSnackbar({ open: true, message: updateError, severity: 'error' }); }, [updateError]);
    useEffect(() => { if (deleteError) setSnackbar({ open: true, message: deleteError, severity: 'error' }); }, [deleteError]);
    useEffect(() => { if (restoreError) setSnackbar({ open: true, message: restoreError, severity: 'error' }); }, [restoreError]);

    // Populate edit form
    useEffect(() => {
        if (selectedAdminDetail && editDialogOpen) {
            setEditFormData({
                firstName: selectedAdminDetail.firstName,
                lastName: selectedAdminDetail.lastName,
                phone: selectedAdminDetail.phone || '',
                department: selectedAdminDetail.roleSpecificData?.department || '',
            });
        }
    }, [selectedAdminDetail, editDialogOpen]);

    // Handlers
    const handleRefresh = useCallback(() => {
        dispatch(fetchAdminUsers({ page, size: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

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
        setFormData({ adminLevel: 'STANDARD' });
        setFormErrors({});
        setCreateDialogOpen(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!formData.email?.trim()) errors.email = 'Email is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCreate = () => {
        if (!validateForm()) return;
        dispatch(createAdminUserManagementAsync({
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phone: formData.phone,
            adminLevel: formData.adminLevel || 'STANDARD',
            department: formData.department,
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

    const activeAdmins = adminUsers.filter(a => a.status === 'ACTIVE').length;
    const deletedAdmins = adminUsers.filter(a => a.status === 'DELETED').length;

    const statsCards = [
        { label: 'Total Admins', value: totalAdminUsers, icon: AdminPanelSettingsIcon, color: theme.palette.primary.main },
        { label: 'Active', value: activeAdmins, icon: CheckCircleIcon, color: theme.palette.success.main },
        { label: 'Deleted', value: deletedAdmins, icon: DeleteIcon, color: theme.palette.grey[600] },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }} fontWeight={700} gutterBottom>Admin Management</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Manage administrator accounts (Super Admin Exclusive)</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateAdmin} sx={{ borderRadius: 2 }} size={isMobile ? 'small' : 'medium'}>Create Admin</Button>
                </Stack>
            </MotionBox>

            {/* Stats Cards */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 4 }} key={index}>
                                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), flexShrink: 0 }}>
                                                <Icon sx={{ color: stat.color, fontSize: { xs: 18, sm: 20 } }} />
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} fontWeight={700}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, display: 'block' }}>{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* Filters */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 2 }} alignItems={{ md: 'center' }} justifyContent="space-between">
                        <TextField placeholder="Search admins..." value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} size="small" fullWidth sx={{ maxWidth: { md: 350 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> } }} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems={{ sm: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                <InputLabel>Status</InputLabel>
                                <Select value={statusFilter} label="Status" onChange={(e) => dispatch(setAdminStatusFilter(e.target.value))}>
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
                                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                                    <MenuItem value="DELETED">Deleted</MenuItem>
                                </Select>
                            </FormControl>
                            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} disabled={loading} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }, borderRadius: 2, width: 40, height: 40 }}><RefreshIcon sx={{ fontSize: 20 }} /></IconButton></Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Admin Users List */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                ) : adminUsers.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography color="text.secondary">No admin users found</Typography></Box>
                ) : (
                    <>
                        {isMobile ? (
                            <Box sx={{ p: 1.5 }}>
                                <Stack spacing={1.5}>
                                    {adminUsers.map((admin) => (
                                        <Paper key={admin.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ bgcolor: theme.palette.error.main, width: 44, height: 44 }}>{admin.firstName?.[0]}{admin.lastName?.[0]}</Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{admin.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{admin.email}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, admin)}><MoreVertIcon /></IconButton>
                                                </Stack>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label={admin.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Admin'} size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, fontWeight: 500, fontSize: '0.7rem' }} />
                                                    <Chip icon={getStatusIcon(admin.status) || undefined} label={STATUS_LABELS[admin.status]} size="small" sx={{ bgcolor: alpha(getStatusColor(admin.status), 0.1), color: getStatusColor(admin.status), fontWeight: 500, fontSize: '0.7rem', '& .MuiChip-icon': { color: 'inherit' } }} />
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table size={isTablet ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Department</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {adminUsers.map((admin) => (
                                            <TableRow key={admin.id} hover>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>{admin.firstName?.[0]}{admin.lastName?.[0]}</Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{admin.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: { md: 'none' } }}>{admin.email}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Typography variant="body2">{admin.email}</Typography></TableCell>
                                                <TableCell>
                                                    <Chip icon={admin.role === 'ROLE_SUPER_ADMIN' ? <SupervisorAccountIcon /> : <AdminPanelSettingsIcon />} label={admin.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Admin'} size="small" sx={{ bgcolor: alpha(admin.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : '#EF4444', 0.1), color: admin.role === 'ROLE_SUPER_ADMIN' ? '#EC4899' : '#EF4444', fontWeight: 500, '& .MuiChip-icon': { color: 'inherit' } }} />
                                                </TableCell>
                                                <TableCell><Chip icon={getStatusIcon(admin.status) || undefined} label={STATUS_LABELS[admin.status]} size="small" sx={{ bgcolor: alpha(getStatusColor(admin.status), 0.1), color: getStatusColor(admin.status), fontWeight: 500, '& .MuiChip-icon': { color: 'inherit' } }} /></TableCell>
                                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><Typography variant="body2" color="text.secondary">{admin.department || 'N/A'}</Typography></TableCell>
                                                <TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, admin)}><MoreVertIcon /></IconButton></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination component="div" count={totalAdminUsers} page={page} onPageChange={(_, p) => dispatch(setAdminCurrentPage(p))} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => dispatch(setAdminPageSize(parseInt(e.target.value, 10)))} rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]} />
                    </>
                )}
            </MotionCard>

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewAdmin}><VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details</MenuItem>
                <MenuItem onClick={handleEditAdmin}><EditIcon sx={{ mr: 1.5, fontSize: 20 }} />Edit Admin</MenuItem>
                <Divider />
                {selectedAdmin?.status !== 'DELETED' && (<MenuItem onClick={() => handleStatusAction('softDelete')} sx={{ color: 'warning.main' }}><DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />Soft Delete</MenuItem>)}
                {selectedAdmin?.status === 'DELETED' && (<MenuItem onClick={() => handleStatusAction('restore')} sx={{ color: 'success.main' }}><RestoreIcon sx={{ mr: 1.5, fontSize: 20 }} />Restore Admin</MenuItem>)}
                <Divider />
                <MenuItem onClick={() => handleStatusAction('permanentDelete')} sx={{ color: 'error.main' }}><DeleteForeverIcon sx={{ mr: 1.5, fontSize: 20 }} />Permanently Delete</MenuItem>
            </Menu>

            {/* Create Admin Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
                <DialogTitle><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="h6" fontWeight={600}>Create Admin User</Typography><IconButton onClick={() => setCreateDialogOpen(false)} size="small"><CloseIcon /></IconButton></Stack></DialogTitle>
                <DialogContent dividers>
                    <Alert severity="info" sx={{ mb: 2 }}>Admin users have elevated privileges. A temporary password will be sent to their email.</Alert>
                    <Stack spacing={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} error={!!formErrors.firstName} helperText={formErrors.firstName} required /></Grid>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} error={!!formErrors.lastName} helperText={formErrors.lastName} required /></Grid>
                        </Grid>
                        <TextField label="Email" fullWidth value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone" fullWidth value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} /></Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth><InputLabel>Admin Level</InputLabel>
                                    <Select value={formData.adminLevel || 'STANDARD'} label="Admin Level" onChange={(e) => setFormData({ ...formData, adminLevel: e.target.value as 'STANDARD' | 'SENIOR' })}>
                                        <MenuItem value="STANDARD">Standard Admin</MenuItem>
                                        <MenuItem value="SENIOR">Senior Admin</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <TextField label="Department" fullWidth value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
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
                                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: theme.palette.error.main, fontSize: '2rem' }}>{selectedAdminDetail.firstName?.[0]}{selectedAdminDetail.lastName?.[0]}</Avatar>
                                <Typography variant="h6" fontWeight={600}>{selectedAdminDetail.fullName}</Typography>
                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                    <Chip label={selectedAdminDetail.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Admin'} size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }} />
                                    <Chip icon={getStatusIcon(selectedAdminDetail.status) || undefined} label={STATUS_LABELS[selectedAdminDetail.status]} size="small" sx={{ bgcolor: alpha(getStatusColor(selectedAdminDetail.status), 0.1), color: getStatusColor(selectedAdminDetail.status), '& .MuiChip-icon': { color: 'inherit' } }} />
                                </Stack>
                            </Box>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><EmailIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2">{selectedAdminDetail.email}</Typography></Box></Stack></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><PhoneIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body2">{selectedAdminDetail.phone || 'N/A'}</Typography></Box></Stack></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><BadgeIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">User ID</Typography><Typography variant="body2">{selectedAdminDetail.id}</Typography></Box></Stack></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Stack direction="row" spacing={1.5} alignItems="center"><BusinessIcon sx={{ color: 'text.secondary' }} /><Box><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{selectedAdminDetail.department || 'N/A'}</Typography></Box></Stack></Grid>
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


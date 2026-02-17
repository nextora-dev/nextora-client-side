'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RestoreIcon from '@mui/icons-material/Restore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BadgeIcon from '@mui/icons-material/Badge';
import { ROLE_LABELS, RoleType } from '@/constants/roles';
import { StatusType, STATUS_LABELS } from "@/constants";
import { useAppDispatch, useAppSelector } from '@/store';
import { User } from '@/features/admin';
import { CreateAdminRequest } from '@/features/super-admin';
import {
    // Thunks
    fetchUsersSuperAdmin,
    fetchUserStatsSuperAdmin,
    fetchUserByIdSuperAdmin,
    createAdminUserAsync,
    softDeleteUserSuperAdminAsync,
    restoreUserSuperAdminAsync,
    permanentDeleteUserSuperAdminAsync,
    // Actions
    setSuperAdminSearchQuery,
    setSuperAdminRoleFilter,
    setSuperAdminStatusFilter,
    setSuperAdminCurrentPage,
    setSuperAdminPageSize,
    clearSuperAdminSelectedUserDetail,
    clearSuperAdminSuccessMessage,
    // Selectors
    selectSuperAdminUsers,
    selectSuperAdminTotalUsers,
    selectSuperAdminCurrentPage,
    selectSuperAdminPageSize,
    selectSuperAdminSearchQuery,
    selectSuperAdminRoleFilter,
    selectSuperAdminStatusFilter,
    selectSuperAdminStats,
    selectSuperAdminIsLoading,
    selectSuperAdminError,
    selectSuperAdminSelectedUserDetail,
    selectSuperAdminIsUserDetailLoading,
    selectSuperAdminIsCreatingAdmin,
    selectSuperAdminIsPermanentDeleting,
    selectSuperAdminIsStatusChanging,
    selectSuperAdminSuccessMessage,
    selectSuperAdminCreateAdminError,
    selectSuperAdminPermanentDeleteError,
    selectSuperAdminStatusChangeError,
} from '@/features/super-admin';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ROLE_COLORS: Record<string, string> = {
    ROLE_STUDENT: '#3B82F6',
    ROLE_ACADEMIC_STAFF: '#8B5CF6',
    ROLE_NON_ACADEMIC_STAFF: '#F59E0B',
    ROLE_ADMIN: '#EF4444',
    ROLE_SUPER_ADMIN: '#EC4899',
};

// Display item interface for table
interface UserDisplayItem {
    id: number;
    email: string;
    fullName: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
    role: RoleType;
    userType: string;
    active: boolean;
    status: StatusType;
}

// Helper to map backend User to display format
const mapUserToDisplay = (user: User): UserDisplayItem => {
    const nameParts = user.fullName.split(' ');
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
        userType: user.userType,
        active: user.status === 'ACTIVE',
        status: user.status,
    };
};

export default function SuperAdminUserManagementPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Redux state
    const dispatch = useAppDispatch();
    const usersFromStore = useAppSelector(selectSuperAdminUsers);
    const totalUsers = useAppSelector(selectSuperAdminTotalUsers);
    const page = useAppSelector(selectSuperAdminCurrentPage);
    const rowsPerPage = useAppSelector(selectSuperAdminPageSize);
    const searchQuery = useAppSelector(selectSuperAdminSearchQuery);
    const roleFilter = useAppSelector(selectSuperAdminRoleFilter);
    const statusFilter = useAppSelector(selectSuperAdminStatusFilter);
    const userStats = useAppSelector(selectSuperAdminStats);
    const loading = useAppSelector(selectSuperAdminIsLoading);
    const error = useAppSelector(selectSuperAdminError);

    // User detail from Redux
    const userDetail = useAppSelector(selectSuperAdminSelectedUserDetail);
    const userDetailLoading = useAppSelector(selectSuperAdminIsUserDetailLoading);

    // Operation loading states from Redux
    const isCreatingAdmin = useAppSelector(selectSuperAdminIsCreatingAdmin);
    const isPermanentDeleting = useAppSelector(selectSuperAdminIsPermanentDeleting);
    const isStatusChanging = useAppSelector(selectSuperAdminIsStatusChanging);

    // Messages from Redux
    const successMessage = useAppSelector(selectSuperAdminSuccessMessage);
    const createAdminError = useAppSelector(selectSuperAdminCreateAdminError);
    const permanentDeleteError = useAppSelector(selectSuperAdminPermanentDeleteError);
    const statusChangeError = useAppSelector(selectSuperAdminStatusChangeError);

    // Map users from store to display format
    const users = useMemo(() => usersFromStore.map(mapUserToDisplay), [usersFromStore]);

    // Local UI state
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserDisplayItem | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce search query
    useEffect(() => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        searchTimerRef.current = setTimeout(() => {
            if (localSearchQuery !== searchQuery) {
                dispatch(setSuperAdminSearchQuery(localSearchQuery));
            }
        }, 500);
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [localSearchQuery, searchQuery, dispatch]);

    // Dialog states
    const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'softDelete' | 'restore' | 'permanentDelete' | null>(null);
    const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] = useState('');

    // Form state for create admin
    const [adminFormData, setAdminFormData] = useState<Partial<CreateAdminRequest>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch users and stats on mount and when filters change
    useEffect(() => {
        dispatch(fetchUsersSuperAdmin({
            page,
            size: rowsPerPage,
            searchQuery,
            roleFilter,
            statusFilter,
        }));
    }, [dispatch, searchQuery, roleFilter, statusFilter, page, rowsPerPage]);

    // Fetch stats on mount
    useEffect(() => {
        dispatch(fetchUserStatsSuperAdmin());
    }, [dispatch]);

    // Handle success messages from Redux
    useEffect(() => {
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearSuperAdminSuccessMessage());
            // Refresh data after successful operation
            dispatch(fetchUsersSuperAdmin({ page, size: rowsPerPage, searchQuery, roleFilter, statusFilter }));
            dispatch(fetchUserStatsSuperAdmin());
        }
    }, [successMessage, dispatch, page, rowsPerPage, searchQuery, roleFilter, statusFilter]);

    // Handle errors from Redux
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
        }
    }, [error]);

    useEffect(() => {
        if (createAdminError) {
            setSnackbar({ open: true, message: createAdminError, severity: 'error' });
        }
    }, [createAdminError]);


    useEffect(() => {
        if (permanentDeleteError) {
            setSnackbar({ open: true, message: permanentDeleteError, severity: 'error' });
        }
    }, [permanentDeleteError]);

    useEffect(() => {
        if (statusChangeError) {
            setSnackbar({ open: true, message: statusChangeError, severity: 'error' });
        }
    }, [statusChangeError]);

    // Refresh data handler
    const handleRefresh = useCallback(() => {
        dispatch(fetchUsersSuperAdmin({
            page,
            size: rowsPerPage,
            searchQuery,
            roleFilter,
            statusFilter,
        }));
        dispatch(fetchUserStatsSuperAdmin());
    }, [dispatch, page, rowsPerPage, searchQuery, roleFilter, statusFilter]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserDisplayItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleViewUser = () => {
        handleMenuClose();
        if (!selectedUser) return;
        setViewDialogOpen(true);
        dispatch(clearSuperAdminSelectedUserDetail());
        dispatch(fetchUserByIdSuperAdmin(selectedUser.id));
    };

    const handleAction = (action: 'softDelete' | 'restore' | 'permanentDelete') => {
        handleMenuClose();
        setConfirmAction(action);
        setPermanentDeleteConfirmText('');
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedUser || !confirmAction) return;

        if (confirmAction === 'softDelete') {
            dispatch(softDeleteUserSuperAdminAsync(selectedUser.id));
        } else if (confirmAction === 'restore') {
            dispatch(restoreUserSuperAdminAsync(selectedUser.id));
        } else if (confirmAction === 'permanentDelete') {
            if (permanentDeleteConfirmText !== 'DELETE') {
                setSnackbar({ open: true, message: 'Please type DELETE to confirm', severity: 'warning' });
                return;
            }
            dispatch(permanentDeleteUserSuperAdminAsync(selectedUser.id));
        }

        setConfirmDialogOpen(false);
        setPermanentDeleteConfirmText('');
    };

    const handleCreateAdmin = () => {
        setAdminFormData({ adminLevel: 'STANDARD' });
        setFormErrors({});
        setCreateAdminDialogOpen(true);
    };

    const validateAdminForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!adminFormData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!adminFormData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!adminFormData.email?.trim()) errors.email = 'Email is required';
        if (adminFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminFormData.email)) errors.email = 'Invalid email format';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCreateAdmin = () => {
        if (!validateAdminForm()) return;

        const createData: CreateAdminRequest = {
            firstName: adminFormData.firstName!,
            lastName: adminFormData.lastName!,
            email: adminFormData.email!,
            phone: adminFormData.phone,
            adminLevel: adminFormData.adminLevel || 'STANDARD',
            department: adminFormData.department,
        };

        dispatch(createAdminUserAsync(createData));
        setCreateAdminDialogOpen(false);
        setAdminFormData({});
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircleIcon fontSize="small" />;
            case 'DEACTIVATE': return <BlockIcon fontSize="small" />;
            case 'SUSPENDED': return <LockIcon fontSize="small" />;
            case 'DELETED': return <DeleteIcon fontSize="small" />;
            case 'PASSWORD_CHANGE_REQUIRED': return <VpnKeyIcon fontSize="small" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return theme.palette.success.main;
            case 'DEACTIVATE': return theme.palette.warning.main;
            case 'SUSPENDED': return theme.palette.error.main;
            case 'DELETED': return theme.palette.grey[500];
            case 'PASSWORD_CHANGE_REQUIRED': return theme.palette.secondary.main;
            default: return theme.palette.grey[500];
        }
    };

    const getConfirmDialogContent = () => {
        if (!selectedUser) return null;

        switch (confirmAction) {
            case 'softDelete':
                return {
                    title: 'Soft Delete User',
                    content: `Are you sure you want to soft delete "${selectedUser.fullName}"? This user will be marked as deleted but can be restored later.`,
                    confirmText: 'Soft Delete',
                    color: 'warning' as const,
                    icon: <DeleteIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
                };
            case 'restore':
                return {
                    title: 'Restore User',
                    content: `Are you sure you want to restore "${selectedUser.fullName}"? This user will be reactivated.`,
                    confirmText: 'Restore',
                    color: 'success' as const,
                    icon: <RestoreIcon sx={{ fontSize: 48, color: 'success.main' }} />,
                };
            case 'permanentDelete':
                return {
                    title: 'Permanently Delete User',
                    content: `Are you sure you want to PERMANENTLY delete "${selectedUser.fullName}"? This action is IRREVERSIBLE and all user data will be lost forever.`,
                    confirmText: 'Permanently Delete',
                    color: 'error' as const,
                    icon: <DeleteForeverIcon sx={{ fontSize: 48, color: 'error.main' }} />,
                    requireConfirmText: true,
                };
            default:
                return null;
        }
    };

    // Status-based stats
    const statusStats = [
        { label: 'Total Users', value: userStats?.totalUsers ?? 0, icon: GroupIcon, color: theme.palette.primary.main },
        { label: 'Active', value: userStats?.activeUsers ?? 0, icon: CheckCircleIcon, color: theme.palette.success.main },
        { label: 'Deactivated', value: userStats?.deactivatedUsers ?? 0, icon: BlockIcon, color: theme.palette.warning.main },
        { label: 'Suspended', value: userStats?.suspendedUsers ?? 0, icon: LockIcon, color: theme.palette.error.main },
        { label: 'Deleted', value: userStats?.deletedUsers ?? 0, icon: DeleteIcon, color: theme.palette.grey[600] },
        { label: 'Password Change', value: userStats?.passwordChangeRequiredUsers ?? 0, icon: VpnKeyIcon, color: theme.palette.secondary.main },
    ];

    // Role-based stats
    const roleStats = [
        { label: 'Students', value: userStats?.totalStudents ?? 0, icon: SchoolIcon, color: '#3B82F6' },
        { label: 'Academic Staff', value: userStats?.totalAcademicStaff ?? 0, icon: WorkIcon, color: '#8B5CF6' },
        { label: 'Non-Academic', value: userStats?.totalNonAcademicStaff ?? 0, icon: EngineeringIcon, color: '#F59E0B' },
        { label: 'Admins', value: userStats?.totalAdmins ?? 0, icon: AdminPanelSettingsIcon, color: '#EF4444' },
    ];

    const confirmDialogContent = getConfirmDialogContent();

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }} fontWeight={700} gutterBottom>
                            Super Admin - User Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Create admins, manage users, reset passwords, and permanently delete accounts
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateAdmin}
                        color="error"
                        sx={{ borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                        fullWidth={isMobile}
                    >
                        Create Admin
                    </Button>
                </Stack>
            </MotionBox>

            {/* Status Stats Cards */}
            <MotionBox variants={itemVariants} sx={{ mb: 2 }}>
                <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    {statusStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{
                                                width: { xs: 36, sm: 40 },
                                                height: { xs: 36, sm: 40 },
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: alpha(stat.color, 0.1),
                                                flexShrink: 0
                                            }}>
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

            {/* Role Stats Cards */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    {roleStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3, md: 3 }} key={index}>
                                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{
                                                width: { xs: 36, sm: 40 },
                                                height: { xs: 36, sm: 40 },
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: alpha(stat.color, 0.1),
                                                flexShrink: 0
                                            }}>
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

            {/* Filters & Search */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={{ xs: 2, md: 2 }}
                        alignItems={{ md: 'center' }}
                        justifyContent="space-between"
                    >
                        {/* Search Field */}
                        <TextField
                            placeholder="Search by name or email..."
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{
                                maxWidth: { md: 350 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                }
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        {/* Filters Row */}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1.5, sm: 2 }}
                            alignItems={{ sm: 'center' }}
                            sx={{ width: { xs: '100%', md: 'auto' } }}
                        >
                            <FormControl
                                size="small"
                                sx={{
                                    minWidth: { xs: '100%', sm: 140 },
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            >
                                <InputLabel>Role</InputLabel>
                                <Select value={roleFilter} label="Role" onChange={(e) => dispatch(setSuperAdminRoleFilter(e.target.value as RoleType | ''))}>
                                    <MenuItem value="">All Roles</MenuItem>
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                        <MenuItem key={value} value={value}>{label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl
                                size="small"
                                sx={{
                                    minWidth: { xs: '100%', sm: 160 },
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            >
                                <InputLabel>Status</InputLabel>
                                <Select value={statusFilter} label="Status" onChange={(e) => dispatch(setSuperAdminStatusFilter(e.target.value as StatusType | ''))}>
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="DEACTIVATE">Deactivated</MenuItem>
                                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                                    <MenuItem value="DELETED">Deleted</MenuItem>
                                    <MenuItem value="PASSWORD_CHANGE_REQUIRED">Password Change</MenuItem>
                                </Select>
                            </FormControl>

                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    sx={{
                                        alignSelf: { xs: 'flex-end', sm: 'center' },
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                        borderRadius: 2,
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    <RefreshIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Users List */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : users.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <Typography color="text.secondary">No users found</Typography>
                    </Box>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        {isMobile ? (
                            <Box sx={{ p: 1.5 }}>
                                <Stack spacing={1.5}>
                                    {users.map((user) => (
                                        <Paper
                                            key={user.id}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                            }}
                                        >
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar
                                                            src={user.profilePictureUrl || undefined}
                                                            sx={{
                                                                bgcolor: ROLE_COLORS[user.role] || theme.palette.primary.main,
                                                                width: 44,
                                                                height: 44
                                                            }}
                                                        >
                                                            {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{user.email}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </Stack>

                                                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ gap: 0.5 }}>
                                                    <Chip
                                                        label={ROLE_LABELS[user.role] || user.role}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(ROLE_COLORS[user.role] || theme.palette.primary.main, 0.1),
                                                            color: ROLE_COLORS[user.role] || theme.palette.primary.main,
                                                            fontWeight: 500,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                    <Chip
                                                        icon={getStatusIcon(user.status) || undefined}
                                                        label={STATUS_LABELS[user.status] || user.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getStatusColor(user.status), 0.1),
                                                            color: getStatusColor(user.status),
                                                            fontWeight: 500,
                                                            fontSize: '0.7rem',
                                                            '& .MuiChip-icon': { color: 'inherit', fontSize: '0.9rem' }
                                                        }}
                                                    />
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            /* Desktop/Tablet Table View */
                            <TableContainer>
                                <Table size={isTablet ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>User ID</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar
                                                            src={user.profilePictureUrl || undefined}
                                                            sx={{
                                                                bgcolor: ROLE_COLORS[user.role] || theme.palette.primary.main,
                                                                width: { sm: 36, md: 40 },
                                                                height: { sm: 36, md: 40 }
                                                            }}
                                                        >
                                                            {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { sm: '0.8rem', md: '0.875rem' } }}>{user.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: { md: 'none' } }}>{user.email}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>{user.userType}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                    <Typography variant="body2" sx={{ fontSize: { md: '0.8rem', lg: '0.875rem' } }}>{user.email}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={ROLE_LABELS[user.role] || user.role}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(ROLE_COLORS[user.role] || theme.palette.primary.main, 0.1),
                                                            color: ROLE_COLORS[user.role] || theme.palette.primary.main,
                                                            fontWeight: 500,
                                                            fontSize: { sm: '0.7rem', md: '0.75rem' }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getStatusIcon(user.status) || undefined}
                                                        label={STATUS_LABELS[user.status] || user.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getStatusColor(user.status), 0.1),
                                                            color: getStatusColor(user.status),
                                                            fontWeight: 500,
                                                            fontSize: { sm: '0.7rem', md: '0.75rem' },
                                                            '& .MuiChip-icon': { color: 'inherit' }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                                    <Typography variant="body2" color="text.secondary">ID: {user.id}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}><MoreVertIcon /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={totalUsers}
                            page={page}
                            onPageChange={(_, p) => dispatch(setSuperAdminCurrentPage(p))}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => dispatch(setSuperAdminPageSize(parseInt(e.target.value, 10)))}
                            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                            labelRowsPerPage={isMobile ? '' : 'Rows per page:'}
                            sx={{
                                '.MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
                                '.MuiTablePagination-displayedRows': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                            }}
                        />
                    </>
                )}
            </MotionCard>

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <MenuItem onClick={handleViewUser}>
                    <VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details
                </MenuItem>
                <Divider />
                {/* Soft Delete - show when user is not already deleted */}
                {selectedUser?.status !== 'DELETED' && (
                    <MenuItem onClick={() => handleAction('softDelete')} sx={{ color: 'warning.main' }}>
                        <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />Soft Delete
                    </MenuItem>
                )}
                {/* Restore - show when user is deleted */}
                {selectedUser?.status === 'DELETED' && (
                    <MenuItem onClick={() => handleAction('restore')} sx={{ color: 'success.main' }}>
                        <RestoreIcon sx={{ mr: 1.5, fontSize: 20 }} />Restore User
                    </MenuItem>
                )}
                <Divider />
                {/* Permanent Delete - available for deleted users (dangerous) */}
                <MenuItem onClick={() => handleAction('permanentDelete')} sx={{ color: 'error.main' }}>
                    <DeleteForeverIcon sx={{ mr: 1.5, fontSize: 20 }} />Permanently Delete
                </MenuItem>
            </Menu>

            {/* Create Admin Dialog */}
            <Dialog
                open={createAdminDialogOpen}
                onClose={() => setCreateAdminDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 2,
                        m: isMobile ? 0 : 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 1 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <AdminPanelSettingsIcon color="error" />
                            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Create New Admin</Typography>
                        </Stack>
                        <IconButton onClick={() => setCreateAdminDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        A temporary password will be generated and sent to the admin&apos;s email address.
                    </Alert>
                    <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Admin Information</Typography>
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    value={adminFormData.firstName || ''}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, firstName: e.target.value })}
                                    error={!!formErrors.firstName}
                                    helperText={formErrors.firstName}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Last Name"
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    value={adminFormData.lastName || ''}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, lastName: e.target.value })}
                                    error={!!formErrors.lastName}
                                    helperText={formErrors.lastName}
                                    required
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            label="Email"
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            value={adminFormData.email || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            required
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                }
                            }}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            value={adminFormData.phone || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                }
                            }}
                        />
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                    <InputLabel>Admin Level</InputLabel>
                                    <Select
                                        value={adminFormData.adminLevel || 'STANDARD'}
                                        label="Admin Level"
                                        onChange={(e) => setAdminFormData({ ...adminFormData, adminLevel: e.target.value as 'STANDARD' | 'SENIOR' })}
                                    >
                                        <MenuItem value="STANDARD">Standard Admin</MenuItem>
                                        <MenuItem value="SENIOR">Senior Admin</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Department"
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    value={adminFormData.department || ''}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })}
                                    placeholder="e.g., IT Administration"
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCreateAdminDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleSubmitCreateAdmin} disabled={isCreatingAdmin}>
                        {isCreatingAdmin ? <CircularProgress size={20} /> : 'Create Admin'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View User Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 2,
                        m: isMobile ? 0 : 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 1 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={600}>User Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {userDetailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : userDetail ? (
                        <Stack spacing={3}>
                            {/* User Avatar and Basic Info */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar
                                    src={userDetail.profilePictureUrl || undefined}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: ROLE_COLORS[userDetail.role] || theme.palette.primary.main,
                                        fontSize: '2rem'
                                    }}
                                >
                                    {userDetail.firstName?.[0]}{userDetail.lastName?.[0]}
                                </Avatar>
                                <Typography variant="h6" fontWeight={600}>{userDetail.fullName}</Typography>
                                <Typography variant="body2" color="text.secondary">{userDetail.email}</Typography>
                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                    <Chip
                                        label={ROLE_LABELS[userDetail.role] || userDetail.role}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(ROLE_COLORS[userDetail.role] || theme.palette.primary.main, 0.1),
                                            color: ROLE_COLORS[userDetail.role] || theme.palette.primary.main,
                                        }}
                                    />
                                    <Chip
                                        label={STATUS_LABELS[userDetail.status] || userDetail.status}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(getStatusColor(userDetail.status), 0.1),
                                            color: getStatusColor(userDetail.status),
                                        }}
                                    />
                                </Stack>
                            </Box>

                            <Divider />

                            {/* User Details */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">User ID</Typography>
                                    <Typography variant="body2" fontWeight={500}>{userDetail.id}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                    <Typography variant="body2" fontWeight={500}>{userDetail.phoneNumber || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">User Type</Typography>
                                    <Typography variant="body2" fontWeight={500}>{userDetail.userType}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Created At</Typography>
                                    <Typography variant="body2" fontWeight={500}>{new Date(userDetail.createdAt).toLocaleDateString()}</Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    ) : (
                        <Typography color="text.secondary" textAlign="center">No user details available</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                {confirmDialogContent && (
                    <>
                        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                            {confirmDialogContent.icon}
                            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
                                {confirmDialogContent.title}
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                {confirmDialogContent.content}
                            </Typography>
                            {confirmAction === 'permanentDelete' && (
                                <Box sx={{ mt: 3 }}>
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <WarningAmberIcon />
                                            <Typography variant="body2" fontWeight={600}>
                                                Type &quot;DELETE&quot; to confirm permanent deletion
                                            </Typography>
                                        </Stack>
                                    </Alert>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Type DELETE to confirm"
                                        value={permanentDeleteConfirmText}
                                        onChange={(e) => setPermanentDeleteConfirmText(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderColor: permanentDeleteConfirmText === 'DELETE' ? 'success.main' : 'inherit'
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, justifyContent: 'center' }}>
                            <Button onClick={() => setConfirmDialogOpen(false)} sx={{ minWidth: 100 }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color={confirmDialogContent.color}
                                onClick={handleConfirmAction}
                                disabled={
                                    isStatusChanging ||
                                    isPermanentDeleting ||
                                    (confirmAction === 'permanentDelete' && permanentDeleteConfirmText !== 'DELETE')
                                }
                                sx={{ minWidth: 100 }}
                            >
                                {(isStatusChanging || isPermanentDeleting) ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    confirmDialogContent.confirmText
                                )}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MotionBox>
    );
}


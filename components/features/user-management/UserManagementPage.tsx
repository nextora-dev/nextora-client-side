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
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
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
import GroupIcon from '@mui/icons-material/Group';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EngineeringIcon from '@mui/icons-material/Engineering';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ROLE_LABELS, RoleType } from '@/constants/roles';
import { FACULTY, FACULTY_LABELS } from '@/constants/faculty';
import { StatusType, STATUS_LABELS } from '@/constants';
import { User, UserDetail, CreateUserRequest, UpdateUserRequest } from '@/features/admin';
import { CreateAdminRequest } from '@/features/super-admin';

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

// ============================================================================
// Types
// ============================================================================

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

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    deactivatedUsers: number;
    suspendedUsers: number;
    deletedUsers: number;
    passwordChangeRequiredUsers?: number;
    totalStudents: number;
    totalAcademicStaff: number;
    totalNonAcademicStaff: number;
    totalAdmins?: number;
}

interface EditFormData {
    id?: number;
    email?: string;
    role?: RoleType;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    guardianName?: string;
    guardianPhone?: string;
    clubName?: string;
    clubPosition?: string;
    clubJoinDate?: string;
    clubMembershipId?: string;
    designation?: string;
    specialization?: string;
    officeLocation?: string;
    bio?: string;
    availableForMeetings?: boolean;
    responsibilities?: string;
    workLocation?: string;
    shift?: string;
}

type ConfirmActionType = 'activate' | 'deactivate' | 'suspend' | 'unlock' | 'softDelete' | 'restore' | 'permanentDelete';

export interface UserManagementPageProps {
    title: string;
    subtitle: string;
    isSuperAdmin?: boolean;
    users: User[];
    totalUsers: number;
    page: number;
    rowsPerPage: number;
    searchQuery: string;
    roleFilter: RoleType | '';
    statusFilter: StatusType | '';
    userStats: UserStats | null;
    userDetail: UserDetail | null;
    loading: boolean;
    userDetailLoading: boolean;
    isCreating: boolean;
    isCreatingAdmin?: boolean;
    isUpdating: boolean;
    isStatusChanging: boolean;
    isPermanentDeleting?: boolean;
    error: string | null;
    successMessage: string | null;
    createError: string | null;
    createAdminError?: string | null;
    updateError: string | null;
    statusChangeError: string | null;
    permanentDeleteError?: string | null;
    onFetchUsers: () => void;
    onFetchUserStats: () => void;
    onFetchUserById: (id: number) => void;
    onCreateUser: (data: CreateUserRequest) => void;
    onCreateAdmin?: (data: CreateAdminRequest) => void;
    onUpdateUser: (id: number, data: UpdateUserRequest) => void;
    onActivateUser: (id: number) => void;
    onDeactivateUser: (id: number) => void;
    onSuspendUser: (id: number) => void;
    onUnlockUser: (id: number) => void;
    onSoftDeleteUser: (id: number) => void;
    onRestoreUser?: (id: number) => void;
    onPermanentDeleteUser?: (id: number) => void;
    onSetSearchQuery: (query: string) => void;
    onSetRoleFilter: (role: RoleType | '') => void;
    onSetStatusFilter: (status: StatusType | '') => void;
    onSetPage: (page: number) => void;
    onSetPageSize: (size: number) => void;
    onClearSelectedUserDetail: () => void;
    onClearSuccessMessage: () => void;
}

// Helper to get initials from name
const getInitials = (firstName: string, lastName: string, fullName: string): string => {
    // Try firstName + lastName first
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    // Try firstName only
    if (firstName) {
        return firstName[0].toUpperCase();
    }
    // Try to extract from fullName
    if (fullName) {
        const parts = fullName.trim().split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        if (parts.length === 1) {
            return parts[0][0].toUpperCase();
        }
    }
    return '?';
};

// Helper to map backend User to display format
const mapUserToDisplay = (user: User): UserDisplayItem => {
    const nameParts = user.fullName?.trim().split(' ').filter(p => p.length > 0) || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName || '',
        firstName,
        lastName,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
        userType: user.userType,
        active: user.status === 'ACTIVE',
        status: user.status,
    };
};

// ============================================================================
// Main Component
// ============================================================================

export default function UserManagementPage({
    title,
    subtitle,
    isSuperAdmin = false,
    users: usersFromProps,
    totalUsers,
    page,
    rowsPerPage,
    searchQuery,
    roleFilter,
    statusFilter,
    userStats,
    userDetail,
    loading,
    userDetailLoading,
    isCreating,
    isCreatingAdmin = false,
    isUpdating,
    isStatusChanging,
    isPermanentDeleting = false,
    error,
    successMessage,
    createError,
    createAdminError,
    updateError,
    statusChangeError,
    permanentDeleteError,
    onFetchUsers,
    onFetchUserStats,
    onFetchUserById,
    onCreateUser,
    onCreateAdmin,
    onUpdateUser,
    onActivateUser,
    onDeactivateUser,
    onSuspendUser,
    onUnlockUser,
    onSoftDeleteUser,
    onRestoreUser,
    onPermanentDeleteUser,
    onSetSearchQuery,
    onSetRoleFilter,
    onSetStatusFilter,
    onSetPage,
    onSetPageSize,
    onClearSelectedUserDetail,
    onClearSuccessMessage,
}: UserManagementPageProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Map users to display format
    const users = useMemo(() => usersFromProps.map(mapUserToDisplay), [usersFromProps]);

    // Local UI state
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserDisplayItem | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmActionType | null>(null);
    const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] = useState('');

    // Form states
    const [formData, setFormData] = useState<Partial<CreateUserRequest & { id?: number }>>({});
    const [adminFormData, setAdminFormData] = useState<Partial<CreateAdminRequest>>({});
    const [editFormData, setEditFormData] = useState<EditFormData>({});
    const [originalEditFormData, setOriginalEditFormData] = useState<EditFormData>({});
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Debounce search query
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            if (localSearchQuery !== searchQuery) {
                onSetSearchQuery(localSearchQuery);
            }
        }, 500);
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [localSearchQuery, searchQuery, onSetSearchQuery]);

    // Fetch data on mount
    useEffect(() => {
        onFetchUserStats();
    }, [onFetchUserStats]);

    // Refetch users when search query or filters change
    useEffect(() => {
        onFetchUsers();
    }, [onFetchUsers, searchQuery, roleFilter, statusFilter, page, rowsPerPage]);

    // Handle success messages
    useEffect(() => {
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            onClearSuccessMessage();
            onFetchUsers();
            onFetchUserStats();
        }
    }, [successMessage, onClearSuccessMessage, onFetchUsers, onFetchUserStats]);

    // Handle errors
    useEffect(() => { if (error) setSnackbar({ open: true, message: error, severity: 'error' }); }, [error]);
    useEffect(() => { if (createError) setSnackbar({ open: true, message: createError, severity: 'error' }); }, [createError]);
    useEffect(() => { if (createAdminError) setSnackbar({ open: true, message: createAdminError, severity: 'error' }); }, [createAdminError]);
    useEffect(() => { if (updateError) setSnackbar({ open: true, message: updateError, severity: 'error' }); }, [updateError]);
    useEffect(() => { if (statusChangeError) setSnackbar({ open: true, message: statusChangeError, severity: 'error' }); }, [statusChangeError]);
    useEffect(() => { if (permanentDeleteError) setSnackbar({ open: true, message: permanentDeleteError, severity: 'error' }); }, [permanentDeleteError]);

    // Populate edit form when userDetail is loaded
    useEffect(() => {
        if (userDetail && editDialogOpen && selectedUser && userDetail.id === selectedUser.id) {
            const roleSpecificData = userDetail.roleSpecificData;
            const newEditFormData: EditFormData = {
                id: userDetail.id,
                email: userDetail.email,
                role: userDetail.role,
                firstName: userDetail.firstName,
                lastName: userDetail.lastName,
                phone: userDetail.phoneNumber || '',
            };

            if (userDetail.role === 'ROLE_STUDENT' && roleSpecificData && 'studentId' in roleSpecificData) {
                newEditFormData.address = roleSpecificData.address || '';
                newEditFormData.dateOfBirth = roleSpecificData.dateOfBirth || '';
                newEditFormData.guardianName = roleSpecificData.guardianName || '';
                newEditFormData.guardianPhone = roleSpecificData.guardianPhone || '';
                if (roleSpecificData.clubMemberData) {
                    newEditFormData.clubName = roleSpecificData.clubMemberData.clubName || '';
                    newEditFormData.clubPosition = roleSpecificData.clubMemberData.clubPosition || '';
                    newEditFormData.clubJoinDate = roleSpecificData.clubMemberData.clubJoinDate || '';
                    newEditFormData.clubMembershipId = roleSpecificData.clubMemberData.clubMembershipId || '';
                }
            }

            if (userDetail.role === 'ROLE_ACADEMIC_STAFF' && roleSpecificData && 'employeeId' in roleSpecificData) {
                if ('designation' in roleSpecificData) newEditFormData.designation = roleSpecificData.designation || '';
                if ('specialization' in roleSpecificData) newEditFormData.specialization = roleSpecificData.specialization || '';
                if ('officeLocation' in roleSpecificData) newEditFormData.officeLocation = roleSpecificData.officeLocation || '';
            }

            if (userDetail.role === 'ROLE_NON_ACADEMIC_STAFF' && roleSpecificData && 'employeeId' in roleSpecificData) {
                if ('workShift' in roleSpecificData) newEditFormData.shift = roleSpecificData.workShift || '';
            }

            setEditFormData(newEditFormData);
            setOriginalEditFormData({ ...newEditFormData });
            setProfilePicturePreview(userDetail.profilePictureUrl);
        }
    }, [userDetail, editDialogOpen, selectedUser]);

    // Handlers
    const handleRefresh = useCallback(() => {
        onFetchUsers();
        onFetchUserStats();
    }, [onFetchUsers, onFetchUserStats]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserDisplayItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleViewUser = () => {
        handleMenuClose();
        if (!selectedUser) return;
        setViewDialogOpen(true);
        onClearSelectedUserDetail();
        onFetchUserById(selectedUser.id);
    };

    const handleEditUser = () => {
        handleMenuClose();
        if (selectedUser) {
            setEditFormData({});
            setOriginalEditFormData({});
            setFormErrors({});
            onClearSelectedUserDetail();
            onFetchUserById(selectedUser.id);
            setProfilePicturePreview(selectedUser.profilePictureUrl);
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
        if (!selectedUser || !confirmAction) return;

        switch (confirmAction) {
            case 'activate': onActivateUser(selectedUser.id); break;
            case 'deactivate': onDeactivateUser(selectedUser.id); break;
            case 'suspend': onSuspendUser(selectedUser.id); break;
            case 'unlock': onUnlockUser(selectedUser.id); break;
            case 'softDelete': onSoftDeleteUser(selectedUser.id); break;
            case 'restore':
                if (onRestoreUser) onRestoreUser(selectedUser.id);
                break;
            case 'permanentDelete':
                if (permanentDeleteConfirmText !== 'DELETE') {
                    setSnackbar({ open: true, message: 'Please type DELETE to confirm', severity: 'error' });
                    return;
                }
                if (onPermanentDeleteUser) onPermanentDeleteUser(selectedUser.id);
                break;
        }
        setConfirmDialogOpen(false);
        setPermanentDeleteConfirmText('');
    };

    // Create User handlers
    const handleCreateUser = () => {
        setFormData({ role: 'ROLE_STUDENT' as RoleType });
        setProfilePicturePreview(null);
        setFormErrors({});
        setCreateDialogOpen(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!formData.email?.trim()) errors.email = 'Email is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        if (!formData.role) errors.role = 'Role is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateAdminForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!adminFormData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!adminFormData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!adminFormData.email?.trim()) errors.email = 'Email is required';
        if (adminFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminFormData.email)) errors.email = 'Invalid email format';
        if (!adminFormData.password?.trim()) errors.password = 'Password is required';
        if (adminFormData.password && adminFormData.password.length < 8) errors.password = 'Password must be at least 8 characters';
        if (!adminFormData.adminId?.trim()) errors.adminId = 'Admin ID is required';
        if (!adminFormData.department?.trim()) errors.department = 'Department is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCreate = () => {
        if (!validateForm()) return;
        const createData: CreateUserRequest = {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phone: formData.phone || '',
            role: formData.role!,
        };
        if (formData.role === 'ROLE_STUDENT') {
            createData.studentId = formData.studentId;
            createData.batch = formData.batch;
            createData.program = formData.program;
            createData.faculty = formData.faculty;
            createData.dateOfBirth = formData.dateOfBirth;
            createData.address = formData.address;
        } else if (formData.role === 'ROLE_ACADEMIC_STAFF') {
            createData.employeeId = formData.employeeId;
            createData.position = formData.position;
            createData.designation = formData.designation;
            createData.department = formData.department;
            createData.faculty = formData.faculty;
        } else if (formData.role === 'ROLE_NON_ACADEMIC_STAFF') {
            createData.employeeId = formData.employeeId;
            createData.position = formData.position;
            createData.department = formData.department;
        }
        onCreateUser(createData);
        setCreateDialogOpen(false);
        setFormData({});
    };

    const handleSubmitCreateAdmin = () => {
        if (!validateAdminForm() || !onCreateAdmin) return;
        const createData: CreateAdminRequest = {
            email: adminFormData.email!,
            password: adminFormData.password!,
            firstName: adminFormData.firstName!,
            lastName: adminFormData.lastName!,
            adminId: adminFormData.adminId!,
            department: adminFormData.department!,
            phone: adminFormData.phone,
        };
        onCreateAdmin(createData);
        setCreateAdminDialogOpen(false);
        setAdminFormData({});
    };

    const handleSubmitEdit = () => {
        const errors: Record<string, string> = {};
        if (!editFormData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!editFormData.lastName?.trim()) errors.lastName = 'Last name is required';
        setFormErrors(errors);
        if (Object.keys(errors).length > 0 || !editFormData.id) return;

        const hasChanged = (key: keyof EditFormData): boolean => editFormData[key] !== originalEditFormData[key];
        const updateData: UpdateUserRequest = {};

        if (hasChanged('firstName')) updateData.firstName = editFormData.firstName;
        if (hasChanged('lastName')) updateData.lastName = editFormData.lastName;
        if (hasChanged('phone')) updateData.phone = editFormData.phone;
        if (hasChanged('address')) updateData.address = editFormData.address;
        if (hasChanged('dateOfBirth')) updateData.dateOfBirth = editFormData.dateOfBirth;

        if (editFormData.role === 'ROLE_STUDENT') {
            if (hasChanged('guardianName')) updateData.guardianName = editFormData.guardianName;
            if (hasChanged('guardianPhone')) updateData.guardianPhone = editFormData.guardianPhone;
            if (hasChanged('clubName')) updateData.clubName = editFormData.clubName;
            if (hasChanged('clubPosition')) updateData.clubPosition = editFormData.clubPosition;
            if (hasChanged('clubJoinDate')) updateData.clubJoinDate = editFormData.clubJoinDate;
            if (hasChanged('clubMembershipId')) updateData.clubMembershipId = editFormData.clubMembershipId;
        }

        if (editFormData.role === 'ROLE_ACADEMIC_STAFF') {
            if (hasChanged('designation')) updateData.designation = editFormData.designation;
            if (hasChanged('specialization')) updateData.specialization = editFormData.specialization;
            if (hasChanged('officeLocation')) updateData.officeLocation = editFormData.officeLocation;
            if (hasChanged('bio')) updateData.bio = editFormData.bio;
            if (hasChanged('availableForMeetings')) updateData.availableForMeetings = editFormData.availableForMeetings;
            if (hasChanged('responsibilities')) updateData.responsibilities = editFormData.responsibilities;
        }

        if (editFormData.role === 'ROLE_NON_ACADEMIC_STAFF') {
            if (hasChanged('workLocation')) updateData.workLocation = editFormData.workLocation;
            if (hasChanged('shift')) updateData.shift = editFormData.shift;
        }

        if (Object.keys(updateData).length === 0) {
            setSnackbar({ open: true, message: 'No changes to save', severity: 'info' });
            setEditDialogOpen(false);
            return;
        }

        onUpdateUser(editFormData.id, updateData);
        setEditDialogOpen(false);
        setEditFormData({});
        setOriginalEditFormData({});
        setProfilePicturePreview(null);
    };

    // Helper functions
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return theme.palette.success.main;
            case 'DEACTIVATED': return theme.palette.warning.main;
            case 'SUSPENDED': return theme.palette.error.main;
            case 'DELETED': return theme.palette.grey[500];
            case 'PASSWORD_CHANGE_REQUIRED': return theme.palette.secondary.main;
            default: return theme.palette.grey[500];
        }
    };

    // Stats
    const statusStats = [
        { label: 'Total Users', value: userStats?.totalUsers ?? 0, icon: GroupIcon, color: theme.palette.primary.main },
        { label: 'Active', value: userStats?.activeUsers ?? 0, icon: CheckCircleIcon, color: theme.palette.success.main },
        { label: 'Deactivated', value: userStats?.deactivatedUsers ?? 0, icon: BlockIcon, color: theme.palette.warning.main },
        { label: 'Suspended', value: userStats?.suspendedUsers ?? 0, icon: LockIcon, color: theme.palette.error.main },
        { label: 'Deleted', value: userStats?.deletedUsers ?? 0, icon: DeleteIcon, color: theme.palette.grey[600] },
        { label: 'Password Change', value: userStats?.passwordChangeRequiredUsers ?? 0, icon: VpnKeyIcon, color: theme.palette.secondary.main },
    ];

    const roleStats = [
        { label: 'Students', value: userStats?.totalStudents ?? 0, icon: SchoolIcon, color: '#3B82F6' },
        { label: 'Academic Staff', value: userStats?.totalAcademicStaff ?? 0, icon: WorkIcon, color: '#8B5CF6' },
        { label: 'Non-Academic', value: userStats?.totalNonAcademicStaff ?? 0, icon: EngineeringIcon, color: '#F59E0B' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }} fontWeight={700} gutterBottom>{title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{subtitle}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateUser} sx={{ borderRadius: 2 }} size={isMobile ? 'small' : 'medium'}>
                            Create User
                        </Button>
                    </Stack>
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

            {/* Role Stats Cards */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    {roleStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 4 }} key={index}>
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

            {/* Filters & Search */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 2 }} alignItems={{ md: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search by name or email..."
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ maxWidth: { md: 350 }, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> } }}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems={{ sm: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                <InputLabel>Role</InputLabel>
                                <Select value={roleFilter} label="Role" onChange={(e) => onSetRoleFilter(e.target.value as RoleType | '')}>
                                    <MenuItem value="">All Roles</MenuItem>
                                    {Object.entries(ROLE_LABELS)
                                        .filter(([value]) => value !== 'ROLE_ADMIN' && value !== 'ROLE_SUPER_ADMIN')
                                        .map(([value, label]) => (
                                            <MenuItem key={value} value={value}>{label}</MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                <InputLabel>Status</InputLabel>
                                <Select value={statusFilter} label="Status" onChange={(e) => onSetStatusFilter(e.target.value as StatusType | '')}>
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
                                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                                    <MenuItem value="DELETED">Deleted</MenuItem>
                                    <MenuItem value="PASSWORD_CHANGE_REQUIRED">Password Change</MenuItem>
                                </Select>
                            </FormControl>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={loading} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }, borderRadius: 2, width: 40, height: 40 }}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}><CircularProgress /></Box>
                ) : users.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}><Typography color="text.secondary">No users found</Typography></Box>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        {isMobile ? (
                            <Box sx={{ p: 1.5 }}>
                                <Stack spacing={1.5}>
                                    {users.map((user) => (
                                        <Paper key={user.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar src={user.profilePictureUrl || undefined} sx={{ bgcolor: ROLE_COLORS[user.role] || theme.palette.primary.main, width: 44, height: 44, fontWeight: 600 }}>
                                                            {getInitials(user.firstName, user.lastName, user.fullName)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{user.email}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}><MoreVertIcon /></IconButton>
                                                </Stack>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ gap: 0.5 }}>
                                                    <Chip label={ROLE_LABELS[user.role] || user.role} size="small" sx={{ bgcolor: alpha(ROLE_COLORS[user.role] || theme.palette.primary.main, 0.1), color: ROLE_COLORS[user.role] || theme.palette.primary.main, fontWeight: 500, fontSize: '0.7rem' }} />
                                                    <Chip icon={getStatusIcon(user.status) || undefined} label={STATUS_LABELS[user.status] || user.status} size="small" sx={{ bgcolor: alpha(getStatusColor(user.status), 0.1), color: getStatusColor(user.status), fontWeight: 500, fontSize: '0.7rem', '& .MuiChip-icon': { color: 'inherit', fontSize: '0.9rem' } }} />
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            /* Desktop Table View */
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
                                                        <Avatar src={user.profilePictureUrl || undefined} sx={{ bgcolor: ROLE_COLORS[user.role] || theme.palette.primary.main, width: { sm: 36, md: 40 }, height: { sm: 36, md: 40 }, fontWeight: 600 }}>
                                                            {getInitials(user.firstName, user.lastName, user.fullName)}
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
                                                    <Chip label={ROLE_LABELS[user.role] || user.role} size="small" sx={{ bgcolor: alpha(ROLE_COLORS[user.role] || theme.palette.primary.main, 0.1), color: ROLE_COLORS[user.role] || theme.palette.primary.main, fontWeight: 500, fontSize: { sm: '0.7rem', md: '0.75rem' } }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip icon={getStatusIcon(user.status) || undefined} label={STATUS_LABELS[user.status] || user.status} size="small" sx={{ bgcolor: alpha(getStatusColor(user.status), 0.1), color: getStatusColor(user.status), fontWeight: 500, fontSize: { sm: '0.7rem', md: '0.75rem' }, '& .MuiChip-icon': { color: 'inherit' } }} />
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
                        <TablePagination
                            component="div"
                            count={totalUsers}
                            page={page}
                            onPageChange={(_, p) => onSetPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => onSetPageSize(parseInt(e.target.value, 10))}
                            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                            labelRowsPerPage={isMobile ? '' : 'Rows per page:'}
                            sx={{ '.MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } }, '.MuiTablePagination-displayedRows': { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
                        />
                    </>
                )}
            </MotionCard>

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <MenuItem onClick={handleViewUser}><VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details</MenuItem>
                <MenuItem onClick={handleEditUser}><EditIcon sx={{ mr: 1.5, fontSize: 20 }} />Edit User</MenuItem>
                <Divider />
                {(selectedUser?.status === 'DEACTIVATED' || selectedUser?.status === 'PASSWORD_CHANGE_REQUIRED') && (
                    <MenuItem onClick={() => handleStatusAction('activate')} sx={{ color: 'success.main' }}><PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />Activate</MenuItem>
                )}
                {selectedUser?.status === 'ACTIVE' && (
                    <MenuItem onClick={() => handleStatusAction('deactivate')} sx={{ color: 'warning.main' }}><PersonOffIcon sx={{ mr: 1.5, fontSize: 20 }} />Deactivate</MenuItem>
                )}
                {selectedUser?.status === 'ACTIVE' && (
                    <MenuItem onClick={() => handleStatusAction('suspend')} sx={{ color: 'error.main' }}><BlockIcon sx={{ mr: 1.5, fontSize: 20 }} />Suspend</MenuItem>
                )}
                {selectedUser?.status === 'SUSPENDED' && (
                    <MenuItem onClick={() => handleStatusAction('unlock')} sx={{ color: 'info.main' }}><LockIcon sx={{ mr: 1.5, fontSize: 20 }} />Unlock</MenuItem>
                )}
                {selectedUser?.status !== 'DELETED' && <Divider />}
                {selectedUser?.status !== 'DELETED' && (
                    <MenuItem onClick={() => handleStatusAction('softDelete')} sx={{ color: 'warning.main' }}><DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />Soft Delete</MenuItem>
                )}
                {/* Super Admin Only - Restore */}
                {isSuperAdmin && selectedUser?.status === 'DELETED' && onRestoreUser && (
                    <MenuItem onClick={() => handleStatusAction('restore')} sx={{ color: 'success.main' }}><RestoreIcon sx={{ mr: 1.5, fontSize: 20 }} />Restore User</MenuItem>
                )}
                {/* Super Admin Only - Permanent Delete */}
                {isSuperAdmin && onPermanentDeleteUser && <Divider />}
                {isSuperAdmin && onPermanentDeleteUser && (
                    <MenuItem onClick={() => handleStatusAction('permanentDelete')} sx={{ color: 'error.main' }}><DeleteForeverIcon sx={{ mr: 1.5, fontSize: 20 }} />Permanently Delete</MenuItem>
                )}
            </Menu>

            {/* Create User Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, m: isMobile ? 0 : 2 } }}>
                <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Create New User</Typography>
                        <IconButton onClick={() => setCreateDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Basic Information</Typography>
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="First Name" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} error={!!formErrors.firstName} helperText={formErrors.firstName} required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Last Name" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} error={!!formErrors.lastName} helperText={formErrors.lastName} required />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Email" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Phone Number" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }} />
                            </Grid>
                        </Grid>
                        <FormControl fullWidth error={!!formErrors.role} required size={isMobile ? 'small' : 'medium'}>
                            <InputLabel>Role</InputLabel>
                            <Select value={formData.role || ''} label="Role" onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}>
                                {Object.entries(ROLE_LABELS).filter(([value]) => value !== 'ROLE_ADMIN' && value !== 'ROLE_SUPER_ADMIN').map(([value, label]) => (
                                    <MenuItem key={value} value={value}>{label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Student Fields */}
                        {formData.role === 'ROLE_STUDENT' && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Student Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Student ID" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.studentId || ''} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Batch" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.batch || ''} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} placeholder="e.g., 2024" /></Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Program" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.program || ''} onChange={(e) => setFormData({ ...formData, program: e.target.value })} placeholder="e.g., BSc Computer Science" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                            <InputLabel>Faculty</InputLabel>
                                            <Select value={formData.faculty || ''} label="Faculty" onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}>
                                                {Object.entries(FACULTY).map(([key, value]) => (<MenuItem key={key} value={value}>{FACULTY_LABELS[key]}</MenuItem>))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Date of Birth" type="date" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.dateOfBirth || ''} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Address" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></Grid>
                                </Grid>
                            </>
                        )}

                        {/* Academic Staff Fields */}
                        {formData.role === 'ROLE_ACADEMIC_STAFF' && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Academic Staff Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Employee ID" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Position" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="e.g., Senior Lecturer" /></Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Designation" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g., Dr., Prof." /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Department" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Software Engineering" /></Grid>
                                </Grid>
                                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                    <InputLabel>Faculty</InputLabel>
                                    <Select value={formData.faculty || ''} label="Faculty" onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}>
                                        {Object.entries(FACULTY).map(([key, value]) => (<MenuItem key={key} value={value}>{FACULTY_LABELS[key]}</MenuItem>))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        {/* Non-Academic Staff Fields */}
                        {formData.role === 'ROLE_NON_ACADEMIC_STAFF' && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Non-Academic Staff Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Employee ID" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><TextField label="Position" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="e.g., Administrative Officer" /></Grid>
                                </Grid>
                                <TextField label="Department" fullWidth size={isMobile ? 'small' : 'medium'} value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Administration" />
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitCreate} disabled={isCreating}>{isCreating ? <CircularProgress size={20} /> : 'Create User'}</Button>
                </DialogActions>
            </Dialog>

            {/* Create Admin Dialog (Super Admin only) */}
            {isSuperAdmin && (
                <Dialog open={createAdminDialogOpen} onClose={() => setCreateAdminDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, m: isMobile ? 0 : 2 } }}>
                    <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Create Admin User</Typography>
                            <IconButton onClick={() => setCreateAdminDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                        <Alert severity="info" sx={{ mb: 2 }}>Admin users have elevated privileges. Please set a secure password.</Alert>
                        <Stack spacing={{ xs: 2, sm: 3 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.firstName || ''} onChange={(e) => setAdminFormData({ ...adminFormData, firstName: e.target.value })} error={!!formErrors.firstName} helperText={formErrors.firstName} required /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.lastName || ''} onChange={(e) => setAdminFormData({ ...adminFormData, lastName: e.target.value })} error={!!formErrors.lastName} helperText={formErrors.lastName} required /></Grid>
                            </Grid>
                            <TextField label="Email" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.email || ''} onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required />
                            <TextField label="Password" type="password" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.password || ''} onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })} error={!!formErrors.password} helperText={formErrors.password || 'Minimum 8 characters'} required />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Admin ID" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.adminId || ''} onChange={(e) => setAdminFormData({ ...adminFormData, adminId: e.target.value })} error={!!formErrors.adminId} helperText={formErrors.adminId} required /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.phone || ''} onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })} /></Grid>
                            </Grid>
                            <TextField label="Department" fullWidth size={isMobile ? 'small' : 'medium'} value={adminFormData.department || ''} onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })} error={!!formErrors.department} helperText={formErrors.department} required placeholder="e.g., IT Department" />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setCreateAdminDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" color="secondary" onClick={handleSubmitCreateAdmin} disabled={isCreatingAdmin}>{isCreatingAdmin ? <CircularProgress size={20} /> : 'Create Admin'}</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setEditFormData({}); }} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, m: isMobile ? 0 : 2 } }}>
                <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Edit User</Typography>
                        <IconButton onClick={() => { setEditDialogOpen(false); setEditFormData({}); }} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {userDetailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : (
                        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar src={profilePicturePreview || undefined} sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, mx: 'auto', mb: 2, bgcolor: ROLE_COLORS[editFormData.role || ''] || theme.palette.primary.main, fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600 }}>
                                    {getInitials(editFormData.firstName || '', editFormData.lastName || '', `${editFormData.firstName || ''} ${editFormData.lastName || ''}`)}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary">Profile picture can only be changed by the user</Typography>
                            </Box>
                            <Divider />
                            <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.firstName || ''} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} error={!!formErrors.firstName} helperText={formErrors.firstName} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.lastName || ''} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} error={!!formErrors.lastName} helperText={formErrors.lastName} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Email" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.email || ''} disabled helperText="Email cannot be changed" /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone Number" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.phone || ''} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="e.g., 0771234567" /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Address" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.address || ''} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Date of Birth" type="date" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.dateOfBirth || ''} onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                            </Grid>

                            {/* Student-specific fields */}
                            {editFormData.role === 'ROLE_STUDENT' && (
                                <>
                                    <Divider />
                                    <Typography variant="subtitle2" color="text.secondary">Guardian Information</Typography>
                                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Guardian Name" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.guardianName || ''} onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })} /></Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Guardian Phone" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.guardianPhone || ''} onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })} /></Grid>
                                    </Grid>
                                    {editFormData.clubName && (
                                        <>
                                            <Typography variant="subtitle2" color="text.secondary">Club Membership</Typography>
                                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Club Name" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.clubName || ''} onChange={(e) => setEditFormData({ ...editFormData, clubName: e.target.value })} /></Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Club Position" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.clubPosition || ''} onChange={(e) => setEditFormData({ ...editFormData, clubPosition: e.target.value })} /></Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Club Membership ID" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.clubMembershipId || ''} onChange={(e) => setEditFormData({ ...editFormData, clubMembershipId: e.target.value })} /></Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Club Join Date" type="date" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.clubJoinDate || ''} onChange={(e) => setEditFormData({ ...editFormData, clubJoinDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                                            </Grid>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Academic Staff-specific fields */}
                            {editFormData.role === 'ROLE_ACADEMIC_STAFF' && (
                                <>
                                    <Divider />
                                    <Typography variant="subtitle2" color="text.secondary">Academic Information</Typography>
                                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Designation" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.designation || ''} onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })} placeholder="e.g., Senior Lecturer" /></Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Specialization" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.specialization || ''} onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })} placeholder="e.g., Artificial Intelligence" /></Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Office Location" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.officeLocation || ''} onChange={(e) => setEditFormData({ ...editFormData, officeLocation: e.target.value })} placeholder="e.g., Room 101" /></Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Responsibilities" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.responsibilities || ''} onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })} /></Grid>
                                        <Grid size={{ xs: 12 }}><TextField label="Bio" fullWidth multiline rows={3} size={isMobile ? 'small' : 'medium'} value={editFormData.bio || ''} onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })} /></Grid>
                                    </Grid>
                                </>
                            )}

                            {/* Non-Academic Staff-specific fields */}
                            {editFormData.role === 'ROLE_NON_ACADEMIC_STAFF' && (
                                <>
                                    <Divider />
                                    <Typography variant="subtitle2" color="text.secondary">Work Information</Typography>
                                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Work Location" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.workLocation || ''} onChange={(e) => setEditFormData({ ...editFormData, workLocation: e.target.value })} placeholder="e.g., Main Building" /></Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Shift" fullWidth size={isMobile ? 'small' : 'medium'} value={editFormData.shift || ''} onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })} placeholder="e.g., Day Shift" /></Grid>
                                    </Grid>
                                </>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => { setEditDialogOpen(false); setEditFormData({}); }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitEdit} disabled={isUpdating || userDetailLoading}>{isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}</Button>
                </DialogActions>
            </Dialog>

            {/* View User Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, m: isMobile ? 0 : 2 } }}>
                <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>User Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {userDetailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : userDetail ? (
                        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar src={userDetail.profilePictureUrl || undefined} sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, mx: 'auto', mb: 2, bgcolor: ROLE_COLORS[userDetail.role] || theme.palette.primary.main, fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600 }}>
                                    {getInitials(userDetail.firstName, userDetail.lastName, userDetail.fullName)}
                                </Avatar>
                                <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{userDetail.fullName}</Typography>
                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                    <Chip label={ROLE_LABELS[userDetail.role]} size="small" sx={{ bgcolor: alpha(ROLE_COLORS[userDetail.role], 0.1), color: ROLE_COLORS[userDetail.role] }} />
                                    <Chip icon={getStatusIcon(userDetail.status) || undefined} label={STATUS_LABELS[userDetail.status] || userDetail.status} size="small" sx={{ bgcolor: alpha(getStatusColor(userDetail.status), 0.1), color: getStatusColor(userDetail.status), '& .MuiChip-icon': { color: 'inherit' } }} />
                                </Stack>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Basic Information</Typography>
                                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <EmailIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>{userDetail.email}</Typography></Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <PhoneIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography variant="body2">{userDetail.phoneNumber || 'Not provided'}</Typography></Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <BadgeIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box><Typography variant="caption" color="text.secondary">User ID</Typography><Typography variant="body2">{userDetail.id}</Typography></Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <BadgeIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box><Typography variant="caption" color="text.secondary">User Type</Typography><Typography variant="body2">{userDetail.userType}</Typography></Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Role-Specific Information */}
                            {userDetail.roleSpecificData && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                            {userDetail.role === 'ROLE_STUDENT' && 'Student Information'}
                                            {userDetail.role === 'ROLE_ACADEMIC_STAFF' && 'Academic Staff Information'}
                                            {userDetail.role === 'ROLE_NON_ACADEMIC_STAFF' && 'Non-Academic Staff Information'}
                                        </Typography>
                                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                            {userDetail.role === 'ROLE_STUDENT' && 'studentId' in userDetail.roleSpecificData && (
                                                <>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Student ID</Typography><Typography variant="body2">{userDetail.roleSpecificData.studentId}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Program</Typography><Typography variant="body2">{userDetail.roleSpecificData.program || 'N/A'}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Faculty</Typography><Typography variant="body2">{FACULTY_LABELS[userDetail.roleSpecificData.faculty as keyof typeof FACULTY_LABELS] || userDetail.roleSpecificData.faculty || 'N/A'}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Batch</Typography><Typography variant="body2">{userDetail.roleSpecificData.batch || 'N/A'}</Typography></Grid>
                                                </>
                                            )}
                                            {userDetail.role === 'ROLE_ACADEMIC_STAFF' && 'employeeId' in userDetail.roleSpecificData && (
                                                <>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Employee ID</Typography><Typography variant="body2">{userDetail.roleSpecificData.employeeId}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{userDetail.roleSpecificData.department || 'N/A'}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Position</Typography><Typography variant="body2">{userDetail.roleSpecificData.position || 'N/A'}</Typography></Grid>
                                                </>
                                            )}
                                            {userDetail.role === 'ROLE_NON_ACADEMIC_STAFF' && 'employeeId' in userDetail.roleSpecificData && (
                                                <>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Employee ID</Typography><Typography variant="body2">{userDetail.roleSpecificData.employeeId}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{userDetail.roleSpecificData.department || 'N/A'}</Typography></Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Position</Typography><Typography variant="body2">{userDetail.roleSpecificData.position || 'N/A'}</Typography></Grid>
                                                </>
                                            )}
                                        </Grid>
                                    </Box>
                                </>
                            )}

                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Account Information</Typography>
                                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Created At</Typography><Typography variant="body2">{new Date(userDetail.createdAt).toLocaleString()}</Typography></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Last Updated</Typography><Typography variant="body2">{new Date(userDetail.updatedAt).toLocaleString()}</Typography></Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}><Typography color="text.secondary">Failed to load user details</Typography></Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => setViewDialogOpen(false)} fullWidth={isMobile}>Close</Button>
                    <Button variant="contained" onClick={() => { setViewDialogOpen(false); handleEditUser(); }} fullWidth={isMobile} disabled={!userDetail}>Edit User</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, m: { xs: 2, sm: 2 } } }}>
                <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {confirmAction === 'activate' && 'Activate User'}
                    {confirmAction === 'deactivate' && 'Deactivate User'}
                    {confirmAction === 'suspend' && 'Suspend User'}
                    {confirmAction === 'unlock' && 'Unlock User'}
                    {confirmAction === 'softDelete' && 'Delete User'}
                    {confirmAction === 'restore' && 'Restore User'}
                    {confirmAction === 'permanentDelete' && 'Permanently Delete User'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {confirmAction === 'activate' && `Are you sure you want to activate ${selectedUser?.fullName}'s account?`}
                        {confirmAction === 'deactivate' && `Are you sure you want to deactivate ${selectedUser?.fullName}'s account? They will no longer be able to log in.`}
                        {confirmAction === 'suspend' && `Are you sure you want to suspend ${selectedUser?.fullName}'s account? This will immediately block their access.`}
                        {confirmAction === 'unlock' && `Are you sure you want to unlock ${selectedUser?.fullName}'s account? They will be able to log in again.`}
                        {confirmAction === 'softDelete' && `Are you sure you want to delete ${selectedUser?.fullName}'s account? This action will soft delete the user.`}
                        {confirmAction === 'restore' && `Are you sure you want to restore ${selectedUser?.fullName}'s account?`}
                        {confirmAction === 'permanentDelete' && `Are you sure you want to PERMANENTLY delete ${selectedUser?.fullName}'s account? This action is IRREVERSIBLE!`}
                    </Typography>
                    {confirmAction === 'permanentDelete' && (
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <WarningAmberIcon />
                                    <Typography variant="body2" fontWeight={600}>Type &quot;DELETE&quot; to confirm</Typography>
                                </Stack>
                            </Alert>
                            <TextField fullWidth size="small" placeholder="Type DELETE to confirm" value={permanentDeleteConfirmText} onChange={(e) => setPermanentDeleteConfirmText(e.target.value)} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} fullWidth={isMobile}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={(confirmAction === 'deactivate' || confirmAction === 'suspend' || confirmAction === 'softDelete' || confirmAction === 'permanentDelete') ? 'error' : 'success'}
                        onClick={handleConfirmAction}
                        disabled={isStatusChanging || isPermanentDeleting || (confirmAction === 'permanentDelete' && permanentDeleteConfirmText !== 'DELETE')}
                        fullWidth={isMobile}
                    >
                        {(isStatusChanging || isPermanentDeleting) ? <CircularProgress size={20} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }} sx={{ bottom: { xs: 16, sm: 24 } }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2, width: { xs: '90vw', sm: 'auto' } }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}


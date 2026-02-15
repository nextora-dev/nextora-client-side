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
import RestoreIcon from '@mui/icons-material/Restore';
import { ROLE_LABELS, RoleType } from '@/constants/roles';
import { FACULTY, FACULTY_LABELS } from '@/constants/faculty';
import { CreateUserRequest, UpdateUserRequest, User } from '@/features/admin';
import { StatusType, STATUS_LABELS } from "@/constants";
import { useAppDispatch, useAppSelector } from '@/store';
import {
    // Thunks
    fetchUsers,
    fetchUserStats,
    fetchUserById,
    createUserAsync,
    updateUserAsync,
    activateUserAsync,
    deactivateUserAsync,
    suspendUserAsync,
    unlockUserAsync,
    softDeleteUserAsync,
    restoreUserAsync,
    // Actions
    setSearchQuery as setSearchQueryAction,
    setRoleFilter as setRoleFilterAction,
    setStatusFilter as setStatusFilterAction,
    setCurrentPage,
    setPageSize,
    clearSelectedUserDetail,
    clearSuccessMessage,
    // Selectors
    selectAdminUsers,
    selectAdminTotalUsers,
    selectAdminCurrentPage,
    selectAdminPageSize,
    selectAdminSearchQuery,
    selectAdminRoleFilter,
    selectAdminStatusFilter,
    selectAdminStats,
    selectAdminIsLoading,
    selectAdminError,
    selectSelectedUserDetail,
    selectIsUserDetailLoading,
    selectIsCreating,
    selectIsUpdating,
    selectIsStatusChanging,
    selectSuccessMessage,
    selectCreateError,
    selectUpdateError,
    selectStatusChangeError,
} from '@/features/admin';

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

// Display item interface for table (maps from backend User)
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
    status: StatusType
}

// Edit form data interface - includes all editable fields
interface EditFormData {
    id?: number;
    email?: string;
    role?: RoleType;
    // Basic fields
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    // Guardian fields (students)
    guardianName?: string;
    guardianPhone?: string;
    // Club member fields
    clubName?: string;
    clubPosition?: string;
    clubJoinDate?: string;
    clubMembershipId?: string;
    // Academic staff fields
    designation?: string;
    specialization?: string;
    officeLocation?: string;
    bio?: string;
    availableForMeetings?: boolean;
    responsibilities?: string;
    // Non-academic staff fields
    workLocation?: string;
    shift?: string;
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

export default function AdminUsersPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Redux state
    const dispatch = useAppDispatch();
    const usersFromStore = useAppSelector(selectAdminUsers);
    const totalUsers = useAppSelector(selectAdminTotalUsers);
    const page = useAppSelector(selectAdminCurrentPage);
    const rowsPerPage = useAppSelector(selectAdminPageSize);
    const searchQuery = useAppSelector(selectAdminSearchQuery);
    const roleFilter = useAppSelector(selectAdminRoleFilter);
    const statusFilter = useAppSelector(selectAdminStatusFilter);
    const userStats = useAppSelector(selectAdminStats);
    const loading = useAppSelector(selectAdminIsLoading);
    const error = useAppSelector(selectAdminError);

    // User detail from Redux
    const userDetail = useAppSelector(selectSelectedUserDetail);
    const userDetailLoading = useAppSelector(selectIsUserDetailLoading);

    // Operation loading states from Redux
    const isCreating = useAppSelector(selectIsCreating);
    const isUpdating = useAppSelector(selectIsUpdating);
    const isStatusChanging = useAppSelector(selectIsStatusChanging);

    // Messages from Redux
    const successMessage = useAppSelector(selectSuccessMessage);
    const createError = useAppSelector(selectCreateError);
    const updateError = useAppSelector(selectUpdateError);
    const statusChangeError = useAppSelector(selectStatusChangeError);

    // Map users from store to display format
    const users = useMemo(() => usersFromStore.map(mapUserToDisplay), [usersFromStore]);

    // Local UI state
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserDisplayItem | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce search query and dispatch to Redux
    useEffect(() => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        searchTimerRef.current = setTimeout(() => {
            if (localSearchQuery !== searchQuery) {
                dispatch(setSearchQueryAction(localSearchQuery));
            }
        }, 500);
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [localSearchQuery, searchQuery, dispatch]);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | 'suspend' | 'unlock' | 'delete' | 'restore' | null>(null);


    // Form state for create user
    const [formData, setFormData] = useState<Partial<CreateUserRequest & { id?: number }>>({});
    // Form state for edit user
    const [editFormData, setEditFormData] = useState<EditFormData>({});
    // Original form data to track changes
    const [originalEditFormData, setOriginalEditFormData] = useState<EditFormData>({});
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch users and stats on mount and when filters change
    useEffect(() => {
        dispatch(fetchUsers({
            page,
            size: rowsPerPage,
            searchQuery,
            roleFilter,
            statusFilter,
        }));
    }, [dispatch, searchQuery, roleFilter, statusFilter, page, rowsPerPage]);

    // Fetch stats on mount
    useEffect(() => {
        dispatch(fetchUserStats());
    }, [dispatch]);

    // Handle success messages from Redux
    useEffect(() => {
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearSuccessMessage());
            // Refresh data after successful operation
            dispatch(fetchUsers({ page, size: rowsPerPage, searchQuery, roleFilter, statusFilter }));
            dispatch(fetchUserStats());
        }
    }, [successMessage, dispatch, page, rowsPerPage, searchQuery, roleFilter, statusFilter]);

    // Handle errors from Redux
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
        }
    }, [error]);

    useEffect(() => {
        if (createError) {
            setSnackbar({ open: true, message: createError, severity: 'error' });
        }
    }, [createError]);

    useEffect(() => {
        if (updateError) {
            setSnackbar({ open: true, message: updateError, severity: 'error' });
        }
    }, [updateError]);

    useEffect(() => {
        if (statusChangeError) {
            setSnackbar({ open: true, message: statusChangeError, severity: 'error' });
        }
    }, [statusChangeError]);

    // Refresh data handler
    const handleRefresh = useCallback(() => {
        dispatch(fetchUsers({
            page,
            size: rowsPerPage,
            searchQuery,
            roleFilter,
            statusFilter,
        }));
        dispatch(fetchUserStats());
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
        dispatch(clearSelectedUserDetail());
        dispatch(fetchUserById(selectedUser.id));
    };

const handleEditUser = () => {
        handleMenuClose();
        if (selectedUser) {
            // Clear previous form data first
            setEditFormData({});
            setOriginalEditFormData({});
            setFormErrors({});
            // Clear previous user detail from Redux
            dispatch(clearSelectedUserDetail());
            // Fetch fresh user details
            dispatch(fetchUserById(selectedUser.id));
            setProfilePicturePreview(selectedUser.profilePictureUrl);
        }
        setEditDialogOpen(true);
    };

    // Populate edit form when userDetail is loaded
    useEffect(() => {
        // Only populate if dialog is open and we have userDetail matching the selected user
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

            // Student-specific fields
            if (userDetail.role === 'ROLE_STUDENT' && roleSpecificData && 'studentId' in roleSpecificData) {
                newEditFormData.address = roleSpecificData.address || '';
                newEditFormData.dateOfBirth = roleSpecificData.dateOfBirth || '';
                newEditFormData.guardianName = roleSpecificData.guardianName || '';
                newEditFormData.guardianPhone = roleSpecificData.guardianPhone || '';

                // Club member data
                if (roleSpecificData.clubMemberData) {
                    newEditFormData.clubName = roleSpecificData.clubMemberData.clubName || '';
                    newEditFormData.clubPosition = roleSpecificData.clubMemberData.clubPosition || '';
                    newEditFormData.clubJoinDate = roleSpecificData.clubMemberData.clubJoinDate || '';
                    newEditFormData.clubMembershipId = roleSpecificData.clubMemberData.clubMembershipId || '';
                }
            }

            // Academic staff-specific fields
            if (userDetail.role === 'ROLE_ACADEMIC_STAFF' && roleSpecificData && 'employeeId' in roleSpecificData) {
                if ('designation' in roleSpecificData) {
                    newEditFormData.designation = roleSpecificData.designation || '';
                }
                if ('specialization' in roleSpecificData) {
                    newEditFormData.specialization = roleSpecificData.specialization || '';
                }
                if ('officeLocation' in roleSpecificData) {
                    newEditFormData.officeLocation = roleSpecificData.officeLocation || '';
                }
            }

            // Non-academic staff-specific fields
            if (userDetail.role === 'ROLE_NON_ACADEMIC_STAFF' && roleSpecificData && 'employeeId' in roleSpecificData) {
                if ('workShift' in roleSpecificData) {
                    newEditFormData.shift = roleSpecificData.workShift || '';
                }
            }

            setEditFormData(newEditFormData);
            setOriginalEditFormData({ ...newEditFormData }); // Save original for comparison
            setProfilePicturePreview(userDetail.profilePictureUrl);
        }
    }, [userDetail, editDialogOpen, selectedUser]);

    const handleStatusAction = (action: 'activate' | 'deactivate' | 'suspend' | 'unlock' | 'delete' | 'restore') => {
        handleMenuClose();
        setConfirmAction(action);
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedUser || !confirmAction) return;

        // Dispatch appropriate Redux thunk based on action
        if (confirmAction === 'activate') {
            dispatch(activateUserAsync(selectedUser.id));
        } else if (confirmAction === 'deactivate') {
            dispatch(deactivateUserAsync(selectedUser.id));
        } else if (confirmAction === 'suspend') {
            dispatch(suspendUserAsync(selectedUser.id));
        } else if (confirmAction === 'unlock') {
            dispatch(unlockUserAsync(selectedUser.id));
        } else if (confirmAction === 'delete') {
            dispatch(softDeleteUserAsync(selectedUser.id));
        } else if (confirmAction === 'restore') {
            dispatch(restoreUserAsync(selectedUser.id));
        }

        setConfirmDialogOpen(false);
    };

    const handleCreateUser = () => {
        setFormData({ role: 'ROLE_STUDENT' as RoleType });
        setProfilePicturePreview(null);
        setFormErrors({});
        setCreateDialogOpen(true);
    };

    const validateForm = (isCreate: boolean = true): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (isCreate && !formData.email?.trim()) errors.email = 'Email is required';
        if (isCreate && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        if (!formData.role) errors.role = 'Role is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCreate = () => {
        if (!validateForm(true)) return;

        // Build create data with all role-specific fields
        const createData: CreateUserRequest = {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phone: formData.phone || '',
            role: formData.role!,
        };

        // Add role-specific fields
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

        dispatch(createUserAsync(createData));
        setCreateDialogOpen(false);
        setFormData({});
    };

    const handleSubmitEdit = () => {
        // Validate edit form
        const errors: Record<string, string> = {};
        if (!editFormData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!editFormData.lastName?.trim()) errors.lastName = 'Last name is required';
        setFormErrors(errors);
        if (Object.keys(errors).length > 0 || !editFormData.id) return;

        // Helper function to check if a field has changed
        const hasChanged = (key: keyof EditFormData): boolean => {
            const current = editFormData[key];
            const original = originalEditFormData[key];
            // Consider changed if values are different (including empty string vs undefined)
            return current !== original;
        };

        // Build update data with ONLY changed fields
        const updateData: UpdateUserRequest = {};

        // Basic fields - only add if changed
        if (hasChanged('firstName')) updateData.firstName = editFormData.firstName;
        if (hasChanged('lastName')) updateData.lastName = editFormData.lastName;
        if (hasChanged('phone')) updateData.phone = editFormData.phone;
        if (hasChanged('address')) updateData.address = editFormData.address;
        if (hasChanged('dateOfBirth')) updateData.dateOfBirth = editFormData.dateOfBirth;

        // Student-specific fields - only add if changed
        if (editFormData.role === 'ROLE_STUDENT') {
            if (hasChanged('guardianName')) updateData.guardianName = editFormData.guardianName;
            if (hasChanged('guardianPhone')) updateData.guardianPhone = editFormData.guardianPhone;
            // Club member fields
            if (hasChanged('clubName')) updateData.clubName = editFormData.clubName;
            if (hasChanged('clubPosition')) updateData.clubPosition = editFormData.clubPosition;
            if (hasChanged('clubJoinDate')) updateData.clubJoinDate = editFormData.clubJoinDate;
            if (hasChanged('clubMembershipId')) updateData.clubMembershipId = editFormData.clubMembershipId;
        }

        // Academic staff-specific fields - only add if changed
        if (editFormData.role === 'ROLE_ACADEMIC_STAFF') {
            if (hasChanged('designation')) updateData.designation = editFormData.designation;
            if (hasChanged('specialization')) updateData.specialization = editFormData.specialization;
            if (hasChanged('officeLocation')) updateData.officeLocation = editFormData.officeLocation;
            if (hasChanged('bio')) updateData.bio = editFormData.bio;
            if (hasChanged('availableForMeetings')) updateData.availableForMeetings = editFormData.availableForMeetings;
            if (hasChanged('responsibilities')) updateData.responsibilities = editFormData.responsibilities;
        }

        // Non-academic staff-specific fields - only add if changed
        if (editFormData.role === 'ROLE_NON_ACADEMIC_STAFF') {
            if (hasChanged('workLocation')) updateData.workLocation = editFormData.workLocation;
            if (hasChanged('shift')) updateData.shift = editFormData.shift;
        }

        // Only submit if there are changes
        if (Object.keys(updateData).length === 0) {
            setSnackbar({ open: true, message: 'No changes to save', severity: 'info' });
            setEditDialogOpen(false);
            return;
        }

        dispatch(updateUserAsync({ id: editFormData.id, data: updateData }));
        setEditDialogOpen(false);
        setEditFormData({});
        setOriginalEditFormData({});
        setProfilePicturePreview(null);
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
    ];
    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }} fontWeight={700} gutterBottom>User Management</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Manage user accounts, roles, and permissions</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateUser}
                        sx={{ borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                        fullWidth={isMobile}
                    >
                        Create User
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
                            <Grid size={{ xs: 6, sm: 4, md: 4 }} key={index}>
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
                                <Select value={roleFilter} label="Role" onChange={(e) => dispatch(setRoleFilterAction(e.target.value as RoleType | ''))}>
                                    <MenuItem value="">All Roles</MenuItem>
                                    {Object.entries(ROLE_LABELS)
                                        .filter(([value]) => value !== 'ROLE_ADMIN' && value !== 'ROLE_SUPER_ADMIN')
                                        .map(([value, label]) => (
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
                                <Select value={statusFilter} label="Status" onChange={(e) => dispatch(setStatusFilterAction(e.target.value as StatusType | ''))}>
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

            {/* Users List - Cards for Mobile, Table for Desktop */}
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
                                                {/* User Info Row */}
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

                                                {/* Chips Row */}
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
                                                    <Stack direction="row" alignItems="center" spacing={1}>
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
                                                    </Stack>
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
                            onPageChange={(_, p) => dispatch(setCurrentPage(p))}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => dispatch(setPageSize(parseInt(e.target.value, 10)))}
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
                <MenuItem onClick={handleViewUser}><VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />View Details</MenuItem>
                <MenuItem onClick={handleEditUser}><EditIcon sx={{ mr: 1.5, fontSize: 20 }} />Edit User</MenuItem>
                <Divider />
                {/* Activate - show when user is deactivated or password change required */}
                {(selectedUser?.status === 'DEACTIVATED' || selectedUser?.status === 'PASSWORD_CHANGE_REQUIRED') && (
                    <MenuItem onClick={() => handleStatusAction('activate')} sx={{ color: 'success.main' }}>
                        <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />Activate
                    </MenuItem>
                )}
                {/* Deactivate - show when user is active */}
                {selectedUser?.status === 'ACTIVE' && (
                    <MenuItem onClick={() => handleStatusAction('deactivate')} sx={{ color: 'warning.main' }}>
                        <PersonOffIcon sx={{ mr: 1.5, fontSize: 20 }} />Deactivate
                    </MenuItem>
                )}
                {/* Suspend - show when user is active */}
                {selectedUser?.status === 'ACTIVE' && (
                    <MenuItem onClick={() => handleStatusAction('suspend')} sx={{ color: 'error.main' }}>
                        <BlockIcon sx={{ mr: 1.5, fontSize: 20 }} />Suspend
                    </MenuItem>
                )}
                {/* Unlock - show when user is suspended */}
                {selectedUser?.status === 'SUSPENDED' && (
                    <MenuItem onClick={() => handleStatusAction('unlock')} sx={{ color: 'info.main' }}>
                        <LockIcon sx={{ mr: 1.5, fontSize: 20 }} />Unlock
                    </MenuItem>
                )}
                {/* Soft Delete - show when user is not already deleted */}
                {selectedUser?.status !== 'DELETED' && <Divider />}
                {selectedUser?.status !== 'DELETED' && (
                    <MenuItem onClick={() => handleStatusAction('delete')} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />Soft Delete
                    </MenuItem>
                )}
                {/* Restore - show when user is deleted */}
                {selectedUser?.status === 'DELETED' && (
                    <MenuItem onClick={() => handleStatusAction('restore')} sx={{ color: 'success.main' }}>
                        <RestoreIcon sx={{ mr: 1.5, fontSize: 20 }} />Restore
                    </MenuItem>
                )}
            </Menu>

            {/* Create User Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 1,
                        m: isMobile ? 0 : 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 1 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Create New User</Typography>
                        <IconButton onClick={() => setCreateDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                        {/* Basic Information */}
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Basic Information</Typography>
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    value={formData.firstName || ''}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    error={!!formErrors.firstName}
                                    helperText={formErrors.firstName}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Last Name"
                                    fullWidth
                                    value={formData.lastName || ''}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    error={!!formErrors.lastName}
                                    helperText={formErrors.lastName}
                                    required
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    error={!!formErrors.email}
                                    helperText={formErrors.email}
                                    required
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Phone Number"
                                    fullWidth
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <FormControl fullWidth error={!!formErrors.role} required>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role || ''}
                                label="Role"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                            >
                                {Object.entries(ROLE_LABELS)
                                    .filter(([value]) => value !== 'ROLE_ADMIN' && value !== 'ROLE_SUPER_ADMIN')
                                    .map(([value, label]) => (
                                        <MenuItem key={value} value={value}>{label}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        {/* Role-Specific Fields */}
                        {formData.role && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
                                    {formData.role === 'ROLE_STUDENT' && 'Student Information'}
                                    {formData.role === 'ROLE_ACADEMIC_STAFF' && 'Academic Staff Information'}
                                    {formData.role === 'ROLE_NON_ACADEMIC_STAFF' && 'Non-Academic Staff Information'}
                                </Typography>

                                {/* Student Fields */}
                                {formData.role === 'ROLE_STUDENT' && (
                                    <>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Student ID"
                                                    fullWidth
                                                    value={formData.studentId || ''}
                                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Batch"
                                                    fullWidth
                                                    value={formData.batch || ''}
                                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                                    placeholder="e.g., 2024"
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Program"
                                                    fullWidth
                                                    value={formData.program || ''}
                                                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                                    placeholder="e.g., BSc Computer Science"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Faculty</InputLabel>
                                                    <Select
                                                        value={formData.faculty || ''}
                                                        label="Faculty"
                                                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                                    >
                                                        {Object.entries(FACULTY).map(([key, value]) => (
                                                            <MenuItem key={key} value={value}>{FACULTY_LABELS[key]}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Date of Birth"
                                                    type="date"
                                                    fullWidth
                                                    value={formData.dateOfBirth || ''}
                                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                    slotProps={{ inputLabel: { shrink: true } }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Address"
                                                    fullWidth
                                                    value={formData.address || ''}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {/* Academic Staff Fields */}
                                {formData.role === 'ROLE_ACADEMIC_STAFF' && (
                                    <>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Employee ID"
                                                    fullWidth
                                                    value={formData.employeeId || ''}
                                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Position"
                                                    fullWidth
                                                    value={formData.position || ''}
                                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                    placeholder="e.g., Senior Lecturer"
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Designation"
                                                    fullWidth
                                                    value={formData.designation || ''}
                                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                    placeholder="e.g., Dr., Prof."
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
<TextField
                                            label="Department"
                                            fullWidth
                                            value={formData.department || ''}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g., Software Engineering"
                                        />
                                            </Grid>
                                        </Grid>
                                        <FormControl fullWidth>
                                            <InputLabel>Faculty</InputLabel>
                                            <Select
                                                value={formData.faculty || ''}
                                                label="Faculty"
                                                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                            >
                                                {Object.entries(FACULTY).map(([key, value]) => (
                                                    <MenuItem key={key} value={value}>{FACULTY_LABELS[key]}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}

                                {/* Non-Academic Staff Fields */}
                                {formData.role === 'ROLE_NON_ACADEMIC_STAFF' && (
                                    <>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Employee ID"
                                                    fullWidth
                                                    value={formData.employeeId || ''}
                                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Position"
                                                    fullWidth
                                                    value={formData.position || ''}
                                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                    placeholder="e.g., Administrative Officer"
                                                />
                                            </Grid>
                                        </Grid>
                                        <TextField
                                            label="Department"
                                            fullWidth
                                            value={formData.department || ''}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g., Administration"
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitCreate} disabled={isCreating}>
                        {isCreating ? <CircularProgress size={20} /> : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => { setEditDialogOpen(false); setEditFormData({}); }}
                maxWidth="md"
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
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Edit User</Typography>
                        <IconButton onClick={() => { setEditDialogOpen(false); setEditFormData({}); }} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {userDetailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                            {/* User Avatar - Read Only */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar
                                    src={profilePicturePreview || undefined}
                                    sx={{
                                        width: { xs: 80, sm: 100 },
                                        height: { xs: 80, sm: 100 },
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: ROLE_COLORS[editFormData.role || ''] || theme.palette.primary.main,
                                        fontSize: { xs: '1.5rem', sm: '2rem' }
                                    }}
                                >
                                    {editFormData.firstName?.[0]}{editFormData.lastName?.[0]}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary">
                                    Profile picture can only be changed by the user
                                </Typography>
                            </Box>

                            <Divider />

                            {/* Basic Information */}
                            <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="First Name"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        value={editFormData.firstName || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                        error={!!formErrors.firstName}
                                        helperText={formErrors.firstName}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Last Name"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        value={editFormData.lastName || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                        error={!!formErrors.lastName}
                                        helperText={formErrors.lastName}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Email"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        value={editFormData.email || ''}
                                        disabled
                                        helperText="Email cannot be changed"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Phone Number"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        value={editFormData.phone || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        placeholder="e.g., 0771234567"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Address"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        value={editFormData.address || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Date of Birth"
                                        type="date"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        value={editFormData.dateOfBirth || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Student-specific fields */}
                            {editFormData.role === 'ROLE_STUDENT' && (
                                <>
                                    <Divider />
                                    <Typography variant="subtitle2" color="text.secondary">Guardian Information</Typography>
                                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Guardian Name"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.guardianName || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Guardian Phone"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.guardianPhone || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Club Member Fields */}
                                    {editFormData.clubName && (
                                        <>
                                            <Typography variant="subtitle2" color="text.secondary">Club Membership</Typography>
                                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        label="Club Name"
                                                        fullWidth
                                                        size={isMobile ? 'small' : 'medium'}
                                                        value={editFormData.clubName || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, clubName: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        label="Club Position"
                                                        fullWidth
                                                        size={isMobile ? 'small' : 'medium'}
                                                        value={editFormData.clubPosition || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, clubPosition: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        label="Club Membership ID"
                                                        fullWidth
                                                        size={isMobile ? 'small' : 'medium'}
                                                        value={editFormData.clubMembershipId || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, clubMembershipId: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        label="Club Join Date"
                                                        type="date"
                                                        fullWidth
                                                        size={isMobile ? 'small' : 'medium'}
                                                        value={editFormData.clubJoinDate || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, clubJoinDate: e.target.value })}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </Grid>
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
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Designation"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.designation || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                                                placeholder="e.g., Senior Lecturer"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Specialization"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.specialization || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                                                placeholder="e.g., Artificial Intelligence"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Office Location"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.officeLocation || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, officeLocation: e.target.value })}
                                                placeholder="e.g., Room 101"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Responsibilities"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.responsibilities || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                label="Bio"
                                                fullWidth
                                                multiline
                                                rows={3}
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.bio || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {/* Non-Academic Staff-specific fields */}
                            {editFormData.role === 'ROLE_NON_ACADEMIC_STAFF' && (
                                <>
                                    <Divider />
                                    <Typography variant="subtitle2" color="text.secondary">Work Information</Typography>
                                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Work Location"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.workLocation || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, workLocation: e.target.value })}
                                                placeholder="e.g., Main Building"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Shift"
                                                fullWidth
                                                size={isMobile ? 'small' : 'medium'}
                                                value={editFormData.shift || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
                                                placeholder="e.g., Day Shift"
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => { setEditDialogOpen(false); setEditFormData({}); }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitEdit} disabled={isUpdating || userDetailLoading}>
                        {isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View User Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
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
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>User Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {userDetailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : userDetail ? (
                        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1 }}>
                            {/* User Header */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar
                                    src={userDetail.profilePictureUrl || undefined}
                                    sx={{
                                        width: { xs: 80, sm: 100 },
                                        height: { xs: 80, sm: 100 },
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: ROLE_COLORS[userDetail.role] || theme.palette.primary.main,
                                        fontSize: { xs: '1.5rem', sm: '2rem' }
                                    }}
                                >
                                    {userDetail.firstName?.[0] || ''}{userDetail.lastName?.[0] || ''}
                                </Avatar>
                                <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    {userDetail.fullName}
                                </Typography>
                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                    <Chip
                                        label={ROLE_LABELS[userDetail.role]}
                                        size="small"
                                        sx={{ bgcolor: alpha(ROLE_COLORS[userDetail.role], 0.1), color: ROLE_COLORS[userDetail.role] }}
                                    />
                                    <Chip
                                        icon={getStatusIcon(userDetail.status) || undefined}
                                        label={STATUS_LABELS[userDetail.status] || userDetail.status}
                                        size="small"
                                        sx={{ bgcolor: alpha(getStatusColor(userDetail.status), 0.1), color: getStatusColor(userDetail.status), '& .MuiChip-icon': { color: 'inherit' } }}
                                    />
                                </Stack>
                            </Box>

                            <Divider />

                            {/* Basic Information */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Basic Information</Typography>
                                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <EmailIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>{userDetail.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <PhoneIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                                <Typography variant="body2">{userDetail.phoneNumber || 'Not provided'}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <BadgeIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">User ID</Typography>
                                                <Typography variant="body2">{userDetail.id}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <BadgeIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">User Type</Typography>
                                                <Typography variant="body2">{userDetail.userType}</Typography>
                                            </Box>
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
                                            {(userDetail.role === 'ROLE_ADMIN' || userDetail.role === 'ROLE_SUPER_ADMIN') && 'Admin Information'}
                                        </Typography>
                                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                            {/* Student-specific fields */}
                                            {userDetail.role === 'ROLE_STUDENT' && 'studentId' in userDetail.roleSpecificData && (
                                                <>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Student ID</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.studentId}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Program</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.program || 'N/A'}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Faculty</Typography>
                                                        <Typography variant="body2">{FACULTY_LABELS[userDetail.roleSpecificData.faculty as keyof typeof FACULTY_LABELS] || userDetail.roleSpecificData.faculty || 'N/A'}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Batch</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.batch || 'N/A'}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.dateOfBirth || 'N/A'}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Address</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.address || 'N/A'}</Typography>
                                                    </Grid>
                                                    {userDetail.roleSpecificData.guardianName && (
                                                        <>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Typography variant="caption" color="text.secondary">Guardian Name</Typography>
                                                                <Typography variant="body2">{userDetail.roleSpecificData.guardianName}</Typography>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Typography variant="caption" color="text.secondary">Guardian Phone</Typography>
                                                                <Typography variant="body2">{userDetail.roleSpecificData.guardianPhone || 'N/A'}</Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                                                    {userDetail.roleSpecificData.studentRoleDisplayName && (
                                                        <Grid size={{ xs: 12 }}>
                                                            <Typography variant="caption" color="text.secondary">Student Role</Typography>
                                                            <Typography variant="body2">{userDetail.roleSpecificData.studentRoleDisplayName}</Typography>
                                                        </Grid>
                                                    )}
                                                    {/* Club Member Data */}
                                                    {userDetail.roleSpecificData.clubMemberData && (
                                                        <>
                                                            <Grid size={{ xs: 12 }}>
                                                                <Divider sx={{ my: 1 }} />
                                                                <Typography variant="caption" color="primary" fontWeight={600}>Club Membership</Typography>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Typography variant="caption" color="text.secondary">Club Name</Typography>
                                                                <Typography variant="body2">{userDetail.roleSpecificData.clubMemberData.clubName}</Typography>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Typography variant="caption" color="text.secondary">Position</Typography>
                                                                <Typography variant="body2">{userDetail.roleSpecificData.clubMemberData.clubPosition}</Typography>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Typography variant="caption" color="text.secondary">Membership ID</Typography>
                                                                <Typography variant="body2">{userDetail.roleSpecificData.clubMemberData.clubMembershipId}</Typography>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Typography variant="caption" color="text.secondary">Join Date</Typography>
                                                                <Typography variant="body2">{userDetail.roleSpecificData.clubMemberData.clubJoinDate}</Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {/* Academic Staff-specific fields */}
                                            {userDetail.role === 'ROLE_ACADEMIC_STAFF' && 'employeeId' in userDetail.roleSpecificData && (
                                                <>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.employeeId}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Department</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.department || 'N/A'}</Typography>
                                                    </Grid>
                                                    {'faculty' in userDetail.roleSpecificData && (
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography variant="caption" color="text.secondary">Faculty</Typography>
                                                            <Typography variant="body2">{FACULTY_LABELS[userDetail.roleSpecificData.faculty as keyof typeof FACULTY_LABELS] || userDetail.roleSpecificData.faculty || 'N/A'}</Typography>
                                                        </Grid>
                                                    )}
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Position</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.position || 'N/A'}</Typography>
                                                    </Grid>
                                                    {'designation' in userDetail.roleSpecificData && (
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography variant="caption" color="text.secondary">Designation</Typography>
                                                            <Typography variant="body2">{userDetail.roleSpecificData.designation || 'N/A'}</Typography>
                                                        </Grid>
                                                    )}
                                                    {'specialization' in userDetail.roleSpecificData && userDetail.roleSpecificData.specialization && (
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography variant="caption" color="text.secondary">Specialization</Typography>
                                                            <Typography variant="body2">{userDetail.roleSpecificData.specialization}</Typography>
                                                        </Grid>
                                                    )}
                                                </>
                                            )}

                                            {/* Non-Academic Staff-specific fields */}
                                            {userDetail.role === 'ROLE_NON_ACADEMIC_STAFF' && 'employeeId' in userDetail.roleSpecificData && (
                                                <>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.employeeId}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Department</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.department || 'N/A'}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="caption" color="text.secondary">Position</Typography>
                                                        <Typography variant="body2">{userDetail.roleSpecificData.position || 'N/A'}</Typography>
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    </Box>
                                </>
                            )}

                            {/* Timestamps */}
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Account Information</Typography>
                                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Created At</Typography>
                                        <Typography variant="body2">{new Date(userDetail.createdAt).toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                                        <Typography variant="body2">{new Date(userDetail.updatedAt).toLocaleString()}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <Typography color="text.secondary">Failed to load user details</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => setViewDialogOpen(false)} fullWidth={isMobile}>Close</Button>
                    <Button variant="contained" onClick={() => { setViewDialogOpen(false); handleEditUser(); }} fullWidth={isMobile} disabled={!userDetail}>Edit User</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2, m: { xs: 2, sm: 2 } }
                }}
            >
                <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {confirmAction === 'activate' && 'Activate User'}
                    {confirmAction === 'deactivate' && 'Deactivate User'}
                    {confirmAction === 'suspend' && 'Suspend User'}
                    {confirmAction === 'unlock' && 'Unlock User'}
                    {confirmAction === 'delete' && 'Delete User'}
                    {confirmAction === 'restore' && 'Restore User'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {confirmAction === 'activate' && `Are you sure you want to activate ${selectedUser?.fullName}'s account?`}
                        {confirmAction === 'deactivate' && `Are you sure you want to deactivate ${selectedUser?.fullName}'s account? They will no longer be able to log in.`}
                        {confirmAction === 'suspend' && `Are you sure you want to suspend ${selectedUser?.fullName}'s account? This will immediately block their access.`}
                        {confirmAction === 'unlock' && `Are you sure you want to unlock ${selectedUser?.fullName}'s account? They will be able to log in again.`}
                        {confirmAction === 'delete' && `Are you sure you want to delete ${selectedUser?.fullName}'s account? This action will soft delete the user and they will no longer be able to access the system.`}
                        {confirmAction === 'restore' && `Are you sure you want to restore ${selectedUser?.fullName}'s account? The user will be reactivated and able to access the system again.`}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} fullWidth={isMobile}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={confirmAction === 'deactivate' || confirmAction === 'suspend' || confirmAction === 'delete' ? 'error' : 'success'}
                        onClick={handleConfirmAction}
                        disabled={isStatusChanging}
                        fullWidth={isMobile}
                    >
                        {isStatusChanging ? <CircularProgress size={20} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
                sx={{ bottom: { xs: 16, sm: 24 } }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2, width: { xs: '90vw', sm: 'auto' } }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

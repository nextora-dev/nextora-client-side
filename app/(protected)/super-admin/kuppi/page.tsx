'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    TextField,
    InputAdornment,
    Alert,
    Snackbar,
    CircularProgress,
    alpha,
    useTheme,
    useMediaQuery,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, TablePagination,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    adminFetchApplications,
    adminFetchApplicationById,
    adminFetchApplicationStats,
    adminFetchPlatformStats,
    adminApproveApplicationAsync,
    adminRejectApplicationAsync,
    adminSoftDeleteSessionAsync,
    adminSoftDeleteNoteAsync,
    fetchSessions,
    fetchNotes,
    fetchSessionById,
    fetchNoteById,
    fetchKuppiStudents,
    setKuppiCurrentPage,
    setKuppiPageSize,
    clearKuppiError,
    clearKuppiSuccessMessage,
    selectKuppiAllApplications,
    selectKuppiTotalApplications,
    selectKuppiApplicationStats,
    selectKuppiPlatformStats,
    selectKuppiSelectedApplication,
    selectKuppiCurrentPage,
    selectKuppiPageSize,
    selectKuppiIsApplicationLoading,
    selectKuppiIsSessionLoading,
    selectKuppiIsNoteLoading,
    selectKuppiIsLoading,
    selectKuppiSessions,
    selectKuppiNotes,
    selectKuppiTotalSessions,
    selectKuppiTotalNotes,
    selectKuppiStudents,
    selectTotalKuppiStudents,
    selectKuppiStudentsLoading,
    selectKuppiError,
    selectKuppiSuccessMessage,
    selectKuppiIsCreating,
    selectKuppiIsUpdating,
    KuppiApplicationResponse,
    ApplicationStatus, SessionStatus,
    // additional imports for Hosts UI
    searchKuppiStudentsByNameAsync,
    searchKuppiStudentsBySubjectAsync,
    fetchKuppiStudentsByFaculty,
    fetchKuppiStudentById,
    selectSelectedKuppiStudent,
    selectKuppiStudentDetailLoading,
    KuppiStudentResponse,
    Faculty,
    PermanentDeleteApplication,
    PermanentDeleteSession,
    PermanentDeleteNote,
    RevokeKuppiRole,
    selectKuppiIsDeleting,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';
import { ApplicationsTable, ApplicationSearchPanel, RowActionMenu, KuppiViewDialog, KuppiCommon, SessionsTable, NotesTable, SessionSearchPanel } from '@/components/kuppi';
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Status colors
const STATUS_COLORS: Record<ApplicationStatus, string> = {
    PENDING: '#F59E0B',
    UNDER_REVIEW: '#3B82F6',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280',
    EXPIRED: '#9CA3AF',
};

// Status icons
const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
        case 'PENDING': return <PendingIcon fontSize="small" />;
        case 'UNDER_REVIEW': return <HourglassEmptyIcon fontSize="small" />;
        case 'APPROVED': return <CheckCircleIcon fontSize="small" />;
        case 'REJECTED': return <CancelIcon fontSize="small" />;
        case 'CANCELLED': return <CancelIcon fontSize="small" />;
        case 'EXPIRED': return <ScheduleIcon fontSize="small" />;
        default: return undefined;
    }
};

// Experience level colors
const EXPERIENCE_COLORS: Record<string, string> = {
    BEGINNER: '#10B981',
    INTERMEDIATE: '#3B82F6',
    ADVANCED: '#8B5CF6',
};

// Session status colors (shared)
const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
    SCHEDULED: '#3B82F6',
    IN_PROGRESS: '#10B981',
    COMPLETED: '#6B7280',
    CANCELLED: '#EF4444',
};

// Get icon for session status (kept local to this file)
const getSessionStatusIcon = (status: SessionStatus) => {
    switch (status) {
        case 'SCHEDULED': return <EventIcon fontSize="small" />;
        case 'IN_PROGRESS': return <VideoCallIcon fontSize="small" />;
        case 'COMPLETED': return <CheckCircleIcon fontSize="small" />;
        case 'CANCELLED': return <CancelIcon fontSize="small" />;
        default: return undefined;
    }
};

export default function SuperAdminKuppiPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Selectors
    const applications = useAppSelector(selectKuppiAllApplications);
    const totalApplications = useAppSelector(selectKuppiTotalApplications);
    const stats = useAppSelector(selectKuppiApplicationStats);
    const selectedApplication = useAppSelector(selectKuppiSelectedApplication);
    const page = useAppSelector(selectKuppiCurrentPage);
    const pageSize = useAppSelector(selectKuppiPageSize);
    const isLoading = useAppSelector(selectKuppiIsLoading);
    const isApplicationLoading = useAppSelector(selectKuppiIsApplicationLoading);
    const isSessionLoading = useAppSelector(selectKuppiIsSessionLoading);
    const isNoteLoading = useAppSelector(selectKuppiIsNoteLoading);
    const isApproving = useAppSelector(selectKuppiIsCreating);
    const isRejecting = useAppSelector(selectKuppiIsUpdating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);
    // Kuppi students (Hosts) selectors - moved here to ensure hooks are called unconditionally
    const students = useAppSelector(selectKuppiStudents);
    const totalStudents = useAppSelector(selectTotalKuppiStudents);
    const studentsLoading = useAppSelector(selectKuppiStudentsLoading);
    const selectedKuppiStudent = useAppSelector(selectSelectedKuppiStudent);
    const selectedKuppiStudentLoading = useAppSelector(selectKuppiStudentDetailLoading);
    const isDeleting = useAppSelector(selectKuppiIsDeleting);
    const platformStats = useAppSelector(selectKuppiPlatformStats);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
    // mainTab: 0=Applications,1=Sessions,2=Notes,3=Hosts
    const [mainTab, setMainTab] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedApp, setSelectedApp] = useState<KuppiApplicationResponse | null>(null);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [selectedNote, setSelectedNote] = useState<any | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
    const [permanentDeleteType, setPermanentDeleteType] = useState<'application' | 'session' | 'note'>('application');
    const [revokeRoleDialogOpen, setRevokeRoleDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [revokeReason, setRevokeReason] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [viewMode, setViewMode] = useState<'application' | 'session' | 'note' | null>(null);
    const [softDeleteDialogOpen, setSoftDeleteDialogOpen] = useState(false);
    const [softDeleteTarget, setSoftDeleteTarget] = useState<'session' | 'note' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Hosts-specific UI state
    const [hostSearchQuery, setHostSearchQuery] = useState('');
    const [hostSearchType, setHostSearchType] = useState<'name' | 'subject'>('name');
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | 'ALL'>('ALL');
    const [hostAnchorEl, setHostAnchorEl] = useState<null | HTMLElement>(null);
    const [hostActionTarget, setHostActionTarget] = useState<any | null>(null);

    const PAGE_SIZE = pageSize || 10;

    // Fetch on mount
    useEffect(() => {
        dispatch(adminFetchApplications({ page, size: pageSize }));
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
        // fetch sessions and notes for super-admin view
        dispatch(fetchSessions({ page: 0, size: pageSize }));
        dispatch(fetchNotes({ page: 0, size: pageSize }));
    }, [dispatch, page, pageSize]);

    // sessions/notes state
    const sessions = useAppSelector(selectKuppiSessions);
    const notes = useAppSelector(selectKuppiNotes);
    const totalSessions = useAppSelector(selectKuppiTotalSessions);
    const totalNotes = useAppSelector(selectKuppiTotalNotes);

    // session & note anchors
    const [sessionAnchorEl, setSessionAnchorEl] = useState<null | HTMLElement>(null);
    const [sessionActionTarget, setSessionActionTarget] = useState<any | null>(null);
    const [noteAnchorEl, setNoteAnchorEl] = useState<null | HTMLElement>(null);
    const [noteActionTarget, setNoteActionTarget] = useState<any | null>(null);
    const [filteredSessions, setFilteredSessions] = useState<any[] | null>(null);
    const [filteredNotes, setFilteredNotes] = useState<any[] | null>(null);

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        // when switching top-level tabs, keep applications status tabs in the Applications panel
        setMainTab(newValue);
        if (newValue === 0) {
            const statuses: (ApplicationStatus | '')[] = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
            const status = statuses[0];
            setStatusFilter(status);
            dispatch(adminFetchApplications({ page: 0, size: pageSize, status: status || undefined }));
        } else if (newValue === 1) {
            dispatch(fetchSessions({ page: 0, size: pageSize }));
            setFilteredSessions(null);
        } else if (newValue === 2) {
            dispatch(fetchNotes({ page: 0, size: pageSize }));
        } else if (newValue === 3) {
            // Hosts tab
            // reset host-specific controls
            setHostSearchQuery('');
            setSelectedFaculty('ALL');
            dispatch(fetchKuppiStudents({ page: 0, size: pageSize }));
        }
        dispatch(setKuppiCurrentPage(0));
    };

    // Handle refresh
    const handleRefresh = useCallback(() => {
        dispatch(adminFetchApplicationStats());
        dispatch(adminFetchPlatformStats());
        if (mainTab === 0) {
            dispatch(adminFetchApplications({ page, size: pageSize, status: statusFilter || undefined }));
        } else if (mainTab === 1) {
            dispatch(fetchSessions({ page, size: pageSize }));
            setFilteredSessions(null);
        } else if (mainTab === 2) {
            dispatch(fetchNotes({ page, size: pageSize }));
        } else if (mainTab === 3) {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE }));
        }
    }, [dispatch, page, pageSize, statusFilter, mainTab, PAGE_SIZE]);

    // Hosts search handler
    const handleHostSearch = useCallback((pageIndex = 0) => {
        if (hostSearchQuery.trim()) {
            if (hostSearchType === 'name') {
                dispatch(searchKuppiStudentsByNameAsync({ name: hostSearchQuery, page: pageIndex, size: PAGE_SIZE }));
            } else {
                dispatch(searchKuppiStudentsBySubjectAsync({ subject: hostSearchQuery, page: pageIndex, size: PAGE_SIZE }));
            }
            return;
        }
        if (selectedFaculty !== 'ALL') {
            dispatch(fetchKuppiStudentsByFaculty({ faculty: selectedFaculty as Faculty, params: { page: pageIndex, size: PAGE_SIZE } }));
            return;
        }
        dispatch(fetchKuppiStudents({ page: pageIndex, size: PAGE_SIZE }));
    }, [dispatch, hostSearchQuery, hostSearchType, selectedFaculty, PAGE_SIZE]);

    // Open host detail (fetch by id)
    const [hostDetailOpen, setHostDetailOpen] = useState(false);
    const openHostDetail = async (studentId: number) => {
        try {
            setHostDetailOpen(true);
            await dispatch(fetchKuppiStudentById(studentId)).unwrap();
        } catch (err) {
            setHostDetailOpen(false);
            setSnackbar({ open: true, message: 'Failed to load host details', severity: 'error' });
        }
    };

    // Handle application menu
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: KuppiApplicationResponse) => {
        setAnchorEl(event.currentTarget);
        setSelectedApp(app);
    };
    const handleMenuClose = () => setAnchorEl(null);

    // Session menu handlers
    const handleSessionMenuOpen = (event: React.MouseEvent<HTMLElement>, session: any) => { setSessionAnchorEl(event.currentTarget); setSessionActionTarget(session); };
    const handleSessionMenuClose = () => { setSessionAnchorEl(null); setSessionActionTarget(null); };
    const handleSessionView = async () => {
        handleSessionMenuClose();
        if (sessionActionTarget) {
            setSelectedApp(null);
            setSelectedNote(null);
            setSelectedSession(null);
            setViewMode('session');
            setViewDialogOpen(true);
            try {
                const s = await dispatch(fetchSessionById(sessionActionTarget.id)).unwrap();
                setSelectedSession(s);
            } catch (err) {
                setViewDialogOpen(false);
                setViewMode(null);
            }
        }
    };
    const handleSessionDeleteConfirm = () => {
        handleSessionMenuClose();
        if (sessionActionTarget) {
            setSelectedSession(sessionActionTarget);
            setSoftDeleteTarget('session');
            setSoftDeleteDialogOpen(true);
        }
    };

    const handleSoftDeleteSession = async () => {
        if (selectedSession) {
            setActionLoading(true);
            try {
                await dispatch(adminSoftDeleteSessionAsync(selectedSession.id)).unwrap();
                setSoftDeleteDialogOpen(false);
                setSoftDeleteTarget(null);
                setSelectedSession(null);
                handleRefresh();
                setSnackbar({ open: true, message: 'Session deleted successfully', severity: 'success' });
            } catch (err: any) {
                setSnackbar({ open: true, message: err?.message || err || 'Failed to delete session', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleNoteDeleteConfirm = () => {
        handleNoteMenuClose();
        if (noteActionTarget) {
            setSelectedNote(noteActionTarget);
            setSoftDeleteTarget('note');
            setSoftDeleteDialogOpen(true);
        }
    };

    const handleSoftDeleteNote = async () => {
        if (selectedNote) {
            setActionLoading(true);
            try {
                await dispatch(adminSoftDeleteNoteAsync(selectedNote.id)).unwrap();
                setSoftDeleteDialogOpen(false);
                setSoftDeleteTarget(null);
                setSelectedNote(null);
                handleRefresh();
                setSnackbar({ open: true, message: 'Note deleted successfully', severity: 'success' });
            } catch (err: any) {
                setSnackbar({ open: true, message: err?.message || err || 'Failed to delete note', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Note menu handlers
    const handleNoteMenuOpen = (event: React.MouseEvent<HTMLElement>, note: any) => { setNoteAnchorEl(event.currentTarget); setNoteActionTarget(note); };
    const handleNoteMenuClose = () => { setNoteAnchorEl(null); setNoteActionTarget(null); };
    const handleNoteView = async () => {
        handleNoteMenuClose();
        if (noteActionTarget) {
            setSelectedApp(null);
            setSelectedSession(null);
            setSelectedNote(null);
            setViewMode('note');
            setViewDialogOpen(true);
            try {
                const n = await dispatch(fetchNoteById(noteActionTarget.id)).unwrap();
                setSelectedNote(n);
            } catch (err) {
                setViewDialogOpen(false);
                setViewMode(null);
            }
        }
    };

    // Open session by id and show session view in dialog (used from note view)
    const openSessionById = async (sessionId?: number | string | null, prevNoteToRestore?: any | null) => {
        if (sessionId === null || sessionId === undefined) {
            setSnackbar({ open: true, message: 'Session not available for this note', severity: 'error' });
            return;
        }
        const prevNote = prevNoteToRestore ?? null;
        setSelectedNote(null);
        setSelectedApp(null);
        setSelectedSession(null);
        setViewMode('session');
        setViewDialogOpen(true);
        try {
            const session = await dispatch((fetchSessionById as any)(Number(sessionId))).unwrap();
            setSelectedSession(session as any);
        } catch (err: unknown) {
            setSnackbar({ open: true, message: (err as any)?.message || 'Failed to open session', severity: 'error' });
            setViewDialogOpen(false);
            setViewMode(null);
            if (prevNote) {
                setSelectedNote(prevNote);
            }
        }
    };

    // Handle view
    const handleView = () => {
        handleMenuClose();
        if (selectedApp) {
            dispatch(adminFetchApplicationById(selectedApp.id));
            setViewDialogOpen(true);
        }
    };

    // Trigger host searches when filters change (simple effect)
    useEffect(() => {
        if (mainTab === 3) {
            // run search with page 0 when host filters change
            handleHostSearch(0);
        }
    }, [hostSearchQuery, hostSearchType, selectedFaculty, mainTab, handleHostSearch]);

    // Handle approve
    const handleOpenApproveDialog = () => {
        handleMenuClose();
        setReviewNotes('');
        setApproveDialogOpen(true);
    };

    const handleApprove = () => {
        if (selectedApp) {
            dispatch(adminApproveApplicationAsync({ id: selectedApp.id, data: reviewNotes ? { reviewNotes } : undefined }));
            setApproveDialogOpen(false);
        }
    };

    // Handle reject
    const handleOpenRejectDialog = () => {
        handleMenuClose();
        setRejectionReason('');
        setReviewNotes('');
        setRejectDialogOpen(true);
    };

    const handleReject = () => {
        if (selectedApp && rejectionReason) {
            dispatch(adminRejectApplicationAsync({ id: selectedApp.id, data: { rejectionReason, reviewNotes } }));
            setRejectDialogOpen(false);
        }
    };

    // Handle mark under review
    const handleMarkUnderReview = async () => {
        handleMenuClose();
        if (selectedApp) {
            try {
                await kuppiServices.adminMarkUnderReview(selectedApp.id);
                handleRefresh();
                setSnackbar({ open: true, message: 'Application marked as under review', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to update application', severity: 'error' });
            }
        }
    };

    // Handle permanent delete (application)
    const handleOpenPermanentDeleteDialog = () => {
        handleMenuClose();
        setConfirmText('');
        setPermanentDeleteType('application');
        setPermanentDeleteDialogOpen(true);
    };

    // Handle permanent delete (session)
    const handleOpenSessionPermanentDeleteDialog = () => {
        setSessionAnchorEl(null); // close menu only, keep sessionActionTarget
        setConfirmText('');
        setPermanentDeleteType('session');
        setPermanentDeleteDialogOpen(true);
    };

    // Handle permanent delete (note)
    const handleOpenNotePermanentDeleteDialog = () => {
        setNoteAnchorEl(null); // close menu only, keep noteActionTarget
        setConfirmText('');
        setPermanentDeleteType('note');
        setPermanentDeleteDialogOpen(true);
    };

    const handlePermanentDelete = async () => {
        if (confirmText !== 'DELETE') return;
        try {
            if (permanentDeleteType === 'application' && selectedApp) {
                await dispatch(PermanentDeleteApplication(selectedApp.id)).unwrap();
            } else if (permanentDeleteType === 'session' && sessionActionTarget) {
                await dispatch(PermanentDeleteSession(sessionActionTarget.id)).unwrap();
            } else if (permanentDeleteType === 'note' && noteActionTarget) {
                await dispatch(PermanentDeleteNote(noteActionTarget.id)).unwrap();
            }
            setPermanentDeleteDialogOpen(false);
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Failed to permanently delete', severity: 'error' });
        }
    };

    // Handle revoke role (from Hosts tab)
    const handleOpenRevokeRoleDialog = () => {
        setHostAnchorEl(null); // close host menu, keep hostActionTarget
        setRevokeReason('');
        setRevokeRoleDialogOpen(true);
    };

    const handleRevokeRole = async () => {
        if (hostActionTarget && revokeReason) {
            try {
                await dispatch(RevokeKuppiRole({ userId: hostActionTarget.id, reason: revokeReason })).unwrap();
                setRevokeRoleDialogOpen(false);
                setHostActionTarget(null);
            } catch (err: any) {
                setSnackbar({ open: true, message: err || 'Failed to revoke role', severity: 'error' });
            }
        }
    };

    // Handle messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(clearKuppiSuccessMessage());
            handleRefresh();
        }
    }, [error, successMessage, dispatch, handleRefresh]);

    const statsOverview = [
        { label: 'Total Sessions', value: platformStats?.totalSessions ?? 0, icon: EventIcon, color: '#3B82F6' },
        { label: 'Total Notes', value: platformStats?.totalNotes ?? 0, icon: DescriptionIcon, color: '#10B981' },
        { label: 'Participants', value: platformStats?.totalParticipants ?? 0, icon: PeopleIcon, color: '#6366F1' },
        { label: 'Kuppi Students', value: platformStats?.totalKuppiStudents ?? 0, icon: SchoolIcon, color: '#8B5CF6' },
        { label: 'Completed', value: platformStats?.completedSessions ?? 0, icon: CheckCircleIcon, color: '#059669' },
        { label: 'Cancelled', value: platformStats?.cancelledSessions ?? 0, icon: CancelIcon, color: '#DC2626' },
        { label: 'Total Views', value: platformStats?.totalViews ?? 0, icon: VisibilityIcon, color: '#F59E0B' },
        { label: 'Total Downloads', value: platformStats?.totalDownloads ?? 0, icon: DownloadIcon, color: '#EF4444' },
        { label: 'This Week', value: platformStats?.sessionsThisWeek ?? 0, icon: TrendingUpIcon, color: '#0EA5E9' },
        { label: 'This Month', value: platformStats?.sessionsThisMonth ?? 0, icon: CalendarMonthIcon, color: '#14B8A6' },
        { label: 'New Students', value: platformStats?.newKuppiStudentsThisMonth ?? 0, icon: PersonAddIcon, color: '#EC4899' },
    ];

    return (
        <KuppiCommon
            title="Kuppi Management"
            description="Manage applications"
            overviewStats={statsOverview}
            mainTab={mainTab}
            onMainTabChange={handleTabChange}
            extraTabs={["Hosts"]}
            onRefresh={handleRefresh}
            isLoading={isLoading}
        >
            {/* Children (original tab contents) */}
            {/* Applications Tab (mounted always, hidden when inactive) */}
            <Box role="tabpanel" hidden={mainTab !== 0} sx={{ display: mainTab === 0 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {/* Application Search */}
                    <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <ApplicationSearchPanel
                            pageSize={pageSize}
                            statusFilter={statusFilter}
                            onClear={() => dispatch(adminFetchApplications({ page: 0, size: pageSize, status: statusFilter || undefined }))}
                        />
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                            <Tabs
                                value={['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].indexOf(statusFilter)}
                                onChange={(_, v) => {
                                    const statuses: (ApplicationStatus | '')[] = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];
                                    setStatusFilter(statuses[v]);
                                    dispatch(adminFetchApplications({ page: 0, size: pageSize, status: statuses[v] || undefined }));
                                }}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
                            >
                                <Tab label="All" />
                                <Tab label="Pending" />
                                <Tab label="Under Review" />
                                <Tab label="Approved" />
                                <Tab label="Rejected" />
                                <Tab label="Cancelled" />
                                <Tab label="Expired" />
                            </Tabs>
                        </Stack>
                    </CardContent>

                    <ApplicationsTable
                        applications={applications}
                        total={totalApplications}
                        page={page}
                        rowsPerPage={pageSize}
                        isLoading={isApplicationLoading}
                        isTablet={isTablet}
                        onOpenMenu={(e, app) => handleMenuOpen(e, app)}
                        onChangePage={(p) => { dispatch(setKuppiCurrentPage(p)); dispatch(adminFetchApplications({ page: p, size: pageSize, status: statusFilter || undefined })); }}
                        onChangeRowsPerPage={(size) => { dispatch(setKuppiPageSize(size)); dispatch(setKuppiCurrentPage(0)); }}
                    />
                </MotionCard>
            </Box>

            {/* Sessions Tab (mounted always, hidden when inactive) */}
            <Box role="tabpanel" hidden={mainTab !== 1} sx={{ display: mainTab === 1 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {/* Search Panel - Always visible */}
                    <Box sx={{ mb: 2, p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <SessionSearchPanel onResults={(results) => setFilteredSessions(results)} />
                    </Box>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : (
                        (() => {
                            const sessionsToShow = filteredSessions ?? sessions;
                            if (sessionsToShow.length === 0) {
                                return (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography color="text.secondary">No sessions found</Typography>
                                    </Box>
                                );
                            }
                            return (
                                <>
                                    <TableContainer>
                                        <Table size={isTablet ? 'small' : 'medium'}>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>Session</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Host</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sessionsToShow.map((session) => {
                                                    const sessionColor = SESSION_STATUS_COLORS[(session.status as SessionStatus)] ?? '#6B7280';
                                                    return (
                                                        <TableRow key={session.id} hover>
                                                            <TableCell>
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={600}>{session.title}</Typography>
                                                                    <Chip label={session.subject} size="small" sx={{ mt: 0.5 }} />
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                                <Typography variant="body2">{session.host?.fullName ?? ''}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    icon={getSessionStatusIcon(session.status)}
                                                                    label={session.status ?? '—'}
                                                                    size="small"
                                                                    sx={{ bgcolor: alpha(sessionColor, 0.1), color: sessionColor, '& .MuiChip-icon': { color: 'inherit' } }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                                <Typography variant="caption">{session.scheduledStartTime ? new Date(session.scheduledStartTime).toLocaleDateString() : ''}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">{session.viewCount}</Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small" onClick={(e) => handleSessionMenuOpen(e, session)}><MoreVertIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        component="div"
                                        count={totalSessions}
                                        page={page}
                                        onPageChange={(_, p) => { dispatch(setKuppiCurrentPage(p)); dispatch(fetchSessions({ page: p, size: pageSize })); }}
                                        rowsPerPage={pageSize}
                                        onRowsPerPageChange={(e) => { dispatch(setKuppiPageSize(parseInt(e.target.value, 10))); dispatch(setKuppiCurrentPage(0)); }}
                                        rowsPerPageOptions={[5, 10, 25]}
                                    />
                                </>
                            );
                        })()
                    )}
                </MotionCard>
            </Box>

            {/* Notes Tab (mounted always, hidden when inactive) */}
            <Box role="tabpanel" hidden={mainTab !== 2} sx={{ display: mainTab === 2 ? 'block' : 'none' }}>
                <NotesTable
                    notes={notes}
                    total={totalNotes}
                    page={page}
                    rowsPerPage={pageSize}
                    isLoading={isLoading}
                    isTablet={isTablet}
                    onOpenMenu={handleNoteMenuOpen}
                    onChangePage={(p) => { dispatch(setKuppiCurrentPage(p)); dispatch(fetchNotes({ page: p, size: pageSize })); }}
                    onChangeRowsPerPage={(size) => { dispatch(setKuppiPageSize(size)); dispatch(setKuppiCurrentPage(0)); }}
                    onOpenSessionById={openSessionById}
                />
            </Box>

            {/* Hosts Tab (Kuppi Students) */}
            <Box role="tabpanel" hidden={mainTab !== 3} sx={{ display: mainTab === 3 ? 'block' : 'none' }}>
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h6">Hosts</Typography>
                        </Stack>
                    </CardContent>

                    {/* Hosts table */}
                    <MotionCard elevation={0} sx={{ borderRadius: 0 }}>
                        <CardContent>
                            {/* Hosts search & filters */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField
                                        size="small"
                                        placeholder="Search hosts"
                                        value={hostSearchQuery}
                                        onChange={(e) => setHostSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                            ),
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleHostSearch(0); }}
                                    />
                                    <Button onClick={() => handleHostSearch(0)} variant="outlined" size="small">Search</Button>
                                    <TextField
                                        select
                                        size="small"
                                        value={hostSearchType}
                                        onChange={(e) => setHostSearchType(e.target.value as 'name' | 'subject')}
                                        SelectProps={{ native: true }}
                                        sx={{ width: 140 }}
                                    >
                                        <option value="name">By name</option>
                                        <option value="subject">By subject</option>
                                    </TextField>
                                    <TextField
                                        select
                                        size="small"
                                        value={selectedFaculty}
                                        onChange={(e) => setSelectedFaculty(e.target.value as Faculty | 'ALL')}
                                        SelectProps={{ native: true }}
                                        sx={{ width: 160 }}
                                    >
                                        <option value="ALL">All Faculties</option>
                                        <option value="COMPUTING">Computing</option>
                                        <option value="BUSINESS">Business</option>
                                    </TextField>
                                </Stack>
                            </Stack>

                            {studentsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                            ) : (
                                (() => {
                                    if (!students || students.length === 0) {
                                        return (
                                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                                <Typography color="text.secondary">No hosts found</Typography>
                                            </Box>
                                        );
                                    }
                                    return (
                                        <>
                                            <TableContainer>
                                                <Table size={isTablet ? 'small' : 'medium'}>
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                                            <TableCell sx={{ fontWeight: 600 }}>Host</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Faculty</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Sessions</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {students.map((s: any) => (
                                                            <TableRow key={s.id} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight={600}>{s.fullName}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">{s.studentId}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{s.email}</TableCell>
                                                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{s.faculty}</TableCell>
                                                                <TableCell>
                                                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                                        {(s.kuppiSubjects || []).slice(0, 3).map((sub: string, i: number) => <Chip key={i} label={sub} size="small" />)}
                                                                    </Stack>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2">{s.totalSessionsHosted ?? s.kuppiSessionsCompleted ?? 0}</Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                                        <IconButton size="small" onClick={(e) => { setHostAnchorEl(e.currentTarget); setHostActionTarget(s); }}>
                                                                            <MoreVertIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <TablePagination
                                                component="div"
                                                count={totalStudents || 0}
                                                page={page}
                                                onPageChange={(_, p) => { dispatch(setKuppiCurrentPage(p)); handleHostSearch(p); }}
                                                rowsPerPage={pageSize}
                                                onRowsPerPageChange={(e) => { const newSize = parseInt(e.target.value, 10); dispatch(setKuppiPageSize(newSize)); dispatch(setKuppiCurrentPage(0)); handleHostSearch(0); }}
                                                rowsPerPageOptions={[5, 10, 25]}
                                            />
                                        </>
                                    );
                                })()
                            )}
                        </CardContent>
                    </MotionCard>
                </MotionCard>
            </Box>

            {/* Host Detail Dialog */}
            <Dialog open={hostDetailOpen} onClose={() => { setHostDetailOpen(false); }} maxWidth="md" fullWidth>
                <DialogTitle>Host Details</DialogTitle>
                <DialogContent>
                    {selectedKuppiStudentLoading || !selectedKuppiStudent ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Typography variant="h6">{selectedKuppiStudent.fullName}</Typography>
                            <Typography color="text.secondary">{selectedKuppiStudent.email}</Typography>
                            <Typography>Faculty: {selectedKuppiStudent.faculty}</Typography>
                            <Stack direction="row" spacing={1}>
                                {(selectedKuppiStudent.kuppiSubjects || []).map((sub: string, i: number) => <Chip key={i} label={sub} size="small" />)}
                            </Stack>
                            <Typography>Rating: {selectedKuppiStudent.kuppiRating ?? '—'}</Typography>
                            <Typography>Sessions hosted: {selectedKuppiStudent.kuppiSessionsCompleted ?? 0}</Typography>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHostDetailOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <RowActionMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                mode="application"
                targetItem={selectedApp}
                onClose={handleMenuClose}
                onView={handleView}
                onApprove={handleOpenApproveDialog}
                onReject={handleOpenRejectDialog}
                onMarkUnderReview={handleMarkUnderReview}
                extraActions={[{ key: 'permanent-delete', label: 'Permanently Delete', onClick: handleOpenPermanentDeleteDialog, color: 'error.main' }]}
            />

            {/* Session Action Menu */}
            <RowActionMenu
                anchorEl={sessionAnchorEl}
                open={Boolean(sessionAnchorEl)}
                mode="session"
                targetItem={sessionActionTarget}
                onClose={handleSessionMenuClose}
                onView={handleSessionView}
                onDelete={handleSessionDeleteConfirm}
                extraActions={[{ key: 'permanent-delete', label: 'Permanently Delete', onClick: handleOpenSessionPermanentDeleteDialog, color: 'error.main' }]}
            />

            {/* Note Action Menu */}
            <RowActionMenu
                anchorEl={noteAnchorEl}
                open={Boolean(noteAnchorEl)}
                mode="note"
                targetItem={noteActionTarget}
                onClose={handleNoteMenuClose}
                onView={handleNoteView}
                onDelete={handleNoteDeleteConfirm}
                extraActions={[{ key: 'permanent-delete', label: 'Permanently Delete', onClick: handleOpenNotePermanentDeleteDialog, color: 'error.main' }]}
            />

            {/* Host Action Menu */}
            <RowActionMenu
                anchorEl={hostAnchorEl}
                open={Boolean(hostAnchorEl)}
                mode="session"
                targetItem={hostActionTarget}
                onClose={() => { setHostAnchorEl(null); setHostActionTarget(null); }}
                onView={() => { if (hostActionTarget) { setHostAnchorEl(null); openHostDetail(hostActionTarget.id); } }}
                extraActions={[{ key: 'revoke-role', label: 'Revoke Kuppi Role', onClick: handleOpenRevokeRoleDialog, color: 'warning.main' }]}
            />

            <KuppiViewDialog
                open={viewDialogOpen}
                mode={viewMode}
                application={selectedApplication}
                session={selectedSession}
                note={selectedNote}
                isApplicationLoading={isApplicationLoading}
                isSessionLoading={isSessionLoading}
                isNoteLoading={isNoteLoading}
                onClose={() => { setViewDialogOpen(false); setViewMode(null); }}
                onOpenSessionById={openSessionById}
            />

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Are you sure you want to approve this application?</Typography>
                    <TextField
                        label="Review Notes (Optional)"
                        multiline
                        rows={3}
                        fullWidth
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleApprove} disabled={isApproving}>
                        {isApproving ? <CircularProgress size={20} /> : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Rejection Reason"
                            multiline
                            rows={2}
                            fullWidth
                            required
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <TextField
                            label="Review Notes (Optional)"
                            multiline
                            rows={2}
                            fullWidth
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject} disabled={isRejecting || !rejectionReason}>
                        {isRejecting ? <CircularProgress size={20} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permanent Delete Dialog */}
            <Dialog open={permanentDeleteDialogOpen} onClose={() => setPermanentDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <WarningIcon />
                        <Typography variant="h6">Permanently Delete {permanentDeleteType.charAt(0).toUpperCase() + permanentDeleteType.slice(1)}</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        This action is <strong>IRREVERSIBLE</strong>. The {permanentDeleteType} will be permanently deleted from the database.
                    </Alert>
                    <Typography sx={{ mb: 2 }}>Type <strong>DELETE</strong> to confirm:</Typography>
                    <TextField
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPermanentDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handlePermanentDelete}
                        disabled={confirmText !== 'DELETE' || isDeleting}
                    >
                        {isDeleting ? <CircularProgress size={20} /> : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Role Dialog */}
            <Dialog open={revokeRoleDialogOpen} onClose={() => setRevokeRoleDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'warning.main' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonOffIcon />
                        <Typography variant="h6">Revoke Kuppi Role</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This will remove the Kuppi Student role from this user. They will no longer be able to create sessions or upload notes.
                    </Alert>
                    <TextField
                        label="Reason for Revocation"
                        multiline
                        rows={3}
                        fullWidth
                        required
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRevokeRoleDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleRevokeRole}
                        disabled={!revokeReason || isDeleting}
                    >
                        {isDeleting ? <CircularProgress size={20} /> : 'Revoke Role'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Soft Delete Confirmation Dialog */}
            <Dialog open={softDeleteDialogOpen} onClose={() => { setSoftDeleteDialogOpen(false); setSoftDeleteTarget(null); }} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Are you sure you want to delete this {softDeleteTarget === 'session' ? 'session' : 'note'}? This action will soft-delete the item.
                    </Typography>
                    {softDeleteTarget === 'session' && selectedSession && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            Session: <strong>{selectedSession.title}</strong>
                        </Alert>
                    )}
                    {softDeleteTarget === 'note' && selectedNote && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            Note: <strong>{selectedNote.title}</strong>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setSoftDeleteDialogOpen(false); setSoftDeleteTarget(null); }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={softDeleteTarget === 'session' ? handleSoftDeleteSession : handleSoftDeleteNote}
                        disabled={actionLoading || isDeleting}
                    >
                        {actionLoading || isDeleting ? <CircularProgress size={20} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>

        </KuppiCommon>
    );
}


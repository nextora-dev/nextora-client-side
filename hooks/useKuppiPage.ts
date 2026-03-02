import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import * as kuppi from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';

// A shared hook that centralizes common Kuppi page logic (applications/sessions/notes)
export default function useKuppiPage() {
    const dispatch = useAppDispatch();

    // selectors (centralized)
    const applications = useAppSelector(kuppi.selectKuppiAllApplications);
    const totalApplications = useAppSelector(kuppi.selectKuppiTotalApplications);
    const applicationStats = useAppSelector(kuppi.selectKuppiApplicationStats);
    const platformStats = useAppSelector(kuppi.selectKuppiPlatformStats);
    const selectedApplication = useAppSelector(kuppi.selectKuppiSelectedApplication);
    const sessions = useAppSelector(kuppi.selectKuppiSessions);
    const notes = useAppSelector(kuppi.selectKuppiNotes);
    const totalSessions = useAppSelector(kuppi.selectKuppiTotalSessions);
    const totalNotes = useAppSelector(kuppi.selectKuppiTotalNotes);
    const page = useAppSelector(kuppi.selectKuppiCurrentPage);
    const pageSize = useAppSelector(kuppi.selectKuppiPageSize);
    const isLoading = useAppSelector(kuppi.selectKuppiIsLoading);
    const isApplicationLoading = useAppSelector(kuppi.selectKuppiIsApplicationLoading);
    const isSessionLoading = useAppSelector((state:any) => (state as any).kuppi?.isSessionLoading ?? false);
    const isNoteLoading = useAppSelector((state:any) => (state as any).kuppi?.isNoteLoading ?? false);
    const isApproving = useAppSelector(kuppi.selectKuppiIsCreating);
    const isRejecting = useAppSelector(kuppi.selectKuppiIsUpdating);
    const isDeleting = useAppSelector(kuppi.selectKuppiIsDeleting);
    const error = useAppSelector(kuppi.selectKuppiError);
    const successMessage = useAppSelector(kuppi.selectKuppiSuccessMessage);

    // local UI state
    const [mainTab, setMainTab] = useState<number>(0);
    const [applicationStatusFilter, setApplicationStatusFilter] = useState<kuppi.ApplicationStatus | ''>('');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedApp, setSelectedApp] = useState<kuppi.KuppiApplicationResponse | null>(null);

    const [selectedSession, setSelectedSession] = useState<kuppi.KuppiSessionResponse | null>(null);
    const [selectedNote, setSelectedNote] = useState<kuppi.KuppiNoteResponse | null>(null);
    const [viewMode, setViewMode] = useState<'application'|'session'|'note'|null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [actionLoading, setActionLoading] = useState(false);

    const [sessionAnchorEl, setSessionAnchorEl] = useState<null | HTMLElement>(null);
    const [sessionActionTarget, setSessionActionTarget] = useState<kuppi.KuppiSessionResponse | null>(null);
    const [noteAnchorEl, setNoteAnchorEl] = useState<null | HTMLElement>(null);
    const [noteActionTarget, setNoteActionTarget] = useState<kuppi.KuppiNoteResponse | null>(null);
    const [filteredSessions, setFilteredSessions] = useState<kuppi.KuppiSessionResponse[] | null>(null);

    // initial fetch
    useEffect(() => {
        dispatch(kuppi.adminFetchApplicationStats());
        dispatch(kuppi.adminFetchPlatformStats());
        dispatch(kuppi.adminFetchApplications({ page: 0, size: pageSize }));
        dispatch(kuppi.fetchSessions({ page: 0, size: pageSize }));
        dispatch(kuppi.fetchNotes({ page: 0, size: pageSize }));
    }, [dispatch, pageSize]);

    const handleMainTabChange = useCallback((_: any, newValue: number) => {
        setMainTab(newValue);
        dispatch(kuppi.setKuppiCurrentPage(0));
        if (newValue === 0) {
            dispatch(kuppi.adminFetchApplications({ page: 0, size: pageSize, status: applicationStatusFilter || undefined }));
        } else if (newValue === 1) {
            dispatch(kuppi.fetchSessions({ page: 0, size: pageSize }));
            setFilteredSessions(null);
        } else if (newValue === 2) {
            dispatch(kuppi.fetchNotes({ page: 0, size: pageSize }));
        }
    }, [dispatch, pageSize, applicationStatusFilter]);

    const handleRefresh = useCallback(() => {
        dispatch(kuppi.adminFetchApplicationStats());
        dispatch(kuppi.adminFetchPlatformStats());
        if (mainTab === 0) {
            dispatch(kuppi.adminFetchApplications({ page, size: pageSize, status: applicationStatusFilter || undefined }));
        } else if (mainTab === 1) {
            dispatch(kuppi.fetchSessions({ page, size: pageSize }));
        } else if (mainTab === 2) {
            dispatch(kuppi.fetchNotes({ page, size: pageSize }));
        }
        setFilteredSessions(null);
    }, [dispatch, mainTab, page, pageSize, applicationStatusFilter]);

    // application menu handlers
    const handleApplicationMenuOpen = (event: React.MouseEvent<HTMLElement>, app: kuppi.KuppiApplicationResponse) => { setAnchorEl(event.currentTarget); setSelectedApp(app); };
    const handleMenuClose = () => setAnchorEl(null);

    const handleViewApplication = () => {
        handleMenuClose();
        if (selectedApp) {
            setSelectedSession(null);
            setSelectedNote(null);
            setViewMode('application');
            dispatch(kuppi.adminFetchApplicationById(selectedApp.id));
            setViewDialogOpen(true);
        }
    };

    const handleApprove = () => {
        if (selectedApp) {
            dispatch(kuppi.adminApproveApplicationAsync({ id: selectedApp.id, data: reviewNotes ? { reviewNotes } : undefined }));
            setApproveDialogOpen(false);
            setReviewNotes('');
        }
    };

    const handleReject = () => {
        if (selectedApp && rejectionReason) {
            dispatch(kuppi.adminRejectApplicationAsync({ id: selectedApp.id, data: { rejectionReason, reviewNotes } }));
            setRejectDialogOpen(false);
            setRejectionReason('');
            setReviewNotes('');
        }
    };

    const handleMarkUnderReview = async () => {
        handleMenuClose();
        if (selectedApp) {
            try {
                await kuppiServices.adminMarkUnderReview(selectedApp.id);
                handleRefresh();
                setSnackbar({ open: true, message: 'Marked as under review', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
            }
        }
    };

    // session handlers
    const handleDeleteSession = async () => {
        if (selectedSession) {
            setActionLoading(true);
            try {
                await dispatch(kuppi.adminSoftDeleteSessionAsync(selectedSession.id)).unwrap();
                setDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Session deleted', severity: 'success' });
            } catch (err:any) {
                setSnackbar({ open: true, message: err?.message || 'Failed to delete session', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleSessionMenuOpen = (event: React.MouseEvent<HTMLElement>, session: kuppi.KuppiSessionResponse) => { setSessionAnchorEl(event.currentTarget); setSessionActionTarget(session); };
    const handleSessionMenuClose = () => { setSessionAnchorEl(null); setSessionActionTarget(null); };

    const handleSessionView = async () => {
        handleSessionMenuClose();
        if (sessionActionTarget) {
            setSelectedNote(null);
            setSelectedApp(null);
            setSelectedSession(null);
            setViewMode('session');
            setViewDialogOpen(true);
            try {
                const session = await dispatch(kuppi.fetchSessionById(sessionActionTarget.id)).unwrap();
                setSelectedSession(session as any);
            } catch (err:any) {
                setSnackbar({ open: true, message: err?.message || 'Failed to fetch session', severity: 'error' });
                setViewDialogOpen(false);
                setViewMode(null);
            }
        }
    };

    const handleSessionDeleteConfirm = () => { handleSessionMenuClose(); if (sessionActionTarget) { setSelectedSession(sessionActionTarget); setDeleteDialogOpen(true); } };

    // note handlers
    const handleNoteMenuOpen = (event: React.MouseEvent<HTMLElement>, note: kuppi.KuppiNoteResponse) => { setNoteAnchorEl(event.currentTarget); setNoteActionTarget(note); };
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
                const note = await dispatch(kuppi.fetchNoteById(noteActionTarget.id)).unwrap();
                setSelectedNote(note as any);
            } catch (err:any) {
                setSnackbar({ open: true, message: err?.message || 'Failed to fetch note', severity: 'error' });
                setViewDialogOpen(false);
                setViewMode(null);
            }
        }
    };

    const handleNoteDeleteConfirm = () => { handleNoteMenuClose(); if (noteActionTarget) { setSelectedNote(noteActionTarget); setDeleteDialogOpen(true); } };

    const handleDeleteNote = async () => {
        if (selectedNote) {
            setActionLoading(true);
            try {
                await dispatch(kuppi.adminSoftDeleteNoteAsync(selectedNote.id)).unwrap();
                setDeleteDialogOpen(false);
                handleRefresh();
                setSnackbar({ open: true, message: 'Note deleted', severity: 'success' });
            } catch (err:any) {
                setSnackbar({ open: true, message: err?.message || 'Failed to delete note', severity: 'error' });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const openSessionById = async (sessionId?: number | string | null, prevNoteToRestore?: kuppi.KuppiNoteResponse | null) => {
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
            const session = await dispatch(kuppi.fetchSessionById(Number(sessionId))).unwrap();
            setSelectedSession(session as any);
        } catch (err:any) {
            setSnackbar({ open: true, message: err?.message || 'Failed to open session', severity: 'error' });
            setViewDialogOpen(false);
            setViewMode(null);
            if (prevNote) {
                setSelectedNote(prevNote);
                setViewMode('note');
                setViewDialogOpen(true);
            }
        }
    };

    // effects for messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(kuppi.clearKuppiError());
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            dispatch(kuppi.clearKuppiSuccessMessage());
            handleRefresh();
        }
    }, [error, successMessage, dispatch, handleRefresh]);

    return {
        // selectors
        applications,
        totalApplications,
        applicationStats,
        platformStats,
        selectedApplication,
        sessions,
        notes,
        totalSessions,
        totalNotes,
        page,
        pageSize,
        isLoading,
        isApplicationLoading,
        isSessionLoading,
        isNoteLoading,
        isApproving,
        isRejecting,
        isDeleting,
        error,
        successMessage,
        // ui state
        mainTab,
        setMainTab,
        applicationStatusFilter,
        setApplicationStatusFilter,
        anchorEl,
        setAnchorEl,
        selectedApp,
        setSelectedApp,
        selectedSession,
        setSelectedSession,
        selectedNote,
        setSelectedNote,
        viewMode,
        setViewMode,
        viewDialogOpen,
        setViewDialogOpen,
        approveDialogOpen,
        setApproveDialogOpen,
        rejectDialogOpen,
        setRejectDialogOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        reviewNotes,
        setReviewNotes,
        rejectionReason,
        setRejectionReason,
        snackbar,
        setSnackbar,
        actionLoading,
        setActionLoading,
        // anchors
        sessionAnchorEl,
        setSessionAnchorEl,
        sessionActionTarget,
        setSessionActionTarget,
        noteAnchorEl,
        setNoteAnchorEl,
        noteActionTarget,
        setNoteActionTarget,
        filteredSessions,
        setFilteredSessions,
        // handlers
        handleMainTabChange,
        handleRefresh,
        handleApplicationMenuOpen,
        handleMenuClose,
        handleViewApplication,
        handleApprove,
        handleReject,
        handleMarkUnderReview,
        handleDeleteSession,
        handleSessionMenuOpen,
        handleSessionMenuClose,
        handleSessionView,
        handleSessionDeleteConfirm,
        handleNoteMenuOpen,
        handleNoteMenuClose,
        handleNoteView,
        handleNoteDeleteConfirm,
        handleDeleteNote,
        openSessionById,
    } as const;
}


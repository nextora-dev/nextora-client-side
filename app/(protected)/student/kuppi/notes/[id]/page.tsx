'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Button, alpha, useTheme, Grid, Card, CardContent, Stack,
    Chip, Avatar, CircularProgress, Snackbar, Alert, Paper, Divider, Tooltip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArticleIcon from '@mui/icons-material/Article';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import StorageIcon from '@mui/icons-material/Storage';
import CategoryIcon from '@mui/icons-material/Category';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolIcon from '@mui/icons-material/School';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchNoteById, deleteNoteAsync, updateNoteAsync,
    selectKuppiSelectedNote, selectKuppiIsNoteLoading, selectKuppiError,
    clearKuppiError, clearKuppiSelectedNote,
    selectKuppiIsCreating,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';
import { useAuth } from '@/hooks';

/* ── Motion wrappers ──────────────────────────────────────────────── */
const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

/* ── Helpers ──────────────────────────────────────────────────────── */

const getFileIcon = (fileType: string, size = 32, color = '#6B7280') => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return <PictureAsPdfIcon sx={{ color, fontSize: size }} />;
    if (type.includes('doc') || type.includes('word')) return <ArticleIcon sx={{ color, fontSize: size }} />;
    return <InsertDriveFileIcon sx={{ color, fontSize: size }} />;
};

const getFileColor = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return '#EF4444';
    if (type.includes('doc') || type.includes('word')) return '#3B82F6';
    if (type.includes('ppt') || type.includes('presentation')) return '#F59E0B';
    if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '#10B981';
    return '#6B7280';
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
}

/* ── Stagger animation helper ─────────────────────────────────────── */
const stagger = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.08 * i, duration: 0.35 },
});

/* ══════════════════════════════════════════════════════════════════ */
/*  NOTE DETAIL PAGE                                                */
/* ══════════════════════════════════════════════════════════════════ */

export default function KuppiNoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const noteId = params.id as string;

    const note = useAppSelector(selectKuppiSelectedNote);
    const isLoading = useAppSelector(selectKuppiIsNoteLoading);
    const error = useAppSelector(selectKuppiError);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Note state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<{ title: string; description: string; allowDownload: boolean; file?: File | null }>({ title: '', description: '', allowDownload: false, file: null });
    // use global creating flag for updates/uploads
    const isCreating = useAppSelector(selectKuppiIsCreating);

    /* ── Ownership check ── */
    const isOwner = !!(user && note && (
        Number(user.id) === note.uploader.id ||
        `${user.firstName} ${user.lastName}`.toLowerCase() === note.uploader.fullName?.toLowerCase()
    ));

    /* ── Fetch note on mount ── */
    useEffect(() => {
        const numericId = Number(noteId);
        if (!Number.isNaN(numericId)) {
            dispatch(fetchNoteById(numericId));
        }
        return () => { dispatch(clearKuppiSelectedNote()); };
    }, [dispatch, noteId]);

    /* ── Clear errors ── */
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
    }, [error, dispatch]);

    /* ── Download handler ── */
    const handleDownload = async () => {
        if (!note) return;
        setIsDownloading(true);
        try {
            await kuppiServices.recordNoteDownload(note.id);
            const blob = await kuppiServices.downloadNoteFile(note.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = note.fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setSnackbar({ open: true, message: 'Download started!', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Download failed. Please try again.', severity: 'error' });
        } finally {
            setIsDownloading(false);
        }
    };

    /* ── Delete handler ── */
    const handleDelete = async () => {
        if (!note) return;
        setIsDeleting(true);
        try {
            await dispatch(deleteNoteAsync(note.id)).unwrap();
            setSnackbar({ open: true, message: 'Note deleted successfully.', severity: 'success' });
            // Navigate back after short delay so user sees the success message
            setTimeout(() => router.push('/student/kuppi/notes'), 1200);
        } catch {
            setSnackbar({ open: true, message: 'Failed to delete note. Please try again.', severity: 'error' });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    /* ── Edit handlers ── */
    const openEdit = () => {
        if (!note) return;
        setEditForm({
            title: note.title || '',
            description: note.description || '',
            allowDownload: note.allowDownload ?? false,
            file: null,
        });
        setIsEditOpen(true);
    };

    const handleEditChange = (field: string, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const hasEditChanges = React.useMemo(() => {
        if (!note) return false;
        return (
            (editForm.title || '') !== (note.title || '') ||
            (editForm.description || '') !== (note.description || '') ||
            (editForm.allowDownload) !== (note.allowDownload ?? false) ||
            Boolean(editForm.file)
        );
    }, [editForm, note]);

    const handleEditSubmit = async () => {
        if (!note) return;
        try {
            const data: any = {};
            if (editForm.title && editForm.title !== note.title) data.title = editForm.title;
            if (editForm.description !== note.description) data.description = editForm.description;
            if (editForm.allowDownload !== note.allowDownload) data.allowDownload = editForm.allowDownload;
            if (editForm.file) data.file = editForm.file;
            // if there are no changes, short-circuit
            if (Object.keys(data).length === 0) {
                setSnackbar({ open: true, message: 'No changes to save.', severity: 'info' as any });
                setIsEditOpen(false);
                return;
            }

            await dispatch(updateNoteAsync({ id: note.id, data })).unwrap();
            setSnackbar({ open: true, message: 'Note updated successfully.', severity: 'success' });
            setIsEditOpen(false);
        } catch (err) {
            setSnackbar({ open: true, message: (err as any)?.message || 'Failed to update note.', severity: 'error' });
        } finally {
            // rely on global creating flag to reflect loading state
        }
    };

    /* ── Loading state ── */
    if (isLoading) {
        return (
            <Box sx={{ p: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>Loading note details…</Typography>
            </Box>
        );
    }

    /* ── Not found ── */
    if (!note) {
        return (
            <Box sx={{ p: 8, textAlign: 'center' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: alpha(theme.palette.warning.main, 0.5) }} />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>Note Not Found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    The note you're looking for doesn't exist or has been removed.
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi/notes')}
                    variant="outlined"
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Notes
                </Button>
            </Box>
        );
    }

    const fileColor = getFileColor(note.fileType);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* ── Back Navigation ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi/notes')}
                    sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) } }}
                >
                    Back to Notes
                </Button>

                {/* Owner actions */}
                {isOwner && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<UpdateIcon />}
                            onClick={openEdit}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Edit Note
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{
                                borderRadius: 1, textTransform: 'none', fontWeight: 600,
                                borderColor: alpha(theme.palette.error.main, 0.4),
                                '&:hover': {
                                    borderColor: theme.palette.error.main,
                                    bgcolor: alpha(theme.palette.error.main, 0.06),
                                },
                            }}
                        >
                            Delete Note
                        </Button>
                    </Stack>
                )}
            </Stack>

            <Grid container spacing={3}>
                {/* ══════════════  LEFT COLUMN  ══════════════ */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* ── Hero Header Card ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        {/* Gradient banner */}
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${fileColor}, ${alpha(fileColor, 0.7)})`,
                                p: { xs: 2.5, sm: 3.5 },
                                position: 'relative',
                            }}
                        >
                            {/* Subtle pattern overlay */}
                            <Box sx={{
                                position: 'absolute', inset: 0, opacity: 0.06,
                                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }} />

                            <Box sx={{ position: 'relative' }}>
                                {/* Chips row */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                    <Chip
                                        label={note.fileType?.toUpperCase() || 'FILE'}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, letterSpacing: '0.03em' }}
                                    />
                                    <Chip
                                        label={note.formattedFileSize || 'Unknown size'}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                                    />
                                    {note.allowDownload && (
                                        <Chip
                                            icon={<DownloadIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                                            label="Downloadable"
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                                        />
                                    )}
                                </Stack>

                                {/* Title */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        width: 56, height: 56, borderRadius: 1.5,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                    }}>
                                        {getFileIcon(note.fileType, 28, 'white')}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.25 }}>
                                            {note.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                            {note.fileName}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>

                        {/* ── Stats Bar ── */}
                        <Stack
                            direction="row"
                            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                        >
                            {[
                                { icon: <VisibilityIcon sx={{ fontSize: 18, color: '#3B82F6' }} />, label: 'Views', value: String(note.viewCount ?? 0) },
                                { icon: <DownloadIcon sx={{ fontSize: 18, color: '#10B981' }} />, label: 'Downloads', value: String(note.downloadCount ?? 0) },
                                { icon: <StorageIcon sx={{ fontSize: 18, color: '#F59E0B' }} />, label: 'Size', value: note.formattedFileSize || 'N/A' },
                            ].map((stat, idx) => (
                                <Box key={idx} sx={{ flex: 1, py: 1.5, px: 2, textAlign: 'center' }}>
                                    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                        {stat.icon}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{stat.label}</Typography>
                                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{stat.value}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>

                        {/* ── Card Body ── */}
                        <CardContent sx={{ p: 3 }}>
                            {/* Description */}
                            <MotionBox {...stagger(1)}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                                    Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    {note.description || 'No description provided for this note.'}
                                </Typography>
                            </MotionBox>

                            <Divider sx={{ my: 3 }} />

                            {/* File Details Grid */}
                            <MotionBox {...stagger(2)}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                                    File Details
                                </Typography>
                                <Grid container spacing={2}>
                                    {[
                                        { icon: <AttachFileIcon sx={{ fontSize: 18 }} />, label: 'File Name', value: note.fileName },
                                        { icon: <CategoryIcon sx={{ fontSize: 18 }} />, label: 'File Type', value: note.fileType?.toUpperCase() || 'Unknown' },
                                        { icon: <StorageIcon sx={{ fontSize: 18 }} />, label: 'File Size', value: note.formattedFileSize || `${(note.fileSize / 1024).toFixed(1)} KB` },
                                        { icon: <CalendarTodayIcon sx={{ fontSize: 18 }} />, label: 'Uploaded', value: formatDate(note.createdAt) },
                                        ...(note.updatedAt && note.updatedAt !== note.createdAt ? [{ icon: <UpdateIcon sx={{ fontSize: 18 }} />, label: 'Last Updated', value: getRelativeTime(note.updatedAt) }] : []),
                                    ].map((item, idx) => (
                                        <Grid size={{ xs: 6, sm: 4 }} key={idx}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5, borderRadius: 1, height: '100%',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                    <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                                                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                                </Stack>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    sx={{
                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {item.value}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </MotionBox>

                            {/* Related Session */}
                            {note.sessionTitle && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <MotionBox {...stagger(3)}>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                                            Related Session
                                        </Typography>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2, borderRadius: 1,
                                                bgcolor: alpha(theme.palette.info.main, 0.04),
                                                borderColor: alpha(theme.palette.info.main, 0.2),
                                                cursor: note.sessionId ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                '&:hover': note.sessionId ? {
                                                    borderColor: theme.palette.info.main,
                                                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
                                                } : {},
                                            }}
                                            onClick={() => note.sessionId && router.push(`/student/kuppi/${note.sessionId}`)}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Box sx={{
                                                    width: 40, height: 40, borderRadius: 1, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                                }}>
                                                    <SchoolIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>{note.sessionTitle}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Kuppi Session</Typography>
                                                </Box>
                                                {note.sessionId && (
                                                    <Tooltip title="View Session">
                                                        <IconButton size="small" sx={{ color: 'info.main' }}>
                                                            <OpenInNewIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </Paper>
                                    </MotionBox>
                                </>
                            )}
                        </CardContent>
                    </MotionCard>
                </Grid>

                {/* ══════════════  RIGHT COLUMN (Sidebar)  ══════════════ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* ── Download CTA Card ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'visible' }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2.5}>
                                {/* File preview icon */}
                                <Box sx={{
                                    width: '100%', py: 4, borderRadius: 1,
                                    bgcolor: alpha(fileColor, 0.06),
                                    border: '1px solid',
                                    borderColor: alpha(fileColor, 0.12),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {getFileIcon(note.fileType, 56, fileColor)}
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>
                                        {note.fileName}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                            label={note.fileType?.toUpperCase() || 'FILE'}
                                            size="small"
                                            sx={{ bgcolor: alpha(fileColor, 0.1), color: fileColor, fontWeight: 600, fontSize: '0.65rem' }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {note.formattedFileSize}
                                        </Typography>
                                    </Stack>
                                </Box>

                                {note.allowDownload ? (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        startIcon={isDownloading ? <CircularProgress size={18} color="inherit" /> : <CloudDownloadIcon />}
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        sx={{
                                            borderRadius: 1, textTransform: 'none', fontWeight: 700, py: 1.5,
                                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` },
                                        }}
                                    >
                                        {isDownloading ? 'Downloading…' : 'Download Note'}
                                    </Button>
                                ) : (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, textAlign: 'center', borderColor: 'divider' }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Download not available for this note
                                        </Typography>
                                    </Paper>
                                )}

                                {note.fileUrl && (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<OpenInNewIcon />}
                                        onClick={() => window.open(note.fileUrl, '_blank')}
                                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Open in Browser
                                    </Button>
                                )}
                            </Stack>
                        </CardContent>
                    </MotionCard>

                    {/* ── Uploader Card ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                                Uploaded by
                            </Typography>

                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar
                                    src={note.uploader.profilePictureUrl || undefined}
                                    sx={{
                                        width: 52, height: 52,
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        color: 'primary.main',
                                        fontWeight: 700, fontSize: '1.1rem',
                                        border: '3px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                    }}
                                >
                                    {note.uploader.fullName?.[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="subtitle1" fontWeight={700}>{note.uploader.fullName || 'Unknown'}</Typography>
                                        {isOwner && (
                                            <Chip label="You" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
                                        )}
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">Kuppi Student</Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Uploaded</Typography>
                                    <Typography variant="body2" fontWeight={600}>{formatDateTime(note.createdAt)}</Typography>
                                </Stack>
                                {note.updatedAt && note.updatedAt !== note.createdAt && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                                        <Typography variant="body2" fontWeight={600}>{getRelativeTime(note.updatedAt)}</Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </CardContent>
                    </MotionCard>

                    {/* ── Quick Stats Card ── */}
                    <MotionCard
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 3 }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                                Note Statistics
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Views', value: note.viewCount ?? 0, color: '#3B82F6', icon: <VisibilityIcon sx={{ fontSize: 20 }} /> },
                                    { label: 'Downloads', value: note.downloadCount ?? 0, color: '#10B981', icon: <DownloadIcon sx={{ fontSize: 20 }} /> },
                                ].map((stat, idx) => (
                                    <Grid size={{ xs: 6 }} key={idx}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2, borderRadius: 1, textAlign: 'center',
                                                border: '1px solid', borderColor: 'divider',
                                                bgcolor: alpha(stat.color, 0.04),
                                            }}
                                        >
                                            <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                                            <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                            width: 44, height: 44, borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                        }}>
                            <WarningAmberIcon sx={{ color: 'error.main', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Delete Note</Typography>
                            <Typography variant="caption" color="text.secondary">This action cannot be undone</Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2, borderRadius: 1, mt: 1,
                            bgcolor: alpha(theme.palette.error.main, 0.04),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.error.main, 0.15),
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Are you sure you want to permanently delete <strong>"{note.title}"</strong>?
                            This will remove the note and its file from the platform. Other students will no longer be able to view or download this note.
                        </Typography>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeleting}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
                        sx={{
                            borderRadius: 1, textTransform: 'none', fontWeight: 700,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
                        }}
                    >
                        {isDeleting ? 'Deleting…' : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Edit Note Dialog */}
            <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Note</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                        <TextField label="Title" value={editForm.title} onChange={(e) => handleEditChange('title', e.target.value)} fullWidth />
                        <TextField label="Description" value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)} fullWidth multiline rows={4} />
                        <Stack direction="row" spacing={2} alignItems="center">
                            <input id="note-file-input" type="file" onChange={(e) => handleEditChange('file', e.target.files?.[0] ?? null)} />
                            <Button onClick={() => handleEditChange('file', null)} disabled={!editForm.file && !note?.fileName}>Remove file</Button>
                        </Stack>
                        {/* show file name / preview */}
                        <Box>
                            <Typography variant="caption" color="text.secondary">Current file</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                {editForm.file ? `${editForm.file.name} (${(editForm.file.size / 1024).toFixed(1)} KB)` : (note?.fileName || 'No file attached')}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Allow users to download this note">
                                <Chip label={editForm.allowDownload ? 'Downloadable' : 'Not Downloadable'} color={editForm.allowDownload ? 'primary' : 'default'} onClick={() => handleEditChange('allowDownload', !editForm.allowDownload)} />
                            </Tooltip>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditOpen(false)} disabled={isCreating}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit} disabled={isCreating || !hasEditChanges}>
                        {isCreating ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    variant="filled"
                    sx={{ borderRadius: 1 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Button, alpha, useTheme, Grid, Card, CardContent, Stack,
    TextField, InputAdornment, IconButton, Chip, Avatar, CircularProgress,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs, Tab, Paper, Tooltip, Skeleton, TablePagination, Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchNotes, fetchMyNotes, uploadNoteAsync, searchNotesAsync,
    checkIsKuppiStudentAsync, selectKuppiNotes, selectKuppiMyNotes,
    selectKuppiTotalNotes, selectKuppiIsKuppiStudent,
    selectKuppiIsNoteLoading, selectKuppiIsCreating, selectKuppiError,
    selectKuppiSuccessMessage, clearKuppiError, clearKuppiSuccessMessage,
    setKuppiCurrentPage, setKuppiPageSize,
    selectKuppiCurrentPage, selectKuppiPageSize,
    KuppiNoteResponse,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const getFileIcon = (fileType: string, size: number = 24, color: string = '#6B7280') => {
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

export default function KuppiNotesPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const notes = useAppSelector(selectKuppiNotes);
    const myNotes = useAppSelector(selectKuppiMyNotes);
    const totalNotes = useAppSelector(selectKuppiTotalNotes);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const isLoading = useAppSelector(selectKuppiIsNoteLoading);
    const isCreating = useAppSelector(selectKuppiIsCreating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);
    const page = useAppSelector(selectKuppiCurrentPage);
    const reduxPageSize = useAppSelector(selectKuppiPageSize);
    const pageSize = reduxPageSize || 10;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [uploadForm, setUploadForm] = useState({ title: '', description: '', sessionId: '', allowDownload: true, file: null as File | null });
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

    useEffect(() => { dispatch(checkIsKuppiStudentAsync()); dispatch(fetchNotes({ page: 0, size: pageSize })); }, [dispatch]);
    const currentNotes = activeTab === 1 ? myNotes : notes;

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue); dispatch(setKuppiCurrentPage(0));
        if (newValue === 0) dispatch(fetchNotes({ page: 0, size: pageSize }));
        else if (newValue === 1 && isKuppiStudent) dispatch(fetchMyNotes({ page: 0, size: pageSize }));
    };

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) dispatch(searchNotesAsync({ keyword: searchQuery, page: 0, size: pageSize }));
        else dispatch(fetchNotes({ page: 0, size: pageSize }));
    }, [dispatch, searchQuery, pageSize]);

    const handleRefresh = () => {
        if (activeTab === 0) dispatch(fetchNotes({ page, size: pageSize }));
        else if (activeTab === 1) dispatch(fetchMyNotes({ page, size: pageSize }));
    };

    const handleViewNote = (note: KuppiNoteResponse) => { router.push(`/student/kuppi/notes/${note.id}`); };

    const handleDownloadNote = async (note: KuppiNoteResponse) => {
        try {
            await kuppiServices.recordNoteDownload(note.id);
            const blob = await kuppiServices.downloadNoteFile(note.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = note.fileName || 'download';
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
            setSnackbar({ open: true, message: 'Download started', severity: 'success' });
        } catch { setSnackbar({ open: true, message: 'Download failed', severity: 'error' }); }
    };

    const handleOpenUploadDialog = () => { setUploadForm({ title: '', description: '', sessionId: '', allowDownload: true, file: null }); setUploadErrors({}); setUploadDialogOpen(true); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null })); if (uploadErrors.file) setUploadErrors(prev => ({ ...prev, file: '' })); };
    const validateUploadForm = (): boolean => { const errors: Record<string, string> = {}; if (!uploadForm.title.trim()) errors.title = 'Title is required'; if (!uploadForm.file) errors.file = 'File is required'; setUploadErrors(errors); return Object.keys(errors).length === 0; };
    const handleUploadSubmit = () => {
        if (!validateUploadForm()) return;
        dispatch(uploadNoteAsync({ title: uploadForm.title, description: uploadForm.description || undefined, sessionId: uploadForm.sessionId ? parseInt(uploadForm.sessionId) : undefined, allowDownload: uploadForm.allowDownload, file: uploadForm.file! }));
        setUploadDialogOpen(false);
    };

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); dispatch(clearKuppiError()); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); dispatch(clearKuppiSuccessMessage()); if (activeTab === 0) dispatch(fetchNotes({ page, size: pageSize })); else if (activeTab === 1) dispatch(fetchMyNotes({ page, size: pageSize })); }
    }, [error, successMessage, dispatch, activeTab, page, pageSize]);

    const stats = [
        { label: 'Total Notes', value: totalNotes, icon: FolderIcon, color: '#3B82F6' },
        { label: 'My Notes', value: myNotes.length, icon: DescriptionIcon, color: '#10B981' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ── Header ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi')} sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                    Back to Sessions
                </Button>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>Study Notes</Typography>
                        <Typography variant="body2" color="text.secondary">Browse and download study materials shared by Kuppi hosts</Typography>
                    </Box>
                    {isKuppiStudent && (
                        <Button
                            variant="contained" startIcon={<CloudUploadIcon />} onClick={handleOpenUploadDialog}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`, '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}` } }}
                        >
                            Upload Note
                        </Button>
                    )}
                </Stack>
            </MotionBox>

            {/* ── Stats ── */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), border: '1px solid', borderColor: alpha(stat.color, 0.15) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* ── Filters ── */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(12px)', bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} size="small"
                            sx={{ maxWidth: { sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: 1, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' } } }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }}
                        />
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 1, px: 2 }, '& .MuiTabs-indicator': { borderRadius: 1, height: 2 } }}>
                                <Tab label="All Notes" />
                                {isKuppiStudent && <Tab label="My Notes" />}
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={isLoading} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* ══════════════  NOTES GRID  ══════════════ */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                <Skeleton variant="rectangular" height={4} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={1.5}>
                                        <Skeleton variant="rounded" width={48} height={48} />
                                        <Skeleton variant="text" width="70%" height={24} />
                                        <Skeleton variant="text" width="50%" />
                                        <Skeleton variant="text" width="40%" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : error ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 32, color: alpha(theme.palette.error.main, 0.5) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="error">Failed to Load Notes</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
                    <Button variant="outlined" color="primary" onClick={handleRefresh} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Try Again</Button>
                </Paper>
            ) : currentNotes.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                        <DescriptionIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Notes Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, mx: 'auto' }}>
                        {activeTab === 1 ? "You haven't uploaded any notes yet." : 'No notes available. Check back later!'}
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {currentNotes.map((note, index) => {
                        const fileColor = getFileColor(note.fileType);
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
                                <MotionCard
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    elevation={0}
                                    onClick={() => handleViewNote(note)}
                                    sx={{
                                        borderRadius: 1, overflow: 'hidden', height: '100%',
                                        border: '1px solid', borderColor: 'divider',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}` },
                                    }}
                                >
                                    {/* File-type accent bar */}
                                    <Box sx={{ height: 4, background: `linear-gradient(90deg, ${fileColor}, ${alpha(fileColor, 0.3)})` }} />

                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            {/* Icon + Type */}
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box sx={{ width: 48, height: 48, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(fileColor, 0.1), border: '1px solid', borderColor: alpha(fileColor, 0.15) }}>
                                                    {getFileIcon(note.fileType, 24, fileColor)}
                                                </Box>
                                                <Chip label={note.fileType?.toUpperCase() || 'FILE'} size="small" sx={{ bgcolor: alpha(fileColor, 0.1), color: fileColor, fontWeight: 600, fontSize: '0.65rem' }} />
                                            </Stack>

                                            <Typography variant="subtitle1" fontWeight={700} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {note.title}
                                            </Typography>

                                            {note.sessionTitle && <Chip label={note.sessionTitle} size="small" variant="outlined" sx={{ alignSelf: 'flex-start', fontSize: '0.65rem', borderColor: 'divider' }} />}

                                            {/* Meta */}
                                            <Stack direction="row" spacing={2}>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <VisibilityIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                    <Typography variant="caption" color="text.secondary">{note.viewCount ?? 0}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <DownloadIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                    <Typography variant="caption" color="text.secondary">{note.downloadCount ?? 0}</Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary">{note.formattedFileSize || 'N/A'}</Typography>
                                            </Stack>

                                            <Divider />

                                            {/* Uploader */}
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar
                                                    src={note.uploader.profilePictureUrl || undefined}
                                                    sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontSize: '0.65rem', fontWeight: 700 }}>
                                                    {note.uploader.fullName?.[0]?.toUpperCase() || 'U'}
                                                </Avatar>
                                                <Typography variant="caption" color="text.secondary">{note.uploader.fullName || 'Unknown'}</Typography>
                                            </Stack>

                                            {/* Actions */}
                                            <Stack direction="row" spacing={1}>
                                                <Button size="small" startIcon={<OpenInNewIcon />} onClick={(e) => { e.stopPropagation(); handleViewNote(note); }} sx={{ flex: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}>View Details</Button>
                                                {note.allowDownload && (
                                                    <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={(e) => { e.stopPropagation(); handleDownloadNote(note); }}
                                                        sx={{ flex: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', boxShadow: 'none', '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` } }}
                                                    >Download</Button>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Pagination */}
            {currentNotes.length > 0 && (
                <TablePagination component="div" count={totalNotes} page={page}
                    onPageChange={(_, p) => { dispatch(setKuppiCurrentPage(p)); if (activeTab === 0) dispatch(fetchNotes({ page: p, size: pageSize })); else dispatch(fetchMyNotes({ page: p, size: pageSize })); }}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => { dispatch(setKuppiPageSize(parseInt(e.target.value, 10))); dispatch(setKuppiCurrentPage(0)); }}
                    rowsPerPageOptions={[6, 12, 24]} sx={{ mt: 3, '& .MuiTablePagination-toolbar': { borderRadius: 1 } }}
                />
            )}


            {/* ── Upload Dialog ── */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>Upload Note</Typography>
                        <IconButton onClick={() => setUploadDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField label="Title" fullWidth required value={uploadForm.title}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                            error={!!uploadErrors.title} helperText={uploadErrors.title}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                        <TextField label="Description" fullWidth multiline rows={3} value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                        <TextField label="Session ID (Optional)" fullWidth type="number" value={uploadForm.sessionId}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, sessionId: e.target.value }))}
                            helperText="Link this note to a specific session"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                        <Box>
                            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth
                                sx={{
                                    py: 3, borderRadius: 1, borderStyle: 'dashed', borderWidth: 2,
                                    textTransform: 'none', fontWeight: 600,
                                    borderColor: uploadForm.file ? 'primary.main' : 'divider',
                                    bgcolor: uploadForm.file ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                }}
                            >
                                {uploadForm.file ? uploadForm.file.name : 'Choose File or Drag & Drop'}
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                            {uploadErrors.file && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{uploadErrors.file}</Typography>}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUploadDialogOpen(false)} sx={{ borderRadius: 1, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleUploadSubmit} disabled={isCreating}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` }}
                    >
                        {isCreating ? <CircularProgress size={20} /> : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

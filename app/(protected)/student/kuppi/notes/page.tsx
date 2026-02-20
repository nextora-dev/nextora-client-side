'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    alpha,
    useTheme,
    Grid,
    Card,
    CardContent,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Skeleton,
    useMediaQuery,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
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

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchNotes,
    fetchMyNotes,
    fetchNoteById,
    uploadNoteAsync,
    deleteNoteAsync,
    checkIsKuppiStudentAsync,
    selectKuppiNotes,
    selectKuppiMyNotes,
    selectKuppiSelectedNote,
    selectKuppiTotalNotes,
    selectKuppiIsKuppiStudent,
    selectKuppiIsLoading,
    selectKuppiIsNoteLoading,
    selectKuppiIsCreating,
    selectKuppiError,
    selectKuppiSuccessMessage,
    clearKuppiError,
    clearKuppiSuccessMessage,
    clearKuppiSelectedNote,
    setKuppiCurrentPage,
    setKuppiPageSize,
    selectKuppiCurrentPage,
    selectKuppiPageSize,
    KuppiNoteResponse,
    CreateKuppiNoteRequest,
} from '@/features/kuppi';
import * as kuppiServices from '@/features/kuppi/services';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Get file icon based on type
const getFileIcon = (fileType: string, size: number = 24, color: string = '#6B7280') => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return <PictureAsPdfIcon sx={{ color, fontSize: size }} />;
    if (type.includes('doc') || type.includes('word')) return <ArticleIcon sx={{ color, fontSize: size }} />;
    return <InsertDriveFileIcon sx={{ color, fontSize: size }} />;
};

// Get file color based on type
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
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Redux state
    const notes = useAppSelector(selectKuppiNotes);
    const myNotes = useAppSelector(selectKuppiMyNotes);
    const selectedNote = useAppSelector(selectKuppiSelectedNote);
    const totalNotes = useAppSelector(selectKuppiTotalNotes);
    const isKuppiStudent = useAppSelector(selectKuppiIsKuppiStudent);
    const isLoading = useAppSelector(selectKuppiIsLoading);
    const isNoteLoading = useAppSelector(selectKuppiIsNoteLoading);
    const isCreating = useAppSelector(selectKuppiIsCreating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);
    const page = useAppSelector(selectKuppiCurrentPage);
    const pageSize = useAppSelector(selectKuppiPageSize);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        sessionId: '',
        allowDownload: true,
        file: null as File | null,
    });
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

    // Fetch notes and check Kuppi student status on mount
    useEffect(() => {
        dispatch(checkIsKuppiStudentAsync());
        dispatch(fetchNotes({ page: 0, size: pageSize }));
    }, [dispatch, pageSize]);

    // Get current notes based on tab
    const currentNotes = activeTab === 1 ? myNotes : notes;

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        dispatch(setKuppiCurrentPage(0));
        if (newValue === 0) {
            dispatch(fetchNotes({ page: 0, size: pageSize }));
        } else if (newValue === 1 && isKuppiStudent) {
            dispatch(fetchMyNotes({ page: 0, size: pageSize }));
        }
    };

    // Handle search
    const handleSearch = useCallback(async () => {
        if (searchQuery.trim()) {
            try {
                const response = await kuppiServices.searchNotes({ keyword: searchQuery, page: 0, size: pageSize });
                // Note: In a real implementation, you'd dispatch an action to update the store
            } catch (err) {
                setSnackbar({ open: true, message: 'Search failed', severity: 'error' });
            }
        } else {
            dispatch(fetchNotes({ page: 0, size: pageSize }));
        }
    }, [dispatch, searchQuery, pageSize]);

    // Handle refresh
    const handleRefresh = () => {
        if (activeTab === 0) {
            dispatch(fetchNotes({ page, size: pageSize }));
        } else if (activeTab === 1) {
            dispatch(fetchMyNotes({ page, size: pageSize }));
        }
    };

    // Handle view note
    const handleViewNote = (note: KuppiNoteResponse) => {
        dispatch(fetchNoteById(note.id));
        setViewDialogOpen(true);
    };

    // Handle download note
    const handleDownloadNote = async (note: KuppiNoteResponse) => {
        try {
            // First record the download
            await kuppiServices.recordNoteDownload(note.id);
            // Then download the file
            const blob = await kuppiServices.downloadNoteFile(note.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = note.fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setSnackbar({ open: true, message: 'Download started', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Download failed', severity: 'error' });
        }
    };

    // Handle upload dialog
    const handleOpenUploadDialog = () => {
        setUploadForm({ title: '', description: '', sessionId: '', allowDownload: true, file: null });
        setUploadErrors({});
        setUploadDialogOpen(true);
    };

    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setUploadForm(prev => ({ ...prev, file }));
        if (uploadErrors.file) setUploadErrors(prev => ({ ...prev, file: '' }));
    };

    // Validate upload form
    const validateUploadForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!uploadForm.title.trim()) errors.title = 'Title is required';
        if (!uploadForm.file) errors.file = 'File is required';
        setUploadErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle upload submit
    const handleUploadSubmit = () => {
        if (!validateUploadForm()) return;

        const data: CreateKuppiNoteRequest = {
            title: uploadForm.title,
            description: uploadForm.description || undefined,
            sessionId: uploadForm.sessionId ? parseInt(uploadForm.sessionId) : undefined,
            allowDownload: uploadForm.allowDownload,
            file: uploadForm.file!,
        };

        dispatch(uploadNoteAsync(data));
        setUploadDialogOpen(false);
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
    }, [error, successMessage, dispatch]);

    // Stats
    const stats = [
        { label: 'Total Notes', value: totalNotes, icon: FolderIcon, color: '#3B82F6' },
        { label: 'My Notes', value: myNotes.length, icon: DescriptionIcon, color: '#10B981' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi')} sx={{ textTransform: 'none' }}>
                        Back to Sessions
                    </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>Study Notes</Typography>
                        <Typography variant="body2" color="text.secondary">Browse and download study materials shared by Kuppi hosts</Typography>
                    </Box>
                    {isKuppiStudent && (
                        <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleOpenUploadDialog} sx={{ borderRadius: 2 }}>
                            Upload Note
                        </Button>
                    )}
                </Stack>
            </MotionBox>

            {/* Stats */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
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

            {/* Filters */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 4, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{ maxWidth: { sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }
                            }}
                        />
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
                                <Tab label="All Notes" />
                                {isKuppiStudent && <Tab label="My Notes" />}
                            </Tabs>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={isLoading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Notes Grid */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : currentNotes.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Notes Found</Typography>
                    <Typography color="text.secondary">
                        {activeTab === 1 ? 'You haven\'t uploaded any notes yet.' : 'No notes available. Check back later!'}
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {currentNotes.map((note, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
                            <MotionCard
                                variants={itemVariants}
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    height: '100%',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(getFileColor(note.fileType), 0.1) }}>
                                                {getFileIcon(note.fileType, 24, getFileColor(note.fileType))}
                                            </Box>
                                            <Chip label={note.fileType?.toUpperCase() || 'FILE'} size="small" sx={{ bgcolor: alpha(getFileColor(note.fileType), 0.1), color: getFileColor(note.fileType) }} />
                                        </Stack>

                                        {/* Title */}
                                        <Typography variant="h6" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {note.title}
                                        </Typography>

                                        {/* Session */}
                                        {note.sessionTitle && (
                                            <Chip label={note.sessionTitle} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                                        )}

                                        {/* Stats */}
                                        <Stack direction="row" spacing={2}>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">{note.viewCount}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <DownloadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">{note.downloadCount}</Typography>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">{note.formattedFileSize}</Typography>
                                        </Stack>

                                        {/* Uploader */}
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main, fontSize: '0.75rem' }}>
                                                {note.uploaderName?.[0] || 'U'}
                                            </Avatar>
                                            <Typography variant="caption" color="text.secondary">{note.uploaderName}</Typography>
                                        </Stack>

                                        {/* Actions */}
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleViewNote(note)} sx={{ flex: 1 }}>
                                                View
                                            </Button>
                                            {note.allowDownload && (
                                                <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownloadNote(note)} sx={{ flex: 1 }}>
                                                    Download
                                                </Button>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Pagination */}
            {currentNotes.length > 0 && (
                <TablePagination
                    component="div"
                    count={totalNotes}
                    page={page}
                    onPageChange={(_, p) => {
                        dispatch(setKuppiCurrentPage(p));
                        if (activeTab === 0) dispatch(fetchNotes({ page: p, size: pageSize }));
                        else dispatch(fetchMyNotes({ page: p, size: pageSize }));
                    }}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => {
                        dispatch(setKuppiPageSize(parseInt(e.target.value, 10)));
                        dispatch(setKuppiCurrentPage(0));
                    }}
                    rowsPerPageOptions={[6, 12, 24]}
                    sx={{ mt: 3 }}
                />
            )}

            {/* View Note Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => { setViewDialogOpen(false); dispatch(clearKuppiSelectedNote()); }} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Note Details</Typography>
                        <IconButton onClick={() => { setViewDialogOpen(false); dispatch(clearKuppiSelectedNote()); }} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {isNoteLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : selectedNote ? (
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ width: 64, height: 64, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(getFileColor(selectedNote.fileType), 0.1) }}>
                                    {getFileIcon(selectedNote.fileType, 32, getFileColor(selectedNote.fileType))}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={600}>{selectedNote.title}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip label={selectedNote.fileType?.toUpperCase() || 'FILE'} size="small" />
                                        <Chip label={selectedNote.formattedFileSize} size="small" variant="outlined" />
                                    </Stack>
                                </Box>
                            </Stack>

                            {selectedNote.description && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Description</Typography>
                                    <Typography variant="body2">{selectedNote.description}</Typography>
                                </Box>
                            )}

                            {selectedNote.sessionTitle && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Related Session</Typography>
                                    <Typography variant="body2">{selectedNote.sessionTitle}</Typography>
                                </Box>
                            )}

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Views</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedNote.viewCount}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Downloads</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedNote.downloadCount}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">Uploaded by</Typography>
                                    <Typography variant="body1">{selectedNote.uploaderName}</Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setViewDialogOpen(false); dispatch(clearKuppiSelectedNote()); }}>Close</Button>
                    {selectedNote?.allowDownload && (
                        <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownloadNote(selectedNote)}>
                            Download
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Upload Note Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Upload Note</Typography>
                        <IconButton onClick={() => setUploadDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            label="Title"
                            fullWidth
                            required
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                            error={!!uploadErrors.title}
                            helperText={uploadErrors.title}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                        />

                        <TextField
                            label="Session ID (Optional)"
                            fullWidth
                            type="number"
                            value={uploadForm.sessionId}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, sessionId: e.target.value }))}
                            helperText="Link this note to a specific session"
                        />

                        <Box>
                            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ py: 2 }}>
                                {uploadForm.file ? uploadForm.file.name : 'Choose File'}
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                            {uploadErrors.file && (
                                <Typography variant="caption" color="error">{uploadErrors.file}</Typography>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUploadSubmit} disabled={isCreating}>
                        {isCreating ? <CircularProgress size={20} /> : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

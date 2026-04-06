'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, alpha, useTheme, Card, CardContent, Stack,
    Tabs, Tab, Snackbar, Alert, CircularProgress, Button, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import GavelIcon from '@mui/icons-material/Gavel';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { useLostFound } from '@/hooks/useLostFound';
import {
    ReportItemDialog, ItemDetailDialog, MatchesDialog,
    ImageUploadDialog, SubmitClaimDialog, ClaimDetailDialog,
} from '@/components/lostfound';
import type { LostItemResponse, FoundItemResponse } from '@/features/lostfound/types';

const MotionCard = motion.create(Card);
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function NonAcademicLostFoundPage() {
    const theme = useTheme();
    const {
        lostItems, foundItems, selectedLostItem, selectedFoundItem,
        totalLostItems, totalFoundItems,
        itemImages, matches, myClaims, categories,
        isLostLoading, isFoundLoading, isSubmitting, isDeleting,
        isImageLoading, isMatchLoading, isClaimLoading,
        error, successMessage,
        loadCategories, searchLostItems, searchFoundItems,
        loadLostItemById, loadFoundItemById,
        reportLostItem, reportFoundItem,
        updateLostItem, updateFoundItem,
        removeLostItem, removeFoundItem,
        uploadLostImages, uploadFoundImages, loadLostImages, loadFoundImages, removeImage,
        findLostMatches, findFoundMatches,
        submitClaim, loadMyClaims,
        clearError, clearSuccess,
        resetSelectedLost, resetSelectedFound, resetImages, resetMatches,
    } = useLostFound();

    const [mainTab, setMainTab] = useState(0); // 0=Lost, 1=Found, 2=My Claims
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Dialogs
    const [reportOpen, setReportOpen] = useState(false);
    const [reportType, setReportType] = useState<'LOST' | 'FOUND'>('LOST');
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailType, setDetailType] = useState<'LOST' | 'FOUND'>('LOST');
    const [imageOpen, setImageOpen] = useState(false);
    const [imageItemId, setImageItemId] = useState<number | null>(null);
    const [imageItemType, setImageItemType] = useState<'LOST' | 'FOUND'>('LOST');
    const [matchesOpen, setMatchesOpen] = useState(false);
    const [matchTitle, setMatchTitle] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string; type: 'LOST' | 'FOUND' } | null>(null);
    const [claimDetailOpen, setClaimDetailOpen] = useState(false);
    const [selectedClaimView, setSelectedClaimView] = useState<typeof myClaims[0] | null>(null);

    // Menu
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuItem, setMenuItem] = useState<{ item: LostItemResponse | FoundItemResponse; type: 'LOST' | 'FOUND' } | null>(null);

    useEffect(() => {
        loadCategories();
        searchLostItems({ page: 0, size: 10, sortBy: 'createdAt', sortDir: 'DESC' });
    }, [loadCategories, searchLostItems]);

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setMainTab(newValue); setPage(0);
        if (newValue === 0) searchLostItems({ page: 0, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (newValue === 1) searchFoundItems({ page: 0, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else loadMyClaims({ page: 0, size: pageSize });
    };

    const reload = useCallback(() => {
        if (mainTab === 0) searchLostItems({ page, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (mainTab === 1) searchFoundItems({ page, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else loadMyClaims({ page, size: pageSize });
    }, [mainTab, page, pageSize, searchLostItems, searchFoundItems, loadMyClaims]);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: LostItemResponse | FoundItemResponse, type: 'LOST' | 'FOUND') => {
        setMenuAnchor(event.currentTarget);
        setMenuItem({ item, type });
    };

    const handleCloseMenu = () => { setMenuAnchor(null); setMenuItem(null); };

    const handleView = () => {
        if (!menuItem) return;
        if (menuItem.type === 'LOST') loadLostItemById(menuItem.item.id);
        else loadFoundItemById(menuItem.item.id);
        setDetailType(menuItem.type);
        setDetailOpen(true);
        handleCloseMenu();
    };

    const handleManageImages = () => {
        if (!menuItem) return;
        setImageItemId(menuItem.item.id);
        setImageItemType(menuItem.type);
        if (menuItem.type === 'LOST') loadLostImages(menuItem.item.id);
        else loadFoundImages(menuItem.item.id);
        setImageOpen(true);
        handleCloseMenu();
    };

    const handleFindMatches = () => {
        if (!menuItem) return;
        setMatchTitle(menuItem.item.title);
        if (menuItem.type === 'LOST') findLostMatches(menuItem.item.id);
        else findFoundMatches(menuItem.item.id);
        setMatchesOpen(true);
        handleCloseMenu();
    };

    const handleDeleteClick = () => {
        if (!menuItem) return;
        setDeleteTarget({ id: menuItem.item.id, title: menuItem.item.title, type: menuItem.type });
        setDeleteOpen(true);
        handleCloseMenu();
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        const promise = deleteTarget.type === 'LOST' ? removeLostItem(deleteTarget.id) : removeFoundItem(deleteTarget.id);
        promise.then(() => { setDeleteOpen(false); setDeleteTarget(null); reload(); });
    };

    const handleReport = (type: 'LOST' | 'FOUND') => { setReportType(type); setReportOpen(true); };

    const currentItems = mainTab === 0 ? lostItems : mainTab === 1 ? foundItems : [];
    const currentTotal = mainTab === 0 ? totalLostItems : mainTab === 1 ? totalFoundItems : myClaims.length;
    const loading = mainTab === 0 ? isLostLoading : mainTab === 1 ? isFoundLoading : isClaimLoading;

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>Lost & Found Management</Typography>
                    <Typography variant="body2" color="text.secondary">Report, manage, and track lost & found items</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleReport('LOST')} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}>Report Lost</Button>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleReport('FOUND')} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>Report Found</Button>
                </Stack>
            </Stack>

            {/* Tabs */}
            <Tabs value={mainTab === false ? 0 : mainTab} onChange={handleTabChange} sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
                <Tab value={0} label="Lost Items" icon={<ReportProblemIcon />} iconPosition="start" />
                <Tab value={1} label="Found Items" icon={<FindInPageIcon />} iconPosition="start" />
                <Tab value={2} label="My Claims" icon={<GavelIcon />} iconPosition="start" />
            </Tabs>

            {/* Content */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : mainTab === 2 ? (
                        /* Claims Table */
                        myClaims.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No claims yet</Typography></Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Lost Item</TableCell>
                                            <TableCell>Found Item</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {myClaims.map((claim) => {
                                            const sc = { PENDING: '#F59E0B', APPROVED: '#10B981', REJECTED: '#EF4444' }[claim.status];
                                            return (
                                                <TableRow key={claim.id} hover>
                                                    <TableCell>#{claim.id}</TableCell>
                                                    <TableCell>{claim.lostItemTitle}</TableCell>
                                                    <TableCell>{claim.foundItemTitle}</TableCell>
                                                    <TableCell><Chip label={claim.status} size="small" sx={{ bgcolor: alpha(sc, 0.1), color: sc, fontWeight: 600 }} /></TableCell>
                                                    <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" onClick={() => { setSelectedClaimView(claim); setClaimDetailOpen(true); }}><VisibilityIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    ) : (
                        /* Items Table */
                        currentItems.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No items found</Typography></Box>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Title</TableCell>
                                                <TableCell>Category</TableCell>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentItems.map((item) => {
                                                const type = mainTab === 0 ? 'LOST' : 'FOUND';
                                                const dateVal = type === 'LOST' ? (item as LostItemResponse).dateLost : (item as FoundItemResponse).dateFound;
                                                return (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell><Typography variant="body2" fontWeight={600}>{item.title}</Typography></TableCell>
                                                        <TableCell><Chip label={item.category} size="small" variant="outlined" /></TableCell>
                                                        <TableCell><Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>{item.location}</Typography></TableCell>
                                                        <TableCell><Chip label={item.active ? 'Active' : 'Resolved'} size="small" sx={{ bgcolor: alpha(item.active ? '#10B981' : '#6B7280', 0.1), color: item.active ? '#10B981' : '#6B7280', fontWeight: 600 }} /></TableCell>
                                                        <TableCell>{dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A'}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton size="small" onClick={(e) => handleOpenMenu(e, item, type)}><MoreVertIcon /></IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    component="div" count={currentTotal} page={page} rowsPerPage={pageSize}
                                    onPageChange={(_, p) => { setPage(p); reload(); }}
                                    onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                            </>
                        )
                    )}
                </CardContent>
            </MotionCard>

            {/* Context Menu */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
                <MenuItem onClick={handleView}><ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon><ListItemText>View</ListItemText></MenuItem>
                <MenuItem onClick={handleManageImages}><ListItemIcon><PhotoLibraryIcon fontSize="small" /></ListItemIcon><ListItemText>Images</ListItemText></MenuItem>
                <MenuItem onClick={handleFindMatches}><ListItemIcon><CompareArrowsIcon fontSize="small" /></ListItemIcon><ListItemText>Matches</ListItemText></MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>Delete</ListItemText></MenuItem>
            </Menu>

            {/* Dialogs */}
            <ReportItemDialog
                open={reportOpen} onClose={() => setReportOpen(false)}
                type={reportType} categories={categories} isSubmitting={isSubmitting}
                onSubmitLost={(data) => { reportLostItem(data).then(() => { setReportOpen(false); reload(); }); }}
                onSubmitFound={(data) => { reportFoundItem(data).then(() => { setReportOpen(false); reload(); }); }}
            />
            <ItemDetailDialog open={detailOpen} onClose={() => { setDetailOpen(false); resetSelectedLost(); resetSelectedFound(); }} lostItem={detailType === 'LOST' ? selectedLostItem : undefined} foundItem={detailType === 'FOUND' ? selectedFoundItem : undefined} isLoading={isLostLoading || isFoundLoading} />
            <ImageUploadDialog
                open={imageOpen} onClose={() => { setImageOpen(false); setImageItemId(null); resetImages(); }}
                images={itemImages} isLoading={isImageLoading}
                onUpload={(files) => { if (imageItemId) { (imageItemType === 'LOST' ? uploadLostImages : uploadFoundImages)(imageItemId, files); } }}
                onDeleteImage={(imageId) => removeImage(imageId)}
            />
            <MatchesDialog open={matchesOpen} onClose={() => { setMatchesOpen(false); resetMatches(); }} matches={matches} isLoading={isMatchLoading} itemTitle={matchTitle} />
            <ClaimDetailDialog open={claimDetailOpen} onClose={() => { setClaimDetailOpen(false); setSelectedClaimView(null); }} claim={selectedClaimView} />

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent><Typography>Delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

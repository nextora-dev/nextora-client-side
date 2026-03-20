'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, alpha, useTheme, Grid, Card, CardContent, Stack,
    Tabs, Tab, Snackbar, Alert, CircularProgress, Button, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BlockIcon from '@mui/icons-material/Block';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { useLostFound } from '@/hooks/useLostFound';
import { ItemDetailDialog, ClaimDetailDialog, RejectClaimDialog } from '@/components/lostfound';
import type { LostItemResponse, FoundItemResponse, ClaimStatus } from '@/features/lostfound/types';

const MotionCard = motion.create(Card);
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SuperAdminLostFoundPage() {
    const theme = useTheme();
    const {
        lostItems, foundItems, selectedLostItem, selectedFoundItem,
        totalLostItems, totalFoundItems,
        claims, totalClaims, stats,
        isLostLoading, isFoundLoading, isClaimLoading, isStatsLoading,
        isSubmitting, isDeleting, error, successMessage,
        searchLostItems, searchFoundItems,
        loadLostItemById, loadFoundItemById,
        loadClaimsByStatus, approveClaim, rejectClaim,
        loadAdminStats, adminUpdateLost, adminUpdateFound,
        adminDeleteLost, adminDeleteFound,
        clearError, clearSuccess,
        resetSelectedLost, resetSelectedFound,
    } = useLostFound();

    const [mainTab, setMainTab] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailType, setDetailType] = useState<'LOST' | 'FOUND'>('LOST');
    const [claimDetailOpen, setClaimDetailOpen] = useState(false);
    const [claimForView, setClaimForView] = useState<typeof claims[0] | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectClaimId, setRejectClaimId] = useState<number | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string; type: 'LOST' | 'FOUND' } | null>(null);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [deactivateTarget, setDeactivateTarget] = useState<{ id: number; title: string; type: 'LOST' | 'FOUND' } | null>(null);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuItem, setMenuItem] = useState<{ item: LostItemResponse | FoundItemResponse; type: 'LOST' | 'FOUND' } | null>(null);

    useEffect(() => {
        loadAdminStats();
        searchLostItems({ page: 0, size: 10, sortBy: 'createdAt', sortDir: 'DESC' });
    }, [loadAdminStats, searchLostItems]);

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setMainTab(newValue); setPage(0);
        if (newValue === 0) searchLostItems({ page: 0, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (newValue === 1) searchFoundItems({ page: 0, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (newValue === 2) loadClaimsByStatus('PENDING', { page: 0, size: pageSize });
        else if (newValue === 3) loadClaimsByStatus('APPROVED', { page: 0, size: pageSize });
        else loadClaimsByStatus('REJECTED', { page: 0, size: pageSize });
    };

    const reload = useCallback(() => {
        if (mainTab === 0) searchLostItems({ page, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (mainTab === 1) searchFoundItems({ page, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' });
        else {
            const status: ClaimStatus = mainTab === 2 ? 'PENDING' : mainTab === 3 ? 'APPROVED' : 'REJECTED';
            loadClaimsByStatus(status, { page, size: pageSize });
        }
    }, [mainTab, page, pageSize, searchLostItems, searchFoundItems, loadClaimsByStatus]);

    const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, item: LostItemResponse | FoundItemResponse, type: 'LOST' | 'FOUND') => { setMenuAnchor(e.currentTarget); setMenuItem({ item, type }); };
    const handleCloseMenu = () => { setMenuAnchor(null); setMenuItem(null); };

    const handleView = () => { if (!menuItem) return; if (menuItem.type === 'LOST') loadLostItemById(menuItem.item.id); else loadFoundItemById(menuItem.item.id); setDetailType(menuItem.type); setDetailOpen(true); handleCloseMenu(); };
    const handleDeactivate = () => { if (!menuItem) return; setDeactivateTarget({ id: menuItem.item.id, title: menuItem.item.title, type: menuItem.type }); setDeactivateOpen(true); handleCloseMenu(); };
    const handleConfirmDeactivate = () => { if (!deactivateTarget) return; const p = deactivateTarget.type === 'LOST' ? adminUpdateLost(deactivateTarget.id, { active: false }) : adminUpdateFound(deactivateTarget.id, { active: false }); p.then(() => { setDeactivateOpen(false); setDeactivateTarget(null); reload(); loadAdminStats(); }); };
    const handleDeleteClick = () => { if (!menuItem) return; setDeleteTarget({ id: menuItem.item.id, title: menuItem.item.title, type: menuItem.type }); setDeleteOpen(true); handleCloseMenu(); };
    const handleConfirmDelete = () => { if (!deleteTarget) return; const p = deleteTarget.type === 'LOST' ? adminDeleteLost(deleteTarget.id) : adminDeleteFound(deleteTarget.id); p.then(() => { setDeleteOpen(false); setDeleteTarget(null); reload(); loadAdminStats(); }); };

    const handleApprove = (id: number) => { approveClaim(id).then(() => { reload(); loadAdminStats(); }); };
    const handleRejectOpen = (id: number) => { setRejectClaimId(id); setRejectOpen(true); };
    const handleRejectConfirm = (id: number, reason: string) => { rejectClaim(id, reason).then(() => { setRejectOpen(false); reload(); loadAdminStats(); }); };

    const isItems = mainTab < 2;
    const currentItems = mainTab === 0 ? lostItems : mainTab === 1 ? foundItems : [];
    const loading = mainTab === 0 ? isLostLoading : mainTab === 1 ? isFoundLoading : isClaimLoading;

    const statCards = [
        { label: 'Total Lost', value: stats?.totalLostItems ?? totalLostItems, icon: ReportProblemIcon, color: '#EF4444' },
        { label: 'Total Found', value: stats?.totalFoundItems ?? totalFoundItems, icon: FindInPageIcon, color: '#10B981' },
        { label: 'Pending Claims', value: stats?.pendingClaims ?? 0, icon: PendingIcon, color: '#F59E0B' },
        { label: 'Approved', value: stats?.approvedClaims ?? 0, icon: CheckCircleIcon, color: '#3B82F6' },
        { label: 'Rejected', value: stats?.rejectedClaims ?? 0, icon: CancelIcon, color: '#6B7280' },
        { label: 'Active Lost', value: stats?.activeLostItems ?? 0, icon: AssessmentIcon, color: '#8B5CF6' },
    ];

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>Lost & Found - Super Admin</Typography>
                <Typography variant="body2" color="text.secondary">Full platform control over lost & found items and claims</Typography>
            </Box>

            {/* Stats */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack spacing={0.5} alignItems="center">
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                            </Box>
                                            <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                                            <Typography variant="caption" color="text.secondary" textAlign="center">{stat.label}</Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            <Tabs value={mainTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
                <Tab label="Lost Items" />
                <Tab label="Found Items" />
                <Tab label="Pending Claims" />
                <Tab label="Approved Claims" />
                <Tab label="Rejected Claims" />
            </Tabs>

            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : isItems ? (
                        currentItems.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No items found</Typography></Box>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table>
                                        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell>Location</TableCell><TableCell>Status</TableCell><TableCell>Reporter</TableCell><TableCell>Date</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {currentItems.map((item) => {
                                                const type = mainTab === 0 ? 'LOST' as const : 'FOUND' as const;
                                                const dateVal = type === 'LOST' ? (item as LostItemResponse).dateLost : (item as FoundItemResponse).dateFound;
                                                return (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell>#{item.id}</TableCell>
                                                        <TableCell><Typography variant="body2" fontWeight={600}>{item.title}</Typography></TableCell>
                                                        <TableCell><Chip label={item.category} size="small" variant="outlined" /></TableCell>
                                                        <TableCell><Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>{item.location}</Typography></TableCell>
                                                        <TableCell><Chip label={item.active ? 'Active' : 'Resolved'} size="small" sx={{ bgcolor: alpha(item.active ? '#10B981' : '#6B7280', 0.1), color: item.active ? '#10B981' : '#6B7280', fontWeight: 600 }} /></TableCell>
                                                        <TableCell>{item.reportedByName}</TableCell>
                                                        <TableCell>{dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A'}</TableCell>
                                                        <TableCell align="right"><IconButton size="small" onClick={(e) => handleOpenMenu(e, item, type)}><MoreVertIcon /></IconButton></TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination component="div" count={mainTab === 0 ? totalLostItems : totalFoundItems} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
                            </>
                        )
                    ) : (
                        claims.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No claims in this category</Typography></Box>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table>
                                        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Claimant</TableCell><TableCell>Lost Item</TableCell><TableCell>Found Item</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {claims.map((claim) => {
                                                const sc = { PENDING: '#F59E0B', APPROVED: '#10B981', REJECTED: '#EF4444' }[claim.status];
                                                return (
                                                    <TableRow key={claim.id} hover>
                                                        <TableCell>#{claim.id}</TableCell>
                                                        <TableCell>{claim.claimantName}</TableCell>
                                                        <TableCell>{claim.lostItemTitle}</TableCell>
                                                        <TableCell>{claim.foundItemTitle}</TableCell>
                                                        <TableCell><Chip label={claim.status} size="small" sx={{ bgcolor: alpha(sc, 0.1), color: sc, fontWeight: 600 }} /></TableCell>
                                                        <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                                <IconButton size="small" onClick={() => { setClaimForView(claim); setClaimDetailOpen(true); }}><VisibilityIcon fontSize="small" /></IconButton>
                                                                {claim.status === 'PENDING' && (
                                                                    <>
                                                                        <Button size="small" variant="contained" onClick={() => handleApprove(claim.id)} disabled={isSubmitting} sx={{ minWidth: 0, px: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, fontSize: '0.7rem' }}>Approve</Button>
                                                                        <Button size="small" variant="contained" color="error" onClick={() => handleRejectOpen(claim.id)} disabled={isSubmitting} sx={{ minWidth: 0, px: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.7rem' }}>Reject</Button>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination component="div" count={totalClaims} page={page} rowsPerPage={pageSize} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
                            </>
                        )
                    )}
                </CardContent>
            </MotionCard>

            {/* Context Menu */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
                <MenuItem onClick={handleView}><ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon><ListItemText>View Details</ListItemText></MenuItem>
                <MenuItem onClick={handleDeactivate}><ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon><ListItemText>Deactivate</ListItemText></MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}><ListItemIcon><DeleteForeverIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>Permanently Delete</ListItemText></MenuItem>
            </Menu>

            {/* Dialogs */}
            <ItemDetailDialog open={detailOpen} onClose={() => { setDetailOpen(false); resetSelectedLost(); resetSelectedFound(); }} lostItem={detailType === 'LOST' ? selectedLostItem : undefined} foundItem={detailType === 'FOUND' ? selectedFoundItem : undefined} isLoading={isLostLoading || isFoundLoading} />
            <ClaimDetailDialog open={claimDetailOpen} onClose={() => { setClaimDetailOpen(false); setClaimForView(null); }} claim={claimForView} showActions isSubmitting={isSubmitting} onApprove={handleApprove} onReject={handleRejectOpen} />
            <RejectClaimDialog open={rejectOpen} onClose={() => setRejectOpen(false)} claimId={rejectClaimId} isSubmitting={isSubmitting} onReject={handleRejectConfirm} />

            <Dialog open={deactivateOpen} onClose={() => setDeactivateOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Deactivate Item</DialogTitle>
                <DialogContent><Typography>Mark &quot;{deactivateTarget?.title}&quot; as resolved/inactive?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeactivateOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirmDeactivate} disabled={isSubmitting}>Deactivate</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningAmberIcon color="error" />Permanent Delete</DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>This action is <strong>IRREVERSIBLE</strong>. The item and all associated data will be permanently removed.</Alert>
                    <Typography>Are you sure you want to permanently delete &quot;{deleteTarget?.title}&quot; (ID: {deleteTarget?.id})?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} startIcon={<DeleteForeverIcon />}>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Snackbar, Alert, CircularProgress, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, Typography, alpha, useTheme,
    Stack, Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { useBoardingHouse } from '@/hooks/useBoardingHouse';
import {
    BoardingHouseCommon,
    ListingsTable,
    ListingDetailDialog,
    CreateListingDialog,
    EditListingDialog,
    ImageManagementDialog,
    SearchFilterPanel,
} from '@/components/boardinghouse';
import type { BoardingHouseResponse, GenderPreference, CreateBoardingHouseRequest, UpdateBoardingHouseRequest } from '@/features/boardinghouse/types';

const MotionCard = motion.create(Card);
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SuperAdminBoardingPage() {
    const theme = useTheme();
    const {
        listings, totalListings, selectedListing, myListings, totalMyListings,
        listingImages, platformStats,
        isListingLoading, isMyListingsLoading, isImageLoading, isStatsLoading,
        isCreating, isUpdating, isDeleting, error, successMessage,
        loadListings, loadListingById, searchListings, filterAdvanced,
        createListing, updateListing, removeListing,
        loadMyListings, loadAllListingsAdmin,
        loadImages, uploadImages, setPrimaryImage, removeImage,
        adminUpdateListing, adminDeleteListing, permanentDeleteListing,
        loadPlatformStats,
        clearError, clearSuccess, resetSelectedListing, resetListingImages,
    } = useBoardingHouse();

    const [mainTab, setMainTab] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Dialogs
    const [detailOpen, setDetailOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editListing, setEditListing] = useState<BoardingHouseResponse | null>(null);
    const [imageOpen, setImageOpen] = useState(false);
    const [imageListing, setImageListing] = useState<BoardingHouseResponse | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteListing, setDeleteListing] = useState<BoardingHouseResponse | null>(null);
    const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
    const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<BoardingHouseResponse | null>(null);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [genderPref, setGenderPref] = useState<GenderPreference | ''>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Load initial data
    useEffect(() => {
        loadAllListingsAdmin({ page: 0, size: 10 });
        loadPlatformStats();
    }, [loadAllListingsAdmin, loadPlatformStats]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchListings({ keyword: searchQuery, page: 0, size: pageSize });
            } else if (mainTab === 0 && !city && !district && !genderPref && !minPrice && !maxPrice) {
                loadAllListingsAdmin({ page, size: pageSize });
            }
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Error/Success
    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setMainTab(newValue);
        setPage(0);
        setSearchQuery('');
        if (newValue === 0) loadAllListingsAdmin({ page: 0, size: pageSize });
        else loadMyListings({ page: 0, size: pageSize });
    };

    const currentListings = mainTab === 0 ? listings : myListings;
    const currentTotal = mainTab === 0 ? totalListings : totalMyListings;

    const handleFilter = useCallback(() => {
        filterAdvanced({
            city: city || undefined, district: district || undefined,
            genderPreference: genderPref || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            page: 0, size: pageSize, sortBy: 'price', sortDirection: 'ASC',
        });
        setPage(0);
    }, [city, district, genderPref, minPrice, maxPrice, pageSize, filterAdvanced]);

    const handleClearFilter = useCallback(() => {
        setSearchQuery(''); setCity(''); setDistrict(''); setGenderPref(''); setMinPrice(''); setMaxPrice('');
        setPage(0);
        loadAllListingsAdmin({ page: 0, size: pageSize });
    }, [loadAllListingsAdmin, pageSize]);

    const handleView = useCallback((listing: BoardingHouseResponse) => {
        loadListingById(listing.id);
        setDetailOpen(true);
    }, [loadListingById]);

    const handleEdit = useCallback((listing: BoardingHouseResponse) => {
        setEditListing(listing);
        setEditOpen(true);
    }, []);

    const handleManageImages = useCallback((listing: BoardingHouseResponse) => {
        setImageListing(listing);
        loadImages(listing.id);
        setImageOpen(true);
    }, [loadImages]);

    const handleDelete = useCallback((listing: BoardingHouseResponse) => {
        setDeleteListing(listing);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (deleteListing) {
            adminDeleteListing(deleteListing.id).then(() => {
                setDeleteConfirmOpen(false);
                setDeleteListing(null);
                loadAllListingsAdmin({ page, size: pageSize });
                loadPlatformStats();
            });
        }
    }, [deleteListing, adminDeleteListing, page, pageSize, loadAllListingsAdmin, loadPlatformStats]);

    const handlePermanentDelete = useCallback((listing: BoardingHouseResponse) => {
        setPermanentDeleteTarget(listing);
        setPermanentDeleteOpen(true);
    }, []);

    const handleConfirmPermanentDelete = useCallback(() => {
        if (permanentDeleteTarget) {
            permanentDeleteListing(permanentDeleteTarget.id).then(() => {
                setPermanentDeleteOpen(false);
                setPermanentDeleteTarget(null);
                loadAllListingsAdmin({ page, size: pageSize });
                loadPlatformStats();
            });
        }
    }, [permanentDeleteTarget, permanentDeleteListing, page, pageSize, loadAllListingsAdmin, loadPlatformStats]);

    const handleCreate = useCallback((data: CreateBoardingHouseRequest) => {
        createListing(data).then(() => {
            setCreateOpen(false);
            loadAllListingsAdmin({ page: 0, size: pageSize });
            loadPlatformStats();
        });
    }, [createListing, loadAllListingsAdmin, pageSize, loadPlatformStats]);

    const handleUpdate = useCallback((id: number, data: UpdateBoardingHouseRequest) => {
        adminUpdateListing(id, data).then(() => {
            setEditOpen(false);
            setEditListing(null);
            loadAllListingsAdmin({ page, size: pageSize });
        });
    }, [adminUpdateListing, page, pageSize, loadAllListingsAdmin]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (mainTab === 0) loadAllListingsAdmin({ page: newPage, size: pageSize });
        else loadMyListings({ page: newPage, size: pageSize });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize); setPage(0);
        if (mainTab === 0) loadAllListingsAdmin({ page: 0, size: newSize });
        else loadMyListings({ page: 0, size: newSize });
    };

    const handleRefresh = () => {
        handleClearFilter();
        loadPlatformStats();
    };

    const stats = [
        { label: 'Total Listings', value: platformStats?.totalListings ?? totalListings, icon: ApartmentIcon, color: '#3B82F6' },
        { label: 'Available', value: platformStats?.availableListings ?? 0, icon: CheckCircleIcon, color: '#10B981' },
        { label: 'Unavailable', value: platformStats?.unavailableListings ?? 0, icon: BlockIcon, color: '#6B7280' },
        { label: 'Male Only', value: platformStats?.maleOnlyListings ?? 0, icon: MaleIcon, color: '#3B82F6' },
        { label: 'Female Only', value: platformStats?.femaleOnlyListings ?? 0, icon: FemaleIcon, color: '#EC4899' },
        { label: 'Total Views', value: platformStats?.totalViews ?? 0, icon: VisibilityIcon, color: '#F59E0B' },
    ];

    return (
        <>
            <BoardingHouseCommon
                title="Boarding Houses - Super Admin"
                description="Full platform control over all boarding house listings"
                overviewStats={stats}
                mainTab={mainTab}
                onMainTabChange={handleTabChange}
                isLoading={isListingLoading || isStatsLoading}
                onRefresh={handleRefresh}
                tabLabels={['All Listings', 'My Listings']}
            >
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Create Listing</Button>
                </Box>

                {mainTab === 0 && (
                    <SearchFilterPanel
                        searchQuery={searchQuery} onSearchChange={setSearchQuery}
                        city={city} onCityChange={setCity} district={district} onDistrictChange={setDistrict}
                        genderPreference={genderPref} onGenderChange={setGenderPref}
                        minPrice={minPrice} onMinPriceChange={setMinPrice} maxPrice={maxPrice} onMaxPriceChange={setMaxPrice}
                        onFilter={handleFilter} onClear={handleClearFilter}
                    />
                )}

                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 0 }}>
                        {isListingLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                        ) : (
                            <>
                                <ListingsTable
                                    listings={currentListings} total={currentTotal}
                                    page={page} pageSize={pageSize}
                                    onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}
                                    onView={handleView} onEdit={handleEdit}
                                    onDelete={handleDelete} onManageImages={handleManageImages}
                                    showActions
                                />
                                {/* Permanent Delete Buttons in Table */}
                                {mainTab === 0 && currentListings.length > 0 && (
                                    <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            Super Admin: Select a listing above, then use permanent delete below
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {currentListings.map((listing) => (
                                                <Chip
                                                    key={listing.id}
                                                    label={`#${listing.id} ${listing.title.substring(0, 20)}...`}
                                                    size="small"
                                                    icon={<DeleteForeverIcon />}
                                                    onClick={() => handlePermanentDelete(listing)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        '&:hover': { bgcolor: alpha('#EF4444', 0.1), color: '#EF4444' },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </>
                        )}
                    </CardContent>
                </MotionCard>
            </BoardingHouseCommon>

            {/* Dialogs */}
            <ListingDetailDialog open={detailOpen} onClose={() => { setDetailOpen(false); resetSelectedListing(); }} listing={selectedListing} />
            <CreateListingDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} isCreating={isCreating} />
            <EditListingDialog open={editOpen} onClose={() => { setEditOpen(false); setEditListing(null); }} onSubmit={handleUpdate} listing={editListing} isUpdating={isUpdating} />

            {imageListing && (
                <ImageManagementDialog
                    open={imageOpen}
                    onClose={() => { setImageOpen(false); setImageListing(null); resetListingImages(); }}
                    houseId={imageListing.id}
                    images={listingImages} isLoading={isImageLoading}
                    onUpload={uploadImages} onSetPrimary={setPrimaryImage} onDeleteImage={removeImage}
                />
            )}

            {/* Soft Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Admin Delete</DialogTitle>
                <DialogContent>
                    <Typography>Soft-delete &quot;{deleteListing?.title}&quot;? The listing can be restored later.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Soft Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permanent Delete Confirmation */}
            <Dialog open={permanentDeleteOpen} onClose={() => setPermanentDeleteOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Permanent Delete
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        This action is <strong>IRREVERSIBLE</strong>. The listing, all images, and all associated data will be permanently removed from the database.
                    </Alert>
                    <Typography>
                        Are you absolutely sure you want to permanently delete &quot;{permanentDeleteTarget?.title}&quot; (ID: {permanentDeleteTarget?.id})?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPermanentDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmPermanentDelete} disabled={isDeleting} startIcon={<DeleteForeverIcon />}>
                        {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}

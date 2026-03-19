'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Snackbar, Alert, CircularProgress, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, Typography, alpha, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

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

export default function NonAcademicBoardingPage() {
    const theme = useTheme();
    const {
        listings, totalListings, selectedListing, myListings, totalMyListings,
        listingImages, isListingLoading, isMyListingsLoading, isImageLoading,
        isCreating, isUpdating, isDeleting, error, successMessage,
        loadListings, loadListingById, searchListings, filterAdvanced,
        createListing, updateListing, removeListing,
        loadMyListings, loadImages, uploadImages, setPrimaryImage, removeImage,
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

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [genderPref, setGenderPref] = useState<GenderPreference | ''>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Load initial data
    useEffect(() => {
        loadListings({ page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' });
        loadMyListings({ page: 0, size: 10 });
    }, [loadListings, loadMyListings]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchListings({ keyword: searchQuery, page: 0, size: pageSize });
            } else if (mainTab === 0 && !city && !district && !genderPref && !minPrice && !maxPrice) {
                loadListings({ page, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
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
        if (newValue === 0) loadListings({ page: 0, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
        else loadMyListings({ page: 0, size: pageSize });
    };

    const currentListings = mainTab === 0 ? listings : myListings;
    const currentTotal = mainTab === 0 ? totalListings : totalMyListings;

    const handleFilter = useCallback(() => {
        filterAdvanced({
            city: city || undefined,
            district: district || undefined,
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
        loadListings({ page: 0, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
    }, [loadListings, pageSize]);

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
            removeListing(deleteListing.id).then(() => {
                setDeleteConfirmOpen(false);
                setDeleteListing(null);
                if (mainTab === 0) loadListings({ page, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
                else loadMyListings({ page, size: pageSize });
            });
        }
    }, [deleteListing, removeListing, mainTab, page, pageSize, loadListings, loadMyListings]);

    const handleCreate = useCallback((data: CreateBoardingHouseRequest) => {
        createListing(data).then(() => {
            setCreateOpen(false);
            loadMyListings({ page: 0, size: pageSize });
            setMainTab(1);
        });
    }, [createListing, loadMyListings, pageSize]);

    const handleUpdate = useCallback((id: number, data: UpdateBoardingHouseRequest) => {
        updateListing(id, data).then(() => {
            setEditOpen(false);
            setEditListing(null);
            if (mainTab === 0) loadListings({ page, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
            else loadMyListings({ page, size: pageSize });
        });
    }, [updateListing, mainTab, page, pageSize, loadListings, loadMyListings]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (mainTab === 0) loadListings({ page: newPage, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
        else loadMyListings({ page: newPage, size: pageSize });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(0);
        if (mainTab === 0) loadListings({ page: 0, size: newSize, sortBy: 'createdAt', sortDirection: 'DESC' });
        else loadMyListings({ page: 0, size: newSize });
    };

    const handleRefresh = () => {
        handleClearFilter();
        loadMyListings({ page: 0, size: pageSize });
    };

    const stats = [
        { label: 'All Listings', value: totalListings, icon: ApartmentIcon, color: '#3B82F6' },
        { label: 'My Listings', value: totalMyListings, icon: ListAltIcon, color: '#8B5CF6' },
        { label: 'Available', value: listings.filter((l) => l.isAvailable).length, icon: CheckCircleIcon, color: '#10B981' },
        { label: 'Male Only', value: listings.filter((l) => l.genderPreference === 'MALE').length, icon: MaleIcon, color: '#3B82F6' },
        { label: 'Female Only', value: listings.filter((l) => l.genderPreference === 'FEMALE').length, icon: FemaleIcon, color: '#EC4899' },
        { label: 'Total Views', value: listings.reduce((sum, l) => sum + l.viewCount, 0), icon: VisibilityIcon, color: '#F59E0B' },
    ];

    return (
        <>
            <BoardingHouseCommon
                title="Boarding House Management"
                description="Create and manage boarding house listings"
                overviewStats={stats}
                mainTab={mainTab}
                onMainTabChange={handleTabChange}
                isLoading={isListingLoading || isMyListingsLoading}
                onRefresh={handleRefresh}
                tabLabels={['All Listings', 'My Listings']}
            >
                {/* Actions Bar */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                        Create Listing
                    </Button>
                </Box>

                {mainTab === 0 && (
                    <SearchFilterPanel
                        searchQuery={searchQuery} onSearchChange={setSearchQuery}
                        city={city} onCityChange={setCity}
                        district={district} onDistrictChange={setDistrict}
                        genderPreference={genderPref} onGenderChange={setGenderPref}
                        minPrice={minPrice} onMinPriceChange={setMinPrice}
                        maxPrice={maxPrice} onMaxPriceChange={setMaxPrice}
                        onFilter={handleFilter} onClear={handleClearFilter}
                    />
                )}

                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 0 }}>
                        {(isListingLoading || isMyListingsLoading) ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                        ) : (
                            <ListingsTable
                                listings={currentListings}
                                total={currentTotal}
                                page={page}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onManageImages={handleManageImages}
                                showActions
                            />
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
                    images={listingImages}
                    isLoading={isImageLoading}
                    onUpload={uploadImages}
                    onSetPrimary={setPrimaryImage}
                    onDeleteImage={removeImage}
                />
            )}

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete &quot;{deleteListing?.title}&quot;? This will soft-delete the listing.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}

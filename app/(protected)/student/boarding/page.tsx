'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Snackbar, Alert, CircularProgress,
    alpha, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import PeopleIcon from '@mui/icons-material/People';

import { useBoardingHouse } from '@/hooks/useBoardingHouse';
import {
    BoardingHouseCommon,
    ListingsTable,
    ListingDetailDialog,
    SearchFilterPanel,
} from '@/components/boardinghouse';
import type { BoardingHouseResponse, GenderPreference } from '@/features/boardinghouse/types';

const MotionCard = motion.create(Card);
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StudentBoardingPage() {
    const theme = useTheme();
    const {
        listings, totalListings, selectedListing,
        isListingLoading, error, successMessage,
        loadListings, loadListingById, searchListings, filterAdvanced,
        clearError, clearSuccess, resetSelectedListing,
    } = useBoardingHouse();

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [detailOpen, setDetailOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [genderPref, setGenderPref] = useState<GenderPreference | ''>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Load initial data
    useEffect(() => {
        loadListings({ page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' });
    }, [loadListings]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchListings({ keyword: searchQuery, page: 0, size: pageSize });
            } else if (!city && !district && !genderPref && !minPrice && !maxPrice) {
                loadListings({ page, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
            }
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Error/Success handling
    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const handleFilter = useCallback(() => {
        filterAdvanced({
            city: city || undefined,
            district: district || undefined,
            genderPreference: genderPref || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            page: 0,
            size: pageSize,
            sortBy: 'price',
            sortDirection: 'ASC',
        });
        setPage(0);
    }, [city, district, genderPref, minPrice, maxPrice, pageSize, filterAdvanced]);

    const handleClearFilter = useCallback(() => {
        setSearchQuery('');
        setCity('');
        setDistrict('');
        setGenderPref('');
        setMinPrice('');
        setMaxPrice('');
        setPage(0);
        loadListings({ page: 0, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
    }, [loadListings, pageSize]);

    const handleView = useCallback((listing: BoardingHouseResponse) => {
        loadListingById(listing.id);
        setDetailOpen(true);
    }, [loadListingById]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadListings({ page: newPage, size: pageSize, sortBy: 'createdAt', sortDirection: 'DESC' });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(0);
        loadListings({ page: 0, size: newSize, sortBy: 'createdAt', sortDirection: 'DESC' });
    };

    const handleRefresh = () => handleClearFilter();

    const stats = [
        { label: 'Total Listings', value: totalListings, icon: ApartmentIcon, color: '#3B82F6' },
        { label: 'Available', value: listings.filter((l) => l.isAvailable).length, icon: CheckCircleIcon, color: '#10B981' },
        { label: 'Male Only', value: listings.filter((l) => l.genderPreference === 'MALE').length, icon: MaleIcon, color: '#3B82F6' },
        { label: 'Female Only', value: listings.filter((l) => l.genderPreference === 'FEMALE').length, icon: FemaleIcon, color: '#EC4899' },
        { label: 'Any Gender', value: listings.filter((l) => l.genderPreference === 'ANY').length, icon: PeopleIcon, color: '#8B5CF6' },
        { label: 'Total Views', value: listings.reduce((sum, l) => sum + l.viewCount, 0), icon: VisibilityIcon, color: '#F59E0B' },
    ];

    return (
        <>
            <BoardingHouseCommon
                title="Boarding Houses"
                description="Browse available boarding house listings near your campus"
                overviewStats={stats}
                mainTab={0}
                onMainTabChange={() => {}}
                isLoading={isListingLoading}
                onRefresh={handleRefresh}
                showTabs={false}
            >
                <SearchFilterPanel
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    city={city}
                    onCityChange={setCity}
                    district={district}
                    onDistrictChange={setDistrict}
                    genderPreference={genderPref}
                    onGenderChange={setGenderPref}
                    minPrice={minPrice}
                    onMinPriceChange={setMinPrice}
                    maxPrice={maxPrice}
                    onMaxPriceChange={setMaxPrice}
                    onFilter={handleFilter}
                    onClear={handleClearFilter}
                />

                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 0 }}>
                        {isListingLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <ListingsTable
                                listings={listings}
                                total={totalListings}
                                page={page}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                onView={handleView}
                            />
                        )}
                    </CardContent>
                </MotionCard>
            </BoardingHouseCommon>

            <ListingDetailDialog
                open={detailOpen}
                onClose={() => { setDetailOpen(false); resetSelectedListing(); }}
                listing={selectedListing}
                isLoading={isListingLoading}
            />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}

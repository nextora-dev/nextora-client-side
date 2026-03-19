/**
 * @fileoverview Boarding House Custom Hook
 * @description Reusable hook for boarding house module state and actions
 */
'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    selectListings,
    selectSelectedListing,
    selectTotalListings,
    selectTotalPages,
    selectMyListings,
    selectTotalMyListings,
    selectListingImages,
    selectBoardingHouseStats,
    selectBoardingHouseIsLoading,
    selectMyListingsIsLoading,
    selectImageIsLoading,
    selectStatsIsLoading,
    selectBoardingHouseIsCreating,
    selectBoardingHouseIsUpdating,
    selectBoardingHouseIsDeleting,
    selectBoardingHouseError,
    selectBoardingHouseSuccessMessage,
    fetchListings,
    fetchListingById,
    searchListingsAsync,
    filterListingsAsync,
    filterByCityAsync,
    filterByDistrictAsync,
    fetchListingImages,
    createListingAsync,
    updateListingAsync,
    deleteListingAsync,
    fetchMyListings,
    fetchAllListingsAdmin,
    uploadImagesAsync,
    setPrimaryImageAsync,
    deleteImageAsync,
    adminUpdateListingAsync,
    adminDeleteListingAsync,
    permanentDeleteListingAsync,
    fetchPlatformStats,
    clearBoardingHouseError,
    clearBoardingHouseSuccessMessage,
    clearSelectedListing,
    clearMyListings,
    clearListingImages,
    clearPlatformStats,
} from '@/features/boardinghouse/boardingHouseSlice';
import type {
    BoardingHousePaginationParams,
    BoardingHouseSearchParams,
    BoardingHouseFilterParams,
    CreateBoardingHouseRequest,
    UpdateBoardingHouseRequest,
} from '@/features/boardinghouse/types';

export function useBoardingHouse() {
    const dispatch = useAppDispatch();

    // ---- Selectors ----
    const listings = useAppSelector(selectListings);
    const selectedListing = useAppSelector(selectSelectedListing);
    const totalListings = useAppSelector(selectTotalListings);
    const totalPages = useAppSelector(selectTotalPages);
    const myListings = useAppSelector(selectMyListings);
    const totalMyListings = useAppSelector(selectTotalMyListings);
    const listingImages = useAppSelector(selectListingImages);
    const platformStats = useAppSelector(selectBoardingHouseStats);

    // Loading
    const isListingLoading = useAppSelector(selectBoardingHouseIsLoading);
    const isMyListingsLoading = useAppSelector(selectMyListingsIsLoading);
    const isImageLoading = useAppSelector(selectImageIsLoading);
    const isStatsLoading = useAppSelector(selectStatsIsLoading);
    const isCreating = useAppSelector(selectBoardingHouseIsCreating);
    const isUpdating = useAppSelector(selectBoardingHouseIsUpdating);
    const isDeleting = useAppSelector(selectBoardingHouseIsDeleting);
    const error = useAppSelector(selectBoardingHouseError);
    const successMessage = useAppSelector(selectBoardingHouseSuccessMessage);

    // ---- Browse & Search ----
    const loadListings = useCallback((params: BoardingHousePaginationParams = {}) => dispatch(fetchListings(params)), [dispatch]);
    const loadListingById = useCallback((id: number) => dispatch(fetchListingById(id)), [dispatch]);
    const searchListings = useCallback((params: BoardingHouseSearchParams) => dispatch(searchListingsAsync(params)), [dispatch]);
    const filterAdvanced = useCallback((params: BoardingHouseFilterParams) => dispatch(filterListingsAsync(params)), [dispatch]);
    const filterByCity = useCallback(
        (city: string, params?: BoardingHousePaginationParams) => dispatch(filterByCityAsync({ city, ...params })),
        [dispatch],
    );
    const filterByDistrict = useCallback(
        (district: string, params?: BoardingHousePaginationParams) => dispatch(filterByDistrictAsync({ district, ...params })),
        [dispatch],
    );
    const loadImages = useCallback((houseId: number) => dispatch(fetchListingImages(houseId)), [dispatch]);

    // ---- CRUD ----
    const createListing = useCallback((data: CreateBoardingHouseRequest) => dispatch(createListingAsync(data)), [dispatch]);
    const updateListing = useCallback(
        (id: number, data: UpdateBoardingHouseRequest) => dispatch(updateListingAsync({ id, data })),
        [dispatch],
    );
    const removeListing = useCallback((id: number) => dispatch(deleteListingAsync(id)), [dispatch]);
    const loadMyListings = useCallback((params: BoardingHousePaginationParams = {}) => dispatch(fetchMyListings(params)), [dispatch]);
    const loadAllListingsAdmin = useCallback((params: BoardingHousePaginationParams = {}) => dispatch(fetchAllListingsAdmin(params)), [dispatch]);

    // ---- Image Management ----
    const uploadImages = useCallback(
        (houseId: number, files: File[]) => dispatch(uploadImagesAsync({ houseId, files })),
        [dispatch],
    );
    const setPrimaryImage = useCallback(
        (houseId: number, imageId: number) => dispatch(setPrimaryImageAsync({ houseId, imageId })),
        [dispatch],
    );
    const removeImage = useCallback(
        (houseId: number, imageId: number) => dispatch(deleteImageAsync({ houseId, imageId })),
        [dispatch],
    );

    // ---- Admin ----
    const adminUpdateListing = useCallback(
        (id: number, data: UpdateBoardingHouseRequest) => dispatch(adminUpdateListingAsync({ id, data })),
        [dispatch],
    );
    const adminDeleteListing = useCallback((id: number) => dispatch(adminDeleteListingAsync(id)), [dispatch]);
    const permanentDeleteListing = useCallback((id: number) => dispatch(permanentDeleteListingAsync(id)), [dispatch]);
    const loadPlatformStats = useCallback(() => dispatch(fetchPlatformStats()), [dispatch]);

    // ---- Utility ----
    const clearError = useCallback(() => dispatch(clearBoardingHouseError()), [dispatch]);
    const clearSuccess = useCallback(() => dispatch(clearBoardingHouseSuccessMessage()), [dispatch]);
    const resetSelectedListing = useCallback(() => dispatch(clearSelectedListing()), [dispatch]);
    const resetMyListings = useCallback(() => dispatch(clearMyListings()), [dispatch]);
    const resetListingImages = useCallback(() => dispatch(clearListingImages()), [dispatch]);
    const resetPlatformStats = useCallback(() => dispatch(clearPlatformStats()), [dispatch]);

    return {
        // State
        listings,
        selectedListing,
        totalListings,
        totalPages,
        myListings,
        totalMyListings,
        listingImages,
        platformStats,

        // Loading
        isListingLoading,
        isMyListingsLoading,
        isImageLoading,
        isStatsLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        successMessage,

        // Browse & Search
        loadListings,
        loadListingById,
        searchListings,
        filterAdvanced,
        filterByCity,
        filterByDistrict,
        loadImages,

        // CRUD
        createListing,
        updateListing,
        removeListing,
        loadMyListings,
        loadAllListingsAdmin,

        // Image Management
        uploadImages,
        setPrimaryImage,
        removeImage,

        // Admin
        adminUpdateListing,
        adminDeleteListing,
        permanentDeleteListing,
        loadPlatformStats,

        // Utility
        clearError,
        clearSuccess,
        resetSelectedListing,
        resetMyListings,
        resetListingImages,
        resetPlatformStats,
    };
}

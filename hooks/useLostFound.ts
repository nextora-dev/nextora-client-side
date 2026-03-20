/**
 * @fileoverview Lost & Found Custom Hook
 * @description Reusable hook for lost & found module state and actions
 */
'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    selectLostItems, selectSelectedLostItem, selectTotalLostItems,
    selectFoundItems, selectSelectedFoundItem, selectTotalFoundItems,
    selectItemImages, selectMatches,
    selectClaims, selectMyClaims, selectSelectedClaim, selectTotalClaims, selectTotalMyClaims,
    selectCategories, selectLostFoundStats,
    selectIsLostLoading, selectIsFoundLoading, selectIsClaimLoading,
    selectIsImageLoading, selectIsMatchLoading, selectIsStatsLoading,
    selectIsSubmitting, selectIsDeleting,
    selectLostFoundError, selectLostFoundSuccess,
    fetchCategories,
    reportLostItemAsync, fetchLostItemById, updateLostItemAsync,
    searchLostItemsAsync, deleteLostItemAsync, findLostMatchesAsync,
    uploadLostImagesAsync, fetchLostItemImagesAsync, deleteImageAsync,
    reportFoundItemAsync, fetchFoundItemById, updateFoundItemAsync,
    searchFoundItemsAsync, deleteFoundItemAsync, findFoundMatchesAsync,
    uploadFoundImagesAsync, fetchFoundItemImagesAsync,
    submitClaimAsync, fetchClaimById, fetchMyClaimsAsync,
    fetchClaimsByStatusAsync, approveClaimAsync, rejectClaimAsync,
    fetchAdminStats, adminUpdateLostAsync, adminDeleteLostAsync,
    adminUpdateFoundAsync, adminDeleteFoundAsync,
    clearLostFoundError, clearLostFoundSuccess,
    clearSelectedLostItem, clearSelectedFoundItem, clearSelectedClaim,
    clearItemImages, clearMatches, clearStats,
} from '@/features/lostfound/lostFoundSlice';
import type {
    LostFoundPaginationParams, LostFoundSearchParams,
    ReportLostItemRequest, UpdateLostItemRequest,
    ReportFoundItemRequest, UpdateFoundItemRequest,
    SubmitClaimRequest, AdminUpdateLostItemRequest, AdminUpdateFoundItemRequest,
} from '@/features/lostfound/types';

export function useLostFound() {
    const dispatch = useAppDispatch();

    // ── Selectors ──
    const lostItems = useAppSelector(selectLostItems);
    const selectedLostItem = useAppSelector(selectSelectedLostItem);
    const totalLostItems = useAppSelector(selectTotalLostItems);
    const foundItems = useAppSelector(selectFoundItems);
    const selectedFoundItem = useAppSelector(selectSelectedFoundItem);
    const totalFoundItems = useAppSelector(selectTotalFoundItems);
    const itemImages = useAppSelector(selectItemImages);
    const matches = useAppSelector(selectMatches);
    const claims = useAppSelector(selectClaims);
    const myClaims = useAppSelector(selectMyClaims);
    const selectedClaim = useAppSelector(selectSelectedClaim);
    const totalClaims = useAppSelector(selectTotalClaims);
    const totalMyClaims = useAppSelector(selectTotalMyClaims);
    const categories = useAppSelector(selectCategories);
    const stats = useAppSelector(selectLostFoundStats);

    const isLostLoading = useAppSelector(selectIsLostLoading);
    const isFoundLoading = useAppSelector(selectIsFoundLoading);
    const isClaimLoading = useAppSelector(selectIsClaimLoading);
    const isImageLoading = useAppSelector(selectIsImageLoading);
    const isMatchLoading = useAppSelector(selectIsMatchLoading);
    const isStatsLoading = useAppSelector(selectIsStatsLoading);
    const isSubmitting = useAppSelector(selectIsSubmitting);
    const isDeleting = useAppSelector(selectIsDeleting);
    const error = useAppSelector(selectLostFoundError);
    const successMessage = useAppSelector(selectLostFoundSuccess);

    // ── Categories ──
    const loadCategories = useCallback(() => dispatch(fetchCategories()), [dispatch]);

    // ── Lost Items ──
    const reportLostItem = useCallback((data: ReportLostItemRequest) => dispatch(reportLostItemAsync(data)), [dispatch]);
    const loadLostItemById = useCallback((id: number) => dispatch(fetchLostItemById(id)), [dispatch]);
    const updateLostItem = useCallback((id: number, data: UpdateLostItemRequest) => dispatch(updateLostItemAsync({ id, data })), [dispatch]);
    const searchLostItems = useCallback((params: LostFoundSearchParams) => dispatch(searchLostItemsAsync(params)), [dispatch]);
    const removeLostItem = useCallback((id: number) => dispatch(deleteLostItemAsync(id)), [dispatch]);
    const findLostMatches = useCallback((id: number) => dispatch(findLostMatchesAsync(id)), [dispatch]);

    // ── Lost Images ──
    const uploadLostImages = useCallback((itemId: number, files: File[]) => dispatch(uploadLostImagesAsync({ itemId, files })), [dispatch]);
    const loadLostImages = useCallback((itemId: number) => dispatch(fetchLostItemImagesAsync(itemId)), [dispatch]);
    const removeImage = useCallback((imageId: number) => dispatch(deleteImageAsync(imageId)), [dispatch]);

    // ── Found Items ──
    const reportFoundItem = useCallback((data: ReportFoundItemRequest) => dispatch(reportFoundItemAsync(data)), [dispatch]);
    const loadFoundItemById = useCallback((id: number) => dispatch(fetchFoundItemById(id)), [dispatch]);
    const updateFoundItem = useCallback((id: number, data: UpdateFoundItemRequest) => dispatch(updateFoundItemAsync({ id, data })), [dispatch]);
    const searchFoundItems = useCallback((params: LostFoundSearchParams) => dispatch(searchFoundItemsAsync(params)), [dispatch]);
    const removeFoundItem = useCallback((id: number) => dispatch(deleteFoundItemAsync(id)), [dispatch]);
    const findFoundMatches = useCallback((id: number) => dispatch(findFoundMatchesAsync(id)), [dispatch]);

    // ── Found Images ──
    const uploadFoundImages = useCallback((itemId: number, files: File[]) => dispatch(uploadFoundImagesAsync({ itemId, files })), [dispatch]);
    const loadFoundImages = useCallback((itemId: number) => dispatch(fetchFoundItemImagesAsync(itemId)), [dispatch]);

    // ── Claims ──
    const submitClaim = useCallback((data: SubmitClaimRequest) => dispatch(submitClaimAsync(data)), [dispatch]);
    const loadClaimById = useCallback((id: number) => dispatch(fetchClaimById(id)), [dispatch]);
    const loadMyClaims = useCallback((params: LostFoundPaginationParams = {}) => dispatch(fetchMyClaimsAsync(params)), [dispatch]);
    const loadClaimsByStatus = useCallback(
        (status: string, params?: LostFoundPaginationParams) => dispatch(fetchClaimsByStatusAsync({ status, ...params })),
        [dispatch],
    );
    const approveClaim = useCallback((id: number) => dispatch(approveClaimAsync(id)), [dispatch]);
    const rejectClaim = useCallback((id: number, reason: string) => dispatch(rejectClaimAsync({ id, reason })), [dispatch]);

    // ── Admin ──
    const loadAdminStats = useCallback(() => dispatch(fetchAdminStats()), [dispatch]);
    const adminUpdateLost = useCallback(
        (id: number, data: AdminUpdateLostItemRequest) => dispatch(adminUpdateLostAsync({ id, data })),
        [dispatch],
    );
    const adminDeleteLost = useCallback((id: number) => dispatch(adminDeleteLostAsync(id)), [dispatch]);
    const adminUpdateFound = useCallback(
        (id: number, data: AdminUpdateFoundItemRequest) => dispatch(adminUpdateFoundAsync({ id, data })),
        [dispatch],
    );
    const adminDeleteFound = useCallback((id: number) => dispatch(adminDeleteFoundAsync(id)), [dispatch]);

    // ── Utility ──
    const clearError = useCallback(() => dispatch(clearLostFoundError()), [dispatch]);
    const clearSuccess = useCallback(() => dispatch(clearLostFoundSuccess()), [dispatch]);
    const resetSelectedLost = useCallback(() => dispatch(clearSelectedLostItem()), [dispatch]);
    const resetSelectedFound = useCallback(() => dispatch(clearSelectedFoundItem()), [dispatch]);
    const resetSelectedClaim = useCallback(() => dispatch(clearSelectedClaim()), [dispatch]);
    const resetImages = useCallback(() => dispatch(clearItemImages()), [dispatch]);
    const resetMatches = useCallback(() => dispatch(clearMatches()), [dispatch]);
    const resetStats = useCallback(() => dispatch(clearStats()), [dispatch]);

    return {
        // State
        lostItems, selectedLostItem, totalLostItems,
        foundItems, selectedFoundItem, totalFoundItems,
        itemImages, matches,
        claims, myClaims, selectedClaim, totalClaims, totalMyClaims,
        categories, stats,

        // Loading
        isLostLoading, isFoundLoading, isClaimLoading,
        isImageLoading, isMatchLoading, isStatsLoading,
        isSubmitting, isDeleting, error, successMessage,

        // Categories
        loadCategories,

        // Lost Items
        reportLostItem, loadLostItemById, updateLostItem,
        searchLostItems, removeLostItem, findLostMatches,

        // Lost Images
        uploadLostImages, loadLostImages, removeImage,

        // Found Items
        reportFoundItem, loadFoundItemById, updateFoundItem,
        searchFoundItems, removeFoundItem, findFoundMatches,

        // Found Images
        uploadFoundImages, loadFoundImages,

        // Claims
        submitClaim, loadClaimById, loadMyClaims,
        loadClaimsByStatus, approveClaim, rejectClaim,

        // Admin
        loadAdminStats, adminUpdateLost, adminDeleteLost,
        adminUpdateFound, adminDeleteFound,

        // Utility
        clearError, clearSuccess,
        resetSelectedLost, resetSelectedFound, resetSelectedClaim,
        resetImages, resetMatches, resetStats,
    };
}

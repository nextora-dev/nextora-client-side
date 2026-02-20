/**
 * @fileoverview Kuppi Reviews Hook
 * @description Custom hook for managing Kuppi session reviews
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    // Thunks
    fetchMyReviews,
    fetchSessionReviews,
    fetchTutorReviews,
    fetchMyHostedReviews,
    createReviewAsync,
    updateReviewAsync,
    deleteReviewAsync,
    addTutorResponseAsync,
    adminFetchAllReviews,
    adminDeleteReviewAsync,
    // Selectors
    selectKuppiMyReviews,
    selectKuppiMyHostedReviews,
    selectKuppiSessionReviews,
    selectKuppiTutorReviews,
    selectKuppiReviews,
    selectKuppiTotalReviews,
    selectKuppiIsReviewsLoading,
    selectKuppiIsReviewCreating,
    selectKuppiIsReviewUpdating,
    selectKuppiError,
    selectKuppiSuccessMessage,
    // Actions
    clearKuppiSessionReviews,
    clearKuppiError,
    clearKuppiSuccessMessage,
    // Types
    KuppiReviewResponse,
    CreateKuppiReviewRequest,
    UpdateKuppiReviewRequest,
    KuppiPaginationParams,
} from '@/features/kuppi';

interface UseKuppiReviewsOptions {
    autoFetch?: boolean;
    type?: 'my' | 'session' | 'tutor' | 'hosted' | 'admin';
    sessionId?: number;
    tutorId?: number;
}

export function useKuppiReviews(options: UseKuppiReviewsOptions = {}) {
    const { autoFetch = false, type = 'my', sessionId, tutorId } = options;
    const dispatch = useAppDispatch();

    // Selectors
    const myReviews = useAppSelector(selectKuppiMyReviews);
    const myHostedReviews = useAppSelector(selectKuppiMyHostedReviews);
    const sessionReviews = useAppSelector(selectKuppiSessionReviews);
    const tutorReviews = useAppSelector(selectKuppiTutorReviews);
    const allReviews = useAppSelector(selectKuppiReviews);
    const totalReviews = useAppSelector(selectKuppiTotalReviews);
    const isLoading = useAppSelector(selectKuppiIsReviewsLoading);
    const isCreating = useAppSelector(selectKuppiIsReviewCreating);
    const isUpdating = useAppSelector(selectKuppiIsReviewUpdating);
    const error = useAppSelector(selectKuppiError);
    const successMessage = useAppSelector(selectKuppiSuccessMessage);

    // Local state
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Get current reviews based on type
    const reviews = (() => {
        switch (type) {
            case 'my':
                return myReviews;
            case 'session':
                return sessionReviews;
            case 'tutor':
                return tutorReviews;
            case 'hosted':
                return myHostedReviews;
            case 'admin':
                return allReviews;
            default:
                return myReviews;
        }
    })();

    // Fetch functions
    const fetchReviews = useCallback(
        (params: KuppiPaginationParams = {}) => {
            const fetchParams = { page: params.page ?? page, size: params.size ?? pageSize, ...params };

            switch (type) {
                case 'my':
                    return dispatch(fetchMyReviews(fetchParams));
                case 'session':
                    if (sessionId) {
                        return dispatch(fetchSessionReviews({ sessionId, params: fetchParams }));
                    }
                    break;
                case 'tutor':
                    if (tutorId) {
                        return dispatch(fetchTutorReviews({ tutorId, params: fetchParams }));
                    }
                    break;
                case 'hosted':
                    return dispatch(fetchMyHostedReviews(fetchParams));
                case 'admin':
                    return dispatch(adminFetchAllReviews(fetchParams));
            }
        },
        [dispatch, type, sessionId, tutorId, page, pageSize]
    );

    // Auto fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchReviews();
        }
    }, [autoFetch, fetchReviews]);

    // CRUD operations
    const createReview = useCallback(
        async (data: CreateKuppiReviewRequest) => {
            const result = await dispatch(createReviewAsync(data));
            if (createReviewAsync.fulfilled.match(result)) {
                fetchReviews();
            }
            return result;
        },
        [dispatch, fetchReviews]
    );

    const updateReview = useCallback(
        async (reviewId: number, data: UpdateKuppiReviewRequest) => {
            const result = await dispatch(updateReviewAsync({ reviewId, data }));
            if (updateReviewAsync.fulfilled.match(result)) {
                fetchReviews();
            }
            return result;
        },
        [dispatch, fetchReviews]
    );

    const deleteReview = useCallback(
        async (reviewId: number) => {
            const result = await dispatch(deleteReviewAsync(reviewId));
            if (deleteReviewAsync.fulfilled.match(result)) {
                fetchReviews();
            }
            return result;
        },
        [dispatch, fetchReviews]
    );

    const addResponse = useCallback(
        async (reviewId: number, responseText: string) => {
            const result = await dispatch(addTutorResponseAsync({ reviewId, data: { responseText } }));
            if (addTutorResponseAsync.fulfilled.match(result)) {
                fetchReviews();
            }
            return result;
        },
        [dispatch, fetchReviews]
    );

    const adminDeleteReview = useCallback(
        async (reviewId: number) => {
            const result = await dispatch(adminDeleteReviewAsync(reviewId));
            if (adminDeleteReviewAsync.fulfilled.match(result)) {
                fetchReviews();
            }
            return result;
        },
        [dispatch, fetchReviews]
    );

    // Utility functions
    const clearReviews = useCallback(() => {
        dispatch(clearKuppiSessionReviews());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearKuppiError());
    }, [dispatch]);

    const clearSuccess = useCallback(() => {
        dispatch(clearKuppiSuccessMessage());
    }, [dispatch]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize);
        setPage(0);
    }, []);

    // Calculate stats
    const stats = {
        total: totalReviews,
        averageRating: reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0,
        withResponses: reviews.filter((r) => r.tutorResponse).length,
        pendingResponses: reviews.filter((r) => !r.tutorResponse).length,
    };

    return {
        // Data
        reviews,
        totalReviews,
        stats,
        // Pagination
        page,
        pageSize,
        totalPages: Math.ceil(totalReviews / pageSize),
        // Loading states
        isLoading,
        isCreating,
        isUpdating,
        // Messages
        error,
        successMessage,
        // Actions
        fetchReviews,
        createReview,
        updateReview,
        deleteReview,
        addResponse,
        adminDeleteReview,
        // Utilities
        clearReviews,
        clearError,
        clearSuccess,
        handlePageChange,
        handlePageSizeChange,
    };
}

export default useKuppiReviews;


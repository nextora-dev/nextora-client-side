/**
 * @fileoverview Meeting Custom Hook
 * @description Reusable hook for meeting module state and actions
 */
'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    selectMeetings, selectSelectedMeeting, selectTotalMeetings, selectTotalPages,
    selectMyRequests, selectTotalMyRequests,
    selectPendingRequests, selectTotalPending, selectPendingCount,
    selectUpcomingMeetings, selectCalendarMeetings,
    selectLecturerStatistics, selectPlatformStatistics,
    selectIsMeetingLoading, selectIsRequestLoading, selectIsStatsLoading,
    selectIsSubmitting, selectIsActionLoading,
    selectMeetingError, selectMeetingSuccess,
    fetchMeetingById, createMeetingAsync, fetchMyRequests, fetchMyMeetingsByStatus,
    fetchMyUpcoming, searchMyMeetingsAsync, cancelMeetingAsync, submitFeedbackAsync,
    fetchLecturerPending, fetchLecturerPendingCount, fetchLecturerAll,
    fetchLecturerUpcoming, fetchLecturerCalendar, searchLecturerMeetingsAsync,
    fetchLecturerStatistics, fetchLecturerHighPriority, fetchLecturerFollowUp,
    fetchLecturerByStatus, acceptMeetingAsync, rejectMeetingAsync,
    rescheduleMeetingAsync, lecturerCancelAsync, addNotesAsync,
    startMeetingAsync, completeMeetingAsync, uploadProfileImageAsync,
    fetchAdminAllMeetings, adminForceCancelAsync, adminPermanentDeleteAsync,
    fetchPlatformStatistics, fetchLecturerStatsAdmin,
    clearMeetingError, clearMeetingSuccess, clearSelectedMeeting,
    clearCalendarMeetings, clearStatistics,
} from '@/features/meeting/meetingSlice';
import type {
    CreateMeetingRequest, AcceptMeetingRequest, RejectMeetingRequest,
    RescheduleMeetingRequest, SubmitFeedbackRequest,
    MeetingPaginationParams, MeetingSearchParams, CalendarParams,
} from '@/features/meeting/types';

export function useMeeting() {
    const dispatch = useAppDispatch();

    // ── Selectors ──
    const meetings = useAppSelector(selectMeetings);
    const selectedMeeting = useAppSelector(selectSelectedMeeting);
    const totalMeetings = useAppSelector(selectTotalMeetings);
    const totalPages = useAppSelector(selectTotalPages);
    const myRequests = useAppSelector(selectMyRequests);
    const totalMyRequests = useAppSelector(selectTotalMyRequests);
    const pendingRequests = useAppSelector(selectPendingRequests);
    const totalPending = useAppSelector(selectTotalPending);
    const pendingCount = useAppSelector(selectPendingCount);
    const upcomingMeetings = useAppSelector(selectUpcomingMeetings);
    const calendarMeetings = useAppSelector(selectCalendarMeetings);
    const lecturerStatistics = useAppSelector(selectLecturerStatistics);
    const platformStatistics = useAppSelector(selectPlatformStatistics);
    const isMeetingLoading = useAppSelector(selectIsMeetingLoading);
    const isRequestLoading = useAppSelector(selectIsRequestLoading);
    const isStatsLoading = useAppSelector(selectIsStatsLoading);
    const isSubmitting = useAppSelector(selectIsSubmitting);
    const isActionLoading = useAppSelector(selectIsActionLoading);
    const error = useAppSelector(selectMeetingError);
    const successMessage = useAppSelector(selectMeetingSuccess);

    // ── Common ──
    const getMeetingById = useCallback((id: number) => dispatch(fetchMeetingById(id)), [dispatch]);

    // ── Student ──
    const createMeeting = useCallback((data: CreateMeetingRequest) => dispatch(createMeetingAsync(data)), [dispatch]);
    const getMyRequests = useCallback((params?: MeetingPaginationParams) => dispatch(fetchMyRequests(params || {})), [dispatch]);
    const getMyMeetingsByStatus = useCallback((status: string, params?: MeetingPaginationParams) => dispatch(fetchMyMeetingsByStatus({ status, ...params })), [dispatch]);
    const getMyUpcoming = useCallback((params?: MeetingPaginationParams) => dispatch(fetchMyUpcoming(params || {})), [dispatch]);
    const searchMyMeetings = useCallback((params: MeetingSearchParams) => dispatch(searchMyMeetingsAsync(params)), [dispatch]);
    const cancelMeeting = useCallback((id: number, reason: string) => dispatch(cancelMeetingAsync({ id, reason })), [dispatch]);
    const submitFeedback = useCallback((id: number, data: SubmitFeedbackRequest) => dispatch(submitFeedbackAsync({ id, data })), [dispatch]);

    // ── Lecturer ──
    const getLecturerPending = useCallback((params?: MeetingPaginationParams) => dispatch(fetchLecturerPending(params || {})), [dispatch]);
    const getLecturerPendingCount = useCallback(() => dispatch(fetchLecturerPendingCount()), [dispatch]);
    const getLecturerAll = useCallback((params?: MeetingPaginationParams) => dispatch(fetchLecturerAll(params || {})), [dispatch]);
    const getLecturerUpcoming = useCallback((params?: MeetingPaginationParams) => dispatch(fetchLecturerUpcoming(params || {})), [dispatch]);
    const getLecturerCalendar = useCallback((params: CalendarParams) => dispatch(fetchLecturerCalendar(params)), [dispatch]);
    const searchLecturerMeetings = useCallback((params: MeetingSearchParams) => dispatch(searchLecturerMeetingsAsync(params)), [dispatch]);
    const getLecturerStatistics = useCallback(() => dispatch(fetchLecturerStatistics()), [dispatch]);
    const getLecturerHighPriority = useCallback((params?: MeetingPaginationParams) => dispatch(fetchLecturerHighPriority(params || {})), [dispatch]);
    const getLecturerFollowUp = useCallback((params?: MeetingPaginationParams) => dispatch(fetchLecturerFollowUp(params || {})), [dispatch]);
    const getLecturerByStatus = useCallback((status: string, params?: MeetingPaginationParams) => dispatch(fetchLecturerByStatus({ status, ...params })), [dispatch]);
    const acceptMeeting = useCallback((id: number, data: AcceptMeetingRequest) => dispatch(acceptMeetingAsync({ id, data })), [dispatch]);
    const rejectMeeting = useCallback((id: number, data: RejectMeetingRequest) => dispatch(rejectMeetingAsync({ id, data })), [dispatch]);
    const rescheduleMeeting = useCallback((id: number, data: RescheduleMeetingRequest) => dispatch(rescheduleMeetingAsync({ id, data })), [dispatch]);
    const lecturerCancel = useCallback((id: number, reason: string) => dispatch(lecturerCancelAsync({ id, reason })), [dispatch]);
    const addNotes = useCallback((id: number, notes: string, followUpRequired: boolean, followUpNotes?: string) => dispatch(addNotesAsync({ id, notes, followUpRequired, followUpNotes })), [dispatch]);
    const startMeeting = useCallback((id: number) => dispatch(startMeetingAsync(id)), [dispatch]);
    const completeMeeting = useCallback((id: number) => dispatch(completeMeetingAsync(id)), [dispatch]);
    const uploadProfileImage = useCallback((file: File) => dispatch(uploadProfileImageAsync(file)), [dispatch]);

    // ── Admin ──
    const getAdminAllMeetings = useCallback((params?: MeetingPaginationParams) => dispatch(fetchAdminAllMeetings(params || {})), [dispatch]);
    const adminForceCancel = useCallback((id: number, reason: string) => dispatch(adminForceCancelAsync({ id, reason })), [dispatch]);
    const adminPermanentDelete = useCallback((id: number) => dispatch(adminPermanentDeleteAsync(id)), [dispatch]);
    const getPlatformStatistics = useCallback(() => dispatch(fetchPlatformStatistics()), [dispatch]);
    const getAdminLecturerStats = useCallback((lecturerId: number) => dispatch(fetchLecturerStatsAdmin(lecturerId)), [dispatch]);

    // ── Clear actions ──
    const clearError = useCallback(() => dispatch(clearMeetingError()), [dispatch]);
    const clearSuccess = useCallback(() => dispatch(clearMeetingSuccess()), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedMeeting()), [dispatch]);
    const clearCalendar = useCallback(() => dispatch(clearCalendarMeetings()), [dispatch]);
    const clearStats = useCallback(() => dispatch(clearStatistics()), [dispatch]);

    return {
        // State
        meetings, selectedMeeting, totalMeetings, totalPages,
        myRequests, totalMyRequests,
        pendingRequests, totalPending, pendingCount,
        upcomingMeetings, calendarMeetings,
        lecturerStatistics, platformStatistics,
        isMeetingLoading, isRequestLoading, isStatsLoading, isSubmitting, isActionLoading,
        error, successMessage,
        // Common
        getMeetingById,
        // Student
        createMeeting, getMyRequests, getMyMeetingsByStatus, getMyUpcoming,
        searchMyMeetings, cancelMeeting, submitFeedback,
        // Lecturer
        getLecturerPending, getLecturerPendingCount, getLecturerAll,
        getLecturerUpcoming, getLecturerCalendar, searchLecturerMeetings,
        getLecturerStatistics, getLecturerHighPriority, getLecturerFollowUp,
        getLecturerByStatus, acceptMeeting, rejectMeeting, rescheduleMeeting,
        lecturerCancel, addNotes, startMeeting, completeMeeting, uploadProfileImage,
        // Admin
        getAdminAllMeetings, adminForceCancel, adminPermanentDelete,
        getPlatformStatistics, getAdminLecturerStats,
        // Clear
        clearError, clearSuccess, clearSelected, clearCalendar, clearStats,
    };
}
/**
 * @fileoverview Event Custom Hook
 * @description Reusable hook for event module state and actions
 */
'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    // Selectors
    selectEvents,
    selectSelectedEvent,
    selectTotalEvents,
    selectTotalPages,
    selectMyEvents,
    selectTotalMyEvents,
    selectMyRegistrations,
    selectTotalMyRegistrations,
    selectEventRegistrations,
    selectTotalEventRegistrations,
    selectIsRegisteredForEvent,
    selectCreatorAnalytics,
    selectPlatformStatistics,
    selectEventIsLoading,
    selectMyEventsIsLoading,
    selectRegistrationIsLoading,
    selectAnalyticsIsLoading,
    selectStatsIsLoading,
    selectEventIsCreating,
    selectEventIsUpdating,
    selectEventIsDeleting,
    selectEventError,
    selectEventSuccessMessage,
    // Thunks
    fetchEvents,
    fetchEventById,
    searchEventsAsync,
    advancedSearchAsync,
    fetchUpcomingEvents,
    fetchOngoingEvents,
    fetchPastEvents,
    searchByDateRangeAsync,
    searchByTypeAsync,
    searchByLocationAsync,
    searchByCreatorAsync,
    createEventAsync,
    updateEventAsync,
    publishEventAsync,
    cancelEventAsync,
    rescheduleEventAsync,
    deleteEventAsync,
    fetchMyEvents,
    fetchMyAnalytics,
    registerForEventAsync,
    cancelRegistrationAsync,
    checkIsRegisteredAsync,
    fetchMyRegistrations,
    fetchEventRegistrations,
    fetchAdminEvents,
    adminUpdateEventAsync,
    adminDeleteEventAsync,
    fetchPlatformStatistics,
    permanentDeleteEventAsync,
    // Actions
    clearEventError,
    clearEventSuccessMessage,
    clearSelectedEvent,
    clearMyEvents,
    clearMyRegistrations,
    clearEventRegistrations,
    clearCreatorAnalytics,
    clearPlatformStatistics,
} from '@/features/event/eventSlice';
import type {
    EventPaginationParams,
    EventSearchParams,
    AdvancedSearchRequest,
    CreateEventRequest,
    UpdateEventRequest,
    EventType,
} from '@/features/event/types';

export function useEvent() {
    const dispatch = useAppDispatch();

    // ---- Selectors ----
    const events = useAppSelector(selectEvents);
    const selectedEvent = useAppSelector(selectSelectedEvent);
    const totalEvents = useAppSelector(selectTotalEvents);
    const totalPages = useAppSelector(selectTotalPages);
    const myEvents = useAppSelector(selectMyEvents);
    const totalMyEvents = useAppSelector(selectTotalMyEvents);
    const myRegistrations = useAppSelector(selectMyRegistrations);
    const totalMyRegistrations = useAppSelector(selectTotalMyRegistrations);
    const eventRegistrations = useAppSelector(selectEventRegistrations);
    const totalEventRegistrations = useAppSelector(selectTotalEventRegistrations);
    const isRegisteredForEvent = useAppSelector(selectIsRegisteredForEvent);
    const creatorAnalytics = useAppSelector(selectCreatorAnalytics);
    const platformStatistics = useAppSelector(selectPlatformStatistics);

    // Loading
    const isEventLoading = useAppSelector(selectEventIsLoading);
    const isMyEventsLoading = useAppSelector(selectMyEventsIsLoading);
    const isRegistrationLoading = useAppSelector(selectRegistrationIsLoading);
    const isAnalyticsLoading = useAppSelector(selectAnalyticsIsLoading);
    const isStatsLoading = useAppSelector(selectStatsIsLoading);
    const isCreating = useAppSelector(selectEventIsCreating);
    const isUpdating = useAppSelector(selectEventIsUpdating);
    const isDeleting = useAppSelector(selectEventIsDeleting);
    const error = useAppSelector(selectEventError);
    const successMessage = useAppSelector(selectEventSuccessMessage);

    // ---- Public Event Viewing ----
    const loadEvents = useCallback((params: EventPaginationParams = {}) => dispatch(fetchEvents(params)), [dispatch]);
    const loadEventById = useCallback((id: number) => dispatch(fetchEventById(id)), [dispatch]);
    const searchEvents = useCallback((params: EventSearchParams) => dispatch(searchEventsAsync(params)), [dispatch]);
    const advancedSearch = useCallback((data: AdvancedSearchRequest) => dispatch(advancedSearchAsync(data)), [dispatch]);
    const loadUpcomingEvents = useCallback((params: EventPaginationParams = {}) => dispatch(fetchUpcomingEvents(params)), [dispatch]);
    const loadOngoingEvents = useCallback((params: EventPaginationParams = {}) => dispatch(fetchOngoingEvents(params)), [dispatch]);
    const loadPastEvents = useCallback((params: EventPaginationParams = {}) => dispatch(fetchPastEvents(params)), [dispatch]);
    const searchByDateRange = useCallback(
        (startDate: string, endDate: string, params?: EventPaginationParams) =>
            dispatch(searchByDateRangeAsync({ startDate, endDate, ...params })),
        [dispatch],
    );
    const searchByType = useCallback(
        (eventType: EventType, params?: EventPaginationParams) =>
            dispatch(searchByTypeAsync({ eventType, ...params })),
        [dispatch],
    );
    const searchByLocation = useCallback(
        (location: string, params?: EventPaginationParams) =>
            dispatch(searchByLocationAsync({ location, ...params })),
        [dispatch],
    );
    const searchByCreator = useCallback(
        (creatorName: string, params?: EventPaginationParams) =>
            dispatch(searchByCreatorAsync({ creatorName, ...params })),
        [dispatch],
    );

    // ---- Creator CRUD ----
    const createEvent = useCallback(
        (data: CreateEventRequest, coverImage?: File) => dispatch(createEventAsync({ data, coverImage })),
        [dispatch],
    );
    const updateEvent = useCallback(
        (id: number, data: CreateEventRequest, coverImage?: File) => dispatch(updateEventAsync({ id, data, coverImage })),
        [dispatch],
    );
    const publishEvent = useCallback((id: number) => dispatch(publishEventAsync(id)), [dispatch]);
    const cancelEvent = useCallback(
        (id: number, reason?: string) => dispatch(cancelEventAsync({ id, reason })),
        [dispatch],
    );
    const rescheduleEvent = useCallback(
        (id: number, newStartTime: string, newEndTime: string) =>
            dispatch(rescheduleEventAsync({ id, newStartTime, newEndTime })),
        [dispatch],
    );
    const removeEvent = useCallback((id: number) => dispatch(deleteEventAsync(id)), [dispatch]);
    const loadMyEvents = useCallback((params: EventPaginationParams = {}) => dispatch(fetchMyEvents(params)), [dispatch]);
    const loadMyAnalytics = useCallback(() => dispatch(fetchMyAnalytics()), [dispatch]);

    // ---- Registration ----
    const registerForEvent = useCallback((eventId: number) => dispatch(registerForEventAsync(eventId)), [dispatch]);
    const unregisterFromEvent = useCallback((eventId: number) => dispatch(cancelRegistrationAsync(eventId)), [dispatch]);
    const checkRegistration = useCallback((eventId: number) => dispatch(checkIsRegisteredAsync(eventId)), [dispatch]);
    const loadMyRegistrations = useCallback((params: EventPaginationParams = {}) => dispatch(fetchMyRegistrations(params)), [dispatch]);
    const loadEventRegistrations = useCallback(
        (eventId: number, params?: EventPaginationParams) => dispatch(fetchEventRegistrations({ eventId, params })),
        [dispatch],
    );

    // ---- Admin ----
    const loadAdminEvents = useCallback((params: EventPaginationParams = {}) => dispatch(fetchAdminEvents(params)), [dispatch]);
    const adminUpdateEvent = useCallback(
        (id: number, data: UpdateEventRequest) => dispatch(adminUpdateEventAsync({ id, data })),
        [dispatch],
    );
    const adminDeleteEvent = useCallback((id: number) => dispatch(adminDeleteEventAsync(id)), [dispatch]);
    const loadPlatformStatistics = useCallback(() => dispatch(fetchPlatformStatistics()), [dispatch]);
    const permanentDeleteEvent = useCallback((id: number) => dispatch(permanentDeleteEventAsync(id)), [dispatch]);

    // ---- Utility ----
    const clearError = useCallback(() => dispatch(clearEventError()), [dispatch]);
    const clearSuccess = useCallback(() => dispatch(clearEventSuccessMessage()), [dispatch]);
    const resetSelectedEvent = useCallback(() => dispatch(clearSelectedEvent()), [dispatch]);
    const resetMyEvents = useCallback(() => dispatch(clearMyEvents()), [dispatch]);
    const resetMyRegistrations = useCallback(() => dispatch(clearMyRegistrations()), [dispatch]);
    const resetEventRegistrations = useCallback(() => dispatch(clearEventRegistrations()), [dispatch]);
    const resetCreatorAnalytics = useCallback(() => dispatch(clearCreatorAnalytics()), [dispatch]);
    const resetPlatformStatistics = useCallback(() => dispatch(clearPlatformStatistics()), [dispatch]);

    return {
        // State
        events,
        selectedEvent,
        totalEvents,
        totalPages,
        myEvents,
        totalMyEvents,
        myRegistrations,
        totalMyRegistrations,
        eventRegistrations,
        totalEventRegistrations,
        isRegisteredForEvent,
        creatorAnalytics,
        platformStatistics,

        // Loading
        isEventLoading,
        isMyEventsLoading,
        isRegistrationLoading,
        isAnalyticsLoading,
        isStatsLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        successMessage,

        // Public viewing
        loadEvents,
        loadEventById,
        searchEvents,
        advancedSearch,
        loadUpcomingEvents,
        loadOngoingEvents,
        loadPastEvents,
        searchByDateRange,
        searchByType,
        searchByLocation,
        searchByCreator,

        // Creator CRUD
        createEvent,
        updateEvent,
        publishEvent,
        cancelEvent,
        rescheduleEvent,
        removeEvent,
        loadMyEvents,
        loadMyAnalytics,

        // Registration
        registerForEvent,
        unregisterFromEvent,
        checkRegistration,
        loadMyRegistrations,
        loadEventRegistrations,

        // Admin
        loadAdminEvents,
        adminUpdateEvent,
        adminDeleteEvent,
        loadPlatformStatistics,
        permanentDeleteEvent,

        // Utility
        clearError,
        clearSuccess,
        resetSelectedEvent,
        resetMyEvents,
        resetMyRegistrations,
        resetEventRegistrations,
        resetCreatorAnalytics,
        resetPlatformStatistics,
    };
}

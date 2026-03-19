/**
 * @fileoverview Event Module Redux Slice
 * @description State management for Events, Registrations, and Admin operations
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as eventServices from './services';
import {
    EventResponse,
    RegistrationResponse,
    CreatorAnalytics,
    PlatformStatistics,
    EventPaginationParams,
    EventSearchParams,
    CreateEventRequest,
    UpdateEventRequest,
    AdvancedSearchRequest,
    EventType,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

interface EventState {
    // Events
    events: EventResponse[];
    selectedEvent: EventResponse | null;
    totalEvents: number;
    totalPages: number;

    // My Events (creator)
    myEvents: EventResponse[];
    totalMyEvents: number;

    // Registrations
    myRegistrations: RegistrationResponse[];
    totalMyRegistrations: number;
    eventRegistrations: RegistrationResponse[];
    totalEventRegistrations: number;
    isRegisteredForEvent: boolean;

    // Analytics
    creatorAnalytics: CreatorAnalytics | null;
    platformStatistics: PlatformStatistics | null;

    // Loading states
    isEventLoading: boolean;
    isMyEventsLoading: boolean;
    isRegistrationLoading: boolean;
    isAnalyticsLoading: boolean;
    isStatsLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Messages
    error: string | null;
    successMessage: string | null;
}

const initialState: EventState = {
    events: [],
    selectedEvent: null,
    totalEvents: 0,
    totalPages: 0,
    myEvents: [],
    totalMyEvents: 0,
    myRegistrations: [],
    totalMyRegistrations: 0,
    eventRegistrations: [],
    totalEventRegistrations: 0,
    isRegisteredForEvent: false,
    creatorAnalytics: null,
    platformStatistics: null,
    isEventLoading: false,
    isMyEventsLoading: false,
    isRegistrationLoading: false,
    isAnalyticsLoading: false,
    isStatsLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    successMessage: null,
};

// ============================================================================
// Helper
// ============================================================================

/**
 * Extract error message from various error shapes:
 * - ApiError from axios interceptor: { error: { message } }
 * - Backend response: { message }
 * - AxiosError: { response: { data: { message } } }
 * - Plain Error
 * - Plain string
 */
function extractError(error: unknown, fallback = 'An error occurred'): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
        const obj = error as Record<string, unknown>;
        // ApiError shape from Axios interceptor: { error: { code, message } }
        if (obj.error && typeof obj.error === 'object') {
            const nested = obj.error as Record<string, unknown>;
            if (typeof nested.message === 'string') return nested.message;
        }
        // Top-level message (backend standard response)
        if (typeof obj.message === 'string') return obj.message;
        // Axios error shape
        const axiosErr = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
        if (axiosErr.response?.data?.error?.message) return axiosErr.response.data.error.message;
        if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    }
    return fallback;
}

// ============================================================================
// Async Thunks — Public Event Viewing
// ============================================================================

export const fetchEvents = createAsyncThunk(
    'event/fetchEvents',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchEventById = createAsyncThunk(
    'event/fetchEventById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await eventServices.getEventById(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchEventsAsync = createAsyncThunk(
    'event/searchEvents',
    async (params: EventSearchParams, { rejectWithValue }) => {
        try {
            return await eventServices.searchEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const advancedSearchAsync = createAsyncThunk(
    'event/advancedSearch',
    async (data: AdvancedSearchRequest, { rejectWithValue }) => {
        try {
            return await eventServices.advancedSearch(data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchUpcomingEvents = createAsyncThunk(
    'event/fetchUpcoming',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getUpcomingEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchOngoingEvents = createAsyncThunk(
    'event/fetchOngoing',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getOngoingEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchPastEvents = createAsyncThunk(
    'event/fetchPast',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getPastEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchByDateRangeAsync = createAsyncThunk(
    'event/searchByDateRange',
    async ({ startDate, endDate, ...params }: { startDate: string; endDate: string } & EventPaginationParams, { rejectWithValue }) => {
        try {
            return await eventServices.searchByDateRange(startDate, endDate, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchByTypeAsync = createAsyncThunk(
    'event/searchByType',
    async ({ eventType, ...params }: { eventType: EventType } & EventPaginationParams, { rejectWithValue }) => {
        try {
            return await eventServices.searchByType(eventType, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchByLocationAsync = createAsyncThunk(
    'event/searchByLocation',
    async ({ location, ...params }: { location: string } & EventPaginationParams, { rejectWithValue }) => {
        try {
            return await eventServices.searchByLocation(location, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchByCreatorAsync = createAsyncThunk(
    'event/searchByCreator',
    async ({ creatorName, ...params }: { creatorName: string } & EventPaginationParams, { rejectWithValue }) => {
        try {
            return await eventServices.searchByCreator(creatorName, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Creator CRUD
// ============================================================================

export const createEventAsync = createAsyncThunk(
    'event/create',
    async ({ data, coverImage }: { data: CreateEventRequest; coverImage?: File }, { rejectWithValue }) => {
        try {
            return await eventServices.createEvent(data, coverImage);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const updateEventAsync = createAsyncThunk(
    'event/update',
    async ({ id, data, coverImage }: { id: number; data: CreateEventRequest; coverImage?: File }, { rejectWithValue }) => {
        try {
            return await eventServices.updateEvent(id, data, coverImage);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const publishEventAsync = createAsyncThunk(
    'event/publish',
    async (id: number, { rejectWithValue }) => {
        try {
            const result = await eventServices.publishEvent(id);
            return { id, result };
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const cancelEventAsync = createAsyncThunk(
    'event/cancel',
    async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
        try {
            const result = await eventServices.cancelEvent(id, reason);
            return { id, result };
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const rescheduleEventAsync = createAsyncThunk(
    'event/reschedule',
    async ({ id, newStartTime, newEndTime }: { id: number; newStartTime: string; newEndTime: string }, { rejectWithValue }) => {
        try {
            const result = await eventServices.rescheduleEvent(id, newStartTime, newEndTime);
            return { id, result };
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const deleteEventAsync = createAsyncThunk(
    'event/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await eventServices.deleteEvent(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyEvents = createAsyncThunk(
    'event/fetchMyEvents',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getMyEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyAnalytics = createAsyncThunk(
    'event/fetchMyAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await eventServices.getMyAnalytics();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Registration
// ============================================================================

export const registerForEventAsync = createAsyncThunk(
    'event/register',
    async (eventId: number, { rejectWithValue }) => {
        try {
            const result = await eventServices.registerForEvent(eventId);
            return { eventId, result };
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const cancelRegistrationAsync = createAsyncThunk(
    'event/cancelRegistration',
    async (eventId: number, { rejectWithValue }) => {
        try {
            const result = await eventServices.cancelRegistration(eventId);
            return { eventId, result };
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const checkIsRegisteredAsync = createAsyncThunk(
    'event/checkIsRegistered',
    async (eventId: number, { rejectWithValue }) => {
        try {
            return await eventServices.checkIsRegistered(eventId);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyRegistrations = createAsyncThunk(
    'event/fetchMyRegistrations',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getMyRegistrations(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchEventRegistrations = createAsyncThunk(
    'event/fetchEventRegistrations',
    async ({ eventId, params }: { eventId: number; params?: EventPaginationParams }, { rejectWithValue }) => {
        try {
            return await eventServices.getEventRegistrations(eventId, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Admin
// ============================================================================

export const fetchAdminEvents = createAsyncThunk(
    'event/fetchAdminEvents',
    async (params: EventPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await eventServices.getAdminEvents(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminUpdateEventAsync = createAsyncThunk(
    'event/adminUpdate',
    async ({ id, data }: { id: number; data: UpdateEventRequest }, { rejectWithValue }) => {
        try {
            return await eventServices.adminUpdateEvent(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminDeleteEventAsync = createAsyncThunk(
    'event/adminDelete',
    async (id: number, { rejectWithValue }) => {
        try {
            await eventServices.adminDeleteEvent(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchPlatformStatistics = createAsyncThunk(
    'event/fetchPlatformStats',
    async (_, { rejectWithValue }) => {
        try {
            return await eventServices.getPlatformStatistics();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const permanentDeleteEventAsync = createAsyncThunk(
    'event/permanentDelete',
    async (id: number, { rejectWithValue }) => {
        try {
            await eventServices.permanentDeleteEvent(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Slice
// ============================================================================

const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        clearEventError(state) {
            state.error = null;
        },
        clearEventSuccessMessage(state) {
            state.successMessage = null;
        },
        clearSelectedEvent(state) {
            state.selectedEvent = null;
        },
        clearMyEvents(state) {
            state.myEvents = [];
            state.totalMyEvents = 0;
        },
        clearMyRegistrations(state) {
            state.myRegistrations = [];
            state.totalMyRegistrations = 0;
        },
        clearEventRegistrations(state) {
            state.eventRegistrations = [];
            state.totalEventRegistrations = 0;
        },
        clearCreatorAnalytics(state) {
            state.creatorAnalytics = null;
        },
        clearPlatformStatistics(state) {
            state.platformStatistics = null;
        },
        setIsRegistered(state, action: PayloadAction<boolean>) {
            state.isRegisteredForEvent = action.payload;
        },
    },
    extraReducers: (builder) => {
        // ── Fetch Events ──
        builder.addCase(fetchEvents.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(fetchEvents.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchEvents.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Fetch Event By ID ──
        builder.addCase(fetchEventById.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(fetchEventById.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.selectedEvent = action.payload.data;
        });
        builder.addCase(fetchEventById.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Search Events ──
        builder.addCase(searchEventsAsync.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(searchEventsAsync.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(searchEventsAsync.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Advanced Search ──
        builder.addCase(advancedSearchAsync.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(advancedSearchAsync.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(advancedSearchAsync.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Upcoming Events ──
        builder.addCase(fetchUpcomingEvents.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchUpcomingEvents.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Ongoing Events ──
        builder.addCase(fetchOngoingEvents.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(fetchOngoingEvents.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchOngoingEvents.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Past Events ──
        builder.addCase(fetchPastEvents.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(fetchPastEvents.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchPastEvents.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Search by Date Range ──
        builder.addCase(searchByDateRangeAsync.pending, (state) => { state.isEventLoading = true; });
        builder.addCase(searchByDateRangeAsync.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
        });
        builder.addCase(searchByDateRangeAsync.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Search by Type ──
        builder.addCase(searchByTypeAsync.pending, (state) => { state.isEventLoading = true; });
        builder.addCase(searchByTypeAsync.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
        });
        builder.addCase(searchByTypeAsync.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Search by Location ──
        builder.addCase(searchByLocationAsync.pending, (state) => { state.isEventLoading = true; });
        builder.addCase(searchByLocationAsync.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
        });
        builder.addCase(searchByLocationAsync.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Search by Creator ──
        builder.addCase(searchByCreatorAsync.pending, (state) => { state.isEventLoading = true; });
        builder.addCase(searchByCreatorAsync.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
        });
        builder.addCase(searchByCreatorAsync.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Create Event ──
        builder.addCase(createEventAsync.pending, (state) => { state.isCreating = true; state.error = null; });
        builder.addCase(createEventAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            state.myEvents.unshift(action.payload.data);
            state.totalMyEvents += 1;
            state.successMessage = 'Event created successfully';
        });
        builder.addCase(createEventAsync.rejected, (state, action) => { state.isCreating = false; state.error = action.payload as string; });

        // ── Update Event ──
        builder.addCase(updateEventAsync.pending, (state) => { state.isUpdating = true; state.error = null; });
        builder.addCase(updateEventAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            const updated = action.payload.data;
            state.selectedEvent = updated;
            state.events = state.events.map((e) => (e.id === updated.id ? updated : e));
            state.myEvents = state.myEvents.map((e) => (e.id === updated.id ? updated : e));
            state.successMessage = 'Event updated successfully';
        });
        builder.addCase(updateEventAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Publish Event ──
        builder.addCase(publishEventAsync.pending, (state) => { state.isUpdating = true; });
        builder.addCase(publishEventAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            const id = action.payload.id;
            const updateStatus = (e: EventResponse) => (e.id === id ? { ...e, status: 'PUBLISHED' as const } : e);
            state.events = state.events.map(updateStatus);
            state.myEvents = state.myEvents.map(updateStatus);
            if (state.selectedEvent?.id === id) state.selectedEvent = { ...state.selectedEvent, status: 'PUBLISHED' };
            state.successMessage = 'Event published successfully';
        });
        builder.addCase(publishEventAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Cancel Event ──
        builder.addCase(cancelEventAsync.pending, (state) => { state.isUpdating = true; });
        builder.addCase(cancelEventAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            const id = action.payload.id;
            const updateStatus = (e: EventResponse) => (e.id === id ? { ...e, status: 'CANCELLED' as const } : e);
            state.events = state.events.map(updateStatus);
            state.myEvents = state.myEvents.map(updateStatus);
            if (state.selectedEvent?.id === id) state.selectedEvent = { ...state.selectedEvent, status: 'CANCELLED' };
            state.successMessage = 'Event cancelled successfully';
        });
        builder.addCase(cancelEventAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Reschedule Event ──
        builder.addCase(rescheduleEventAsync.pending, (state) => { state.isUpdating = true; });
        builder.addCase(rescheduleEventAsync.fulfilled, (state) => {
            state.isUpdating = false;
            state.successMessage = 'Event rescheduled successfully';
        });
        builder.addCase(rescheduleEventAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Delete Event ──
        builder.addCase(deleteEventAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(deleteEventAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.events = state.events.filter((e) => e.id !== action.payload);
            state.myEvents = state.myEvents.filter((e) => e.id !== action.payload);
            state.totalEvents = Math.max(0, state.totalEvents - 1);
            state.totalMyEvents = Math.max(0, state.totalMyEvents - 1);
            state.successMessage = 'Event deleted successfully';
        });
        builder.addCase(deleteEventAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Fetch My Events ──
        builder.addCase(fetchMyEvents.pending, (state) => { state.isMyEventsLoading = true; state.error = null; });
        builder.addCase(fetchMyEvents.fulfilled, (state, action) => {
            state.isMyEventsLoading = false;
            state.myEvents = action.payload.data.content;
            state.totalMyEvents = action.payload.data.totalElements;
        });
        builder.addCase(fetchMyEvents.rejected, (state, action) => { state.isMyEventsLoading = false; state.error = action.payload as string; });

        // ── Fetch My Analytics ──
        builder.addCase(fetchMyAnalytics.pending, (state) => { state.isAnalyticsLoading = true; });
        builder.addCase(fetchMyAnalytics.fulfilled, (state, action) => {
            state.isAnalyticsLoading = false;
            state.creatorAnalytics = action.payload.data;
        });
        builder.addCase(fetchMyAnalytics.rejected, (state, action) => { state.isAnalyticsLoading = false; state.error = action.payload as string; });

        // ── Register ──
        builder.addCase(registerForEventAsync.pending, (state) => { state.isRegistrationLoading = true; });
        builder.addCase(registerForEventAsync.fulfilled, (state) => {
            state.isRegistrationLoading = false;
            state.isRegisteredForEvent = true;
            state.successMessage = 'Successfully registered for event';
        });
        builder.addCase(registerForEventAsync.rejected, (state, action) => { state.isRegistrationLoading = false; state.error = action.payload as string; });

        // ── Cancel Registration ──
        builder.addCase(cancelRegistrationAsync.pending, (state) => { state.isRegistrationLoading = true; });
        builder.addCase(cancelRegistrationAsync.fulfilled, (state) => {
            state.isRegistrationLoading = false;
            state.isRegisteredForEvent = false;
            state.successMessage = 'Registration cancelled successfully';
        });
        builder.addCase(cancelRegistrationAsync.rejected, (state, action) => { state.isRegistrationLoading = false; state.error = action.payload as string; });

        // ── Check Is Registered ──
        builder.addCase(checkIsRegisteredAsync.fulfilled, (state, action) => {
            state.isRegisteredForEvent = action.payload.data;
        });

        // ── Fetch My Registrations ──
        builder.addCase(fetchMyRegistrations.pending, (state) => { state.isRegistrationLoading = true; });
        builder.addCase(fetchMyRegistrations.fulfilled, (state, action) => {
            state.isRegistrationLoading = false;
            state.myRegistrations = action.payload.data.content;
            state.totalMyRegistrations = action.payload.data.totalElements;
        });
        builder.addCase(fetchMyRegistrations.rejected, (state, action) => { state.isRegistrationLoading = false; state.error = action.payload as string; });

        // ── Fetch Event Registrations ──
        builder.addCase(fetchEventRegistrations.pending, (state) => { state.isRegistrationLoading = true; });
        builder.addCase(fetchEventRegistrations.fulfilled, (state, action) => {
            state.isRegistrationLoading = false;
            state.eventRegistrations = action.payload.data.content;
            state.totalEventRegistrations = action.payload.data.totalElements;
        });
        builder.addCase(fetchEventRegistrations.rejected, (state, action) => { state.isRegistrationLoading = false; state.error = action.payload as string; });

        // ── Admin Events ──
        builder.addCase(fetchAdminEvents.pending, (state) => { state.isEventLoading = true; state.error = null; });
        builder.addCase(fetchAdminEvents.fulfilled, (state, action) => {
            state.isEventLoading = false;
            state.events = action.payload.data.content;
            state.totalEvents = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchAdminEvents.rejected, (state, action) => { state.isEventLoading = false; state.error = action.payload as string; });

        // ── Admin Update Event ──
        builder.addCase(adminUpdateEventAsync.pending, (state) => { state.isUpdating = true; });
        builder.addCase(adminUpdateEventAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            const updated = action.payload.data;
            state.events = state.events.map((e) => (e.id === updated.id ? updated : e));
            state.selectedEvent = updated;
            state.successMessage = 'Event updated by admin';
        });
        builder.addCase(adminUpdateEventAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Admin Delete ──
        builder.addCase(adminDeleteEventAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(adminDeleteEventAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.events = state.events.filter((e) => e.id !== action.payload);
            state.totalEvents = Math.max(0, state.totalEvents - 1);
            state.successMessage = 'Event deleted by admin';
        });
        builder.addCase(adminDeleteEventAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Platform Statistics ──
        builder.addCase(fetchPlatformStatistics.pending, (state) => { state.isStatsLoading = true; });
        builder.addCase(fetchPlatformStatistics.fulfilled, (state, action) => {
            state.isStatsLoading = false;
            state.platformStatistics = action.payload.data;
        });
        builder.addCase(fetchPlatformStatistics.rejected, (state, action) => { state.isStatsLoading = false; state.error = action.payload as string; });

        // ── Permanent Delete ──
        builder.addCase(permanentDeleteEventAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(permanentDeleteEventAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.events = state.events.filter((e) => e.id !== action.payload);
            state.totalEvents = Math.max(0, state.totalEvents - 1);
            state.successMessage = 'Event permanently deleted';
        });
        builder.addCase(permanentDeleteEventAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });
    },
});

// ============================================================================
// Actions & Selectors
// ============================================================================

export const {
    clearEventError,
    clearEventSuccessMessage,
    clearSelectedEvent,
    clearMyEvents,
    clearMyRegistrations,
    clearEventRegistrations,
    clearCreatorAnalytics,
    clearPlatformStatistics,
    setIsRegistered,
} = eventSlice.actions;

// Selectors
export const selectEvents = (state: { event: EventState }) => state.event.events;
export const selectSelectedEvent = (state: { event: EventState }) => state.event.selectedEvent;
export const selectTotalEvents = (state: { event: EventState }) => state.event.totalEvents;
export const selectTotalPages = (state: { event: EventState }) => state.event.totalPages;
export const selectMyEvents = (state: { event: EventState }) => state.event.myEvents;
export const selectTotalMyEvents = (state: { event: EventState }) => state.event.totalMyEvents;
export const selectMyRegistrations = (state: { event: EventState }) => state.event.myRegistrations;
export const selectTotalMyRegistrations = (state: { event: EventState }) => state.event.totalMyRegistrations;
export const selectEventRegistrations = (state: { event: EventState }) => state.event.eventRegistrations;
export const selectTotalEventRegistrations = (state: { event: EventState }) => state.event.totalEventRegistrations;
export const selectIsRegisteredForEvent = (state: { event: EventState }) => state.event.isRegisteredForEvent;
export const selectCreatorAnalytics = (state: { event: EventState }) => state.event.creatorAnalytics;
export const selectPlatformStatistics = (state: { event: EventState }) => state.event.platformStatistics;
export const selectEventIsLoading = (state: { event: EventState }) => state.event.isEventLoading;
export const selectMyEventsIsLoading = (state: { event: EventState }) => state.event.isMyEventsLoading;
export const selectRegistrationIsLoading = (state: { event: EventState }) => state.event.isRegistrationLoading;
export const selectAnalyticsIsLoading = (state: { event: EventState }) => state.event.isAnalyticsLoading;
export const selectStatsIsLoading = (state: { event: EventState }) => state.event.isStatsLoading;
export const selectEventIsCreating = (state: { event: EventState }) => state.event.isCreating;
export const selectEventIsUpdating = (state: { event: EventState }) => state.event.isUpdating;
export const selectEventIsDeleting = (state: { event: EventState }) => state.event.isDeleting;
export const selectEventError = (state: { event: EventState }) => state.event.error;
export const selectEventSuccessMessage = (state: { event: EventState }) => state.event.successMessage;

export default eventSlice.reducer;

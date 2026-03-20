/**
 * @fileoverview Meeting Module Redux Slice
 * @description State management for meetings, feedback, lecturer operations, and admin operations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as meetingServices from './services';
import type {
    MeetingResponse,
    MeetingStatistics,
    LecturerStatistics,
    CreateMeetingRequest,
    AcceptMeetingRequest,
    RejectMeetingRequest,
    RescheduleMeetingRequest,
    SubmitFeedbackRequest,
    MeetingPaginationParams,
    MeetingSearchParams,
    CalendarParams,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

interface MeetingState {
    // Meetings
    meetings: MeetingResponse[];
    selectedMeeting: MeetingResponse | null;
    totalMeetings: number;
    totalPages: number;

    // Student requests
    myRequests: MeetingResponse[];
    totalMyRequests: number;

    // Lecturer pending
    pendingRequests: MeetingResponse[];
    totalPending: number;
    pendingCount: number;

    // Upcoming & calendar
    upcomingMeetings: MeetingResponse[];
    calendarMeetings: MeetingResponse[];

    // Statistics
    lecturerStatistics: MeetingStatistics | null;
    platformStatistics: MeetingStatistics | null;

    // Loading states
    isMeetingLoading: boolean;
    isRequestLoading: boolean;
    isStatsLoading: boolean;
    isSubmitting: boolean;
    isActionLoading: boolean;

    // Messages
    error: string | null;
    successMessage: string | null;
}

const initialState: MeetingState = {
    meetings: [],
    selectedMeeting: null,
    totalMeetings: 0,
    totalPages: 0,
    myRequests: [],
    totalMyRequests: 0,
    pendingRequests: [],
    totalPending: 0,
    pendingCount: 0,
    upcomingMeetings: [],
    calendarMeetings: [],
    lecturerStatistics: null,
    platformStatistics: null,
    isMeetingLoading: false,
    isRequestLoading: false,
    isStatsLoading: false,
    isSubmitting: false,
    isActionLoading: false,
    error: null,
    successMessage: null,
};

// ============================================================================
// Helper
// ============================================================================

function extractError(error: unknown, fallback = 'An error occurred'): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
        const obj = error as Record<string, unknown>;
        if (obj.error && typeof obj.error === 'object') {
            const nested = obj.error as Record<string, unknown>;
            if (typeof nested.message === 'string') return nested.message;
        }
        if (typeof obj.message === 'string') return obj.message;
        const axiosErr = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
        if (axiosErr.response?.data?.error?.message) return axiosErr.response.data.error.message;
        if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    }
    return fallback;
}

// ============================================================================
// Async Thunks — Common
// ============================================================================

export const fetchMeetingById = createAsyncThunk(
    'meeting/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await meetingServices.getMeetingById(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Student Operations
// ============================================================================

export const createMeetingAsync = createAsyncThunk(
    'meeting/create',
    async (data: CreateMeetingRequest, { rejectWithValue }) => {
        try {
            return await meetingServices.createMeeting(data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyRequests = createAsyncThunk(
    'meeting/fetchMyRequests',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getMyRequests(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyMeetingsByStatus = createAsyncThunk(
    'meeting/fetchMyByStatus',
    async ({ status, ...params }: { status: string } & MeetingPaginationParams, { rejectWithValue }) => {
        try {
            return await meetingServices.getMyMeetingsByStatus(status, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyUpcoming = createAsyncThunk(
    'meeting/fetchMyUpcoming',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getMyUpcomingMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchMyMeetingsAsync = createAsyncThunk(
    'meeting/searchMy',
    async (params: MeetingSearchParams, { rejectWithValue }) => {
        try {
            return await meetingServices.searchMyMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const cancelMeetingAsync = createAsyncThunk(
    'meeting/cancel',
    async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
        try {
            return await meetingServices.cancelMeeting(id, reason);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const submitFeedbackAsync = createAsyncThunk(
    'meeting/submitFeedback',
    async ({ id, data }: { id: number; data: SubmitFeedbackRequest }, { rejectWithValue }) => {
        try {
            return await meetingServices.submitFeedback(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Lecturer Operations
// ============================================================================

export const fetchLecturerPending = createAsyncThunk(
    'meeting/fetchLecturerPending',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerPendingRequests(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerPendingCount = createAsyncThunk(
    'meeting/fetchLecturerPendingCount',
    async (_, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerPendingCount();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerAll = createAsyncThunk(
    'meeting/fetchLecturerAll',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerAllRequests(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerUpcoming = createAsyncThunk(
    'meeting/fetchLecturerUpcoming',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerUpcomingMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerCalendar = createAsyncThunk(
    'meeting/fetchLecturerCalendar',
    async (params: CalendarParams, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerCalendarMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchLecturerMeetingsAsync = createAsyncThunk(
    'meeting/searchLecturer',
    async (params: MeetingSearchParams, { rejectWithValue }) => {
        try {
            return await meetingServices.searchLecturerMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerStatistics = createAsyncThunk(
    'meeting/fetchLecturerStatistics',
    async (_, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerStatistics();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerHighPriority = createAsyncThunk(
    'meeting/fetchLecturerHighPriority',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerHighPriorityRequests(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerFollowUp = createAsyncThunk(
    'meeting/fetchLecturerFollowUp',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerFollowUpMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerByStatus = createAsyncThunk(
    'meeting/fetchLecturerByStatus',
    async ({ status, ...params }: { status: string } & MeetingPaginationParams, { rejectWithValue }) => {
        try {
            return await meetingServices.getLecturerMeetingsByStatus(status, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const acceptMeetingAsync = createAsyncThunk(
    'meeting/accept',
    async ({ id, data }: { id: number; data: AcceptMeetingRequest }, { rejectWithValue }) => {
        try {
            return await meetingServices.acceptMeeting(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const rejectMeetingAsync = createAsyncThunk(
    'meeting/reject',
    async ({ id, data }: { id: number; data: RejectMeetingRequest }, { rejectWithValue }) => {
        try {
            return await meetingServices.rejectMeeting(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const rescheduleMeetingAsync = createAsyncThunk(
    'meeting/reschedule',
    async ({ id, data }: { id: number; data: RescheduleMeetingRequest }, { rejectWithValue }) => {
        try {
            return await meetingServices.rescheduleMeeting(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const lecturerCancelAsync = createAsyncThunk(
    'meeting/lecturerCancel',
    async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
        try {
            return await meetingServices.lecturerCancelMeeting(id, reason);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const addNotesAsync = createAsyncThunk(
    'meeting/addNotes',
    async ({ id, notes, followUpRequired, followUpNotes }: { id: number; notes: string; followUpRequired: boolean; followUpNotes?: string }, { rejectWithValue }) => {
        try {
            return await meetingServices.addMeetingNotes(id, notes, followUpRequired, followUpNotes);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const startMeetingAsync = createAsyncThunk(
    'meeting/start',
    async (id: number, { rejectWithValue }) => {
        try {
            return await meetingServices.startMeeting(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const completeMeetingAsync = createAsyncThunk(
    'meeting/complete',
    async (id: number, { rejectWithValue }) => {
        try {
            return await meetingServices.completeMeeting(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const uploadProfileImageAsync = createAsyncThunk(
    'meeting/uploadProfileImage',
    async (file: File, { rejectWithValue }) => {
        try {
            return await meetingServices.uploadLecturerProfileImage(file);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Admin Operations
// ============================================================================

export const fetchAdminAllMeetings = createAsyncThunk(
    'meeting/fetchAdminAll',
    async (params: MeetingPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await meetingServices.adminGetAllMeetings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminForceCancelAsync = createAsyncThunk(
    'meeting/adminForceCancel',
    async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
        try {
            return await meetingServices.adminForceCancelMeeting(id, reason);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminPermanentDeleteAsync = createAsyncThunk(
    'meeting/adminPermanentDelete',
    async (id: number, { rejectWithValue }) => {
        try {
            await meetingServices.adminPermanentDeleteMeeting(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchPlatformStatistics = createAsyncThunk(
    'meeting/fetchPlatformStatistics',
    async (_, { rejectWithValue }) => {
        try {
            return await meetingServices.adminGetPlatformStatistics();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLecturerStatsAdmin = createAsyncThunk(
    'meeting/fetchLecturerStatsAdmin',
    async (lecturerId: number, { rejectWithValue }) => {
        try {
            return await meetingServices.adminGetLecturerStatistics(lecturerId);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Slice
// ============================================================================

const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        clearMeetingError(state) { state.error = null; },
        clearMeetingSuccess(state) { state.successMessage = null; },
        clearSelectedMeeting(state) { state.selectedMeeting = null; },
        clearCalendarMeetings(state) { state.calendarMeetings = []; },
        clearStatistics(state) { state.lecturerStatistics = null; state.platformStatistics = null; },
    },
    extraReducers: (builder) => {
        // ── Fetch Meeting By ID ──
        builder.addCase(fetchMeetingById.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchMeetingById.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.selectedMeeting = action.payload.data;
        });
        builder.addCase(fetchMeetingById.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Create Meeting ──
        builder.addCase(createMeetingAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(createMeetingAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            state.myRequests.unshift(action.payload.data);
            state.totalMyRequests += 1;
            state.successMessage = 'Meeting request created successfully';
        });
        builder.addCase(createMeetingAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Fetch My Requests ──
        builder.addCase(fetchMyRequests.pending, (state) => { state.isRequestLoading = true; state.error = null; });
        builder.addCase(fetchMyRequests.fulfilled, (state, action) => {
            state.isRequestLoading = false;
            state.myRequests = action.payload.data.content;
            state.totalMyRequests = action.payload.data.totalElements;
        });
        builder.addCase(fetchMyRequests.rejected, (state, action) => { state.isRequestLoading = false; state.error = action.payload as string; });

        // ── Fetch My Meetings By Status ──
        builder.addCase(fetchMyMeetingsByStatus.pending, (state) => { state.isRequestLoading = true; state.error = null; });
        builder.addCase(fetchMyMeetingsByStatus.fulfilled, (state, action) => {
            state.isRequestLoading = false;
            state.myRequests = action.payload.data.content;
            state.totalMyRequests = action.payload.data.totalElements;
        });
        builder.addCase(fetchMyMeetingsByStatus.rejected, (state, action) => { state.isRequestLoading = false; state.error = action.payload as string; });

        // ── Fetch My Upcoming ──
        builder.addCase(fetchMyUpcoming.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchMyUpcoming.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.upcomingMeetings = action.payload.data.content;
        });
        builder.addCase(fetchMyUpcoming.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Search My Meetings ──
        builder.addCase(searchMyMeetingsAsync.pending, (state) => { state.isRequestLoading = true; state.error = null; });
        builder.addCase(searchMyMeetingsAsync.fulfilled, (state, action) => {
            state.isRequestLoading = false;
            state.myRequests = action.payload.data.content;
            state.totalMyRequests = action.payload.data.totalElements;
        });
        builder.addCase(searchMyMeetingsAsync.rejected, (state, action) => { state.isRequestLoading = false; state.error = action.payload as string; });

        // ── Cancel Meeting (Student) ──
        builder.addCase(cancelMeetingAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(cancelMeetingAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.myRequests = state.myRequests.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting cancelled successfully';
        });
        builder.addCase(cancelMeetingAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Submit Feedback ──
        builder.addCase(submitFeedbackAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(submitFeedbackAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.myRequests = state.myRequests.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Feedback submitted successfully';
        });
        builder.addCase(submitFeedbackAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Pending ──
        builder.addCase(fetchLecturerPending.pending, (state) => { state.isRequestLoading = true; state.error = null; });
        builder.addCase(fetchLecturerPending.fulfilled, (state, action) => {
            state.isRequestLoading = false;
            state.pendingRequests = action.payload.data.content;
            state.totalPending = action.payload.data.totalElements;
        });
        builder.addCase(fetchLecturerPending.rejected, (state, action) => { state.isRequestLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Pending Count ──
        builder.addCase(fetchLecturerPendingCount.fulfilled, (state, action) => {
            state.pendingCount = action.payload.data;
        });

        // ── Fetch Lecturer All ──
        builder.addCase(fetchLecturerAll.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchLecturerAll.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.meetings = action.payload.data.content;
            state.totalMeetings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchLecturerAll.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Upcoming ──
        builder.addCase(fetchLecturerUpcoming.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchLecturerUpcoming.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.upcomingMeetings = action.payload.data.content;
        });
        builder.addCase(fetchLecturerUpcoming.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Calendar ──
        builder.addCase(fetchLecturerCalendar.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchLecturerCalendar.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.calendarMeetings = action.payload.data;
        });
        builder.addCase(fetchLecturerCalendar.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Search Lecturer Meetings ──
        builder.addCase(searchLecturerMeetingsAsync.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(searchLecturerMeetingsAsync.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.meetings = action.payload.data.content;
            state.totalMeetings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(searchLecturerMeetingsAsync.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Statistics ──
        builder.addCase(fetchLecturerStatistics.pending, (state) => { state.isStatsLoading = true; state.error = null; });
        builder.addCase(fetchLecturerStatistics.fulfilled, (state, action) => {
            state.isStatsLoading = false;
            state.lecturerStatistics = action.payload.data;
        });
        builder.addCase(fetchLecturerStatistics.rejected, (state, action) => { state.isStatsLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer High Priority ──
        builder.addCase(fetchLecturerHighPriority.pending, (state) => { state.isRequestLoading = true; state.error = null; });
        builder.addCase(fetchLecturerHighPriority.fulfilled, (state, action) => {
            state.isRequestLoading = false;
            state.meetings = action.payload.data.content;
            state.totalMeetings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchLecturerHighPriority.rejected, (state, action) => { state.isRequestLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Follow Up ──
        builder.addCase(fetchLecturerFollowUp.pending, (state) => { state.isRequestLoading = true; state.error = null; });
        builder.addCase(fetchLecturerFollowUp.fulfilled, (state, action) => {
            state.isRequestLoading = false;
            state.meetings = action.payload.data.content;
            state.totalMeetings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchLecturerFollowUp.rejected, (state, action) => { state.isRequestLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer By Status ──
        builder.addCase(fetchLecturerByStatus.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchLecturerByStatus.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.meetings = action.payload.data.content;
            state.totalMeetings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchLecturerByStatus.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Accept Meeting ──
        builder.addCase(acceptMeetingAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(acceptMeetingAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.pendingRequests = state.pendingRequests.filter((m) => m.id !== updated.id);
            state.totalPending = Math.max(0, state.totalPending - 1);
            state.pendingCount = Math.max(0, state.pendingCount - 1);
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting accepted';
        });
        builder.addCase(acceptMeetingAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Reject Meeting ──
        builder.addCase(rejectMeetingAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(rejectMeetingAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.pendingRequests = state.pendingRequests.filter((m) => m.id !== updated.id);
            state.totalPending = Math.max(0, state.totalPending - 1);
            state.pendingCount = Math.max(0, state.pendingCount - 1);
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting rejected';
        });
        builder.addCase(rejectMeetingAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Reschedule Meeting ──
        builder.addCase(rescheduleMeetingAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(rescheduleMeetingAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting rescheduled';
        });
        builder.addCase(rescheduleMeetingAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Lecturer Cancel ──
        builder.addCase(lecturerCancelAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(lecturerCancelAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting cancelled by lecturer';
        });
        builder.addCase(lecturerCancelAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Add Notes ──
        builder.addCase(addNotesAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(addNotesAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Notes added successfully';
        });
        builder.addCase(addNotesAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Start Meeting ──
        builder.addCase(startMeetingAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(startMeetingAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting started';
        });
        builder.addCase(startMeetingAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Complete Meeting ──
        builder.addCase(completeMeetingAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(completeMeetingAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting completed';
        });
        builder.addCase(completeMeetingAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Upload Profile Image ──
        builder.addCase(uploadProfileImageAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(uploadProfileImageAsync.fulfilled, (state) => {
            state.isSubmitting = false;
            state.successMessage = 'Profile image uploaded successfully';
        });
        builder.addCase(uploadProfileImageAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Admin Fetch All Meetings ──
        builder.addCase(fetchAdminAllMeetings.pending, (state) => { state.isMeetingLoading = true; state.error = null; });
        builder.addCase(fetchAdminAllMeetings.fulfilled, (state, action) => {
            state.isMeetingLoading = false;
            state.meetings = action.payload.data.content;
            state.totalMeetings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchAdminAllMeetings.rejected, (state, action) => { state.isMeetingLoading = false; state.error = action.payload as string; });

        // ── Admin Force Cancel ──
        builder.addCase(adminForceCancelAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(adminForceCancelAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            const updated = action.payload.data;
            state.meetings = state.meetings.map((m) => (m.id === updated.id ? updated : m));
            state.selectedMeeting = updated;
            state.successMessage = 'Meeting force cancelled by admin';
        });
        builder.addCase(adminForceCancelAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Admin Permanent Delete ──
        builder.addCase(adminPermanentDeleteAsync.pending, (state) => { state.isActionLoading = true; state.error = null; });
        builder.addCase(adminPermanentDeleteAsync.fulfilled, (state, action) => {
            state.isActionLoading = false;
            state.meetings = state.meetings.filter((m) => m.id !== action.payload);
            state.totalMeetings = Math.max(0, state.totalMeetings - 1);
            state.successMessage = 'Meeting permanently deleted';
        });
        builder.addCase(adminPermanentDeleteAsync.rejected, (state, action) => { state.isActionLoading = false; state.error = action.payload as string; });

        // ── Fetch Platform Statistics ──
        builder.addCase(fetchPlatformStatistics.pending, (state) => { state.isStatsLoading = true; state.error = null; });
        builder.addCase(fetchPlatformStatistics.fulfilled, (state, action) => {
            state.isStatsLoading = false;
            state.platformStatistics = action.payload.data;
        });
        builder.addCase(fetchPlatformStatistics.rejected, (state, action) => { state.isStatsLoading = false; state.error = action.payload as string; });

        // ── Fetch Lecturer Stats (Admin) ──
        builder.addCase(fetchLecturerStatsAdmin.pending, (state) => { state.isStatsLoading = true; state.error = null; });
        builder.addCase(fetchLecturerStatsAdmin.fulfilled, (state, action) => {
            state.isStatsLoading = false;
            state.lecturerStatistics = action.payload.data;
        });
        builder.addCase(fetchLecturerStatsAdmin.rejected, (state, action) => { state.isStatsLoading = false; state.error = action.payload as string; });
    },
});

// ============================================================================
// Actions & Selectors
// ============================================================================

export const {
    clearMeetingError,
    clearMeetingSuccess,
    clearSelectedMeeting,
    clearCalendarMeetings,
    clearStatistics,
} = meetingSlice.actions;

// Selectors
export const selectMeetings = (state: { meeting: MeetingState }) => state.meeting.meetings;
export const selectSelectedMeeting = (state: { meeting: MeetingState }) => state.meeting.selectedMeeting;
export const selectTotalMeetings = (state: { meeting: MeetingState }) => state.meeting.totalMeetings;
export const selectTotalPages = (state: { meeting: MeetingState }) => state.meeting.totalPages;
export const selectMyRequests = (state: { meeting: MeetingState }) => state.meeting.myRequests;
export const selectTotalMyRequests = (state: { meeting: MeetingState }) => state.meeting.totalMyRequests;
export const selectPendingRequests = (state: { meeting: MeetingState }) => state.meeting.pendingRequests;
export const selectTotalPending = (state: { meeting: MeetingState }) => state.meeting.totalPending;
export const selectPendingCount = (state: { meeting: MeetingState }) => state.meeting.pendingCount;
export const selectUpcomingMeetings = (state: { meeting: MeetingState }) => state.meeting.upcomingMeetings;
export const selectCalendarMeetings = (state: { meeting: MeetingState }) => state.meeting.calendarMeetings;
export const selectLecturerStatistics = (state: { meeting: MeetingState }) => state.meeting.lecturerStatistics;
export const selectPlatformStatistics = (state: { meeting: MeetingState }) => state.meeting.platformStatistics;
export const selectIsMeetingLoading = (state: { meeting: MeetingState }) => state.meeting.isMeetingLoading;
export const selectIsRequestLoading = (state: { meeting: MeetingState }) => state.meeting.isRequestLoading;
export const selectIsStatsLoading = (state: { meeting: MeetingState }) => state.meeting.isStatsLoading;
export const selectIsSubmitting = (state: { meeting: MeetingState }) => state.meeting.isSubmitting;
export const selectIsActionLoading = (state: { meeting: MeetingState }) => state.meeting.isActionLoading;
export const selectMeetingError = (state: { meeting: MeetingState }) => state.meeting.error;
export const selectMeetingSuccess = (state: { meeting: MeetingState }) => state.meeting.successMessage;

export default meetingSlice.reducer;

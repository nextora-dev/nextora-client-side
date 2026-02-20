/**
 * @fileoverview Kuppi Module Redux Slice
 * @description State management for Kuppi sessions, notes, and applications
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as kuppiServices from './services';
import {
    KuppiSessionResponse,
    KuppiNoteResponse,
    KuppiApplicationResponse,
    KuppiPaginationParams,
    KuppiSearchParams,
    CreateKuppiSessionRequest,
    UpdateKuppiSessionRequest,
    CreateKuppiNoteRequest,
    CreateKuppiApplicationRequest,
    ReviewKuppiApplicationRequest,
    ApplicationStatus,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

interface KuppiState {
    // Sessions
    sessions: KuppiSessionResponse[];
    mySessions: KuppiSessionResponse[];
    selectedSession: KuppiSessionResponse | null;
    totalSessions: number;

    // Notes
    notes: KuppiNoteResponse[];
    myNotes: KuppiNoteResponse[];
    selectedNote: KuppiNoteResponse | null;
    totalNotes: number;

    // Applications (Student)
    myApplications: KuppiApplicationResponse[];
    activeApplication: KuppiApplicationResponse | null;
    canApply: boolean;
    isKuppiStudent: boolean;

    // Applications (Admin)
    allApplications: KuppiApplicationResponse[];
    selectedApplication: KuppiApplicationResponse | null;
    totalApplications: number;
    applicationStats: {
        totalApplications: number;
        pendingApplications: number;
        underReviewApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
        cancelledApplications: number;
        applicationsToday: number;
        totalKuppiStudents: number;
    } | null;

    // Analytics
    myAnalytics: {
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
        totalSessionViews: number;
        totalNotes: number;
        totalNoteViews: number;
    } | null;

    // Platform Stats (Admin)
    platformStats: {
        totalSessions: number;
        totalNotes: number;
        totalKuppiStudents: number;
        completedSessions: number;
        totalViews: number;
        totalDownloads: number;
        sessionsThisWeek: number;
        sessionsThisMonth: number;
    } | null;

    // Pagination
    currentPage: number;
    pageSize: number;

    // Loading States
    isLoading: boolean;
    isSessionLoading: boolean;
    isNoteLoading: boolean;
    isApplicationLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Messages
    error: string | null;
    successMessage: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: KuppiState = {
    sessions: [],
    mySessions: [],
    selectedSession: null,
    totalSessions: 0,

    notes: [],
    myNotes: [],
    selectedNote: null,
    totalNotes: 0,

    myApplications: [],
    activeApplication: null,
    canApply: false,
    isKuppiStudent: false,

    allApplications: [],
    selectedApplication: null,
    totalApplications: 0,
    applicationStats: null,

    myAnalytics: null,
    platformStats: null,

    currentPage: 0,
    pageSize: 10,

    isLoading: false,
    isSessionLoading: false,
    isNoteLoading: false,
    isApplicationLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    error: null,
    successMessage: null,
};

// ============================================================================
// Async Thunks - Sessions
// ============================================================================

export const fetchSessions = createAsyncThunk(
    'kuppi/fetchSessions',
    async (params: KuppiPaginationParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getAllSessions(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions');
        }
    }
);

export const fetchUpcomingSessions = createAsyncThunk(
    'kuppi/fetchUpcomingSessions',
    async (params: KuppiPaginationParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getUpcomingSessions(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch upcoming sessions');
        }
    }
);

export const fetchSessionById = createAsyncThunk(
    'kuppi/fetchSessionById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getSessionById(id);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch session');
        }
    }
);

export const searchSessionsAsync = createAsyncThunk(
    'kuppi/searchSessions',
    async (params: KuppiSearchParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchSessions(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search sessions');
        }
    }
);

export const fetchMySessions = createAsyncThunk(
    'kuppi/fetchMySessions',
    async (params: KuppiPaginationParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getMySessions(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch my sessions');
        }
    }
);

export const fetchMyAnalytics = createAsyncThunk(
    'kuppi/fetchMyAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getMyAnalytics();
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
        }
    }
);

export const createSessionAsync = createAsyncThunk(
    'kuppi/createSession',
    async (data: CreateKuppiSessionRequest, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.createSession(data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to create session');
        }
    }
);

export const updateSessionAsync = createAsyncThunk(
    'kuppi/updateSession',
    async ({ id, data }: { id: number; data: UpdateKuppiSessionRequest }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.updateSession(id, data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to update session');
        }
    }
);

export const cancelSessionAsync = createAsyncThunk(
    'kuppi/cancelSession',
    async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.cancelSession(id, reason);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to cancel session');
        }
    }
);

export const deleteSessionAsync = createAsyncThunk(
    'kuppi/deleteSession',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.deleteSession(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to delete session');
        }
    }
);

// ============================================================================
// Async Thunks - Notes
// ============================================================================

export const fetchNotes = createAsyncThunk(
    'kuppi/fetchNotes',
    async (params: KuppiPaginationParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getAllNotes(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch notes');
        }
    }
);

export const fetchNoteById = createAsyncThunk(
    'kuppi/fetchNoteById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getNoteById(id);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch note');
        }
    }
);

export const fetchMyNotes = createAsyncThunk(
    'kuppi/fetchMyNotes',
    async (params: KuppiPaginationParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getMyNotes(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch my notes');
        }
    }
);

export const uploadNoteAsync = createAsyncThunk(
    'kuppi/uploadNote',
    async (data: CreateKuppiNoteRequest, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.uploadNote(data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to upload note');
        }
    }
);

export const deleteNoteAsync = createAsyncThunk(
    'kuppi/deleteNote',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.deleteNote(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to delete note');
        }
    }
);

// ============================================================================
// Async Thunks - Applications (Student)
// ============================================================================

export const submitApplicationAsync = createAsyncThunk(
    'kuppi/submitApplication',
    async (data: CreateKuppiApplicationRequest, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.submitApplication(data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to submit application');
        }
    }
);

export const fetchMyApplications = createAsyncThunk(
    'kuppi/fetchMyApplications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getMyApplications();
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch applications');
        }
    }
);

export const fetchActiveApplication = createAsyncThunk(
    'kuppi/fetchActiveApplication',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getActiveApplication();
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'No active application');
        }
    }
);

export const cancelApplicationAsync = createAsyncThunk(
    'kuppi/cancelApplication',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.cancelApplication(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to cancel application');
        }
    }
);

export const checkCanApplyAsync = createAsyncThunk(
    'kuppi/checkCanApply',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.checkCanApply();
            return response.data.canApply;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to check eligibility');
        }
    }
);

export const checkIsKuppiStudentAsync = createAsyncThunk(
    'kuppi/checkIsKuppiStudent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.checkIsKuppiStudent();
            return response.data.isKuppiStudent;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to check status');
        }
    }
);

// ============================================================================
// Async Thunks - Admin
// ============================================================================

export const adminFetchApplications = createAsyncThunk(
    'kuppi/adminFetchApplications',
    async (params: KuppiPaginationParams & { status?: ApplicationStatus }, { rejectWithValue }) => {
        try {
            const { status, ...paginationParams } = params;
            const response = status
                ? await kuppiServices.adminGetApplicationsByStatus(status, paginationParams)
                : await kuppiServices.adminGetAllApplications(paginationParams);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch applications');
        }
    }
);

export const adminFetchApplicationById = createAsyncThunk(
    'kuppi/adminFetchApplicationById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminGetApplicationById(id);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch application');
        }
    }
);

export const adminFetchApplicationStats = createAsyncThunk(
    'kuppi/adminFetchApplicationStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminGetApplicationStats();
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const adminApproveApplicationAsync = createAsyncThunk(
    'kuppi/adminApproveApplication',
    async ({ id, data }: { id: number; data?: ReviewKuppiApplicationRequest }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminApproveApplication(id, data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to approve application');
        }
    }
);

export const adminRejectApplicationAsync = createAsyncThunk(
    'kuppi/adminRejectApplication',
    async ({ id, data }: { id: number; data: ReviewKuppiApplicationRequest }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminRejectApplication(id, data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to reject application');
        }
    }
);

export const adminFetchPlatformStats = createAsyncThunk(
    'kuppi/adminFetchPlatformStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminGetPlatformStats();
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch platform stats');
        }
    }
);

// ============================================================================
// Slice
// ============================================================================

const kuppiSlice = createSlice({
    name: 'kuppi',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
        },
        clearSelectedSession: (state) => {
            state.selectedSession = null;
        },
        clearSelectedNote: (state) => {
            state.selectedNote = null;
        },
        clearSelectedApplication: (state) => {
            state.selectedApplication = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        resetKuppiState: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch Sessions
        builder.addCase(fetchSessions.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchSessions.fulfilled, (state, action) => {
            state.isLoading = false;
            state.sessions = action.payload.data.content;
            state.totalSessions = action.payload.data.totalElements;
        });
        builder.addCase(fetchSessions.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Upcoming Sessions
        builder.addCase(fetchUpcomingSessions.fulfilled, (state, action) => {
            state.sessions = action.payload.data.content;
            state.totalSessions = action.payload.data.totalElements;
        });

        // Fetch Session By ID
        builder.addCase(fetchSessionById.pending, (state) => {
            state.isSessionLoading = true;
        });
        builder.addCase(fetchSessionById.fulfilled, (state, action) => {
            state.isSessionLoading = false;
            state.selectedSession = action.payload;
        });
        builder.addCase(fetchSessionById.rejected, (state, action) => {
            state.isSessionLoading = false;
            state.error = action.payload as string;
        });

        // Search Sessions
        builder.addCase(searchSessionsAsync.fulfilled, (state, action) => {
            state.sessions = action.payload.data.content;
            state.totalSessions = action.payload.data.totalElements;
        });

        // Fetch My Sessions
        builder.addCase(fetchMySessions.fulfilled, (state, action) => {
            state.mySessions = action.payload.data.content;
        });

        // Fetch My Analytics
        builder.addCase(fetchMyAnalytics.fulfilled, (state, action) => {
            state.myAnalytics = action.payload;
        });

        // Create Session
        builder.addCase(createSessionAsync.pending, (state) => {
            state.isCreating = true;
        });
        builder.addCase(createSessionAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            state.successMessage = action.payload.message || 'Session created successfully';
        });
        builder.addCase(createSessionAsync.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
        });

        // Update Session
        builder.addCase(updateSessionAsync.pending, (state) => {
            state.isUpdating = true;
        });
        builder.addCase(updateSessionAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            state.successMessage = action.payload.message || 'Session updated successfully';
        });
        builder.addCase(updateSessionAsync.rejected, (state, action) => {
            state.isUpdating = false;
            state.error = action.payload as string;
        });

        // Delete Session
        builder.addCase(deleteSessionAsync.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(deleteSessionAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.sessions = state.sessions.filter(s => s.id !== action.payload.id);
            state.mySessions = state.mySessions.filter(s => s.id !== action.payload.id);
            state.successMessage = 'Session deleted successfully';
        });
        builder.addCase(deleteSessionAsync.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Fetch Notes
        builder.addCase(fetchNotes.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchNotes.fulfilled, (state, action) => {
            state.isLoading = false;
            state.notes = action.payload.data.content;
            state.totalNotes = action.payload.data.totalElements;
        });
        builder.addCase(fetchNotes.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Note By ID
        builder.addCase(fetchNoteById.fulfilled, (state, action) => {
            state.selectedNote = action.payload;
        });

        // Fetch My Notes
        builder.addCase(fetchMyNotes.fulfilled, (state, action) => {
            state.myNotes = action.payload.data.content;
        });

        // Upload Note
        builder.addCase(uploadNoteAsync.pending, (state) => {
            state.isCreating = true;
        });
        builder.addCase(uploadNoteAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            state.successMessage = action.payload.message || 'Note uploaded successfully';
        });
        builder.addCase(uploadNoteAsync.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
        });

        // Delete Note
        builder.addCase(deleteNoteAsync.fulfilled, (state, action) => {
            state.notes = state.notes.filter(n => n.id !== action.payload.id);
            state.myNotes = state.myNotes.filter(n => n.id !== action.payload.id);
            state.successMessage = 'Note deleted successfully';
        });

        // Submit Application
        builder.addCase(submitApplicationAsync.pending, (state) => {
            state.isCreating = true;
        });
        builder.addCase(submitApplicationAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            state.activeApplication = action.payload.data;
            state.canApply = false;
            state.successMessage = action.payload.message || 'Application submitted successfully';
        });
        builder.addCase(submitApplicationAsync.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
        });

        // Fetch My Applications
        builder.addCase(fetchMyApplications.fulfilled, (state, action) => {
            state.myApplications = action.payload.data.content;
        });

        // Fetch Active Application
        builder.addCase(fetchActiveApplication.fulfilled, (state, action) => {
            state.activeApplication = action.payload;
        });

        // Cancel Application
        builder.addCase(cancelApplicationAsync.fulfilled, (state) => {
            state.activeApplication = null;
            state.canApply = true;
            state.successMessage = 'Application cancelled successfully';
        });

        // Check Can Apply
        builder.addCase(checkCanApplyAsync.fulfilled, (state, action) => {
            state.canApply = action.payload;
        });

        // Check Is Kuppi Student
        builder.addCase(checkIsKuppiStudentAsync.fulfilled, (state, action) => {
            state.isKuppiStudent = action.payload;
        });

        // Admin Fetch Applications
        builder.addCase(adminFetchApplications.pending, (state) => {
            state.isApplicationLoading = true;
        });
        builder.addCase(adminFetchApplications.fulfilled, (state, action) => {
            state.isApplicationLoading = false;
            state.allApplications = action.payload.data.content;
            state.totalApplications = action.payload.data.totalElements;
        });
        builder.addCase(adminFetchApplications.rejected, (state, action) => {
            state.isApplicationLoading = false;
            state.error = action.payload as string;
        });

        // Admin Fetch Application By ID
        builder.addCase(adminFetchApplicationById.fulfilled, (state, action) => {
            state.selectedApplication = action.payload;
        });

        // Admin Fetch Application Stats
        builder.addCase(adminFetchApplicationStats.fulfilled, (state, action) => {
            state.applicationStats = action.payload;
        });

        // Admin Approve Application
        builder.addCase(adminApproveApplicationAsync.fulfilled, (state, action) => {
            state.successMessage = action.payload.message || 'Application approved successfully';
        });

        // Admin Reject Application
        builder.addCase(adminRejectApplicationAsync.fulfilled, (state, action) => {
            state.successMessage = action.payload.message || 'Application rejected';
        });

        // Admin Fetch Platform Stats
        builder.addCase(adminFetchPlatformStats.fulfilled, (state, action) => {
            state.platformStats = action.payload;
        });
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectKuppiSessions = (state: { kuppi: KuppiState }) => state.kuppi.sessions;
export const selectKuppiMySessions = (state: { kuppi: KuppiState }) => state.kuppi.mySessions;
export const selectKuppiSelectedSession = (state: { kuppi: KuppiState }) => state.kuppi.selectedSession;
export const selectKuppiTotalSessions = (state: { kuppi: KuppiState }) => state.kuppi.totalSessions;

export const selectKuppiNotes = (state: { kuppi: KuppiState }) => state.kuppi.notes;
export const selectKuppiMyNotes = (state: { kuppi: KuppiState }) => state.kuppi.myNotes;
export const selectKuppiSelectedNote = (state: { kuppi: KuppiState }) => state.kuppi.selectedNote;
export const selectKuppiTotalNotes = (state: { kuppi: KuppiState }) => state.kuppi.totalNotes;

export const selectKuppiMyApplications = (state: { kuppi: KuppiState }) => state.kuppi.myApplications;
export const selectKuppiActiveApplication = (state: { kuppi: KuppiState }) => state.kuppi.activeApplication;
export const selectKuppiCanApply = (state: { kuppi: KuppiState }) => state.kuppi.canApply;
export const selectKuppiIsKuppiStudent = (state: { kuppi: KuppiState }) => state.kuppi.isKuppiStudent;

export const selectKuppiAllApplications = (state: { kuppi: KuppiState }) => state.kuppi.allApplications;
export const selectKuppiSelectedApplication = (state: { kuppi: KuppiState }) => state.kuppi.selectedApplication;
export const selectKuppiTotalApplications = (state: { kuppi: KuppiState }) => state.kuppi.totalApplications;
export const selectKuppiApplicationStats = (state: { kuppi: KuppiState }) => state.kuppi.applicationStats;

export const selectKuppiMyAnalytics = (state: { kuppi: KuppiState }) => state.kuppi.myAnalytics;
export const selectKuppiPlatformStats = (state: { kuppi: KuppiState }) => state.kuppi.platformStats;

export const selectKuppiCurrentPage = (state: { kuppi: KuppiState }) => state.kuppi.currentPage;
export const selectKuppiPageSize = (state: { kuppi: KuppiState }) => state.kuppi.pageSize;

export const selectKuppiIsLoading = (state: { kuppi: KuppiState }) => state.kuppi.isLoading;
export const selectKuppiIsSessionLoading = (state: { kuppi: KuppiState }) => state.kuppi.isSessionLoading;
export const selectKuppiIsNoteLoading = (state: { kuppi: KuppiState }) => state.kuppi.isNoteLoading;
export const selectKuppiIsApplicationLoading = (state: { kuppi: KuppiState }) => state.kuppi.isApplicationLoading;
export const selectKuppiIsCreating = (state: { kuppi: KuppiState }) => state.kuppi.isCreating;
export const selectKuppiIsUpdating = (state: { kuppi: KuppiState }) => state.kuppi.isUpdating;
export const selectKuppiIsDeleting = (state: { kuppi: KuppiState }) => state.kuppi.isDeleting;

export const selectKuppiError = (state: { kuppi: KuppiState }) => state.kuppi.error;
export const selectKuppiSuccessMessage = (state: { kuppi: KuppiState }) => state.kuppi.successMessage;

// ============================================================================
// Exports
// ============================================================================

export const {
    setCurrentPage: setKuppiCurrentPage,
    setPageSize: setKuppiPageSize,
    clearSelectedSession: clearKuppiSelectedSession,
    clearSelectedNote: clearKuppiSelectedNote,
    clearSelectedApplication: clearKuppiSelectedApplication,
    clearError: clearKuppiError,
    clearSuccessMessage: clearKuppiSuccessMessage,
    resetKuppiState,
} = kuppiSlice.actions;

export default kuppiSlice.reducer;


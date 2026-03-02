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
    // Kuppi Student Types
    KuppiStudentResponse,
    KuppiStudentDetailResponse,
    KuppiStudentSearchByNameParams,
    KuppiStudentSearchBySubjectParams,
    Faculty, UpdateKuppiNoteRequest,
    // Common types used below
    KuppiDateRangeParams,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

export interface KuppiState {
    // Sessions
    sessions: KuppiSessionResponse[];
    mySessions: KuppiSessionResponse[];
    selectedSession: KuppiSessionResponse | null;
    totalSessions: number;

    // Session search results (by subject/host/date)
    sessionSearchResults: KuppiSessionResponse[];
    sessionSearchTotal: number;

    // Notes
    notes: KuppiNoteResponse[];
    myNotes: KuppiNoteResponse[];
    selectedNote: KuppiNoteResponse | null;
    totalNotes: number;

    // Notes keyed by session
    notesBySession: Record<number, KuppiNoteResponse[]>;

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

    // Kuppi Students
    kuppiStudents: KuppiStudentResponse[];
    selectedKuppiStudent: KuppiStudentDetailResponse | null;
    topRatedKuppiStudents: KuppiStudentResponse[];
    totalKuppiStudents: number;
    isKuppiStudentsLoading: boolean;
    isKuppiStudentDetailLoading: boolean;



    // Analytics
    myAnalytics: {
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
        totalSessionViews: number;
        totalNotes: number;
        totalNoteViews: number;
        mostViewedSessionId: number | null;
        mostViewedSessionTitle: string | null;
        mostViewedSessionViews: number;
        mostDownloadedNoteId: number | null;
        mostDownloadedNoteTitle: string | null;
        mostDownloadedNoteDownloads: number;
    } | null;
    isAnalyticsLoading: boolean;

    // Platform Stats (Admin)
    platformStats: {
        totalSessions: number;
        totalNotes: number;
        totalParticipants: number;
        totalKuppiStudents: number;
        completedSessions: number;
        cancelledSessions: number;
        totalViews: number;
        totalDownloads: number;
        sessionsThisWeek: number;
        sessionsThisMonth: number;
        newKuppiStudentsThisMonth: number;
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

    // Upload progress keyed by session id
    uploadProgress: Record<number, number>;

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

    // Session search
    sessionSearchResults: [],
    sessionSearchTotal: 0,

    notes: [],
    myNotes: [],
    selectedNote: null,
    totalNotes: 0,

    notesBySession: {},

    myApplications: [],
    activeApplication: null,
    canApply: false,
    isKuppiStudent: false,

    allApplications: [],
    selectedApplication: null,
    totalApplications: 0,
    applicationStats: null,

    // Kuppi Students
    kuppiStudents: [],
    selectedKuppiStudent: null,
    topRatedKuppiStudents: [],
    totalKuppiStudents: 0,
    isKuppiStudentsLoading: false,
    isKuppiStudentDetailLoading: false,

    myAnalytics: null,
    isAnalyticsLoading: false,
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

    // Initialize upload progress map
    uploadProgress: {},

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
    async ({ data, files }: { data: CreateKuppiSessionRequest; files?: File[] }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.createSession(data, files);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to create session with files');
        }
    }
);

export const updateSessionAsync = createAsyncThunk(
    'kuppi/updateSessionWithFiles',
    async ({ id, data, files, removeNoteIds, onProgress }: { id: number; data?: Partial<UpdateKuppiSessionRequest>; files?: File[]; removeNoteIds?: number[] | string; onProgress?: (percent: number) => void }, { rejectWithValue, dispatch }) => {
        try {
            const response = await kuppiServices.updateSession(id, data, files, removeNoteIds, onProgress ? (percent: number) => {
                dispatch(setKuppiUploadProgress({ id, percent }));
                onProgress(percent);
            } : undefined);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to update session with files');
        }
    }
);

export const deleteSessionAsync = createAsyncThunk(
    'kuppi/softDeleteSessionWithFiles',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.deleteSession(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to soft-delete session with files');
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

// New: Admin soft-delete session (calls admin-specific endpoint)
export const adminSoftDeleteSessionAsync = createAsyncThunk(
    'kuppi/adminSoftDeleteSession',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminSoftDeleteSession(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to delete session (admin)');
        }
    }
);

// New: Admin soft-delete note (calls admin-specific endpoint)
export const adminSoftDeleteNoteAsync = createAsyncThunk(
    'kuppi/adminSoftDeleteNote',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminSoftDeleteNote(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to delete note (admin)');
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

export const searchNotesAsync = createAsyncThunk(
    'kuppi/searchNotes',
    async (params: KuppiSearchParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchNotes(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search notes');
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

export const updateNoteAsync = createAsyncThunk(
    'kuppi/updateNote',
    async ({ id, data }: { id: number; data: UpdateKuppiNoteRequest }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.updateNote(id, data);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to update note');
        }
    }
);

// ============================================================================
// Async Thunks - Applications (Student)
// ============================================================================

export const submitApplicationAsync = createAsyncThunk(
    'kuppi/submitApplication',
    async ({ data, academicResults }: { data: CreateKuppiApplicationRequest; academicResults: File }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.submitApplication(data, academicResults);
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
            const err = error as any;
            return rejectWithValue(err?.response?.data?.message || 'Failed to fetch applications');
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

export const adminSearchApplicationsAsync = createAsyncThunk(
    'kuppi/adminSearchApplications',
    async (params: KuppiSearchParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.adminSearchApplications(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search applications');
        }
    }
);

// ============================================================================
// Async Thunks - Kuppi Students
// ============================================================================

export const fetchKuppiStudents = createAsyncThunk(
    'kuppi/fetchKuppiStudents',
    async (params: KuppiPaginationParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getAllKuppiStudents(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch Kuppi students');
        }
    }
);

export const fetchKuppiStudentById = createAsyncThunk(
    'kuppi/fetchKuppiStudentById',
    async (studentId: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getKuppiStudentById(studentId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch Kuppi student details');
        }
    }
);

export const searchKuppiStudentsByNameAsync = createAsyncThunk(
    'kuppi/searchKuppiStudentsByName',
    async (params: KuppiStudentSearchByNameParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchKuppiStudentsByName(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search Kuppi students');
        }
    }
);

export const searchKuppiStudentsBySubjectAsync = createAsyncThunk(
    'kuppi/searchKuppiStudentsBySubject',
    async (params: KuppiStudentSearchBySubjectParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchKuppiStudentsBySubject(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search Kuppi students by subject');
        }
    }
);

export const fetchKuppiStudentsByFaculty = createAsyncThunk(
    'kuppi/fetchKuppiStudentsByFaculty',
    async ({ faculty, params }: { faculty: Faculty; params?: KuppiPaginationParams }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getKuppiStudentsByFaculty(faculty, params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch Kuppi students by faculty');
        }
    }
);

export const rescheduleSessionAsync = createAsyncThunk(
    'kuppi/rescheduleSession',
    async ({ id, newStartTime, newEndTime }: { id: number; newStartTime: string; newEndTime: string }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.rescheduleSession(id, newStartTime, newEndTime);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to reschedule session');
        }
    }
);

export const searchSessionsBySubjectAsync = createAsyncThunk(
    'kuppi/searchSessionsBySubject',
    async ({ subject, params }: { subject: string; params?: KuppiPaginationParams }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchSessionsBySubject(subject, params || {});
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search sessions by subject');
        }
    }
);

export const searchSessionsByHostAsync = createAsyncThunk(
    'kuppi/searchSessionsByHost',
    async ({ hostName, params }: { hostName: string; params?: KuppiPaginationParams }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchSessionsByHost(hostName, params || {});
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search sessions by host');
        }
    }
);

export const searchSessionsByDateRangeAsync = createAsyncThunk(
    'kuppi/searchSessionsByDateRange',
    async (params: KuppiDateRangeParams, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.searchSessionsByDateRange(params);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to search sessions by date range');
        }
    }
);

export const fetchNotesBySessionAsync = createAsyncThunk(
    'kuppi/fetchNotesBySession',
    async (sessionId: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.getNotesBySession(sessionId);
            return { sessionId, data: response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch notes by session');
        }
    }
);

// Super Admin Services

export const PermanentDeleteApplication = createAsyncThunk(
    'kuppi/superAdminPermanentDeleteApplication',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.superAdminPermanentDeleteApplication(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to permanently delete application');
        }
    }
)

export const PermanentDeleteSession = createAsyncThunk(
    'kuppi/superAdminPermanentDeleteSession',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.superAdminPermanentDeleteSession(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to permanently delete session');
        }
    }
)

export const PermanentDeleteNote = createAsyncThunk(
    'kuppi/superAdminPermanentDeleteNote',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.superAdminPermanentDeleteNote(id);
            return { id, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to permanently delete note');
        }
    }
)

export const RevokeKuppiRole = createAsyncThunk(
    'kuppi/superAdminRevokeKuppiRole',
    async ({ userId, reason }: { userId: number; reason: string }, { rejectWithValue }) => {
        try {
            const response = await kuppiServices.superAdminRevokeKuppiRole(userId, reason);
            return { userId, response };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to revoke Kuppi role');
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
        clearSelectedKuppiStudent: (state) => {
            state.selectedKuppiStudent = null;
        },

        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        resetKuppiState: () => initialState,

        // Set upload progress for a session id (percent 0-100)
        setUploadProgress: (state, action: PayloadAction<{ id: number; percent: number }>) => {
            const { id, percent } = action.payload;
            state.uploadProgress = { ...state.uploadProgress, [id]: percent };
        },
        // Clear upload progress for session id(s)
        clearUploadProgress: (state, action: PayloadAction<number | number[] | undefined>) => {
            if (!action.payload) {
                state.uploadProgress = {};
                return;
            }
            const keysToClear = Array.isArray(action.payload) ? action.payload : [action.payload];
            const next = { ...state.uploadProgress };
            keysToClear.forEach((k) => delete next[k]);
            state.uploadProgress = next;
        },
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
            // If the API included notes inside the session payload, store them in notesBySession for easy access
            try {
                const sess: any = action.payload;
                if (sess && typeof sess.id === 'number' && Array.isArray(sess.notes) && sess.notes.length > 0) {
                    state.notesBySession = { ...state.notesBySession, [sess.id]: sess.notes };
                }
            } catch (e) {
                // ignore
            }
        });
        builder.addCase(fetchSessionById.rejected, (state, action) => {
            state.isSessionLoading = false;
            state.error = action.payload as string;
        });

        // Search Sessions
        builder.addCase(searchSessionsAsync.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(searchSessionsAsync.fulfilled, (state, action) => {
            state.isLoading = false;
            state.sessions = action.payload.data.content;
            state.totalSessions = action.payload.data.totalElements;
        });
        builder.addCase(searchSessionsAsync.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch My Sessions
        builder.addCase(fetchMySessions.fulfilled, (state, action) => {
            state.mySessions = action.payload.data.content;
        });

        // Fetch My Analytics
        builder.addCase(fetchMyAnalytics.pending, (state) => {
            state.isAnalyticsLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMyAnalytics.fulfilled, (state, action) => {
            state.isAnalyticsLoading = false;
            state.myAnalytics = action.payload;
        });
        builder.addCase(fetchMyAnalytics.rejected, (state, action) => {
            state.isAnalyticsLoading = false;
            state.error = action.payload as string;
        });

        // Admin: Soft-delete session (remove from lists)
        builder.addCase(adminSoftDeleteSessionAsync.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(adminSoftDeleteSessionAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            const id = action.payload?.id;
            if (typeof id === 'number') {
                state.sessions = state.sessions.filter(s => s.id !== id);
                state.mySessions = state.mySessions.filter(s => s.id !== id);
                if (state.selectedSession?.id === id) state.selectedSession = null;
                state.totalSessions = Math.max(0, state.totalSessions - 1);
                state.successMessage = action.payload.response?.message || 'Session deleted successfully (admin)';
            }
        });
        builder.addCase(adminSoftDeleteSessionAsync.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Admin: Soft-delete note (remove from lists)
        builder.addCase(adminSoftDeleteNoteAsync.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(adminSoftDeleteNoteAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            const id = action.payload?.id;
            if (typeof id === 'number') {
                state.notes = state.notes.filter(n => n.id !== id);
                state.myNotes = state.myNotes.filter(n => n.id !== id);
                if (state.selectedNote?.id === id) state.selectedNote = null;
                state.totalNotes = Math.max(0, state.totalNotes - 1);
                // Also remove from notesBySession
                for (const sessionId of Object.keys(state.notesBySession)) {
                    state.notesBySession[Number(sessionId)] = state.notesBySession[Number(sessionId)].filter(n => n.id !== id);
                }
                state.successMessage = action.payload.response?.message || 'Note deleted successfully (admin)';
            }
        });
        builder.addCase(adminSoftDeleteNoteAsync.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Create Session (with files)
        builder.addCase(createSessionAsync.pending, (state) => {
            state.isCreating = true;
        });
        builder.addCase(createSessionAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            state.successMessage = action.payload?.message || 'Session created successfully';
            const created = action.payload?.data;
            if (created) {
                // add to top of lists
                state.sessions = [created as any, ...state.sessions];
                state.mySessions = [created as any, ...state.mySessions];
                state.totalSessions = (state.totalSessions || 0) + 1;
            }
        });
        builder.addCase(createSessionAsync.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
        });

        // Update Session (with files)
        builder.addCase(updateSessionAsync.pending, (state) => {
            state.isUpdating = true;
        });
        builder.addCase(updateSessionAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            state.successMessage = action.payload?.message || 'Session updated successfully';
            const updated = action.payload?.data;
            if (updated) {
                state.sessions = state.sessions.map(s => (s.id === updated.id ? updated : s));
                state.mySessions = state.mySessions.map(s => (s.id === updated.id ? updated : s));
                if (state.selectedSession?.id === updated.id) state.selectedSession = updated;
            }
        });
        builder.addCase(updateSessionAsync.rejected, (state, action) => {
            state.isUpdating = false;
            state.error = action.payload as string;
        });

        // Soft-delete Session (with files) - student owner endpoint
        builder.addCase(deleteSessionAsync.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(deleteSessionAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            const id = action.payload?.id;
            if (typeof id === 'number') {
                state.sessions = state.sessions.filter(s => s.id !== id);
                state.mySessions = state.mySessions.filter(s => s.id !== id);
                if (state.selectedSession?.id === id) state.selectedSession = null;
                state.totalSessions = Math.max(0, state.totalSessions - 1);
                state.successMessage = action.payload.response?.message || 'Session deleted successfully';
            }
        });
        builder.addCase(deleteSessionAsync.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Fetch Notes
        builder.addCase(fetchNotes.pending, (state) => {
            state.isNoteLoading = true;
            state.error = null;
        });
        builder.addCase(fetchNotes.fulfilled, (state, action) => {
            state.isNoteLoading = false;
            state.notes = action.payload.data?.content || [];
            state.totalNotes = action.payload.data?.totalElements || 0;
        });
        builder.addCase(fetchNotes.rejected, (state, action) => {
            state.isNoteLoading = false;
            state.notes = [];
            state.error = action.payload as string;
        });

        // Fetch Notes By Session (store notes keyed by session id)
        builder.addCase(fetchNotesBySessionAsync.pending, (state) => {
            // keep global flag minimal; we could add per-session loading in future
            state.isNoteLoading = true;
            state.error = null;
        });
        builder.addCase(fetchNotesBySessionAsync.fulfilled, (state, action) => {
            state.isNoteLoading = false;
            const sessionId = action.payload?.sessionId;
            // action.payload.data is a KuppiNotesResponse (has .data.content)
            const notes = action.payload?.data?.data?.content || [];
            if (typeof sessionId === 'number') {
                state.notesBySession = { ...state.notesBySession, [sessionId]: notes };
            }
        });
        builder.addCase(fetchNotesBySessionAsync.rejected, (state, action) => {
            state.isNoteLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Note By ID
        builder.addCase(fetchNoteById.fulfilled, (state, action) => {
            state.selectedNote = action.payload;
        });

        // Fetch My Notes
        builder.addCase(fetchMyNotes.pending, (state) => {
            state.isNoteLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMyNotes.fulfilled, (state, action) => {
            state.isNoteLoading = false;
            state.myNotes = action.payload.data?.content || [];
        });
        builder.addCase(fetchMyNotes.rejected, (state, action) => {
            state.isNoteLoading = false;
            state.myNotes = [];
            state.error = action.payload as string;
        });

        // Search Notes
        builder.addCase(searchNotesAsync.pending, (state) => {
            state.isNoteLoading = true;
            state.error = null;
        });
        builder.addCase(searchNotesAsync.fulfilled, (state, action) => {
            state.isNoteLoading = false;
            state.notes = action.payload.data?.content || [];
            state.totalNotes = action.payload.data?.totalElements || 0;
        });
        builder.addCase(searchNotesAsync.rejected, (state, action) => {
            state.isNoteLoading = false;
            state.error = action.payload as string;
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

        // Update Note
        builder.addCase(updateNoteAsync.pending, (state) => {
            state.isCreating = true;
        });
        builder.addCase(updateNoteAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            if (action.payload.data) {
                state.selectedNote = action.payload.data;
            }
            state.successMessage = action.payload.message || 'Note updated successfully';
        });
        builder.addCase(updateNoteAsync.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
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
        builder.addCase(fetchMyApplications.pending, (state) => {
            state.isApplicationLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMyApplications.fulfilled, (state, action) => {
            state.isApplicationLoading = false;
            // Handle all possible response shapes:
            // 1. { success, data: [...] }  (standard API response)
            // 2. { success, data: { content: [...] } }  (paginated)
            // 3. [...] (raw array)
            const payload = action.payload;
            let applications: any[] = [];

            if (Array.isArray(payload)) {
                // Direct array
                applications = payload;
            } else if (payload && typeof payload === 'object') {
                const data = (payload as any).data;
                if (Array.isArray(data)) {
                    // { data: [...] }
                    applications = data;
                } else if (data && Array.isArray(data.content)) {
                    // { data: { content: [...] } }
                    applications = data.content;
                } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                    // Single application object wrapped: { data: { id, status, ... } }
                    applications = [data];
                }
            }

            state.myApplications = applications;
        });
        builder.addCase(fetchMyApplications.rejected, (state, action) => {
            state.isApplicationLoading = false;
            state.error = action.payload as string;
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

        // Admin Search Applications
        builder.addCase(adminSearchApplicationsAsync.pending, (state) => {
            state.isApplicationLoading = true;
        });
        builder.addCase(adminSearchApplicationsAsync.fulfilled, (state, action) => {
            state.isApplicationLoading = false;
            state.allApplications = action.payload.data.content;
            state.totalApplications = action.payload.data.totalElements;
        });
        builder.addCase(adminSearchApplicationsAsync.rejected, (state, action) => {
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

        // ============================================================================
        // Kuppi Students Reducers
        // ============================================================================

        // Fetch Kuppi Students
        builder.addCase(fetchKuppiStudents.pending, (state) => {
            state.isKuppiStudentsLoading = true;
            state.error = null;
        });
        builder.addCase(fetchKuppiStudents.fulfilled, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.kuppiStudents = action.payload.data.content;
            state.totalKuppiStudents = action.payload.data.totalElements;
        });
        builder.addCase(fetchKuppiStudents.rejected, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Kuppi Student By ID
        builder.addCase(fetchKuppiStudentById.pending, (state) => {
            state.isKuppiStudentDetailLoading = true;
            state.error = null;
        });
        builder.addCase(fetchKuppiStudentById.fulfilled, (state, action) => {
            state.isKuppiStudentDetailLoading = false;
            state.selectedKuppiStudent = action.payload;
        });
        builder.addCase(fetchKuppiStudentById.rejected, (state, action) => {
            state.isKuppiStudentDetailLoading = false;
            state.error = action.payload as string;
        });

        // Search Kuppi Students By Name
        builder.addCase(searchKuppiStudentsByNameAsync.pending, (state) => {
            state.isKuppiStudentsLoading = true;
            state.error = null;
        });
        builder.addCase(searchKuppiStudentsByNameAsync.fulfilled, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.kuppiStudents = action.payload.data.content;
            state.totalKuppiStudents = action.payload.data.totalElements;
        });
        builder.addCase(searchKuppiStudentsByNameAsync.rejected, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.error = action.payload as string;
        });

        // Search Kuppi Students By Subject
        builder.addCase(searchKuppiStudentsBySubjectAsync.pending, (state) => {
            state.isKuppiStudentsLoading = true;
            state.error = null;
        });
        builder.addCase(searchKuppiStudentsBySubjectAsync.fulfilled, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.kuppiStudents = action.payload.data.content;
            state.totalKuppiStudents = action.payload.data.totalElements;
        });
        builder.addCase(searchKuppiStudentsBySubjectAsync.rejected, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Kuppi Students By Faculty
        builder.addCase(fetchKuppiStudentsByFaculty.pending, (state) => {
            state.isKuppiStudentsLoading = true;
            state.error = null;
        });
        builder.addCase(fetchKuppiStudentsByFaculty.fulfilled, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.kuppiStudents = action.payload.data.content;
            state.totalKuppiStudents = action.payload.data.totalElements;
        });
        builder.addCase(fetchKuppiStudentsByFaculty.rejected, (state, action) => {
            state.isKuppiStudentsLoading = false;
            state.error = action.payload as string;
        });

        // ============================================================================
        // Super Admin Reducers
        // ============================================================================

        // Super Admin: Permanent Delete Application
        builder.addCase(PermanentDeleteApplication.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(PermanentDeleteApplication.fulfilled, (state, action) => {
            state.isDeleting = false;
            const id = action.payload.id;
            state.allApplications = state.allApplications.filter(a => a.id !== id);
            state.myApplications = state.myApplications.filter(a => a.id !== id);
            if (state.selectedApplication?.id === id) state.selectedApplication = null;
            if (state.activeApplication?.id === id) state.activeApplication = null;
            state.totalApplications = Math.max(0, state.totalApplications - 1);
            state.successMessage = action.payload.response?.message || 'Application permanently deleted';
        });
        builder.addCase(PermanentDeleteApplication.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Super Admin: Permanent Delete Session
        builder.addCase(PermanentDeleteSession.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(PermanentDeleteSession.fulfilled, (state, action) => {
            state.isDeleting = false;
            const id = action.payload.id;
            state.sessions = state.sessions.filter(s => s.id !== id);
            state.mySessions = state.mySessions.filter(s => s.id !== id);
            if (state.selectedSession?.id === id) state.selectedSession = null;
            state.totalSessions = Math.max(0, state.totalSessions - 1);
            state.successMessage = action.payload.response?.message || 'Session permanently deleted';
        });
        builder.addCase(PermanentDeleteSession.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Super Admin: Permanent Delete Note
        builder.addCase(PermanentDeleteNote.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(PermanentDeleteNote.fulfilled, (state, action) => {
            state.isDeleting = false;
            const id = action.payload.id;
            state.notes = state.notes.filter(n => n.id !== id);
            state.myNotes = state.myNotes.filter(n => n.id !== id);
            if (state.selectedNote?.id === id) state.selectedNote = null;
            state.totalNotes = Math.max(0, state.totalNotes - 1);
            // Also remove from notesBySession
            for (const sessionId of Object.keys(state.notesBySession)) {
                state.notesBySession[Number(sessionId)] = state.notesBySession[Number(sessionId)].filter(n => n.id !== id);
            }
            state.successMessage = action.payload.response?.message || 'Note permanently deleted';
        });
        builder.addCase(PermanentDeleteNote.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
        });

        // Super Admin: Revoke Kuppi Role
        builder.addCase(RevokeKuppiRole.pending, (state) => {
            state.isDeleting = true;
        });
        builder.addCase(RevokeKuppiRole.fulfilled, (state, action) => {
            state.isDeleting = false;
            const userId = action.payload.userId;
            state.kuppiStudents = state.kuppiStudents.filter(s => s.id !== userId);
            state.totalKuppiStudents = Math.max(0, state.totalKuppiStudents - 1);
            if (state.selectedKuppiStudent?.id === userId) {
                state.selectedKuppiStudent = null;
            }
            state.successMessage = action.payload.response?.message || 'Kuppi role revoked successfully';
        });
        builder.addCase(RevokeKuppiRole.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload as string;
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

export const selectKuppiSessionSearchResults = (state: { kuppi: KuppiState }) => state.kuppi.sessionSearchResults;
export const selectKuppiSessionSearchTotal = (state: { kuppi: KuppiState }) => state.kuppi.sessionSearchTotal;

export const selectKuppiNotes = (state: { kuppi: KuppiState }) => state.kuppi.notes;
export const selectKuppiMyNotes = (state: { kuppi: KuppiState }) => state.kuppi.myNotes;
export const selectKuppiSelectedNote = (state: { kuppi: KuppiState }) => state.kuppi.selectedNote;
export const selectKuppiTotalNotes = (state: { kuppi: KuppiState }) => state.kuppi.totalNotes;

export const selectKuppiNotesBySession = (sessionId: number) => (state: { kuppi: KuppiState }) => state.kuppi.notesBySession[sessionId] || [];

// Additional selectors expected across the app
export const selectKuppiAllApplications = (state: { kuppi: KuppiState }) => state.kuppi.allApplications;
export const selectKuppiTotalApplications = (state: { kuppi: KuppiState }) => state.kuppi.totalApplications;
export const selectKuppiApplicationStats = (state: { kuppi: KuppiState }) => state.kuppi.applicationStats;
export const selectKuppiSelectedApplication = (state: { kuppi: KuppiState }) => state.kuppi.selectedApplication;
export const selectKuppiPlatformStats = (state: { kuppi: KuppiState }) => state.kuppi.platformStats;
export const selectKuppiMyAnalytics = (state: { kuppi: KuppiState }) => state.kuppi.myAnalytics;
export const selectKuppiIsAnalyticsLoading = (state: { kuppi: KuppiState }) => state.kuppi.isAnalyticsLoading;

export const selectKuppiCanApply = (state: { kuppi: KuppiState }) => state.kuppi.canApply;
export const selectKuppiIsKuppiStudent = (state: { kuppi: KuppiState }) => state.kuppi.isKuppiStudent;
export const selectKuppiMyApplications = (state: { kuppi: KuppiState }) => state.kuppi.myApplications;
export const selectKuppiActiveApplication = (state: { kuppi: KuppiState }) => state.kuppi.activeApplication;

export const selectKuppiStudents = (state: { kuppi: KuppiState }) => state.kuppi.kuppiStudents;
export const selectTopRatedKuppiStudents = (state: { kuppi: KuppiState }) => state.kuppi.topRatedKuppiStudents;
export const selectTotalKuppiStudents = (state: { kuppi: KuppiState }) => state.kuppi.totalKuppiStudents;
export const selectKuppiStudentsLoading = (state: { kuppi: KuppiState }) => state.kuppi.isKuppiStudentsLoading;
export const selectSelectedKuppiStudent = (state: { kuppi: KuppiState }) => state.kuppi.selectedKuppiStudent;
export const selectKuppiStudentDetailLoading = (state: { kuppi: KuppiState }) => state.kuppi.isKuppiStudentDetailLoading;

export const selectKuppiCurrentPage = (state: { kuppi: KuppiState }) => state.kuppi.currentPage;
export const selectKuppiPageSize = (state: { kuppi: KuppiState }) => state.kuppi.pageSize;

export const selectKuppiIsLoading = (state: { kuppi: KuppiState }) => state.kuppi.isLoading;
export const selectKuppiIsSessionLoading = (state: { kuppi: KuppiState }) => state.kuppi.isSessionLoading;
export const selectKuppiIsNoteLoading = (state: { kuppi: KuppiState }) => state.kuppi.isNoteLoading;
export const selectKuppiIsApplicationLoading = (state: { kuppi: KuppiState }) => state.kuppi.isApplicationLoading;
export const selectKuppiIsCreating = (state: { kuppi: KuppiState }) => state.kuppi.isCreating;
export const selectKuppiIsUpdating = (state: { kuppi: KuppiState }) => state.kuppi.isUpdating;
export const selectKuppiIsDeleting = (state: { kuppi: KuppiState }) => state.kuppi.isDeleting;
export const selectKuppiUploadProgress = (state: { kuppi: KuppiState }) => state.kuppi.uploadProgress;

export const selectKuppiError = (state: { kuppi: KuppiState }) => state.kuppi.error;
export const selectKuppiSuccessMessage = (state: { kuppi: KuppiState }) => state.kuppi.successMessage;

// ============================================================================
// Backwards-compatibility aliases for older thunk names used across the app
export const createSessionWithFilesAsync = createSessionAsync;
export const updateSessionWithFilesAsync = updateSessionAsync;
export const softDeleteSessionWithFilesAsync = deleteSessionAsync;

// ============================================================================
// Exports
// ============================================================================

export const {
    setCurrentPage: setKuppiCurrentPage,
    setPageSize: setKuppiPageSize,
    clearSelectedSession: clearKuppiSelectedSession,
    clearSelectedNote: clearKuppiSelectedNote,
    clearSelectedApplication: clearKuppiSelectedApplication,
    clearSelectedKuppiStudent: clearKuppiSelectedKuppiStudent,

    clearError: clearKuppiError,
    clearSuccessMessage: clearKuppiSuccessMessage,
    resetKuppiState,
    setUploadProgress: setKuppiUploadProgress,
    clearUploadProgress: clearKuppiUploadProgress,
} = kuppiSlice.actions;

export default kuppiSlice.reducer;


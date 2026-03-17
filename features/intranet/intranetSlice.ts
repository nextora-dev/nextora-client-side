/**
 * @fileoverview Intranet Module Redux Slice
 * @description State management for intranet content sections
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as intranetServices from './services';
import type {
    StudentComplaintCategory,
    AcademicCalendarSummary,
    ProgramSummary,
    FoundationCategory,
    StudentsRelationsUnit,
    StudentPolicySummary,
    MitigationFormSummary,
    StaffCategorySummary,
    InfoCategorySummary,
    ScheduleCategorySummary,
    // Detail types
    StudentComplaintDetail,
    AcademicCalendarDetail,
    ProgramDetail,
    StudentPolicyDetail,
    MitigationFormDetail,
    ScheduleDetail,
    StaffSocData,
    StaffCommonInfo,
    StaffMailGroups,
    StaffDocArchive,
    StaffContacts,
    CourseDetails,
    HousesInfo,
    StudentsUnionInfo,
    ClubsAndSocieties,
    HelpDeskVideoSeries,
    FoundationAcademicCalendar,
    FoundationProgramSpec,
    FoundationContactDetails,
    FoundationTimeTable,
    FoundationAssessmentSchedule,
    FoundationLmsDetails,
    FoundationMitigationForm,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

export interface IntranetState {
    // List data
    scheduleCategories: ScheduleCategorySummary[];
    studentComplaints: StudentComplaintCategory[];
    academicCalendars: AcademicCalendarSummary[];
    undergraduatePrograms: ProgramSummary[];
    postgraduatePrograms: ProgramSummary[];
    foundationCategories: FoundationCategory[];
    studentsRelationsUnit: StudentsRelationsUnit | null;
    studentPolicies: StudentPolicySummary[];
    mitigationForms: MitigationFormSummary[];
    staffCategories: StaffCategorySummary[];
    infoCategories: InfoCategorySummary[];

    // Detail data (cached by slug)
    scheduleDetails: Record<string, ScheduleDetail>;
    complaintDetails: Record<string, StudentComplaintDetail>;
    calendarDetails: Record<string, AcademicCalendarDetail>;
    undergraduateDetails: Record<string, ProgramDetail>;
    postgraduateDetails: Record<string, ProgramDetail>;
    policyDetails: Record<string, StudentPolicyDetail>;
    mitigationFormDetails: Record<string, MitigationFormDetail>;

    // Staff detail data
    staffSoc: StaffSocData | null;
    staffCommonInfo: StaffCommonInfo | null;
    staffMailGroups: StaffMailGroups | null;
    staffDocArchive: StaffDocArchive | null;
    staffContacts: StaffContacts | null;

    // Info detail data
    courseDetails: CourseDetails | null;
    housesInfo: HousesInfo | null;
    studentsUnionInfo: StudentsUnionInfo | null;
    clubsAndSocieties: ClubsAndSocieties | null;

    // SRU detail
    helpDeskVideoSeries: HelpDeskVideoSeries | null;

    // Foundation detail data
    foundationAcademicCalendar: FoundationAcademicCalendar | null;
    foundationProgramSpec: FoundationProgramSpec | null;
    foundationContactDetails: FoundationContactDetails | null;
    foundationTimeTable: FoundationTimeTable | null;
    foundationAssessmentSchedule: FoundationAssessmentSchedule | null;
    foundationLmsDetails: FoundationLmsDetails | null;
    foundationMitigationForm: FoundationMitigationForm | null;

    // Loading states
    isLoading: boolean;
    isDetailLoading: boolean;
    error: string | null;
}

const initialState: IntranetState = {
    scheduleCategories: [],
    studentComplaints: [],
    academicCalendars: [],
    undergraduatePrograms: [],
    postgraduatePrograms: [],
    foundationCategories: [],
    studentsRelationsUnit: null,
    studentPolicies: [],
    mitigationForms: [],
    staffCategories: [],
    infoCategories: [],

    scheduleDetails: {},
    complaintDetails: {},
    calendarDetails: {},
    undergraduateDetails: {},
    postgraduateDetails: {},
    policyDetails: {},
    mitigationFormDetails: {},

    staffSoc: null,
    staffCommonInfo: null,
    staffMailGroups: null,
    staffDocArchive: null,
    staffContacts: null,

    courseDetails: null,
    housesInfo: null,
    studentsUnionInfo: null,
    clubsAndSocieties: null,

    helpDeskVideoSeries: null,

    foundationAcademicCalendar: null,
    foundationProgramSpec: null,
    foundationContactDetails: null,
    foundationTimeTable: null,
    foundationAssessmentSchedule: null,
    foundationLmsDetails: null,
    foundationMitigationForm: null,

    isLoading: false,
    isDetailLoading: false,
    error: null,
};

// ============================================================================
// Async Thunks – List Fetches
// ============================================================================

export const fetchScheduleCategories = createAsyncThunk(
    'intranet/fetchScheduleCategories',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getScheduleCategories(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStudentComplaints = createAsyncThunk(
    'intranet/fetchStudentComplaints',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStudentComplaints(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchAcademicCalendars = createAsyncThunk(
    'intranet/fetchAcademicCalendars',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getAcademicCalendars(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchUndergraduatePrograms = createAsyncThunk(
    'intranet/fetchUndergraduatePrograms',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getUndergraduatePrograms(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchPostgraduatePrograms = createAsyncThunk(
    'intranet/fetchPostgraduatePrograms',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getPostgraduatePrograms(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationCategories = createAsyncThunk(
    'intranet/fetchFoundationCategories',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationProgram(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStudentsRelationsUnit = createAsyncThunk(
    'intranet/fetchStudentsRelationsUnit',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStudentsRelationsUnit(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStudentPolicies = createAsyncThunk(
    'intranet/fetchStudentPolicies',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStudentPolicies(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchMitigationForms = createAsyncThunk(
    'intranet/fetchMitigationForms',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getMitigationForms(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStaffCategories = createAsyncThunk(
    'intranet/fetchStaffCategories',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStaffCategories(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchInfoCategories = createAsyncThunk(
    'intranet/fetchInfoCategories',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getInfoCategories(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

// ============================================================================
// Async Thunks – Detail Fetches
// ============================================================================

export const fetchScheduleDetail = createAsyncThunk(
    'intranet/fetchScheduleDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getScheduleBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchComplaintDetail = createAsyncThunk(
    'intranet/fetchComplaintDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getStudentComplaintBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchCalendarDetail = createAsyncThunk(
    'intranet/fetchCalendarDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getAcademicCalendarBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchUndergraduateDetail = createAsyncThunk(
    'intranet/fetchUndergraduateDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getUndergraduateProgramBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchPostgraduateDetail = createAsyncThunk(
    'intranet/fetchPostgraduateDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getPostgraduateProgramBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchPolicyDetail = createAsyncThunk(
    'intranet/fetchPolicyDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getStudentPolicyBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchMitigationFormDetail = createAsyncThunk(
    'intranet/fetchMitigationFormDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            const data = await intranetServices.getMitigationFormBySlug(slug);
            return { slug, data };
        } catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

// Staff detail thunks
export const fetchStaffSoc = createAsyncThunk(
    'intranet/fetchStaffSoc',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStaffSoc(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStaffCommonInfo = createAsyncThunk(
    'intranet/fetchStaffCommonInfo',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStaffCommonInfo(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStaffMailGroups = createAsyncThunk(
    'intranet/fetchStaffMailGroups',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStaffMailGroups(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStaffDocArchive = createAsyncThunk(
    'intranet/fetchStaffDocArchive',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStaffDocArchive(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStaffContacts = createAsyncThunk(
    'intranet/fetchStaffContacts',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStaffContacts(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

// Info detail thunks
export const fetchCourseDetails = createAsyncThunk(
    'intranet/fetchCourseDetails',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getCourseDetails(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchHousesInfo = createAsyncThunk(
    'intranet/fetchHousesInfo',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getHousesInfo(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchStudentsUnionInfo = createAsyncThunk(
    'intranet/fetchStudentsUnionInfo',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getStudentsUnionInfo(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchClubsAndSocieties = createAsyncThunk(
    'intranet/fetchClubsAndSocieties',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getClubsAndSocieties(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchHelpDeskVideoSeries = createAsyncThunk(
    'intranet/fetchHelpDeskVideoSeries',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getHelpDeskVideoSeries(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

// Foundation detail thunks
export const fetchFoundationAcademicCalendar = createAsyncThunk(
    'intranet/fetchFoundationAcademicCalendar',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationAcademicCalendar(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationProgramSpec = createAsyncThunk(
    'intranet/fetchFoundationProgramSpec',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationProgramSpec(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationContactDetails = createAsyncThunk(
    'intranet/fetchFoundationContactDetails',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationContactDetails(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationTimeTable = createAsyncThunk(
    'intranet/fetchFoundationTimeTable',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationTimeTable(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationAssessmentSchedule = createAsyncThunk(
    'intranet/fetchFoundationAssessmentSchedule',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationAssessmentSchedule(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationLmsDetails = createAsyncThunk(
    'intranet/fetchFoundationLmsDetails',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationLmsDetails(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

export const fetchFoundationMitigationForm = createAsyncThunk(
    'intranet/fetchFoundationMitigationForm',
    async (_, { rejectWithValue }) => {
        try { return await intranetServices.getFoundationMitigationForm(); }
        catch (e: any) { return rejectWithValue(e?.response?.data?.message || e.message); }
    },
);

// ============================================================================
// Slice
// ============================================================================

const intranetSlice = createSlice({
    name: 'intranet',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        resetIntranet: () => initialState,
    },
    extraReducers: (builder) => {
        // ---------- List fetches ----------
        // Schedules
        builder.addCase(fetchScheduleCategories.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchScheduleCategories.fulfilled, (state, action) => { state.isLoading = false; state.scheduleCategories = action.payload; });
        builder.addCase(fetchScheduleCategories.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Student Complaints
        builder.addCase(fetchStudentComplaints.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchStudentComplaints.fulfilled, (state, action) => { state.isLoading = false; state.studentComplaints = action.payload; });
        builder.addCase(fetchStudentComplaints.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Academic Calendars
        builder.addCase(fetchAcademicCalendars.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchAcademicCalendars.fulfilled, (state, action) => { state.isLoading = false; state.academicCalendars = action.payload; });
        builder.addCase(fetchAcademicCalendars.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Undergraduate
        builder.addCase(fetchUndergraduatePrograms.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchUndergraduatePrograms.fulfilled, (state, action) => { state.isLoading = false; state.undergraduatePrograms = action.payload; });
        builder.addCase(fetchUndergraduatePrograms.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Postgraduate
        builder.addCase(fetchPostgraduatePrograms.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchPostgraduatePrograms.fulfilled, (state, action) => { state.isLoading = false; state.postgraduatePrograms = action.payload; });
        builder.addCase(fetchPostgraduatePrograms.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Foundation
        builder.addCase(fetchFoundationCategories.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchFoundationCategories.fulfilled, (state, action) => { state.isLoading = false; state.foundationCategories = action.payload; });
        builder.addCase(fetchFoundationCategories.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // SRU
        builder.addCase(fetchStudentsRelationsUnit.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchStudentsRelationsUnit.fulfilled, (state, action) => { state.isLoading = false; state.studentsRelationsUnit = action.payload; });
        builder.addCase(fetchStudentsRelationsUnit.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Policies
        builder.addCase(fetchStudentPolicies.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchStudentPolicies.fulfilled, (state, action) => { state.isLoading = false; state.studentPolicies = action.payload; });
        builder.addCase(fetchStudentPolicies.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Mitigation Forms
        builder.addCase(fetchMitigationForms.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchMitigationForms.fulfilled, (state, action) => { state.isLoading = false; state.mitigationForms = action.payload; });
        builder.addCase(fetchMitigationForms.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Staff
        builder.addCase(fetchStaffCategories.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchStaffCategories.fulfilled, (state, action) => { state.isLoading = false; state.staffCategories = action.payload; });
        builder.addCase(fetchStaffCategories.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Info
        builder.addCase(fetchInfoCategories.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(fetchInfoCategories.fulfilled, (state, action) => { state.isLoading = false; state.infoCategories = action.payload; });
        builder.addCase(fetchInfoCategories.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // ---------- Detail fetches ----------
        // Schedule detail
        builder.addCase(fetchScheduleDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchScheduleDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.scheduleDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchScheduleDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Complaint detail
        builder.addCase(fetchComplaintDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchComplaintDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.complaintDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchComplaintDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Calendar detail
        builder.addCase(fetchCalendarDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchCalendarDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.calendarDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchCalendarDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Undergraduate detail
        builder.addCase(fetchUndergraduateDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchUndergraduateDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.undergraduateDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchUndergraduateDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Postgraduate detail
        builder.addCase(fetchPostgraduateDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchPostgraduateDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.postgraduateDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchPostgraduateDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Policy detail
        builder.addCase(fetchPolicyDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchPolicyDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.policyDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchPolicyDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Mitigation form detail
        builder.addCase(fetchMitigationFormDetail.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchMitigationFormDetail.fulfilled, (state, action) => { state.isDetailLoading = false; state.mitigationFormDetails[action.payload.slug] = action.payload.data; });
        builder.addCase(fetchMitigationFormDetail.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Staff details
        builder.addCase(fetchStaffSoc.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchStaffSoc.fulfilled, (state, action) => { state.isDetailLoading = false; state.staffSoc = action.payload; });
        builder.addCase(fetchStaffSoc.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchStaffCommonInfo.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchStaffCommonInfo.fulfilled, (state, action) => { state.isDetailLoading = false; state.staffCommonInfo = action.payload; });
        builder.addCase(fetchStaffCommonInfo.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchStaffMailGroups.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchStaffMailGroups.fulfilled, (state, action) => { state.isDetailLoading = false; state.staffMailGroups = action.payload; });
        builder.addCase(fetchStaffMailGroups.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchStaffDocArchive.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchStaffDocArchive.fulfilled, (state, action) => { state.isDetailLoading = false; state.staffDocArchive = action.payload; });
        builder.addCase(fetchStaffDocArchive.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchStaffContacts.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchStaffContacts.fulfilled, (state, action) => { state.isDetailLoading = false; state.staffContacts = action.payload; });
        builder.addCase(fetchStaffContacts.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Info details
        builder.addCase(fetchCourseDetails.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchCourseDetails.fulfilled, (state, action) => { state.isDetailLoading = false; state.courseDetails = action.payload; });
        builder.addCase(fetchCourseDetails.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchHousesInfo.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchHousesInfo.fulfilled, (state, action) => { state.isDetailLoading = false; state.housesInfo = action.payload; });
        builder.addCase(fetchHousesInfo.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchStudentsUnionInfo.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchStudentsUnionInfo.fulfilled, (state, action) => { state.isDetailLoading = false; state.studentsUnionInfo = action.payload; });
        builder.addCase(fetchStudentsUnionInfo.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchClubsAndSocieties.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchClubsAndSocieties.fulfilled, (state, action) => { state.isDetailLoading = false; state.clubsAndSocieties = action.payload; });
        builder.addCase(fetchClubsAndSocieties.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // SRU detail
        builder.addCase(fetchHelpDeskVideoSeries.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchHelpDeskVideoSeries.fulfilled, (state, action) => { state.isDetailLoading = false; state.helpDeskVideoSeries = action.payload; });
        builder.addCase(fetchHelpDeskVideoSeries.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        // Foundation details
        builder.addCase(fetchFoundationAcademicCalendar.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationAcademicCalendar.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationAcademicCalendar = action.payload; });
        builder.addCase(fetchFoundationAcademicCalendar.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchFoundationProgramSpec.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationProgramSpec.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationProgramSpec = action.payload; });
        builder.addCase(fetchFoundationProgramSpec.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchFoundationContactDetails.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationContactDetails.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationContactDetails = action.payload; });
        builder.addCase(fetchFoundationContactDetails.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchFoundationTimeTable.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationTimeTable.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationTimeTable = action.payload; });
        builder.addCase(fetchFoundationTimeTable.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchFoundationAssessmentSchedule.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationAssessmentSchedule.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationAssessmentSchedule = action.payload; });
        builder.addCase(fetchFoundationAssessmentSchedule.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchFoundationLmsDetails.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationLmsDetails.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationLmsDetails = action.payload; });
        builder.addCase(fetchFoundationLmsDetails.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });

        builder.addCase(fetchFoundationMitigationForm.pending, (state) => { state.isDetailLoading = true; state.error = null; });
        builder.addCase(fetchFoundationMitigationForm.fulfilled, (state, action) => { state.isDetailLoading = false; state.foundationMitigationForm = action.payload; });
        builder.addCase(fetchFoundationMitigationForm.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; });
    },
});

export const { clearError, resetIntranet } = intranetSlice.actions;
export default intranetSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================

export const selectIntranetIsLoading = (state: any) => state.intranet?.isLoading ?? false;
export const selectIntranetIsDetailLoading = (state: any) => state.intranet?.isDetailLoading ?? false;
export const selectIntranetError = (state: any) => state.intranet?.error ?? null;

export const selectScheduleCategories = (state: any) => state.intranet?.scheduleCategories ?? [];
export const selectScheduleDetails = (state: any) => state.intranet?.scheduleDetails ?? {};
export const selectStudentComplaints = (state: any) => state.intranet?.studentComplaints ?? [];
export const selectAcademicCalendars = (state: any) => state.intranet?.academicCalendars ?? [];
export const selectUndergraduatePrograms = (state: any) => state.intranet?.undergraduatePrograms ?? [];
export const selectPostgraduatePrograms = (state: any) => state.intranet?.postgraduatePrograms ?? [];
export const selectFoundationCategories = (state: any) => state.intranet?.foundationCategories ?? [];
export const selectStudentsRelationsUnit = (state: any) => state.intranet?.studentsRelationsUnit ?? null;
export const selectStudentPolicies = (state: any) => state.intranet?.studentPolicies ?? [];
export const selectMitigationForms = (state: any) => state.intranet?.mitigationForms ?? [];
export const selectStaffCategories = (state: any) => state.intranet?.staffCategories ?? [];
export const selectInfoCategories = (state: any) => state.intranet?.infoCategories ?? [];

export const selectComplaintDetails = (state: any) => state.intranet?.complaintDetails ?? {};
export const selectCalendarDetails = (state: any) => state.intranet?.calendarDetails ?? {};
export const selectUndergraduateDetails = (state: any) => state.intranet?.undergraduateDetails ?? {};
export const selectPostgraduateDetails = (state: any) => state.intranet?.postgraduateDetails ?? {};
export const selectPolicyDetails = (state: any) => state.intranet?.policyDetails ?? {};
export const selectMitigationFormDetails = (state: any) => state.intranet?.mitigationFormDetails ?? {};

export const selectStaffSoc = (state: any) => state.intranet?.staffSoc ?? null;
export const selectStaffCommonInfo = (state: any) => state.intranet?.staffCommonInfo ?? null;
export const selectStaffMailGroups = (state: any) => state.intranet?.staffMailGroups ?? null;
export const selectStaffDocArchive = (state: any) => state.intranet?.staffDocArchive ?? null;
export const selectStaffContacts = (state: any) => state.intranet?.staffContacts ?? null;

export const selectCourseDetails = (state: any) => state.intranet?.courseDetails ?? null;
export const selectHousesInfo = (state: any) => state.intranet?.housesInfo ?? null;
export const selectStudentsUnionInfo = (state: any) => state.intranet?.studentsUnionInfo ?? null;
export const selectClubsAndSocieties = (state: any) => state.intranet?.clubsAndSocieties ?? null;

export const selectHelpDeskVideoSeries = (state: any) => state.intranet?.helpDeskVideoSeries ?? null;

export const selectFoundationAcademicCalendar = (state: any) => state.intranet?.foundationAcademicCalendar ?? null;
export const selectFoundationProgramSpec = (state: any) => state.intranet?.foundationProgramSpec ?? null;
export const selectFoundationContactDetails = (state: any) => state.intranet?.foundationContactDetails ?? null;
export const selectFoundationTimeTable = (state: any) => state.intranet?.foundationTimeTable ?? null;
export const selectFoundationAssessmentSchedule = (state: any) => state.intranet?.foundationAssessmentSchedule ?? null;
export const selectFoundationLmsDetails = (state: any) => state.intranet?.foundationLmsDetails ?? null;
export const selectFoundationMitigationForm = (state: any) => state.intranet?.foundationMitigationForm ?? null;


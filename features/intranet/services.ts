/**
 * @fileoverview Intranet Module Services
 * @description API services for the Nextora Content API (GET-only)
 */

import apiClient from '@/lib/api-client';
import {
    StudentComplaintCategory,
    StudentComplaintDetail,
    AcademicCalendarSummary,
    AcademicCalendarDetail,
    ProgramSummary,
    ProgramDetail,
    FoundationCategory,
    FoundationAcademicCalendar,
    FoundationProgramSpec,
    FoundationContactDetails,
    FoundationTimeTable,
    FoundationAssessmentSchedule,
    FoundationLmsDetails,
    FoundationMitigationForm,
    StudentsRelationsUnit,
    HelpDeskVideoSeries,
    StudentPolicySummary,
    StudentPolicyDetail,
    MitigationFormSummary,
    MitigationFormDetail,
    StaffCategorySummary,
    StaffSocData,
    StaffCommonInfo,
    StaffMailGroups,
    StaffDocArchive,
    StaffContacts,
    InfoCategorySummary,
    CourseDetails,
    HousesInfo,
    StudentsUnionInfo,
    ClubsAndSocieties,
    ScheduleCategorySummary,
    ScheduleDetail,
} from './types';

// ============================================================================
// Endpoints
// ============================================================================

export const INTRANET_ENDPOINTS = {
    // Schedules
    SCHEDULES: '/schedules',
    SCHEDULE_BY_SLUG: (slug: string) => `/schedules/${slug}`,

    // Student Complaints
    STUDENT_COMPLAINTS: '/student-complaints',
    STUDENT_COMPLAINT_BY_SLUG: (slug: string) => `/student-complaints/${slug}`,

    // Academic Calendars
    ACADEMIC_CALENDARS: '/academic-calendars',
    ACADEMIC_CALENDAR_BY_SLUG: (slug: string) => `/academic-calendars/${slug}`,

    // Undergraduate
    UNDERGRADUATE: '/undergraduate',
    UNDERGRADUATE_BY_SLUG: (slug: string) => `/undergraduate/${slug}`,

    // Postgraduate
    POSTGRADUATE: '/postgraduate',
    POSTGRADUATE_BY_SLUG: (slug: string) => `/postgraduate/${slug}`,

    // Foundation Program
    FOUNDATION_PROGRAM: '/foundation-program',
    FOUNDATION_BY_SLUG: (slug: string) => `/foundation-program/${slug}`,

    // Students Relations Unit
    STUDENTS_RELATIONS_UNIT: '/students-relations-unit',
    SRU_BY_SLUG: (slug: string) => `/students-relations-unit/${slug}`,

    // Student Policies
    STUDENT_POLICIES: '/student-policies',
    STUDENT_POLICY_BY_SLUG: (slug: string) => `/student-policies/${slug}`,

    // Mitigation Forms
    MITIGATION_FORMS: '/mitigation-forms',
    MITIGATION_FORM_BY_SLUG: (slug: string) => `/mitigation-forms/${slug}`,

    // Staff
    STAFF: '/staff',
    STAFF_BY_SLUG: (slug: string) => `/staff/${slug}`,

    // Info
    INFO: '/info',
    INFO_BY_SLUG: (slug: string) => `/info/${slug}`,
};

// ============================================================================
// Generic Fetch Helper
// ============================================================================

async function fetchContent<T>(endpoint: string): Promise<T> {
    const response = await apiClient.get(endpoint);
    const body = response.data;

    // Backend returns ApiResponse wrapper: { success, message, data, timestamp }
    if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
        return body.data as T;
    }

    // Backend returns data directly (no wrapper)
    return body as T;
}

// ============================================================================
// 1. Student Complaints
// ============================================================================

export async function getStudentComplaints(): Promise<StudentComplaintCategory[]> {
    return fetchContent<StudentComplaintCategory[]>(INTRANET_ENDPOINTS.STUDENT_COMPLAINTS);
}

export async function getStudentComplaintBySlug(slug: string): Promise<StudentComplaintDetail> {
    return fetchContent<StudentComplaintDetail>(INTRANET_ENDPOINTS.STUDENT_COMPLAINT_BY_SLUG(slug));
}

// ============================================================================
// 2. Academic Calendars
// ============================================================================

export async function getAcademicCalendars(): Promise<AcademicCalendarSummary[]> {
    return fetchContent<AcademicCalendarSummary[]>(INTRANET_ENDPOINTS.ACADEMIC_CALENDARS);
}

export async function getAcademicCalendarBySlug(slug: string): Promise<AcademicCalendarDetail> {
    return fetchContent<AcademicCalendarDetail>(INTRANET_ENDPOINTS.ACADEMIC_CALENDAR_BY_SLUG(slug));
}

// ============================================================================
// 3. Undergraduate Programs
// ============================================================================

export async function getUndergraduatePrograms(): Promise<ProgramSummary[]> {
    return fetchContent<ProgramSummary[]>(INTRANET_ENDPOINTS.UNDERGRADUATE);
}

export async function getUndergraduateProgramBySlug(slug: string): Promise<ProgramDetail> {
    return fetchContent<ProgramDetail>(INTRANET_ENDPOINTS.UNDERGRADUATE_BY_SLUG(slug));
}

// ============================================================================
// 4. Postgraduate Programs
// ============================================================================

export async function getPostgraduatePrograms(): Promise<ProgramSummary[]> {
    return fetchContent<ProgramSummary[]>(INTRANET_ENDPOINTS.POSTGRADUATE);
}

export async function getPostgraduateProgramBySlug(slug: string): Promise<ProgramDetail> {
    return fetchContent<ProgramDetail>(INTRANET_ENDPOINTS.POSTGRADUATE_BY_SLUG(slug));
}

// ============================================================================
// 5. Foundation Program
// ============================================================================

export async function getFoundationProgram(): Promise<FoundationCategory[]> {
    return fetchContent<FoundationCategory[]>(INTRANET_ENDPOINTS.FOUNDATION_PROGRAM);
}

export async function getFoundationAcademicCalendar(): Promise<FoundationAcademicCalendar> {
    return fetchContent<FoundationAcademicCalendar>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('academic-calendar'));
}

export async function getFoundationProgramSpec(): Promise<FoundationProgramSpec> {
    return fetchContent<FoundationProgramSpec>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('program-specification'));
}

export async function getFoundationContactDetails(): Promise<FoundationContactDetails> {
    return fetchContent<FoundationContactDetails>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('important-contact-details'));
}

export async function getFoundationTimeTable(): Promise<FoundationTimeTable> {
    return fetchContent<FoundationTimeTable>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('time-table'));
}

export async function getFoundationAssessmentSchedule(): Promise<FoundationAssessmentSchedule> {
    return fetchContent<FoundationAssessmentSchedule>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('assessment-schedule'));
}

export async function getFoundationLmsDetails(): Promise<FoundationLmsDetails> {
    return fetchContent<FoundationLmsDetails>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('lms-login-details'));
}

export async function getFoundationMitigationForm(): Promise<FoundationMitigationForm> {
    return fetchContent<FoundationMitigationForm>(INTRANET_ENDPOINTS.FOUNDATION_BY_SLUG('mitigating-circumstances-form'));
}

// ============================================================================
// 6. Students Relations Unit
// ============================================================================

export async function getStudentsRelationsUnit(): Promise<StudentsRelationsUnit> {
    return fetchContent<StudentsRelationsUnit>(INTRANET_ENDPOINTS.STUDENTS_RELATIONS_UNIT);
}

export async function getHelpDeskVideoSeries(): Promise<HelpDeskVideoSeries> {
    return fetchContent<HelpDeskVideoSeries>(INTRANET_ENDPOINTS.SRU_BY_SLUG('help-desk-video-series'));
}

// ============================================================================
// 7. Student Policies
// ============================================================================

export async function getStudentPolicies(): Promise<StudentPolicySummary[]> {
    return fetchContent<StudentPolicySummary[]>(INTRANET_ENDPOINTS.STUDENT_POLICIES);
}

export async function getStudentPolicyBySlug(slug: string): Promise<StudentPolicyDetail> {
    return fetchContent<StudentPolicyDetail>(INTRANET_ENDPOINTS.STUDENT_POLICY_BY_SLUG(slug));
}

// ============================================================================
// 8. Mitigation Forms
// ============================================================================

export async function getMitigationForms(): Promise<MitigationFormSummary[]> {
    return fetchContent<MitigationFormSummary[]>(INTRANET_ENDPOINTS.MITIGATION_FORMS);
}

export async function getMitigationFormBySlug(slug: string): Promise<MitigationFormDetail> {
    return fetchContent<MitigationFormDetail>(INTRANET_ENDPOINTS.MITIGATION_FORM_BY_SLUG(slug));
}

// ============================================================================
// 9. Staff
// ============================================================================

export async function getStaffCategories(): Promise<StaffCategorySummary[]> {
    return fetchContent<StaffCategorySummary[]>(INTRANET_ENDPOINTS.STAFF);
}

export async function getStaffSoc(): Promise<StaffSocData> {
    return fetchContent<StaffSocData>(INTRANET_ENDPOINTS.STAFF_BY_SLUG('soc'));
}

export async function getStaffCommonInfo(): Promise<StaffCommonInfo> {
    return fetchContent<StaffCommonInfo>(INTRANET_ENDPOINTS.STAFF_BY_SLUG('common-info'));
}

export async function getStaffMailGroups(): Promise<StaffMailGroups> {
    return fetchContent<StaffMailGroups>(INTRANET_ENDPOINTS.STAFF_BY_SLUG('mail-groups'));
}

export async function getStaffDocArchive(): Promise<StaffDocArchive> {
    return fetchContent<StaffDocArchive>(INTRANET_ENDPOINTS.STAFF_BY_SLUG('doc-arch'));
}

export async function getStaffContacts(): Promise<StaffContacts> {
    return fetchContent<StaffContacts>(INTRANET_ENDPOINTS.STAFF_BY_SLUG('contacts'));
}

// ============================================================================
// 10. Info
// ============================================================================

export async function getInfoCategories(): Promise<InfoCategorySummary[]> {
    return fetchContent<InfoCategorySummary[]>(INTRANET_ENDPOINTS.INFO);
}

export async function getCourseDetails(): Promise<CourseDetails> {
    return fetchContent<CourseDetails>(INTRANET_ENDPOINTS.INFO_BY_SLUG('course-details'));
}

export async function getHousesInfo(): Promise<HousesInfo> {
    return fetchContent<HousesInfo>(INTRANET_ENDPOINTS.INFO_BY_SLUG('houses'));
}

export async function getStudentsUnionInfo(): Promise<StudentsUnionInfo> {
    return fetchContent<StudentsUnionInfo>(INTRANET_ENDPOINTS.INFO_BY_SLUG('students-union'));
}

export async function getClubsAndSocieties(): Promise<ClubsAndSocieties> {
    return fetchContent<ClubsAndSocieties>(INTRANET_ENDPOINTS.INFO_BY_SLUG('clubs-and-societies'));
}

// ============================================================================
// 11. Schedules
// ============================================================================

export async function getScheduleCategories(): Promise<ScheduleCategorySummary[]> {
    return fetchContent<ScheduleCategorySummary[]>(INTRANET_ENDPOINTS.SCHEDULES);
}

export async function getScheduleBySlug(slug: string): Promise<ScheduleDetail> {
    return fetchContent<ScheduleDetail>(INTRANET_ENDPOINTS.SCHEDULE_BY_SLUG(slug));
}


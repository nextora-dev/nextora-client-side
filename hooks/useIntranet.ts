/**
 * @fileoverview useIntranet Hook
 * @description Custom hook for intranet content management
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchScheduleCategories,
    fetchScheduleDetail,
    fetchStudentComplaints,
    fetchAcademicCalendars,
    fetchUndergraduatePrograms,
    fetchPostgraduatePrograms,
    fetchFoundationCategories,
    fetchStudentsRelationsUnit,
    fetchStudentPolicies,
    fetchMitigationForms,
    fetchStaffCategories,
    fetchInfoCategories,
    fetchComplaintDetail,
    fetchCalendarDetail,
    fetchUndergraduateDetail,
    fetchPostgraduateDetail,
    fetchPolicyDetail,
    fetchMitigationFormDetail,
    fetchStaffSoc,
    fetchStaffCommonInfo,
    fetchStaffMailGroups,
    fetchStaffDocArchive,
    fetchStaffContacts,
    fetchCourseDetails,
    fetchHousesInfo,
    fetchStudentsUnionInfo,
    fetchClubsAndSocieties,
    fetchHelpDeskVideoSeries,
    fetchFoundationAcademicCalendar,
    fetchFoundationProgramSpec,
    fetchFoundationContactDetails,
    fetchFoundationTimeTable,
    fetchFoundationAssessmentSchedule,
    fetchFoundationLmsDetails,
    fetchFoundationMitigationForm,
    selectIntranetIsLoading,
    selectIntranetIsDetailLoading,
    selectIntranetError,
    selectScheduleCategories,
    selectScheduleDetails,
    selectStudentComplaints,
    selectAcademicCalendars,
    selectUndergraduatePrograms,
    selectPostgraduatePrograms,
    selectFoundationCategories,
    selectStudentsRelationsUnit,
    selectStudentPolicies,
    selectMitigationForms,
    selectStaffCategories,
    selectInfoCategories,
    selectComplaintDetails,
    selectCalendarDetails,
    selectUndergraduateDetails,
    selectPostgraduateDetails,
    selectPolicyDetails,
    selectMitigationFormDetails,
    selectStaffSoc,
    selectStaffCommonInfo,
    selectStaffMailGroups,
    selectStaffDocArchive,
    selectStaffContacts,
    selectCourseDetails,
    selectHousesInfo,
    selectStudentsUnionInfo,
    selectClubsAndSocieties,
    selectHelpDeskVideoSeries,
    selectFoundationAcademicCalendar,
    selectFoundationProgramSpec,
    selectFoundationContactDetails,
    selectFoundationTimeTable,
    selectFoundationAssessmentSchedule,
    selectFoundationLmsDetails,
    selectFoundationMitigationForm,
    clearError,
} from '@/features/intranet';
import type { IntranetSection } from '@/features/intranet';

export function useIntranet() {
    const dispatch = useAppDispatch();

    // Selectors
    const isLoading = useAppSelector(selectIntranetIsLoading);
    const isDetailLoading = useAppSelector(selectIntranetIsDetailLoading);
    const error = useAppSelector(selectIntranetError);

    const studentComplaints = useAppSelector(selectStudentComplaints);
    const academicCalendars = useAppSelector(selectAcademicCalendars);
    const scheduleCategories = useAppSelector(selectScheduleCategories);
    const scheduleDetails = useAppSelector(selectScheduleDetails);
    const undergraduatePrograms = useAppSelector(selectUndergraduatePrograms);
    const postgraduatePrograms = useAppSelector(selectPostgraduatePrograms);
    const foundationCategories = useAppSelector(selectFoundationCategories);
    const studentsRelationsUnit = useAppSelector(selectStudentsRelationsUnit);
    const studentPolicies = useAppSelector(selectStudentPolicies);
    const mitigationForms = useAppSelector(selectMitigationForms);
    const staffCategories = useAppSelector(selectStaffCategories);
    const infoCategories = useAppSelector(selectInfoCategories);

    // Detail selectors
    const staffSoc = useAppSelector(selectStaffSoc);
    const staffCommonInfo = useAppSelector(selectStaffCommonInfo);
    const staffMailGroups = useAppSelector(selectStaffMailGroups);
    const staffDocArchive = useAppSelector(selectStaffDocArchive);
    const staffContacts = useAppSelector(selectStaffContacts);
    const courseDetails = useAppSelector(selectCourseDetails);
    const housesInfo = useAppSelector(selectHousesInfo);
    const studentsUnionInfo = useAppSelector(selectStudentsUnionInfo);
    const clubsAndSocieties = useAppSelector(selectClubsAndSocieties);
    const helpDeskVideoSeries = useAppSelector(selectHelpDeskVideoSeries);

    // Foundation detail selectors
    const foundationAcademicCalendar = useAppSelector(selectFoundationAcademicCalendar);
    const foundationProgramSpec = useAppSelector(selectFoundationProgramSpec);
    const foundationContactDetails = useAppSelector(selectFoundationContactDetails);
    const foundationTimeTable = useAppSelector(selectFoundationTimeTable);
    const foundationAssessmentSchedule = useAppSelector(selectFoundationAssessmentSchedule);
    const foundationLmsDetails = useAppSelector(selectFoundationLmsDetails);
    const foundationMitigationForm = useAppSelector(selectFoundationMitigationForm);

    // Detail data keyed by slug
    const complaintDetails = useAppSelector(selectComplaintDetails);
    const calendarDetails = useAppSelector(selectCalendarDetails);
    const undergraduateDetails = useAppSelector(selectUndergraduateDetails);
    const postgraduateDetails = useAppSelector(selectPostgraduateDetails);
    const policyDetails = useAppSelector(selectPolicyDetails);
    const mitigationFormDetails = useAppSelector(selectMitigationFormDetails);

    // Individual detail fetchers
    const fetchComplaintBySlug = useCallback((slug: string) => dispatch(fetchComplaintDetail(slug)), [dispatch]);
    const fetchScheduleBySlug = useCallback((slug: string) => dispatch(fetchScheduleDetail(slug)), [dispatch]);
    const fetchCalendarBySlug = useCallback((slug: string) => dispatch(fetchCalendarDetail(slug)), [dispatch]);
    const fetchUndergradBySlug = useCallback((slug: string) => dispatch(fetchUndergraduateDetail(slug)), [dispatch]);
    const fetchPostgradBySlug = useCallback((slug: string) => dispatch(fetchPostgraduateDetail(slug)), [dispatch]);
    const fetchPolicyBySlug = useCallback((slug: string) => dispatch(fetchPolicyDetail(slug)), [dispatch]);
    const fetchMitigationBySlug = useCallback((slug: string) => dispatch(fetchMitigationFormDetail(slug)), [dispatch]);

    // Fetch a specific section's list data
    const fetchSection = useCallback((section: IntranetSection) => {
        switch (section) {
            case 'schedules': return dispatch(fetchScheduleCategories());
            case 'student-complaints': return dispatch(fetchStudentComplaints());
            case 'academic-calendars': return dispatch(fetchAcademicCalendars());
            case 'undergraduate': return dispatch(fetchUndergraduatePrograms());
            case 'postgraduate': return dispatch(fetchPostgraduatePrograms());
            case 'foundation-program': return dispatch(fetchFoundationCategories());
            case 'students-relations-unit': return dispatch(fetchStudentsRelationsUnit());
            case 'student-policies': return dispatch(fetchStudentPolicies());
            case 'mitigation-forms': return dispatch(fetchMitigationForms());
            case 'staff': return dispatch(fetchStaffCategories());
            case 'info': return dispatch(fetchInfoCategories());
        }
    }, [dispatch]);

    // Fetch all list-level data
    const fetchAllSections = useCallback(() => {
        dispatch(fetchScheduleCategories());
        dispatch(fetchStudentComplaints());
        dispatch(fetchAcademicCalendars());
        dispatch(fetchUndergraduatePrograms());
        dispatch(fetchPostgraduatePrograms());
        dispatch(fetchFoundationCategories());
        dispatch(fetchStudentsRelationsUnit());
        dispatch(fetchStudentPolicies());
        dispatch(fetchMitigationForms());
        dispatch(fetchStaffCategories());
        dispatch(fetchInfoCategories());
    }, [dispatch]);

    // Fetch staff sub-details
    const fetchAllStaffDetails = useCallback(() => {
        dispatch(fetchStaffSoc());
        dispatch(fetchStaffCommonInfo());
        dispatch(fetchStaffMailGroups());
        dispatch(fetchStaffDocArchive());
        dispatch(fetchStaffContacts());
    }, [dispatch]);

    // Fetch info sub-details
    const fetchAllInfoDetails = useCallback(() => {
        dispatch(fetchCourseDetails());
        dispatch(fetchHousesInfo());
        dispatch(fetchStudentsUnionInfo());
        dispatch(fetchClubsAndSocieties());
    }, [dispatch]);

    // Fetch SRU detail
    const fetchSruDetails = useCallback(() => {
        dispatch(fetchStudentsRelationsUnit());
        dispatch(fetchHelpDeskVideoSeries());
    }, [dispatch]);

    // Fetch foundation sub-details
    const fetchAllFoundationDetails = useCallback(() => {
        dispatch(fetchFoundationAcademicCalendar());
        dispatch(fetchFoundationProgramSpec());
        dispatch(fetchFoundationContactDetails());
        dispatch(fetchFoundationTimeTable());
        dispatch(fetchFoundationAssessmentSchedule());
        dispatch(fetchFoundationLmsDetails());
        dispatch(fetchFoundationMitigationForm());
    }, [dispatch]);

    return {
        // Loading/error
        isLoading,
        isDetailLoading,
        error,
        clearError: () => dispatch(clearError()),

        // List data
        scheduleCategories,
        studentComplaints,
        academicCalendars,
        undergraduatePrograms,
        postgraduatePrograms,
        foundationCategories,
        studentsRelationsUnit,
        studentPolicies,
        mitigationForms,
        staffCategories,
        infoCategories,

        // Detail data
        staffSoc,
        staffCommonInfo,
        staffMailGroups,
        staffDocArchive,
        staffContacts,
        courseDetails,
        housesInfo,
        studentsUnionInfo,
        clubsAndSocieties,
        helpDeskVideoSeries,

        // Foundation details
        foundationAcademicCalendar,
        foundationProgramSpec,
        foundationContactDetails,
        foundationTimeTable,
        foundationAssessmentSchedule,
        foundationLmsDetails,
        foundationMitigationForm,

        // Actions
        fetchSection,
        fetchAllSections,
        fetchAllStaffDetails,
        fetchAllInfoDetails,
        fetchSruDetails,
        fetchAllFoundationDetails,

        // Detail data (by slug)
        scheduleDetails,
        complaintDetails,
        calendarDetails,
        undergraduateDetails,
        postgraduateDetails,
        policyDetails,
        mitigationFormDetails,

        // Individual detail fetchers
        fetchScheduleBySlug,
        fetchComplaintBySlug,
        fetchCalendarBySlug,
        fetchUndergradBySlug,
        fetchPostgradBySlug,
        fetchPolicyBySlug,
        fetchMitigationBySlug,
    };
}
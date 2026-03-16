/**
 * @fileoverview Intranet Module Types
 * @description Type definitions for the Nextora Content API
 */

// ============================================================================
// Common Response Wrapper
// ============================================================================

export interface ContentApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

// ============================================================================
// 1. Student Complaints
// ============================================================================

export interface StudentComplaintCategory {
    id: number;
    categoryName: string;
    categorySlug: string;
    description: string;
    formUrl?: string;
    contactEmail?: string;
    isActive: boolean;
    lastUpdated?: string;
}

export interface StudentComplaintDetail {
    id: number;
    categoryName: string;
    categorySlug: string;
    description: string;
    formUrl: string;
    contactEmail: string;
    contactPhone: string;
    instructions: string;
    responseTimeBusinessDays: number;
    isActive: boolean;
    lastUpdated: string;
}

// ============================================================================
// 2. Academic Calendars
// ============================================================================

export interface AcademicCalendarSummary {
    id: number;
    universityName: string;
    universitySlug: string;
    academicYear: string;
    calendarFileUrl: string;
    lastUpdated: string;
}

export interface CalendarEvent {
    eventName: string;
    startDate: string;
    endDate: string;
    eventType: string;
}

export interface AcademicCalendarDetail extends AcademicCalendarSummary {
    events: CalendarEvent[];
}

// ============================================================================
// 3 & 4. Programs (Undergraduate & Postgraduate)
// ============================================================================

export interface ProgramSummary {
    id: number;
    programCode: string;
    programName: string;
    programSlug: string;
    awardingUniversity: string;
    duration: string;
    isActive: boolean;
}

export interface ProgramModule {
    year?: number;
    semester: number;
    moduleCode: string;
    moduleName: string;
    credits: number;
    isCore: boolean;
}

export interface ProgramDetail extends ProgramSummary {
    totalCredits: number;
    description: string;
    entryRequirements: string;
    careerProspects: string[];
    modules: ProgramModule[];
    programSpecificationUrl: string;
    handbookUrl: string;
    lastUpdated: string;
}

// ============================================================================
// 5. Foundation Program
// ============================================================================

export interface FoundationCategory {
    id: number;
    categoryName: string;
    categorySlug: string;
    description: string;
}

export interface FoundationEvent {
    eventName: string;
    startDate: string;
    endDate: string;
    eventType: string;
}

export interface FoundationAcademicCalendar {
    id: number;
    categoryName: string;
    categorySlug?: string;
    description?: string;
    academicYear: string;
    calendarFileUrl: string;
    events: FoundationEvent[];
    lastUpdated: string;
}

export interface FoundationModule {
    moduleCode: string;
    moduleName: string;
    credits: number;
    semester: number;
}

export interface FoundationProgramSpec {
    id: number;
    categoryName: string;
    categorySlug?: string;
    programName: string;
    duration: string;
    description: string;
    specificationFileUrl: string;
    modules: FoundationModule[];
    totalCredits: number;
    lastUpdated: string;
}

export interface FoundationContact {
    role: string;
    name: string;
    email: string;
    phone: string;
    officeHours: string;
    office: string;
}

export interface FoundationContactDetails {
    id: number;
    categoryName: string;
    categorySlug?: string;
    description?: string;
    contacts: FoundationContact[];
    lastUpdated: string;
}

export interface TimeTableSlot {
    startTime: string;
    endTime: string;
    moduleCode: string;
    moduleName: string;
    lecturer: string;
    venue: string;
}

export interface TimeTableDay {
    day: string;
    slots: TimeTableSlot[];
}

export interface FoundationTimeTable {
    id: number;
    categoryName: string;
    categorySlug?: string;
    description?: string;
    semester: string;
    academicYear?: string;
    effectiveFrom: string;
    timetableFileUrl: string;
    schedule: TimeTableDay[];
    lastUpdated: string;
}

export interface FoundationAssessment {
    moduleCode: string;
    moduleName: string;
    assessmentType: string;
    description: string;
    weightPercentage: number;
    releaseDate?: string | null;
    submissionDeadline: string;
    feedbackDate?: string;
}

export interface FoundationAssessmentSchedule {
    id: number;
    categoryName: string;
    categorySlug?: string;
    description?: string;
    semester?: string;
    academicYear?: string;
    scheduleFileUrl: string;
    assessments: FoundationAssessment[];
    lastUpdated: string;
}

export interface FoundationLmsDetails {
    id: number;
    categoryName: string;
    categorySlug?: string;
    description?: string;
    lmsName: string;
    lmsUrl: string;
    loginInstructions: string;
    usernameFormat: string;
    defaultPasswordInfo: string;
    passwordResetUrl: string;
    supportContact: {
        name: string;
        email: string;
        phone: string;
    };
    browserRequirements: string[];
    additionalNotes: string;
    lastUpdated: string;
}

export interface FoundationMitigationForm {
    id: number;
    categoryName: string;
    categorySlug?: string;
    formName: string;
    description: string;
    formFileUrl: string;
    submissionEmail: string;
    submissionDeadline: string;
    eligibleCircumstances: string[];
    requiredEvidence: string[];
    contactPerson: {
        name: string;
        role?: string;
        email: string;
        phone?: string;
    };
    lastUpdated: string;
}

// ============================================================================
// 6. Students Relations Unit
// ============================================================================

export interface SruCategory {
    categoryName: string;
    categorySlug: string;
    description: string;
}

export interface StudentsRelationsUnit {
    unitName: string;
    description: string;
    location: string;
    email: string;
    phone: string;
    officeHours: string;
    categories: SruCategory[];
}

export interface HelpDeskVideo {
    id: number;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: string;
    publishedDate: string;
}

export interface HelpDeskVideoSeries {
    categoryName: string;
    description: string;
    videos: HelpDeskVideo[];
    lastUpdated: string;
}

// ============================================================================
// 7. Student Policies
// ============================================================================

export interface StudentPolicySummary {
    id: number;
    policyName: string;
    policySlug: string;
    description: string;
}

export interface StudentPolicyDetail extends StudentPolicySummary {
    version: string;
    effectiveDate: string;
    policyContent: string;
    policyFileUrl: string;
    keyPoints: string[];
    disciplinaryProcess?: string[];
    contactPerson: {
        name: string;
        role: string;
        email: string;
    };
    lastUpdated: string;
}

// ============================================================================
// 8. Mitigation Forms
// ============================================================================

export interface MitigationFormSummary {
    id: number;
    formName: string;
    formSlug: string;
    university: string;
    description: string;
}

export interface MitigationFormDetail extends MitigationFormSummary {
    formFileUrl: string;
    submissionEmail: string;
    submissionDeadline: string;
    eligibleCircumstances: string[];
    requiredDocuments: string[];
    limitations?: string[];
    processingTimeBusinessDays: number;
    extensionDuration?: string;
    deferralDetails?: string;
    possibleOutcomes?: string[];
    contactPerson: {
        name: string;
        email: string;
        phone: string;
        role?: string;
    };
    lastUpdated: string;
}

// ============================================================================
// 9. Staff
// ============================================================================

export interface StaffCategorySummary {
    categoryName: string;
    categorySlug: string;
    description: string;
}

export interface StaffMember {
    id: number;
    name: string;
    designation: string;
    email: string;
    phone: string;
    office?: string;
    specialization?: string;
    officeHours?: string;
}

export interface StaffSocData {
    categoryName: string;
    categorySlug?: string;
    description?: string;
    departmentFullName: string;
    staffMembers: StaffMember[];
    lastUpdated: string;
}

export interface StaffDepartment {
    departmentName: string;
    headOfDepartment?: string;
    email: string;
    phone: string;
}

export interface StaffCommonInfo {
    categoryName: string;
    categorySlug?: string;
    description?: string;
    generalInfo: {
        institutionName: string;
        mainAddress: string;
        mainPhone: string;
        mainEmail: string;
        website: string;
        workingHours: string;
        academicYear: string;
    };
    departments?: StaffDepartment[];
    lastUpdated: string;
}

export interface MailGroup {
    groupName: string;
    email: string;
    description: string;
    accessLevel: string;
}

export interface StaffMailGroups {
    categoryName: string;
    categorySlug?: string;
    description: string;
    mailGroups: MailGroup[];
    lastUpdated: string;
}

export interface StaffDocument {
    id: number;
    documentName: string;
    category: string;
    fileUrl: string;
    fileType: string;
    fileSizeKb: number;
    uploadedDate: string;
}

export interface StaffDocArchive {
    categoryName: string;
    categorySlug?: string;
    description: string;
    documents: StaffDocument[];
    lastUpdated: string;
}

export interface StaffContactEntry {
    name: string;
    designation: string;
    email: string;
    phone: string;
    extension: string;
}

export interface StaffContactDepartment {
    departmentName: string;
    contacts: StaffContactEntry[];
}

export interface StaffContacts {
    categoryName: string;
    categorySlug?: string;
    description: string;
    departments: StaffContactDepartment[];
    emergencyContacts: Record<string, string>;
    lastUpdated: string;
}

// ============================================================================
// 10. Info
// ============================================================================

export interface InfoCategorySummary {
    categoryName: string;
    categorySlug: string;
    description: string;
}

export interface CourseDetailProgramme {
    programName: string;
    duration: string;
    awardingBody: string;
    intake: string;
    fee: string;
}

export interface CourseDetailCategory {
    category: string;
    programmes: CourseDetailProgramme[];
}

export interface CourseDetails {
    categoryName: string;
    programmeCategories: CourseDetailCategory[];
    admissionsContact: {
        email: string;
        phone: string;
        whatsapp: string;
    };
    lastUpdated: string;
}

export interface House {
    id: number;
    houseName: string;
    color: string;
    motto: string;
    description: string;
    housemaster: string;
    captainName?: string;
    logoUrl?: string;
    totalPoints: number;
    rank: number;
}

export interface HousesInfo {
    categoryName: string;
    categorySlug?: string;
    description: string;
    houses: House[];
    currentAcademicYear?: string;
    lastUpdated: string;
}

export interface SuOfficeBearer {
    position: string;
    name: string;
    email: string;
    programme: string;
    year: number;
}

export interface SuEvent {
    eventName: string;
    date: string;
    venue: string;
    description: string;
}

export interface StudentsUnionInfo {
    categoryName: string;
    description: string;
    office: string;
    email: string;
    phone: string;
    socialMedia: {
        facebook: string;
        instagram: string;
        linkedin: string;
    };
    currentOffice: {
        academicYear: string;
        officeBearers: SuOfficeBearer[];
    };
    upcomingEvents: SuEvent[];
    lastUpdated: string;
}

export interface Club {
    id: number;
    clubName: string;
    clubCode: string;
    category: string;
    description: string;
    logoUrl?: string;
    president: string;
    email: string;
    memberCount: number;
    isOpenForRegistration: boolean;
    socialMedia?: {
        instagram?: string;
    };
}

export interface ClubsAndSocieties {
    categoryName: string;
    description: string;
    totalClubs: number;
    clubs: Club[];
    joinInstructions: string;
    lastUpdated: string;
}

// ============================================================================
// 11. Schedules
// ============================================================================

export interface ScheduleCategorySummary {
    id: number;
    categoryName: string;
    categorySlug: string;
    description: string;
}

export interface ScheduleEvent {
    id: number;
    eventName: string;
    description: string;
    startDate: string;
    endDate: string;
    venue?: string;
    eventType?: string;
    isActive?: boolean;
}

export interface ScheduleDetail {
    id: number;
    categoryName: string;
    categorySlug: string;
    description: string;
    events: ScheduleEvent[];
    lastUpdated: string;
}

// ============================================================================
// Intranet Section Keys
// ============================================================================

export type IntranetSection =
    | 'schedules'
    | 'student-complaints'
    | 'academic-calendars'
    | 'undergraduate'
    | 'postgraduate'
    | 'foundation-program'
    | 'students-relations-unit'
    | 'student-policies'
    | 'mitigation-forms'
    | 'staff'
    | 'info';


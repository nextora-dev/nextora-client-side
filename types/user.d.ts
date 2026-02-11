// User Types
import { STUDENT_SUB_ROLES } from '@/constants';


// Main Role Types

export interface StudentRoleSpecificData {
    studentId: string;
    address: string;
    guardianName: string;
    guardianPhone: string;
    batch: string;
    enrollmentDate: string | null;

    studentRoleTypes: STUDENT_SUB_ROLES[];
    primaryRoleType: STUDENT_SUB_ROLES;
    studentRoleDisplayName: string;

    dateOfBirth: string;
    program: string;
    faculty: string;

    clubMemberData?: ClubMemberData;
    batchRepData?: BatchRepData;
    seniorKuppiData?: SeniorKuppiData;
}


export interface AcademicStaffRoleSpecificData {
    qualifications: string[];
    joinDate: string;
    responsibilities: string | null;
    officeLocation: string;
    specialization: string;
    bio: string;
    employeeId: string;
    position: string;
    designation: string;
    department: string;
    availableForMeetings: boolean;
    faculty: string;
}

export interface NonAcademicStaffRoleSpecificData {
    workLocation: string;
    joinDate: string;
    shift: string | null;
    employeeId: string;
    position: string;
    department: string;
}

export interface AdminRoleSpecificData {
    assignedDate: string;
    permissions: string[];
    adminId: string;
    department: string;
}

export interface SuperAdminRoleSpecificData {
    assignedDate: string;
    accessLevel: string;
    superAdminId: string;
}

// Student Sub-Role Types

export interface BatchRepData {
    batchRepElectedDate: string;
    batchRepSemester: string;
    batchRepResponsibilities: string;
    batchRepYear: string;
}

export interface SeniorKuppiData {
    kuppiAvailability: string;
    kuppiSubjects: string[];
    kuppiSessionsCompleted: number;
    kuppiRating: number;
    kuppiExperienceLevel: string;
}

export interface ClubMemberData {
    clubPosition: string;
    clubMembershipId: string;
    clubName: string;
    clubJoinDate: string;
}

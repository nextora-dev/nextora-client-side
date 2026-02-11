// User Types
import { RoleType } from '@/constants';
import {
    AcademicStaffRoleSpecificData,
    AdminRoleSpecificData,
    NonAcademicStaffRoleSpecificData,
    StudentRoleSpecificData
} from "@/types/user";
import {StatusType} from "@/constants/status";

export interface UserProfileResponse {
    success: boolean;
    message: string;
    data: UserProfile;
    timestamp: string;
}

export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    role: RoleType;
    status: StatusType;
    userType: string;
    createdAt: string;
    updatedAt: string;
    roleSpecificData: StudentRoleSpecificData | AcademicStaffRoleSpecificData | NonAcademicStaffRoleSpecificData | AdminRoleSpecificData;
}
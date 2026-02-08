/**
 * @fileoverview Dashboard Navigation Configuration
 * @description Role-based navigation items for the dashboard sidebar
 * @module features/dashboard/navigation.config
 */

import HomeIcon from '@mui/icons-material/Home';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WorkIcon from '@mui/icons-material/Work';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { RoleType } from '@/constants/roles';
import { ROLES } from '@/constants/roles';

export interface NavigationItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ sx?: object }>;
    path: string;
    badge?: number;
}

// Student Navigation
export const STUDENT_NAVIGATION: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/student', badge: 0 },
    { id: 'events', label: 'Events', icon: ConfirmationNumberIcon, path: '/student/events', badge: 5 },
    { id: 'lostandfound', label: 'Lost & Found', icon: SearchIcon, path: '/student/lost-found', badge: 12 },
    { id: 'voting', label: 'Elections', icon: HowToVoteIcon, path: '/student/voting', badge: 2 },
    { id: 'boarding', label: 'Boarding Houses', icon: ApartmentIcon, path: '/student/boarding', badge: 0 },
    { id: 'internships', label: 'Internships', icon: WorkIcon, path: '/student/internships', badge: 8 },
    { id: 'kuppi', label: 'Kuppi Sessions', icon: AutoStoriesIcon, path: '/student/kuppi', badge: 15 },
    { id: 'calendar', label: 'Academic Calendar', icon: CalendarMonthIcon, path: '/student/calendar', badge: 0 },
    { id: 'map', label: 'Campus Map', icon: MapIcon, path: '/student/maps', badge: 0 },
    { id: 'lecturers', label: 'Meet Lecturers', icon: PersonIcon, path: '/student/meetings', badge: 0 },
    { id: 'sru', label: 'Contact SRU', icon: MessageIcon, path: '/student/sru', badge: 0 },
];

// Academic Staff Navigation
export const ACADEMIC_STAFF_NAVIGATION: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/academic', badge: 0 },
    { id: 'courses', label: 'My Courses', icon: SchoolIcon, path: '/academic/courses', badge: 4 },
    { id: 'students', label: 'My Students', icon: PeopleIcon, path: '/academic/students', badge: 0 },
    { id: 'attendance', label: 'Attendance', icon: EventIcon, path: '/academic/attendance', badge: 0 },
    { id: 'grades', label: 'Grades & Results', icon: AssessmentIcon, path: '/academic/grades', badge: 12 },
    { id: 'kuppi', label: 'Kuppi Sessions', icon: AutoStoriesIcon, path: '/academic/kuppi', badge: 3 },
    { id: 'meetings', label: 'Student Meetings', icon: PersonIcon, path: '/academic/meetings', badge: 5 },
    { id: 'calendar', label: 'Academic Calendar', icon: CalendarMonthIcon, path: '/academic/calendar', badge: 0 },
    { id: 'resources', label: 'Resources', icon: MessageIcon, path: '/academic/resources', badge: 0 },
    { id: 'map', label: 'Campus Map', icon: MapIcon, path: '/academic/maps', badge: 0 },
];

// Non-Academic Staff Navigation
export const NON_ACADEMIC_STAFF_NAVIGATION: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/non-academic', badge: 0 },
    { id: 'tasks', label: 'My Tasks', icon: AssessmentIcon, path: '/non-academic/tasks', badge: 8 },
    { id: 'inventory', label: 'Inventory', icon: StorageIcon, path: '/non-academic/inventory', badge: 0 },
    { id: 'maintenance', label: 'Maintenance', icon: SettingsIcon, path: '/non-academic/maintenance', badge: 5 },
    { id: 'requests', label: 'Service Requests', icon: MessageIcon, path: '/non-academic/requests', badge: 12 },
    { id: 'facilities', label: 'Facilities', icon: ApartmentIcon, path: '/non-academic/facilities', badge: 0 },
    { id: 'events', label: 'Events Support', icon: EventIcon, path: '/non-academic/events', badge: 3 },
    { id: 'calendar', label: 'Work Schedule', icon: CalendarMonthIcon, path: '/non-academic/calendar', badge: 0 },
    { id: 'map', label: 'Campus Map', icon: MapIcon, path: '/non-academic/maps', badge: 0 },
];

// Admin Navigation
export const ADMIN_NAVIGATION: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/admin', badge: 0 },
    { id: 'users', label: 'User Management', icon: PeopleIcon, path: '/admin/users', badge: 0 },
    { id: 'events', label: 'Event Management', icon: EventIcon, path: '/admin/events', badge: 3 },
    { id: 'courses', label: 'Course Management', icon: SchoolIcon, path: '/admin/courses', badge: 0 },
    { id: 'reports', label: 'Reports', icon: AssessmentIcon, path: '/admin/reports', badge: 5 },
    { id: 'approvals', label: 'Approvals', icon: VerifiedUserIcon, path: '/admin/approvals', badge: 8 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/admin/settings', badge: 0 },
];

// Super Admin Navigation
export const SUPER_ADMIN_NAVIGATION: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/super-admin', badge: 0 },
    { id: 'admins', label: 'Admin Management', icon: AdminPanelSettingsIcon, path: '/super-admin/admins', badge: 0 },
    { id: 'users', label: 'All Users', icon: PeopleIcon, path: '/super-admin/users', badge: 0 },
    { id: 'system', label: 'System Health', icon: StorageIcon, path: '/super-admin/system', badge: 0 },
    { id: 'security', label: 'Security', icon: SecurityIcon, path: '/super-admin/security', badge: 2 },
    { id: 'audit', label: 'Audit Logs', icon: HistoryIcon, path: '/super-admin/audit', badge: 0 },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon, path: '/super-admin/settings', badge: 0 },
];

/**
 * Get navigation items based on user role
 */
export function getNavigationByRole(role: RoleType): NavigationItem[] {
    switch (role) {
        case ROLES.SUPER_ADMIN:
            return SUPER_ADMIN_NAVIGATION;
        case ROLES.ADMIN:
            return ADMIN_NAVIGATION;
        case ROLES.STUDENT:
            return STUDENT_NAVIGATION;
        case ROLES.ACADEMIC_STAFF:
            return ACADEMIC_STAFF_NAVIGATION;
        case ROLES.NON_ACADEMIC_STAFF:
            return NON_ACADEMIC_STAFF_NAVIGATION;
        default:
            return STUDENT_NAVIGATION;
    }
}

/**
 * Get dashboard path based on user role
 */
export function getDashboardPath(role: RoleType): string {
    switch (role) {
        case ROLES.SUPER_ADMIN:
            return '/super-admin';
        case ROLES.ADMIN:
            return '/admin';
        case ROLES.STUDENT:
            return '/student';
        case ROLES.ACADEMIC_STAFF:
            return '/academic';
        case ROLES.NON_ACADEMIC_STAFF:
            return '/non-academic';
        default:
            return '/student';
    }
}

/**
 * Get branding config based on role
 */
export function getBrandingByRole(role: RoleType): { title: string; subtitle: string; gradient: string } {
    switch (role) {
        case ROLES.SUPER_ADMIN:
            return {
                title: 'Nextora',
                subtitle: 'Super Admin Console',
                gradient: 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
            };
        case ROLES.ADMIN:
            return {
                title: 'Nextora',
                subtitle: 'Admin Portal',
                gradient: 'linear-gradient(135deg, #DC2626 0%, #7C3AED 100%)',
            };
        case ROLES.ACADEMIC_STAFF:
            return {
                title: 'Nextora',
                subtitle: 'Academic Staff Portal',
                gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            };
        case ROLES.NON_ACADEMIC_STAFF:
            return {
                title: 'Nextora',
                subtitle: 'Staff Portal',
                gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
            };
        default:
            return {
                title: 'Nextora',
                subtitle: 'Student Portal',
                gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            };
    }
}


/**
 * @fileoverview Dashboard Mock Data
 * @description Mock data for dashboard development and testing
 * @module features/dashboard/mock-data
 */

import type {
    DashboardEvent,
    DashboardNotification,
    Activity,
    ProgressItem,
    CalendarEvent,
} from './dashboard.types';

// ============================================================================
// User Dashboard Mock Data
// ============================================================================

export const mockUpcomingEvents: DashboardEvent[] = [
    { id: '1', title: 'International Jazz Festival', date: 'Feb 28, 2026', time: '7:00 PM', type: 'Event', color: '#60A5FA' },
    { id: '2', title: 'Database Kuppi Session', date: 'Mar 2, 2026', time: '4:00 PM', type: 'Kuppi', color: '#8B5CF6' },
    { id: '3', title: 'Mid-term Examinations Begin', date: 'Mar 5, 2026', time: '9:00 AM', type: 'Exam', color: '#EF4444' },
    { id: '4', title: 'Tech Startup Workshop', date: 'Mar 8, 2026', time: '2:00 PM', type: 'Workshop', color: '#10B981' },
];

export const mockNotifications: DashboardNotification[] = [
    { id: '1', title: 'Payment Reminder', message: 'Semester fee payment due by March 15th. Avoid late fees.', time: '2h ago', type: 'warning', isRead: false },
    { id: '2', title: 'New Internship Posted', message: 'Software Engineer Intern position at TechCorp is now open.', time: '5h ago', type: 'info', isRead: false },
    { id: '3', title: 'Assignment Submitted', message: 'Your Database Design assignment was submitted successfully.', time: '1d ago', type: 'success', isRead: true },
    { id: '4', title: 'Item Found', message: 'Blue water bottle matching your description found at Library.', time: '2d ago', type: 'info', isRead: true },
];

export const mockActivities: Activity[] = [
    { id: '1', user: { name: 'Sarah Chen' }, action: 'posted a new Kuppi session for', target: 'Data Structures', time: '30 min ago', type: 'create' },
    { id: '2', user: { name: 'Mike Wilson' }, action: 'joined the', target: 'Photography Club', time: '2h ago', type: 'join' },
    { id: '3', user: { name: 'You' }, action: 'completed assignment in', target: 'Software Engineering', time: '5h ago', type: 'complete' },
    { id: '4', user: { name: 'Emily Davis' }, action: 'commented on your post in', target: 'Study Group', time: '1d ago', type: 'comment' },
];

export const mockProgressData: ProgressItem[] = [
    { id: '1', label: 'Semester Progress', value: 68, maxValue: 100, color: '#60A5FA' },
    { id: '2', label: 'Course Completion', value: 45, maxValue: 60, color: '#10B981' },
    { id: '3', label: 'Project Milestones', value: 7, maxValue: 10, color: '#8B5CF6' },
];

export const mockCalendarEvents: CalendarEvent[] = [
    { date: new Date(2026, 1, 28), title: 'Jazz Festival', color: '#60A5FA', type: 'event' },
    { date: new Date(2026, 2, 2), title: 'Kuppi Session', color: '#8B5CF6', type: 'kuppi' },
    { date: new Date(2026, 2, 5), title: 'Mid-terms', color: '#EF4444', type: 'exam' },
    { date: new Date(2026, 2, 8), title: 'Workshop', color: '#10B981', type: 'workshop' },
];

// ============================================================================
// Admin Dashboard Mock Data
// ============================================================================

export const mockAdminActivities = [
    { action: 'New user registered', user: 'John Doe', time: '5 minutes ago', type: 'user' },
    { action: 'Course updated', user: 'Dr. Smith', time: '1 hour ago', type: 'course' },
    { action: 'Event created', user: 'Admin Team', time: '2 hours ago', type: 'event' },
    { action: 'Report generated', user: 'System', time: '3 hours ago', type: 'report' },
];

export const mockPendingApprovals = [
    { title: 'Event: Tech Summit 2026', type: 'Event', status: 'pending' },
    { title: 'Course: Advanced AI', type: 'Course', status: 'pending' },
    { title: 'User: Faculty Request', type: 'User', status: 'pending' },
];

// ============================================================================
// Super Admin Dashboard Mock Data
// ============================================================================

export const mockSystemHealth = [
    { service: 'API Server', status: 'operational' as const, uptime: '99.9%' },
    { service: 'Database', status: 'operational' as const, uptime: '99.8%' },
    { service: 'Auth Service', status: 'operational' as const, uptime: '100%' },
    { service: 'File Storage', status: 'warning' as const, uptime: '98.5%' },
];

export const mockAuditLogs = [
    { action: 'User role changed', admin: 'System Admin', target: 'john.doe@uni.edu', time: '10 min ago' },
    { action: 'System config updated', admin: 'Super Admin', target: 'Email Settings', time: '1 hour ago' },
    { action: 'New admin created', admin: 'Super Admin', target: 'jane.smith@uni.edu', time: '2 hours ago' },
    { action: 'Backup completed', admin: 'System', target: 'Database', time: '6 hours ago' },
];


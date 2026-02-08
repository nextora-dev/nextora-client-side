/**
 * @fileoverview Dashboard Types
 * @description Type definitions for dashboard components and data
 * @module features/dashboard/types
 */

import { ReactNode } from 'react';

// ============================================================================
// Quick Actions
// ============================================================================

export interface QuickAction {
    id: string;
    icon: ReactNode;
    label: string;
    description: string;
    count?: number;
    path: string;
    color: string;
}

// ============================================================================
// Stats
// ============================================================================

export interface StatTrend {
    value: number;
    label: string;
    isPositive: boolean;
}

export interface StatItem {
    id: string;
    title: string;
    value: string | number;
    icon: ReactNode;
    color: string;
    trend?: StatTrend;
    subtitle?: string;
}

// ============================================================================
// Events
// ============================================================================

export interface DashboardEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
    color: string;
}

export interface CalendarEvent {
    date: Date;
    title: string;
    color: string;
    type: string;
}

// ============================================================================
// Notifications
// ============================================================================

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface DashboardNotification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: NotificationType;
    isRead: boolean;
}

// ============================================================================
// Activity
// ============================================================================

export type ActivityType = 'create' | 'join' | 'complete' | 'comment' | 'update' | 'delete';

export interface Activity {
    id: string;
    user: {
        name: string;
        avatar?: string;
    };
    action: string;
    target: string;
    time: string;
    type: ActivityType;
}

// ============================================================================
// Progress
// ============================================================================

export interface ProgressItem {
    id: string;
    label: string;
    value: number;
    maxValue: number;
    color: string;
}

// ============================================================================
// Admin Stats
// ============================================================================

export interface AdminStat {
    icon: React.ComponentType<{ sx?: object }>;
    title: string;
    count: string;
    trend?: string;
    color: string;
}

export interface AdminActivity {
    action: string;
    user: string;
    time: string;
    type: string;
}

export interface PendingApproval {
    title: string;
    type: string;
    status: string;
}

// ============================================================================
// System Health (Super Admin)
// ============================================================================

export interface SystemHealthItem {
    service: string;
    status: 'operational' | 'warning' | 'error';
    uptime: string;
}

export interface DashboardAuditLog {
    action: string;
    admin: string;
    target: string;
    time: string;
}


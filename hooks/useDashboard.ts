/**
 * @fileoverview Dashboard Hook
 * @description Custom hook for managing dashboard state and data fetching
 * @module hooks/useDashboard
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
    StatItem,
    QuickAction,
    DashboardEvent,
    DashboardNotification,
    Activity,
    ProgressItem,
    CalendarEvent,
} from '@/features/dashboard/dashboard.types';
import {
    mockUpcomingEvents,
    mockNotifications,
    mockActivities,
    mockProgressData,
    mockCalendarEvents,
} from '@/features/dashboard/mock-data';

// ============================================================================
// Types
// ============================================================================

interface DashboardState {
    isLoading: boolean;
    stats: StatItem[];
    quickActions: QuickAction[];
    events: DashboardEvent[];
    notifications: DashboardNotification[];
    activities: Activity[];
    progress: ProgressItem[];
    calendarEvents: CalendarEvent[];
}

interface UseDashboardReturn extends DashboardState {
    unreadNotificationCount: number;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
    refreshDashboard: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const LOADING_DELAY_MS = 800;

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDashboard(): UseDashboardReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState<DashboardNotification[]>([]);

    // Simulate initial data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setNotifications(mockNotifications);
            setIsLoading(false);
        }, LOADING_DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    // Calculate unread notifications
    const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

    // Mark single notification as read
    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    }, []);

    // Mark all notifications as read
    const markAllNotificationsAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    // Refresh dashboard data
    const refreshDashboard = useCallback(async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY_MS));
        setNotifications(mockNotifications);
        setIsLoading(false);
    }, []);

    return {
        isLoading,
        stats: [], // Stats are configured per-page
        quickActions: [], // Quick actions are configured per-page
        events: mockUpcomingEvents,
        notifications,
        activities: mockActivities,
        progress: mockProgressData,
        calendarEvents: mockCalendarEvents,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshDashboard,
    };
}


/**
 * @fileoverview Event Module Types
 * @description Type definitions for Events, Registrations, and Admin operations
 */

// ============================================================================
// Enums
// ============================================================================

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export type EventType =
    | 'WORKSHOP'
    | 'SEMINAR'
    | 'CONFERENCE'
    | 'HACKATHON'
    | 'CULTURAL'
    | 'SPORTS'
    | 'SOCIAL'
    | 'ACADEMIC'
    | 'OTHER';

// ============================================================================
// Event Types
// ============================================================================

export interface EventResponse {
    id: number;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    location: string | null;
    venue: string | null;
    eventType: EventType;
    status: EventStatus;
    maxAttendees: number | null;
    registrationLink: string | null;
    coverImageUrl: string | null;
    registrationCount: number;
    creatorId: number;
    creatorName: string;
    creatorEmail?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
}

export interface EventDetailResponse {
    success: boolean;
    message: string;
    data: EventResponse;
    timestamp: string;
}

export interface EventListResponse {
    success: boolean;
    message: string;
    data: {
        content: EventResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
    timestamp: string;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    location?: string;
    venue?: string;
    eventType: EventType;
    maxAttendees?: number;
    registrationLink?: string;
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    startAt?: string;
    endAt?: string;
    location?: string;
    venue?: string;
    eventType?: EventType;
    maxAttendees?: number;
    registrationLink?: string;
}

export interface AdvancedSearchRequest {
    keyword?: string;
    location?: string;
    creatorName?: string;
    eventType?: EventType;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

// ============================================================================
// Registration Types
// ============================================================================

export interface RegistrationResponse {
    id: number;
    eventId: number;
    eventTitle: string;
    userId: number;
    userName: string;
    userEmail: string;
    registeredAt: string;
}

export interface RegistrationListResponse {
    success: boolean;
    message: string;
    data: {
        content: RegistrationResponse[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
    timestamp: string;
}

export interface IsRegisteredResponse {
    success: boolean;
    message: string;
    data: boolean;
    timestamp: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface CreatorAnalytics {
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    cancelledEvents: number;
    totalRegistrations: number;
    upcomingEvents: number;
}

export interface CreatorAnalyticsResponse {
    success: boolean;
    message: string;
    data: CreatorAnalytics;
    timestamp: string;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface PlatformStatistics {
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    cancelledEvents: number;
    completedEvents: number;
    totalRegistrations: number;
    upcomingEvents: number;
    ongoingEvents: number;
}

export interface PlatformStatisticsResponse {
    success: boolean;
    message: string;
    data: PlatformStatistics;
    timestamp: string;
}

// ============================================================================
// Common Params
// ============================================================================

export interface EventPaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export interface EventSearchParams extends EventPaginationParams {
    keyword?: string;
}

// ============================================================================
// Action Response
// ============================================================================

export interface EventActionResponse {
    success: boolean;
    message: string;
    data?: unknown;
    timestamp: string;
}

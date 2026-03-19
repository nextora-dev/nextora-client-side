/**
 * @fileoverview Event Module Services
 * @description API services for Events, Registrations, and Admin operations
 */

import apiClient from '@/lib/api-client';
import {
    EventListResponse,
    EventDetailResponse,
    EventActionResponse,
    CreateEventRequest,
    UpdateEventRequest,
    AdvancedSearchRequest,
    RegistrationListResponse,
    IsRegisteredResponse,
    CreatorAnalyticsResponse,
    PlatformStatisticsResponse,
    EventPaginationParams,
    EventSearchParams,
    EventType,
} from './types';

// ============================================================================
// Endpoints
// ============================================================================

const EVENT_BASE = '/events';
const ADMIN_EVENT_BASE = '/admin/events';

export const EVENT_ENDPOINTS = {
    // Public - Event Viewing & Search
    LIST: EVENT_BASE,
    BY_ID: (id: number) => `${EVENT_BASE}/${id}`,
    SEARCH: `${EVENT_BASE}/search`,
    ADVANCED_SEARCH: `${EVENT_BASE}/search/advanced`,
    UPCOMING: `${EVENT_BASE}/upcoming`,
    ONGOING: `${EVENT_BASE}/ongoing`,
    PAST: `${EVENT_BASE}/past`,
    SEARCH_DATE: `${EVENT_BASE}/search/date`,
    SEARCH_TYPE: `${EVENT_BASE}/search/type`,
    SEARCH_LOCATION: `${EVENT_BASE}/search/location`,
    SEARCH_CREATOR: `${EVENT_BASE}/search/creator`,

    // Creator - Event CRUD & Management
    PUBLISH: (id: number) => `${EVENT_BASE}/${id}/publish`,
    CANCEL: (id: number) => `${EVENT_BASE}/${id}/cancel`,
    RESCHEDULE: (id: number) => `${EVENT_BASE}/${id}/reschedule`,
    MY_EVENTS: `${EVENT_BASE}/my`,
    MY_ANALYTICS: `${EVENT_BASE}/my/analytics`,

    // Registration
    REGISTER: (id: number) => `${EVENT_BASE}/${id}/register`,
    IS_REGISTERED: (id: number) => `${EVENT_BASE}/${id}/is-registered`,
    MY_REGISTRATIONS: `${EVENT_BASE}/my/registrations`,
    EVENT_REGISTRATIONS: (id: number) => `${EVENT_BASE}/${id}/registrations`,

    // Admin
    ADMIN_LIST: ADMIN_EVENT_BASE,
    ADMIN_UPDATE: (id: number) => `${ADMIN_EVENT_BASE}/${id}`,
    ADMIN_DELETE: (id: number) => `${ADMIN_EVENT_BASE}/${id}`,
    ADMIN_STATS: `${ADMIN_EVENT_BASE}/stats`,
    ADMIN_PERMANENT_DELETE: (id: number) => `${ADMIN_EVENT_BASE}/${id}/permanent`,
};

// ============================================================================
// Helper
// ============================================================================

function buildQueryParams<T extends object>(params: T): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
        }
    });
    return queryParams.toString();
}

// ============================================================================
// Public - Event Viewing & Search
// ============================================================================

/** Get all published events (paginated) */
export async function getEvents(params: EventPaginationParams = {}): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.LIST}?${query}` : EVENT_ENDPOINTS.LIST;
    const response = await apiClient.get<EventListResponse>(url);
    return response.data;
}

/** Get event by ID */
export async function getEventById(id: number): Promise<EventDetailResponse> {
    const response = await apiClient.get<EventDetailResponse>(EVENT_ENDPOINTS.BY_ID(id));
    return response.data;
}

/** Search events by keyword */
export async function searchEvents(params: EventSearchParams): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<EventListResponse>(`${EVENT_ENDPOINTS.SEARCH}?${query}`);
    return response.data;
}

/** Advanced search */
export async function advancedSearch(data: AdvancedSearchRequest): Promise<EventListResponse> {
    const response = await apiClient.post<EventListResponse>(EVENT_ENDPOINTS.ADVANCED_SEARCH, data);
    return response.data;
}

/** Get upcoming events */
export async function getUpcomingEvents(params: EventPaginationParams = {}): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.UPCOMING}?${query}` : EVENT_ENDPOINTS.UPCOMING;
    const response = await apiClient.get<EventListResponse>(url);
    return response.data;
}

/** Get ongoing events */
export async function getOngoingEvents(params: EventPaginationParams = {}): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.ONGOING}?${query}` : EVENT_ENDPOINTS.ONGOING;
    const response = await apiClient.get<EventListResponse>(url);
    return response.data;
}

/** Get past events */
export async function getPastEvents(params: EventPaginationParams = {}): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.PAST}?${query}` : EVENT_ENDPOINTS.PAST;
    const response = await apiClient.get<EventListResponse>(url);
    return response.data;
}

/** Search by date range */
export async function searchByDateRange(
    startDate: string,
    endDate: string,
    params: EventPaginationParams = {},
): Promise<EventListResponse> {
    const query = buildQueryParams({ startDate, endDate, ...params });
    const response = await apiClient.get<EventListResponse>(`${EVENT_ENDPOINTS.SEARCH_DATE}?${query}`);
    return response.data;
}

/** Search by event type */
export async function searchByType(
    eventType: EventType,
    params: EventPaginationParams = {},
): Promise<EventListResponse> {
    const query = buildQueryParams({ eventType, ...params });
    const response = await apiClient.get<EventListResponse>(`${EVENT_ENDPOINTS.SEARCH_TYPE}?${query}`);
    return response.data;
}

/** Search by location */
export async function searchByLocation(
    location: string,
    params: EventPaginationParams = {},
): Promise<EventListResponse> {
    const query = buildQueryParams({ location, ...params });
    const response = await apiClient.get<EventListResponse>(`${EVENT_ENDPOINTS.SEARCH_LOCATION}?${query}`);
    return response.data;
}

/** Search by creator name */
export async function searchByCreator(
    creatorName: string,
    params: EventPaginationParams = {},
): Promise<EventListResponse> {
    const query = buildQueryParams({ creatorName, ...params });
    const response = await apiClient.get<EventListResponse>(`${EVENT_ENDPOINTS.SEARCH_CREATOR}?${query}`);
    return response.data;
}

// ============================================================================
// Creator - Event CRUD & Management
// ============================================================================

/** Create event (multipart/form-data with optional cover image) */
export async function createEvent(data: CreateEventRequest, coverImage?: File): Promise<EventDetailResponse> {
    const formData = new FormData();
    // Send event JSON as a Blob with application/json content type for Spring Boot @RequestPart
    formData.append('event', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (coverImage) formData.append('coverImage', coverImage);

    const response = await apiClient.post<EventDetailResponse>(EVENT_ENDPOINTS.LIST, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/** Update event (multipart/form-data with optional cover image) */
export async function updateEvent(id: number, data: CreateEventRequest, coverImage?: File): Promise<EventDetailResponse> {
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (coverImage) formData.append('coverImage', coverImage);

    const response = await apiClient.put<EventDetailResponse>(EVENT_ENDPOINTS.BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/** Publish event */
export async function publishEvent(id: number): Promise<EventActionResponse> {
    const response = await apiClient.post<EventActionResponse>(EVENT_ENDPOINTS.PUBLISH(id));
    return response.data;
}

/** Cancel event */
export async function cancelEvent(id: number, reason?: string): Promise<EventActionResponse> {
    const url = reason
        ? `${EVENT_ENDPOINTS.CANCEL(id)}?reason=${encodeURIComponent(reason)}`
        : EVENT_ENDPOINTS.CANCEL(id);
    const response = await apiClient.post<EventActionResponse>(url);
    return response.data;
}

/** Reschedule event */
export async function rescheduleEvent(
    id: number,
    newStartTime: string,
    newEndTime: string,
): Promise<EventActionResponse> {
    const query = buildQueryParams({ newStartTime, newEndTime });
    const response = await apiClient.post<EventActionResponse>(`${EVENT_ENDPOINTS.RESCHEDULE(id)}?${query}`);
    return response.data;
}

/** Delete event (soft delete) */
export async function deleteEvent(id: number): Promise<EventActionResponse> {
    const response = await apiClient.delete<EventActionResponse>(EVENT_ENDPOINTS.BY_ID(id));
    return response.data;
}

/** Get my events */
export async function getMyEvents(params: EventPaginationParams = {}): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.MY_EVENTS}?${query}` : EVENT_ENDPOINTS.MY_EVENTS;
    const response = await apiClient.get<EventListResponse>(url);
    return response.data;
}

/** Get my event analytics */
export async function getMyAnalytics(): Promise<CreatorAnalyticsResponse> {
    const response = await apiClient.get<CreatorAnalyticsResponse>(EVENT_ENDPOINTS.MY_ANALYTICS);
    return response.data;
}

// ============================================================================
// Registration Services
// ============================================================================

/** Register for event */
export async function registerForEvent(eventId: number): Promise<EventActionResponse> {
    const response = await apiClient.post<EventActionResponse>(EVENT_ENDPOINTS.REGISTER(eventId));
    return response.data;
}

/** Cancel registration */
export async function cancelRegistration(eventId: number): Promise<EventActionResponse> {
    const response = await apiClient.delete<EventActionResponse>(EVENT_ENDPOINTS.REGISTER(eventId));
    return response.data;
}

/** Check if registered */
export async function checkIsRegistered(eventId: number): Promise<IsRegisteredResponse> {
    const response = await apiClient.get<IsRegisteredResponse>(EVENT_ENDPOINTS.IS_REGISTERED(eventId));
    return response.data;
}

/** Get my registrations */
export async function getMyRegistrations(params: EventPaginationParams = {}): Promise<RegistrationListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.MY_REGISTRATIONS}?${query}` : EVENT_ENDPOINTS.MY_REGISTRATIONS;
    const response = await apiClient.get<RegistrationListResponse>(url);
    return response.data;
}

/** Get event registrations (creator/admin) */
export async function getEventRegistrations(
    eventId: number,
    params: EventPaginationParams = {},
): Promise<RegistrationListResponse> {
    const query = buildQueryParams(params);
    const url = query
        ? `${EVENT_ENDPOINTS.EVENT_REGISTRATIONS(eventId)}?${query}`
        : EVENT_ENDPOINTS.EVENT_REGISTRATIONS(eventId);
    const response = await apiClient.get<RegistrationListResponse>(url);
    return response.data;
}

// ============================================================================
// Admin Services
// ============================================================================

/** Get all events including drafts (admin) */
export async function getAdminEvents(params: EventPaginationParams = {}): Promise<EventListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${EVENT_ENDPOINTS.ADMIN_LIST}?${query}` : EVENT_ENDPOINTS.ADMIN_LIST;
    const response = await apiClient.get<EventListResponse>(url);
    return response.data;
}

/** Admin update event */
export async function adminUpdateEvent(id: number, data: UpdateEventRequest): Promise<EventDetailResponse> {
    const response = await apiClient.put<EventDetailResponse>(EVENT_ENDPOINTS.ADMIN_UPDATE(id), data);
    return response.data;
}

/** Admin delete event (soft delete) */
export async function adminDeleteEvent(id: number): Promise<EventActionResponse> {
    const response = await apiClient.delete<EventActionResponse>(EVENT_ENDPOINTS.ADMIN_DELETE(id));
    return response.data;
}

/** Get platform statistics */
export async function getPlatformStatistics(): Promise<PlatformStatisticsResponse> {
    const response = await apiClient.get<PlatformStatisticsResponse>(EVENT_ENDPOINTS.ADMIN_STATS);
    return response.data;
}

/** Permanent delete event (super admin) */
export async function permanentDeleteEvent(id: number): Promise<EventActionResponse> {
    const response = await apiClient.delete<EventActionResponse>(EVENT_ENDPOINTS.ADMIN_PERMANENT_DELETE(id));
    return response.data;
}

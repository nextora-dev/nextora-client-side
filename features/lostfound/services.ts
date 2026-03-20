/**
 * @fileoverview Lost & Found Module Services
 * @description API services for lost items, found items, claims, images, and admin operations
 */

import apiClient from '@/lib/api-client';
import type {
    ApiResponse,
    PagedData,
    LostItemResponse,
    FoundItemResponse,
    LostItemImageResponse,
    ClaimResponse,
    MatchResponse,
    LostFoundStats,
    ReportLostItemRequest,
    UpdateLostItemRequest,
    ReportFoundItemRequest,
    UpdateFoundItemRequest,
    SubmitClaimRequest,
    AdminUpdateLostItemRequest,
    AdminUpdateFoundItemRequest,
    LostFoundPaginationParams,
    LostFoundSearchParams,
} from './types';

// ============================================================================
// Endpoints
// ============================================================================

const BASE = '/lost-and-found';
const ADMIN_BASE = '/admin/lost-and-found';

export const LOST_FOUND_ENDPOINTS = {
    // Categories
    CATEGORIES: `${BASE}/items/categories`,

    // Lost Items
    REPORT_LOST: `${BASE}/items/lost`,
    LOST_BY_ID: (id: number) => `${BASE}/items/lost/${id}`,
    SEARCH_LOST_SIMPLE: `${BASE}/items/lost`,
    SEARCH_LOST: `${BASE}/items/lost/search`,
    DELETE_LOST: (id: number) => `${BASE}/items/lost/${id}`,
    LOST_MATCHES: (id: number) => `${BASE}/items/lost/${id}/matches`,

    // Lost Item Images
    UPLOAD_LOST_IMAGES: (id: number) => `${BASE}/items/lost/${id}/images`,
    LOST_IMAGES: (id: number) => `${BASE}/items/lost/${id}/images`,
    DELETE_IMAGE: (imageId: number) => `${BASE}/items/images/${imageId}`,

    // Found Items
    REPORT_FOUND: `${BASE}/items/found`,
    FOUND_BY_ID: (id: number) => `${BASE}/items/found/${id}`,
    SEARCH_FOUND_SIMPLE: `${BASE}/items/found`,
    SEARCH_FOUND: `${BASE}/items/found/search`,
    DELETE_FOUND: (id: number) => `${BASE}/items/found/${id}`,
    FOUND_MATCHES: (id: number) => `${BASE}/items/found/${id}/matches`,

    // Found Item Images
    UPLOAD_FOUND_IMAGES: (id: number) => `${BASE}/items/found/${id}/images`,
    FOUND_IMAGES: (id: number) => `${BASE}/items/found/${id}/images`,

    // Claims
    SUBMIT_CLAIM: `${BASE}/claims`,
    CLAIM_BY_ID: (id: number) => `${BASE}/claims/${id}`,
    MY_CLAIMS: `${BASE}/claims/my`,
    CLAIMS_BY_STATUS: (status: string) => `${BASE}/claims/status/${status}`,
    APPROVE_CLAIM: (id: number) => `${BASE}/claims/${id}/approve`,
    REJECT_CLAIM: (id: number) => `${BASE}/claims/${id}/reject`,

    // Admin
    ADMIN_STATS: `${ADMIN_BASE}/stats`,
    ADMIN_UPDATE_LOST: (id: number) => `${ADMIN_BASE}/lost/${id}`,
    ADMIN_DELETE_LOST: (id: number) => `${ADMIN_BASE}/lost/${id}`,
    ADMIN_UPDATE_FOUND: (id: number) => `${ADMIN_BASE}/found/${id}`,
    ADMIN_DELETE_FOUND: (id: number) => `${ADMIN_BASE}/found/${id}`,
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
// Categories
// ============================================================================

export async function getCategories(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get<ApiResponse<string[]>>(LOST_FOUND_ENDPOINTS.CATEGORIES);
    return response.data;
}

// ============================================================================
// Lost Items
// ============================================================================

export async function reportLostItem(data: ReportLostItemRequest): Promise<ApiResponse<LostItemResponse>> {
    const response = await apiClient.post<ApiResponse<LostItemResponse>>(LOST_FOUND_ENDPOINTS.REPORT_LOST, data);
    return response.data;
}

export async function getLostItemById(id: number): Promise<ApiResponse<LostItemResponse>> {
    const response = await apiClient.get<ApiResponse<LostItemResponse>>(LOST_FOUND_ENDPOINTS.LOST_BY_ID(id));
    return response.data;
}

export async function updateLostItem(id: number, data: UpdateLostItemRequest): Promise<ApiResponse<LostItemResponse>> {
    const response = await apiClient.put<ApiResponse<LostItemResponse>>(LOST_FOUND_ENDPOINTS.LOST_BY_ID(id), data);
    return response.data;
}

export async function searchLostItemsSimple(params: LostFoundSearchParams): Promise<ApiResponse<PagedData<LostItemResponse>>> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<ApiResponse<PagedData<LostItemResponse>>>(`${LOST_FOUND_ENDPOINTS.SEARCH_LOST_SIMPLE}?${query}`);
    return response.data;
}

export async function searchLostItems(params: LostFoundSearchParams): Promise<ApiResponse<PagedData<LostItemResponse>>> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<ApiResponse<PagedData<LostItemResponse>>>(`${LOST_FOUND_ENDPOINTS.SEARCH_LOST}?${query}`);
    return response.data;
}

export async function deleteLostItem(id: number): Promise<void> {
    await apiClient.delete(LOST_FOUND_ENDPOINTS.DELETE_LOST(id));
}

export async function findLostItemMatches(id: number): Promise<ApiResponse<MatchResponse[]>> {
    const response = await apiClient.get<ApiResponse<MatchResponse[]>>(LOST_FOUND_ENDPOINTS.LOST_MATCHES(id));
    return response.data;
}

// ============================================================================
// Lost Item Images
// ============================================================================

export async function uploadLostItemImages(itemId: number, files: File[]): Promise<ApiResponse<LostItemImageResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await apiClient.post<ApiResponse<LostItemImageResponse[]>>(
        LOST_FOUND_ENDPOINTS.UPLOAD_LOST_IMAGES(itemId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
}

export async function getLostItemImages(itemId: number): Promise<ApiResponse<LostItemImageResponse[]>> {
    const response = await apiClient.get<ApiResponse<LostItemImageResponse[]>>(LOST_FOUND_ENDPOINTS.LOST_IMAGES(itemId));
    return response.data;
}

export async function deleteImage(imageId: number): Promise<void> {
    await apiClient.delete(LOST_FOUND_ENDPOINTS.DELETE_IMAGE(imageId));
}

// ============================================================================
// Found Items
// ============================================================================

export async function reportFoundItem(data: ReportFoundItemRequest): Promise<ApiResponse<FoundItemResponse>> {
    const response = await apiClient.post<ApiResponse<FoundItemResponse>>(LOST_FOUND_ENDPOINTS.REPORT_FOUND, data);
    return response.data;
}

export async function getFoundItemById(id: number): Promise<ApiResponse<FoundItemResponse>> {
    const response = await apiClient.get<ApiResponse<FoundItemResponse>>(LOST_FOUND_ENDPOINTS.FOUND_BY_ID(id));
    return response.data;
}

export async function updateFoundItem(id: number, data: UpdateFoundItemRequest): Promise<ApiResponse<FoundItemResponse>> {
    const response = await apiClient.put<ApiResponse<FoundItemResponse>>(LOST_FOUND_ENDPOINTS.FOUND_BY_ID(id), data);
    return response.data;
}

export async function searchFoundItemsSimple(params: LostFoundSearchParams): Promise<ApiResponse<PagedData<FoundItemResponse>>> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<ApiResponse<PagedData<FoundItemResponse>>>(`${LOST_FOUND_ENDPOINTS.SEARCH_FOUND_SIMPLE}?${query}`);
    return response.data;
}

export async function searchFoundItems(params: LostFoundSearchParams): Promise<ApiResponse<PagedData<FoundItemResponse>>> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<ApiResponse<PagedData<FoundItemResponse>>>(`${LOST_FOUND_ENDPOINTS.SEARCH_FOUND}?${query}`);
    return response.data;
}

export async function deleteFoundItem(id: number): Promise<void> {
    await apiClient.delete(LOST_FOUND_ENDPOINTS.DELETE_FOUND(id));
}

export async function findFoundItemMatches(id: number): Promise<ApiResponse<MatchResponse[]>> {
    const response = await apiClient.get<ApiResponse<MatchResponse[]>>(LOST_FOUND_ENDPOINTS.FOUND_MATCHES(id));
    return response.data;
}

// ============================================================================
// Found Item Images
// ============================================================================

export async function uploadFoundItemImages(itemId: number, files: File[]): Promise<ApiResponse<LostItemImageResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await apiClient.post<ApiResponse<LostItemImageResponse[]>>(
        LOST_FOUND_ENDPOINTS.UPLOAD_FOUND_IMAGES(itemId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
}

export async function getFoundItemImages(itemId: number): Promise<ApiResponse<LostItemImageResponse[]>> {
    const response = await apiClient.get<ApiResponse<LostItemImageResponse[]>>(LOST_FOUND_ENDPOINTS.FOUND_IMAGES(itemId));
    return response.data;
}

// ============================================================================
// Claims
// ============================================================================

export async function submitClaim(data: SubmitClaimRequest): Promise<ApiResponse<ClaimResponse>> {
    const response = await apiClient.post<ApiResponse<ClaimResponse>>(LOST_FOUND_ENDPOINTS.SUBMIT_CLAIM, data);
    return response.data;
}

export async function getClaimById(id: number): Promise<ApiResponse<ClaimResponse>> {
    const response = await apiClient.get<ApiResponse<ClaimResponse>>(LOST_FOUND_ENDPOINTS.CLAIM_BY_ID(id));
    return response.data;
}

export async function getMyClaims(params: LostFoundPaginationParams = {}): Promise<ApiResponse<PagedData<ClaimResponse>>> {
    const query = buildQueryParams(params);
    const url = query ? `${LOST_FOUND_ENDPOINTS.MY_CLAIMS}?${query}` : LOST_FOUND_ENDPOINTS.MY_CLAIMS;
    const response = await apiClient.get<ApiResponse<PagedData<ClaimResponse>>>(url);
    return response.data;
}

export async function getClaimsByStatus(status: string, params: LostFoundPaginationParams = {}): Promise<ApiResponse<PagedData<ClaimResponse>>> {
    const query = buildQueryParams(params);
    const url = query ? `${LOST_FOUND_ENDPOINTS.CLAIMS_BY_STATUS(status)}?${query}` : LOST_FOUND_ENDPOINTS.CLAIMS_BY_STATUS(status);
    const response = await apiClient.get<ApiResponse<PagedData<ClaimResponse>>>(url);
    return response.data;
}

export async function approveClaim(id: number): Promise<ApiResponse<ClaimResponse>> {
    const response = await apiClient.put<ApiResponse<ClaimResponse>>(LOST_FOUND_ENDPOINTS.APPROVE_CLAIM(id));
    return response.data;
}

export async function rejectClaim(id: number, reason: string): Promise<ApiResponse<ClaimResponse>> {
    const response = await apiClient.put<ApiResponse<ClaimResponse>>(
        `${LOST_FOUND_ENDPOINTS.REJECT_CLAIM(id)}?reason=${encodeURIComponent(reason)}`,
    );
    return response.data;
}

// ============================================================================
// Admin Operations
// ============================================================================

export async function getAdminStats(): Promise<ApiResponse<LostFoundStats>> {
    const response = await apiClient.get<ApiResponse<LostFoundStats>>(LOST_FOUND_ENDPOINTS.ADMIN_STATS);
    return response.data;
}

export async function adminUpdateLostItem(id: number, data: AdminUpdateLostItemRequest): Promise<ApiResponse<LostItemResponse>> {
    const response = await apiClient.put<ApiResponse<LostItemResponse>>(LOST_FOUND_ENDPOINTS.ADMIN_UPDATE_LOST(id), data);
    return response.data;
}

export async function adminDeleteLostItem(id: number): Promise<void> {
    await apiClient.delete(LOST_FOUND_ENDPOINTS.ADMIN_DELETE_LOST(id));
}

export async function adminUpdateFoundItem(id: number, data: AdminUpdateFoundItemRequest): Promise<ApiResponse<FoundItemResponse>> {
    const response = await apiClient.put<ApiResponse<FoundItemResponse>>(LOST_FOUND_ENDPOINTS.ADMIN_UPDATE_FOUND(id), data);
    return response.data;
}

export async function adminDeleteFoundItem(id: number): Promise<void> {
    await apiClient.delete(LOST_FOUND_ENDPOINTS.ADMIN_DELETE_FOUND(id));
}

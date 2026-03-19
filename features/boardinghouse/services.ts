/**
 * @fileoverview Boarding House Module Services
 * @description API services for Boarding House listings, images, and admin operations
 */

import apiClient from '@/lib/api-client';
import {
    BoardingHouseListResponse,
    BoardingHouseDetailResponse,
    BoardingHouseActionResponse,
    BoardingHouseImagesResponse,
    BoardingHouseImageDetailResponse,
    BoardingHouseStatsResponse,
    CreateBoardingHouseRequest,
    UpdateBoardingHouseRequest,
    BoardingHousePaginationParams,
    BoardingHouseSearchParams,
    BoardingHouseFilterParams,
} from './types';

// ============================================================================
// Endpoints
// ============================================================================

const BASE = '/boardinghouse/houses';
const ADMIN_BASE = '/admin/boardinghouse';

export const BOARDING_HOUSE_ENDPOINTS = {
    // Browse & Search (All Users)
    LIST: BASE,
    BY_ID: (id: number) => `${BASE}/${id}`,
    SEARCH: `${BASE}/search`,
    FILTER: `${BASE}/filter`,
    BY_CITY: `${BASE}/city`,
    BY_DISTRICT: `${BASE}/district`,
    IMAGES: (id: number) => `${BASE}/${id}/images`,

    // CRUD (Admin / Non-Academic Staff)
    CREATE: BASE,
    UPDATE: (id: number) => `${BASE}/${id}`,
    DELETE: (id: number) => `${BASE}/${id}`,
    MY_LISTINGS: `${BASE}/my`,
    ALL_LISTINGS: `${BASE}/all`,

    // Image Management
    UPLOAD_IMAGES: (id: number) => `${BASE}/${id}/images`,
    SET_PRIMARY: (houseId: number, imageId: number) => `${BASE}/${houseId}/images/${imageId}/primary`,
    DELETE_IMAGE: (houseId: number, imageId: number) => `${BASE}/${houseId}/images/${imageId}`,

    // Admin Operations
    ADMIN_UPDATE: (id: number) => `${ADMIN_BASE}/houses/${id}`,
    ADMIN_DELETE: (id: number) => `${ADMIN_BASE}/houses/${id}`,
    ADMIN_PERMANENT_DELETE: (id: number) => `${ADMIN_BASE}/houses/${id}/permanent`,
    ADMIN_STATS: `${ADMIN_BASE}/stats`,
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
// Browse & Search (All Users)
// ============================================================================

/** Get all available listings (paginated) */
export async function getListings(params: BoardingHousePaginationParams = {}): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${BOARDING_HOUSE_ENDPOINTS.LIST}?${query}` : BOARDING_HOUSE_ENDPOINTS.LIST;
    const response = await apiClient.get<BoardingHouseListResponse>(url);
    return response.data;
}

/** Get listing by ID */
export async function getListingById(id: number): Promise<BoardingHouseDetailResponse> {
    const response = await apiClient.get<BoardingHouseDetailResponse>(BOARDING_HOUSE_ENDPOINTS.BY_ID(id));
    return response.data;
}

/** Search listings by keyword */
export async function searchListings(params: BoardingHouseSearchParams): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<BoardingHouseListResponse>(`${BOARDING_HOUSE_ENDPOINTS.SEARCH}?${query}`);
    return response.data;
}

/** Advanced filter */
export async function filterListings(params: BoardingHouseFilterParams): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams(params);
    const response = await apiClient.get<BoardingHouseListResponse>(`${BOARDING_HOUSE_ENDPOINTS.FILTER}?${query}`);
    return response.data;
}

/** Filter by city */
export async function filterByCity(city: string, params: BoardingHousePaginationParams = {}): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams({ city, ...params });
    const response = await apiClient.get<BoardingHouseListResponse>(`${BOARDING_HOUSE_ENDPOINTS.BY_CITY}?${query}`);
    return response.data;
}

/** Filter by district */
export async function filterByDistrict(district: string, params: BoardingHousePaginationParams = {}): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams({ district, ...params });
    const response = await apiClient.get<BoardingHouseListResponse>(`${BOARDING_HOUSE_ENDPOINTS.BY_DISTRICT}?${query}`);
    return response.data;
}

/** Get images for listing */
export async function getImages(houseId: number): Promise<BoardingHouseImagesResponse> {
    const response = await apiClient.get<BoardingHouseImagesResponse>(BOARDING_HOUSE_ENDPOINTS.IMAGES(houseId));
    return response.data;
}

// ============================================================================
// CRUD Operations (Admin / Non-Academic Staff)
// ============================================================================

/** Create boarding house listing */
export async function createListing(data: CreateBoardingHouseRequest): Promise<BoardingHouseDetailResponse> {
    const response = await apiClient.post<BoardingHouseDetailResponse>(BOARDING_HOUSE_ENDPOINTS.CREATE, data);
    return response.data;
}

/** Update boarding house listing */
export async function updateListing(id: number, data: UpdateBoardingHouseRequest): Promise<BoardingHouseDetailResponse> {
    const response = await apiClient.put<BoardingHouseDetailResponse>(BOARDING_HOUSE_ENDPOINTS.UPDATE(id), data);
    return response.data;
}

/** Soft delete boarding house listing */
export async function deleteListing(id: number): Promise<void> {
    await apiClient.delete(BOARDING_HOUSE_ENDPOINTS.DELETE(id));
}

/** Get my listings */
export async function getMyListings(params: BoardingHousePaginationParams = {}): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${BOARDING_HOUSE_ENDPOINTS.MY_LISTINGS}?${query}` : BOARDING_HOUSE_ENDPOINTS.MY_LISTINGS;
    const response = await apiClient.get<BoardingHouseListResponse>(url);
    return response.data;
}

/** Get all listings - admin view (includes unavailable) */
export async function getAllListingsAdmin(params: BoardingHousePaginationParams = {}): Promise<BoardingHouseListResponse> {
    const query = buildQueryParams(params);
    const url = query ? `${BOARDING_HOUSE_ENDPOINTS.ALL_LISTINGS}?${query}` : BOARDING_HOUSE_ENDPOINTS.ALL_LISTINGS;
    const response = await apiClient.get<BoardingHouseListResponse>(url);
    return response.data;
}

// ============================================================================
// Image Management
// ============================================================================

/** Upload images for a listing */
export async function uploadImages(houseId: number, files: File[]): Promise<BoardingHouseImagesResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await apiClient.post<BoardingHouseImagesResponse>(
        BOARDING_HOUSE_ENDPOINTS.UPLOAD_IMAGES(houseId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
}

/** Set primary image */
export async function setPrimaryImage(houseId: number, imageId: number): Promise<BoardingHouseImageDetailResponse> {
    const response = await apiClient.put<BoardingHouseImageDetailResponse>(
        BOARDING_HOUSE_ENDPOINTS.SET_PRIMARY(houseId, imageId),
    );
    return response.data;
}

/** Delete image */
export async function deleteImage(houseId: number, imageId: number): Promise<void> {
    await apiClient.delete(BOARDING_HOUSE_ENDPOINTS.DELETE_IMAGE(houseId, imageId));
}

// ============================================================================
// Admin Operations
// ============================================================================

/** Admin update any listing */
export async function adminUpdateListing(id: number, data: UpdateBoardingHouseRequest): Promise<BoardingHouseDetailResponse> {
    const response = await apiClient.put<BoardingHouseDetailResponse>(BOARDING_HOUSE_ENDPOINTS.ADMIN_UPDATE(id), data);
    return response.data;
}

/** Admin soft delete any listing */
export async function adminDeleteListing(id: number): Promise<BoardingHouseActionResponse> {
    const response = await apiClient.delete<BoardingHouseActionResponse>(BOARDING_HOUSE_ENDPOINTS.ADMIN_DELETE(id));
    return response.data;
}

/** Permanently delete listing (Super Admin only) */
export async function permanentDeleteListing(id: number): Promise<BoardingHouseActionResponse> {
    const response = await apiClient.delete<BoardingHouseActionResponse>(BOARDING_HOUSE_ENDPOINTS.ADMIN_PERMANENT_DELETE(id));
    return response.data;
}

/** Get platform statistics */
export async function getPlatformStats(): Promise<BoardingHouseStatsResponse> {
    const response = await apiClient.get<BoardingHouseStatsResponse>(BOARDING_HOUSE_ENDPOINTS.ADMIN_STATS);
    return response.data;
}

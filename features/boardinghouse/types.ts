/**
 * @fileoverview Boarding House Module Types
 * @description Type definitions for Boarding House listings, images, and admin operations
 */

// ============================================================================
// Enums
// ============================================================================

export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY';

// ============================================================================
// Boarding House Types
// ============================================================================

export interface BoardingHouseResponse {
    id: number;
    title: string;
    description: string | null;
    price: number;
    formattedPrice: string;
    address: string;
    city: string;
    district: string;
    genderPreference: GenderPreference;
    genderPreferenceDisplay: string;
    totalRooms: number | null;
    availableRooms: number | null;
    contactName: string;
    contactPhone: string;
    contactEmail: string | null;
    amenities: string[];
    isAvailable: boolean;
    viewCount: number;
    images: BoardingHouseImageResponse[];
    primaryImageUrl: string | null;
    postedById: number;
    postedByName: string;
    postedByEmail?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
}

export interface BoardingHouseImageResponse {
    id: number;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
    createdAt?: string;
}

export interface CreateBoardingHouseRequest {
    title: string;
    description?: string;
    price: number;
    address: string;
    city: string;
    district: string;
    genderPreference?: GenderPreference;
    totalRooms?: number;
    availableRooms?: number;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    amenities?: string[];
    isAvailable?: boolean;
}

export interface UpdateBoardingHouseRequest {
    title?: string;
    description?: string;
    price?: number;
    address?: string;
    city?: string;
    district?: string;
    genderPreference?: GenderPreference;
    totalRooms?: number;
    availableRooms?: number;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    amenities?: string[];
    isAvailable?: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

export interface BoardingHouseDetailResponse {
    success: boolean;
    message: string;
    data: BoardingHouseResponse;
    timestamp: string;
}

export interface BoardingHouseListResponse {
    success: boolean;
    message: string;
    data: {
        content: BoardingHouseResponse[];
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

export interface BoardingHouseImagesResponse {
    success: boolean;
    message: string;
    data: BoardingHouseImageResponse[];
    timestamp: string;
}

export interface BoardingHouseImageDetailResponse {
    success: boolean;
    message: string;
    data: BoardingHouseImageResponse;
    timestamp: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface BoardingHouseStats {
    totalListings: number;
    availableListings: number;
    unavailableListings: number;
    totalViews: number;
    maleOnlyListings: number;
    femaleOnlyListings: number;
    anyGenderListings: number;
}

export interface BoardingHouseStatsResponse {
    success: boolean;
    message: string;
    data: BoardingHouseStats;
    timestamp: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface BoardingHouseFilterParams {
    city?: string;
    district?: string;
    genderPreference?: GenderPreference;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

// ============================================================================
// Common Params
// ============================================================================

export interface BoardingHousePaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export interface BoardingHouseSearchParams extends BoardingHousePaginationParams {
    keyword?: string;
}

// ============================================================================
// Action Response
// ============================================================================

export interface BoardingHouseActionResponse {
    success: boolean;
    message: string;
    data?: unknown;
    timestamp: string;
}

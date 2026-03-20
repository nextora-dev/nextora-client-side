/**
 * @fileoverview Lost & Found Module Types
 * @description Type definitions for lost items, found items, claims, images, and admin operations
 */

// ============================================================================
// Enums / Literals
// ============================================================================

export type ItemType = 'LOST' | 'FOUND';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ============================================================================
// Item Types
// ============================================================================

export interface LostItemResponse {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    contactNumber: string;
    dateLost: string;
    active: boolean;
    imageUrls: string[];
    reportedById: number;
    reportedByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface FoundItemResponse {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    contactNumber: string;
    dateFound: string;
    pickupLocation: string;
    active: boolean;
    imageUrls: string[];
    reportedById: number;
    reportedByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface LostItemImageResponse {
    id: number;
    imageUrl: string;
    itemId: number;
    createdAt: string;
}

// ============================================================================
// Claim Types
// ============================================================================

export interface ClaimResponse {
    id: number;
    lostItemId: number;
    lostItemTitle: string;
    foundItemId: number;
    foundItemTitle: string;
    claimantId: number;
    claimantName: string;
    proofDescription: string;
    status: ClaimStatus;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// Match Types
// ============================================================================

export interface MatchResponse {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    matchScore: number;
    imageUrls: string[];
    reportedByName: string;
    createdAt: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface LostFoundStats {
    totalLostItems: number;
    totalFoundItems: number;
    activeLostItems: number;
    activeFoundItems: number;
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
}

// ============================================================================
// Request Types
// ============================================================================

export interface ReportLostItemRequest {
    title: string;
    description: string;
    category: string;
    location: string;
    contactNumber: string;
    dateLost: string;
}

export interface UpdateLostItemRequest {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    contactNumber?: string;
    dateLost?: string;
}

export interface ReportFoundItemRequest {
    title: string;
    description: string;
    category: string;
    location: string;
    contactNumber: string;
    dateFound: string;
    pickupLocation: string;
}

export interface UpdateFoundItemRequest {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    contactNumber?: string;
    dateFound?: string;
    pickupLocation?: string;
}

export interface SubmitClaimRequest {
    lostItemId: number;
    foundItemId: number;
    proofDescription: string;
}

export interface AdminUpdateLostItemRequest {
    active?: boolean;
    description?: string;
    title?: string;
    category?: string;
    location?: string;
}

export interface AdminUpdateFoundItemRequest {
    active?: boolean;
    description?: string;
    title?: string;
    category?: string;
    location?: string;
}

// ============================================================================
// Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PagedData<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ============================================================================
// Param Types
// ============================================================================

export interface LostFoundPaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
}

export interface LostFoundSearchParams extends LostFoundPaginationParams {
    keyword?: string;
    category?: string;
}

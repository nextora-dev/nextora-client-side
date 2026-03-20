/**
 * @fileoverview Lost & Found Module Redux Slice
 * @description State management for lost items, found items, claims, images, and admin operations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lostFoundServices from './services';
import type {
    LostItemResponse,
    FoundItemResponse,
    LostItemImageResponse,
    ClaimResponse,
    MatchResponse,
    LostFoundStats,
    LostFoundPaginationParams,
    LostFoundSearchParams,
    ReportLostItemRequest,
    UpdateLostItemRequest,
    ReportFoundItemRequest,
    UpdateFoundItemRequest,
    SubmitClaimRequest,
    AdminUpdateLostItemRequest,
    AdminUpdateFoundItemRequest,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

interface LostFoundState {
    // Lost items
    lostItems: LostItemResponse[];
    selectedLostItem: LostItemResponse | null;
    totalLostItems: number;
    totalLostPages: number;

    // Found items
    foundItems: FoundItemResponse[];
    selectedFoundItem: FoundItemResponse | null;
    totalFoundItems: number;
    totalFoundPages: number;

    // Images
    itemImages: LostItemImageResponse[];

    // Matches
    matches: MatchResponse[];

    // Claims
    claims: ClaimResponse[];
    myClaims: ClaimResponse[];
    selectedClaim: ClaimResponse | null;
    totalClaims: number;
    totalMyClaims: number;

    // Categories
    categories: string[];

    // Stats (Admin)
    stats: LostFoundStats | null;

    // Loading states
    isLostLoading: boolean;
    isFoundLoading: boolean;
    isClaimLoading: boolean;
    isImageLoading: boolean;
    isMatchLoading: boolean;
    isStatsLoading: boolean;
    isSubmitting: boolean;
    isDeleting: boolean;

    // Messages
    error: string | null;
    successMessage: string | null;
}

const initialState: LostFoundState = {
    lostItems: [],
    selectedLostItem: null,
    totalLostItems: 0,
    totalLostPages: 0,
    foundItems: [],
    selectedFoundItem: null,
    totalFoundItems: 0,
    totalFoundPages: 0,
    itemImages: [],
    matches: [],
    claims: [],
    myClaims: [],
    selectedClaim: null,
    totalClaims: 0,
    totalMyClaims: 0,
    categories: [],
    stats: null,
    isLostLoading: false,
    isFoundLoading: false,
    isClaimLoading: false,
    isImageLoading: false,
    isMatchLoading: false,
    isStatsLoading: false,
    isSubmitting: false,
    isDeleting: false,
    error: null,
    successMessage: null,
};

// ============================================================================
// Helper
// ============================================================================

function extractError(error: unknown, fallback = 'An error occurred'): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
        const obj = error as Record<string, unknown>;
        if (obj.error && typeof obj.error === 'object') {
            const nested = obj.error as Record<string, unknown>;
            if (typeof nested.message === 'string') return nested.message;
        }
        if (typeof obj.message === 'string') return obj.message;
        const axiosErr = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
        if (axiosErr.response?.data?.error?.message) return axiosErr.response.data.error.message;
        if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    }
    return fallback;
}

// ============================================================================
// Async Thunks — Categories
// ============================================================================

export const fetchCategories = createAsyncThunk(
    'lostFound/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getCategories();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Lost Items
// ============================================================================

export const reportLostItemAsync = createAsyncThunk(
    'lostFound/reportLost',
    async (data: ReportLostItemRequest, { rejectWithValue }) => {
        try {
            return await lostFoundServices.reportLostItem(data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLostItemById = createAsyncThunk(
    'lostFound/fetchLostById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getLostItemById(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const updateLostItemAsync = createAsyncThunk(
    'lostFound/updateLost',
    async ({ id, data }: { id: number; data: UpdateLostItemRequest }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.updateLostItem(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchLostItemsAsync = createAsyncThunk(
    'lostFound/searchLost',
    async (params: LostFoundSearchParams, { rejectWithValue }) => {
        try {
            return await lostFoundServices.searchLostItems(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const deleteLostItemAsync = createAsyncThunk(
    'lostFound/deleteLost',
    async (id: number, { rejectWithValue }) => {
        try {
            await lostFoundServices.deleteLostItem(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const findLostMatchesAsync = createAsyncThunk(
    'lostFound/findLostMatches',
    async (id: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.findLostItemMatches(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Lost Item Images
// ============================================================================

export const uploadLostImagesAsync = createAsyncThunk(
    'lostFound/uploadLostImages',
    async ({ itemId, files }: { itemId: number; files: File[] }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.uploadLostItemImages(itemId, files);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchLostItemImagesAsync = createAsyncThunk(
    'lostFound/fetchLostImages',
    async (itemId: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getLostItemImages(itemId);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const deleteImageAsync = createAsyncThunk(
    'lostFound/deleteImage',
    async (imageId: number, { rejectWithValue }) => {
        try {
            await lostFoundServices.deleteImage(imageId);
            return imageId;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Found Items
// ============================================================================

export const reportFoundItemAsync = createAsyncThunk(
    'lostFound/reportFound',
    async (data: ReportFoundItemRequest, { rejectWithValue }) => {
        try {
            return await lostFoundServices.reportFoundItem(data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchFoundItemById = createAsyncThunk(
    'lostFound/fetchFoundById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getFoundItemById(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const updateFoundItemAsync = createAsyncThunk(
    'lostFound/updateFound',
    async ({ id, data }: { id: number; data: UpdateFoundItemRequest }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.updateFoundItem(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchFoundItemsAsync = createAsyncThunk(
    'lostFound/searchFound',
    async (params: LostFoundSearchParams, { rejectWithValue }) => {
        try {
            return await lostFoundServices.searchFoundItems(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const deleteFoundItemAsync = createAsyncThunk(
    'lostFound/deleteFound',
    async (id: number, { rejectWithValue }) => {
        try {
            await lostFoundServices.deleteFoundItem(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const findFoundMatchesAsync = createAsyncThunk(
    'lostFound/findFoundMatches',
    async (id: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.findFoundItemMatches(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Found Item Images
// ============================================================================

export const uploadFoundImagesAsync = createAsyncThunk(
    'lostFound/uploadFoundImages',
    async ({ itemId, files }: { itemId: number; files: File[] }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.uploadFoundItemImages(itemId, files);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchFoundItemImagesAsync = createAsyncThunk(
    'lostFound/fetchFoundImages',
    async (itemId: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getFoundItemImages(itemId);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Claims
// ============================================================================

export const submitClaimAsync = createAsyncThunk(
    'lostFound/submitClaim',
    async (data: SubmitClaimRequest, { rejectWithValue }) => {
        try {
            return await lostFoundServices.submitClaim(data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchClaimById = createAsyncThunk(
    'lostFound/fetchClaimById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getClaimById(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyClaimsAsync = createAsyncThunk(
    'lostFound/fetchMyClaims',
    async (params: LostFoundPaginationParams = {}, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getMyClaims(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchClaimsByStatusAsync = createAsyncThunk(
    'lostFound/fetchClaimsByStatus',
    async ({ status, ...params }: { status: string } & LostFoundPaginationParams, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getClaimsByStatus(status, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const approveClaimAsync = createAsyncThunk(
    'lostFound/approveClaim',
    async (id: number, { rejectWithValue }) => {
        try {
            return await lostFoundServices.approveClaim(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const rejectClaimAsync = createAsyncThunk(
    'lostFound/rejectClaim',
    async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.rejectClaim(id, reason);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Admin Operations
// ============================================================================

export const fetchAdminStats = createAsyncThunk(
    'lostFound/fetchAdminStats',
    async (_, { rejectWithValue }) => {
        try {
            return await lostFoundServices.getAdminStats();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminUpdateLostAsync = createAsyncThunk(
    'lostFound/adminUpdateLost',
    async ({ id, data }: { id: number; data: AdminUpdateLostItemRequest }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.adminUpdateLostItem(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminDeleteLostAsync = createAsyncThunk(
    'lostFound/adminDeleteLost',
    async (id: number, { rejectWithValue }) => {
        try {
            await lostFoundServices.adminDeleteLostItem(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminUpdateFoundAsync = createAsyncThunk(
    'lostFound/adminUpdateFound',
    async ({ id, data }: { id: number; data: AdminUpdateFoundItemRequest }, { rejectWithValue }) => {
        try {
            return await lostFoundServices.adminUpdateFoundItem(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminDeleteFoundAsync = createAsyncThunk(
    'lostFound/adminDeleteFound',
    async (id: number, { rejectWithValue }) => {
        try {
            await lostFoundServices.adminDeleteFoundItem(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Slice
// ============================================================================

const lostFoundSlice = createSlice({
    name: 'lostFound',
    initialState,
    reducers: {
        clearLostFoundError(state) { state.error = null; },
        clearLostFoundSuccess(state) { state.successMessage = null; },
        clearSelectedLostItem(state) { state.selectedLostItem = null; },
        clearSelectedFoundItem(state) { state.selectedFoundItem = null; },
        clearSelectedClaim(state) { state.selectedClaim = null; },
        clearItemImages(state) { state.itemImages = []; },
        clearMatches(state) { state.matches = []; },
        clearStats(state) { state.stats = null; },
    },
    extraReducers: (builder) => {
        // ── Categories ──
        builder.addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload.data; });

        // ── Report Lost ──
        builder.addCase(reportLostItemAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(reportLostItemAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            state.lostItems.unshift(action.payload.data);
            state.totalLostItems += 1;
            state.successMessage = 'Lost item reported successfully';
        });
        builder.addCase(reportLostItemAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Fetch Lost By ID ──
        builder.addCase(fetchLostItemById.pending, (state) => { state.isLostLoading = true; state.error = null; });
        builder.addCase(fetchLostItemById.fulfilled, (state, action) => {
            state.isLostLoading = false;
            state.selectedLostItem = action.payload.data;
        });
        builder.addCase(fetchLostItemById.rejected, (state, action) => { state.isLostLoading = false; state.error = action.payload as string; });

        // ── Update Lost ──
        builder.addCase(updateLostItemAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(updateLostItemAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.selectedLostItem = updated;
            state.lostItems = state.lostItems.map((i) => (i.id === updated.id ? updated : i));
            state.successMessage = 'Lost item updated successfully';
        });
        builder.addCase(updateLostItemAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Search Lost ──
        builder.addCase(searchLostItemsAsync.pending, (state) => { state.isLostLoading = true; state.error = null; });
        builder.addCase(searchLostItemsAsync.fulfilled, (state, action) => {
            state.isLostLoading = false;
            state.lostItems = action.payload.data.content;
            state.totalLostItems = action.payload.data.totalElements;
            state.totalLostPages = action.payload.data.totalPages;
        });
        builder.addCase(searchLostItemsAsync.rejected, (state, action) => { state.isLostLoading = false; state.error = action.payload as string; });

        // ── Delete Lost ──
        builder.addCase(deleteLostItemAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(deleteLostItemAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.lostItems = state.lostItems.filter((i) => i.id !== action.payload);
            state.totalLostItems = Math.max(0, state.totalLostItems - 1);
            state.successMessage = 'Lost item deleted';
        });
        builder.addCase(deleteLostItemAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Lost Matches ──
        builder.addCase(findLostMatchesAsync.pending, (state) => { state.isMatchLoading = true; });
        builder.addCase(findLostMatchesAsync.fulfilled, (state, action) => {
            state.isMatchLoading = false;
            state.matches = action.payload.data;
        });
        builder.addCase(findLostMatchesAsync.rejected, (state, action) => { state.isMatchLoading = false; state.error = action.payload as string; });

        // ── Upload Lost Images ──
        builder.addCase(uploadLostImagesAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(uploadLostImagesAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.itemImages = [...state.itemImages, ...action.payload.data];
            state.successMessage = 'Images uploaded successfully';
        });
        builder.addCase(uploadLostImagesAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Fetch Lost Images ──
        builder.addCase(fetchLostItemImagesAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(fetchLostItemImagesAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.itemImages = action.payload.data;
        });
        builder.addCase(fetchLostItemImagesAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Delete Image ──
        builder.addCase(deleteImageAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(deleteImageAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.itemImages = state.itemImages.filter((img) => img.id !== action.payload);
            state.successMessage = 'Image deleted';
        });
        builder.addCase(deleteImageAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Report Found ──
        builder.addCase(reportFoundItemAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(reportFoundItemAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            state.foundItems.unshift(action.payload.data);
            state.totalFoundItems += 1;
            state.successMessage = 'Found item reported successfully';
        });
        builder.addCase(reportFoundItemAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Fetch Found By ID ──
        builder.addCase(fetchFoundItemById.pending, (state) => { state.isFoundLoading = true; state.error = null; });
        builder.addCase(fetchFoundItemById.fulfilled, (state, action) => {
            state.isFoundLoading = false;
            state.selectedFoundItem = action.payload.data;
        });
        builder.addCase(fetchFoundItemById.rejected, (state, action) => { state.isFoundLoading = false; state.error = action.payload as string; });

        // ── Update Found ──
        builder.addCase(updateFoundItemAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(updateFoundItemAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.selectedFoundItem = updated;
            state.foundItems = state.foundItems.map((i) => (i.id === updated.id ? updated : i));
            state.successMessage = 'Found item updated successfully';
        });
        builder.addCase(updateFoundItemAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Search Found ──
        builder.addCase(searchFoundItemsAsync.pending, (state) => { state.isFoundLoading = true; state.error = null; });
        builder.addCase(searchFoundItemsAsync.fulfilled, (state, action) => {
            state.isFoundLoading = false;
            state.foundItems = action.payload.data.content;
            state.totalFoundItems = action.payload.data.totalElements;
            state.totalFoundPages = action.payload.data.totalPages;
        });
        builder.addCase(searchFoundItemsAsync.rejected, (state, action) => { state.isFoundLoading = false; state.error = action.payload as string; });

        // ── Delete Found ──
        builder.addCase(deleteFoundItemAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(deleteFoundItemAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.foundItems = state.foundItems.filter((i) => i.id !== action.payload);
            state.totalFoundItems = Math.max(0, state.totalFoundItems - 1);
            state.successMessage = 'Found item deleted';
        });
        builder.addCase(deleteFoundItemAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Found Matches ──
        builder.addCase(findFoundMatchesAsync.pending, (state) => { state.isMatchLoading = true; });
        builder.addCase(findFoundMatchesAsync.fulfilled, (state, action) => {
            state.isMatchLoading = false;
            state.matches = action.payload.data;
        });
        builder.addCase(findFoundMatchesAsync.rejected, (state, action) => { state.isMatchLoading = false; state.error = action.payload as string; });

        // ── Upload Found Images ──
        builder.addCase(uploadFoundImagesAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(uploadFoundImagesAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.itemImages = [...state.itemImages, ...action.payload.data];
            state.successMessage = 'Images uploaded successfully';
        });
        builder.addCase(uploadFoundImagesAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Fetch Found Images ──
        builder.addCase(fetchFoundItemImagesAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(fetchFoundItemImagesAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.itemImages = action.payload.data;
        });
        builder.addCase(fetchFoundItemImagesAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Submit Claim ──
        builder.addCase(submitClaimAsync.pending, (state) => { state.isSubmitting = true; state.error = null; });
        builder.addCase(submitClaimAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            state.myClaims.unshift(action.payload.data);
            state.totalMyClaims += 1;
            state.successMessage = 'Claim submitted successfully';
        });
        builder.addCase(submitClaimAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Fetch Claim By ID ──
        builder.addCase(fetchClaimById.pending, (state) => { state.isClaimLoading = true; });
        builder.addCase(fetchClaimById.fulfilled, (state, action) => {
            state.isClaimLoading = false;
            state.selectedClaim = action.payload.data;
        });
        builder.addCase(fetchClaimById.rejected, (state, action) => { state.isClaimLoading = false; state.error = action.payload as string; });

        // ── Fetch My Claims ──
        builder.addCase(fetchMyClaimsAsync.pending, (state) => { state.isClaimLoading = true; state.error = null; });
        builder.addCase(fetchMyClaimsAsync.fulfilled, (state, action) => {
            state.isClaimLoading = false;
            state.myClaims = action.payload.data.content;
            state.totalMyClaims = action.payload.data.totalElements;
        });
        builder.addCase(fetchMyClaimsAsync.rejected, (state, action) => { state.isClaimLoading = false; state.error = action.payload as string; });

        // ── Fetch Claims By Status ──
        builder.addCase(fetchClaimsByStatusAsync.pending, (state) => { state.isClaimLoading = true; state.error = null; });
        builder.addCase(fetchClaimsByStatusAsync.fulfilled, (state, action) => {
            state.isClaimLoading = false;
            state.claims = action.payload.data.content;
            state.totalClaims = action.payload.data.totalElements;
        });
        builder.addCase(fetchClaimsByStatusAsync.rejected, (state, action) => { state.isClaimLoading = false; state.error = action.payload as string; });

        // ── Approve Claim ──
        builder.addCase(approveClaimAsync.pending, (state) => { state.isSubmitting = true; });
        builder.addCase(approveClaimAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.claims = state.claims.map((c) => (c.id === updated.id ? updated : c));
            state.selectedClaim = updated;
            state.successMessage = 'Claim approved';
        });
        builder.addCase(approveClaimAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Reject Claim ──
        builder.addCase(rejectClaimAsync.pending, (state) => { state.isSubmitting = true; });
        builder.addCase(rejectClaimAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.claims = state.claims.map((c) => (c.id === updated.id ? updated : c));
            state.selectedClaim = updated;
            state.successMessage = 'Claim rejected';
        });
        builder.addCase(rejectClaimAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Admin Stats ──
        builder.addCase(fetchAdminStats.pending, (state) => { state.isStatsLoading = true; });
        builder.addCase(fetchAdminStats.fulfilled, (state, action) => {
            state.isStatsLoading = false;
            state.stats = action.payload.data;
        });
        builder.addCase(fetchAdminStats.rejected, (state, action) => { state.isStatsLoading = false; state.error = action.payload as string; });

        // ── Admin Update Lost ──
        builder.addCase(adminUpdateLostAsync.pending, (state) => { state.isSubmitting = true; });
        builder.addCase(adminUpdateLostAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.lostItems = state.lostItems.map((i) => (i.id === updated.id ? updated : i));
            state.successMessage = 'Lost item updated by admin';
        });
        builder.addCase(adminUpdateLostAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Admin Delete Lost ──
        builder.addCase(adminDeleteLostAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(adminDeleteLostAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.lostItems = state.lostItems.filter((i) => i.id !== action.payload);
            state.totalLostItems = Math.max(0, state.totalLostItems - 1);
            state.successMessage = 'Lost item deleted by admin';
        });
        builder.addCase(adminDeleteLostAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Admin Update Found ──
        builder.addCase(adminUpdateFoundAsync.pending, (state) => { state.isSubmitting = true; });
        builder.addCase(adminUpdateFoundAsync.fulfilled, (state, action) => {
            state.isSubmitting = false;
            const updated = action.payload.data;
            state.foundItems = state.foundItems.map((i) => (i.id === updated.id ? updated : i));
            state.successMessage = 'Found item updated by admin';
        });
        builder.addCase(adminUpdateFoundAsync.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });

        // ── Admin Delete Found ──
        builder.addCase(adminDeleteFoundAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(adminDeleteFoundAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.foundItems = state.foundItems.filter((i) => i.id !== action.payload);
            state.totalFoundItems = Math.max(0, state.totalFoundItems - 1);
            state.successMessage = 'Found item deleted by admin';
        });
        builder.addCase(adminDeleteFoundAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });
    },
});

// ============================================================================
// Actions & Selectors
// ============================================================================

export const {
    clearLostFoundError,
    clearLostFoundSuccess,
    clearSelectedLostItem,
    clearSelectedFoundItem,
    clearSelectedClaim,
    clearItemImages,
    clearMatches,
    clearStats,
} = lostFoundSlice.actions;

// Selectors
export const selectLostItems = (state: { lostFound: LostFoundState }) => state.lostFound.lostItems;
export const selectSelectedLostItem = (state: { lostFound: LostFoundState }) => state.lostFound.selectedLostItem;
export const selectTotalLostItems = (state: { lostFound: LostFoundState }) => state.lostFound.totalLostItems;
export const selectFoundItems = (state: { lostFound: LostFoundState }) => state.lostFound.foundItems;
export const selectSelectedFoundItem = (state: { lostFound: LostFoundState }) => state.lostFound.selectedFoundItem;
export const selectTotalFoundItems = (state: { lostFound: LostFoundState }) => state.lostFound.totalFoundItems;
export const selectItemImages = (state: { lostFound: LostFoundState }) => state.lostFound.itemImages;
export const selectMatches = (state: { lostFound: LostFoundState }) => state.lostFound.matches;
export const selectClaims = (state: { lostFound: LostFoundState }) => state.lostFound.claims;
export const selectMyClaims = (state: { lostFound: LostFoundState }) => state.lostFound.myClaims;
export const selectSelectedClaim = (state: { lostFound: LostFoundState }) => state.lostFound.selectedClaim;
export const selectTotalClaims = (state: { lostFound: LostFoundState }) => state.lostFound.totalClaims;
export const selectTotalMyClaims = (state: { lostFound: LostFoundState }) => state.lostFound.totalMyClaims;
export const selectCategories = (state: { lostFound: LostFoundState }) => state.lostFound.categories;
export const selectLostFoundStats = (state: { lostFound: LostFoundState }) => state.lostFound.stats;
export const selectIsLostLoading = (state: { lostFound: LostFoundState }) => state.lostFound.isLostLoading;
export const selectIsFoundLoading = (state: { lostFound: LostFoundState }) => state.lostFound.isFoundLoading;
export const selectIsClaimLoading = (state: { lostFound: LostFoundState }) => state.lostFound.isClaimLoading;
export const selectIsImageLoading = (state: { lostFound: LostFoundState }) => state.lostFound.isImageLoading;
export const selectIsMatchLoading = (state: { lostFound: LostFoundState }) => state.lostFound.isMatchLoading;
export const selectIsStatsLoading = (state: { lostFound: LostFoundState }) => state.lostFound.isStatsLoading;
export const selectIsSubmitting = (state: { lostFound: LostFoundState }) => state.lostFound.isSubmitting;
export const selectIsDeleting = (state: { lostFound: LostFoundState }) => state.lostFound.isDeleting;
export const selectLostFoundError = (state: { lostFound: LostFoundState }) => state.lostFound.error;
export const selectLostFoundSuccess = (state: { lostFound: LostFoundState }) => state.lostFound.successMessage;

export default lostFoundSlice.reducer;

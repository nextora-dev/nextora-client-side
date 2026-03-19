/**
 * @fileoverview Boarding House Module Redux Slice
 * @description State management for Boarding House listings, images, and admin operations
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as boardingHouseServices from './services';
import {
    BoardingHouseResponse,
    BoardingHouseImageResponse,
    BoardingHouseStats,
    BoardingHousePaginationParams,
    BoardingHouseSearchParams,
    BoardingHouseFilterParams,
    CreateBoardingHouseRequest,
    UpdateBoardingHouseRequest,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

interface BoardingHouseState {
    // Listings
    listings: BoardingHouseResponse[];
    selectedListing: BoardingHouseResponse | null;
    totalListings: number;
    totalPages: number;

    // My Listings (creator)
    myListings: BoardingHouseResponse[];
    totalMyListings: number;

    // Images
    listingImages: BoardingHouseImageResponse[];

    // Statistics (Admin)
    platformStats: BoardingHouseStats | null;

    // Loading states
    isListingLoading: boolean;
    isMyListingsLoading: boolean;
    isImageLoading: boolean;
    isStatsLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Messages
    error: string | null;
    successMessage: string | null;
}

const initialState: BoardingHouseState = {
    listings: [],
    selectedListing: null,
    totalListings: 0,
    totalPages: 0,
    myListings: [],
    totalMyListings: 0,
    listingImages: [],
    platformStats: null,
    isListingLoading: false,
    isMyListingsLoading: false,
    isImageLoading: false,
    isStatsLoading: false,
    isCreating: false,
    isUpdating: false,
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
// Async Thunks — Browse & Search
// ============================================================================

export const fetchListings = createAsyncThunk(
    'boardingHouse/fetchListings',
    async (params: BoardingHousePaginationParams = {}, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.getListings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchListingById = createAsyncThunk(
    'boardingHouse/fetchListingById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.getListingById(id);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const searchListingsAsync = createAsyncThunk(
    'boardingHouse/searchListings',
    async (params: BoardingHouseSearchParams, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.searchListings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const filterListingsAsync = createAsyncThunk(
    'boardingHouse/filterListings',
    async (params: BoardingHouseFilterParams, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.filterListings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const filterByCityAsync = createAsyncThunk(
    'boardingHouse/filterByCity',
    async ({ city, ...params }: { city: string } & BoardingHousePaginationParams, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.filterByCity(city, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const filterByDistrictAsync = createAsyncThunk(
    'boardingHouse/filterByDistrict',
    async ({ district, ...params }: { district: string } & BoardingHousePaginationParams, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.filterByDistrict(district, params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchListingImages = createAsyncThunk(
    'boardingHouse/fetchImages',
    async (houseId: number, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.getImages(houseId);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — CRUD
// ============================================================================

export const createListingAsync = createAsyncThunk(
    'boardingHouse/create',
    async (data: CreateBoardingHouseRequest, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.createListing(data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const updateListingAsync = createAsyncThunk(
    'boardingHouse/update',
    async ({ id, data }: { id: number; data: UpdateBoardingHouseRequest }, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.updateListing(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const deleteListingAsync = createAsyncThunk(
    'boardingHouse/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await boardingHouseServices.deleteListing(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchMyListings = createAsyncThunk(
    'boardingHouse/fetchMyListings',
    async (params: BoardingHousePaginationParams = {}, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.getMyListings(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchAllListingsAdmin = createAsyncThunk(
    'boardingHouse/fetchAllAdmin',
    async (params: BoardingHousePaginationParams = {}, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.getAllListingsAdmin(params);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Image Management
// ============================================================================

export const uploadImagesAsync = createAsyncThunk(
    'boardingHouse/uploadImages',
    async ({ houseId, files }: { houseId: number; files: File[] }, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.uploadImages(houseId, files);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const setPrimaryImageAsync = createAsyncThunk(
    'boardingHouse/setPrimaryImage',
    async ({ houseId, imageId }: { houseId: number; imageId: number }, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.setPrimaryImage(houseId, imageId);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const deleteImageAsync = createAsyncThunk(
    'boardingHouse/deleteImage',
    async ({ houseId, imageId }: { houseId: number; imageId: number }, { rejectWithValue }) => {
        try {
            await boardingHouseServices.deleteImage(houseId, imageId);
            return { houseId, imageId };
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Async Thunks — Admin Operations
// ============================================================================

export const adminUpdateListingAsync = createAsyncThunk(
    'boardingHouse/adminUpdate',
    async ({ id, data }: { id: number; data: UpdateBoardingHouseRequest }, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.adminUpdateListing(id, data);
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const adminDeleteListingAsync = createAsyncThunk(
    'boardingHouse/adminDelete',
    async (id: number, { rejectWithValue }) => {
        try {
            await boardingHouseServices.adminDeleteListing(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const permanentDeleteListingAsync = createAsyncThunk(
    'boardingHouse/permanentDelete',
    async (id: number, { rejectWithValue }) => {
        try {
            await boardingHouseServices.permanentDeleteListing(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

export const fetchPlatformStats = createAsyncThunk(
    'boardingHouse/fetchPlatformStats',
    async (_, { rejectWithValue }) => {
        try {
            return await boardingHouseServices.getPlatformStats();
        } catch (err) {
            return rejectWithValue(extractError(err));
        }
    },
);

// ============================================================================
// Slice
// ============================================================================

const boardingHouseSlice = createSlice({
    name: 'boardingHouse',
    initialState,
    reducers: {
        clearBoardingHouseError(state) {
            state.error = null;
        },
        clearBoardingHouseSuccessMessage(state) {
            state.successMessage = null;
        },
        clearSelectedListing(state) {
            state.selectedListing = null;
        },
        clearMyListings(state) {
            state.myListings = [];
            state.totalMyListings = 0;
        },
        clearListingImages(state) {
            state.listingImages = [];
        },
        clearPlatformStats(state) {
            state.platformStats = null;
        },
    },
    extraReducers: (builder) => {
        // ── Fetch Listings ──
        builder.addCase(fetchListings.pending, (state) => { state.isListingLoading = true; state.error = null; });
        builder.addCase(fetchListings.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.listings = action.payload.data.content;
            state.totalListings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchListings.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Fetch Listing By ID ──
        builder.addCase(fetchListingById.pending, (state) => { state.isListingLoading = true; state.error = null; });
        builder.addCase(fetchListingById.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.selectedListing = action.payload.data;
        });
        builder.addCase(fetchListingById.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Search Listings ──
        builder.addCase(searchListingsAsync.pending, (state) => { state.isListingLoading = true; state.error = null; });
        builder.addCase(searchListingsAsync.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.listings = action.payload.data.content;
            state.totalListings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(searchListingsAsync.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Filter Listings ──
        builder.addCase(filterListingsAsync.pending, (state) => { state.isListingLoading = true; state.error = null; });
        builder.addCase(filterListingsAsync.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.listings = action.payload.data.content;
            state.totalListings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(filterListingsAsync.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Filter by City ──
        builder.addCase(filterByCityAsync.pending, (state) => { state.isListingLoading = true; });
        builder.addCase(filterByCityAsync.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.listings = action.payload.data.content;
            state.totalListings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(filterByCityAsync.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Filter by District ──
        builder.addCase(filterByDistrictAsync.pending, (state) => { state.isListingLoading = true; });
        builder.addCase(filterByDistrictAsync.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.listings = action.payload.data.content;
            state.totalListings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(filterByDistrictAsync.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Fetch Listing Images ──
        builder.addCase(fetchListingImages.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(fetchListingImages.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.listingImages = action.payload.data;
        });
        builder.addCase(fetchListingImages.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Create Listing ──
        builder.addCase(createListingAsync.pending, (state) => { state.isCreating = true; state.error = null; });
        builder.addCase(createListingAsync.fulfilled, (state, action) => {
            state.isCreating = false;
            state.myListings.unshift(action.payload.data);
            state.totalMyListings += 1;
            state.successMessage = 'Boarding house listing created successfully';
        });
        builder.addCase(createListingAsync.rejected, (state, action) => { state.isCreating = false; state.error = action.payload as string; });

        // ── Update Listing ──
        builder.addCase(updateListingAsync.pending, (state) => { state.isUpdating = true; state.error = null; });
        builder.addCase(updateListingAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            const updated = action.payload.data;
            state.selectedListing = updated;
            state.listings = state.listings.map((l) => (l.id === updated.id ? updated : l));
            state.myListings = state.myListings.map((l) => (l.id === updated.id ? updated : l));
            state.successMessage = 'Listing updated successfully';
        });
        builder.addCase(updateListingAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Delete Listing ──
        builder.addCase(deleteListingAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(deleteListingAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.listings = state.listings.filter((l) => l.id !== action.payload);
            state.myListings = state.myListings.filter((l) => l.id !== action.payload);
            state.totalListings = Math.max(0, state.totalListings - 1);
            state.totalMyListings = Math.max(0, state.totalMyListings - 1);
            state.successMessage = 'Listing deleted successfully';
        });
        builder.addCase(deleteListingAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Fetch My Listings ──
        builder.addCase(fetchMyListings.pending, (state) => { state.isMyListingsLoading = true; state.error = null; });
        builder.addCase(fetchMyListings.fulfilled, (state, action) => {
            state.isMyListingsLoading = false;
            state.myListings = action.payload.data.content;
            state.totalMyListings = action.payload.data.totalElements;
        });
        builder.addCase(fetchMyListings.rejected, (state, action) => { state.isMyListingsLoading = false; state.error = action.payload as string; });

        // ── Fetch All Admin ──
        builder.addCase(fetchAllListingsAdmin.pending, (state) => { state.isListingLoading = true; state.error = null; });
        builder.addCase(fetchAllListingsAdmin.fulfilled, (state, action) => {
            state.isListingLoading = false;
            state.listings = action.payload.data.content;
            state.totalListings = action.payload.data.totalElements;
            state.totalPages = action.payload.data.totalPages;
        });
        builder.addCase(fetchAllListingsAdmin.rejected, (state, action) => { state.isListingLoading = false; state.error = action.payload as string; });

        // ── Upload Images ──
        builder.addCase(uploadImagesAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(uploadImagesAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.listingImages = [...state.listingImages, ...action.payload.data];
            state.successMessage = 'Images uploaded successfully';
        });
        builder.addCase(uploadImagesAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Set Primary Image ──
        builder.addCase(setPrimaryImageAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(setPrimaryImageAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            const primaryId = action.payload.data.id;
            state.listingImages = state.listingImages.map((img) => ({
                ...img,
                isPrimary: img.id === primaryId,
            }));
            state.successMessage = 'Primary image updated';
        });
        builder.addCase(setPrimaryImageAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Delete Image ──
        builder.addCase(deleteImageAsync.pending, (state) => { state.isImageLoading = true; });
        builder.addCase(deleteImageAsync.fulfilled, (state, action) => {
            state.isImageLoading = false;
            state.listingImages = state.listingImages.filter((img) => img.id !== action.payload.imageId);
            state.successMessage = 'Image deleted';
        });
        builder.addCase(deleteImageAsync.rejected, (state, action) => { state.isImageLoading = false; state.error = action.payload as string; });

        // ── Admin Update ──
        builder.addCase(adminUpdateListingAsync.pending, (state) => { state.isUpdating = true; });
        builder.addCase(adminUpdateListingAsync.fulfilled, (state, action) => {
            state.isUpdating = false;
            const updated = action.payload.data;
            state.listings = state.listings.map((l) => (l.id === updated.id ? updated : l));
            state.selectedListing = updated;
            state.successMessage = 'Listing updated by admin';
        });
        builder.addCase(adminUpdateListingAsync.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; });

        // ── Admin Delete ──
        builder.addCase(adminDeleteListingAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(adminDeleteListingAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.listings = state.listings.filter((l) => l.id !== action.payload);
            state.totalListings = Math.max(0, state.totalListings - 1);
            state.successMessage = 'Listing deleted by admin';
        });
        builder.addCase(adminDeleteListingAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Permanent Delete ──
        builder.addCase(permanentDeleteListingAsync.pending, (state) => { state.isDeleting = true; });
        builder.addCase(permanentDeleteListingAsync.fulfilled, (state, action) => {
            state.isDeleting = false;
            state.listings = state.listings.filter((l) => l.id !== action.payload);
            state.totalListings = Math.max(0, state.totalListings - 1);
            state.successMessage = 'Listing permanently deleted';
        });
        builder.addCase(permanentDeleteListingAsync.rejected, (state, action) => { state.isDeleting = false; state.error = action.payload as string; });

        // ── Platform Stats ──
        builder.addCase(fetchPlatformStats.pending, (state) => { state.isStatsLoading = true; });
        builder.addCase(fetchPlatformStats.fulfilled, (state, action) => {
            state.isStatsLoading = false;
            state.platformStats = action.payload.data;
        });
        builder.addCase(fetchPlatformStats.rejected, (state, action) => { state.isStatsLoading = false; state.error = action.payload as string; });
    },
});

// ============================================================================
// Actions & Selectors
// ============================================================================

export const {
    clearBoardingHouseError,
    clearBoardingHouseSuccessMessage,
    clearSelectedListing,
    clearMyListings,
    clearListingImages,
    clearPlatformStats,
} = boardingHouseSlice.actions;

// Selectors
export const selectListings = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.listings;
export const selectSelectedListing = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.selectedListing;
export const selectTotalListings = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.totalListings;
export const selectTotalPages = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.totalPages;
export const selectMyListings = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.myListings;
export const selectTotalMyListings = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.totalMyListings;
export const selectListingImages = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.listingImages;
export const selectBoardingHouseStats = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.platformStats;
export const selectBoardingHouseIsLoading = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isListingLoading;
export const selectMyListingsIsLoading = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isMyListingsLoading;
export const selectImageIsLoading = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isImageLoading;
export const selectStatsIsLoading = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isStatsLoading;
export const selectBoardingHouseIsCreating = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isCreating;
export const selectBoardingHouseIsUpdating = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isUpdating;
export const selectBoardingHouseIsDeleting = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.isDeleting;
export const selectBoardingHouseError = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.error;
export const selectBoardingHouseSuccessMessage = (state: { boardingHouse: BoardingHouseState }) => state.boardingHouse.successMessage;

export default boardingHouseSlice.reducer;

/**
 * Store Index
 * @description Central export for Redux store and related utilities
 * @module store
 */

// Redux imports
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import userReducer from '@/features/users/userSlice';
import adminReducer from '@/features/admin/adminSlice';
import superAdminReducer from '@/features/super-admin/superAdminSlice';
import adminUserManagementReducer from '@/features/super-admin/adminUserManagementSlice';
import kuppiReducer from '@/features/kuppi/kuppiSlice';
import intranetReducer from '@/features/intranet/intranetSlice';
import clubReducer from '@/features/club/clubSlice';
import electionReducer from '@/features/election/electionSlice';
import eventReducer from '@/features/event/eventSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
// Use custom storage that handles SSR (no more "failed to create sync storage" warning)
import storage from '@/lib/storage';

// ============================================================================
// Root Reducer
// ============================================================================

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    admin: adminReducer,
    superAdmin: superAdminReducer,
    adminUserManagement: adminUserManagementReducer,
    kuppi: kuppiReducer,
    intranet: intranetReducer,
    club: clubReducer,
    election: electionReducer,
    event: eventReducer,
});

// ============================================================================
// Persist Configuration
// ============================================================================

const persistConfig = {
    key: 'nextora-root',
    storage,
    whitelist: ['auth', 'user'], // Slices to persist (admin and superAdmin are not persisted - fetched fresh)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ============================================================================
// Store Configuration
// ============================================================================

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// ============================================================================
// Type Exports
// ============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================================================
// Hook Exports
// ============================================================================

export { useAppDispatch, useAppSelector } from './hooks';


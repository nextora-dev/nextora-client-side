/**
 * Store Index
 * @description Central export for Redux store and related utilities
 * @module store
 */

// Legacy Zustand store (for backward compatibility)
export { useAuthStore } from './auth.store';

// Redux imports
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import userReducer from '@/features/users/userSlice';
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
import storage from 'redux-persist/lib/storage'; // localStorage

// ============================================================================
// Root Reducer
// ============================================================================

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
});

// ============================================================================
// Persist Configuration
// ============================================================================

const persistConfig = {
    key: 'nextora-root',
    storage,
    whitelist: ['auth', 'user'], // Slices to persist
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


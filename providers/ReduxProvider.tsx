/**
 * Redux Provider
 * @description Provider component for Redux store with persistence
 * @module providers/ReduxProvider
 */

'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { initializeFromTokenAsync } from '@/features/auth/authSlice';

interface ReduxProviderProps {
    children: ReactNode;
}

/**
 * Loading component shown while persisted state is being rehydrated
 */
function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
        }}>
            <div style={{
                width: 40,
                height: 40,
                border: '3px solid #e0e0e0',
                borderTop: '3px solid #6B9FFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }} />
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

/**
 * Auth Initializer - Initializes auth state from stored token after hydration
 */
function AuthInitializer({ children }: { children: ReactNode }) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // Initialize auth from stored token
            store.dispatch(initializeFromTokenAsync());
        }
    }, []);

    return <>{children}</>;
}

/**
 * Redux Provider with persistence
 * Wraps the application with Redux store and handles state persistence
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingFallback />} persistor={persistor}>
                <AuthInitializer>
                    {children}
                </AuthInitializer>
            </PersistGate>
        </Provider>
    );
}

export default ReduxProvider;


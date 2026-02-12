/**
 * Custom Storage for Redux Persist
 * @description Handles SSR by providing a noop storage on server and localStorage on client
 * This prevents the "redux-persist failed to create sync storage" warning
 */

import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

/**
 * Creates a noop storage for SSR
 * All operations return resolved promises with no-op behavior
 */
const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: string) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

/**
 * Storage instance that works on both server and client
 * - Server: Uses noop storage (no localStorage available)
 * - Client: Uses localStorage via createWebStorage
 */
const storage = typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

export default storage;


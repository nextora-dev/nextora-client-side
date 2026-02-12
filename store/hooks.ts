/**
 * Redux Hooks
 * @description Typed hooks for Redux store access
 * @module store/hooks
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed useDispatch hook
 * Use this instead of plain `useDispatch` for type safety
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 * Use this instead of plain `useSelector` for type safety
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


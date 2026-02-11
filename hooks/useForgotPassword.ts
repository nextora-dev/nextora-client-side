/**
 * @fileoverview Forgot Password Flow Hook
 * @description Custom hook for managing the complete password recovery flow state
 * @module hooks/useForgotPassword
 */
'use client';

import { useState, useCallback } from 'react';
import {
    forgotPassword,
    resetPassword,
    validateResetToken,
} from '@/features/auth/services';

// ============================================================================
// Types
// ============================================================================

/** Password reset flow steps */
type ForgotPasswordStep = 'email' | 'verify' | 'reset' | 'success';

/** Hook state interface */
interface ForgotPasswordState {
    email: string;
    resetToken: string;
    step: ForgotPasswordStep;
    isLoading: boolean;
    error: string | null;
}

/** Hook return interface */
interface UseForgotPasswordReturn {
    state: ForgotPasswordState;
    sendResetEmail: (email: string) => Promise<boolean>;
    submitNewPassword: (password: string, confirmPassword: string) => Promise<boolean>;
    validateToken: (token: string) => Promise<boolean>;
    setEmail: (email: string) => void;
    setStep: (step: ForgotPasswordStep) => void;
    clearError: () => void;
    reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_KEYS = {
    RESET_EMAIL: 'resetEmail',
    RESET_TOKEN: 'resetToken',
} as const;

const INITIAL_STATE: ForgotPasswordState = {
    email: '',
    resetToken: '',
    step: 'email',
    isLoading: false,
    error: null,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useForgotPassword(): UseForgotPasswordReturn {
    const [state, setState] = useState<ForgotPasswordState>(INITIAL_STATE);

    // Helper functions
    const setLoading = (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }));
    const setError = (error: string | null) => setState(prev => ({ ...prev, error }));

    /** Initiates password reset by sending OTP to email */
    const sendResetEmail = useCallback(async (email: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await forgotPassword({ email });
        } catch {
            // Security: Still proceed to prevent account enumeration
        }

        setState(prev => ({ ...prev, email, step: 'verify', isLoading: false }));
        sessionStorage.setItem(SESSION_KEYS.RESET_EMAIL, email);
        return true;
    }, []);

    /** Submits new password */
    const submitNewPassword = useCallback(async (password: string, confirmPassword: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await resetPassword({ token: state.resetToken, password, confirmPassword });

            if (response.success) {
                setState(prev => ({ ...prev, step: 'success', isLoading: false }));
                sessionStorage.removeItem(SESSION_KEYS.RESET_EMAIL);
                sessionStorage.removeItem(SESSION_KEYS.RESET_TOKEN);
                return true;
            }

            setError(response.message || 'Failed to reset password');
            setLoading(false);
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
            setLoading(false);
            return false;
        }
    }, [state.resetToken]);

    /** Validates a reset token (for link-based reset) */
    const validateToken = useCallback(async (token: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await validateResetToken(token);

            if (response.valid) {
                setState(prev => ({ ...prev, resetToken: token, step: 'reset', isLoading: false }));
                return true;
            }

            setError(response.message || 'Invalid or expired token');
            setLoading(false);
            return false;
        } catch {
            setError('Failed to validate token');
            setLoading(false);
            return false;
        }
    }, []);

    const setEmail = useCallback((email: string) => setState(prev => ({ ...prev, email })), []);
    const setStep = useCallback((step: ForgotPasswordStep) => setState(prev => ({ ...prev, step })), []);
    const clearError = useCallback(() => setError(null), []);

    /** Resets the entire flow state */
    const reset = useCallback(() => {
        setState(INITIAL_STATE);
        sessionStorage.removeItem(SESSION_KEYS.RESET_EMAIL);
        sessionStorage.removeItem(SESSION_KEYS.RESET_TOKEN);
    }, []);

    return {
        state,
        sendResetEmail,
        submitNewPassword,
        validateToken,
        setEmail,
        setStep,
        clearError,
        reset,
    };
}


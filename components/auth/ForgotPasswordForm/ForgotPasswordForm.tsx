// ForgotPasswordForm - Reusable forgot password form component
'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { validators } from '@/lib/validators/auth.validator';
import { Button } from '@/components/common';

export interface ForgotPasswordFormProps {
    description?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    submitButtonText?: string;
    loadingText?: string;
    submitButtonGradient?: string;
    submitButtonHoverGradient?: string;
    onSubmit: (email: string) => Promise<void>;
    isLoading?: boolean;
}

export function ForgotPasswordForm({
    description = "Enter the email address associated with your account and we'll send you a link to reset your password.",
    emailLabel = 'Email Address *',
    emailPlaceholder = 'your.email@example.com',
    submitButtonText = 'Send Reset Link',
    loadingText = 'Sending...',
    submitButtonGradient = 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
    submitButtonHoverGradient = 'linear-gradient(90deg, #1D4ED8 0%, #6D28D9 100%)',
    onSubmit,
    isLoading = false,
}: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validators.email(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isSubmitting = loading || isLoading;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {description && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    {description}
                </Typography>
            )}

            <TextField
                label={emailLabel}
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                }}
                error={!!error}
                helperText={error}
                fullWidth
                placeholder={emailPlaceholder}
                autoFocus
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon color="action" />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting || !email}
                sx={{
                    py: 1.5,
                    background: submitButtonGradient,
                    '&:hover': {
                        background: submitButtonHoverGradient,
                    },
                }}
            >
                {isSubmitting ? (
                    <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        {loadingText}
                    </>
                ) : (
                    submitButtonText
                )}
            </Button>
        </Box>
    );
}



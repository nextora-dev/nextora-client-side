// ResetPasswordForm - Form for entering new password
'use client';

import { useState } from 'react';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';
import { validators } from '@/lib/validators/auth.validator';
import { Button, PasswordField } from '@/components/common';

export interface ResetPasswordFormProps {
    submitButtonText?: string;
    submitButtonGradient?: string;
    submitButtonHoverGradient?: string;
    onSubmit: (password: string) => Promise<void>;
    isLoading?: boolean;
}

// Password strength checker
const checkPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: '#f44336' };
    if (score <= 3) return { score: 50, label: 'Fair', color: '#ff9800' };
    if (score <= 4) return { score: 75, label: 'Good', color: '#2196f3' };
    return { score: 100, label: 'Strong', color: '#4caf50' };
};

export function ResetPasswordForm({
    submitButtonText = 'Reset Password',
    submitButtonGradient = 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
    submitButtonHoverGradient = 'linear-gradient(90deg, #1D4ED8 0%, #6D28D9 100%)',
    onSubmit,
    isLoading = false,
}: ResetPasswordFormProps) {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const passwordStrength = checkPasswordStrength(formData.password);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const passwordError = validators.password(formData.password);
        if (passwordError) newErrors.password = passwordError;

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Additional strength requirement
        if (passwordStrength.score < 50) {
            newErrors.password = 'Password is too weak. Please use a stronger password.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit(formData.password);
        } catch (err) {
            setErrors({ submit: err instanceof Error ? err.message : 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const isSubmitting = loading || isLoading;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
                {/* New Password */}
                <Box>
                    <PasswordField
                        label="New Password *"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        error={!!errors.password}
                        helperText={errors.password}
                        fullWidth
                        placeholder="Enter new password"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Password strength
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: passwordStrength.color, fontWeight: 600 }}
                                >
                                    {passwordStrength.label}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={passwordStrength.score}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: passwordStrength.color,
                                        borderRadius: 3,
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Confirm Password */}
                <PasswordField
                    label="Confirm Password *"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    fullWidth
                    placeholder="Confirm new password"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                {/* Password Requirements */}
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Password Requirements:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2, mt: 1 }}>
                        <Typography component="li" variant="caption" color="text.secondary">
                            At least 8 characters long
                        </Typography>
                        <Typography component="li" variant="caption" color="text.secondary">
                            Contains uppercase and lowercase letters
                        </Typography>
                        <Typography component="li" variant="caption" color="text.secondary">
                            Contains at least one number
                        </Typography>
                        <Typography component="li" variant="caption" color="text.secondary">
                            Contains at least one special character
                        </Typography>
                    </Box>
                </Box>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting || !formData.password || !formData.confirmPassword}
                    sx={{
                        py: 1.5,
                        background: submitButtonGradient,
                        '&:hover': {
                            background: submitButtonHoverGradient,
                        },
                    }}
                >
                    {submitButtonText}
                </Button>
            </Stack>
        </Box>
    );
}


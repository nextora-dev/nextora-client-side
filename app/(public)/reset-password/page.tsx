'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Box,
    Typography,
    CircularProgress,
    Container,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import BlockIcon from '@mui/icons-material/Block';
import { Button, PasswordField, useToast } from '@/components/common';
import { resetPassword } from '@/features/auth/services';
import { validators } from '@/lib/validators/auth.validator';

// ============================================================================
// Password Strength Helper
// ============================================================================

function usePasswordStrength(password: string): { score: number; label: string; color: string } {
    const theme = useTheme();
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: theme.palette.error.main };
    if (score <= 3) return { score: 50, label: 'Fair', color: theme.palette.warning.main };
    if (score <= 4) return { score: 75, label: 'Good', color: theme.palette.info.main };
    return { score: 100, label: 'Strong', color: theme.palette.success.main };
}

/** Check if error message is token-related (expired, invalid, already used) */
function isTokenError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
        lower.includes('expired') ||
        lower.includes('invalid') ||
        lower.includes('token') ||
        lower.includes('already been used')
    );
}

// ============================================================================
// Reset Password Form Component
// ============================================================================

interface ResetPasswordFormProps {
    token: string;
    onSuccess: () => void;
    onError: (message: string) => void;
}

function ResetPasswordForm({ token, onSuccess, onError }: ResetPasswordFormProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const passwordStrength = usePasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        const passwordError = validators.password(password);
        if (passwordError) newErrors.password = passwordError;

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (passwordStrength.score < 50) {
            newErrors.password = 'Password is too weak';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await resetPassword({
                token,
                password,
                confirmPassword,
            });

            if (!response.success) {
                const errorMessage = response.message || 'Failed to reset password';
                if (isTokenError(errorMessage)) {
                    onError(errorMessage);
                } else {
                    setErrors({ submit: errorMessage });
                }
                return;
            }

            showToast('success', 'Password Reset', 'Your password has been reset successfully');
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
            if (isTokenError(errorMessage)) {
                onError(errorMessage);
            } else {
                setErrors({ submit: errorMessage });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
                {/* New Password */}
                <Box>
                    <PasswordField
                        label="New Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        error={!!errors.password}
                        helperText={errors.password}
                        fullWidth
                        placeholder="Enter new password"
                        autoFocus
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'grey.100'
                                },
                            },
                        }}
                    />

                    {/* Password Strength Indicator */}
                    {password && (
                        <Box sx={{ mt: 1.5 }}>
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
                                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: passwordStrength.color,
                                        borderRadius: 3,
                                        transition: 'transform 0.4s ease, background-color 0.4s ease',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Confirm Password */}
                <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    fullWidth
                    placeholder="Confirm new password"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'grey.100'
                            },
                        },
                    }}
                />

                {/* Password Requirements */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(59, 130, 246, 0.1)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Password Requirements:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                        {[
                            'At least 8 characters long',
                            'Contains uppercase and lowercase letters',
                            'Contains at least one number',
                            'Contains at least one special character',
                        ].map((req, i) => (
                            <Typography key={i} component="li" variant="caption" color="text.secondary">
                                {req}
                            </Typography>
                        ))}
                    </Box>
                </Box>

                {errors.submit && (
                    <Typography variant="body2" color="error.main" textAlign="center">
                        {errors.submit}
                    </Typography>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading || !password || !confirmPassword}
                    sx={{
                        py: 1.5,
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        },
                    }}
                >
                    Reset Password
                </Button>
            </Stack>
        </Box>
    );
}

// ============================================================================
// Success Component
// ============================================================================

function SuccessView() {
    const theme = useTheme();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            router.push('/login');
        }
    }, [countdown, router]);

    return (
        <Box textAlign="center">
            {/* Success Icon */}
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: `0 8px 32px ${theme.palette.success.main}40`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                        '0%': { boxShadow: `0 0 0 0 ${theme.palette.success.main}40` },
                        '70%': { boxShadow: `0 0 0 20px ${theme.palette.success.main}00` },
                        '100%': { boxShadow: `0 0 0 0 ${theme.palette.success.main}00` },
                    },
                }}
            >
                <CheckCircleIcon sx={{ fontSize: 56, color: 'white' }} />
            </Box>

            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                color="success.main"
            >
                Password Reset Successful!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your password has been changed successfully.
                <br />
                You can now sign in with your new password.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Redirecting to login in <strong>{countdown}</strong> seconds...
            </Typography>

            <Button
                variant="primary"
                fullWidth
                onClick={() => router.push('/login')}
                sx={{
                    py: 1.5,
                    bgcolor: 'success.main',
                    '&:hover': {
                        bgcolor: 'success.dark',
                    },
                }}
            >
                Continue to Sign In
            </Button>
        </Box>
    );
}

// ============================================================================
// Invalid Token Component
// ============================================================================

interface InvalidTokenViewProps {
    message?: string;
}

function InvalidTokenView({ message }: InvalidTokenViewProps) {
    const theme = useTheme();
    const router = useRouter();

    const messageLower = message?.toLowerCase() || '';
    const isExpired = messageLower.includes('expired');
    const isInvalid = messageLower.includes('invalid');
    const isAlreadyUsed = messageLower.includes('already been used') || messageLower.includes('already used');
    const isInvalidOrExpired = isInvalid && isExpired;

    // Determine UI based on error type (defaults handle plain invalid case)
    let title = 'Invalid Reset Link';
    let subtitle = 'This password reset link is invalid.';
    let iconGradient = `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`;
    let iconShadow = `0 8px 32px ${theme.palette.error.main}40`;
    let IconComponent = ErrorOutlineIcon;

    if (isInvalidOrExpired) {
        title = 'Invalid or Expired Link';
        subtitle = message || 'This password reset link is invalid or has expired.';
    } else if (isExpired) {
        title = 'Link Has Expired';
        subtitle = 'This password reset link has expired.';
        iconGradient = `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`;
        iconShadow = `0 8px 32px ${theme.palette.warning.main}40`;
        IconComponent = TimerOffIcon;
    } else if (isAlreadyUsed) {
        title = 'Link Already Used';
        subtitle = 'This password reset link has already been used.';
        iconGradient = `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`;
        iconShadow = `0 8px 32px ${theme.palette.info.main}40`;
        IconComponent = BlockIcon;
    }

    return (
        <Box textAlign="center">
            {/* Error Icon */}
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: iconGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: iconShadow,
                }}
            >
                <IconComponent sx={{ fontSize: 56, color: 'white' }} />
            </Box>

            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                color={isExpired && !isInvalidOrExpired ? 'warning.main' : 'error.main'}
            >
                {title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {subtitle}
            </Typography>

            {(isExpired || isInvalidOrExpired) && !isAlreadyUsed && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Password reset links expire after 24 hours for security reasons.
                </Typography>
            )}

            {isAlreadyUsed && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Each password reset link can only be used once.
                </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Please request a new password reset link from the login page.
            </Typography>

            <Stack spacing={2}>
                <Button
                    variant="primary"
                    fullWidth
                    onClick={() => router.push('/forgot-password')}
                    sx={{
                        py: 1.5,
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        },
                    }}
                >
                    Request New Reset Link
                </Button>
                <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => router.push('/login')}
                    sx={{
                        py: 1.5,
                    }}
                >
                    Back to Login
                </Button>
            </Stack>
        </Box>
    );
}

// ============================================================================
// Main Content Component
// ============================================================================

function ResetPasswordContent() {
    const theme = useTheme();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'form' | 'invalid' | 'success'>('form');
    const [token, setToken] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');

        if (!tokenParam) {
            setErrorMessage('No reset token provided. Please use the link from your email.');
            setStatus('invalid');
            return;
        }

        setToken(tokenParam);
        setStatus('form');
    }, [searchParams]);

    const handleSuccess = () => {
        setStatus('success');
    };

    const handleError = (message: string) => {
        setErrorMessage(message);
        setStatus('invalid');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                        borderColor: 'divider',
                    }}
                >
                    {/* Header */}
                    {status === 'form' && (
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                p: 4,
                                textAlign: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    background: 'rgba(255,255,255,0.15)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <LockOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" color="white" fontWeight={700} gutterBottom>
                                Create New Password
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Your new password must be different from previous passwords
                            </Typography>
                        </Box>
                    )}

                    <CardContent sx={{ p: 4 }}>
                        {status === 'form' && (
                            <ResetPasswordForm token={token} onSuccess={handleSuccess} onError={handleError} />
                        )}

                        {status === 'invalid' && <InvalidTokenView message={errorMessage} />}

                        {status === 'success' && <SuccessView />}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

// ============================================================================
// Loading Fallback
// ============================================================================

function LoadingFallback() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
                Loading...
            </Typography>
        </Box>
    );
}

// ============================================================================
// Main Export
// ============================================================================

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordContent />
        </Suspense>
    );
}


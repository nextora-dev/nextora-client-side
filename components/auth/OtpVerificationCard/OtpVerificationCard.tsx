// OtpVerificationCard - OTP verification form with timer and resend
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Link,
    CircularProgress,
    Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { OtpInput } from '../OtpInput';
import { Button } from '@/components/common';

export interface OtpVerificationCardProps {
    email: string;
    otpLength?: number;
    expirySeconds?: number;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    onChangeEmail?: () => void;
    isVerifying?: boolean;
    error?: string;
    submitButtonText?: string;
    submitButtonGradient?: string;
    submitButtonHoverGradient?: string;
}

export function OtpVerificationCard({
    email,
    otpLength = 6,
    expirySeconds = 300, // 5 minutes default
    onVerify,
    onResend,
    onChangeEmail,
    isVerifying = false,
    error: externalError,
    submitButtonText = 'Verify OTP',
    submitButtonGradient = 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
    submitButtonHoverGradient = 'linear-gradient(90deg, #1D4ED8 0%, #6D28D9 100%)',
}: OtpVerificationCardProps) {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(expirySeconds);
    const [canResend, setCanResend] = useState(false);

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (value: string) => {
        setOtp(value);
        setError('');
    };

    const handleOtpComplete = useCallback(async (completedOtp: string) => {
        // Auto-submit when OTP is complete
        if (completedOtp.length === otpLength && !isVerifying) {
            handleVerify(completedOtp);
        }
    }, [otpLength, isVerifying]);

    const handleVerify = async (otpToVerify?: string) => {
        const otpValue = otpToVerify || otp;

        if (otpValue.length !== otpLength) {
            setError(`Please enter all ${otpLength} digits`);
            return;
        }

        setError('');
        try {
            await onVerify(otpValue);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError('');
        try {
            await onResend();
            setTimeLeft(expirySeconds);
            setCanResend(false);
            setOtp('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const displayError = externalError || error;

    return (
        <Box>
            {/* Email Display */}
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                We've sent a {otpLength}-digit verification code to{' '}
                <Typography component="span" fontWeight={600} color="primary.main">
                    {email}
                </Typography>
            </Typography>

            {/* OTP Input */}
            <Box sx={{ mb: 3 }}>
                <OtpInput
                    length={otpLength}
                    value={otp}
                    onChange={handleOtpChange}
                    onComplete={handleOtpComplete}
                    error={displayError}
                    disabled={isVerifying}
                />
            </Box>

            {/* Timer */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                {timeLeft > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Code expires in{' '}
                        <Typography component="span" fontWeight={600} color={timeLeft < 60 ? 'error.main' : 'primary.main'}>
                            {formatTime(timeLeft)}
                        </Typography>
                    </Typography>
                ) : (
                    <Typography variant="body2" color="error.main" fontWeight={500}>
                        Code has expired. Please request a new one.
                    </Typography>
                )}
            </Box>

            {/* Verify Button */}
            <Button
                type="button"
                variant="primary"
                fullWidth
                loading={isVerifying}
                disabled={isVerifying || otp.length !== otpLength || timeLeft === 0}
                onClick={() => handleVerify()}
                sx={{
                    py: 1.5,
                    mb: 2,
                    background: submitButtonGradient,
                    '&:hover': {
                        background: submitButtonHoverGradient,
                    },
                }}
            >
                {isVerifying ? (
                    <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Verifying...
                    </>
                ) : (
                    submitButtonText
                )}
            </Button>

            <Divider sx={{ my: 2 }} />

            {/* Resend Section */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Didn't receive the code?
                </Typography>

                {canResend ? (
                    <Button
                        variant="ghost"
                        onClick={handleResend}
                        disabled={isResending}
                        startIcon={isResending ? <CircularProgress size={16} /> : <RefreshIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        {isResending ? 'Sending...' : 'Resend Code'}
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        You can resend in {formatTime(timeLeft)}
                    </Typography>
                )}
            </Box>

            {/* Change Email Option */}
            {onChangeEmail && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={onChangeEmail}
                        underline="hover"
                        fontWeight={500}
                    >
                        Use a different email
                    </Link>
                </Box>
            )}
        </Box>
    );
}


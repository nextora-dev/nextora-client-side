'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Typography, Link, Box, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useToast } from '@/components/common';
import { LoginLayout, LoginCard, ResetPasswordForm, WarningAlert } from '@/components/auth';
import { resetPassword, validateResetToken } from '@/features/auth/services';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [resetToken, setResetToken] = useState<string>('');

    useEffect(() => {
        // Get token from URL query params or session storage (from OTP verification)
        const urlToken = searchParams.get('token');
        const sessionToken = sessionStorage.getItem('resetToken');
        const token = urlToken || sessionToken;

        if (!token) {
            setIsValidToken(false);
            setIsLoading(false);
            return;
        }

        // Validate the token
        const verifyToken = async () => {
            try {
                const response = await validateResetToken(token);

                if (response.valid) {
                    setIsValidToken(true);
                    setResetToken(token);
                } else {
                    setIsValidToken(false);
                    showToast('error', 'Invalid Link', response.message);
                }
            } catch {
                setIsValidToken(false);
                showToast('error', 'Error', 'Failed to verify reset link. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [searchParams, showToast]);

    const handleResetPassword = async (password: string) => {
        const response = await resetPassword({
            token: resetToken,
            password,
            confirmPassword: password,
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to reset password');
        }

        // Clear all session data
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');

        showToast('success', 'Password Reset', response.message);

        // Navigate to success page
        router.push('/forgot-password/success');
    };

    const formFooter = (
        <Typography variant="body2" color="text.secondary">
            Remember your old password?{' '}
            <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => router.push('/login')}
                underline="hover"
                fontWeight={600}
            >
                Sign in instead
            </Link>
        </Typography>
    );

    // Loading state
    if (isLoading) {
        return (
            <LoginLayout
                onBack={() => router.push('/login')}
                backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
            >
                <LoginCard
                    title="Verifying Link"
                    subtitle="Please wait while we verify your reset link"
                    headerGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                    headerIcon={<LockIcon sx={{ fontSize: 32, color: 'white' }} />}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                </LoginCard>
            </LoginLayout>
        );
    }

    // Invalid/expired token
    if (!isValidToken) {
        return (
            <LoginLayout
                onBack={() => router.push('/login')}
                backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
            >
                <LoginCard
                    title="Link Expired"
                    subtitle="Your password reset link has expired"
                    headerGradient="linear-gradient(90deg, #f44336 0%, #e91e63 100%)"
                    headerIcon={<LockIcon sx={{ fontSize: 32, color: 'white' }} />}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            For security reasons, password reset links expire after 24 hours.
                            Please request a new password reset link.
                        </Typography>

                        <Link
                            component="button"
                            variant="body1"
                            onClick={() => router.push('/forgot-password')}
                            underline="hover"
                            fontWeight={600}
                            color="primary"
                        >
                            Request New Reset Link
                        </Link>
                    </Box>
                </LoginCard>
            </LoginLayout>
        );
    }

    return (
        <LoginLayout
            onBack={() => router.push('/login')}
            backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
        >
            <LoginCard
                title="Create New Password"
                subtitle="Your new password must be different from previous passwords"
                headerGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                headerIcon={<LockIcon sx={{ fontSize: 32, color: 'white' }} />}
                footer={formFooter}
            >
                <ResetPasswordForm onSubmit={handleResetPassword} />
            </LoginCard>

            <WarningAlert
                sx={{ mt: 3 }}
                title="Security Notice"
                message="After resetting your password, you'll be logged out of all devices for your security."
            />
        </LoginLayout>
    );
}

// Loading fallback for Suspense
function ResetPasswordLoading() {
    return (
        <LoginLayout
            onBack={() => {}}
            backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
        >
            <LoginCard
                title="Loading..."
                subtitle="Please wait"
                headerGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                headerIcon={<LockIcon sx={{ fontSize: 32, color: 'white' }} />}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            </LoginCard>
        </LoginLayout>
    );
}

// Default export with Suspense boundary for useSearchParams
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordContent />
        </Suspense>
    );
}

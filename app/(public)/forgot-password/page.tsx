'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Link } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useToast } from '@/components/common';
import { LoginLayout, LoginCard, ForgotPasswordForm, SecurityAlert } from '@/components/auth';
import { forgotPassword } from '@/features/auth/services';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (email: string) => {
        setIsLoading(true);
        try {
            // Call actual auth service
            const response = await forgotPassword({ email });

            // Store email in session for display on next page
            sessionStorage.setItem('resetEmail', email);

            // Always show generic message to prevent account enumeration
            showToast('success', 'Email Sent', response.message);

            // Navigate to OTP verification page
            router.push('/forgot-password/verify');
        } catch (error) {
            // Even on error, show generic message for security
            showToast('info', 'Check Your Email', 'If an account exists, you\'ll receive a reset link.');
            sessionStorage.setItem('resetEmail', email);
            router.push('/forgot-password/verify');
        } finally {
            setIsLoading(false);
        }
    };

    const formFooter = (
        <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => router.push('/login')}
                underline="hover"
                fontWeight={600}
            >
                Sign in
            </Link>
        </Typography>
    );

    return (
        <LoginLayout
            onBack={() => router.push('/login')}
            backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
        >
            <LoginCard
                title="Forgot Password?"
                subtitle="No worries, we'll send you reset instructions"
                headerGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                headerIcon={<LockResetIcon sx={{ fontSize: 32, color: 'white' }} />}
                footer={formFooter}
            >
                <ForgotPasswordForm
                    emailLabel="Email Address *"
                    emailPlaceholder="your.email@university.edu"
                    description="Enter your email address and we'll send you a verification code to reset your password."
                    submitButtonText="Send Verification Code"
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </LoginCard>

            <SecurityAlert
                sx={{ mt: 3 }}
                message="For your protection, we'll only send reset instructions to registered accounts. This helps keep your information secure."
            />
        </LoginLayout>
    );
}

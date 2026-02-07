'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Link } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useToast } from '@/components/common';
import { LoginLayout, LoginCard, OtpVerificationCard } from '@/components/auth';
import { verifyOtp, resendOtp } from '@/features/auth/services';

export default function OtpVerifyPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [email, setEmail] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get stored email from previous step
        const storedEmail = sessionStorage.getItem('resetEmail');

        if (!storedEmail) {
            // Redirect back if no email found
            router.push('/forgot-password');
            return;
        }

        setEmail(storedEmail);
    }, [router]);

    const handleVerifyOtp = async (otp: string) => {
        setIsVerifying(true);
        setError('');

        try {
            const response = await verifyOtp({ email, otp });

            if (response.verified) {
                // Store the reset token for the password reset step
                sessionStorage.setItem('resetToken', response.token);
                showToast('success', 'Verified', 'OTP verified successfully.');
                router.push('/forgot-password/reset');
            } else {
                setError(response.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await resendOtp({ email });
            showToast('success', 'Code Sent', response.message);
        } catch {
            showToast('error', 'Error', 'Failed to resend code. Please try again.');
            throw new Error('Failed to resend code');
        }
    };

    const handleChangeEmail = () => {
        sessionStorage.removeItem('resetEmail');
        router.push('/forgot-password');
    };

    const formFooter = (
        <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => {
                    sessionStorage.removeItem('resetEmail');
                    router.push('/login');
                }}
                underline="hover"
                fontWeight={600}
            >
                Sign in
            </Link>
        </Typography>
    );

    if (!email) {
        return null; // Loading or redirecting
    }

    return (
        <LoginLayout
            onBack={() => router.push('/forgot-password')}
            backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
        >
            <LoginCard
                title="Verify Your Email"
                subtitle="Enter the verification code we sent you"
                headerGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                headerIcon={<MailOutlineIcon sx={{ fontSize: 32, color: 'white' }} />}
                footer={formFooter}
            >
                <OtpVerificationCard
                    email={email}
                    otpLength={6}
                    expirySeconds={300}
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                    onChangeEmail={handleChangeEmail}
                    isVerifying={isVerifying}
                    error={error}
                    submitButtonText="Verify Code"
                />
            </LoginCard>
        </LoginLayout>
    );
}

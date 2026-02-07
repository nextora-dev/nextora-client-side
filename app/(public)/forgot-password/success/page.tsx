'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Box, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import { LoginLayout, SuccessCard } from '@/components/auth';

export default function PasswordResetSuccessPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        // Auto-redirect to login after countdown
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            router.push('/login');
        }
    }, [countdown, router]);

    const handleGoToLogin = () => {
        router.push('/login');
    };

    return (
        <LoginLayout
            onBack={() => router.push('/login')}
            backgroundGradient="linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 50%, #E3F2FD 100%)"
        >
            <SuccessCard
                title="Password Reset Successful!"
                message="Your password has been changed successfully. You can now sign in with your new password."
                icon={<CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#4caf50' }} />}
                primaryButtonText="Continue to Sign In"
                onPrimaryAction={handleGoToLogin}
                primaryButtonGradient="linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)"
            >
                {/* Auto-redirect countdown */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Redirecting to login in <strong>{countdown}</strong> seconds...
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Security Information */}
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        What happens next?
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                        <SecurityIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.3 }} />
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                Reset link invalidated
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                The password reset link you used can no longer be used.
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <DevicesIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.3 }} />
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                All sessions ended
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                You've been logged out of all other devices for security.
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </SuccessCard>

            {/* Additional Help */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Having trouble? Contact our{' '}
                    <Typography
                        component="a"
                        href="/support"
                        variant="caption"
                        color="primary"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        support team
                    </Typography>
                </Typography>
            </Box>
        </LoginLayout>
    );
}


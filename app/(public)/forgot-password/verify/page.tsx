'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * OTP Verify Page
 * This page now redirects to the login page where the forgot password modal handles the flow.
 * The modal-based flow handles OTP verification internally.
 */
export default function OtpVerifyPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to forgot password page which will open the modal
        router.push('/forgot-password');
    }, [router]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)',
            }}
        >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
                Redirecting...
            </Typography>
        </Box>
    );
}

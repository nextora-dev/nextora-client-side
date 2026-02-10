'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Success Page
 * This page now redirects to the login page.
 * The forgot password modal handles the success state internally.
 */
export default function PasswordResetSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page
        router.push('/login');
    }, [router]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 50%, #E3F2FD 100%)',
            }}
        >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
                Redirecting to login...
            </Typography>
        </Box>
    );
}

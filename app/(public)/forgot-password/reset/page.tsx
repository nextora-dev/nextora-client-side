'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

function RedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            router.replace('/reset-password?token=' + token);
        } else {
            router.replace('/login');
        }
    }, [router, searchParams]);

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

function LoadingFallback() {
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
                Loading...
            </Typography>
        </Box>
    );
}

export default function LegacyResetPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <RedirectContent />
        </Suspense>
    );
}


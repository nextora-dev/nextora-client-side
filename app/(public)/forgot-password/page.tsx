'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container } from '@mui/material';
import { useToast } from '@/components/common';
import { ForgotPasswordModal } from '@/components/auth';
import { forgotPassword } from '@/features/auth/services';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [modalOpen, setModalOpen] = useState(true);

    // Redirect to login when modal closes
    useEffect(() => {
        if (!modalOpen) {
            router.push('/login');
        }
    }, [modalOpen, router]);

    // Forgot password handler - calls backend API
    const handleSendEmail = async (email: string) => {
        const response = await forgotPassword({ email });
        if (!response.success) {
            throw new Error(response.message || 'Failed to send email');
        }
        showToast('success', 'Email Sent', 'Password reset link sent to your email');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h5" color="text.secondary" sx={{ opacity: 0.7 }}>
                        Password Recovery
                    </Typography>
                </Box>
            </Container>

            <ForgotPasswordModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSendEmail={handleSendEmail}
            />
        </Box>
    );
}

// SuccessCard - Success confirmation card component
'use client';

import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button } from '@/components/common';

export interface SuccessCardProps {
    title: string;
    message: string;
    icon?: ReactNode;
    iconColor?: string;
    iconBgColor?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    primaryButtonGradient?: string;
    children?: ReactNode;
}

export function SuccessCard({
    title,
    message,
    icon,
    iconColor = '#4caf50',
    iconBgColor = '#e8f5e9',
    primaryButtonText,
    secondaryButtonText,
    onPrimaryAction,
    onSecondaryAction,
    primaryButtonGradient = 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
    children,
}: SuccessCardProps) {
    return (
        <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 6 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                {/* Success Icon */}
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: iconBgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    {icon ?? <CheckCircleIcon sx={{ fontSize: 48, color: iconColor }} />}
                </Box>

                {/* Title */}
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    {title}
                </Typography>

                {/* Message */}
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {message}
                </Typography>

                {/* Additional Content */}
                {children}

                {/* Action Buttons */}
                <Stack spacing={2} sx={{ mt: 3 }}>
                    {primaryButtonText && onPrimaryAction && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onPrimaryAction}
                            sx={{
                                py: 1.5,
                                background: primaryButtonGradient,
                                '&:hover': {
                                    background: primaryButtonGradient,
                                    filter: 'brightness(0.9)',
                                },
                            }}
                        >
                            {primaryButtonText}
                        </Button>
                    )}

                    {secondaryButtonText && onSecondaryAction && (
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={onSecondaryAction}
                        >
                            {secondaryButtonText}
                        </Button>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}


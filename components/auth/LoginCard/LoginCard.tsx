// LoginCard - Reusable login card wrapper with header
'use client';

import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export interface LoginCardProps {
    title: string;
    subtitle: string;
    headerGradient?: string;
    headerIcon?: ReactNode;
    subtitleColor?: string;
    boxShadow?: number;
    children: ReactNode;
    footer?: ReactNode;
}

export function LoginCard({
    title,
    subtitle,
    headerGradient = 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
    headerIcon,
    subtitleColor = 'rgba(255,255,255,0.9)',
    boxShadow = 6,
    children,
    footer,
}: LoginCardProps) {
    return (
        <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow }}>
            {/* Header */}
            <Box
                sx={{
                    background: headerGradient,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                {headerIcon && (
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        {headerIcon}
                    </Box>
                )}
                <Typography variant="h4" color="white" fontWeight={700} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body1" sx={{ color: subtitleColor }}>
                    {subtitle}
                </Typography>
            </Box>

            {/* Content */}
            <CardContent sx={{ p: 4 }}>
                {children}
            </CardContent>
        </Card>
    );
}


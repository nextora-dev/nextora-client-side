'use client';

import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    color: string;
    isLoading?: boolean;
    onClick?: () => void;
    index?: number;
}

const MotionBox = motion.create(Box);

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color,
    isLoading = false,
    onClick,
    index = 0,
}) => {
    if (isLoading) {
        return (
            <Box
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'grey.100',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton width={80} height={20} />
                    <Skeleton variant="circular" width={48} height={48} />
                </Box>
                <Skeleton width={60} height={36} />
                <Skeleton width={100} height={16} sx={{ mt: 1 }} />
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={onClick}
            sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'grey.100',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    borderColor: color,
                    boxShadow: `0 12px 24px -8px ${color}25`,
                },
            }}
        >
            {/* Background Gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 120,
                    height: 120,
                    background: `linear-gradient(135deg, ${color}10 0%, transparent 60%)`,
                    borderRadius: '0 0 0 100%',
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            fontSize: '0.75rem',
                        }}
                    >
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '1.75rem', md: '2rem' },
                        letterSpacing: '-0.02em',
                        mb: 0.5,
                    }}
                >
                    {value}
                </Typography>

                {(subtitle || trend) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        {trend && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: trend.isPositive ? 'success.50' : 'error.50',
                                    color: trend.isPositive ? 'success.main' : 'error.main',
                                }}
                            >
                                {trend.isPositive ? (
                                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                                ) : (
                                    <TrendingDownIcon sx={{ fontSize: 14 }} />
                                )}
                                <Typography variant="caption" fontWeight={600}>
                                    {trend.value}%
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                            {trend?.label || subtitle}
                        </Typography>
                    </Box>
                )}
            </Box>
        </MotionBox>
    );
};

export default StatsCard;

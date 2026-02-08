'use client';

import React from 'react';
import { Box, Typography, LinearProgress, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface ProgressItem {
    id: string;
    label: string;
    value: number;
    maxValue: number;
    color: string;
}

interface ProgressWidgetProps {
    items: ProgressItem[];
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
}

const MotionBox = motion.create(Box);

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
    items,
    title = 'Progress Overview',
    subtitle,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100' }}>
                <Skeleton width={140} height={28} sx={{ mb: 3 }} />
                {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                        <Skeleton width="60%" height={20} />
                        <Skeleton height={8} sx={{ mt: 1, borderRadius: 1 }} />
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100' }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</Typography>
                {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {items.map((item, index) => {
                    const percentage = Math.round((item.value / item.maxValue) * 100);
                    return (
                        <MotionBox
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{item.label}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>{percentage}%</Typography>
                                    {percentage >= 80 && <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981' }} />}
                                </Box>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: `${item.color}15`,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        bgcolor: item.color,
                                        transition: 'transform 1s ease-out',
                                    },
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {item.value} / {item.maxValue} completed
                            </Typography>
                        </MotionBox>
                    );
                })}
            </Box>
        </MotionBox>
    );
};

export default ProgressWidget;

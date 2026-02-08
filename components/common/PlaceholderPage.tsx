'use client';

/**
 * @fileoverview Placeholder Page Component
 * @description Reusable placeholder for pages under development
 */

import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import ConstructionIcon from '@mui/icons-material/Construction';

interface PlaceholderPageProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
}

const MotionPaper = motion.create(Paper);

export function PlaceholderPage({
    title,
    description = 'This feature is coming soon!',
    icon,
    color = '#60A5FA'
}: PlaceholderPageProps) {
    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                elevation={0}
                sx={{
                    p: 6,
                    borderRadius: 4,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        bgcolor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    {icon || <ConstructionIcon sx={{ fontSize: 40, color }} />}
                </Box>

                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {title}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    {description}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip label="Under Development" color="primary" variant="outlined" />
                    <Chip label="Coming Soon" color="success" variant="outlined" />
                </Stack>
            </MotionPaper>
        </Box>
    );
}


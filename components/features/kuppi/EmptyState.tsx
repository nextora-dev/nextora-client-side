'use client';

import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
    title?: string;
    description?: string;
    showAction?: boolean;
    onAction?: () => void;
    actionLabel?: string;
}

const MotionBox = motion.create(Box);

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No sessions found',
    description = 'Try adjusting your search or filters to find what you\'re looking for.',
    showAction = false,
    onAction,
    actionLabel = 'Create Session',
}) => {
    const theme = useTheme();

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center',
            }}
        >
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <SearchOffIcon
                    sx={{
                        fontSize: 48,
                        color: alpha(theme.palette.primary.main, 0.5),
                    }}
                />
            </Box>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1,
                }}
            >
                {title}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    maxWidth: 400,
                    mb: showAction ? 3 : 0,
                }}
            >
                {description}
            </Typography>

            {showAction && onAction && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAction}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </MotionBox>
    );
};

